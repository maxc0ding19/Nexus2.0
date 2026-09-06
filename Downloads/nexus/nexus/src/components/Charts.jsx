import React, { useState } from "react";
import { SysLabel } from "./primitives";

/* ------------------------------------------------------------
   NEXUS Technical Visualization Suite (Pure React + SVG)
   No external dependencies. Dark glass theme, clean tooltips,
   responsive layouts, and zero-data empty states.
   ------------------------------------------------------------ */

/* 1. Interactive SVG Line / Area Chart */
export function LineChart({
  data = [],
  xKey = "dateLabel",
  yKey = "completionsCount",
  yKey2 = null,
  height = 180,
  strokeColor = "var(--ok)",
  strokeColor2 = "var(--info)",
  title = "",
}) {
  const [hoverIndex, setHoverIndex] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div className="empty" style={{ padding: "24px 0" }}>
        <p className="t3 small">NOT ENOUGH DATA for trend line visualization.</p>
      </div>
    );
  }

  const padding = { top: 20, right: 16, bottom: 28, left: 32 };
  const chartWidth = 500;
  const chartHeight = height;

  const yValues = data.map((d) => (d[yKey] != null ? Number(d[yKey]) : 0));
  const yValues2 = yKey2 ? data.map((d) => (d[yKey2] != null ? Number(d[yKey2]) : 0)) : [];
  const maxY = Math.max(1, ...yValues, ...yValues2);
  const minY = 0;

  const innerW = chartWidth - padding.left - padding.right;
  const innerH = chartHeight - padding.top - padding.bottom;

  const getX = (idx) => padding.left + (idx / Math.max(1, data.length - 1)) * innerW;
  const getY = (val) => padding.top + innerH - ((val - minY) / (maxY - minY)) * innerH;

  // Generate SVG path for primary line
  const points = data.map((d, i) => {
    const val = d[yKey] != null ? Number(d[yKey]) : 0;
    return `${getX(i)},${getY(val)}`;
  });
  const pathD = `M ${points.join(" L ")}`;

  // Secondary line if yKey2 provided
  let pathD2 = null;
  if (yKey2) {
    const points2 = data.map((d, i) => {
      const val = d[yKey2] != null ? Number(d[yKey2]) : 0;
      return `${getX(i)},${getY(val)}`;
    });
    pathD2 = `M ${points2.join(" L ")}`;
  }

  // Area path for subtle fill under primary line
  const areaD = `${pathD} L ${getX(data.length - 1)},${padding.top + innerH} L ${getX(0)},${padding.top + innerH} Z`;

  const hoverItem = hoverIndex != null ? data[hoverIndex] : null;

  return (
    <div style={{ width: "100%", position: "relative" }}>
      {/* Tooltip Overlay */}
      {hoverItem && (
        <div
          className="mono p2"
          style={{
            position: "absolute",
            top: 4,
            right: 8,
            background: "var(--surface-3)",
            border: "1px solid var(--border-strong)",
            borderRadius: "var(--r-2)",
            padding: "4px 10px",
            fontSize: 12,
            zIndex: 10,
            boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
          }}
        >
          <div style={{ color: "var(--text-3)" }}>{hoverItem[xKey] || hoverItem.dateKey}</div>
          <div style={{ color: strokeColor, fontWeight: 600 }}>
            {yKey}: {hoverItem[yKey] ?? "—"}
          </div>
          {yKey2 && (
            <div style={{ color: strokeColor2, fontWeight: 600 }}>
              {yKey2}: {hoverItem[yKey2] ?? "—"}
            </div>
          )}
        </div>
      )}

      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        style={{ width: "100%", height: "auto", overflow: "visible" }}
      >
        {/* Horizontal Gridlines */}
        {[0, 0.5, 1].map((ratio) => {
          const y = padding.top + innerH * ratio;
          const val = Math.round(maxY - ratio * maxY);
          return (
            <g key={ratio}>
              <line
                x1={padding.left}
                y1={y}
                x2={chartWidth - padding.right}
                y2={y}
                stroke="var(--hairline)"
                strokeDasharray="2,4"
              />
              <text
                x={padding.left - 6}
                y={y + 4}
                fill="var(--text-3)"
                fontSize="10"
                fontFamily="var(--font-mono)"
                textAnchor="end"
              >
                {val}
              </text>
            </g>
          );
        })}

        {/* Gradient Fill under primary line */}
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.2" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        <path d={areaD} fill="url(#lineGrad)" />

        {/* Primary Line */}
        <path
          d={pathD}
          fill="none"
          stroke={strokeColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Secondary Line */}
        {pathD2 && (
          <path
            d={pathD2}
            fill="none"
            stroke={strokeColor2}
            strokeWidth="1.8"
            strokeDasharray="4,3"
            strokeLinecap="round"
          />
        )}

        {/* Interactive Hover Dots & X-axis Labels */}
        {data.map((d, i) => {
          const val = d[yKey] != null ? Number(d[yKey]) : 0;
          const cx = getX(i);
          const cy = getY(val);
          const isHovered = hoverIndex === i;

          // Render label every N points depending on dataset size
          const step = Math.ceil(data.length / 7);
          const showLabel = i % step === 0 || i === data.length - 1;

          return (
            <g key={i}>
              {/* Invisible touch target for hover */}
              <rect
                x={cx - innerW / (2 * data.length)}
                y={padding.top}
                width={innerW / data.length}
                height={innerH}
                fill="transparent"
                style={{ cursor: "pointer" }}
                onMouseEnter={() => setHoverIndex(i)}
                onMouseLeave={() => setHoverIndex(null)}
              />

              {/* Data Point Dot */}
              {isHovered && (
                <circle
                  cx={cx}
                  cy={cy}
                  r={5}
                  fill={strokeColor}
                  stroke="#fff"
                  strokeWidth={2}
                />
              )}

              {/* X-axis label */}
              {showLabel && (
                <text
                  x={cx}
                  y={chartHeight - 6}
                  fill="var(--text-3)"
                  fontSize="10"
                  fontFamily="var(--font-mono)"
                  textAnchor="middle"
                >
                  {d.shortDate || d[xKey] || ""}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* 2. Interactive Bar Chart */
export function BarChart({
  data = [],
  xKey = "name",
  yKey = "completionsCount",
  height = 160,
  barColor = "var(--ok)",
}) {
  const [hoverIdx, setHoverIdx] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div className="empty" style={{ padding: "20px 0" }}>
        <p className="t3 small">NOT ENOUGH DATA for category comparison.</p>
      </div>
    );
  }

  const maxVal = Math.max(1, ...data.map((d) => Number(d[yKey] || 0)));

  return (
    <div className="stack" style={{ gap: 10, width: "100%" }}>
      {data.map((item, idx) => {
        const val = Number(item[yKey] || 0);
        const pct = Math.round((val / maxVal) * 100);
        const isHovered = hoverIdx === idx;

        return (
          <div
            key={item[xKey] || idx}
            style={{ cursor: "pointer" }}
            onMouseEnter={() => setHoverIdx(idx)}
            onMouseLeave={() => setHoverIdx(null)}
          >
            <div className="spread small t2 mb1">
              <span className="row-flex" style={{ gap: 6 }}>
                <span style={{ fontWeight: 550 }}>{item[xKey]}</span>
              </span>
              <span className="mono status-ok">
                {val} {item.unit || ""}
              </span>
            </div>

            <div className="bar" style={{ height: 8 }}>
              <div
                className="bar__fill"
                style={{
                  width: `${Math.max(4, pct)}%`,
                  background: isHovered ? "var(--text-1)" : barColor,
                  transition: "all 0.2s var(--ease)",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* 3. Calendar Heatmap Grid */
export function CalendarHeatmap({ data = [], numDays = 30 }) {
  if (!data || data.length === 0) {
    return (
      <div className="empty" style={{ padding: "20px 0" }}>
        <p className="t3 small">NOT ENOUGH DATA for calendar heatmap.</p>
      </div>
    );
  }

  const gridCols = numDays <= 30 ? 10 : numDays <= 90 ? 15 : 26;

  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
          gap: 6,
        }}
      >
        {data.map((d) => {
          const val = Number(d.value || (d.done ? 1 : 0));
          const color =
            val === 0
              ? "var(--surface-3)"
              : val >= 3
              ? "var(--ok)"
              : "rgba(108,201,154,0.5)";

          return (
            <div
              key={d.dateKey}
              title={`${d.dateKey} · ${d.done ? `Activity: ${d.value || "Done"}` : "No activity"}`}
              style={{
                height: 26,
                borderRadius: 4,
                background: color,
                opacity: val === 0 ? 0.35 : 0.9,
                transition: "all 0.2s var(--ease)",
              }}
            />
          );
        })}
      </div>

      <div className="spread small t3 mt2">
        <span>Oldest ({data[0]?.dateKey})</span>
        <span className="row-flex" style={{ gap: 4 }}>
          <span style={{ opacity: 0.4 }}>Less</span>
          <span className="dot dot--ok" style={{ width: 8, height: 8 }} />
          <span>More</span>
        </span>
        <span>Today ({data[data.length - 1]?.dateKey})</span>
      </div>
    </div>
  );
}

/* 4. Distribution Chart (Time of Day & Day of Week) */
export function DistributionChart({ distribution = {} }) {
  const entries = Object.entries(distribution);
  const maxVal = Math.max(1, ...entries.map(([, count]) => Number(count)));

  return (
    <div className="stack" style={{ gap: 8 }}>
      {entries.map(([label, count]) => {
        const val = Number(count);
        const pct = Math.round((val / maxVal) * 100);

        return (
          <div key={label}>
            <div className="spread small t2 mb1">
              <span>{label}</span>
              <span className="mono t3">{val}</span>
            </div>
            <div className="bar" style={{ height: 6 }}>
              <div
                className="bar__fill bar__fill--neutral"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* 5. Correlation View Card */
export function CorrelationViewCard({ correlation }) {
  if (correlation.insufficientData) {
    return (
      <div className="panel pad tex-noise">
        <SysLabel>{correlation.title}</SysLabel>
        <p className="t2 mt2 mb0">{correlation.observation}</p>
        <p className="t3 small mt1 mb0">{correlation.suggestedAction}</p>
      </div>
    );
  }

  return (
    <div className="insight" style={{ overflow: "hidden" }}>
      <div className="insight__bar" style={{ background: "var(--info)", opacity: 0.8 }} />
      <div className="panel-pad">
        <div className="row-flex spread">
          <SysLabel>{correlation.title.toUpperCase()}</SysLabel>
          <span className="tag tag--mono small">DATA QUALITY: {correlation.quality}</span>
        </div>

        <p className="mt3" style={{ fontWeight: 500, fontSize: 15, lineHeight: 1.5 }}>
          {correlation.observation}
        </p>

        <div
          className="mt3 p2"
          style={{
            background: "var(--surface-2)",
            borderRadius: "var(--r-2)",
            padding: "10px 12px",
          }}
        >
          <SysLabel as="span" className="t3 small" style={{ display: "block" }}>
            SUGGESTED EXPERIMENT
          </SysLabel>
          <span className="small t1 mt1" style={{ display: "block" }}>
            {correlation.suggestedAction}
          </span>
        </div>

        <p className="t3 small mt2">{correlation.disclaimer}</p>
      </div>
    </div>
  );
}

/* 6. Summary Metric Tile */
export function MetricStatTile({ label, value, unit = "", delta = null, sub = "" }) {
  return (
    <div className="stat">
      <SysLabel>{label}</SysLabel>
      <div className="row-flex spread mt1">
        <div className="mono" style={{ fontSize: 24, fontWeight: 600 }}>
          {value != null ? `${value}${unit ? ` ${unit}` : ""}` : "—"}
        </div>
        {delta && (
          <span
            className={`mono small ${
              delta.startsWith("+")
                ? "status-ok"
                : delta.startsWith("-")
                ? "status-warn"
                : "t3"
            }`}
          >
            {delta}
          </span>
        )}
      </div>
      {sub && <div className="t3 small mt1">{sub}</div>}
    </div>
  );
}
