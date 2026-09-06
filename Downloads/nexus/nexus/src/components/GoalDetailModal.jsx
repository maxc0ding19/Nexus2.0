import React from "react";
import { useApp } from "../store/AppContext";
import { Modal } from "./Modal";
import { Button, StatusDot, Ring, Bar, Tick } from "./primitives";
import { DynIcon } from "./iconset";
import { dateKey, fromKey, addDays } from "../lib/time";

export function GoalDetailModal({ open, onClose, goal, onEdit, onPullToToday }) {
  const { state, api } = useApp();

  if (!goal) return null;

  const category = (state.categories || []).find((c) => c.id === goal.categoryId);
  const linkedActions = (state.actions || []).filter((a) =>
    (goal.linkedActionIds || []).includes(a.id)
  );

  const doneMilestones = (goal.milestones || []).filter((m) => m.done).length;
  const totalMilestones = (goal.milestones || []).length;
  const computedProgress = totalMilestones
    ? Math.round((doneMilestones / totalMilestones) * 100)
    : goal.progress || 0;

  // Target Date Days Remaining
  let daysRemaining = null;
  if (goal.targetDate) {
    const target = fromKey(goal.targetDate);
    const now = new Date();
    daysRemaining = Math.ceil((target - now) / 86400000);
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={goal.name}
      sys="GOAL STRATEGY"
      wide
      footer={
        <div className="row-flex spread" style={{ width: "100%" }}>
          <Button
            variant="ghost"
            style={{ color: "var(--neg)" }}
            onClick={() => {
              if (confirm(`Delete goal "${goal.name}"?`)) {
                api.deleteGoal(goal.id);
                onClose();
              }
            }}
          >
            Delete Goal
          </Button>

          <div className="row-flex" style={{ gap: 8 }}>
            <Button variant="secondary" onClick={onEdit}>
              Edit Goal
            </Button>
            {goal.nextActionTitle && onPullToToday && (
              <Button
                variant="primary"
                onClick={() => {
                  onPullToToday(goal.nextActionTitle);
                  onClose();
                }}
              >
                Pull Next Action to Today
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="stack" style={{ gap: 20 }}>
        {/* Header Summary */}
        <div className="row-flex spread">
          <div>
            <div className="row-flex" style={{ gap: 8 }}>
              <span className="h2" style={{ margin: 0 }}>
                {goal.name}
              </span>
              <span className="tag tag--mono" style={{ textTransform: "uppercase" }}>
                {goal.timeframe ? goal.timeframe.replace("_", " ") : "Goal"}
              </span>
            </div>
            <div className="row-flex" style={{ gap: 8, marginTop: 4 }}>
              <span className="syslabel">{category?.name || "General"}</span>
              {goal.targetDate && (
                <span className="syslabel">
                  · Target: {goal.targetDate}{" "}
                  {daysRemaining != null
                    ? `(${daysRemaining >= 0 ? `${daysRemaining}d left` : "Overdue"})`
                    : ""}
                </span>
              )}
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <span className="mono h2 status-ok" style={{ margin: 0 }}>
              {computedProgress}%
            </span>
            <span className="syslabel mt1" style={{ display: "block" }}>
              PROGRESS
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bar" style={{ height: 8 }}>
          <div
            className="bar__fill bar__fill--ok"
            style={{ width: `${computedProgress}%` }}
          />
        </div>

        {/* Purpose / Description */}
        {goal.desc && <p className="t2 small mb0">{goal.desc}</p>}

        {/* Concrete Next Action Card */}
        {goal.nextActionTitle && (
          <div
            className="p3"
            style={{
              background: "rgba(108,201,154,0.06)",
              border: "1px solid rgba(108,201,154,0.25)",
              borderRadius: "var(--r-2)",
            }}
          >
            <div className="spread">
              <SysLabel className="status-ok">CONCRETE NEXT ACTION</SysLabel>
              {onPullToToday && (
                <button
                  type="button"
                  className="btn btn--ghost small p0 status-ok"
                  onClick={() => {
                    onPullToToday(goal.nextActionTitle);
                    onClose();
                  }}
                >
                  + Add to Today's Priorities
                </button>
              )}
            </div>
            <p className="mt1 t1" style={{ fontWeight: 600, margin: 0 }}>
              {goal.nextActionTitle}
            </p>
          </div>
        )}

        {/* Milestones Checklist */}
        <div>
          <div className="spread mb2">
            <SysLabel>MILESTONES ({doneMilestones}/{totalMilestones})</SysLabel>
          </div>

          {!goal.milestones || goal.milestones.length === 0 ? (
            <p className="t3 small">No milestones defined for this goal.</p>
          ) : (
            <div className="stack" style={{ gap: 8 }}>
              {goal.milestones.map((m) => (
                <div
                  key={m.id}
                  className="row-flex spread p2"
                  style={{
                    background: "var(--surface-1)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--r-2)",
                    cursor: "pointer",
                  }}
                  onClick={() => api.toggleGoalMilestone(goal.id, m.id)}
                >
                  <div className="row-flex" style={{ gap: 10 }}>
                    <Tick done={m.done} />
                    <span
                      style={{
                        fontWeight: 500,
                        fontSize: 14,
                        textDecoration: m.done ? "line-through" : "none",
                        color: m.done ? "var(--text-3)" : "var(--text-1)",
                      }}
                    >
                      {m.title}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Linked Actions */}
        {linkedActions.length > 0 && (
          <div>
            <SysLabel className="mb2">LINKED RECURRING ACTIONS</SysLabel>
            <div className="stack" style={{ gap: 6 }}>
              {linkedActions.map((a) => (
                <div
                  key={a.id}
                  className="row-flex spread p2"
                  style={{
                    background: "var(--surface-1)",
                    borderRadius: "var(--r-2)",
                  }}
                >
                  <div className="row-flex" style={{ gap: 8 }}>
                    <DynIcon name={a.icon} size={16} />
                    <span className="small t1">{a.name}</span>
                  </div>
                  <span className="tag tag--mono small">{a.type}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
