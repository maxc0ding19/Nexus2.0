import React, { useState } from "react";
import { useApp } from "../store/AppContext";
import { Modal } from "./Modal";
import { Button } from "./primitives";

export function CaptureIdeaModal({ open, onClose }) {
  const { state, api } = useApp();
  const categories = state.categories || [];

  const [title, setTitle] = useState("");
  const [source, setSource] = useState("");
  const [why, setWhy] = useState("");
  const [actionTitle, setActionTitle] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id || "");
  const [actionType, setActionType] = useState("boolean");

  function handleSaveIdeaOnly() {
    if (!title.trim()) return;

    api.addCapturedIdea({
      title: title.trim(),
      source: source.trim(),
      why: why.trim(),
      actionTitle: actionTitle.trim(),
      categoryId,
      actionType,
    });

    resetAndClose();
  }

  function handleConvertToAction() {
    if (!title.trim() && !actionTitle.trim()) return;

    const actName = actionTitle.trim() || title.trim();

    api.addAction({
      name: actName,
      desc: source || why ? `Source: ${source || "Captured Idea"}. ${why || ""}` : "",
      type: actionType,
      categoryId: categoryId || categories[0]?.id || "cat-focus",
      target: 1,
      schedule: { freq: "daily" },
      valence: "positive",
      notes: why.trim(),
    });

    api.addCapturedIdea({
      title: title.trim() || actName,
      source: source.trim(),
      why: why.trim(),
      actionTitle: actName,
      status: "converted",
    });

    resetAndClose();
  }

  function resetAndClose() {
    setTitle("");
    setSource("");
    setWhy("");
    setActionTitle("");
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Capture Idea (Learn → Apply)"
      sys="CONSUMPTION GUARDRAIL"
      wide
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="secondary" disabled={!title.trim()} onClick={handleSaveIdeaOnly}>
            Save Idea
          </Button>
          <Button
            variant="primary"
            disabled={!title.trim() && !actionTitle.trim()}
            onClick={handleConvertToAction}
          >
            CONVERT TO ACTION ➔
          </Button>
        </>
      }
    >
      <div className="stack" style={{ gap: 16 }}>
        <p className="t2 small mb0">
          Convert self-improvement information directly into an executable action. Avoid collecting hundreds of ideas without implementing them.
        </p>

        {/* Idea Concept */}
        <div className="field">
          <label className="field__label">Idea / Insight Concept *</label>
          <input
            className="input"
            placeholder="e.g. Hard screen cutoff 60 minutes before bed"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />
        </div>

        {/* Source & Why it matters */}
        <div className="row-flex spread" style={{ gap: 12, flexWrap: "wrap" }}>
          <div className="field grow">
            <label className="field__label">Source / Origin</label>
            <input
              className="input"
              placeholder="e.g. Book: Why We Sleep, Article, Podcast"
              value={source}
              onChange={(e) => setSource(e.target.value)}
            />
          </div>

          <div className="field grow">
            <label className="field__label">Why It Matters</label>
            <input
              className="input"
              placeholder="e.g. Protects deep sleep and reduces urge friction"
              value={why}
              onChange={(e) => setWhy(e.target.value)}
            />
          </div>
        </div>

        {/* Convert to Action Field */}
        <div
          className="field p3"
          style={{
            background: "rgba(108,201,154,0.06)",
            border: "1px solid rgba(108,201,154,0.25)",
            borderRadius: "var(--r-2)",
          }}
        >
          <label className="field__label status-ok">
            Executable Action Name (Convert to Action)
          </label>
          <input
            className="input mt1"
            placeholder="e.g. Put phone in another room at 22:00"
            value={actionTitle}
            onChange={(e) => setActionTitle(e.target.value)}
          />

          <div className="row-flex spread mt2" style={{ gap: 12 }}>
            <div className="field grow" style={{ marginBottom: 0 }}>
              <label className="field__label" style={{ fontSize: 11 }}>Category</label>
              <select
                className="input"
                style={{ padding: "6px 10px" }}
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

            <div className="field grow" style={{ marginBottom: 0 }}>
              <label className="field__label" style={{ fontSize: 11 }}>Action Type</label>
              <select
                className="input"
                style={{ padding: "6px 10px" }}
                value={actionType}
                onChange={(e) => setActionType(e.target.value)}
              >
                <option value="boolean">Boolean (Done/Not Done)</option>
                <option value="duration">Duration (Minutes)</option>
                <option value="avoidance">Boundary / Avoidance</option>
                <option value="journal">Journal Reflection</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
