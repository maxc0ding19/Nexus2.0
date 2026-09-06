import React, { useState } from "react";
import { useApp } from "../store/AppContext";
import { Modal } from "./Modal";
import { Button, StatusDot } from "./primitives";
import { dateKey } from "../lib/time";
import { computeSummaryStats } from "../lib/analyticsEngine";

export function WeeklyReviewModal({ open, onClose }) {
  const { state, api } = useApp();
  const tk = dateKey();

  const stats = computeSummaryStats(state, "7D");
  const activeGoals = (state.goals || []).filter((g) => g.status === "active");

  const [nextWeekFocus, setNextWeekFocus] = useState("");
  const [selectedGoalPriority, setSelectedGoalPriority] = useState("");

  function handleSave() {
    if (!nextWeekFocus.trim() && !selectedGoalPriority) return;

    const focusText = nextWeekFocus.trim() || selectedGoalPriority;

    api.addPriority({
      title: `Next Week Focus: ${focusText}`,
      note: "Set during Weekly Review",
    });

    api.saveJournalEntry({
      dateKey: tk,
      text: `Weekly Review Complete.\nFocus next week: ${focusText}\n7D Completions: ${stats.totalCompletions}\nConsistency: ${stats.consistencyRate}%`,
      tags: ["#weeklyreview"],
    });

    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Weekly System Review"
      sys="STRATEGIC REVIEW"
      wide
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save & Set Next Week Focus
          </Button>
        </>
      }
    >
      <div className="stack" style={{ gap: 20 }}>
        {/* Actual Logged System Data Summary */}
        <div
          className="stat-grid"
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))" }}
        >
          <div className="stat">
            <SysLabel>7D COMPLETIONS</SysLabel>
            <div className="mono mt1" style={{ fontSize: 24, fontWeight: 600 }}>
              {stats.totalCompletions}
            </div>
          </div>

          <div className="stat">
            <SysLabel>CONSISTENCY</SysLabel>
            <div className="mono mt1 status-ok" style={{ fontSize: 24, fontWeight: 600 }}>
              {stats.consistencyRate ?? 0}%
            </div>
          </div>

          <div className="stat">
            <SysLabel>RECOVERY RESILIENCE</SysLabel>
            <div className="mono mt1" style={{ fontSize: 24, fontWeight: 600 }}>
              {stats.redirectRate != null ? `${stats.redirectRate}%` : "—"}
            </div>
          </div>
        </div>

        {/* System Summary Note */}
        <div className="p3" style={{ background: "var(--surface-1)", borderRadius: "var(--r-2)" }}>
          <SysLabel>SYSTEM SUMMARY</SysLabel>
          <p className="t2 small mt2 mb0">
            Over the last 7 days, your system logged <strong>{stats.totalCompletions} completions</strong> across scheduled actions. Active continuous streak is <strong>{stats.currentStreak} days</strong>.
          </p>
        </div>

        {/* Primary Focus Question */}
        <div
          className="field p3"
          style={{
            background: "rgba(108,201,154,0.06)",
            border: "1px solid rgba(108,201,154,0.25)",
            borderRadius: "var(--r-2)",
          }}
        >
          <label className="field__label status-ok" style={{ fontSize: 14 }}>
            What should I focus on next week?
          </label>
          <input
            className="input mt1"
            placeholder="e.g. Guard sleep cutoff and finalize MVP feature spec"
            value={nextWeekFocus}
            onChange={(e) => setNextWeekFocus(e.target.value)}
            autoFocus
          />
        </div>

        {/* Goal Link Selector */}
        {activeGoals.length > 0 && (
          <div className="field">
            <label className="field__label">Select Primary Strategic Goal Focus</label>
            <select
              className="input"
              value={selectedGoalPriority}
              onChange={(e) => setSelectedGoalPriority(e.target.value)}
            >
              <option value="">Choose active goal...</option>
              {activeGoals.map((g) => (
                <option key={g.id} value={g.nextActionTitle || g.name}>
                  {g.name} — Next: {g.nextActionTitle || "In progress"}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </Modal>
  );
}
