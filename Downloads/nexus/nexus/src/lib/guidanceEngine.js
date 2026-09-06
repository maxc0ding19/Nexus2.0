import { dateKey, fromKey, addDays, dayLabel } from "./time";
import { isScheduledOn, isComplete, getMetric } from "./selectors";

/* ------------------------------------------------------------
   NEXUS Guidance & Prioritization Engine — pure functions over state.
   Principles:
   - INSIGHT -> DECISION -> ACTION
   - Direct, Calm, Supportive, Analytical, Respectful
   - Never fabricate data or claim causation
   - 1-3 concise recommendations max
   ------------------------------------------------------------ */

export function computeSystemGuidance(state) {
  const tk = dateKey();
  const todayDate = new Date();

  const activeGoals = (state.goals || []).filter((g) => g.status === "active");
  const activeActions = (state.actions || []).filter((a) => !a.archived);
  const todayPrio = (state.priorities || []).filter((p) => p.dateKey === tk);
  const todayM = getMetric(state, tk);

  const recommendations = [];

  // 1. Check for Goal Deadlines or High Priorities
  const highGoal = activeGoals.find(
    (g) => g.priority === "high" || (g.targetDate && g.nextActionTitle)
  );

  if (highGoal && highGoal.nextActionTitle) {
    recommendations.push({
      id: "rec-goal",
      kind: "priority",
      title: "RECOMMENDED PRIORITY",
      heading: highGoal.nextActionTitle,
      why: `Target date for "${highGoal.name}" is ${highGoal.targetDate || "approaching"}.`,
      suggestedAction: highGoal.nextActionTitle,
      goalId: highGoal.id,
    });
  }

  // 2. Check for Overwhelm or Schedule Conflicts
  const scheduledToday = activeActions.filter((a) => isScheduledOn(a, todayDate));
  if (scheduledToday.length >= 7 || todayPrio.length > 3) {
    recommendations.push({
      id: "rec-overwhelm",
      kind: "conflict",
      title: "SCHEDULE DENSITY NOTICE",
      heading: `You have ${scheduledToday.length} scheduled actions today.`,
      why: "High schedule density is associated with reduced completion consistency.",
      suggestedAction: "Enable Focus Mode to concentrate on your top 3 core priorities.",
      enableFocusModeSuggestion: true,
    });
  }

  // 3. Check Recovery / Fatigue Context
  const recLogs = state.recovery || [];
  const latestRec = recLogs.find((r) => r.dateKey === tk);
  const lowSleep = todayM?.sleep != null && todayM.sleep < 6.2;

  if (lowSleep || (latestRec?.difficulty ?? 0) >= 6) {
    recommendations.push({
      id: "rec-recovery",
      kind: "recovery",
      title: "RECOVERY BOUNDARY SUGGESTION",
      heading: lowSleep ? "Sleep window was under 6.2 hours." : "Elevated urge difficulty detected.",
      why: "In your logged data, lower sleep coincides with higher urge difficulty.",
      suggestedAction: "Protect a strict wind-down cutoff at 22:30 tonight.",
    });
  }

  // Fallback if no specific conflict/goal condition met
  if (!recommendations.length && scheduledToday.length > 0) {
    const incomplete = scheduledToday.find((a) => !isComplete(state, a, tk));
    if (incomplete) {
      recommendations.push({
        id: "rec-next",
        kind: "action",
        title: "USEFUL NEXT ACTION",
        heading: incomplete.name,
        why: "Scheduled for today and aligns with your active routine.",
        suggestedAction: `Complete ${incomplete.name}`,
        actionId: incomplete.id,
      });
    }
  }

  // Limit to 3 recommendations maximum to avoid overwhelm
  return recommendations.slice(0, 3);
}

/* Execution-Oriented Metrics (Describes behavior without judging user worth) */
export function computeExecutionMetrics(state, numDays = 30) {
  const tk = dateKey();
  const endDate = fromKey(tk);

  // 1. Priority Completion Rate
  const recentPriorities = (state.priorities || []).filter((p) => {
    const age = (endDate - fromKey(p.dateKey)) / 86400000;
    return age >= 0 && age < numDays;
  });
  const donePrio = recentPriorities.filter((p) => p.done).length;
  const priorityCompletionRate = recentPriorities.length
    ? Math.round((donePrio / recentPriorities.length) * 100)
    : null;

  // 2. Action Consistency Rate
  const activeActions = (state.actions || []).filter((a) => !a.archived);
  let totalScheduled = 0;
  let totalMet = 0;

  for (let i = 0; i < numDays; i++) {
    const k = dateKey(addDays(endDate, -i));
    const d = fromKey(k);
    activeActions.forEach((a) => {
      if (isScheduledOn(a, d)) {
        totalScheduled++;
        if (isComplete(state, a, k)) totalMet++;
      }
    });
  }

  const actionConsistencyRate = totalScheduled > 0 ? Math.round((totalMet / totalScheduled) * 100) : null;

  // 3. Goal Progress Trajectory
  const activeGoals = (state.goals || []).filter((g) => g.status === "active");
  const avgGoalProgress = activeGoals.length
    ? Math.round(activeGoals.reduce((sum, g) => sum + (g.progress || 0), 0) / activeGoals.length)
    : null;

  // 4. Follow-Through Score (Composite 0-100%)
  const rates = [priorityCompletionRate, actionConsistencyRate, avgGoalProgress].filter(
    (r) => r != null
  );
  const followThroughScore = rates.length
    ? Math.round(rates.reduce((a, b) => a + b, 0) / rates.length)
    : null;

  return {
    priorityCompletionRate,
    actionConsistencyRate,
    avgGoalProgress,
    followThroughScore,
  };
}

/* Weekly Guidance Review Generator */
export function computeWeeklyGuidanceReview(state) {
  const tk = dateKey();
  const endDate = fromKey(tk);

  // Recent 7 days vs Previous 7 days completions
  let recentCompletions = 0;
  let prevCompletions = 0;

  for (let i = 0; i < 7; i++) {
    const k = dateKey(addDays(endDate, -i));
    const kPrev = dateKey(addDays(endDate, -i - 7));
    recentCompletions += (state.completionLog || []).filter((c) => c.dateKey === k).length;
    prevCompletions += (state.completionLog || []).filter((c) => c.dateKey === kPrev).length;
  }

  const completionDelta = prevCompletions > 0
    ? Math.round(((recentCompletions - prevCompletions) / prevCompletions) * 100)
    : 0;

  const whatImproved = [];
  const whatDeclined = [];
  const whatConsistent = [];

  if (completionDelta > 0) {
    whatImproved.push(`Action completion volume increased by ${completionDelta}% over the previous week.`);
  } else if (completionDelta < 0) {
    whatDeclined.push(`Action completion volume dropped by ${Math.abs(completionDelta)}% compared to the previous week.`);
  } else {
    whatConsistent.push("Action completion volume remained stable across both weeks.");
  }

  // Active goals check
  const activeGoals = (state.goals || []).filter((g) => g.status === "active");
  if (activeGoals.length > 0) {
    whatConsistent.push(`${activeGoals.length} strategic goals active with next actions assigned.`);
  }

  // Max 3 Suggested Focus Areas for next week
  const suggestedFocusAreas = [];
  if (completionDelta < 0) {
    suggestedFocusAreas.push("Reduce active priorities to 3 core daily outcomes.");
  }
  if (activeGoals.length > 0) {
    suggestedFocusAreas.push(`Execute next action for goal "${activeGoals[0].name}".`);
  }
  suggestedFocusAreas.push("Protect evening wind-down cutoff to guard sleep consistency.");

  return {
    whatImproved,
    whatDeclined,
    whatConsistent,
    suggestedFocusAreas: suggestedFocusAreas.slice(0, 3),
  };
}
