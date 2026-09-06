import { dateKey, fromKey, addDays, dayLabel } from "./time";
import { ACTION_TYPES, VALENCE } from "../data/constants";

/* ------------------------------------------------------------
   NEXUS selectors — pure functions over state.
   Centralizes "what is true right now" so UI components stay thin.
   ------------------------------------------------------------ */

export function isScheduledOn(act, date) {
  const s = act.schedule || {};
  const freq = s.freq || "manual";
  const dow = date.getDay();
  if (freq === "daily") return true;
  if (freq === "weekdays") return dow !== 0 && dow !== 6;
  if (freq === "weekends") return dow === 0 || dow === 6;
  if (freq === "custom") return (s.days || []).includes(dow);
  return false;
}

export function getMetric(state, key) {
  return (state.dayMetrics || []).find((m) => m.dateKey === key);
}

/* Average of a metric over the last n days ending at today. */
export function metricAvg(state, field, n = 7, todayKey = dateKey()) {
  const ds = [];
  const today = fromKey(todayKey);
  for (let i = 0; i < n; i++) {
    const m = getMetric(state, dateKey(addDays(today, -i)));
    if (m && m[field] != null) ds.push(m[field]);
  }
  if (!ds.length) return null;
  return ds.reduce((a, b) => a + b, 0) / ds.length;
}

/* Total "goal" count of daily-scheduled active actions. */
function countDailyScheduled(state) {
  return state.actions.filter((a) => !a.archived && isScheduledOn(a, fromKey(dateKey())))
    .length;
}

export function completionRateOn(state, key) {
  const acts = state.actions.filter((a) => !a.archived && isScheduledOn(a, fromKey(key)));
  if (!acts.length) return null;
  let met = 0;
  for (const a of acts) {
    if (isComplete(state, a, key)) met++;
  }
  return { done: met, total: acts.length, rate: met / acts.length };
}

/* A single action is "complete" for a day if a log entry exceeds/meets target,
   OR a boolean-type log exists. For journal/event we treat logged as complete.
   Avoidance = respect => logged means it was respected. */
export function isComplete(state, act, key) {
  const entry = logEntry(state, act.id, key);
  if (!entry) return false;
  const t = act.type;
  if (t === "boolean" || t === "journal" || t === "event" || t === "avoidance")
    return true;
  const target = act.target ?? 0;
  const logVal = entry.value ?? 0;
  if (t === "scale") return true;
  return logVal >= target * 0.9;
}

export function logEntry(state, actionId, key) {
  return (state.completionLog || []).find(
    (c) => c.actionId === actionId && c.dateKey === key
  );
}

/* ---- System status (compact summary for Today) -------------- */
export function systemStatus(state) {
  const tk = dateKey();
  const sleep = getMetric(state, tk)?.sleep;
  const m = {
    Sleep: {
      value: sleep != null ? Math.min(10, sleep) / 10 : null,
      display: sleep != null ? `${sleep.toFixed(1)}h` : "—",
      field: "sleep",
    },
    Energy: {
      value: (getMetric(state, tk)?.energy ?? 0) / 10,
      display: `${getMetric(state, tk)?.energy ?? "—"}/10`,
      field: "energy",
    },
    Screen: {
      value: null,
      display: getMetric(state, tk)?.screenHr != null ? `${getMetric(state, tk).screenHr}h` : "—",
      field: "screenHr",
      invert: true,
    },
    Stress: {
      value: (getMetric(state, tk)?.stress ?? 0) / 10,
      display: `${getMetric(state, tk)?.stress ?? "—"}/10`,
      field: "stress",
      invert: true,
    },
    Consistency: {
      value: null,
      display: null,
      field: "consistency",
    },
  };
  // Consistency = completion rate over last 7 days
  const last7 = [];
  const today = fromKey(tk);
  for (let i = 0; i < 7; i++) {
    const cr = completionRateOn(state, dateKey(addDays(today, -i)));
    if (cr) last7.push(cr.rate);
  }
  if (last7.length) {
    const avg = last7.reduce((a, b) => a + b, 0) / last7.length;
    m.Consistency.value = avg;
    m.Consistency.display = `${Math.round(avg * 100)}%`;
  }

  return Object.entries(m).map(([label, v]) => ({
    label,
    ...v,
  }));
}

/* ---- Recovery overview ------------------------------------- */
export function recoveryRecent(state, n = 7, endKey = dateKey()) {
  const end = fromKey(endKey);
  const out = [];
  for (let i = 0; i < n; i++) {
    const k = dateKey(addDays(end, -i));
    const e = (state.recovery || []).find((r) => r && r.dateKey === k);
    out.push({ dateKey: k, difficulty: e ? e.difficulty : null });
  }
  return out.reverse();
}

export function recoveryToday(state) {
  const tk = dateKey();
  return (state.recovery || []).find((r) => r && r.dateKey === tk) || null;
}

export function recoverySummary(state) {
  const week = (state.recovery || [])
    .filter((r) => {
      if (!r || !r.dateKey) return false;
      const age = (fromKey(dateKey()) - fromKey(r.dateKey)) / 86400000;
      return age >= 0 && age < 7;
    })
    .map((r) => r.difficulty);
  if (!week.length) return { days: 0, avgDifficulty: null, redirectedRate: null };
  const avg = week.reduce((a, b) => a + b, 0) / week.length;
  const redirected = week.filter((d) => d < 6).length / week.length;
  return { days: week.length, avgDifficulty: avg, redirectedRate: redirected };
}

/* Simple trend over last 14 days (difficulty lower = better). */
export function recoveryTrend(state) {
  const two = (state.recovery || [])
    .filter((r) => {
      if (!r || !r.dateKey) return false;
      const age = (fromKey(dateKey()) - fromKey(r.dateKey)) / 86400000;
      return age >= 0 && age < 14;
    })
    .sort((a, b) => (a.dateKey || "").localeCompare(b.dateKey || ""))
    .map((r) => r.difficulty);
  if (two.length < 4) return null;
  const first = two.slice(0, 7);
  const last = two.slice(-7);
  const fa = first.reduce((a, b) => a + b, 0) / first.length;
  const la = last.reduce((a, b) => a + b, 0) / last.length;
  return { older: fa, recent: la, delta: la - fa };
}

/* ---- Actions for today ------------------------------------- */
export function todayActions(state) {
  const tk = dateKey();
  const scheduled = state.actions
    .filter((a) => !a.archived && isScheduledOn(a, fromKey(tk)))
    .map((a) => {
      const entry = logEntry(state, a.id, tk);
      return { ...a, done: isComplete(state, a, tk), entry };
    });
  // order: incomplete first, then by scheduled time, then name
  const sortKey = (a) => {
    const t = a.schedule?.time || "23:59";
    const type = ACTION_TYPES[a.type]?.label || "";
    return `${a.done ? "1" : "0"}-${t}-${a.name}`;
  };
  return scheduled.sort((a, b) => sortKey(a).localeCompare(sortKey(b)));
}

export function nextAction(state) {
  const acts = todayActions(state);
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  // First incomplete action whose scheduled time is upcoming; else first incomplete.
  for (const a of acts) {
    if (a.done) continue;
    const [h, m] = (a.schedule?.time || "00:00").split(":").map(Number);
    if (h * 60 + m >= nowMin) return a;
  }
  return acts.find((a) => !a.done) || null;
}

export function greeting(date = new Date()) {
  const h = date.getHours();
  if (h < 5) return "Up late";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

/* ---- Journal helpers --------------------------------------- */
export function journalEntryOn(state, key) {
  return (state.journal || []).find((j) => j.dateKey === key) || null;
}

export function priorJournalStreak(state, endKey = dateKey()) {
  // consecutive days (ending endKey, exclusive if endKey has one already) with journal
  let streak = 0;
  const has = (k) => (state.journal || []).some((j) => j.dateKey === k);
  let cursor = fromKey(endKey);
  if (!has(endKey)) cursor = addDays(cursor, -1);
  while (has(dateKey(cursor))) {
    streak++;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

/* ---- Goal progress ----------------------------------------- */
export function goalProgress(state, goal) {
  if (!goal || goal.progress == null) return 0;
  return Math.max(0, Math.min(1, goal.progress));
}

/* ---- NEXUS single insight for the Today screen ------------- */
export function pickInsight(state) {
  const tk = dateKey();
  const todayM = getMetric(state, tk);
  const sleep = metricAvg(state, "sleep", 7, tk);
  const screen = metricAvg(state, "screenLate", 7, tk);

  const r7 = recoveryRecent(state, 7, tk).map((r) => r.difficulty);
  const diffs = r7.filter((v) => v != null);
  const anyHigh = diffs.some((d) => d >= 7);

  if (anyHigh && sleep != null && sleep < 6.8) {
    return {
      kind: "pattern",
      title: "Pattern detected",
      tone: "warn",
      observation:
        "Recent high-difficulty recovery periods are more frequent on low-sleep days.",
      confidence: "Moderate",
      experiment:
        "Protect a 7+ hour sleep window for the next week and compare logged difficulty.",
      caveat: "Observed pattern, not a guaranteed cause.",
    };
  }
  if (todayM && todayM.screenHr != null && todayM.screenHr > 6) {
    return {
      kind: "experiment",
      title: "System insight",
      tone: "info",
      observation: "Today's screen usage is above your recent daily average.",
      confidence: "High",
      experiment:
        "Try a hard screen cutoff 60 minutes before bed and note your energy tomorrow.",
      caveat: "Correlation is not causation.",
    };
  }
  if (diffs.length >= 5) {
    const redirected = diffs.filter((d) => d < 6).length / diffs.length;
    if (redirected >= 0.6) {
      return {
        kind: "positive",
        title: "Continue forward",
        tone: "ok",
        observation: `You've redirected through ${Math.round(
          redirected * 100
        )}% of logged difficult moments this week.`,
        confidence: "High",
        experiment: "Repeat the redirect that worked — name it so you can use it again.",
        caveat: "",
      };
    }
  }
  if (sleep != null) {
    return {
      kind: "observation",
      title: "Observation",
      tone: "neutral",
      observation: `Average sleep over the last 7 days is ${sleep.toFixed(1)}h.`,
      confidence: "High",
      experiment: "Prioritize your wind-down as your top recovery lever this week.",
      caveat: "",
    };
  }
  return null;
}

/* Recovery insight explaining a pattern in terms of context. */
export function recoveryInsight(state) {
  const rec = (state.recovery || []).filter((r) => {
    if (!r || !r.dateKey) return false;
    const age = (fromKey(dateKey()) - fromKey(r.dateKey)) / 86400000;
    return age >= 0 && age < 14;
  });
  const hard = rec.filter((r) => (r.difficulty ?? 0) >= 6);
  if (!hard.length) return null;
  const lowSleep = hard.filter((r) => r.factors?.sleep != null && r.factors.sleep < 6).length;
  const highScreen = hard.filter((r) => r.factors?.screen != null && r.factors.screen > 5).length;
  let driver = null;
  if (lowSleep >= hard.length * 0.4)
    driver = { label: "low sleep", share: lowSleep / hard.length, factor: "sleep" };
  else if (highScreen >= hard.length * 0.4)
    driver = { label: "high screen time", share: highScreen / hard.length, factor: "screen" };
  if (!driver) return null;
  return {
    observation: `In the last 2 weeks, ${hard.length} difficult periods were logged. ${Math.round(
      driver.share * 100
    )}% of them occurred on days with ${driver.label}.`,
    confidence: "Moderate",
    caveat: "This is an observed pattern, not a guaranteed cause.",
  };
}

/* Multi-dimensional recovery statistics over a specific window (7, 30, 90, or 'all'). */
export function recoveryStats(state, windowDays = 30, endKey = dateKey()) {
  const endDate = fromKey(endKey);
  const isAll = windowDays === "all";
  const numDays = isAll ? 3650 : Number(windowDays);

  const entries = (state.recovery || []).filter((r) => {
    if (!r || !r.dateKey) return false;
    if (isAll) return true;
    const age = (endDate - fromKey(r.dateKey)) / 86400000;
    return age >= 0 && age < numDays;
  });

  if (!entries.length) {
    return {
      totalLogs: 0,
      avgDifficulty: null,
      redirectCount: 0,
      setbackCount: 0,
      urgeCount: 0,
      redirectRate: null,
      daysSinceSetback: null,
      topWhatHelped: [],
      todDistribution: { morning: 0, afternoon: 0, evening: 0, night: 0 },
      aloneRate: null,
      trajectory: "No data",
    };
  }

  const diffs = entries.map((e) => e.difficulty).filter((d) => d != null);
  const avgDifficulty = diffs.length ? diffs.reduce((a, b) => a + b, 0) / diffs.length : null;

  const redirectCount = entries.filter(
    (e) => e.redirected === true || e.eventType === "redirection"
  ).length;

  const setbackCount = entries.filter(
    (e) => e.eventType === "setback" || (e.redirected === false && (e.difficulty ?? 0) >= 6)
  ).length;

  const urgeCount = entries.filter(
    (e) => e.eventType === "urge" || e.eventType === "difficult_moment" || (e.difficulty ?? 0) >= 5
  ).length;

  const totalEvaluated = redirectCount + setbackCount;
  const redirectRate = totalEvaluated > 0 ? redirectCount / totalEvaluated : null;

  // Days since last setback
  const setbacks = (state.recovery || [])
    .filter((e) => e.eventType === "setback" || (e.redirected === false && (e.difficulty ?? 0) >= 6))
    .sort((a, b) => b.dateKey.localeCompare(a.dateKey));

  let daysSinceSetback = null;
  if (setbacks.length > 0) {
    const lastSetbackDate = fromKey(setbacks[0].dateKey);
    daysSinceSetback = Math.max(0, Math.floor((endDate - lastSetbackDate) / 86400000));
  } else if (entries.length > 0) {
    const oldest = entries.sort((a, b) => a.dateKey.localeCompare(b.dateKey))[0];
    daysSinceSetback = Math.max(0, Math.floor((endDate - fromKey(oldest.dateKey)) / 86400000));
  }

  // Top what helped
  const helpedCounts = {};
  entries.forEach((e) => {
    if (e.whatHelped) {
      const items = Array.isArray(e.whatHelped) ? e.whatHelped : [e.whatHelped];
      items.forEach((item) => {
        const str = String(item).trim();
        if (str) helpedCounts[str] = (helpedCounts[str] || 0) + 1;
      });
    }
  });

  const topWhatHelped = Object.entries(helpedCounts)
    .map(([text, count]) => ({ text, count }))
    .sort((a, b) => b.count - a.count);

  // Time of day distribution
  const todDistribution = { morning: 0, afternoon: 0, evening: 0, night: 0 };
  entries.forEach((e) => {
    if (e.timeOfDay && todDistribution[e.timeOfDay] != null) {
      todDistribution[e.timeOfDay]++;
    }
  });

  // Alone rate
  const aloneLogs = entries.filter((e) => e.factors?.alone === true || e.alone === true);
  const aloneRate = entries.length ? aloneLogs.length / entries.length : null;

  // Trajectory comparison
  let trajectory = "Steady";
  if (entries.length >= 4 && avgDifficulty != null) {
    const half = Math.floor(entries.length / 2);
    const sorted = [...entries].sort((a, b) => a.dateKey.localeCompare(b.dateKey));
    const olderHalf = sorted.slice(0, half).map((e) => e.difficulty).filter((d) => d != null);
    const recentHalf = sorted.slice(half).map((e) => e.difficulty).filter((d) => d != null);
    if (olderHalf.length && recentHalf.length) {
      const oldAvg = olderHalf.reduce((a, b) => a + b, 0) / olderHalf.length;
      const recAvg = recentHalf.reduce((a, b) => a + b, 0) / recentHalf.length;
      const diff = recAvg - oldAvg;
      if (diff <= -0.5) trajectory = "Improving";
      else if (diff >= 0.5) trajectory = "Elevated strain";
      else trajectory = "Steady";
    }
  }

  return {
    totalLogs: entries.length,
    avgDifficulty,
    redirectCount,
    setbackCount,
    urgeCount,
    redirectRate,
    daysSinceSetback,
    topWhatHelped,
    todDistribution,
    aloneRate,
    trajectory,
  };
}

/* Trend points array for 7, 30, 90, or all days. */
export function recoveryTrendRange(state, windowDays = 30, endKey = dateKey()) {
  const endDate = fromKey(endKey);
  const isAll = windowDays === "all";
  const numDays = isAll ? 90 : Math.min(Number(windowDays), 90);

  const points = [];
  for (let i = numDays - 1; i >= 0; i--) {
    const k = dateKey(addDays(endDate, -i));
    const dayEntries = (state.recovery || []).filter((r) => r.dateKey === k);
    
    if (!dayEntries.length) {
      points.push({
        dateKey: k,
        dateLabel: dayLabel(fromKey(k)),
        difficulty: null,
        redirected: null,
        count: 0,
        hasSetback: false,
      });
    } else {
      const diffs = dayEntries.map((e) => e.difficulty).filter((d) => d != null);
      const avgDiff = diffs.length ? diffs.reduce((a, b) => a + b, 0) / diffs.length : null;
      const hasSetback = dayEntries.some(
        (e) => e.eventType === "setback" || (e.redirected === false && (e.difficulty ?? 0) >= 6)
      );
      const allRedirected = dayEntries.every((e) => e.redirected !== false);

      points.push({
        dateKey: k,
        dateLabel: dayLabel(fromKey(k)),
        difficulty: avgDiff,
        redirected: allRedirected,
        count: dayEntries.length,
        hasSetback,
      });
    }
  }

  return points;
}

/* Dedicated Pattern Analysis Engine: DATA -> OBSERVATION -> POSSIBLE PATTERN -> SUGGESTED ACTION */
export function recoveryPatternEngine(state) {
  const logs = state.recovery || [];
  if (logs.length < 3) {
    return [
      {
        id: "insufficient-data",
        insufficientData: true,
        title: "NOT ENOUGH DATA",
        observation: "Continue logging recovery events and daily context to identify meaningful patterns.",
        suggestedAction: "Log at least 5–7 entries with context factors (sleep, screen time, stress) to unlock pattern analysis.",
      },
    ];
  }

  const patterns = [];

  // 1. Sleep Correlation
  const hardLogs = logs.filter((r) => (r.difficulty ?? 0) >= 5 || r.eventType === "setback" || r.eventType === "urge");
  if (hardLogs.length >= 2) {
    const lowSleepLogs = hardLogs.filter((r) => {
      const s = r.factors?.sleep;
      const metricS = getMetric(state, r.dateKey)?.sleep;
      return (s != null && s < 6) || (metricS != null && metricS < 6.2);
    });

    if (lowSleepLogs.length / hardLogs.length >= 0.35) {
      const pct = Math.round((lowSleepLogs.length / hardLogs.length) * 100);
      patterns.push({
        id: "pat-sleep",
        kind: "pattern",
        title: "PATTERN DETECTED",
        tone: "warn",
        factor: "sleep",
        observation: `Recent difficult periods appear more frequently on days with lower sleep. ${pct}% of urges occurred when sleep was under 6 hours.`,
        confidence: pct >= 65 ? "High" : "Moderate",
        disclaimer: "This is a correlation in your logged data, not proof that sleep caused the pattern.",
        suggestedAction: "Protect your normal sleep routine tonight and maintain a consistent wind-down cutoff.",
      });
    }
  }

  // 2. Time of Day Peak
  const todCounts = { morning: 0, afternoon: 0, evening: 0, night: 0 };
  let todTotal = 0;
  logs.forEach((r) => {
    if (r.timeOfDay && todCounts[r.timeOfDay] != null) {
      todCounts[r.timeOfDay]++;
      todTotal++;
    }
  });

  if (todTotal >= 4) {
    const [topTod, topCount] = Object.entries(todCounts).sort((a, b) => b[1] - a[1])[0];
    const todPct = Math.round((topCount / todTotal) * 100);
    if (todPct >= 40) {
      const todName = topTod === "night" ? "late night" : topTod;
      patterns.push({
        id: "pat-tod",
        kind: "pattern",
        title: "TIME OF DAY PATTERN",
        tone: "info",
        factor: "timeOfDay",
        observation: `${todPct}% of your logged recovery events occur during the ${todName}.`,
        confidence: todPct >= 60 ? "High" : "Moderate",
        disclaimer: "Environment and fatigue factors often peak at specific hours.",
        suggestedAction: `Prepare a specific boundary or redirection rule before entering your ${todName} routine.`,
      });
    }
  }

  // 3. Screen Usage Pattern
  const highScreenLogs = hardLogs.filter((r) => {
    const scr = r.factors?.screen;
    const metricScr = getMetric(state, r.dateKey)?.screenHr;
    return (scr != null && scr >= 6) || (metricScr != null && metricScr >= 6);
  });

  if (highScreenLogs.length >= 2 && highScreenLogs.length / Math.max(1, hardLogs.length) >= 0.35) {
    patterns.push({
      id: "pat-screen",
      kind: "pattern",
      title: "SCREEN USAGE CORRELATION",
      tone: "warn",
      factor: "screen",
      observation: "High screen usage (>6h/day or late scrolling) coincides with elevated urge frequency.",
      confidence: "Moderate",
      disclaimer: "Extended screen exposure may lower friction for impulsive responses.",
      suggestedAction: "Enable the Phone Boundary action 60 minutes before your target sleep time.",
    });
  }

  // 4. Redirection Effectiveness
  const redirectedLogs = logs.filter((r) => r.redirected === true && r.whatHelped);
  if (redirectedLogs.length >= 2) {
    const helpedMap = {};
    redirectedLogs.forEach((r) => {
      const str = String(r.whatHelped).trim();
      if (str) helpedMap[str] = (helpedMap[str] || 0) + 1;
    });
    const sortedHelped = Object.entries(helpedMap).sort((a, b) => b[1] - a[1]);
    if (sortedHelped.length > 0) {
      const [topStrategy, count] = sortedHelped[0];
      patterns.push({
        id: "pat-redirection",
        kind: "observation",
        title: "EFFECTIVE REDIRECTION",
        tone: "ok",
        factor: "redirection",
        observation: `"${topStrategy}" has been your most effective redirection tool (used ${count} times).`,
        confidence: "High",
        disclaimer: "Tested responses build reliable default pathways when urges occur.",
        suggestedAction: "Keep this strategy as your primary default when feeling initial urges.",
      });
    }
  }

  // Fallback
  if (!patterns.length) {
    patterns.push({
      id: "pat-steady",
      kind: "observation",
      title: "SYSTEM STABILITY",
      tone: "ok",
      factor: "general",
      observation: "Your logged recovery data shows steady resilience with low urge volatility across recent days.",
      confidence: "Moderate",
      disclaimer: "Patterns evolve as more context entries are recorded.",
      suggestedAction: "Maintain daily logging to catch early subtle shifts in fatigue or stress.",
    });
  }

  return patterns;
}

/* Actions associated with recovery or boundaries */
export function recoveryActionsList(state) {
  return (state.actions || []).filter(
    (a) => !a.archived && (a.categoryId === "cat-recovery" || a.tracking?.recovery === true)
  );
}
