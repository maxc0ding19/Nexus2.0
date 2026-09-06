import React from "react";

/* NEXUS wordmark + mark */
export function LogoMark({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="#12151a" stroke="#232930" />
      <circle cx="16" cy="16" r="7.2" fill="none" stroke="#e6e8ec" strokeWidth="1.5" />
      <circle cx="16" cy="16" r="2.6" fill="#6cc99a" />
    </svg>
  );
}

export function Logo() {
  return (
    <div className="brand" style={{ display: "flex", alignItems: "center", gap: 11 }}>
      <LogoMark />
      <div style={{ lineHeight: 1 }}>
        <div
          style={{
            fontWeight: 700,
            letterSpacing: "0.34em",
            fontSize: 13.5,
            fontFamily: "var(--font-sans)",
          }}
        >
          NEXUS
        </div>
        <div className="syslabel" style={{ fontSize: 8.5, marginTop: 3 }}>
          Personal OS v1.0
        </div>
      </div>
    </div>
  );
}
