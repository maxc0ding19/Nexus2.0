import { dateKey, fromKey, addDays, dayLabel } from "./time";
import { ACTION_TYPES } from "../data/constants";

/* ------------------------------------------------------------
   NEXUS Analytics Engine — pure functions over state.
   Calculates trends, heatmaps, correlations, distributions,
   and insights across any user-defined actions and metrics.
   ------------------------------------------------------------ */

/* Convert range key ('7D', '30D', '90D', '1Y', 'ALL') to days count */
export function getDaysForRange(rangeKey, state) {
  if (rangeKey === "7D") return 7;
  if (rangeKey === "30D") return 30;
  if (rangeKey === "90D") return 90;
  if (rangeKey === "1Y") return 365;
  if (rangeKey === "ALL") {
    const logs = state.completionLog || [];
    if (!logs.length) return 30;
    const dates = logs.map((l) => fromKey(l.dateKey)).filter(Boolean);
    if (!dates.length) return 30;
    const minDate = new Date(Math.min(...dates));
    const now = new Date();
    const diff = Math.ceil((now - minDate) / 86400000);
    return Math.max(14, diff);
  }
  return 30;
}

/* Returns date keys array for a given range ending today */
export function getDateKeysForRange(numDays, endKey = dateKey()) {
  const endDate = fromKey(endKey);
  const keys = [];
  for (let i = numDays - 1; i >= 0; i--) {
    keys.push(dateKey(addDays(endDate, -i)));
  }
  return keys;
}

/* Overall Command Center Summary Stats */
export function computeSummaryStats(state, rangeKey = "30D") {
  const tk = dateKey();
  const numDays = getDaysForRange(rangeKey, state);
  const keys = getDateKeysForRange(numDays, tk);
  const keySet = new Set(keys);

  const logs = (state.completionLog || []).filter((c) => keySet.has(c.dateKey));
  const activeActions = (state.actions || []).filter((a) => !a.archived);

  // Total completions
  const totalCompletions = logs.length;

  // Calculate consistency / scheduled rate
  let totalScheduledOpportunity = 0;
  let totalScheduledMet = 0;

  keys.forEach((k) => {
    const d = fromKey(k);
    activeActions.forEach((a) => {
      // Check schedule
      const freq = a.schedule?.freq || "daily";
      const dow = d.getDay();
      let isSched = freq === "daily";
      if (freq === "weekdays") isSched = dow !== 0 && dow !== 6;
      if (freq === "weekends") isSched = dow === 0 || dow === 6;
      if (freq === "custom") isSched = (a.schedule?.days || []).includes(dow);

      if (isSched) {
        totalScheduledOpportunity++;
        const hasLog = logs.some((l) => l.actionId === a.id && l.dateKey === k);
        if (hasLog) totalScheduledMet++;
      }
    });
  });

  const consistencyRate =
    totalScheduledOpportunity > 0
      ? Math.round((totalScheduledMet / totalScheduledOpportunity) * 100)
      : null;

  // Compare with previous window of equal length
  const prevKeys = getDateKeysForRange(numDays, dateKey(addDays(fromKey(keys[0]), -1)));
  const prevKeySet = new Set(prevKeys);
  const prevLogs = (state.completionLog || []).filter((c) => prevKeySet.has(c.dateKey));
  const completionDelta =
    prevLogs.length > 0
      ? Math.round(((logs.length - prevLogs.length) / prevLogs.length) * 100)
      : 0;

  // Active overall streak across any action
  let currentStreak = 0;
  let cursor = fromKey(tk);
  const hasLogOnDate = (k) => (state.completionLog || []).some((l) => l.dateKey === k);
  if (!hasLogOnDate(tk)) cursor = addDays(cursor, -1);
  while (hasLogOnDate(dateKey(cursor))) {
    currentStreak++;
    cursor = addDays(cursor, -1);
  }

  // Recovery stability summary
  const recLogs = (state.recovery || []).filter((r) => keySet.has(r.dateKey));
  const diffs = recLogs.map((r) => r.difficulty).filter((d) => d != null);
  const avgDifficulty = diffs.length ? diffs.reduce((a, b) => a + b, 0) / diffs.length : null;
  const redirectCount = recLogs.filter((r) => r.redirected === true).length;
  const redirectRate = recLogs.length ? Math.round((redirectCount / recLogs.length) * 100) : null;

  return {
    numDays,
    totalCompletions,
    completionDelta,
    consistencyRate,
    currentStreak,
    avgDifficulty,
    redirectRate,
    recLogsCount: recLogs.length,
  };
}

/* Daily trend points array for multi-metric charts */
export function computeDailyTrendPoints(state, rangeKey = "30D") {
  const tk = dateKey();
  const numDays = getDaysForRange(rangeKey, state);
  const keys = getDateKeysForRange(numDays, tk);

  return keys.map((k) => {
    const d = fromKey(k);
    const dayCompletions = (state.completionLog || []).filter((c) => c.dateKey === k);
    const metric = (state.dayMetrics || []).find((m) => m.dateKey === k);
    const rec = (state.recovery || []).find((r) => r.dateKey === k);

    return {
      dateKey: k,
      dateLabel: dayLabel(k),
      shortDate: `${d.getMonth() + 1}/${d.getDate()}`,
      completionsCount: dayCompletions.length,
      sleep: metric?.sleep ?? null,
      screenHr: metric?.screenHr ?? null,
      energy: metric?.energy ?? null,
      stress: metric?.stress ?? null,
      mood: metric?.mood ?? null,
      difficulty: rec?.difficulty ?? null,
      redirected: rec?.redirected ?? null,
    };
  });
}

/* Category completion breakdown for Bar Charts */
export function computeCategoryBreakdown(state, rangeKey = "30D") {
  const tk = dateKey();
  const numDays = getDaysForRange(rangeKey, state);
  const keys = getDateKeysForRange(numDays, tk);
  const keySet = new Set(keys);

  const categories = state.categories || [];
  const actions = state.actions || [];
  const logs = (state.completionLog || []).filter((c) => keySet.has(c.dateKey));

  return categories.map((cat) => {
    const catActions = actions.filter((a) => a.categoryId === cat.id);
    const catActionIds = new Set(catActions.map((a) => a.id));
    const catLogs = logs.filter((l) => catActionIds.has(l.actionId));

    let totalSum = 0;
    catLogs.forEach((l) => (totalSum += l.value || 1));

    return {
      id: cat.id,
      name: cat.name,
      icon: cat.icon || "target",
      actionCount: catActions.length,
      completionsCount: catLogs.length,
      totalSum,
    };
  });
}

/* Single Action Deep Analytics (for any user-created action) */
export function computeActionAnalytics(state, actionId, rangeKey = "30D") {
  const action = (state.actions || []).find((a) => a.id === actionId);
  if (!action) return null;

  const tk = dateKey();
  const numDays = getDaysForRange(rangeKey, state);
  const keys = getDateKeysForRange(numDays, tk);
  const keySet = new Set(keys);

  const logs = (state.completionLog || []).filter(
    (c) => c.actionId === actionId && keySet.has(c.dateKey)
  );

  const logMap = new Map(logs.map((l) => [l.dateKey, l]));

  // Daily points
  const points = keys.map((k) => {
    const l = logMap.get(k);
    return {
      dateKey: k,
      dateLabel: dayLabel(k),
      done: !!l,
      value: l?.value ?? 0,
      payload: l?.payload || {},
    };
  });

  const totalCompletions = logs.length;
  const totalValue = logs.reduce((sum, l) => sum + (l.value || 0), 0);
  const avgValue = totalCompletions > 0 ? totalValue / totalCompletions : 0;

  // Scheduled adherence
  let scheduledCount = 0;
  let scheduledMet = 0;
  keys.forEach((k) => {
    const d = fromKey(k);
    const freq = action.schedule?.freq || "daily";
    const dow = d.getDay();
    let isSched = freq === "daily";
    if (freq === "weekdays") isSched = dow !== 0 && dow !== 6;
    if (freq === "weekends") isSched = dow === 0 || dow === 6;
    if (freq === "custom") isSched = (action.schedule?.days || []).includes(dow);

    if (isSched) {
      scheduledCount++;
      if (logMap.has(k)) scheduledMet++;
    }
  });

  const consistencyRate =
    scheduledCount > 0 ? Math.round((scheduledMet / scheduledCount) * 100) : 0;

  // Time of day & Day of week distributions
  const dowDistribution = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
  const todDistribution = { Morning: 0, Afternoon: 0, Evening: 0, Night: 0 };

  logs.forEach((l) => {
    const d = fromKey(l.dateKey);
    const dowStr = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()];
    if (dowDistribution[dowStr] != null) dowDistribution[dowStr]++;

    const created = l.createdAt ? new Date(l.createdAt) : null;
    if (created && !isNaN(created.getTime())) {
      const h = created.getHours();
      if (h >= 5 && h < 12) todDistribution.Morning++;
      else if (h >= 12 && h < 17) todDistribution.Afternoon++;
      else if (h >= 17 && h < 21) todDistribution.Evening++;
      else todDistribution.Night++;
    }
  });

  // Custom fields aggregates if any
  const customFieldStats = [];
  if (action.customFields && action.customFields.length > 0) {
    action.customFields.forEach((cf) => {
      const vals = logs
        .map((l) => l.payload?.customFields?.[cf.id])
        .filter((v) => v != null && v !== "");

      if (cf.type === "number" || cf.type === "scale") {
        const numVals = vals.map(Number).filter((n) => !isNaN(n));
        const avg = numVals.length
          ? numVals.reduce((a, b) => a + b, 0) / numVals.length
          : null;
        customFieldStats.push({
          id: cf.id,
          name: cf.name,
          type: cf.type,
          count: numVals.length,
          avg: avg != null ? Math.round(avg * 10) / 10 : "—",
        });
      } else {
        customFieldStats.push({
          id: cf.id,
          name: cf.name,
          type: cf.type,
          count: vals.length,
          latest: vals[vals.length - 1] ?? "—",
        });
      }
    });
  }

  return {
    action,
    numDays,
    totalCompletions,
    totalValue: Math.round(totalValue * 10) / 10,
    avgValue: Math.round(avgValue * 10) / 10,
    consistencyRate,
    scheduledCount,
    scheduledMet,
    points,
    dowDistribution,
    todDistribution,
    customFieldStats,
  };
}

/* Deep Recovery Analytics */
export function computeRecoveryAnalytics(state, rangeKey = "30D") {
  const tk = dateKey();
  const numDays = getDaysForRange(rangeKey, state);
  const keys = getDateKeysForRange(numDays, tk);
  const keySet = new Set(keys);

  const logs = (state.recovery || []).filter((r) => keySet.has(r.dateKey));

  if (!logs.length) {
    return {
      hasSufficientData: false,
      totalLogs: 0,
      message: "NOT ENOUGH DATA — Log recovery check-ins to unlock deep recovery analytics.",
    };
  }

  const diffs = logs.map((r) => r.difficulty).filter((d) => d != null);
  const avgDifficulty = diffs.length ? diffs.reduce((a, b) => a + b, 0) / diffs.length : null;

  const redirectedLogs = logs.filter((r) => r.redirected === true || r.eventType === "redirection");
  const setbackLogs = logs.filter(
    (r) => r.eventType === "setback" || (r.redirected === false && (r.difficulty ?? 0) >= 6)
  );

  const redirectRate = logs.length ? Math.round((redirectedLogs.length / logs.length) * 100) : 0;

  // Time of day distribution
  const todDistribution = { Morning: 0, Afternoon: 0, Evening: 0, Night: 0 };
  logs.forEach((r) => {
    if (r.timeOfDay === "morning") todDistribution.Morning++;
    else if (r.timeOfDay === "afternoon") todDistribution.Afternoon++;
    else if (r.timeOfDay === "evening") todDistribution.Evening++;
    else if (r.timeOfDay === "night") todDistribution.Night++;
  });

  // Day of week distribution
  const dowDistribution = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
  logs.forEach((r) => {
    const d = fromKey(r.dateKey);
    const dowStr = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()];
    if (dowDistribution[dowStr] != null) dowDistribution[dowStr]++;
  });

  // What helped techniques count
  const helpedCounts = {};
  logs.forEach((r) => {
    if (r.whatHelped) {
      const str = String(r.whatHelped).trim();
      if (str) helpedCounts[str] = (helpedCounts[str] || 0) + 1;
    }
  });

  const topHelped = Object.entries(helpedCounts)
    .map(([text, count]) => ({ text, count }))
    .sort((a, b) => b.count - a.count);

  return {
    hasSufficientData: logs.length >= 3,
    totalLogs: logs.length,
    avgDifficulty: avgDifficulty != null ? Math.round(avgDifficulty * 10) / 10 : null,
    redirectRate,
    redirectedCount: redirectedLogs.length,
    setbackCount: setbackLogs.length,
    todDistribution,
    dowDistribution,
    topHelped,
  };
}

/* Correlation Engine — non-causal bivariate analysis with data quality rating */
export function computeCorrelationMatrix(state, rangeKey = "30D") {
  const tk = dateKey();
  const numDays = getDaysForRange(rangeKey, state);
  const keys = getDateKeysForRange(numDays, tk);

  const pairs = [];

  // Pair 1: Sleep vs Recovery Difficulty
  const sleepVsDiff = [];
  keys.forEach((k) => {
    const metric = (state.dayMetrics || []).find((m) => m.dateKey === k);
    const rec = (state.recovery || []).find((r) => r.dateKey === k);
    if (metric?.sleep != null && rec?.difficulty != null) {
      sleepVsDiff.push({ x: metric.sleep, y: rec.difficulty, dateKey: k });
    }
  });

  if (sleepVsDiff.length >= 3) {
    const lowSleep = sleepVsDiff.filter((p) => p.x < 6.2);
    const goodSleep = sleepVsDiff.filter((p) => p.x >= 6.8);

    const lowDiffAvg = lowSleep.length
      ? lowSleep.reduce((a, b) => a + b.y, 0) / lowSleep.length
      : null;
    const goodDiffAvg = goodSleep.length
      ? goodSleep.reduce((a, b) => a + b.y, 0) / goodSleep.length
      : null;

    if (lowDiffAvg != null && goodDiffAvg != null) {
      const diff = lowDiffAvg - goodDiffAvg;
      pairs.push({
        id: "corr-sleep-recovery",
        title: "Sleep Duration vs Urge Difficulty",
        varX: "Sleep (Hours)",
        varY: "Urge Difficulty (0-10)",
        sampleSize: sleepVsDiff.length,
        quality: sleepVsDiff.length >= 10 ? "High" : "Moderate",
        observation: `In your logged data, urge difficulty averages ${lowDiffAvg.toFixed(
          1
        )}/10 on low-sleep days (<6.2h), compared to ${goodDiffAvg.toFixed(
          1
        )}/10 on higher-sleep days.`,
        disclaimer: "This is an observed relationship in overlapping logs, not proof of causation.",
        suggestedAction: "Maintain a consistent sleep window to protect evening resilience.",
        points: sleepVsDiff,
      });
    }
  }

  // Pair 2: Screen Time vs Nighttime Urges
  const screenVsDiff = [];
  keys.forEach((k) => {
    const metric = (state.dayMetrics || []).find((m) => m.dateKey === k);
    const rec = (state.recovery || []).find((r) => r.dateKey === k);
    if (metric?.screenHr != null && rec?.difficulty != null) {
      screenVsDiff.push({ x: metric.screenHr, y: rec.difficulty, dateKey: k });
    }
  });

  if (screenVsDiff.length >= 3) {
    const highScreen = screenVsDiff.filter((p) => p.x >= 6);
    const normScreen = screenVsDiff.filter((p) => p.x < 5);

    const highAvg = highScreen.length
      ? highScreen.reduce((a, b) => a + b.y, 0) / highScreen.length
      : null;
    const normAvg = normScreen.length
      ? normScreen.reduce((a, b) => a + b.y, 0) / normScreen.length
      : null;

    if (highAvg != null && normAvg != null) {
      pairs.push({
        id: "corr-screen-recovery",
        title: "Screen Usage vs Urge Severity",
        varX: "Screen Usage (Hours)",
        varY: "Urge Severity (0-10)",
        sampleSize: screenVsDiff.length,
        quality: screenVsDiff.length >= 10 ? "High" : "Moderate",
        observation: `Extended screen time (>6h) is associated with higher logged urge severity (${highAvg.toFixed(
          1
        )}/10 vs ${normAvg.toFixed(1)}/10).`,
        disclaimer: "Correlation between screen exposure and impulse friction.",
        suggestedAction: "Enable phone cutoff boundaries 60 minutes before bed.",
        points: screenVsDiff,
      });
    }
  }

  // Fallback if overlapping data is insufficient
  if (!pairs.length) {
    pairs.push({
      id: "corr-insufficient",
      insufficientData: true,
      title: "NOT ENOUGH OVERLAPPING DATA",
      observation: "At least 5 overlapping days of sleep, screen usage, and recovery logs are needed to compute correlation views.",
      suggestedAction: "Continue logging daily context to unlock automated bivariate correlation views.",
    });
  }

  return pairs;
}

/* Automated Insights Feed Generator */
export function generateInsightsFeed(state, rangeKey = "30D") {
  const stats = computeSummaryStats(state, rangeKey);
  const insights = [];

  // Insight 1: Overall consistency
  if (stats.consistencyRate != null) {
    insights.push({
      id: "ins-consistency",
      title: "BEHAVIOR CONSISTENCY",
      observation: `Your overall scheduled action adherence is ${stats.consistencyRate}% over the selected ${stats.numDays}-day window.`,
      delta: stats.completionDelta ? `${stats.completionDelta > 0 ? "+" : ""}${stats.completionDelta}%` : null,
      confidence: stats.numDays >= 30 ? "High" : "Moderate",
      suggestedAction: "Protect your top 2 core actions daily rather than expanding too rapidly.",
    });
  }

  // Insight 2: Recovery redirection
  if (stats.redirectRate != null && stats.recLogsCount >= 3) {
    insights.push({
      id: "ins-redirection",
      title: "REDIRECTION RESILIENCE",
      observation: `You've successfully redirected through ${stats.redirectRate}% of logged difficult moments in this period.`,
      delta: null,
      confidence: "High",
      suggestedAction: "Repeat tested redirection techniques when initial triggers arise.",
    });
  }

  // Insight 3: Current streak
  if (stats.currentStreak >= 3) {
    insights.push({
      id: "ins-streak",
      title: "SYSTEM MOMENTUM",
      observation: `Active ${stats.currentStreak}-day continuous action streak recorded in your system logs.`,
      delta: `${stats.currentStreak}d`,
      confidence: "High",
      suggestedAction: "Maintain current routine pace for another week before adjusting target loads.",
    });
  }

  // Default fallback insight
  if (!insights.length) {
    insights.push({
      id: "ins-default",
      title: "SYSTEM INSIGHT",
      observation: "Your personal operating system is accumulating baseline data.",
      confidence: "Moderate",
      suggestedAction: "Complete daily actions and context check-ins to build deeper behavioral trends.",
    });
  }

  return insights;
}

/* Export Analytics Data in JSON or CSV Format */
export function exportAnalyticsData(state, format = "json") {
  const exportData = {
    version: state.version || 1,
    exportedAt: new Date().toISOString(),
    categories: state.categories || [],
    actions: state.actions || [],
    completionLog: state.completionLog || [],
    recovery: state.recovery || [],
    dayMetrics: state.dayMetrics || [],
  };

  if (format === "csv") {
    // Generate CSV for completions
    const headers = ["ID", "ActionID", "DateKey", "Value", "CreatedAt", "Note"];
    const rows = (state.completionLog || []).map((c) => [
      c.id,
      c.actionId,
      c.dateKey,
      c.value,
      c.createdAt || "",
      `"${(c.payload?.note || "").replace(/"/g, '""')}"`,
    ]);

    return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  }

  return JSON.stringify(exportData, null, 2);
}
