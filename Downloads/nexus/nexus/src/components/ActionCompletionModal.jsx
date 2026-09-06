import React, { useState, useEffect } from "react";
import { useApp } from "../store/AppContext";
import { Modal } from "./Modal";
import { Button, Tick } from "./primitives";
import { DynIcon } from "./iconset";
import { ACTION_TYPES } from "../data/constants";
import { dateKey as todayKey } from "../lib/time";

export function ActionCompletionModal({
  open,
  onClose,
  action,
  dateKey = todayKey(),
}) {
  const { state, api } = useApp();

  const [val, setVal] = useState(1);
  const [scaleVal, setScaleVal] = useState(5);
  const [journalText, setJournalText] = useState("");
  const [note, setNote] = useState("");
  const [customFieldValues, setCustomFieldValues] = useState({});

  useEffect(() => {
    if (open && action) {
      const existing = (state.completionLog || []).find(
        (c) => c.actionId === action.id && c.dateKey === dateKey
      );

      if (existing) {
        setVal(existing.value ?? action.target ?? 1);
        setScaleVal(existing.value ?? 5);
        setJournalText(existing.payload?.text || existing.payload?.note || "");
        setNote(existing.payload?.note || "");
        setCustomFieldValues(existing.payload?.customFields || {});
      } else {
        setVal(action.target ?? 1);
        setScaleVal(5);
        setJournalText("");
        setNote("");
        setCustomFieldValues({});
      }
    }
  }, [open, action, dateKey, state.completionLog]);

  if (!action) return null;

  const t = action.type;
  const typeObj = ACTION_TYPES[t.toUpperCase()] || ACTION_TYPES.BOOLEAN;

  function handleSave() {
    let finalValue = Number(val) || 1;
    if (t === "boolean" || t === "avoidance") finalValue = 1;
    if (t === "scale") finalValue = Number(scaleVal);

    const payload = {
      note: note.trim(),
      text: journalText.trim(),
      customFields: customFieldValues,
    };

    api.completeAction(action, finalValue, {
      dateKey,
      payload,
      scaleValue: scaleVal,
    });

    onClose();
  }

  function handleUncomplete() {
    api.uncompleteAction(action, { dateKey });
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={action.name}
      sys="ACTION LOG"
      footer={
        <>
          <Button variant="ghost" onClick={handleUncomplete} style={{ color: "var(--neg)" }}>
            Clear Log
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Log Completion
          </Button>
        </>
      }
    >
      <div className="stack" style={{ gap: 20 }}>
        {/* Header Info */}
        <div className="row-flex" style={{ gap: 12 }}>
          <span
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: "var(--surface-3)",
              border: "1px solid var(--border)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--ok)",
            }}
          >
            <DynIcon name={action.icon} size={20} />
          </span>
          <div>
            <span className="syslabel">{typeObj.label} · {dateKey}</span>
            <div className="h2 mt1" style={{ margin: 0 }}>
              {action.name}
            </div>
          </div>
        </div>

        {/* Input depending on Type */}
        {(t === "quantity" || t === "duration" || t === "count") && (
          <div className="field">
            <div className="spread">
              <label className="field__label">
                {t === "duration" ? "Time Spent (Minutes)" : "Logged Amount"}
              </label>
              <span className="mono small status-ok">Target: {action.target} {action.unit}</span>
            </div>
            <div className="row-flex" style={{ gap: 8 }}>
              <button
                type="button"
                className="btn btn--secondary"
                style={{ width: 44 }}
                onClick={() => setVal((v) => Math.max(0, Number(v) - 1))}
              >
                -
              </button>

              <input
                type="number"
                min="0"
                step="any"
                className="input mono grow"
                value={val}
                onChange={(e) => setVal(e.target.value)}
                autoFocus
              />

              <button
                type="button"
                className="btn btn--secondary"
                style={{ width: 44 }}
                onClick={() => setVal((v) => Number(v) + 1)}
              >
                +
              </button>
            </div>
          </div>
        )}

        {t === "scale" && (
          <div className="field">
            <div className="spread">
              <label className="field__label">Subjective Rating (1–10)</label>
              <span className="mono status-ok" style={{ fontWeight: 600 }}>{scaleVal}/10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={scaleVal}
              onChange={(e) => setScaleVal(+e.target.value)}
              className="range"
            />
            <div className="spread small t3 mt1">
              <span>1 - Low</span>
              <span>10 - High</span>
            </div>
          </div>
        )}

        {t === "journal" && (
          <div className="field">
            <label className="field__label">Reflection Entry</label>
            <textarea
              className="textarea"
              rows={4}
              placeholder="Write your journal entry for this action..."
              value={journalText}
              onChange={(e) => setJournalText(e.target.value)}
              autoFocus
            />
          </div>
        )}

        {/* Notes */}
        {t !== "journal" && (
          <div className="field">
            <label className="field__label">Optional Note</label>
            <input
              className="input"
              placeholder="Add context or notes..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        )}

        {/* Attached Custom Fields */}
        {action.customFields && action.customFields.length > 0 && (
          <div className="field" style={{ paddingTop: 12, borderTop: "1px solid var(--hairline)" }}>
            <label className="field__label">Custom Structured Fields</label>
            <div className="stack" style={{ gap: 12 }}>
              {action.customFields.map((cf) => (
                <div key={cf.id} className="field">
                  <label className="field__label" style={{ fontSize: 12, color: "var(--text-2)" }}>
                    {cf.name}
                  </label>

                  {cf.type === "scale" ? (
                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="1"
                      className="range"
                      value={customFieldValues[cf.id] ?? 5}
                      onChange={(e) =>
                        setCustomFieldValues({
                          ...customFieldValues,
                          [cf.id]: +e.target.value,
                        })
                      }
                    />
                  ) : cf.type === "boolean" ? (
                    <label className="row-flex" style={{ gap: 8, cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={!!customFieldValues[cf.id]}
                        onChange={(e) =>
                          setCustomFieldValues({
                            ...customFieldValues,
                            [cf.id]: e.target.checked,
                          })
                        }
                      />
                      <span className="small t2">Yes / True</span>
                    </label>
                  ) : cf.type === "dropdown" ? (
                    <select
                      className="input"
                      value={customFieldValues[cf.id] || ""}
                      onChange={(e) =>
                        setCustomFieldValues({
                          ...customFieldValues,
                          [cf.id]: e.target.value,
                        })
                      }
                    >
                      <option value="">Select option...</option>
                      {(Array.isArray(cf.options) ? cf.options : []).map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      className="input"
                      type={cf.type === "number" ? "number" : "text"}
                      placeholder={`Enter ${cf.name}`}
                      value={customFieldValues[cf.id] || ""}
                      onChange={(e) =>
                        setCustomFieldValues({
                          ...customFieldValues,
                          [cf.id]: e.target.value,
                        })
                      }
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
