import React, { useState, useEffect } from "react";
import { useApp } from "../store/AppContext";
import { Modal } from "./Modal";
import { Button } from "./primitives";
import { dateKey } from "../lib/time";

export function JournalEditorModal({ open, onClose, initialEntry = null }) {
  const { state, api } = useApp();

  const [targetDate, setTargetDate] = useState(dateKey());
  const [text, setText] = useState("");
  const [mood, setMood] = useState(7);
  const [energy, setEnergy] = useState(7);
  const [tagsStr, setTagsStr] = useState("");
  const [linkedGoalId, setLinkedGoalId] = useState("");
  const [linkedActionId, setLinkedActionId] = useState("");
  const [recoveryNote, setRecoveryNote] = useState("");

  const activeGoals = (state.goals || []).filter((g) => g.status === "active");
  const activeActions = (state.actions || []).filter((a) => !a.archived);

  useEffect(() => {
    if (open) {
      if (initialEntry) {
        setTargetDate(initialEntry.dateKey || dateKey());
        setText(initialEntry.text || "");
        setMood(initialEntry.mood ?? 7);
        setEnergy(initialEntry.energy ?? 7);
        setTagsStr((initialEntry.tags || []).join(" "));
        setLinkedGoalId(initialEntry.linkedGoalId || "");
        setLinkedActionId(initialEntry.linkedActionId || "");
        setRecoveryNote(initialEntry.recoveryNote || "");
      } else {
        setTargetDate(dateKey());
        setText("");
        setMood(7);
        setEnergy(7);
        setTagsStr("#focus #reflection");
        setLinkedGoalId("");
        setLinkedActionId("");
        setRecoveryNote("");
      }
    }
  }, [open, initialEntry]);

  function handleSave() {
    if (!text.trim()) return;

    const parsedTags = tagsStr
      .split(/[\s,]+/)
      .map((t) => t.trim())
      .filter(Boolean)
      .map((t) => (t.startsWith("#") ? t : `#${t}`));

    const entryData = {
      ...(initialEntry?.id ? { id: initialEntry.id } : {}),
      dateKey: targetDate,
      text: text.trim(),
      mood: Number(mood),
      energy: Number(energy),
      tags: parsedTags,
      linkedGoalId,
      linkedActionId,
      recoveryNote: recoveryNote.trim(),
    };

    api.saveJournalEntry(entryData);
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initialEntry ? "Edit Reflection" : "Journal Entry"}
      sys="CALM REFLECTION"
      wide
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" disabled={!text.trim()} onClick={handleSave}>
            Save Reflection
          </Button>
        </>
      }
    >
      <div className="stack" style={{ gap: 20 }}>
        {/* Date Key */}
        <div className="field" style={{ maxWidth: 200 }}>
          <label className="field__label">Date</label>
          <input
            type="date"
            className="input mono"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
          />
        </div>

        {/* Free-form Writing */}
        <div className="field">
          <label className="field__label">Reflection Entry</label>
          <textarea
            className="textarea"
            rows={6}
            placeholder="Write your reflection entry..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            autoFocus
          />
        </div>

        {/* Mood & Energy Sliders */}
        <div className="row-flex spread" style={{ gap: 12, flexWrap: "wrap" }}>
          <div className="field grow">
            <div className="spread">
              <label className="field__label">Mood Rating (1–10)</label>
              <span className="mono status-ok">{mood}/10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              className="range"
              value={mood}
              onChange={(e) => setMood(+e.target.value)}
            />
          </div>

          <div className="field grow">
            <div className="spread">
              <label className="field__label">Energy Rating (1–10)</label>
              <span className="mono status-ok">{energy}/10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              className="range"
              value={energy}
              onChange={(e) => setEnergy(+e.target.value)}
            />
          </div>
        </div>

        {/* Tags */}
        <div className="field">
          <label className="field__label">Tags (Space separated)</label>
          <input
            className="input"
            placeholder="#focus #recovery #breakthrough"
            value={tagsStr}
            onChange={(e) => setTagsStr(e.target.value)}
          />
        </div>

        {/* Linked Goal / Action */}
        <div className="row-flex spread" style={{ gap: 12, flexWrap: "wrap" }}>
          <div className="field grow">
            <label className="field__label">Linked Goal (Optional)</label>
            <select
              className="input"
              value={linkedGoalId}
              onChange={(e) => setLinkedGoalId(e.target.value)}
            >
              <option value="">None</option>
              {activeGoals.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          <div className="field grow">
            <label className="field__label">Linked Action (Optional)</label>
            <select
              className="input"
              value={linkedActionId}
              onChange={(e) => setLinkedActionId(e.target.value)}
            >
              <option value="">None</option>
              {activeActions.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Recovery Reflection */}
        <div className="field">
          <label className="field__label">Recovery Note (Private)</label>
          <input
            className="input"
            placeholder="Optional context regarding urges, fatigue, or boundaries..."
            value={recoveryNote}
            onChange={(e) => setRecoveryNote(e.target.value)}
          />
        </div>
      </div>
    </Modal>
  );
}
