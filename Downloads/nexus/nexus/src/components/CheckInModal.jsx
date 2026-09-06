import React, { useState, useEffect } from "react";
import { useApp } from "../store/AppContext";
import { Modal } from "./Modal";
import { Button, StatusDot } from "./primitives";
import { DynIcon } from "./iconset";
import {
  FACTOR_SLIDERS,
  TIMES_OF_DAY,
  URGE_SCALE,
  RECOVERY_EVENT_TYPES,
  DEFAULT_REDIRECTION_STRATEGIES,
} from "../data/constants";
import { dateKey } from "../lib/time";

/* Fast, non-shame-based recovery logger & check-in. Treats setbacks as data. */
export function CheckInModal({
  open,
  onClose,
  initialEventType = "checkin",
  initialEntry = null,
  defaultDateKey = null,
}) {
  const { api } = useApp();

  const [eventType, setEventType] = useState(initialEventType);
  const [difficulty, setDifficulty] = useState(4);
  const [redirected, setRedirected] = useState(true);
  const [timeOfDay, setTimeOfDay] = useState("night");
  const [context, setContext] = useState("");
  const [beforehand, setBeforehand] = useState("");
  const [helped, setHelped] = useState("");
  const [alone, setAlone] = useState(false);
  const [targetDate, setTargetDate] = useState(defaultDateKey || dateKey());
  const [factors, setFactors] = useState(() =>
    Object.fromEntries(FACTOR_SLIDERS.map((f) => [f.id, 5]))
  );
  const [showFactors, setShowFactors] = useState(false);

  // Sync state when modal opens or initialEntry/initialEventType changes
  useEffect(() => {
    if (open) {
      if (initialEntry) {
        setEventType(initialEntry.eventType || "checkin");
        setDifficulty(initialEntry.difficulty ?? 4);
        setRedirected(initialEntry.redirected !== false);
        setTimeOfDay(initialEntry.timeOfDay || "night");
        setContext(initialEntry.context || initialEntry.note || "");
        setBeforehand(initialEntry.beforehand || "");
        setHelped(initialEntry.whatHelped || "");
        setTargetDate(initialEntry.dateKey || dateKey());
        setAlone(initialEntry.factors?.alone || initialEntry.alone || false);
        if (initialEntry.factors) {
          setFactors((prev) => ({ ...prev, ...initialEntry.factors }));
        }
      } else {
        setEventType(initialEventType);
        const defaultRedirect = initialEventType !== "setback";
        setRedirected(defaultRedirect);
        setDifficulty(initialEventType === "setback" ? 8 : initialEventType === "urge" ? 6 : 3);
        setTimeOfDay(getSystemTimeOfDay());
        setContext("");
        setBeforehand("");
        setHelped("");
        setAlone(false);
        setTargetDate(defaultDateKey || dateKey());
      }
    }
  }, [open, initialEntry, initialEventType, defaultDateKey]);

  function getSystemTimeOfDay() {
    const h = new Date().getHours();
    if (h < 12) return "morning";
    if (h < 17) return "afternoon";
    if (h < 21) return "evening";
    return "night";
  }

  function handleSelectStrategy(strat) {
    if (!helped) {
      setHelped(strat);
    } else if (helped.includes(strat)) {
      setHelped(helped.replace(strat, "").replace(/,\s*,/g, ",").replace(/^,\s*|\s*,$/g, ""));
    } else {
      setHelped(`${helped}, ${strat}`);
    }
  }

  function save() {
    const entryData = {
      ...(initialEntry?.id ? { id: initialEntry.id } : {}),
      dateKey: targetDate,
      eventType,
      timeOfDay,
      difficulty,
      redirected,
      context,
      beforehand,
      whatHelped: redirected && helped ? helped : null,
      factors: {
        ...factors,
        alone,
      },
    };

    api.addRecovery(entryData);
    onClose();
  }

  const selectedTypeObj = RECOVERY_EVENT_TYPES.find((t) => t.id === eventType) || RECOVERY_EVENT_TYPES[0];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initialEntry ? "Edit Recovery Log" : "Log Recovery Event"}
      sys="RECOVERY LOG"
      wide
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={save}>
            {initialEntry ? "Update Entry" : "Save Entry"}
          </Button>
        </>
      }
    >
      <div className="stack" style={{ gap: 20 }}>
        {/* Event Type Selector */}
        <div className="field">
          <span className="field__label">Event Type</span>
          <div className="seg" style={{ flexWrap: "wrap", height: "auto" }}>
            {RECOVERY_EVENT_TYPES.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`seg__btn ${eventType === t.id ? "is-active" : ""}`}
                style={{ padding: "8px 12px", fontSize: 13 }}
                onClick={() => {
                  setEventType(t.id);
                  if (t.id === "setback") setRedirected(false);
                  else if (t.id === "redirection") setRedirected(true);
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

        {/* Date and Time of Day */}
        <div className="row-flex spread" style={{ gap: 12, flexWrap: "wrap" }}>
          <div className="field grow">
            <span className="field__label">Date</span>
            <input
              type="date"
              className="input mono"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
            />
          </div>

          <div className="field grow">
            <span className="field__label">Time of day</span>
            <div className="seg">
              {TIMES_OF_DAY.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={`seg__btn ${timeOfDay === t.id ? "is-active" : ""}`}
                  onClick={() => setTimeOfDay(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Difficulty Slider */}
        <div className="field">
          <div className="spread">
            <span className="field__label">Urge / Difficulty Level</span>
            <span
              className={`mono ${
                difficulty >= 7
                  ? "status-neg"
                  : difficulty >= 5
                  ? "status-warn"
                  : "status-ok"
              }`}
              style={{ fontWeight: 600 }}
            >
              {difficulty}/10
            </span>
          </div>
          <input
            type="range"
            min={URGE_SCALE.min}
            max={URGE_SCALE.max}
            step={1}
            value={difficulty}
            onChange={(e) => setDifficulty(+e.target.value)}
            className="range"
          />
          <div className="spread">
            <span className="t3 small">{URGE_SCALE.low}</span>
            <span className="t3 small">{URGE_SCALE.high}</span>
          </div>
        </div>

        {/* Redirected Toggle */}
        <button
          type="button"
          className={`choice ${redirected ? "choice--on" : ""}`}
          onClick={() => setRedirected((v) => !v)}
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            width: "100%",
            textAlign: "left",
          }}
        >
          <span className={`tick ${redirected ? "tick--done" : ""}`}>
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4.5 12.5 9.5 17.5 19.5 6.5" />
            </svg>
          </span>
          <span>
            <span style={{ display: "block", fontWeight: 550 }}>
              {redirected ? "Successful Redirection" : "Lapse / Setback Occurred"}
            </span>
            <span className="t3 small">
              {redirected
                ? "I redirected away from the urge or maintained my commitment."
                : "A setback occurred. Logged objectively as data to identify patterns."}
            </span>
          </span>
        </button>

        {/* What Helped (Strategies) */}
        {redirected && (
          <div className="field">
            <span className="field__label">What helped you redirect?</span>
            <div
              className="row-flex"
              style={{ gap: 6, flexWrap: "wrap", marginBottom: 8 }}
            >
              {DEFAULT_REDIRECTION_STRATEGIES.map((strat) => {
                const isActive = helped.includes(strat);
                return (
                  <button
                    key={strat}
                    type="button"
                    className={`tag tag--interactive ${isActive ? "tag--active" : ""}`}
                    onClick={() => handleSelectStrategy(strat)}
                    style={{
                      cursor: "pointer",
                      borderColor: isActive ? "var(--ok)" : "var(--border)",
                      color: isActive ? "var(--ok)" : "var(--text-2)",
                    }}
                  >
                    {isActive ? "✓ " : "+ "}
                    {strat}
                  </button>
                );
              })}
            </div>
            <input
              className="input"
              placeholder="Custom response strategy..."
              value={helped}
              onChange={(e) => setHelped(e.target.value)}
            />
          </div>
        )}

        {/* Were you alone? */}
        <div className="field">
          <label
            className="row-flex spread"
            style={{ cursor: "pointer", userSelect: "none" }}
          >
            <span className="field__label" style={{ marginBottom: 0 }}>
              Were you alone when this occurred?
            </span>
            <div className="row-flex" style={{ gap: 8 }}>
              <span className="mono small t3">{alone ? "Yes" : "No"}</span>
              <input
                type="checkbox"
                checked={alone}
                onChange={(e) => setAlone(e.target.checked)}
                style={{ cursor: "pointer" }}
              />
            </div>
          </label>
        </div>

        {/* What was happening beforehand */}
        <div className="field">
          <span className="field__label">What was happening beforehand?</span>
          <input
            className="input"
            placeholder="e.g. Late night working, high fatigue, scrolling social media"
            value={beforehand}
            onChange={(e) => setBeforehand(e.target.value)}
          />
        </div>

        {/* Collapsible Contextual Factors Slider */}
        <div className="field">
          <div className="spread">
            <button
              type="button"
              className="btn btn--ghost small"
              onClick={() => setShowFactors(!showFactors)}
              style={{ padding: 0, color: "var(--text-2)" }}
            >
              {showFactors ? "▼ Hide Contextual Factors" : "▶ Add Contextual Factors (Sleep, Stress, Screen, Mood)"}
            </button>
          </div>

          {showFactors && (
            <div className="stack mt3" style={{ gap: 12, padding: "12px", background: "var(--surface-1)", borderRadius: "var(--r-2)" }}>
              {FACTOR_SLIDERS.map((f) => (
                <FactorRow
                  key={f.id}
                  f={f}
                  value={factors[f.id]}
                  onChange={(v) =>
                    setFactors((s) => ({ ...s, [f.id]: v }))
                  }
                />
              ))}
            </div>
          )}
        </div>

        {/* Context / Notes */}
        <div className="field">
          <span className="field__label">Context Notes</span>
          <textarea
            className="textarea"
            placeholder="Optional reflection or context..."
            value={context}
            onChange={(e) => setContext(e.target.value)}
          />
        </div>
      </div>
    </Modal>
  );
}

function FactorRow({ f, value, onChange }) {
  const Icon = DynIcon;
  return (
    <div>
      <div className="spread" style={{ marginBottom: 4 }}>
        <span className="small t2 row-flex" style={{ gap: 6 }}>
          <Icon name={f.icon} size={14} className="t3" /> {f.label}
        </span>
        <span className="mono small t3">{value}/10</span>
      </div>
      <input
        type="range"
        min={f.min}
        max={f.max}
        step={1}
        value={value}
        onChange={(e) => onChange(+e.target.value)}
        className="range"
        style={{ width: "100%" }}
      />
    </div>
  );
}
