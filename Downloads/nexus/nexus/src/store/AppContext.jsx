import React, { createContext, useContext, useMemo, useState } from "react";
import { buildSeed } from "../data/seed";
import { dateKey } from "../lib/time";

/* ------------------------------------------------------------
   NEXUS global store. Persists to localStorage; provides a small,
   explicit set of mutations. Seed demo data on first launch only.
   ------------------------------------------------------------ */

const KEY = "nexus.state.v1";

function loadInitial() {
  if (typeof localStorage !== "undefined") {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      /* ignore corrupt storage */
    }
  }
  return buildSeed();
}

export const defaults = {
  version: 1,
  schema: 1,
  meta: { createdAt: "", lastOpenAt: "" },
  preferences: { demo: true, greetingName: "Alex", timeFormat: 12 },
  categories: [],
  actions: [],
  completionLog: [],
  priorities: [],
  dayMetrics: [],
  recovery: [],
  journal: [],
  goals: [],
  dashboards: [],
};

const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

let seq = 0;
function newId(p) {
  seq += 1;
  return `${p}-${Date.now().toString(36)}-${seq}`;
}

function persist(s) {
  try {
    if (typeof localStorage !== "undefined")
      localStorage.setItem(KEY, JSON.stringify(s));
  } catch (e) {
    /* storage may be unavailable */
  }
  return s;
}

export function AppProvider({ children }) {
  const [state, setState] = useState(() => loadInitial());

  function update(fn) {
    setState((s) => persist(fn(structuredClone(s))));
  }

  const api = useMemo(() => {
    const actions = {
      /* ---- settings --------------------------------------- */
      resetDemo() {
        setState(persist(buildSeed()));
      },
      setPref(patch) {
        update((s) => {
          s.preferences = { ...s.preferences, ...patch };
          return s;
        });
      },

      /* ---- categories ------------------------------------- */
      addCategory({ name, icon, color }) {
        update((s) => {
          s.categories.push({ id: newId("cat"), name, icon: icon || "target", color: color || null });
          return s;
        });
      },
      updateCategory(id, patch) {
        update((s) => {
          const c = s.categories.find((x) => x.id === id);
          if (c) Object.assign(c, patch);
          return s;
        });
      },
      deleteCategory(id) {
        update((s) => {
          s.categories = s.categories.filter((x) => x.id !== id);
          // unassign or fallback actions to first category
          const fallbackCat = s.categories[0]?.id || "cat-focus";
          s.actions.forEach((a) => {
            if (a.categoryId === id) a.categoryId = fallbackCat;
          });
          return s;
        });
      },
      reorderCategories(orderedIds) {
        update((s) => {
          const map = new Map(s.categories.map((c) => [c.id, c]));
          s.categories = orderedIds.map((id) => map.get(id)).filter(Boolean);
          return s;
        });
      },

      /* ---- actions ---------------------------------------- */
      addAction(data) {
        update((s) => {
          s.actions.push({ archived: false, notes: "", ...data, id: newId("act") });
          return s;
        });
      },
      updateAction(id, patch) {
        update((s) => {
          const a = s.actions.find((x) => x.id === id);
          if (a) Object.assign(a, patch);
          return s;
        });
      },
      archiveAction(id) {
        update((s) => {
          const a = s.actions.find((x) => x.id === id);
          if (a) a.archived = true;
          return s;
        });
      },
      unarchiveAction(id) {
        update((s) => {
          const a = s.actions.find((x) => x.id === id);
          if (a) a.archived = false;
          return s;
        });
      },
      deleteAction(id) {
        update((s) => {
          s.actions = s.actions.filter((x) => x.id !== id);
          s.completionLog = s.completionLog.filter((c) => c.actionId !== id);
          return s;
        });
      },

      /* ---- completion log --------------------------------- */
      completeAction(action, value, opts = {}) {
        const key = opts.dateKey || dateKey();
        const now = new Date().toISOString();
        update((s) => {
          const t = action.type;
          // journal / event capture text payload too
          const payload = opts.payload || {};
          const logVal =
            value != null
              ? value
              : t === "scale"
              ? (opts.scaleValue ?? 5)
              : action.target || 1;
          const existing = s.completionLog.find(
            (c) => c.actionId === action.id && c.dateKey === key
          );
          if (existing) {
            existing.value = logVal;
            existing.payload = payload;
            existing.createdAt = existing.createdAt || now;
            existing.updatedAt = now;
          } else {
            s.completionLog.push({
              id: newId("cl"),
              actionId: action.id,
              dateKey: key,
              value: logVal,
              payload,
              createdAt: now,
            });
          }
          // journal entries also reflect into journal list when it's a journal action
          if (t === "journal" && (payload.text || payload.note)) {
            const jl = s.journal.find((j) => j.dateKey === key);
            if (jl) jl.text = payload.note || jl.text;
            else s.journal.unshift({ id: newId("jr"), dateKey: key, text: payload.note || "" });
          }
          return s;
        });
      },
      uncompleteAction(action, opts = {}) {
        const key = opts.dateKey || dateKey();
        update((s) => {
          s.completionLog = s.completionLog.filter(
            (c) => !(c.actionId === action.id && c.dateKey === key)
          );
          return s;
        });
      },

      /* ---- recovery --------------------------------------- */
      addRecovery(entry) {
        update((s) => {
          const key = entry.dateKey || dateKey();
          const now = new Date().toISOString();
          if (entry.id) {
            const existing = s.recovery.find((r) => r.id === entry.id);
            if (existing) {
              Object.assign(existing, entry, { updatedAt: now });
              return s;
            }
          }
          const isCheckin = !entry.eventType || entry.eventType === "checkin";
          const existingCheckin = isCheckin ? s.recovery.find((r) => r.dateKey === key && (!r.eventType || r.eventType === "checkin")) : null;
          
          if (existingCheckin) {
            const { dateKey: _dk, ...rest } = entry;
            Object.assign(existingCheckin, rest, { updatedAt: now });
          } else {
            const rec = {
              id: newId("rec"),
              dateKey: key,
              createdAt: now,
              eventType: entry.eventType || "checkin",
              ...entry,
            };
            s.recovery.push(rec);
          }
          return s;
        });
      },
      updateRecovery(id, patch) {
        update((s) => {
          const r = s.recovery.find((x) => x.id === id);
          if (r) {
            Object.assign(r, patch, { updatedAt: new Date().toISOString() });
          }
          return s;
        });
      },
      deleteRecovery(id) {
        update((s) => {
          s.recovery = s.recovery.filter((r) => r.id !== id);
          return s;
        });
      },

      /* ---- priorities ------------------------------------- */
      addPriority(p) {
        update((s) => {
          const key = p.dateKey || dateKey();
          s.priorities.push({
            id: newId("pr"),
            dateKey: key,
            title: p.title,
            note: p.note || "",
            order: p.order ?? s.priorities.length,
            done: false,
          });
          return s;
        });
      },
      togglePriority(id) {
        update((s) => {
          const p = s.priorities.find((x) => x.id === id);
          if (p) p.done = !p.done;
          return s;
        });
      },
      removePriority(id) {
        update((s) => {
          s.priorities = s.priorities.filter((x) => x.id !== id);
          return s;
        });
      },

      /* ---- journal ---------------------------------------- */
      saveJournal(key, text) {
        update((s) => {
          const j = s.journal.find((x) => x.dateKey === key);
          if (j) j.text = text;
          else s.journal.unshift({ id: newId("jr"), dateKey: key, text });
          return s;
        });
      },
      saveJournalEntry(entry) {
        update((s) => {
          const key = entry.dateKey || dateKey();
          const existing = s.journal.find((j) => j.id === entry.id || j.dateKey === key);
          const now = new Date().toISOString();

          if (existing) {
            Object.assign(existing, entry, { updatedAt: now });
          } else {
            s.journal.unshift({
              id: newId("jr"),
              dateKey: key,
              createdAt: now,
              ...entry,
            });
          }
          return s;
        });
      },
      deleteJournalEntry(id) {
        update((s) => {
          s.journal = s.journal.filter((j) => j.id !== id);
          return s;
        });
      },

      /* ---- goals ------------------------------------------ */
      addGoal(data) {
        update((s) => {
          const milestones = data.milestones || [];
          const doneM = milestones.filter((m) => m.done).length;
          const prog = milestones.length ? Math.round((doneM / milestones.length) * 100) : (data.progress ?? 0);

          s.goals.push({
            id: newId("goal"),
            createdAt: new Date().toISOString(),
            status: "active",
            timeframe: "medium_term",
            priority: "normal",
            milestones: [],
            linkedActionIds: [],
            ...data,
            progress: prog,
          });
          return s;
        });
      },
      updateGoal(id, patch) {
        update((s) => {
          const g = s.goals.find((x) => x.id === id);
          if (g) {
            Object.assign(g, patch);
            if (g.milestones && g.milestones.length > 0) {
              const doneM = g.milestones.filter((m) => m.done).length;
              g.progress = Math.round((doneM / g.milestones.length) * 100);
            }
          }
          return s;
        });
      },
      toggleGoalMilestone(goalId, milestoneId) {
        update((s) => {
          const g = s.goals.find((x) => x.id === goalId);
          if (g && g.milestones) {
            const m = g.milestones.find((x) => x.id === milestoneId);
            if (m) m.done = !m.done;
            const doneM = g.milestones.filter((x) => x.done).length;
            g.progress = Math.round((doneM / g.milestones.length) * 100);
            if (g.progress === 100) g.status = "completed";
          }
          return s;
        });
      },
      deleteGoal(id) {
        update((s) => {
          s.goals = s.goals.filter((x) => x.id !== id);
          return s;
        });
      },

      /* ---- captured ideas (learn -> capture -> apply) ------ */
      addCapturedIdea(data) {
        update((s) => {
          if (!s.capturedIdeas) s.capturedIdeas = [];
          s.capturedIdeas.push({
            id: newId("idea"),
            createdAt: new Date().toISOString(),
            status: "captured", // "captured" | "converted"
            ...data,
          });
          return s;
        });
      },
      deleteCapturedIdea(id) {
        update((s) => {
          if (s.capturedIdeas) {
            s.capturedIdeas = s.capturedIdeas.filter((x) => x.id !== id);
          }
          return s;
        });
      },
      convertIdeaToAction(ideaId) {
        update((s) => {
          if (!s.capturedIdeas) return s;
          const idea = s.capturedIdeas.find((x) => x.id === ideaId);
          if (idea) {
            idea.status = "converted";
            s.actions.push({
              id: newId("act"),
              name: idea.actionTitle || idea.title || "New Applied Action",
              desc: idea.why || idea.source ? `Source: ${idea.source || "Captured Idea"}. ${idea.why || ""}` : "",
              type: idea.actionType || "boolean",
              categoryId: idea.categoryId || s.categories[0]?.id || "cat-focus",
              target: 1,
              schedule: { freq: "daily" },
              archived: false,
              valence: "positive",
              notes: idea.notes || "",
            });
          }
          return s;
        });
      },
      updateDashboard(id, patch) {
        update((s) => {
          const d = (s.dashboards || []).find((x) => x.id === id);
          if (d) Object.assign(d, patch);
          return s;
        });
      },
      deleteDashboard(id) {
        update((s) => {
          s.dashboards = (s.dashboards || []).filter((x) => x.id !== id);
          return s;
        });
      },
      addWidgetToDashboard(dashboardId, widgetData) {
        update((s) => {
          const d = (s.dashboards || []).find((x) => x.id === dashboardId);
          if (d) {
            if (!d.widgets) d.widgets = [];
            d.widgets.push({
              id: newId("w"),
              size: "full", // "full" or "half"
              config: {},
              ...widgetData,
            });
          }
          return s;
        });
      },
      updateDashboardWidget(dashboardId, widgetId, patch) {
        update((s) => {
          const d = (s.dashboards || []).find((x) => x.id === dashboardId);
          if (d && d.widgets) {
            const w = d.widgets.find((x) => x.id === widgetId);
            if (w) Object.assign(w, patch);
          }
          return s;
        });
      },
      removeWidgetFromDashboard(dashboardId, widgetId) {
        update((s) => {
          const d = (s.dashboards || []).find((x) => x.id === dashboardId);
          if (d && d.widgets) {
            d.widgets = d.widgets.filter((x) => x.id !== widgetId);
          }
          return s;
        });
      },
      reorderDashboardWidgets(dashboardId, orderedWidgetIds) {
        update((s) => {
          const d = (s.dashboards || []).find((x) => x.id === dashboardId);
          if (d && d.widgets) {
            const map = new Map(d.widgets.map((w) => [w.id, w]));
            d.widgets = orderedWidgetIds.map((id) => map.get(id)).filter(Boolean);
          }
          return s;
        });
      },
    };
    return actions;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(() => ({ state, api }), [state, api]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
