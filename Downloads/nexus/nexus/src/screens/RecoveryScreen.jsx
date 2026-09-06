import React, { useState } from "react";
import { useApp } from "../store/AppContext";
import { ScreenHeader } from "../components/common";
import {
  IconPlus,
  IconChevronRight,
  IconShield,
  IconEye,
  IconMoon,
  IconZap,
  IconPhone,
  IconWaves,
  IconTrash,
  IconEdit,
} from "../components/icons";
import {
  Button,
  Panel,
  Ring,
  SysLabel,
  StatusDot,
  Pill,
  Empty,
} from "../components/primitives";
import {
  recoverySummary,
  recoveryTrend,
  recoveryInsight,
  recoveryRecent,
  recoveryStats,
  recoveryTrendRange,
  recoveryPatternEngine,
  recoveryActionsList,
} from "../lib/selectors";
import { dateKey, dayLabel, addDays, fromKey } from "../lib/time";
import { CheckInModal } from "../components/CheckInModal";
import { RECOVERY_EVENT_TYPES } from "../data/constants";

export default function RecoveryScreen() {
  const { state, api } = useApp();
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "log" | "insights"
  const [modalOpen, setModalOpen] = useState(false);
  const [modalEventType, setModalEventType] = useState("checkin");
  const [editingEntry, setEditingEntry] = useState(null);

  // Filters for Log tab
  const [logTypeFilter, setLogTypeFilter] = useState("all");
  const [logRangeFilter, setLogTypeRange] = useState("30");

  // Filter for Overview trend chart range
  const [trendRange, setTrendRange] = useState("14");

  const tk = dateKey();
  const logs = state.recovery || [];
  const isEmpty = logs.length === 0;

  // Selected stats and pattern engine
  const stats = recoveryStats(state, trendRange);
  const trendPoints = recoveryTrendRange(state, trendRange);
  const patterns = recoveryPatternEngine(state);
  const recoveryActions = recoveryActionsList(state);
  const privacyMode = state.preferences?.recoveryPrivacyMode || "standard";

  function handleOpenModal(type = "checkin", entry = null) {
    setModalEventType(type);
    setEditingEntry(entry);
    setModalOpen(true);
  }

  function handleTogglePrivacy() {
    const modes = ["standard", "discreet", "hidden"];
    const next = modes[(modes.indexOf(privacyMode) + 1) % modes.length];
    api.setPref({ recoveryPrivacyMode: next });
  }

  // Filtered logs for the Log tab
  const filteredLogs = logs
    .filter((e) => {
      if (!e) return false;
      if (logTypeFilter === "all") return true;
      if (logTypeFilter === "redirection")
        return e.redirected === true || e.eventType === "redirection";
      if (logTypeFilter === "setback")
        return e.eventType === "setback" || (e.redirected === false && (e.difficulty ?? 0) >= 6);
      if (logTypeFilter === "urge")
        return e.eventType === "urge" || e.eventType === "difficult_moment";
      if (logTypeFilter === "checkin")
        return e.eventType === "checkin" || !e.eventType;
      return true;
    })
    .filter((e) => {
      if (!e || !e.dateKey) return true;
      if (logRangeFilter === "all") return true;
      const numDays = Number(logRangeFilter);
      const age = (fromKey(tk) - fromKey(e.dateKey)) / 86400000;
      return age >= 0 && age < numDays;
    })
    .sort((a, b) => (b.dateKey || "").localeCompare(a.dateKey || "") || (b.createdAt || "").localeCompare(a.createdAt || ""));

  const tone =
    stats.avgDifficulty == null
      ? "neutral"
      : stats.avgDifficulty <= 4
      ? "ok"
      : stats.avgDifficulty <= 6
      ? "warn"
      : "neg";

  const ringVal =
    stats.avgDifficulty == null
      ? 0
      : Math.max(0, 100 - stats.avgDifficulty * 10);

  return (
    <main className="screen">
      <ScreenHeader
        sys="RECOVERY OPERATING SYSTEM"
        title="Recovery"
        right={
          <div className="row-flex" style={{ gap: 8 }}>
            <button
              type="button"
              className="tag tag--interactive tag--mono"
              onClick={handleTogglePrivacy}
              title="Click to toggle privacy mode on Today screen"
              style={{ padding: "6px 10px" }}
            >
              Privacy: {privacyMode.toUpperCase()}
            </button>
            <Button variant="primary" onClick={() => handleOpenModal("checkin")}>
              <IconPlus size={16} /> Log Event
            </Button>
          </div>
        }
        sub="Analytical, private, non-shaming tracking. Setbacks are treated strictly as data points to identify patterns and strengthen self-direction."
      />

      {/* Navigation View Switcher Tabs */}
      <div className="seg mt3 mb4" style={{ maxWidth: 480 }}>
        <button
          className={`seg__btn ${activeTab === "overview" ? "is-active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          OVERVIEW
        </button>
        <button
          className={`seg__btn ${activeTab === "log" ? "is-active" : ""}`}
          onClick={() => setActiveTab("log")}
        >
          RECOVERY LOG ({logs.length})
        </button>
        <button
          className={`seg__btn ${activeTab === "insights" ? "is-active" : ""}`}
          onClick={() => setActiveTab("insights")}
        >
          SYSTEM INSIGHTS
        </button>
      </div>

      {/* Onboarding / Empty State for New Users */}
      {isEmpty && (
        <Panel className="tex-noise mb5" glass pad style={{ borderColor: "var(--border-strong)" }}>
          <div className="stack" style={{ gap: 14 }}>
            <div className="row-flex" style={{ gap: 10 }}>
              <IconShield size={22} style={{ color: "var(--ok)" }} />
              <SysLabel>WELCOME TO NEXUS RECOVERY OS</SysLabel>
            </div>
            <h2 className="h2" style={{ margin: 0 }}>
              A supportive, analytical platform for self-direction
            </h2>
            <p className="t2" style={{ margin: 0, maxWidth: 640 }}>
              NEXUS treats recovery as a technical operating system. Setbacks are data points, not punishments. Record urges, difficult moments, and successful redirections to build insights into your sleep, stress, and screen time patterns.
            </p>
            <div className="row-flex mt2" style={{ gap: 12, flexWrap: "wrap" }}>
              <Button variant="primary" onClick={() => handleOpenModal("checkin")}>
                <IconPlus size={16} /> Log First Event
              </Button>
              <Button
                variant="secondary"
                onClick={() => handleOpenModal("redirection")}
              >
                Log Successful Redirection
              </Button>
            </div>
          </div>
        </Panel>
      )}

      {/* VIEW 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="stack" style={{ gap: 24 }}>
          {/* Status Hero */}
          <Panel className="tex-noise" glass>
            <div className="panel-pad">
              <div className="hero-grid">
                <div style={{ justifySelf: "center" }}>
                  <Ring value={ringVal} size={104} tone={tone}>
                    <SysLabel>STABILITY</SysLabel>
                    <div className="mono" style={{ fontWeight: 600, fontSize: 14 }}>
                      {stats.avgDifficulty == null
                        ? "—"
                        : stats.avgDifficulty <= 4
                        ? "Steady"
                        : stats.avgDifficulty <= 6
                        ? "Watchful"
                        : "Strained"}
                    </div>
                  </Ring>
                </div>
                <div>
                  <SysLabel>RECOVERY STATUS</SysLabel>
                  <div className="h2 mt1">
                    {stats.avgDifficulty == null
                      ? "Start with your first log entry."
                      : stats.avgDifficulty <= 4
                      ? "Continue forward — steady momentum."
                      : stats.avgDifficulty <= 6
                      ? "Steady — stay present and maintain boundaries."
                      : "Recent strain detected. Protect sleep & wind-down."}
                  </div>

                  {/* Multi-dimensional Metrics */}
                  <div
                    className="row-flex mt3"
                    style={{ flexWrap: "wrap", gap: 8 }}
                  >
                    <span className="tag tag--mono">{stats.totalLogs} logs in {trendRange}d</span>
                    {stats.redirectRate != null && (
                      <span className="tag tag--mono status-ok">
                        Redirected {Math.round(stats.redirectRate * 100)}%
                      </span>
                    )}
                    {stats.daysSinceSetback != null && (
                      <span className="tag tag--mono status-ok">
                        {stats.daysSinceSetback}d forward progress
                      </span>
                    )}
                    <span className="tag tag--mono">
                      Trajectory: {stats.trajectory}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Panel>

          {/* Technical Trend Visualization */}
          <section className="section">
            <div className="section-head">
              <div className="row-flex" style={{ gap: 12 }}>
                <SysLabel>DIFFICULTY & REDIRECTION TREND</SysLabel>
                <div className="seg" style={{ height: 28, padding: 2 }}>
                  {["7", "14", "30", "90"].map((range) => (
                    <button
                      key={range}
                      type="button"
                      className={`seg__btn ${trendRange === range ? "is-active" : ""}`}
                      style={{ padding: "2px 8px", fontSize: 11 }}
                      onClick={() => setTrendRange(range)}
                    >
                      {range}D
                    </button>
                  ))}
                </div>
              </div>
              <div className="row-flex" style={{ gap: 8 }}>
                <span className="small t3 row-flex" style={{ gap: 4 }}>
                  <span className="dot dot--ok" style={{ width: 8, height: 8 }} /> Low urge
                </span>
                <span className="small t3 row-flex" style={{ gap: 4 }}>
                  <span className="dot dot--warn" style={{ width: 8, height: 8 }} /> Moderate
                </span>
                <span className="small t3 row-flex" style={{ gap: 4 }}>
                  <span className="dot dot--neg" style={{ width: 8, height: 8 }} /> High / Setback
                </span>
              </div>
            </div>
            <Panel>
              <div className="panel-pad" style={{ paddingTop: 24, paddingBottom: 20 }}>
                <TrendBars data={trendPoints} />
                <div className="row-flex spread mt3" style={{ padding: "0 2px" }}>
                  <SysLabel>DATE RANGE ({trendRange} DAYS)</SysLabel>
                  <SysLabel>URGE SEVERITY (0–10)</SysLabel>
                </div>
              </div>
            </Panel>
          </section>

          {/* Top Pattern Insight Preview */}
          {patterns.length > 0 && (
            <section className="section">
              <div className="section-head">
                <SysLabel>PRIMARY PATTERN INSIGHT</SysLabel>
                <button
                  type="button"
                  className="btn btn--ghost small"
                  onClick={() => setActiveTab("insights")}
                >
                  View All Insights <IconChevronRight size={14} />
                </button>
              </div>

              {patterns[0].insufficientData ? (
                <Panel pad>
                  <div className="row-flex" style={{ gap: 10 }}>
                    <StatusDot tone="muted" />
                    <SysLabel>{patterns[0].title}</SysLabel>
                  </div>
                  <p className="mt2 t2">{patterns[0].observation}</p>
                  <p className="mt1 small t3">{patterns[0].suggestedAction}</p>
                </Panel>
              ) : (
                <div className="insight" style={{ overflow: "hidden" }}>
                  <div
                    className="insight__bar"
                    style={{
                      background:
                        patterns[0].tone === "warn"
                          ? "var(--warn)"
                          : patterns[0].tone === "ok"
                          ? "var(--ok)"
                          : "var(--info)",
                      opacity: 0.8,
                    }}
                  />
                  <div className="panel-pad">
                    <div className="row-flex spread">
                      <div className="row-flex" style={{ gap: 8 }}>
                        <StatusDot tone={patterns[0].tone} />
                        <SysLabel>{patterns[0].title}</SysLabel>
                      </div>
                      <span className="tag tag--mono small">
                        CONFIDENCE: {patterns[0].confidence}
                      </span>
                    </div>
                    <p className="mt3" style={{ fontWeight: 500, fontSize: 15 }}>
                      {patterns[0].observation}
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
                        SUGGESTED ACTION
                      </SysLabel>
                      <span className="small t1 mt1" style={{ display: "block" }}>
                        {patterns[0].suggestedAction}
                      </span>
                    </div>
                    <p className="t3 small mt2">{patterns[0].disclaimer}</p>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Top Successful Redirection Strategies */}
          {stats.topWhatHelped.length > 0 && (
            <section className="section">
              <div className="section-head">
                <SysLabel>SUCCESSFUL REDIRECTION STRATEGIES</SysLabel>
              </div>
              <Panel pad>
                <div className="stack" style={{ gap: 10 }}>
                  {stats.topWhatHelped.slice(0, 5).map((item) => (
                    <div className="row-flex spread" key={item.text}>
                      <div className="row-flex" style={{ gap: 8 }}>
                        <StatusDot tone="ok" />
                        <span className="small t1">{item.text}</span>
                      </div>
                      <span className="mono small tag tag--mono">
                        Used {item.count} {item.count === 1 ? "time" : "times"}
                      </span>
                    </div>
                  ))}
                </div>
              </Panel>
            </section>
          )}

          {/* Recovery Actions / Boundaries Integration */}
          <section className="section">
            <div className="section-head">
              <SysLabel>RECOVERY ACTIONS & BOUNDARIES</SysLabel>
              <button
                type="button"
                className="btn btn--ghost small"
                onClick={() => handleOpenModal("checkin")}
              >
                <IconPlus size={14} /> Add Log
              </button>
            </div>
            <Panel pad>
              <div className="stack" style={{ gap: 12 }}>
                {recoveryActions.length === 0 ? (
                  <p className="t3 small">No recovery-specific actions found in your Actions library.</p>
                ) : (
                  recoveryActions.map((action) => {
                    const isDoneToday = (state.completionLog || []).some(
                      (c) => c.actionId === action.id && c.dateKey === tk
                    );
                    return (
                      <div
                        className="row-flex spread"
                        key={action.id}
                        style={{
                          padding: "8px 0",
                          borderBottom: "1px solid var(--hairline)",
                        }}
                      >
                        <div>
                          <div className="row-flex" style={{ gap: 8 }}>
                            <span style={{ fontWeight: 550, fontSize: 14 }}>
                              {action.name}
                            </span>
                            <span className="tag tag--mono small">
                              {action.type.toUpperCase()}
                            </span>
                          </div>
                          {action.desc && (
                            <span className="t3 small">{action.desc}</span>
                          )}
                        </div>

                        <button
                          type="button"
                          className={`btn ${isDoneToday ? "btn--ghost" : "btn--secondary"} small`}
                          onClick={() => {
                            if (isDoneToday) {
                              api.uncompleteAction(action, { dateKey: tk });
                            } else {
                              api.completeAction(action, null, { dateKey: tk });
                            }
                          }}
                        >
                          {isDoneToday ? "✓ Complete Today" : "Mark Done"}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </Panel>
          </section>

          {/* Recent Log Preview */}
          <section className="section mb4">
            <div className="section-head">
              <SysLabel>RECENT LOGGED EVENTS</SysLabel>
              <button
                type="button"
                className="btn btn--ghost small"
                onClick={() => setActiveTab("log")}
              >
                View Full Recovery Log <IconChevronRight size={14} />
              </button>
            </div>
            <Panel>
              <div className="stack" style={{ padding: "8px 16px" }}>
                {logs.length === 0 ? (
                  <div className="empty" style={{ padding: "var(--s-4)" }}>
                    <p className="t3">No recovery logs recorded yet.</p>
                  </div>
                ) : (
                  logs
                    .slice(0, 4)
                    .sort((a, b) => b.dateKey.localeCompare(a.dateKey))
                    .map((item) => (
                      <LogSummaryRow
                        key={item.id}
                        item={item}
                        onEdit={() => handleOpenModal(item.eventType || "checkin", item)}
                      />
                    ))
                )}
              </div>
            </Panel>
          </section>
        </div>
      )}

      {/* VIEW 2: RECOVERY LOG */}
      {activeTab === "log" && (
        <div className="stack" style={{ gap: 20 }}>
          {/* Quick Event Logging Bar */}
          <Panel pad className="tex-noise">
            <div className="section-head mb2">
              <SysLabel>FAST EVENT LOGGING</SysLabel>
            </div>
            <div className="row-flex" style={{ gap: 8, flexWrap: "wrap" }}>
              <Button
                variant="primary"
                onClick={() => handleOpenModal("redirection")}
              >
                <IconShield size={15} /> + Log Redirection
              </Button>
              <Button
                variant="secondary"
                onClick={() => handleOpenModal("urge")}
              >
                <IconZap size={15} /> + Log Urge
              </Button>
              <Button
                variant="secondary"
                onClick={() => handleOpenModal("setback")}
              >
                + Log Setback
              </Button>
              <Button
                variant="ghost"
                onClick={() => handleOpenModal("checkin")}
              >
                + Daily Check-in
              </Button>
            </div>
          </Panel>

          {/* Filters Bar */}
          <div className="row-flex spread" style={{ gap: 12, flexWrap: "wrap" }}>
            <div className="row-flex" style={{ gap: 8, flexWrap: "wrap" }}>
              <SysLabel style={{ alignSelf: "center" }}>FILTER:</SysLabel>
              <div className="seg" style={{ height: 32, padding: 2 }}>
                {[
                  { id: "all", label: "ALL" },
                  { id: "redirection", label: "REDIRECTED" },
                  { id: "urge", label: "URGES" },
                  { id: "setback", label: "SETBACKS" },
                  { id: "checkin", label: "CHECK-INS" },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    className={`seg__btn ${logTypeFilter === f.id ? "is-active" : ""}`}
                    style={{ padding: "4px 10px", fontSize: 11 }}
                    onClick={() => setLogTypeFilter(f.id)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="row-flex" style={{ gap: 8 }}>
              <SysLabel style={{ alignSelf: "center" }}>RANGE:</SysLabel>
              <div className="seg" style={{ height: 32, padding: 2 }}>
                {["7", "30", "90", "all"].map((r) => (
                  <button
                    key={r}
                    type="button"
                    className={`seg__btn ${logRangeFilter === r ? "is-active" : ""}`}
                    style={{ padding: "4px 8px", fontSize: 11 }}
                    onClick={() => setLogTypeRange(r)}
                  >
                    {r.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Event Log Cards List */}
          <div className="stack mb5" style={{ gap: 12 }}>
            {filteredLogs.length === 0 ? (
              <Panel pad>
                <div className="empty" style={{ padding: "24px 0" }}>
                  <p className="t2">No recovery entries match this filter.</p>
                  <Button
                    variant="secondary"
                    className="mt2"
                    onClick={() => handleOpenModal("checkin")}
                  >
                    Log New Event
                  </Button>
                </div>
              </Panel>
            ) : (
              filteredLogs.map((item) => (
                <LogDetailCard
                  key={item.id}
                  item={item}
                  onEdit={() => handleOpenModal(item.eventType || "checkin", item)}
                  onDelete={() => api.deleteRecovery(item.id)}
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* VIEW 3: SYSTEM INSIGHTS */}
      {activeTab === "insights" && (
        <div className="stack mb5" style={{ gap: 24 }}>
          {/* Header Note */}
          <Panel pad className="tex-noise">
            <div className="row-flex" style={{ gap: 10 }}>
              <StatusDot tone="info" />
              <SysLabel>AUTOMATED PATTERN DETECTION ENGINE</SysLabel>
            </div>
            <p className="t2 mt2 mb0">
              NEXUS compares recovery entries with sleep duration, screen time, stress, energy, time of day, and day of week. All findings are presented strictly as correlations and observations.
            </p>
          </Panel>

          {/* Patterns List */}
          <div className="stack" style={{ gap: 16 }}>
            {patterns.map((pat) => (
              <PatternCard key={pat.id} pattern={pat} />
            ))}
          </div>

          {/* Factor Distribution Breakdown */}
          <section className="section">
            <div className="section-head">
              <SysLabel>FACTOR & TIME DISTRIBUTION</SysLabel>
            </div>
            <div
              className="grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: 16,
              }}
            >
              {/* Time of Day Distribution */}
              <Panel pad>
                <SysLabel className="mb2">TIME OF DAY DISTRIBUTION</SysLabel>
                <div className="stack" style={{ gap: 8 }}>
                  {Object.entries(stats.todDistribution).map(([tod, count]) => {
                    const total = Math.max(1, stats.totalLogs);
                    const pct = Math.round((count / total) * 100);
                    return (
                      <div key={tod}>
                        <div className="spread small t2 mb1">
                          <span style={{ textTransform: "capitalize" }}>{tod}</span>
                          <span className="mono">{count} ({pct}%)</span>
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
              </Panel>

              {/* Top Redirection Techniques */}
              <Panel pad>
                <SysLabel className="mb2">EFFECTIVE REDIRECTIONS</SysLabel>
                <div className="stack" style={{ gap: 8 }}>
                  {stats.topWhatHelped.length === 0 ? (
                    <p className="t3 small">Log what helps you redirect to build technique statistics.</p>
                  ) : (
                    stats.topWhatHelped.slice(0, 4).map((item) => (
                      <div className="spread small t2" key={item.text}>
                        <span>{item.text}</span>
                        <span className="mono status-ok">{item.count}x</span>
                      </div>
                    ))
                  )}
                </div>
              </Panel>
            </div>
          </section>
        </div>
      )}

      {/* CheckIn / Event Log Modal */}
      <CheckInModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingEntry(null);
        }}
        initialEventType={modalEventType}
        initialEntry={editingEntry}
      />
    </main>
  );
}

/* ------------------------------------------------------------
   Sub-components for clean visualization
   ------------------------------------------------------------ */

function TrendBars({ data }) {
  const max = 10;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: 4,
        height: 120,
        width: "100%",
      }}
    >
      {data.map((d) => {
        const h = d.difficulty == null ? 4 : (d.difficulty / max) * 100;
        const color =
          d.difficulty == null
            ? "var(--surface-4)"
            : d.hasSetback
            ? "var(--neg)"
            : d.difficulty >= 6
            ? "var(--warn)"
            : "var(--ok)";

        return (
          <div
            key={d.dateKey}
            style={{
              flex: "1 1 0",
              minWidth: 2,
              height: 120,
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              alignItems: "center",
            }}
          >
            <div
              title={`${d.dateKey} (${d.dateLabel}) · Urge: ${
                d.difficulty ?? "No log"
              }/10${d.hasSetback ? " · Setback" : ""}`}
              style={{
                width: "100%",
                height: `${Math.max(4, h)}%`,
                borderRadius: 3,
                background: color,
                opacity: d.difficulty == null ? 0.3 : 0.9,
                transition: "height 0.3s var(--ease)",
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

function LogSummaryRow({ item, onEdit }) {
  const isSetback = item.eventType === "setback" || item.redirected === false;
  const tone = isSetback ? "neg" : (item.difficulty ?? 0) >= 5 ? "warn" : "ok";

  return (
    <div
      className="row-flex spread"
      style={{
        padding: "10px 0",
        borderBottom: "1px solid var(--hairline)",
      }}
    >
      <div className="row-flex" style={{ gap: 10 }}>
        <StatusDot tone={tone} />
        <div>
          <div className="row-flex" style={{ gap: 8 }}>
            <span className="mono small t1" style={{ fontWeight: 600 }}>
              {item.dateKey}
            </span>
            <span className="tag tag--mono small" style={{ textTransform: "uppercase" }}>
              {item.eventType || (item.redirected ? "Redirected" : "Check-in")}
            </span>
            {item.timeOfDay && (
              <span className="t3 small" style={{ textTransform: "capitalize" }}>
                · {item.timeOfDay}
              </span>
            )}
          </div>
          {item.whatHelped && (
            <div className="t2 small mt1 status-ok">
              Helped: {item.whatHelped}
            </div>
          )}
        </div>
      </div>

      <div className="row-flex" style={{ gap: 10 }}>
        <span className="mono small t2">
          {item.difficulty != null ? `${item.difficulty}/10` : "—"}
        </span>
        <button
          type="button"
          className="btn btn--ghost small"
          onClick={onEdit}
          style={{ padding: 4 }}
          title="Edit Log Entry"
        >
          <IconEdit size={14} />
        </button>
      </div>
    </div>
  );
}

function LogDetailCard({ item, onEdit, onDelete }) {
  const isSetback = item.eventType === "setback" || item.redirected === false;
  const tone = isSetback ? "neg" : (item.difficulty ?? 0) >= 5 ? "warn" : "ok";
  const typeObj =
    RECOVERY_EVENT_TYPES.find((t) => t.id === item.eventType) || RECOVERY_EVENT_TYPES[0];

  return (
    <Panel pad>
      <div className="stack" style={{ gap: 10 }}>
        <div className="row-flex spread">
          <div className="row-flex" style={{ gap: 8 }}>
            <StatusDot tone={tone} />
            <SysLabel>{item.dateKey}</SysLabel>
            {item.timeOfDay && (
              <span className="tag tag--mono small" style={{ textTransform: "capitalize" }}>
                {item.timeOfDay}
              </span>
            )}
            <span
              className={`tag tag--mono small ${
                isSetback ? "status-neg" : "status-ok"
              }`}
            >
              {typeObj.label}
            </span>
          </div>

          <div className="row-flex" style={{ gap: 8 }}>
            <span className="mono small" style={{ fontWeight: 600 }}>
              Urge: {item.difficulty != null ? `${item.difficulty}/10` : "—"}
            </span>
            <button
              type="button"
              className="btn btn--ghost small"
              onClick={onEdit}
              style={{ padding: "2px 6px" }}
              title="Edit"
            >
              <IconEdit size={14} />
            </button>
            <button
              type="button"
              className="btn btn--ghost small"
              onClick={onDelete}
              style={{ padding: "2px 6px", color: "var(--neg)" }}
              title="Delete"
            >
              <IconTrash size={14} />
            </button>
          </div>
        </div>

        {/* What Helped */}
        {item.whatHelped && (
          <div
            className="p2"
            style={{
              background: "rgba(108,201,154,0.08)",
              border: "1px solid rgba(108,201,154,0.2)",
              borderRadius: "var(--r-2)",
              padding: "8px 12px",
            }}
          >
            <span className="small status-ok" style={{ fontWeight: 550 }}>
              ✓ Strategy used: {item.whatHelped}
            </span>
          </div>
        )}

        {/* Context / Beforehand */}
        {item.beforehand && (
          <div className="small t2">
            <span className="t3">Beforehand: </span>
            {item.beforehand}
          </div>
        )}

        {(item.context || item.note) && (
          <div className="small t2">
            <span className="t3">Context: </span>
            {item.context || item.note}
          </div>
        )}

        {/* Factors Breakdown */}
        {item.factors && (
          <div
            className="row-flex"
            style={{ gap: 12, flexWrap: "wrap", paddingTop: 6, borderTop: "1px solid var(--hairline)" }}
          >
            {item.factors.sleep != null && (
              <span className="t3 small row-flex" style={{ gap: 4 }}>
                <IconMoon size={12} /> Sleep: {item.factors.sleep}h
              </span>
            )}
            {item.factors.stress != null && (
              <span className="t3 small row-flex" style={{ gap: 4 }}>
                <IconWaves size={12} /> Stress: {item.factors.stress}/10
              </span>
            )}
            {item.factors.screen != null && (
              <span className="t3 small row-flex" style={{ gap: 4 }}>
                <IconPhone size={12} /> Screen: {item.factors.screen}h
              </span>
            )}
            {item.factors.energy != null && (
              <span className="t3 small row-flex" style={{ gap: 4 }}>
                <IconZap size={12} /> Energy: {item.factors.energy}/10
              </span>
            )}
            {item.factors.alone != null && (
              <span className="t3 small">
                Alone: {item.factors.alone ? "Yes" : "No"}
              </span>
            )}
          </div>
        )}
      </div>
    </Panel>
  );
}

function PatternCard({ pattern }) {
  if (pattern.insufficientData) {
    return (
      <Panel pad className="tex-noise">
        <div className="row-flex" style={{ gap: 8 }}>
          <StatusDot tone="muted" />
          <SysLabel>{pattern.title}</SysLabel>
        </div>
        <p className="t2 mt2">{pattern.observation}</p>
        <p className="t3 small mt1">{pattern.suggestedAction}</p>
      </Panel>
    );
  }

  return (
    <div className="insight" style={{ overflow: "hidden" }}>
      <div
        className="insight__bar"
        style={{
          background:
            pattern.tone === "warn"
              ? "var(--warn)"
              : pattern.tone === "ok"
              ? "var(--ok)"
              : "var(--info)",
          opacity: 0.8,
        }}
      />
      <div className="panel-pad">
        <div className="row-flex spread">
          <div className="row-flex" style={{ gap: 8 }}>
            <StatusDot tone={pattern.tone} />
            <SysLabel>{pattern.title}</SysLabel>
          </div>
          <span className="tag tag--mono small">
            CONFIDENCE: {pattern.confidence}
          </span>
        </div>

        <p className="mt3" style={{ fontWeight: 500, fontSize: 15 }}>
          {pattern.observation}
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
            SUGGESTED ACTION
          </SysLabel>
          <span className="small t1 mt1" style={{ display: "block" }}>
            {pattern.suggestedAction}
          </span>
        </div>

        <p className="t3 small mt2">{pattern.disclaimer}</p>
      </div>
    </div>
  );
}
