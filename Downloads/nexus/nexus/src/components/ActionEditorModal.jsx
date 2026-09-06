import React, { useState, useEffect } from "react";
import { useApp } from "../store/AppContext";
import { Modal } from "./Modal";
import { Button, StatusDot } from "./primitives";
import { DynIcon, ICONS } from "./iconset";
import { ACTION_TYPES, VALENCE, SCHEDULE, WEEKDAYS } from "../data/constants";

/* Supported custom field types for advanced user-defined schemas */
const CUSTOM_FIELD_TYPES = [
  { id: "text", label: "Text" },
  { id: "number", label: "Number" },
  { id: "boolean", label: "Boolean (Yes/No)" },
  { id: "scale", label: "Scale (1–10)" },
  { id: "datetime", label: "Date / Time" },
  { id: "dropdown", label: "Dropdown Select" },
  { id: "multiselect", label: "Multi-select" },
];

const AVAILABLE_ICONS = [
  "target", "spark", "book", "zap", "droplet", "phone", "pen", "shield",
  "moon", "waves", "eye", "briefcase", "calendar", "clock", "pulse",
  "compass", "flag", "refresh", "list", "chart", "grid", "settings",
];

export function ActionEditorModal({
  open,
  onClose,
  initialAction = null,
  onSaveCategoryClick = null,
}) {
  const { state, api } = useApp();
  const categories = state.categories || [];

  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [icon, setIcon] = useState("target");
  const [categoryId, setCategoryId] = useState(categories[0]?.id || "cat-focus");
  const [type, setType] = useState("boolean");
  const [target, setTarget] = useState(1);
  const [unit, setUnit] = useState("");
  const [freq, setFreq] = useState("daily");
  const [selectedDays, setSelectedDays] = useState([1, 2, 3, 4, 5]); // Mon-Fri default for custom
  const [weeklyTarget, setWeeklyTarget] = useState(3);
  const [time, setTime] = useState("09:00");
  const [valence, setValence] = useState("positive");
  const [priority, setPriority] = useState("normal");
  const [notes, setNotes] = useState("");
  const [analytics, setAnalytics] = useState(true);
  const [recovery, setRecovery] = useState(false);
  const [customFields, setCustomFields] = useState([]);

  // Sync state when modal opens or initialAction changes
  useEffect(() => {
    if (open) {
      if (initialAction) {
        setName(initialAction.name || "");
        setDesc(initialAction.desc || "");
        setIcon(initialAction.icon || "target");
        setCategoryId(initialAction.categoryId || categories[0]?.id || "");
        setType(initialAction.type || "boolean");
        setTarget(initialAction.target ?? 1);
        setUnit(initialAction.unit || "");
        setFreq(initialAction.schedule?.freq || "daily");
        setSelectedDays(initialAction.schedule?.days || [1, 2, 3, 4, 5]);
        setWeeklyTarget(initialAction.schedule?.weeklyTarget || 3);
        setTime(initialAction.schedule?.time || "09:00");
        setValence(initialAction.valence || "positive");
        setPriority(initialAction.priority || "normal");
        setNotes(initialAction.notes || "");
        setAnalytics(initialAction.tracking?.analytics !== false);
        setRecovery(initialAction.tracking?.recovery === true);
        setCustomFields(initialAction.customFields || []);
      } else {
        setName("");
        setDesc("");
        setIcon("target");
        setCategoryId(categories[0]?.id || "");
        setType("boolean");
        setTarget(1);
        setUnit("");
        setFreq("daily");
        setSelectedDays([1, 2, 3, 4, 5]);
        setWeeklyTarget(3);
        setTime("09:00");
        setValence("positive");
        setPriority("normal");
        setNotes("");
        setAnalytics(true);
        setRecovery(false);
        setCustomFields([]);
      }
    }
  }, [open, initialAction, categories]);

  function handleAddCustomField() {
    setCustomFields([
      ...customFields,
      {
        id: `cf-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`,
        name: "",
        type: "text",
        options: "",
        required: false,
      },
    ]);
  }

  function handleUpdateCustomField(id, patch) {
    setCustomFields(
      customFields.map((cf) => (cf.id === id ? { ...cf, ...patch } : cf))
    );
  }

  function handleRemoveCustomField(id) {
    setCustomFields(customFields.filter((cf) => cf.id !== id));
  }

  function handleSave() {
    if (!name.trim()) return;

    const actionData = {
      name: name.trim(),
      desc: desc.trim(),
      icon,
      categoryId,
      type,
      target: Number(target) || 1,
      unit: unit.trim(),
      valence,
      priority,
      notes: notes.trim(),
      schedule: {
        freq,
        time,
        ...(freq === "custom" ? { days: selectedDays } : {}),
        ...(freq === "weekly_target" ? { weeklyTarget: Number(weeklyTarget) } : {}),
      },
      tracking: {
        analytics,
        recovery,
      },
      customFields: customFields.map((cf) => ({
        ...cf,
        name: cf.name.trim() || "Untitled Field",
        options: typeof cf.options === "string"
          ? cf.options.split(",").map((s) => s.trim()).filter(Boolean)
          : cf.options,
      })),
    };

    if (initialAction?.id) {
      api.updateAction(initialAction.id, actionData);
    } else {
      api.addAction(actionData);
    }

    onClose();
  }

  const selectedTypeObj = ACTION_TYPES[type.toUpperCase()] || ACTION_TYPES.BOOLEAN;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initialAction ? "Edit Action" : "Create Action"}
      sys="ACTION BUILDER"
      wide
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" disabled={!name.trim()} onClick={handleSave}>
            {initialAction ? "Save Changes" : "Create Action"}
          </Button>
        </>
      }
    >
      <div className="stack" style={{ gap: 20 }}>
        {/* Name & Icon Row */}
        <div className="row-flex spread" style={{ gap: 12, alignItems: "flex-end" }}>
          <div className="field grow">
            <label className="field__label">Action Name *</label>
            <input
              className="input"
              placeholder="e.g. Read 30 minutes, Phone Cutoff"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="field">
            <label className="field__label">Icon</label>
            <div className="seg" style={{ padding: 4 }}>
              <button
                type="button"
                className="seg__btn is-active row-flex"
                style={{ padding: "6px 12px", gap: 6 }}
              >
                <DynIcon name={icon} size={16} />
                <span className="mono small">{icon}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Icon Picker Strip */}
        <div className="field">
          <span className="field__label">Select Icon</span>
          <div className="row-flex" style={{ gap: 6, flexWrap: "wrap" }}>
            {AVAILABLE_ICONS.map((ic) => (
              <button
                key={ic}
                type="button"
                className={`tag tag--interactive ${icon === ic ? "tag--active" : ""}`}
                onClick={() => setIcon(ic)}
                style={{ padding: 6, cursor: "pointer" }}
              >
                <DynIcon name={ic} size={16} />
              </button>
            ))}
          </div>
        </div>

        {/* Category & Valence */}
        <div className="row-flex spread" style={{ gap: 12, flexWrap: "wrap" }}>
          <div className="field grow">
            <div className="spread">
              <label className="field__label">Category</label>
              {onSaveCategoryClick && (
                <button
                  type="button"
                  className="btn btn--ghost small"
                  style={{ padding: 0 }}
                  onClick={onSaveCategoryClick}
                >
                  + Manage Categories
                </button>
              )}
            </div>
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
            <label className="field__label">Behavior Classification (Valence)</label>
            <select
              className="input"
              value={valence}
              onChange={(e) => setValence(e.target.value)}
            >
              <option value="positive">Positive / Proactive habit</option>
              <option value="negative">Reduction / Boundary to respect</option>
              <option value="neutral">Neutral / Context tracking</option>
            </select>
          </div>
        </div>

        {/* Action Type Selector */}
        <div className="field">
          <label className="field__label">Action Type</label>
          <div className="seg" style={{ flexWrap: "wrap", height: "auto" }}>
            {Object.values(ACTION_TYPES).map((t) => (
              <button
                key={t.id}
                type="button"
                className={`seg__btn ${type === t.id ? "is-active" : ""}`}
                style={{ padding: "8px 12px", fontSize: 12 }}
                onClick={() => {
                  setType(t.id);
                  if (t.id === "duration" && !unit) setUnit("min");
                  if (t.id === "quantity" && !unit) setUnit("units");
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
          <span className="t3 small mt1" style={{ display: "block" }}>
            {selectedTypeObj.desc}
          </span>
        </div>

        {/* Progressive Disclosure: Settings relevant ONLY to selected action type */}
        {(type === "quantity" || type === "duration" || type === "count") && (
          <div className="row-flex spread" style={{ gap: 12 }}>
            <div className="field grow">
              <label className="field__label">
                {type === "duration" ? "Target Duration (Minutes)" : "Target Value"}
              </label>
              <input
                type="number"
                min="1"
                className="input mono"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
              />
            </div>

            {type !== "duration" && (
              <div className="field grow">
                <label className="field__label">Unit (Optional)</label>
                <input
                  className="input"
                  placeholder="e.g. L, pages, reps, km"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                />
              </div>
            )}
          </div>
        )}

        {/* Schedule & Frequency */}
        <div className="field">
          <label className="field__label">Schedule & Frequency</label>
          <div className="seg mb2">
            {[
              { id: "daily", label: "Daily" },
              { id: "weekdays", label: "Weekdays" },
              { id: "weekends", label: "Weekends" },
              { id: "custom", label: "Custom Days" },
              { id: "weekly_target", label: "Weekly Target" },
              { id: "manual", label: "Manual" },
            ].map((s) => (
              <button
                key={s.id}
                type="button"
                className={`seg__btn ${freq === s.id ? "is-active" : ""}`}
                onClick={() => setFreq(s.id)}
              >
                {s.label}
              </button>
            ))}
          </div>

          {freq === "custom" && (
            <div className="row-flex" style={{ gap: 6, flexWrap: "wrap", marginTop: 8 }}>
              {WEEKDAYS.map((w) => {
                const active = selectedDays.includes(w.n);
                return (
                  <button
                    key={w.n}
                    type="button"
                    className={`tag tag--interactive ${active ? "tag--active" : ""}`}
                    onClick={() => {
                      if (active) setSelectedDays(selectedDays.filter((d) => d !== w.n));
                      else setSelectedDays([...selectedDays, w.n]);
                    }}
                    style={{ padding: "6px 12px", cursor: "pointer" }}
                  >
                    {w.s}
                  </button>
                );
              })}
            </div>
          )}

          {freq === "weekly_target" && (
            <div className="row-flex" style={{ gap: 12, alignItems: "center", marginTop: 8 }}>
              <span className="small t2">Target completions per week:</span>
              <input
                type="number"
                min="1"
                max="7"
                className="input mono"
                style={{ width: 80 }}
                value={weeklyTarget}
                onChange={(e) => setWeeklyTarget(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Time of Day / Target Schedule Time */}
        <div className="row-flex spread" style={{ gap: 12 }}>
          <div className="field grow">
            <label className="field__label">Scheduled Time (Optional)</label>
            <input
              type="time"
              className="input mono"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>

          <div className="field grow">
            <label className="field__label">Priority</label>
            <select
              className="input"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="normal">Normal Priority</option>
              <option value="high">High Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>
        </div>

        {/* Description & Notes */}
        <div className="field">
          <label className="field__label">Description & Purpose</label>
          <input
            className="input"
            placeholder="Why this action matters to your system..."
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
        </div>

        <div className="field">
          <label className="field__label">Private Notes</label>
          <textarea
            className="textarea"
            placeholder="Execution instructions or guidance..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {/* Tracking & Inclusion Flags */}
        <div className="field">
          <label className="field__label">System Participation</label>
          <div className="stack" style={{ gap: 10 }}>
            <label className="row-flex spread" style={{ cursor: "pointer" }}>
              <span className="small t2">Include in Analytics</span>
              <input
                type="checkbox"
                checked={analytics}
                onChange={(e) => setAnalytics(e.target.checked)}
              />
            </label>
            <label className="row-flex spread" style={{ cursor: "pointer" }}>
              <span className="small t2">Include in Recovery Analysis</span>
              <input
                type="checkbox"
                checked={recovery}
                onChange={(e) => setRecovery(e.target.checked)}
              />
            </label>
          </div>
        </div>

        {/* Custom Fields Builder Section */}
        <div className="field" style={{ paddingTop: 12, borderTop: "1px solid var(--hairline)" }}>
          <div className="spread mb2">
            <label className="field__label" style={{ marginBottom: 0 }}>
              Custom Fields Builder ({customFields.length})
            </label>
            <button
              type="button"
              className="btn btn--ghost small"
              onClick={handleAddCustomField}
            >
              + Add Custom Field
            </button>
          </div>

          {customFields.length === 0 ? (
            <p className="t3 small mb0">
              Attach custom structured fields (e.g., location, difficulty rating, work type) to collect during completion.
            </p>
          ) : (
            <div className="stack" style={{ gap: 12 }}>
              {customFields.map((cf) => (
                <div
                  key={cf.id}
                  className="stack p2"
                  style={{
                    gap: 8,
                    background: "var(--surface-1)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--r-2)",
                  }}
                >
                  <div className="row-flex spread" style={{ gap: 8 }}>
                    <input
                      className="input grow"
                      placeholder="Field Name (e.g. Energy Level, Focus Note)"
                      value={cf.name}
                      onChange={(e) =>
                        handleUpdateCustomField(cf.id, { name: e.target.value })
                      }
                    />
                    <select
                      className="input"
                      style={{ width: 150 }}
                      value={cf.type}
                      onChange={(e) =>
                        handleUpdateCustomField(cf.id, { type: e.target.value })
                      }
                    >
                      {CUSTOM_FIELD_TYPES.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="btn btn--ghost small"
                      style={{ color: "var(--neg)", padding: "4px 8px" }}
                      onClick={() => handleRemoveCustomField(cf.id)}
                    >
                      ✕
                    </button>
                  </div>

                  {(cf.type === "dropdown" || cf.type === "multiselect") && (
                    <input
                      className="input"
                      placeholder="Comma-separated options (e.g. Home, Office, Gym)"
                      value={
                        Array.isArray(cf.options) ? cf.options.join(", ") : cf.options || ""
                      }
                      onChange={(e) =>
                        handleUpdateCustomField(cf.id, { options: e.target.value })
                      }
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
