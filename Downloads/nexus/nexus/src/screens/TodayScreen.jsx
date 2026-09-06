import React, { useState } from "react";
import { useApp } from "../store/AppContext";
import {
  systemStatus, recoverySummary, recoveryTrend, nextAction, todayActions,
  pickInsight, getMetric, completionRateOn,
} from "../lib/selectors";
import { dateKey, longDate } from "../lib/time";
import { Panel, Ring, Bar, SysLabel, StatusDot } from "../components/primitives";
import { IconChevronRight, IconPlus, IconArrow, IconClose, IconSpark, IconShield } from "../components/icons";
import { ActionToggleRow } from "../components/ActionToggleRow";
import { useClock } from "../components/common";
import { Modal } from "../components/Modal";
import { Button } from "../components/primitives";
import { IconMoon, IconZap, IconPhone, IconWaves, IconTarget } from "../components/icons";
import { computeSystemGuidance, computeExecutionMetrics } from "../lib/guidanceEngine";
import { CaptureIdeaModal } from "../components/CaptureIdeaModal";

const iconFor = {
  Sleep: IconMoon, Energy: IconZap, Screen: IconPhone, Stress: IconWaves,
  Consistency: IconTarget,
};

export default function TodayScreen({ navigate }) {
  const { state, api } = useApp();
  const now = useClock();
  const tk = dateKey();
  const prefName = state.preferences?.greetingName || "there";

  const [focusMode, setFocusMode] = useState(
    state.preferences?.focusMode === true
  );

  const [addOpen, setAddOpen] = useState(false);
  const [prioTitle, setPrioTitle] = useState("");
  const [captureOpen, setCaptureOpen] = useState(false);

  const recovery = recoverySummary(state);
  const trend = recoveryTrend(state);
  const acts = todayActions(state);
  const nx = nextAction(state);
  const status = systemStatus(state);
  const insight = pickInsight(state);

  // Phase 7 Guidance & Execution Metrics
  const guidanceRecs = computeSystemGuidance(state);
  const execMetrics = computeExecutionMetrics(state, 30);

  const todayPriorities = (state.priorities || []).filter((p) => p.dateKey === tk);
  const privacyMode = state.preferences?.recoveryPrivacyMode || "standard";

  const hour = now.getHours();
  const greeting =
    hour < 5 ? "Up late" : hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  function toggleFocusMode() {
    const next = !focusMode;
    setFocusMode(next);
    api.setPref({ focusMode: next });
  }

  const tone = (label) => {
    const m = getMetric(state, tk);
    if (!m) return "neutral";
    if (label === "Sleep") return m.sleep >= 7 ? "ok" : m.sleep >= 6 ? "warn" : "neg";
    if (label === "Energy") return m.energy >= 6 ? "ok" : m.energy >= 4 ? "warn" : "neg";
    if (label === "Screen") return m.screenHr <= 5 ? "ok" : m.screenHr <= 7 ? "warn" : "neg";
    if (label === "Stress") return m.stress <= 4 ? "ok" : m.stress <= 6 ? "warn" : "neg";
    if (label === "Consistency") {
      const cr = completionRateOn(state, tk);
      return cr && cr.rate >= 0.7 ? "ok" : cr && cr.rate >= 0.4 ? "warn" : "neg";
    }
    return "neutral";
  };

  return (
    <main className="screen">
      {/* ---------- Header ---------- */}
      <header className="screen-header">
        <div className="screen-header__top">
          <div>
            <SysLabel>TODAY COMMAND CENTER · {longDate(now).toUpperCase()}</SysLabel>
            <h1 className="h1 mt1">{greeting}, {prefName}</h1>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="mono" style={{ fontSize: 22, fontWeight: 600, letterSpacing: "0.02em" }}>
              {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </div>
            <div className="row-flex mt1" style={{ gap: 8, justifyContent: "flex-end" }}>
              <button
                type="button"
                className={`tag tag--interactive ${focusMode ? "tag--active status-ok" : ""}`}
                onClick={toggleFocusMode}
                title="Toggle Focus Mode to reduce interface clutter"
                style={{ padding: "4px 8px" }}
              >
                Focus Mode: {focusMode ? "ON" : "OFF"}
              </button>

              <button
                type="button"
                className="tag tag--interactive"
                onClick={() => setCaptureOpen(true)}
                title="Capture Idea (Learn -> Apply)"
                style={{ padding: "4px 8px" }}
              >
                + Capture Idea
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ---------- SYSTEM GUIDANCE (1-3 Recommendations Max) ---------- */}
      {!focusMode && guidanceRecs.length > 0 && (
        <section className="section" style={{ marginTop: 8 }}>
          <Panel pad className="tex-noise" style={{ border: "1px solid var(--border-strong)" }}>
            <div className="row-flex spread mb2">
              <div className="row-flex" style={{ gap: 8 }}>
                <StatusDot tone="ok" pulse />
                <SysLabel>SYSTEM GUIDANCE</SysLabel>
              </div>
              <span className="mono small t3">INSIGHT ➔ DECISION ➔ ACTION</span>
            </div>

            <div className="stack" style={{ gap: 10 }}>
              {guidanceRecs.map((rec) => (
                <div
                  key={rec.id}
                  className="p2 row-flex spread"
                  style={{
                    background: "var(--surface-1)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--r-2)",
                  }}
                >
                  <div>
                    <div className="row-flex" style={{ gap: 8 }}>
                      <span className="syslabel status-ok">{rec.title}</span>
                      <span className="small t1" style={{ fontWeight: 600 }}>
                        {rec.heading}
                      </span>
                    </div>
                    <span className="t3 small mt1" style={{ display: "block" }}>
                      Why: {rec.why}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="btn btn--secondary small"
                    onClick={() => {
                      if (rec.enableFocusModeSuggestion) {
                        setFocusMode(true);
                      } else {
                        api.addPriority({ title: rec.suggestedAction, note: "Pushed by System Guidance" });
                      }
                    }}
                  >
                    {rec.enableFocusModeSuggestion ? "Enable Focus Mode" : "+ Apply Priority"}
                  </button>
                </div>
              ))}
            </div>
          </Panel>
        </section>
      )}

      {/* ---------- Recovery overview (respects privacyMode; hidden in Focus Mode) ---------- */}
      {!focusMode && privacyMode !== "hidden" && (
        <section className="section" style={{ marginTop: 8 }}>
          <button className="tile" style={{ padding: 0, overflow: "hidden" }} onClick={() => navigate("recovery")}>
            <div className="panel panel--glass" style={{ border: "none" }}>
              <div className="panel-pad tex-noise">
                <div className="hero-grid">
                  <div style={{ justifySelf: "center" }}>
                    <Ring
                      value={recovery.days ? Math.max(0, 100 - recovery.avgDifficulty * 10) : 0}
                      size={104} tone={recovery.avgDifficulty != null && recovery.avgDifficulty < 5 ? "ok" : recovery.avgDifficulty < 7 ? "warn" : "neutral"}
                    >
                      <SysLabel>RECOVERY</SysLabel>
                      <div className="mono" style={{ fontSize: 15, fontWeight: 600 }}>
                        {privacyMode === "discreet"
                          ? "Active"
                          : recovery.avgDifficulty != null
                          ? (recovery.avgDifficulty <= 4 ? "Steady" : recovery.avgDifficulty <= 6 ? "Watchful" : "Strained")
                          : "—"}
                      </div>
                    </Ring>
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div className="spread">
                      <SysLabel>RECOVERY STATUS</SysLabel>
                      <IconChevronRight size={16} className="t3" />
                    </div>
                    <div className="h2 mt1">
                      {privacyMode === "discreet"
                        ? "System resilience tracking active."
                        : recovery.avgDifficulty == null
                        ? "No check-ins logged yet"
                        : recovery.avgDifficulty <= 4
                        ? "Continue forward."
                        : recovery.avgDifficulty <= 6
                        ? "Steady — stay present."
                        : "Recent strain detected."}
                    </div>
                    <div className="row-flex mt3 small t2" style={{ flexWrap: "wrap" }}>
                      <span>
                        {recovery.days} days logged
                      </span>
                      {trend && (
                        <span className={`${trend.delta <= 0 ? "status-ok" : "status-warn"}`}>
                          {trend.delta <= 0 ? "Trend improving" : "Trend rising"}
                        </span>
                      )}
                      {privacyMode !== "discreet" && recovery.redirectedRate != null && (
                        <span>Redirected {Math.round(recovery.redirectedRate * 100)}%</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </button>
        </section>
      )}

      {/* ---------- Priorities ---------- */}
      <section className="section">
        <div className="section-head">
          <SysLabel>TODAY'S PRIORITIES (MAX 3)</SysLabel>
          <button className="btn btn--ghost btn--sm row-flex" onClick={() => setAddOpen(true)}>
            <IconPlus size={14} /> Add
          </button>
        </div>
        <Panel>
          {todayPriorities.length === 0 ? (
            <div className="empty" style={{ padding: "var(--s-6) var(--s-4)" }}>
              <p className="t3">No priorities set for today. Set the outcomes that matter most.</p>
              <Button variant="ghost" size="sm" onClick={() => setAddOpen(true)}>
                <IconPlus size={14} /> Set a priority
              </Button>
            </div>
          ) : (
            <div className="stack" style={{ padding: "4px var(--s-4) var(--s-3)" }}>
              {todayPriorities.slice(0, 3).map((p) => (
                <div className={`check-row ${p.done ? "done" : ""}`} key={p.id}>
                  <button className="tick-check" onClick={() => api.togglePriority(p.id)}>
                    <span className={`tick ${p.done ? "tick--done" : ""}`}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 12.5 9.5 17.5 19.5 6.5" /></svg>
                    </span>
                  </button>
                  <span className="check-row__main">
                    <span className="check-row__title" style={{ fontWeight: 560, display: "block" }}>
                      {p.title}
                    </span>
                    {p.note && <span className="t3 small">{p.note}</span>}
                  </span>
                  <button className="btn btn--ghost btn--icon" style={{ width: 30, height: 30 }} onClick={() => api.removePriority(p.id)} aria-label="Remove">
                    <IconClose size={15} className="t3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </section>

      {/* ---------- Next action ---------- */}
      <section className="section">
        <SysLabel>NEXT ACTION</SysLabel>
        <button
          className="tile mt2 next-card tex-grid"
          style={{ padding: 0 }}
          onClick={() => nx && navigate("actions")}
        >
          <div className="panel-pad" style={{ position: "relative", display: "flex", alignItems: "center", gap: varGap() }}>
            <span style={{
              width: 42, height: 42, borderRadius: 12, background: "var(--surface-3)",
              border: "1px solid var(--border)", display: "inline-flex", alignItems: "center",
              justifyContent: "center", color: "var(--ok)", flex: "0 0 auto",
            }}>
              <IconArrow size={20} />
            </span>
            <span style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
              {nx ? (
                <>
                  <SysLabel>{nx.schedule?.time || "SCHEDULED"}</SysLabel>
                  <div className="h2 mt1 truncate">{nx.name}</div>
                  <div className="t3 small mt1">{catName(state, nx.categoryId)}</div>
                </>
              ) : (
                <>
                  <SysLabel>ALL CLEAR</SysLabel>
                  <div className="h2 mt1">No outstanding actions today.</div>
                </>
              )}
            </span>
          </div>
        </button>
      </section>

      {/* ---------- Today's actions ---------- */}
      <section className="section">
        <div className="section-head">
          <SysLabel>TODAY'S ACTIONS</SysLabel>
          <span className="syslabel">{acts.filter((a) => a.done).length}/{acts.length}</span>
        </div>
        <Panel>
          {acts.length === 0 ? (
            <div className="empty" style={{ padding: "var(--s-6)" }}>
              <p className="t3">No actions scheduled today.</p>
            </div>
          ) : (
            <div className="stack" style={{ padding: "var(--s-2) var(--s-4) var(--s-3)" }}>
              {acts.map((a) => (
                <ActionToggleRow key={a.id} action={a} />
              ))}
            </div>
          )}
        </Panel>
      </section>

      {/* ---------- Execution Metrics Card (Hidden in Focus Mode) ---------- */}
      {!focusMode && (
        <section className="section">
          <div className="section-head">
            <SysLabel>FOLLOW-THROUGH & EXECUTION METRICS</SysLabel>
          </div>
          <div
            className="stat-grid"
            style={{ gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))" }}
          >
            <div className="stat">
              <SysLabel>PRIORITY MET</SysLabel>
              <div className="mono mt1" style={{ fontSize: 22, fontWeight: 600 }}>
                {execMetrics.priorityCompletionRate != null
                  ? `${execMetrics.priorityCompletionRate}%`
                  : "—"}
              </div>
            </div>

            <div className="stat">
              <SysLabel>ACTION CONSISTENCY</SysLabel>
              <div className="mono mt1 status-ok" style={{ fontSize: 22, fontWeight: 600 }}>
                {execMetrics.actionConsistencyRate != null
                  ? `${execMetrics.actionConsistencyRate}%`
                  : "—"}
              </div>
            </div>

            <div className="stat">
              <SysLabel>FOLLOW-THROUGH</SysLabel>
              <div className="mono mt1" style={{ fontSize: 22, fontWeight: 600 }}>
                {execMetrics.followThroughScore != null
                  ? `${execMetrics.followThroughScore}%`
                  : "—"}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ---------- System status (Hidden in Focus Mode) ---------- */}
      {!focusMode && (
        <section className="section">
          <div className="section-head">
            <SysLabel>SYSTEM STATUS</SysLabel>
            <SysLabel>LOCAL · DAILY</SysLabel>
          </div>
          <Panel>
            <div className="stack" style={{ padding: "var(--s-4) var(--s-5) var(--s-5)" }}>
              {status.map((s) => {
                const I = iconFor[s.label];
                const tn = tone(s.label);
                return (
                  <div className="sys-row" key={s.label}>
                    <div className="sys-row__label row-flex" style={{ gap: 8 }}>
                      {I && <I size={15} className="t3" />}
                      <span className="t2 small">{s.label}</span>
                    </div>
                    <div className="grow">
                      {s.value != null ? (
                        <Bar value={s.value * 100} tone={s.invert ? (s.value < 0.5 ? "ok" : s.value < 0.7 ? "warn" : "neg") : tn} height={6} />
                      ) : (
                        <div className="t3 small">{s.display}</div>
                      )}
                    </div>
                    <div className={`mono ${tn === "neutral" ? "t3" : `status-${tn === "ok" ? "ok" : tn}`}`} style={{ width: 64, textAlign: "right", fontSize: 13, fontWeight: 600 }}>
                      {s.display}
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>
        </section>
      )}

      {/* ---------- System insight ---------- */}
      {insight && (
        <section className="section mb4">
          <div className="insight reveal" style={{ overflow: "hidden" }}>
            <div className={`insight__bar`} style={{ background: `var(--${insight.tone})`, opacity: 0.8 }} />
            <div className="panel-pad">
              <div className="row-flex" style={{ gap: 10 }}>
                <span className="dot" style={{ background: `var(--${insight.tone})`, boxShadow: `0 0 12px var(--${insight.tone})` }} />
                <SysLabel>{insight.title}</SysLabel>
              </div>
              <p className="mt3" style={{ lineHeight: 1.55 }}>{insight.observation}</p>
              {insight.experiment && (
                <div className="row-flex mt3" style={{ gap: 8, alignItems: "flex-start" }}>
                  <SysLabel as="div" style={{ marginTop: 3 }}>EXPERIMENT</SysLabel>
                  <p className="t2 small" style={{ flex: 1 }}>{insight.experiment}</p>
                </div>
              )}
              {insight.confidence && (
                <div className="mt3 row-flex">
                  <SysLabel as="span">CONFIDENCE</SysLabel>
                  <span className={`mono small ${insight.tone === "neutral" ? "t2" : `status-${insight.tone}`}`}>{insight.confidence}</span>
                </div>
              )}
              {insight.caveat && <p className="t3 small mt2">{insight.caveat}</p>}
            </div>
          </div>
        </section>
      )}

      {/* ---------- Add priority modal ---------- */}
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Set today's priority"
        sys="PRIORITY"
        footer={
          <>
            <Button variant="ghost" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button
              variant="primary"
              disabled={!prioTitle.trim()}
              onClick={() => {
                api.addPriority({ title: prioTitle.trim(), note: "" });
                setPrioTitle("");
                setAddOpen(false);
              }}
            >
              Add priority
            </Button>
          </>
        }
      >
        <div className="field">
          <label className="field__label" htmlFor="prio">Most important outcome</label>
          <input
            id="prio" className="input" autoFocus
            placeholder="e.g. Finish project proposal draft"
            value={prioTitle}
            onChange={(e) => setPrioTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && prioTitle.trim() && (api.addPriority({ title: prioTitle.trim(), note: "" }), setPrioTitle(""), setAddOpen(false))}
          />
        </div>

        {/* Strategic Goal Next Action Pull Suggestions */}
        {(() => {
          const activeGoals = (state.goals || []).filter(
            (g) => g.status === "active" && g.nextActionTitle
          );
          if (!activeGoals.length) return null;
          return (
            <div className="field mt3">
              <span className="field__label">Pull from Strategic Goal Next Actions</span>
              <div className="stack mt1" style={{ gap: 6 }}>
                {activeGoals.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    className="p2 row-flex spread"
                    style={{
                      background: "var(--surface-1)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--r-2)",
                      textAlign: "left",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      setPrioTitle(g.nextActionTitle);
                    }}
                  >
                    <div>
                      <span className="small t1" style={{ fontWeight: 550, display: "block" }}>
                        {g.nextActionTitle}
                      </span>
                      <span className="t3 small">Goal: {g.name}</span>
                    </div>
                    <span className="status-ok small">+ Select</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })()}

        <p className="t3 small mt3">
          Priorities are outcomes, not habits. Keep today to three or fewer. Shown first on this screen.
        </p>
      </Modal>

      {/* ---------- Capture Idea Modal ---------- */}
      <CaptureIdeaModal
        open={captureOpen}
        onClose={() => setCaptureOpen(false)}
      />
    </main>
  );
}

function varGap() { return "var(--s-4)"; }

function catName(state, id) {
  const c = (state.categories || []).find((x) => x.id === id);
  return c ? c.name : "General";
}
