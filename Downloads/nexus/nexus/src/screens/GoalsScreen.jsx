import React, { useState } from "react";
import { useApp } from "../store/AppContext";
import { ScreenHeader } from "../components/common";
import {
  IconPlus,
  IconChevronRight,
  IconTarget,
  IconCheck,
} from "../components/icons";
import {
  Button,
  Panel,
  SysLabel,
  StatusDot,
  Tick,
  Bar,
} from "../components/primitives";
import { GoalEditorModal } from "../components/GoalEditorModal";
import { GoalDetailModal } from "../components/GoalDetailModal";

export default function GoalsScreen({ navigate }) {
  const { state, api } = useApp();

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);

  // Filters
  const [timeframeFilter, setTimeframeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("active");

  const categories = state.categories || [];
  const allGoals = state.goals || [];

  const filteredGoals = allGoals
    .filter((g) => {
      if (statusFilter !== "all" && (g.status || "active") !== statusFilter)
        return false;
      if (timeframeFilter !== "all" && g.timeframe !== timeframeFilter)
        return false;
      return true;
    })
    .sort((a, b) => (b.priority === "high" ? 1 : -1));

  function handleOpenCreate() {
    setEditingGoal(null);
    setEditorOpen(true);
  }

  function handleOpenEdit(goal, e) {
    if (e) e.stopPropagation();
    setEditingGoal(goal);
    setEditorOpen(true);
  }

  function handleOpenDetail(goal) {
    setSelectedGoal(goal);
    setDetailOpen(true);
  }

  function handlePullToToday(actionTitle) {
    api.addPriority({ title: actionTitle, note: "Pulled from Strategic Goal" });
    if (navigate) navigate("today");
  }

  return (
    <main className="screen">
      <ScreenHeader
        sys="STRATEGIC EXECUTION OS"
        title="Goals"
        right={
          <Button variant="primary" onClick={handleOpenCreate}>
            <IconPlus size={16} /> Create Goal
          </Button>
        }
        sub="Connect long-term ambitions to today's concrete actions. Break down goals into milestones, assign next actions, and execute daily."
      />

      {/* Top Stat Summary Grid */}
      <section className="section mb4">
        <div
          className="stat-grid"
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))" }}
        >
          <div className="stat">
            <SysLabel>ACTIVE GOALS</SysLabel>
            <div className="mono mt1" style={{ fontSize: 24, fontWeight: 600 }}>
              {allGoals.filter((g) => (g.status || "active") === "active").length}
            </div>
          </div>

          <div className="stat">
            <SysLabel>COMPLETED</SysLabel>
            <div className="mono mt1 status-ok" style={{ fontSize: 24, fontWeight: 600 }}>
              {allGoals.filter((g) => g.status === "completed").length}
            </div>
          </div>

          <div className="stat">
            <SysLabel>AVG PROGRESS</SysLabel>
            <div className="mono mt1" style={{ fontSize: 24, fontWeight: 600 }}>
              {allGoals.length
                ? `${Math.round(
                    allGoals.reduce((s, g) => s + (g.progress || 0), 0) / allGoals.length
                  )}%`
                : "—"}
            </div>
          </div>
        </div>
      </section>

      {/* Filters Bar */}
      <div className="row-flex spread mb4" style={{ gap: 12, flexWrap: "wrap" }}>
        <div className="seg" style={{ height: 32, padding: 2 }}>
          {[
            { id: "active", label: "ACTIVE" },
            { id: "completed", label: "COMPLETED" },
            { id: "all", label: "ALL GOALS" },
          ].map((s) => (
            <button
              key={s.id}
              type="button"
              className={`seg__btn ${statusFilter === s.id ? "is-active" : ""}`}
              style={{ fontSize: 11, padding: "2px 10px" }}
              onClick={() => setStatusFilter(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="seg" style={{ height: 32, padding: 2 }}>
          {[
            { id: "all", label: "ALL TIMEFRAMES" },
            { id: "short_term", label: "SHORT" },
            { id: "medium_term", label: "MEDIUM" },
            { id: "long_term", label: "LONG" },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              className={`seg__btn ${timeframeFilter === t.id ? "is-active" : ""}`}
              style={{ fontSize: 11, padding: "2px 8px" }}
              onClick={() => setTimeframeFilter(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Goals Feed Grid */}
      <div className="stack mb5" style={{ gap: 16 }}>
        {filteredGoals.length === 0 ? (
          <Panel pad>
            <div className="empty" style={{ padding: "32px 0" }}>
              <p className="t2">No strategic goals found for this filter.</p>
              <Button variant="secondary" className="mt2" onClick={handleOpenCreate}>
                + Create Goal
              </Button>
            </div>
          </Panel>
        ) : (
          filteredGoals.map((goal) => {
            const category = categories.find((c) => c.id === goal.categoryId);
            const doneM = (goal.milestones || []).filter((m) => m.done).length;
            const totalM = (goal.milestones || []).length;
            const computedProgress = totalM
              ? Math.round((doneM / totalM) * 100)
              : goal.progress || 0;

            return (
              <Panel
                key={goal.id}
                pad
                glass
                style={{
                  cursor: "pointer",
                  transition: "border-color 0.2s var(--ease)",
                }}
                onClick={() => handleOpenDetail(goal)}
              >
                <div className="stack" style={{ gap: 12 }}>
                  <div className="row-flex spread">
                    <div className="row-flex" style={{ gap: 10 }}>
                      <span
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 10,
                          background: "var(--surface-3)",
                          border: "1px solid var(--border)",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "var(--ok)",
                        }}
                      >
                        <IconTarget size={20} />
                      </span>

                      <div>
                        <div className="row-flex" style={{ gap: 8 }}>
                          <span style={{ fontWeight: 600, fontSize: 16 }}>
                            {goal.name}
                          </span>
                          {goal.priority === "high" && (
                            <span className="tag tag--mono status-warn small">
                              HIGH PRIORITY
                            </span>
                          )}
                        </div>

                        <div className="row-flex" style={{ gap: 8, marginTop: 3 }}>
                          <span className="syslabel">{category?.name || "General"}</span>
                          <span className="syslabel">
                            · {goal.timeframe ? goal.timeframe.replace("_", " ") : "Goal"}
                          </span>
                          {goal.targetDate && (
                            <span className="syslabel">· Target: {goal.targetDate}</span>
                          )}
                        </div>
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
                  <div className="bar" style={{ height: 6 }}>
                    <div
                      className="bar__fill bar__fill--ok"
                      style={{ width: `${computedProgress}%` }}
                    />
                  </div>

                  {goal.desc && <p className="t2 small mb0">{goal.desc}</p>}

                  {/* Concrete Next Action Box */}
                  {goal.nextActionTitle && (
                    <div
                      className="p2 row-flex spread"
                      style={{
                        background: "rgba(108,201,154,0.06)",
                        border: "1px solid rgba(108,201,154,0.2)",
                        borderRadius: "var(--r-2)",
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="row-flex" style={{ gap: 8 }}>
                        <StatusDot tone="ok" />
                        <span className="small t1" style={{ fontWeight: 550 }}>
                          Next Action: {goal.nextActionTitle}
                        </span>
                      </div>

                      <button
                        type="button"
                        className="btn btn--ghost small p0 status-ok"
                        onClick={() => handlePullToToday(goal.nextActionTitle)}
                      >
                        + Pull to Today
                      </button>
                    </div>
                  )}

                  {/* Milestones count */}
                  <div className="row-flex spread t3 small" style={{ paddingTop: 4 }}>
                    <span>
                      Milestones: <span className="mono t1">{doneM}/{totalM} done</span>
                    </span>

                    <span className="btn btn--ghost small p0 t3">
                      View Goal Breakdown <IconChevronRight size={14} />
                    </span>
                  </div>
                </div>
              </Panel>
            );
          })
        )}
      </div>

      {/* Modals */}
      <GoalEditorModal
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        initialGoal={editingGoal}
      />

      <GoalDetailModal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        goal={selectedGoal}
        onEdit={() => {
          setDetailOpen(false);
          setEditingGoal(selectedGoal);
          setEditorOpen(true);
        }}
        onPullToToday={handlePullToToday}
      />
    </main>
  );
}
