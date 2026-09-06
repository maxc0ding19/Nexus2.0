import React from "react";
import { useApp } from "../store/AppContext";
import { Modal } from "./Modal";
import { Button, StatusDot, Ring, Bar, Tick } from "./primitives";
import { DynIcon } from "./iconset";
import { ACTION_TYPES, VALENCE } from "../data/constants";
import { dateKey, fromKey, addDays, dayLabel } from "../lib/time";
import { fmt } from "../lib/format";

export function ActionDetailModal({
  open,
  onClose,
  action,
  onEdit,
  onLogCompletion,
}) {
  const { state, api } = useApp();

  if (!action) return null;

  const tk = dateKey();
  const logs = (state.completionLog || []).filter((c) => c.actionId === action.id);
  const isDoneToday = logs.some((c) => c.dateKey === tk);
  const typeObj = ACTION_TYPES[action.type.toUpperCase()] || ACTION_TYPES.BOOLEAN;
  const category = (state.categories || []).find((c) => c.id === action.categoryId);

  // Compute 30-day completion stats
  const history30 = [];
  const endDate = fromKey(tk);
  let totalLogs30 = 0;
  let totalSum30 = 0;

  for (let i = 29; i >= 0; i--) {
    const k = dateKey(addDays(endDate, -i));
    const entry = logs.find((c) => c.dateKey === k);
    if (entry) {
      totalLogs30++;
      totalSum30 += entry.value || 0;
    }
    history30.push({ dateKey: k, entry, done: !!entry });
  }

  const completionRate = Math.round((totalLogs30 / 30) * 100);

  // Current Streak Calculation
  let streak = 0;
  let cursor = fromKey(tk);
  if (!isDoneToday) cursor = addDays(cursor, -1);
  while (logs.some((c) => c.dateKey === dateKey(cursor))) {
    streak++;
    cursor = addDays(cursor, -1);
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={action.name}
      sys="ACTION DETAIL"
      wide
      footer={
        <div className="row-flex spread" style={{ width: "100%" }}>
          <div className="row-flex" style={{ gap: 8 }}>
            <Button
              variant="ghost"
              style={{ color: "var(--neg)" }}
              onClick={() => {
                if (confirm(`Delete action "${action.name}"? Historical completion data will be removed.`)) {
                  api.deleteAction(action.id);
                  onClose();
                }
              }}
            >
              Delete
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                if (action.archived) api.unarchiveAction(action.id);
                else api.archiveAction(action.id);
                onClose();
              }}
            >
              {action.archived ? "Unarchive" : "Archive"}
            </Button>
          </div>

          <div className="row-flex" style={{ gap: 8 }}>
            <Button variant="secondary" onClick={onEdit}>
              Edit Action
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                onClose();
                onLogCompletion(action);
              }}
            >
              {isDoneToday ? "Edit Today's Log" : "Log Completion"}
            </Button>
          </div>
        </div>
      }
    >
      <div className="stack" style={{ gap: 20 }}>
        {/* Header Summary */}
        <div className="row-flex spread">
          <div className="row-flex" style={{ gap: 12 }}>
            <span
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: "var(--surface-3)",
                border: "1px solid var(--border)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--ok)",
              }}
            >
              <DynIcon name={action.icon} size={22} />
            </span>
            <div>
              <div className="row-flex" style={{ gap: 8 }}>
                <span style={{ fontWeight: 600, fontSize: 18 }}>{action.name}</span>
                {action.archived && <span className="tag tag--mono status-warn">ARCHIVED</span>}
              </div>
              <div className="row-flex" style={{ gap: 8, marginTop: 4 }}>
                <span className="tag tag--mono">{typeObj.label}</span>
                <span className="tag tag--mono">{category?.name || "General"}</span>
                {action.schedule?.time && (
                  <span className="tag tag--mono">{action.schedule.time}</span>
                )}
              </div>
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <span className="mono h2 status-ok" style={{ margin: 0 }}>
              {streak}d
            </span>
            <span className="syslabel mt1" style={{ display: "block" }}>
              STREAK
            </span>
          </div>
        </div>

        {/* Action Description */}
        {action.desc && <p className="t2 small">{action.desc}</p>}

        {/* 30-Day Stats Row */}
        <div
          className="grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
            gap: 12,
          }}
        >
          <div className="p2" style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: "var(--r-2)" }}>
            <span className="syslabel">30-DAY RATE</span>
            <div className="mono h2 mt1" style={{ fontSize: 20 }}>
              {completionRate}%
            </div>
          </div>

          <div className="p2" style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: "var(--r-2)" }}>
            <span className="syslabel">COMPLETIONS</span>
            <div className="mono h2 mt1" style={{ fontSize: 20 }}>
              {totalLogs30} / 30
            </div>
          </div>

          {["quantity", "duration", "count"].includes(action.type) && (
            <div className="p2" style={{ background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: "var(--r-2)" }}>
              <span className="syslabel">TOTAL LOGGED</span>
              <div className="mono h2 mt1" style={{ fontSize: 20 }}>
                {fmt(totalSum30)} {action.unit}
              </div>
            </div>
          )}
        </div>

        {/* 30-Day Completion Visual Grid / Heatmap */}
        <div>
          <div className="spread mb2">
            <span className="syslabel">30-DAY COMPLETION HISTORY</span>
            <span className="mono small t3">{totalLogs30} days logged</span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(10, 1fr)",
              gap: 6,
            }}
          >
            {history30.map((d) => (
              <div
                key={d.dateKey}
                title={`${d.dateKey} · ${d.done ? `Done (${d.entry?.value || 1})` : "Not completed"}`}
                style={{
                  height: 28,
                  borderRadius: 4,
                  background: d.done ? "var(--ok)" : "var(--surface-3)",
                  opacity: d.done ? 0.85 : 0.4,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {d.done && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#000" }}>
                    <path d="M4.5 12.5 9.5 17.5 19.5 6.5" />
                  </svg>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Notes & Specs */}
        {action.notes && (
          <div className="field">
            <span className="syslabel">PRIVATE NOTES</span>
            <p className="t2 small mt1" style={{ background: "var(--surface-1)", padding: 10, borderRadius: "var(--r-2)" }}>
              {action.notes}
            </p>
          </div>
        )}

        {/* Attached Custom Fields Definition Preview */}
        {action.customFields && action.customFields.length > 0 && (
          <div>
            <span className="syslabel">ATTACHED CUSTOM FIELDS</span>
            <div className="stack mt2" style={{ gap: 6 }}>
              {action.customFields.map((cf) => (
                <div key={cf.id} className="row-flex spread small p2" style={{ background: "var(--surface-1)", borderRadius: 6 }}>
                  <span>{cf.name}</span>
                  <span className="tag tag--mono">{cf.type}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
