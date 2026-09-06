import React, { useState } from "react";
import { useApp } from "../store/AppContext";
import { Tick } from "./primitives";
import { DynIcon } from "./iconset";
import { ACTION_TYPES } from "../data/constants";
import { fmt } from "../lib/format";
import { ActionCompletionModal } from "./ActionCompletionModal";

/* ------------------------------------------------------------
   A single action rendered as an interactive checklist row.
   Click toggles completion or opens completion input for measured/custom types.
   ------------------------------------------------------------ */
export function ActionToggleRow({ action, compact, onOpen }) {
  const { api } = useApp();
  const [modalOpen, setModalOpen] = useState(false);

  const type = ACTION_TYPES[action.type?.toUpperCase()] || ACTION_TYPES.BOOLEAN;
  const entry = action.entry;
  const isDone = action.done;

  const showValue =
    entry && ["quantity", "duration", "count"].includes(action.type)
      ? `${fmt(entry.value, 1)}${action.unit ? ` ${action.unit}` : ""}`
      : null;

  const needsModal =
    ["quantity", "duration", "count", "scale", "journal", "event"].includes(action.type) ||
    (action.customFields && action.customFields.length > 0);

  const toggle = (e) => {
    e.stopPropagation();
    if (onOpen) return onOpen(action);

    if (needsModal) {
      setModalOpen(true);
    } else {
      if (isDone) api.uncompleteAction(action);
      else api.completeAction(action);
    }
  };

  const time = action.schedule?.time;

  return (
    <>
      <button className={`check-row ${isDone ? "done" : ""}`} onClick={toggle}>
        <span className="check-row__glyph">
          <DynIcon name={action.icon} size={18} />
        </span>
        <span className="check-row__main">
          <span className="check-row__title" style={{ fontWeight: 520, display: "block" }}>
            {action.name}
          </span>
          <span className="syslabel" style={{ display: "flex", gap: 8, marginTop: 3 }}>
            <span>{type?.label}</span>
            {showValue && <span className="status-ok">{showValue}</span>}
            {time && <span>{time}</span>}
          </span>
        </span>
        {isDone ? (
          <Tick done />
        ) : (
          <span className="check-row__target mono t3" style={{ fontSize: 12 }}>
            {type?.id === "avoidance"
              ? "Respect"
              : type?.id === "boolean"
              ? "Do"
              : action.target
              ? `${fmt(action.target)}${action.unit ? " " + action.unit : ""}`
              : "Log"}
          </span>
        )}
      </button>

      {needsModal && (
        <ActionCompletionModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          action={action}
        />
      )}
    </>
  );
}
