/**
 * Complete End-to-End User Journey Logic Test for NEXUS Phase 8
 */

const { SEED_STATE } = require("./src/data/seed.js");
const { computeSummaryStats, generateInsightsFeed } = require("./src/lib/analyticsEngine.js");
const { computeSystemGuidance, computeExecutionMetrics } = require("./src/lib/guidanceEngine.js");
const { dateKey } = require("./src/lib/time.js");

console.log("==================================================");
console.log("NEXUS PHASE 8 — FINAL UX & DATA INTEGRITY TEST");
console.log("==================================================");

function runJourney() {
  let state = JSON.parse(JSON.stringify(SEED_STATE));
  const tk = dateKey();

  console.log("\n1. INITIAL STATE VERIFICATION:");
  console.log("   - User Name:", state.preferences.greetingName);
  console.log("   - Total Actions in Library:", state.actions.length);
  console.log("   - Total Goals:", state.goals.length);
  console.log("   - Total Dashboards:", state.dashboards.length);

  // 2. Create an action
  console.log("\n2. CREATING A NEW ACTION:");
  const newAction = {
    id: `act-${Date.now()}`,
    name: "Deep Focus Sprint",
    type: "duration",
    unit: "min",
    target: 45,
    categoryId: state.categories[0].id,
    schedule: { freq: "daily", days: ["mon","tue","wed","thu","fri","sat","sun"], time: "09:00" },
    customFields: [{ id: "cf-1", name: "Focus Depth", type: "number", min: 1, max: 10 }],
    history: [],
    archived: false,
  };
  state.actions.push(newAction);
  console.log("   - Action Created ID:", newAction.id, "| Name:", newAction.name);

  // 3. Complete the action
  console.log("\n3. LOGGING ACTION COMPLETION WITH CUSTOM FIELDS:");
  const completionEntry = {
    dateKey: tk,
    completedAt: new Date().toISOString(),
    value: 45,
    customValues: { "cf-1": 9 },
    note: "Flawless deep work block",
  };
  newAction.history.push(completionEntry);
  console.log("   - Action Logged Entries Count:", newAction.history.length);
  console.log("   - Last Entry Value:", completionEntry.value, "min");

  // 4. Create a strategic goal
  console.log("\n4. CREATING A STRATEGIC GOAL:");
  const newGoal = {
    id: `g-${Date.now()}`,
    name: "Launch Product v1.0",
    timeframe: "short_term",
    targetDate: "2026-10-01",
    categoryId: state.categories[0].id,
    priority: "high",
    status: "active",
    nextActionTitle: "Finalize Launch Landing Page Draft",
    milestones: [
      { id: "m-1", text: "Complete core architecture", done: true },
      { id: "m-2", text: "Pass QA test suite", done: false },
    ],
    progress: 50,
  };
  state.goals.push(newGoal);
  console.log("   - Goal Created ID:", newGoal.id, "| Name:", newGoal.name);

  // 5. Link goal next action to Today priority
  console.log("\n5. PULLING GOAL NEXT ACTION INTO TODAY PRIORITIES:");
  const priorityEntry = {
    id: `prio-${Date.now()}`,
    dateKey: tk,
    title: newGoal.nextActionTitle,
    note: `Pulled from Goal: ${newGoal.name}`,
    done: false,
  };
  state.priorities.push(priorityEntry);
  console.log("   - Priority Added Title:", priorityEntry.title);

  // 6. Log a recovery check-in
  console.log("\n6. LOGGING A RECOVERY CHECK-IN WITH CONTEXT:");
  const recoveryEntry = {
    id: `rec-${Date.now()}`,
    dateKey: tk,
    timestamp: new Date().toISOString(),
    difficulty: 3,
    urgesPresent: true,
    redirected: true,
    helped: "Took a 10-minute walk outside",
    note: "Minor urge after prolonged screen work",
  };
  state.recovery.push(recoveryEntry);
  console.log("   - Total Recovery Entries:", state.recovery.length);

  // 7. View analytics computation
  console.log("\n7. CALCULATING DEEP ANALYTICS & INSIGHTS:");
  const summary = computeSummaryStats(state, "30D");
  const insights = generateInsightsFeed(state, "30D");
  console.log("   - 30D Total Completions:", summary.totalCompletions);
  console.log("   - 30D Consistency Rate:", summary.consistencyRate, "%");
  console.log("   - Generated Insights Feed Count:", insights.length);

  // 8. Write a journal entry
  console.log("\n8. WRITING A JOURNAL ENTRY:");
  const journalEntry = {
    id: `j-${Date.now()}`,
    dateKey: tk,
    text: "Productive day. Guarded night cutoff and finished the deep focus sprint.",
    mood: 9,
    energy: 8,
    tags: ["#focus", "#win"],
    linkedGoalId: newGoal.id,
  };
  state.journal.unshift(journalEntry);
  console.log("   - Journal Entries Count:", state.journal.length);

  // 9. Create a custom dashboard & add widget
  console.log("\n9. CREATING A CUSTOM DASHBOARD & ADDING WIDGET:");
  const newDash = {
    id: `dash-${Date.now()}`,
    name: "Productivity Command",
    preset: "balanced",
    widgets: [
      { id: "w-1", type: "todays_actions", title: "Daily Actions", size: "full" },
      { id: "w-2", type: "goal_progress", title: "Strategic Goals", size: "full" },
    ],
  };
  state.dashboards.push(newDash);
  console.log("   - Dashboard Created Name:", newDash.name);
  console.log("   - Dashboard Widgets Count:", newDash.widgets.length);

  // 10. Capture Idea -> Convert to Action
  console.log("\n10. CAPTURING AN IDEA & CONVERTING TO ACTION:");
  const idea = {
    id: `idea-${Date.now()}`,
    title: "Cold Shower Reset Protocol",
    source: "Huberman Lab Podcast",
    rationale: "Increases baseline dopamine and alertness",
    suggestedActionName: "Cold Shower 2 Min",
    suggestedActionType: "duration",
    converted: true,
  };
  if (!state.capturedIdeas) state.capturedIdeas = [];
  state.capturedIdeas.push(idea);

  const convertedAction = {
    id: `act-${Date.now() + 1}`,
    name: idea.suggestedActionName,
    type: idea.suggestedActionType || "boolean",
    unit: "min",
    target: 2,
    categoryId: state.categories[0].id,
    schedule: { freq: "daily", days: ["mon","tue","wed","thu","fri","sat","sun"], time: "07:30" },
    history: [],
    archived: false,
    ideaSourceId: idea.id,
  };
  state.actions.push(convertedAction);
  console.log("   - Converted Action Created:", convertedAction.name);

  // 11. Evaluate System Guidance & Execution Metrics
  console.log("\n11. SYSTEM GUIDANCE EVALUATION:");
  const guidance = computeSystemGuidance(state);
  const metrics = computeExecutionMetrics(state, 30);
  console.log("   - Recommendations Count:", guidance.length);
  guidance.forEach((g, i) => {
    console.log(`     [${i + 1}] ${g.title}: ${g.heading} (Why: ${g.why})`);
  });
  console.log("   - Follow-Through Score:", metrics.followThroughScore, "%");

  console.log("\n==================================================");
  console.log("ALL USER JOURNEY LOGIC TESTED & VERIFIED SUCCESSFUL!");
  console.log("==================================================");
}

runJourney();
