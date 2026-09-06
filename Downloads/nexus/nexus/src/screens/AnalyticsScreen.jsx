import React, { useState, useMemo } from "react";
import { useApp } from "../store/AppContext";
import { ScreenHeader } from "../components/common";
import {
  IconChart,
  IconCalendar,
  IconClock,
  IconShield,
  IconChevronRight,
  IconTarget,
} from "../components/icons";
import { Button, Panel, SysLabel, StatusDot } from "../components/primitives";
import { Modal } from "../components/Modal";
import {
  computeSummaryStats,
  computeDailyTrendPoints,
  computeCategoryBreakdown,
  computeActionAnalytics,
  computeRecoveryAnalytics,
  computeCorrelationMatrix,
  generateInsightsFeed,
  exportAnalyticsData,
} from "../lib/analyticsEngine";
import {
  LineChart,
  BarChart,
  CalendarHeatmap,
  DistributionChart,
  CorrelationViewCard,
  MetricStatTile,
} from "../components/Charts";

export default function AnalyticsScreen() {
  const { state } = useApp();

  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "behavior" | "recovery" | "correlations" | "insights"
  const [rangeKey, setRangeKey] = useState("30D"); // "7D" | "30D" | "90D" | "1Y" | "ALL"
  const [selectedActionId, setSelectedActionId] = useState(
    state.actions?.[0]?.id || ""
  );
  const [showDetails, setShowDetails] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState("json");

  // Analytics Engine Data (Memoized for smooth, fast transitions)
  const summaryStats = useMemo(() => computeSummaryStats(state, rangeKey), [state, rangeKey]);
  const dailyPoints = useMemo(() => computeDailyTrendPoints(state, rangeKey), [state, rangeKey]);
  const categoryBreakdown = useMemo(() => computeCategoryBreakdown(state, rangeKey), [state, rangeKey]);
  const selectedActionAnalytics = useMemo(
    () => computeActionAnalytics(state, selectedActionId || state.actions?.[0]?.id, rangeKey),
    [state, selectedActionId, rangeKey]
  );
  const recoveryAnalytics = useMemo(() => computeRecoveryAnalytics(state, rangeKey), [state, rangeKey]);
  const correlations = useMemo(() => computeCorrelationMatrix(state, rangeKey), [state, rangeKey]);
  const insightsFeed = useMemo(() => generateInsightsFeed(state, rangeKey), [state, rangeKey]);

  const activeActions = (state.actions || []).filter((a) => !a.archived);

  function handleDownloadExport() {
    const dataStr = exportAnalyticsData(state, exportFormat);
    const blob = new Blob([dataStr], {
      type: exportFormat === "csv" ? "text/csv" : "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nexus-analytics-${rangeKey}-${Date.now()}.${exportFormat}`;
    a.click();
    URL.revokeObjectURL(url);
    setExportOpen(false);
  }

  return (
    <main className="screen">
      <ScreenHeader
        sys="DEEP PERSONAL ANALYTICS"
        title="Analytics"
        right={
          <div className="row-flex" style={{ gap: 8 }}>
            <Button
              variant="secondary"
              onClick={() => setExportOpen(true)}
              title="Export Data"
            >
              Export
            </Button>
          </div>
        }
        sub="A personal behavior laboratory. Schema-driven, understandable, non-causal, and rooted strictly in real logged data."
      />

      {/* Time Range Selector & Navigation Tabs */}
      <div className="row-flex spread mb4" style={{ gap: 12, flexWrap: "wrap" }}>
        <div className="seg" style={{ height: 32, padding: 2 }}>
          {["7D", "30D", "90D", "1Y", "ALL"].map((r) => (
            <button
              key={r}
              type="button"
              className={`seg__btn ${rangeKey === r ? "is-active" : ""}`}
              style={{ fontSize: 11, padding: "2px 10px" }}
              onClick={() => setRangeKey(r)}
            >
              {r}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="btn btn--ghost small"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? "▼ Hide Simple Summaries" : "▶ Show Simple Summaries"}
        </button>
      </div>

      {/* Main Analytics Section Tabs */}
      <div className="seg mb4" style={{ overflowX: "auto" }}>
        {[
          { id: "overview", label: "COMMAND CENTER" },
          { id: "behavior", label: "BEHAVIOR DIVE" },
          { id: "recovery", label: "RECOVERY ANALYTICS" },
          { id: "correlations", label: "CORRELATION ENGINE" },
          { id: "insights", label: "INSIGHTS FEED" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`seg__btn ${activeTab === tab.id ? "is-active" : ""}`}
            style={{ fontSize: 11, padding: "8px 10px" }}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: COMMAND CENTER (OVERVIEW) */}
      {activeTab === "overview" && (
        <div className="stack" style={{ gap: 20 }}>
          {/* Natural Language Easy Summary */}
          {showDetails && (
            <Panel pad className="tex-noise">
              <SysLabel>BEHAVIOR SUMMARY ({rangeKey})</SysLabel>
              <p className="mt2 t1" style={{ fontSize: 15, margin: 0 }}>
                Over the last {summaryStats.numDays} days, you logged{" "}
                <strong>{summaryStats.totalCompletions} total completions</strong> with a scheduled action consistency rate of{" "}
                <strong>{summaryStats.consistencyRate ?? 0}%</strong>.
              </p>
            </Panel>
          )}

          {/* Metric Tiles Grid */}
          <div
            className="stat-grid"
            style={{ gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))" }}
          >
            <MetricStatTile
              label="TOTAL COMPLETIONS"
              value={summaryStats.totalCompletions}
              delta={
                summaryStats.completionDelta
                  ? `${summaryStats.completionDelta > 0 ? "+" : ""}${summaryStats.completionDelta}%`
                  : null
              }
              sub={`Selected ${rangeKey} window`}
            />

            <MetricStatTile
              label="CONSISTENCY RATE"
              value={summaryStats.consistencyRate}
              unit="%"
              sub="Scheduled adherence"
            />

            <MetricStatTile
              label="ACTIVE STREAK"
              value={summaryStats.currentStreak}
              unit="d"
              sub="Continuous days"
            />

            <MetricStatTile
              label="RECOVERY STABILITY"
              value={
                summaryStats.avgDifficulty != null
                  ? `${summaryStats.avgDifficulty.toFixed(1)}/10`
                  : "—"
              }
              sub="Urge difficulty avg"
            />
          </div>

          {/* Line Chart: Daily Activity Trend */}
          <section className="section">
            <div className="section-head">
              <SysLabel>DAILY COMPLETIONS & ACTIVITY TREND</SysLabel>
            </div>
            <Panel pad>
              <LineChart
                data={dailyPoints}
                xKey="shortDate"
                yKey="completionsCount"
                height={170}
                strokeColor="var(--ok)"
              />
            </Panel>
          </section>

          {/* Category Breakdown Bar Chart */}
          <section className="section">
            <div className="section-head">
              <SysLabel>COMPLETIONS BY CATEGORY</SysLabel>
            </div>
            <Panel pad>
              <BarChart
                data={categoryBreakdown}
                xKey="name"
                yKey="completionsCount"
              />
            </Panel>
          </section>

          {/* Top Insights Snapshot */}
          <section className="section mb4">
            <div className="section-head">
              <SysLabel>TOP AUTOMATED SYSTEM INSIGHT</SysLabel>
              <button
                type="button"
                className="btn btn--ghost small"
                onClick={() => setActiveTab("insights")}
              >
                Full Insights Feed <IconChevronRight size={14} />
              </button>
            </div>
            {insightsFeed.slice(0, 1).map((ins) => (
              <Panel key={ins.id} pad className="tex-noise">
                <div className="row-flex spread">
                  <div className="row-flex" style={{ gap: 8 }}>
                    <StatusDot tone="ok" />
                    <SysLabel>{ins.title}</SysLabel>
                  </div>
                  <span className="tag tag--mono small">
                    CONFIDENCE: {ins.confidence}
                  </span>
                </div>
                <p className="mt2 t1">{ins.observation}</p>
                <div
                  className="mt2 p2"
                  style={{
                    background: "var(--surface-2)",
                    borderRadius: "var(--r-2)",
                  }}
                >
                  <SysLabel as="span" className="t3 small">
                    RECOMMENDED ACTION
                  </SysLabel>
                  <p className="small t1 mt1 mb0">{ins.suggestedAction}</p>
                </div>
              </Panel>
            ))}
          </section>
        </div>
      )}

      {/* TAB 2: BEHAVIOR ANALYTICS (DEEP SINGLE-ACTION DIVE) */}
      {activeTab === "behavior" && (
        <div className="stack mb5" style={{ gap: 20 }}>
          {/* Action Selector */}
          <Panel pad className="tex-noise">
            <div className="spread">
              <SysLabel>SELECT ACTION TO ANALYZE</SysLabel>
            </div>
            <select
              className="input mt2"
              value={selectedActionId || activeActions[0]?.id || ""}
              onChange={(e) => setSelectedActionId(e.target.value)}
            >
              {activeActions.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.type})
                </option>
              ))}
            </select>
          </Panel>

          {selectedActionAnalytics ? (
            <div className="stack" style={{ gap: 20 }}>
              {/* Short Natural Language Summary */}
              <Panel pad>
                <SysLabel>ACTION SUMMARY</SysLabel>
                <p className="t1 mt2 mb0" style={{ fontSize: 15 }}>
                  "{selectedActionAnalytics.action.name}" has been completed{" "}
                  <strong>{selectedActionAnalytics.totalCompletions} times</strong> over the last {selectedActionAnalytics.numDays} days with a consistency rate of{" "}
                  <strong>{selectedActionAnalytics.consistencyRate}%</strong>.
                </p>
              </Panel>

              {/* Action Stats Tile Grid */}
              <div
                className="stat-grid"
                style={{ gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))" }}
              >
                <MetricStatTile
                  label="TOTAL COMPLETED"
                  value={selectedActionAnalytics.totalCompletions}
                  sub={`In ${selectedActionAnalytics.numDays} days`}
                />

                <MetricStatTile
                  label="ADHERENCE RATE"
                  value={selectedActionAnalytics.consistencyRate}
                  unit="%"
                  sub="Scheduled met"
                />

                {["quantity", "duration", "count"].includes(selectedActionAnalytics.action.type) && (
                  <MetricStatTile
                    label="TOTAL LOGGED"
                    value={selectedActionAnalytics.totalValue}
                    unit={selectedActionAnalytics.action.unit}
                    sub="Accumulated"
                  />
                )}
              </div>

              {/* Calendar Heatmap */}
              <section className="section">
                <div className="section-head">
                  <SysLabel>30-DAY CALENDAR HEATMAP</SysLabel>
                </div>
                <Panel pad>
                  <CalendarHeatmap
                    data={selectedActionAnalytics.points}
                    numDays={selectedActionAnalytics.numDays}
                  />
                </Panel>
              </section>

              {/* Distributions Grid */}
              <div
                className="grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                  gap: 16,
                }}
              >
                <Panel pad>
                  <SysLabel className="mb2">TIME OF DAY DISTRIBUTION</SysLabel>
                  <DistributionChart
                    distribution={selectedActionAnalytics.todDistribution}
                  />
                </Panel>

                <Panel pad>
                  <SysLabel className="mb2">DAY OF WEEK DISTRIBUTION</SysLabel>
                  <DistributionChart
                    distribution={selectedActionAnalytics.dowDistribution}
                  />
                </Panel>
              </div>

              {/* Custom Fields Summary if any */}
              {selectedActionAnalytics.customFieldStats.length > 0 && (
                <Panel pad>
                  <SysLabel className="mb2">CUSTOM FIELDS SUMMARY</SysLabel>
                  <div className="stack" style={{ gap: 8 }}>
                    {selectedActionAnalytics.customFieldStats.map((cf) => (
                      <div key={cf.id} className="spread small t2 p2" style={{ background: "var(--surface-1)", borderRadius: 6 }}>
                        <span>{cf.name}</span>
                        <span className="mono status-ok">
                          {cf.avg != null ? `Avg: ${cf.avg}` : cf.latest}
                        </span>
                      </div>
                    ))}
                  </div>
                </Panel>
              )}
            </div>
          ) : (
            <Panel pad>
              <div className="empty" style={{ padding: "24px 0" }}>
                <p className="t3">No active action selected for behavior analysis.</p>
              </div>
            </Panel>
          )}
        </div>
      )}

      {/* TAB 3: RECOVERY ANALYTICS */}
      {activeTab === "recovery" && (
        <div className="stack mb5" style={{ gap: 20 }}>
          {!recoveryAnalytics.hasSufficientData ? (
            <Panel pad className="tex-noise">
              <SysLabel>NOT ENOUGH DATA</SysLabel>
              <p className="t2 mt2 mb0">{recoveryAnalytics.message}</p>
            </Panel>
          ) : (
            <div className="stack" style={{ gap: 20 }}>
              {/* Summary Tiles */}
              <div
                className="stat-grid"
                style={{ gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))" }}
              >
                <MetricStatTile
                  label="RECOVERY LOGS"
                  value={recoveryAnalytics.totalLogs}
                  sub={`In ${rangeKey}`}
                />

                <MetricStatTile
                  label="AVG DIFFICULTY"
                  value={recoveryAnalytics.avgDifficulty}
                  unit="/10"
                  sub="Urge severity"
                />

                <MetricStatTile
                  label="REDIRECTION RATE"
                  value={recoveryAnalytics.redirectRate}
                  unit="%"
                  sub={`${recoveryAnalytics.redirectedCount} redirected`}
                />

                <MetricStatTile
                  label="SETBACK LOGS"
                  value={recoveryAnalytics.setbackCount}
                  sub="Recorded data"
                />
              </div>

              {/* Distributions */}
              <div
                className="grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                  gap: 16,
                }}
              >
                <Panel pad>
                  <SysLabel className="mb2">URGE TIME OF DAY DISTRIBUTION</SysLabel>
                  <DistributionChart
                    distribution={recoveryAnalytics.todDistribution}
                  />
                </Panel>

                <Panel pad>
                  <SysLabel className="mb2">URGE DAY OF WEEK DISTRIBUTION</SysLabel>
                  <DistributionChart
                    distribution={recoveryAnalytics.dowDistribution}
                  />
                </Panel>
              </div>

              {/* Effective Redirections */}
              <Panel pad>
                <SysLabel className="mb2">EFFECTIVE REDIRECTION STRATEGIES</SysLabel>
                <div className="stack" style={{ gap: 8 }}>
                  {recoveryAnalytics.topHelped.length === 0 ? (
                    <p className="t3 small">No redirection strategies recorded in this window.</p>
                  ) : (
                    recoveryAnalytics.topHelped.map((item) => (
                      <div key={item.text} className="spread small t2 p2" style={{ background: "var(--surface-1)", borderRadius: 6 }}>
                        <span>{item.text}</span>
                        <span className="mono status-ok">{item.count}x</span>
                      </div>
                    ))
                  )}
                </div>
              </Panel>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: CORRELATION ENGINE */}
      {activeTab === "correlations" && (
        <div className="stack mb5" style={{ gap: 20 }}>
          <Panel pad className="tex-noise">
            <div className="row-flex" style={{ gap: 8 }}>
              <StatusDot tone="info" />
              <SysLabel>BIVARIATE CORRELATION ANALYSIS</SysLabel>
            </div>
            <p className="t2 mt2 mb0">
              The correlation engine compares overlapping observations between variables. All findings state observed associations and explicitly disclaim causation.
            </p>
          </Panel>

          <div className="stack" style={{ gap: 16 }}>
            {correlations.map((corr) => (
              <CorrelationViewCard key={corr.id} correlation={corr} />
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: INSIGHTS FEED */}
      {activeTab === "insights" && (
        <div className="stack mb5" style={{ gap: 16 }}>
          {insightsFeed.map((ins) => (
            <div className="insight" key={ins.id} style={{ overflow: "hidden" }}>
              <div className="insight__bar" style={{ background: "var(--ok)", opacity: 0.8 }} />
              <div className="panel-pad">
                <div className="row-flex spread">
                  <div className="row-flex" style={{ gap: 8 }}>
                    <StatusDot tone="ok" />
                    <SysLabel>{ins.title}</SysLabel>
                  </div>
                  <span className="tag tag--mono small">
                    CONFIDENCE: {ins.confidence}
                  </span>
                </div>

                <p className="mt2 t1" style={{ fontSize: 15, fontWeight: 500 }}>
                  {ins.observation}
                </p>

                <div
                  className="mt2 p2"
                  style={{
                    background: "var(--surface-2)",
                    borderRadius: "var(--r-2)",
                  }}
                >
                  <SysLabel as="span" className="t3 small">
                    RECOMMENDED EXPERIMENT
                  </SysLabel>
                  <p className="small t1 mt1 mb0">{ins.suggestedAction}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Export Data Modal */}
      <Modal
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        title="Export Analytics Data"
        sys="DATA PORTABILITY"
        footer={
          <>
            <Button variant="ghost" onClick={() => setExportOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleDownloadExport}>
              Download {exportFormat.toUpperCase()}
            </Button>
          </>
        }
      >
        <div className="stack" style={{ gap: 16 }}>
          <p className="t2 small">
            Export your raw NEXUS analytics completion history, day metrics, and recovery entries for backup or offline analysis.
          </p>

          <div className="field">
            <label className="field__label">Export Format</label>
            <div className="seg">
              <button
                type="button"
                className={`seg__btn ${exportFormat === "json" ? "is-active" : ""}`}
                onClick={() => setExportFormat("json")}
              >
                JSON (Full Schema)
              </button>
              <button
                type="button"
                className={`seg__btn ${exportFormat === "csv" ? "is-active" : ""}`}
                onClick={() => setExportFormat("csv")}
              >
                CSV (Completions)
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </main>
  );
}
