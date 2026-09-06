import React, { useState } from "react";
import { useApp } from "../store/AppContext";
import { Panel, SysLabel, StatusDot, Ring, Bar, Tick } from "./primitives";
import { DynIcon } from "./iconset";
import { IconChevronRight, IconPlus, IconTrash, IconSettings } from "./icons";
import { dateKey } from "../lib/time";
import {
  todayActions,
  recoverySummary,
  recoveryTrendRange,
  systemStatus,
  pickInsight,
} from "../lib/selectors";
import {
  computeSummaryStats,
  computeDailyTrendPoints,
  computeCategoryBreakdown,
  computeActionAnalytics,
} from "../lib/analyticsEngine";
import { LineChart, BarChart, CalendarHeatmap } from "./Charts";
import { Modal } from "./Modal";
import { Button } from "./primitives";

/* ------------------------------------------------------------
   Widget Registry — Extensible metadata taxonomy.
   Adding new widget types only requires appending to this array!
   ------------------------------------------------------------ */
export const WIDGET_REGISTRY = [
  {
    type: "todays_actions",
    label: "Today's Actions Checklist",
    desc: "Interactive scheduled action checklist for today.",
    category: "Execution",
    defaultSize: "full",
  },
  {
    type: "priorities",
    label: "Today's Priorities",
    desc: "Top 3 primary outcomes for today.",
    category: "Execution",
    defaultSize: "full",
  },
  {
    type: "recovery_overview",
    label: "Recovery Stability Overview",
    desc: "Recovery status ring, stability readout, and redirect rate.",
    category: "Recovery",
    defaultSize: "half",
  },
  {
    type: "recovery_trend",
    label: "Recovery Difficulty Trend",
    desc: "14-day urge difficulty trend bar visualization.",
    category: "Recovery",
    defaultSize: "full",
  },
  {
    type: "goal_progress",
    label: "Strategic Goals Progress",
    desc: "Active goals, milestones progress, and next actions.",
    category: "Execution",
    defaultSize: "full",
  },
  {
    type: "calendar_heatmap",
    label: "Activity Calendar Heatmap",
    desc: "30-day activity intensity grid.",
    category: "Analytics",
    defaultSize: "full",
  },
  {
    type: "trend_chart",
    label: "Activity Trend Line Chart",
    desc: "Daily completions trend line over selected range.",
    category: "Analytics",
    defaultSize: "full",
  },
  {
    type: "category_breakdown",
    label: "Category Completion Breakdown",
    desc: "Bar chart breakdown of completions per category.",
    category: "Analytics",
    defaultSize: "full",
  },
  {
    type: "system_insight",
    label: "Automated System Insight",
    desc: "Primary pattern insight card with recommended experiment.",
    category: "Analytics",
    defaultSize: "full",
  },
  {
    type: "journal",
    label: "Latest Reflection Journal",
    desc: "Most recent journal reflection and mood readout.",
    category: "Reflection",
    defaultSize: "half",
  },
  {
    type: "sleep",
    label: "Sleep Metric Tracker",
    desc: "Sleep duration and 7-day average.",
    category: "Health & Context",
    defaultSize: "half",
  },
  {
    type: "screen_usage",
    label: "Screen Usage Tracker",
    desc: "Daily screen time hours readout.",
    category: "Health & Context",
    defaultSize: "half",
  },
  {
    type: "action_progress",
    label: "Single Action Progress",
    desc: "Deep progress and completion rate for a specific action.",
    category: "Execution",
    defaultSize: "half",
  },
];

/* Pre-configured Dashboard Starters */
export const DASHBOARD_PRESETS = [
  {
    id: "execution",
    name: "Execution OS",
    widgets: [
      { id: "w-act", type: "todays_actions", title: "Today's Scheduled Actions", size: "full" },
      { id: "w-prio", type: "priorities", title: "Today's Outcome Priorities", size: "full" },
      { id: "w-goals", type: "goal_progress", title: "Strategic Goals", size: "full" },
    ],
  },
  {
    id: "recovery",
    name: "Recovery OS",
    widgets: [
      { id: "w-rec-ov", type: "recovery_overview", title: "Recovery Stability", size: "half" },
      { id: "w-rec-tr", type: "recovery_trend", title: "Difficulty Trend", size: "full" },
      { id: "w-ins", type: "system_insight", title: "Pattern Insight", size: "full" },
    ],
  },
  {
    id: "analytics",
    name: "Analytics OS",
    widgets: [
      { id: "w-trend", type: "trend_chart", title: "Daily Completions Trend", size: "full" },
      { id: "w-heat", type: "calendar_heatmap", title: "30D Activity Heatmap", size: "full" },
      { id: "w-cat", type: "category_breakdown", title: "Category Breakdown", size: "full" },
    ],
  },
  {
    id: "balanced",
    name: "Balanced OS",
    widgets: [
      { id: "w-act", type: "todays_actions", title: "Today's Actions", size: "full" },
      { id: "w-prio", type: "priorities", title: "Today's Priorities", size: "full" },
      { id: "w-rec", type: "recovery_overview", title: "Recovery Status", size: "half" },
      { id: "w-ins", type: "system_insight", title: "Pattern Insight", size: "full" },
      { id: "w-goals", type: "goal_progress", title: "Strategic Goals", size: "full" },
    ],
  },
];

/* Wrapper container for widget layout */
export function WidgetContainer({
  widget,
  onMove,
  onResize,
  onConfigure,
  onRemove,
  isFirst,
  isLast,
  children,
}) {
  return (
    <Panel
      pad
      glass
      style={{
        width: "100%",
        gridColumn: widget.size === "half" ? "span 1" : "span 2",
      }}
    >
      <div className="stack" style={{ gap: 12 }}>
        {/* Widget Header Controls */}
        <div className="row-flex spread" style={{ borderBottom: "1px solid var(--hairline)", paddingBottom: 8 }}>
          <SysLabel>{(widget.title || widget.type).toUpperCase()}</SysLabel>

          <div className="row-flex" style={{ gap: 4 }}>
            <button
              type="button"
              className="btn btn--ghost small"
              disabled={isFirst}
              onClick={() => onMove(-1)}
              style={{ padding: "2px 6px" }}
              title="Move Up"
            >
              ▲
            </button>
            <button
              type="button"
              className="btn btn--ghost small"
              disabled={isLast}
              onClick={() => onMove(1)}
              style={{ padding: "2px 6px" }}
              title="Move Down"
            >
              ▼
            </button>
            <button
              type="button"
              className="btn btn--ghost small"
              onClick={onResize}
              style={{ padding: "2px 6px", fontSize: 11 }}
              title="Toggle Size (Half / Full)"
            >
              {widget.size === "half" ? "1x" : "2x"}
            </button>
            <button
              type="button"
              className="btn btn--ghost small"
              onClick={onConfigure}
              style={{ padding: "2px 6px" }}
              title="Configure Widget"
            >
              <IconSettings size={13} />
            </button>
            <button
              type="button"
              className="btn btn--ghost small"
              onClick={onRemove}
              style={{ padding: "2px 6px", color: "var(--neg)" }}
              title="Remove Widget"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Widget Component Content */}
        <div>{children}</div>
      </div>
    </Panel>
  );
}

/* Dynamic Component Renderer for any widget type */
export function WidgetRenderer({ widget }) {
  const { state, api } = useApp();
  const tk = dateKey();
  const config = widget.config || {};
  const range = config.range || "30D";

  switch (widget.type) {
    case "todays_actions": {
      const acts = todayActions(state);
      return (
        <div className="stack" style={{ gap: 8 }}>
          {acts.length === 0 ? (
            <p className="t3 small">No actions scheduled today.</p>
          ) : (
            acts.slice(0, 5).map((a) => (
              <div
                key={a.id}
                className="row-flex spread p2"
                style={{ background: "var(--surface-1)", borderRadius: 6, cursor: "pointer" }}
                onClick={() => {
                  if (a.done) api.uncompleteAction(a);
                  else api.completeAction(a);
                }}
              >
                <div className="row-flex" style={{ gap: 8 }}>
                  <Tick done={a.done} />
                  <span className="small t1" style={{ textDecoration: a.done ? "line-through" : "none" }}>
                    {a.name}
                  </span>
                </div>
                <span className="tag tag--mono small">{a.type}</span>
              </div>
            ))
          )}
        </div>
      );
    }

    case "priorities": {
      const todayPrio = (state.priorities || []).filter((p) => p.dateKey === tk);
      return (
        <div className="stack" style={{ gap: 6 }}>
          {todayPrio.length === 0 ? (
            <p className="t3 small">No priorities set for today.</p>
          ) : (
            todayPrio.slice(0, 3).map((p) => (
              <div
                key={p.id}
                className="row-flex spread p2"
                style={{ background: "var(--surface-1)", borderRadius: 6, cursor: "pointer" }}
                onClick={() => api.togglePriority(p.id)}
              >
                <div className="row-flex" style={{ gap: 8 }}>
                  <Tick done={p.done} />
                  <span className="small t1" style={{ textDecoration: p.done ? "line-through" : "none" }}>
                    {p.title}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      );
    }

    case "recovery_overview": {
      const rec = recoverySummary(state);
      const ringVal = rec.days ? Math.max(0, 100 - rec.avgDifficulty * 10) : 0;
      return (
        <div className="row-flex" style={{ gap: 16 }}>
          <Ring value={ringVal} size={70} stroke={4} tone={rec.avgDifficulty != null && rec.avgDifficulty < 5 ? "ok" : "warn"}>
            <span className="mono small font-bold">
              {rec.avgDifficulty != null ? `${rec.avgDifficulty.toFixed(1)}` : "—"}
            </span>
          </Ring>
          <div>
            <div className="h2" style={{ margin: 0, fontSize: 16 }}>
              {rec.avgDifficulty == null ? "No logs" : rec.avgDifficulty <= 4 ? "Steady" : "Watchful"}
            </div>
            <span className="t3 small mt1" style={{ display: "block" }}>
              {rec.days} days logged · {rec.redirectedRate != null ? `${Math.round(rec.redirectedRate * 100)}% redirected` : ""}
            </span>
          </div>
        </div>
      );
    }

    case "recovery_trend": {
      const points = recoveryTrendRange(state, 14);
      return (
        <div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 80 }}>
            {points.map((p) => {
              const h = p.difficulty == null ? 4 : (p.difficulty / 10) * 100;
              return (
                <div
                  key={p.dateKey}
                  style={{
                    flex: 1,
                    height: `${Math.max(4, h)}%`,
                    background: p.hasSetback ? "var(--neg)" : p.difficulty >= 6 ? "var(--warn)" : "var(--ok)",
                    borderRadius: 3,
                    opacity: p.difficulty == null ? 0.3 : 0.9,
                  }}
                  title={`${p.dateKey}: ${p.difficulty ?? "No log"}/10`}
                />
              );
            })}
          </div>
        </div>
      );
    }

    case "goal_progress": {
      const activeGoals = (state.goals || []).filter((g) => g.status === "active");
      return (
        <div className="stack" style={{ gap: 8 }}>
          {activeGoals.length === 0 ? (
            <p className="t3 small">No active strategic goals.</p>
          ) : (
            activeGoals.slice(0, 3).map((g) => (
              <div key={g.id} className="p2" style={{ background: "var(--surface-1)", borderRadius: 6 }}>
                <div className="spread small t1 mb1">
                  <span style={{ fontWeight: 550 }}>{g.name}</span>
                  <span className="mono status-ok">{g.progress || 0}%</span>
                </div>
                <div className="bar" style={{ height: 4 }}>
                  <div className="bar__fill bar__fill--ok" style={{ width: `${g.progress || 0}%` }} />
                </div>
              </div>
            ))
          )}
        </div>
      );
    }

    case "calendar_heatmap": {
      const analytics = computeActionAnalytics(
        state,
        config.actionId || state.actions?.[0]?.id,
        "30D"
      );
      return <CalendarHeatmap data={analytics?.points || []} numDays={30} />;
    }

    case "trend_chart": {
      const dailyPoints = computeDailyTrendPoints(state, range);
      return <LineChart data={dailyPoints} xKey="shortDate" yKey="completionsCount" height={130} />;
    }

    case "category_breakdown": {
      const breakdown = computeCategoryBreakdown(state, range);
      return <BarChart data={breakdown} xKey="name" yKey="completionsCount" />;
    }

    case "system_insight": {
      const insight = pickInsight(state);
      if (!insight) return <p className="t3 small">System collecting baseline data.</p>;
      return (
        <div className="p2" style={{ background: "var(--surface-1)", borderRadius: 6 }}>
          <div className="row-flex" style={{ gap: 6 }}>
            <StatusDot tone={insight.tone} />
            <span className="mono small font-bold">{insight.title}</span>
          </div>
          <p className="small t1 mt2 mb0">{insight.observation}</p>
        </div>
      );
    }

    case "journal": {
      const latest = (state.journal || [])[0];
      if (!latest) return <p className="t3 small">No journal reflections recorded yet.</p>;
      return (
        <div>
          <span className="mono small t3">{latest.dateKey}</span>
          <p className="small t1 mt1 truncate mb0">{latest.text}</p>
        </div>
      );
    }

    case "sleep": {
      const statusList = systemStatus(state);
      const sleepObj = statusList.find((s) => s.label === "Sleep");
      return (
        <div>
          <div className="mono h2 mt1 status-ok">{sleepObj?.display || "—"}</div>
          <span className="t3 small">Sleep Duration</span>
        </div>
      );
    }

    case "screen_usage": {
      const statusList = systemStatus(state);
      const screenObj = statusList.find((s) => s.label === "Screen");
      return (
        <div>
          <div className="mono h2 mt1">{screenObj?.display || "—"}</div>
          <span className="t3 small">Screen Time Hours</span>
        </div>
      );
    }

    case "action_progress": {
      const action = (state.actions || []).find((a) => a.id === config.actionId) || state.actions?.[0];
      if (!action) return <p className="t3 small">Select action in widget config.</p>;
      const analytics = computeActionAnalytics(state, action.id, range);
      return (
        <div>
          <div className="spread small t1 mb1">
            <span style={{ fontWeight: 550 }}>{action.name}</span>
            <span className="mono status-ok">{analytics?.consistencyRate || 0}%</span>
          </div>
          <span className="t3 small">30D Adherence Rate</span>
        </div>
      );
    }

    default:
      return <p className="t3 small">Widget content rendered from store.</p>;
  }
}

/* Widget Configuration Modal */
export function WidgetConfigModal({ open, onClose, widget, onSave }) {
  const { state } = useApp();
  const [title, setTitle] = useState(widget?.title || "");
  const [size, setSize] = useState(widget?.size || "full");
  const [range, setRange] = useState(widget?.config?.range || "30D");
  const [actionId, setActionId] = useState(widget?.config?.actionId || "");

  const activeActions = (state.actions || []).filter((a) => !a.archived);

  function handleSave() {
    onSave({
      title: title.trim(),
      size,
      config: {
        ...(widget?.config || {}),
        range,
        actionId,
      },
    });
    onClose();
  }

  if (!widget) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Configure Widget"
      sys="WIDGET CONFIG"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save Config
          </Button>
        </>
      }
    >
      <div className="stack" style={{ gap: 16 }}>
        <div className="field">
          <label className="field__label">Widget Custom Title</label>
          <input
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={widget.type}
          />
        </div>

        <div className="field">
          <label className="field__label">Widget Width</label>
          <div className="seg">
            <button
              type="button"
              className={`seg__btn ${size === "half" ? "is-active" : ""}`}
              onClick={() => setSize("half")}
            >
              Half Width (1x)
            </button>
            <button
              type="button"
              className={`seg__btn ${size === "full" ? "is-active" : ""}`}
              onClick={() => setSize("full")}
            >
              Full Width (2x)
            </button>
          </div>
        </div>

        <div className="field">
          <label className="field__label">Time Range</label>
          <div className="seg">
            {["7D", "30D", "90D"].map((r) => (
              <button
                key={r}
                type="button"
                className={`seg__btn ${range === r ? "is-active" : ""}`}
                onClick={() => setRange(r)}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {["action_progress", "calendar_heatmap"].includes(widget.type) && (
          <div className="field">
            <label className="field__label">Target Action</label>
            <select
              className="input"
              value={actionId}
              onChange={(e) => setActionId(e.target.value)}
            >
              <option value="">Choose action...</option>
              {activeActions.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </Modal>
  );
}
