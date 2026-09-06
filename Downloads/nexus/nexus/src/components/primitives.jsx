import React from "react";

/* ------------------------------------------------------------
   NEXUS low-level UI primitives
   ------------------------------------------------------------ */

export function SysLabel({ children, className = "", as: Tag = "div", ...rest }) {
  return (
    <Tag className={`syslabel ${className}`} {...rest}>
      {children}
    </Tag>
  );
}

export function Panel({ glass, elev, pad, className = "", children, ...rest }) {
  const cls = [
    "panel",
    glass ? "panel--glass" : "",
    elev ? "panel--elev" : "",
    pad ? "panel-pad" : "",
    className,
  ]
    .join(" ")
    .trim();
  return (
    <div className={cls} {...rest}>
      {children}
    </div>
  );
}

export function StatusDot({ tone = "muted", pulse }) {
  return <span className={`dot dot--${tone} ${pulse ? "pulse" : ""}`} />;
}

export function Bar({ value = 0, tone = "neutral", height }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="bar" style={{ height }}>
      <div className={`bar__fill bar__fill--${tone}`} style={{ width: `${v}%` }} />
    </div>
  );
}

export function Tick({ done }) {
  return (
    <span className={`tick ${done ? "tick--done" : ""}`}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4.5 12.5 9.5 17.5 19.5 6.5" />
      </svg>
    </span>
  );
}

export function Button({ children, variant = "", size = "", className = "", ...rest }) {
  return (
    <button
      className={`btn ${variant ? `btn--${variant}` : ""} ${size ? `btn--${size}` : ""} ${className}`.trim()}
      {...rest}
    >
      {children}
    </button>
  );
}

/* A circular progress ring for the primary "status" readout. */
export function Ring({ value = 0, size = 84, stroke = 5, tone = "neutral", children }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (Math.min(100, Math.max(0, value)) / 100) * c;
  return (
    <div className="ring" style={{ width: size, height: size, position: "relative" }}>
      <svg width={size} height={size}>
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="var(--surface-4)" strokeWidth={stroke}
        />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={`var(--${tone})`} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={off}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 1s var(--ease)" }}
        />
      </svg>
      <div className="ring__inner">{children}</div>
    </div>
  );
}

export function SectionHeader({ label, action, right, title }) {
  return (
    <div className="section-head">
      <div>
        <SysLabel>{label}</SysLabel>
        {title && <h2 className="mt1">{title}</h2>}
      </div>
      {right}
    </div>
  );
}

export function Pill({ children, mono }) {
  return <span className={`tag ${mono ? "tag--mono" : ""}`}>{children}</span>;
}

export function Switch({ on, onChange, disabled }) {
  return (
    <button
      type="button"
      className={`switch ${on ? "switch--on" : ""}`}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        onChange && onChange(!on);
      }}
      aria-pressed={on}
    >
      <span className="switch__knob" />
    </button>
  );
}

export function Empty({ icon, title, body, action }) {
  return (
    <div className="empty">
      {icon && (
        <div style={{ color: "var(--text-4)", marginBottom: 4 }}>{icon}</div>
      )}
      <div className="h2">{title}</div>
      {body && <div className="small t2" style={{ maxWidth: 380 }}>{body}</div>}
      {action}
    </div>
  );
}

export function Skeleton({ width = "100%", height = 20, style, className = "" }) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width, height, ...style }}
    />
  );
}
