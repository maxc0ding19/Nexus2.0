import React, { useEffect, useState } from "react";
import { SysLabel } from "./primitives";

/* ------------------------------------------------------------
   Shared screen building blocks
   ------------------------------------------------------------ */

export function ScreenHeader({ sys, title, sub, right, children }) {
  return (
    <header className="screen-header">
      <div className="screen-header__top">
        {sys && <SysLabel>{sys}</SysLabel>}
        {right}
      </div>
      <h1 className="h1 mt1" style={{ letterSpacing: "-0.02em" }}>{title}</h1>
      {sub && <p className="t2 mt1 small" style={{ maxWidth: 560 }}>{sub}</p>}
      {children}
    </header>
  );
}

/* A tiny control-panel chip: label + mono value */
export function Stat({ label, value, tone, icon }) {
  return (
    <div className="stat">
      <div className="syslabel" style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {icon}
        {label}
      </div>
      <div
        className={`mono ${tone ? `status-${tone}` : ""}`}
        style={{ fontSize: 20, fontWeight: 600, marginTop: 6 }}
      >
        {value}
      </div>
    </div>
  );
}

/* Live ticking clock in system-mono */
export function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000 * 20);
    return () => clearInterval(t);
  }, []);
  return now;
}

/* Very small labelled metric with a sparkline */
export function MiniMetric({ label, value, spark, tone = "neutral", unit }) {
  return (
    <div className="mini" style={{ minWidth: 0 }}>
      <div className="syslabel truncate">{label}</div>
      <div className="spread mt1">
        <span className="mono" style={{ fontSize: 17, fontWeight: 600 }}>
          {value}
        </span>
        {unit && <span className="t3 mono small">{unit}</span>}
      </div>
      {spark && spark.length > 1 && (
        <svg
          width="100%"
          height="20"
          viewBox="0 0 90 24"
          preserveAspectRatio="none"
          className="mt1"
          style={{ overflow: "visible" }}
        >
          <path d={spark} fill="none" stroke={`var(--${tone})`} strokeWidth="1.5" strokeLinecap="round" opacity="0.85" />
        </svg>
      )}
    </div>
  );
}
