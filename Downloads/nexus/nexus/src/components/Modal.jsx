import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { IconClose } from "./icons";
import { SysLabel } from "./primitives";

/* Bottom-sheet style modal for mobile, centered dialog on desktop. */
export function Modal({ open, onClose, title, sys, children, footer, wide }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;
  return createPortal(
    <div className="modal-backdrop fade-in" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${wide ? "modal--wide" : ""}`} role="dialog" aria-modal="true">
        <div className="modal__head">
          <div>
            {sys && <SysLabel>{sys}</SysLabel>}
            <h2 className="h2 mt1">{title}</h2>
          </div>
          <button className="btn btn--ghost btn--icon" onClick={onClose} aria-label="Close">
            <IconClose size={20} />
          </button>
        </div>
        <div className="modal__body">{children}</div>
        {footer && <div className="modal__foot">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}
