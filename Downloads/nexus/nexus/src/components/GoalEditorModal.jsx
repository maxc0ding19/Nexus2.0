import React, { useState, useEffect } from "react";
import { useApp } from "../store/AppContext";
import { Modal } from "./Modal";
import { Button } from "./primitives";
import { dateKey } from "../lib/time";

export function GoalEditorModal({ open, onClose, initialGoal = null }) {
  const { state, api } = useApp();
  const categories = state.categories || [];
  const activeActions = (state.actions || []).filter((a) => !a.archived);

  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id || "");
  const [targetDate, setTargetDate] = useState("");
  const [timeframe, setTimeframe] = useState("medium_term");
  const [priority, setPriority] = useState("normal");
  const [status, setStatus] = useState("active");
  const [nextActionTitle, setNextActionTitle] = useState("");
  const [milestones, setMilestones] = useState([]);
  const [linkedActionIds, setLinkedActionIds] = useState([]);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open) {
      if (initialGoal) {
        setName(initialGoal.name || "");
        setDesc(initialGoal.desc || "");
        setCategoryId(initialGoal.categoryId || categories[0]?.id || "");
        setTargetDate(initialGoal.targetDate || "");
        setTimeframe(initialGoal.timeframe || "medium_term");
        setPriority(initialGoal.priority || "normal");
        setStatus(initialGoal.status || "active");
        setNextActionTitle(initialGoal.nextActionTitle || "");
        setMilestones(initialGoal.milestones || []);
        setLinkedActionIds(initialGoal.linkedActionIds || []);
        setNotes(initialGoal.notes || "");
      } else {
        setName("");
        setDesc("");
        setCategoryId(categories[0]?.id || "");
        setTargetDate("");
        setTimeframe("medium_term");
        setPriority("normal");
        setStatus("active");
        setNextActionTitle("");
        setMilestones([
          { id: `m-${Date.now().toString(36)}-1`, title: "", done: false },
        ]);
        setLinkedActionIds([]);
        setNotes("");
      }
    }
  }, [open, initialGoal, categories]);

  function handleAddMilestone() {
    setMilestones([
      ...milestones,
      {
        id: `m-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`,
        title: "",
        done: false,
      },
    ]);
  }

  function handleUpdateMilestone(id, patch) {
    setMilestones(
      milestones.map((m) => (m.id === id ? { ...m, ...patch } : m))
    );
  }

  function handleRemoveMilestone(id) {
    setMilestones(milestones.filter((m) => m.id !== id));
  }

  function toggleLinkedAction(id) {
    if (linkedActionIds.includes(id)) {
      setLinkedActionIds(linkedActionIds.filter((x) => x !== id));
    } else {
      setLinkedActionIds([...linkedActionIds, id]);
    }
  }

  function handleSave() {
    if (!name.trim()) return;

    const goalData = {
      name: name.trim(),
      desc: desc.trim(),
      categoryId,
      targetDate,
      timeframe,
      priority,
      status,
      nextActionTitle: nextActionTitle.trim(),
      notes: notes.trim(),
      milestones: milestones
        .filter((m) => m.title.trim() !== "")
        .map((m) => ({ ...m, title: m.title.trim() })),
      linkedActionIds,
    };

    if (initialGoal?.id) {
      api.updateGoal(initialGoal.id, goalData);
    } else {
      api.addGoal(goalData);
    }

    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initialGoal ? "Edit Strategic Goal" : "Create Strategic Goal"}
      sys="GOAL BREAKDOWN OS"
      wide
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" disabled={!name.trim()} onClick={handleSave}>
            {initialGoal ? "Save Changes" : "Create Goal"}
          </Button>
        </>
      }
    >
      <div className="stack" style={{ gap: 20 }}>
        {/* Goal Name */}
        <div className="field">
          <label className="field__label">Goal Title *</label>
          <input
            className="input"
            placeholder="e.g. Start a business, Hit 10k MRR, Run a half marathon"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </div>

        {/* Description & Purpose */}
        <div className="field">
          <label className="field__label">Description & Strategic Purpose</label>
          <textarea
            className="textarea"
            rows={2}
            placeholder="Why this outcome matters and what success looks like..."
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
        </div>

        {/* Category & Timeframe Row */}
        <div className="row-flex spread" style={{ gap: 12, flexWrap: "wrap" }}>
          <div className="field grow">
            <label className="field__label">Category</label>
            <select
              className="input"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="field grow">
            <label className="field__label">Timeframe</label>
            <select
              className="input"
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
            >
              <option value="short_term">Short-term (&lt; 3 Months)</option>
              <option value="medium_term">Medium-term (3–12 Months)</option>
              <option value="long_term">Long-term (1+ Years)</option>
            </select>
          </div>
        </div>

        {/* Target Date & Status Row */}
        <div className="row-flex spread" style={{ gap: 12, flexWrap: "wrap" }}>
          <div className="field grow">
            <label className="field__label">Target Completion Date</label>
            <input
              type="date"
              className="input mono"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
            />
          </div>

          <div className="field grow">
            <label className="field__label">Status</label>
            <select
              className="input"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="paused">Paused</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        {/* Concrete Next Action Callout */}
        <div
          className="field p3"
          style={{
            background: "rgba(108,201,154,0.06)",
            border: "1px solid rgba(108,201,154,0.2)",
            borderRadius: "var(--r-2)",
          }}
        >
          <label className="field__label status-ok">
            Concrete Next Action (Execution Step)
          </label>
          <input
            className="input"
            placeholder="e.g. Research 3 business ideas and compare demand"
            value={nextActionTitle}
            onChange={(e) => setNextActionTitle(e.target.value)}
          />
          <span className="t3 small mt1" style={{ display: "block" }}>
            This action will be available on your Today Command Center priorities.
          </span>
        </div>

        {/* Milestones Breakdown */}
        <div className="field">
          <div className="spread mb2">
            <label className="field__label" style={{ marginBottom: 0 }}>
              Milestone Breakdown ({milestones.length})
            </label>
            <button
              type="button"
              className="btn btn--ghost small"
              onClick={handleAddMilestone}
            >
              + Add Milestone
            </button>
          </div>

          <div className="stack" style={{ gap: 8 }}>
            {milestones.map((m) => (
              <div key={m.id} className="row-flex spread" style={{ gap: 8 }}>
                <input
                  className="input grow"
                  placeholder="Milestone step (e.g. Find a viable business idea)"
                  value={m.title}
                  onChange={(e) =>
                    handleUpdateMilestone(m.id, { title: e.target.value })
                  }
                />
                <button
                  type="button"
                  className="btn btn--ghost small"
                  style={{ color: "var(--neg)" }}
                  onClick={() => handleRemoveMilestone(m.id)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Linked Actions Multi-select */}
        <div className="field">
          <label className="field__label">Linked Recurring Actions</label>
          <div className="row-flex" style={{ gap: 6, flexWrap: "wrap" }}>
            {activeActions.map((a) => {
              const isLinked = linkedActionIds.includes(a.id);
              return (
                <button
                  key={a.id}
                  type="button"
                  className={`tag tag--interactive ${isLinked ? "tag--active" : ""}`}
                  onClick={() => toggleLinkedAction(a.id)}
                  style={{ cursor: "pointer" }}
                >
                  {isLinked ? "✓ " : "+ "}
                  {a.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
}
