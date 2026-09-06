var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// testPhase5.jsx
var import_react28 = __toESM(require("react"), 1);
var import_server = __toESM(require("react-dom/server"), 1);

// src/App.jsx
var import_react27 = __toESM(require("react"), 1);

// src/store/AppContext.jsx
var import_react = __toESM(require("react"), 1);

// src/lib/time.js
function pad(n) {
  return String(n).padStart(2, "0");
}
function dateKey(d = /* @__PURE__ */ new Date()) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

// src/data/seed.js
function mulberry32(a) {
  return function() {
    a |= 0;
    a = a + 1831565813 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
var clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
var ri = (r, lo, hi) => lo + Math.floor(r() * (hi - lo + 1));
var uid = /* @__PURE__ */ (() => {
  let n = 0;
  return (p) => `${p}${++n}`;
})();
function categories() {
  return [
    { id: "cat-focus", name: "Focus", color: null, icon: "target" },
    { id: "cat-mind", name: "Mind", color: null, icon: "eye" },
    { id: "cat-physical", name: "Physical", color: null, icon: "zap" },
    { id: "cat-recovery", name: "Recovery", color: null, icon: "shield" },
    { id: "cat-boundary", name: "Boundary", color: null, icon: "moon" }
  ];
}
function actions() {
  const mk = (a) => ({ archived: false, notes: "", ...a });
  return [
    mk({
      id: "act-meditate",
      name: "Morning meditation",
      categoryId: "cat-mind",
      icon: "spark",
      type: "duration",
      unit: "min",
      target: 12,
      schedule: { freq: "daily", time: "06:50" },
      valence: "positive",
      tracking: { analytics: true, recovery: true },
      desc: "Quiet the start of the day."
    }),
    mk({
      id: "act-deepwork",
      name: "Deep work block",
      categoryId: "cat-focus",
      icon: "target",
      type: "duration",
      unit: "min",
      target: 90,
      schedule: { freq: "weekdays", time: "09:00" },
      valence: "positive",
      tracking: { analytics: true, recovery: true },
      desc: "Uninterrupted focused work."
    }),
    mk({
      id: "act-read",
      name: "Reading",
      categoryId: "cat-mind",
      icon: "book",
      type: "duration",
      unit: "min",
      target: 20,
      schedule: { freq: "daily", time: "21:00" },
      valence: "positive",
      tracking: { analytics: true, recovery: true },
      desc: "Non-screen reading."
    }),
    mk({
      id: "act-workout",
      name: "Strength training",
      categoryId: "cat-physical",
      icon: "zap",
      type: "duration",
      unit: "min",
      target: 40,
      schedule: { freq: "custom", days: [1, 3, 5], time: "17:30" },
      valence: "positive",
      tracking: { analytics: true, recovery: true },
      desc: "Resistance session."
    }),
    mk({
      id: "act-water",
      name: "Water intake",
      categoryId: "cat-physical",
      icon: "droplet",
      type: "quantity",
      unit: "L",
      target: 3,
      schedule: { freq: "daily" },
      valence: "positive",
      tracking: { analytics: true, recovery: false },
      desc: "Daily hydration target."
    }),
    mk({
      id: "act-phonecut",
      name: "Phone cutoff",
      categoryId: "cat-boundary",
      icon: "phone",
      type: "avoidance",
      target: 1,
      schedule: { freq: "daily", time: "22:30" },
      valence: "positive",
      tracking: { analytics: true, recovery: true },
      desc: "Put the phone away; stop late-night scrolling."
    }),
    mk({
      id: "act-journal",
      name: "Evening journal",
      categoryId: "cat-recovery",
      icon: "pen",
      type: "journal",
      target: 1,
      schedule: { freq: "daily", time: "21:20" },
      valence: "positive",
      tracking: { analytics: false, recovery: true },
      desc: "A short reflective entry."
    }),
    mk({
      id: "act-caffeine",
      name: "Caffeine after 4pm",
      categoryId: "cat-boundary",
      icon: "flag",
      type: "avoidance",
      target: 1,
      schedule: { freq: "daily" },
      valence: "negative",
      tracking: { analytics: true, recovery: true },
      desc: "Boundary to protect sleep quality."
    }),
    mk({
      id: "act-checkin",
      name: "Recovery check-in",
      categoryId: "cat-recovery",
      icon: "shield",
      type: "event",
      target: 1,
      schedule: { freq: "daily", time: "21:30" },
      valence: "positive",
      tracking: { analytics: false, recovery: true },
      desc: "Log today's context and difficulty."
    })
  ];
}
function dayMetrics(now, rnd, today) {
  const days = 70;
  const list = [];
  const dips = /* @__PURE__ */ new Set();
  for (let i = 0; i < 5; i++) {
    const off = ri(rnd, 6, 62);
    dips.add(off);
    if (rnd() > 0.5 && off > 2) dips.add(off - 2);
  }
  for (let k = days - 1; k >= 0; k--) {
    const d = addDays(today, -k);
    const key = dateKey(d);
    const dow = d.getDay();
    const weekend = dow === 0 || dow === 6;
    let sleep = 7.1 + (weekend ? 0.4 : 0) + (rnd() - 0.5) * 0.9;
    if (dips.has(k)) sleep -= 1.7;
    sleep = clamp(Math.round(sleep * 10) / 10, 4.2, 9);
    let screenHr = 3.4 + (weekend ? 1.1 : 0) + (rnd() - 0.5) * 1.2;
    if (sleep < 6) screenHr += 1.4;
    screenHr = clamp(Math.round(screenHr * 10) / 10, 1, 11);
    const screenLate = clamp(Math.round(screenHr / 10 * 4 + (sleep < 6 ? 3.5 : 0) + (rnd() - 0.5) * 2), 0, 10);
    const energy = clamp(Math.round((sleep - 3) * 1.5 + (rnd() - 0.5) * 2), 1, 10);
    const stress = clamp(Math.round(2.5 + (weekend ? -0.4 : 0.4) + (screenLate > 6 ? 0.6 : 0) + (rnd() - 0.5) * 2.4), 1, 10);
    const mood = clamp(Math.round(energy * 0.75 + (rnd() - 0.5) * 2.4), 1, 10);
    const social = clamp(Math.round((weekend ? 6 : 3.5) + (rnd() - 0.5) * 4), 0, 10);
    list.push({ dateKey: key, sleep, screenHr, screenLate, energy, stress, mood, social });
  }
  return list;
}
function recovery(metricsByKey, rnd, today) {
  const entries = [];
  for (let k = 0; k < 21; k++) {
    const d = addDays(today, -k);
    const key = dateKey(d);
    const m = metricsByKey[key];
    if (!m) continue;
    if (rnd() < 0.12) continue;
    const dow = d.getDay();
    const sleep = m.sleep;
    const lowSleep = sleep < 6.3;
    const jitter = (rnd() - 0.5) * 2;
    const diff = clamp(
      Math.round((lowSleep ? 5 + rnd() * 4 : 2 + rnd() * 3) + jitter),
      0,
      10
    );
    const tods = ["morning", "afternoon", "evening", "night"];
    const tod = rnd() < 0.5 ? "night" : tods[ri(rnd, 0, 2)];
    const time = (() => {
      const h = tod === "morning" ? 7 : tod === "afternoon" ? 13 : tod === "evening" ? 19 : 23;
      return `${h}:${pad(ri(rnd, 0, 59))}`;
    })();
    const redirected = diff >= 7 ? rnd() > 0.28 : diff >= 5 ? rnd() > 0.55 : true;
    entries.push({
      id: uid("rec"),
      dateKey: key,
      createdAt: `${key}T${time}`,
      timeOfDay: tod,
      difficulty: diff,
      redirected,
      factors: {
        sleep: m.sleep,
        stress: m.stress,
        energy: m.energy,
        screen: m.screenHr,
        mood: m.mood,
        social: m.social
      },
      whatHelped: redirected && diff >= 5 ? ["Started a 5-minute meditation", "Left the phone in another room", "Went for a walk", "Gave myself a hard stop at 22:30"][ri(rnd, 0, 3)] : null,
      context: !redirected && diff >= 7 ? "Slid late into the night; picked the phone back up." : redirected && diff >= 5 ? "Difficult stretch in the evening; caught it early." : "Evening went as planned.",
      note: ""
    });
  }
  return entries;
}
function completions(actions2, metricsByKey, rnd, today) {
  const log = [];
  const isScheduled = (act, d) => {
    const s = act.schedule || {};
    const freq = s.freq || "manual";
    const dow = d.getDay();
    if (freq === "daily") return true;
    if (freq === "weekdays") return dow !== 0 && dow !== 6;
    if (freq === "weekends") return dow === 0 || dow === 6;
    if (freq === "custom") return (s.days || []).includes(dow);
    return false;
  };
  const baseProb = {
    "act-meditate": 0.82,
    "act-deepwork": 0.68,
    "act-read": 0.62,
    "act-workout": 0.8,
    "act-water": 0.85,
    "act-phonecut": 0.7,
    "act-journal": 0.78,
    "act-caffeine": 0.86,
    "act-checkin": 0.88
  };
  for (let k = 1; k <= 30; k++) {
    const d = addDays(today, -k);
    const key = dateKey(d);
    const m = metricsByKey[key];
    const lowSleep = m && m.sleep < 6.2;
    for (const a of actions2) {
      if (!isScheduled(a, d)) continue;
      const p = baseProb[a.id] ?? 0.7;
      const adjusted = a.valence === "positive" ? p - (lowSleep ? 0.22 : 0) : p;
      if (rnd() < Math.max(0.05, adjusted)) {
        let value = a.target;
        if (["duration", "quantity", "count"].includes(a.type)) {
          value = a.target * (0.55 + rnd() * 0.7);
        }
        log.push({
          id: uid("cl"),
          actionId: a.id,
          dateKey: key,
          value: Math.round(value * 100) / 100,
          createdAt: `${key}T${a.schedule?.time || "20:00"}`
        });
      }
    }
  }
  return log;
}
function buildSeed() {
  const rnd = mulberry32(20260905);
  const now = /* @__PURE__ */ new Date();
  const today = now;
  const acts = actions();
  const cats = categories();
  const mets = dayMetrics(now, rnd, today);
  const metricsByKey = {};
  mets.forEach((m) => metricsByKey[m.dateKey] = m);
  const rec = recovery(metricsByKey, rnd, today);
  const log = completions(acts, metricsByKey, rnd, today);
  const tKey = dateKey(today);
  const priorities = [
    { id: uid("pr"), dateKey: tKey, title: "Finish project proposal draft", note: "Primary deliverable \u2014 protect the deep work block.", order: 0, done: false },
    { id: uid("pr"), dateKey: tKey, title: "Hit 7h sleep \u2014 wind down by 22:30", note: "Recovery priority: guard tonight's cutoff.", order: 1, done: false },
    { id: uid("pr"), dateKey: tKey, title: "One 20-minute walk", note: "Reset energy between work blocks.", order: 2, done: true }
  ];
  return {
    version: 1,
    schema: 1,
    meta: {
      createdAt: `${tKey}T00:00`,
      lastOpenAt: (/* @__PURE__ */ new Date()).toISOString(),
      name: "Demo system",
      demo: true
    },
    preferences: {
      demo: true,
      greetingName: "Alex",
      timeFormat: 12,
      weekStarts: 1,
      insightLevel: "auto"
    },
    categories: cats,
    actions: acts,
    completionLog: log,
    priorities,
    dayMetrics: mets,
    recovery: rec,
    journal: [],
    goals: [],
    dashboards: [],
    tiles: []
    // dashboard widget definitions
  };
}

// src/store/AppContext.jsx
var KEY = "nexus.state.v1";
function loadInitial() {
  if (typeof localStorage !== "undefined") {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
    }
  }
  return buildSeed();
}
var AppContext = (0, import_react.createContext)(null);
var useApp = () => (0, import_react.useContext)(AppContext);
var seq = 0;
function newId(p) {
  seq += 1;
  return `${p}-${Date.now().toString(36)}-${seq}`;
}
function persist(s) {
  try {
    if (typeof localStorage !== "undefined")
      localStorage.setItem(KEY, JSON.stringify(s));
  } catch (e) {
  }
  return s;
}
function AppProvider({ children }) {
  const [state, setState] = (0, import_react.useState)(() => loadInitial());
  function update(fn) {
    setState((s) => persist(fn(structuredClone(s))));
  }
  const api = (0, import_react.useMemo)(() => {
    const actions2 = {
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
      completeAction(action, value2, opts = {}) {
        const key = opts.dateKey || dateKey();
        const now = (/* @__PURE__ */ new Date()).toISOString();
        update((s) => {
          const t = action.type;
          const payload = opts.payload || {};
          const logVal = value2 != null ? value2 : t === "scale" ? opts.scaleValue ?? 5 : action.target || 1;
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
              createdAt: now
            });
          }
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
          const now = (/* @__PURE__ */ new Date()).toISOString();
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
              ...entry
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
            Object.assign(r, patch, { updatedAt: (/* @__PURE__ */ new Date()).toISOString() });
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
            done: false
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
          const now = (/* @__PURE__ */ new Date()).toISOString();
          if (existing) {
            Object.assign(existing, entry, { updatedAt: now });
          } else {
            s.journal.unshift({
              id: newId("jr"),
              dateKey: key,
              createdAt: now,
              ...entry
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
          const prog = milestones.length ? Math.round(doneM / milestones.length * 100) : data.progress ?? 0;
          s.goals.push({
            id: newId("goal"),
            createdAt: (/* @__PURE__ */ new Date()).toISOString(),
            status: "active",
            timeframe: "medium_term",
            priority: "normal",
            milestones: [],
            linkedActionIds: [],
            ...data,
            progress: prog
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
              g.progress = Math.round(doneM / g.milestones.length * 100);
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
            g.progress = Math.round(doneM / g.milestones.length * 100);
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
      }
    };
    return actions2;
  }, []);
  const value = (0, import_react.useMemo)(() => ({ state, api }), [state, api]);
  return /* @__PURE__ */ import_react.default.createElement(AppContext.Provider, { value }, children);
}

// src/components/icons.jsx
var import_react2 = __toESM(require("react"), 1);

// src/components/brand.jsx
var import_react3 = __toESM(require("react"), 1);

// src/screens/TodayScreen.jsx
var import_react10 = __toESM(require("react"), 1);

// src/data/constants.js
var ACTION_TYPES = {
  BOOLEAN: {
    id: "boolean",
    label: "Boolean",
    desc: "Done or not done",
    targetLabel: "Complete"
  },
  QUANTITY: {
    id: "quantity",
    label: "Quantity",
    desc: "Amount toward a target",
    targetLabel: "Target"
  },
  DURATION: {
    id: "duration",
    label: "Duration",
    desc: "Track time spent",
    targetLabel: "Minutes"
  },
  COUNT: {
    id: "count",
    label: "Count",
    desc: "Repeated reps / count",
    targetLabel: "Count"
  },
  SCALE: {
    id: "scale",
    label: "Scale",
    desc: "Subjective 1\u201310 rating",
    targetLabel: "1\u201310"
  },
  AVOIDANCE: {
    id: "avoidance",
    label: "Boundary",
    desc: "An avoidance or boundary to respect",
    targetLabel: "Respect"
  },
  JOURNAL: {
    id: "journal",
    label: "Journal",
    desc: "A reflective written entry",
    targetLabel: "Write"
  },
  EVENT: {
    id: "event",
    label: "Event",
    desc: "A custom event or contextual log",
    targetLabel: "Log"
  }
};
var ACTION_TYPE_IDS = Object.values(ACTION_TYPES).map((t) => t.id);

// src/components/primitives.jsx
var import_react4 = __toESM(require("react"), 1);

// src/components/ActionToggleRow.jsx
var import_react8 = __toESM(require("react"), 1);

// src/components/iconset.jsx
var import_react5 = __toESM(require("react"), 1);

// src/components/ActionCompletionModal.jsx
var import_react7 = __toESM(require("react"), 1);

// src/components/Modal.jsx
var import_react6 = __toESM(require("react"), 1);
var import_react_dom = require("react-dom");

// src/components/common.jsx
var import_react9 = __toESM(require("react"), 1);

// src/screens/RecoveryScreen.jsx
var import_react12 = __toESM(require("react"), 1);

// src/components/CheckInModal.jsx
var import_react11 = __toESM(require("react"), 1);

// src/screens/ActionsScreen.jsx
var import_react16 = __toESM(require("react"), 1);

// src/components/ActionEditorModal.jsx
var import_react13 = __toESM(require("react"), 1);

// src/components/CategoryManagerModal.jsx
var import_react14 = __toESM(require("react"), 1);

// src/components/ActionDetailModal.jsx
var import_react15 = __toESM(require("react"), 1);

// src/screens/AnalyticsScreen.jsx
var import_react18 = __toESM(require("react"), 1);

// src/components/Charts.jsx
var import_react17 = __toESM(require("react"), 1);

// src/screens/MoreScreen.jsx
var import_react19 = __toESM(require("react"), 1);

// src/screens/GoalsScreen.jsx
var import_react22 = __toESM(require("react"), 1);

// src/components/GoalEditorModal.jsx
var import_react20 = __toESM(require("react"), 1);

// src/components/GoalDetailModal.jsx
var import_react21 = __toESM(require("react"), 1);

// src/screens/JournalScreen.jsx
var import_react26 = __toESM(require("react"), 1);

// src/components/JournalEditorModal.jsx
var import_react23 = __toESM(require("react"), 1);

// src/components/DailyReviewModal.jsx
var import_react24 = __toESM(require("react"), 1);

// src/components/WeeklyReviewModal.jsx
var import_react25 = __toESM(require("react"), 1);

// testPhase5.jsx
function TestPhase5Runner() {
  const { state, api } = useApp();
  const tk = dateKey();
  api.addGoal({
    name: "Launch SaaS Product",
    desc: "Build and launch MVP software product",
    categoryId: "cat-focus",
    targetDate: "2026-12-31",
    timeframe: "medium_term",
    priority: "high",
    nextActionTitle: "Finalize core feature spec",
    milestones: [
      { id: "m1", title: "Finalize spec", done: false },
      { id: "m2", title: "Build core backend", done: false }
    ],
    linkedActionIds: ["act-deepwork"]
  });
  const createdGoal = state.goals[state.goals.length - 1];
  api.toggleGoalMilestone(createdGoal.id, "m1");
  api.saveJournalEntry({
    dateKey: tk,
    text: "Productive day working on SaaS spec.",
    mood: 8,
    energy: 8,
    tags: ["#saas", "#deepwork"],
    linkedGoalId: createdGoal.id
  });
  api.addPriority({ title: createdGoal.nextActionTitle, note: "Pulled from goal" });
  return /* @__PURE__ */ import_react28.default.createElement("div", null, "Phase 5 Executed Successfully! Goals count: ", state.goals.length);
}
var routes = ["#/today", "#/goals", "#/journal", "#/more"];
routes.forEach((route) => {
  global.window = { location: { hash: route } };
  const html = import_server.default.renderToString(
    import_react28.default.createElement(AppProvider, null, import_react28.default.createElement(TestPhase5Runner))
  );
  console.log("Verified route " + route + " HTML length: " + html.length);
});
