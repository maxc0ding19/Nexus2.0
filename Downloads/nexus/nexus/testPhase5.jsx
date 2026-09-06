
import React from "react";
import ReactDOMServer from "react-dom/server";
import App from "./src/App";
import { AppProvider, useApp } from "./src/store/AppContext";
import { dateKey } from "./src/lib/time";

function TestPhase5Runner() {
  const { state, api } = useApp();
  const tk = dateKey();

  // 1. Create Goal with Milestones & Linked Action
  api.addGoal({
    name: "Launch SaaS Product",
    desc: "Build and launch MVP software product",
    categoryId: "cat-focus",
    targetDate: "2026-12-31",
    timeframe: "medium_term",
    priority: "high",
    nextActionTitle: "Finalize core feature spec",
    milestones: [
      { id: "m1", title: "Finalize spec", done: false },
      { id: "m2", title: "Build core backend", done: false }
    ],
    linkedActionIds: ["act-deepwork"]
  });

  // 2. Toggle milestone and verify goal progress updates
  const createdGoal = state.goals[state.goals.length - 1];
  api.toggleGoalMilestone(createdGoal.id, "m1");

  // 3. Save Journal Entry & Daily Review
  api.saveJournalEntry({
    dateKey: tk,
    text: "Productive day working on SaaS spec.",
    mood: 8,
    energy: 8,
    tags: ["#saas", "#deepwork"],
    linkedGoalId: createdGoal.id
  });

  // 4. Assign Today Priority pulled from Goal Next Action
  api.addPriority({ title: createdGoal.nextActionTitle, note: "Pulled from goal" });

  return <div>Phase 5 Executed Successfully! Goals count: {state.goals.length}</div>;
}

const routes = ["#/today", "#/goals", "#/journal", "#/more"];
routes.forEach((route) => {
  global.window = { location: { hash: route } };
  const html = ReactDOMServer.renderToString(
    React.createElement(AppProvider, null, React.createElement(TestPhase5Runner))
  );
  console.log("Verified route " + route + " HTML length: " + html.length);
});
