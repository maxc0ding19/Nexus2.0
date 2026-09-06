import { SEED_STATE } from "./src/data/seed.js";
import {
  recoverySummary,
  recoveryTrend,
  recoveryInsight,
  recoveryStats,
  recoveryTrendRange,
  recoveryPatternEngine,
  recoveryActionsList,
} from "./src/lib/selectors.js";
import { dateKey } from "./src/lib/time.js";

console.log("Testing Recovery Selectors with Seed State...");

try {
  const summary = recoverySummary(SEED_STATE);
  console.log("recoverySummary:", summary);

  const trend = recoveryTrend(SEED_STATE);
  console.log("recoveryTrend:", trend);

  const insight = recoveryInsight(SEED_STATE);
  console.log("recoveryInsight:", insight);

  const stats = recoveryStats(SEED_STATE, 14);
  console.log("recoveryStats:", stats);

  const trendPoints = recoveryTrendRange(SEED_STATE, 14);
  console.log("recoveryTrendRange points count:", trendPoints.length);

  const patterns = recoveryPatternEngine(SEED_STATE);
  console.log("recoveryPatternEngine patterns count:", patterns.length);

  const recActions = recoveryActionsList(SEED_STATE);
  console.log("recoveryActionsList count:", recActions.length);

  console.log("\nTesting with empty recovery array...");
  const emptyState = { ...SEED_STATE, recovery: [] };
  console.log("Empty summary:", recoverySummary(emptyState));
  console.log("Empty stats:", recoveryStats(emptyState, 14));
  console.log("Empty trendPoints:", recoveryTrendRange(emptyState, 14).length);
  console.log("Empty patterns:", recoveryPatternEngine(emptyState));

  console.log("\nTesting with corrupt recovery entry (missing dateKey / null fields)...");
  const corruptState = { ...SEED_STATE, recovery: [{ id: "corrupt-1" }, { id: "c2", dateKey: "invalid-date" }] };
  console.log("Corrupt summary:", recoverySummary(corruptState));
  console.log("Corrupt stats:", recoveryStats(corruptState, 14));
  console.log("Corrupt trendPoints:", recoveryTrendRange(corruptState, 14).length);
  console.log("Corrupt patterns:", recoveryPatternEngine(corruptState));

  console.log("\nALL RECOVERY TESTS PASSED!");
} catch (err) {
  console.error("RECOVERY SELECTOR CRASH:", err);
  process.exit(1);
}
