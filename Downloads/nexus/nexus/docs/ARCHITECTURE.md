# NEXUS — Technical Architecture

Stack: **React 18 + Vite 5 (vanilla JSX)**. No UI framework — the entire
interface is hand-built on a small set of design tokens and reusable
components for total control over the aesthetic and performance.

```
src/
├─ main.jsx                  # entry, mounts <App/>
├─ App.jsx                   # shell, routing (#/hash), primary nav
├─ styles/
│  ├─ theme.css              # design tokens (colors/type/motion/spacing)
│  ├─ base.css               # reset, typography primitives, textures
│  ├─ ui.css                 # panels, buttons, tags, inputs, lists…
│  ├─ nav.css                # bottom dock + side rail + responsive
│  ├─ screens.css            # screen-level layouts
│  └─ modal.css              # sheet/dialog
├─ data/
│  ├─ constants.js           # domain vocabulary (action types, schedule…)
│  └─ seed.js                # deterministic demo data (NOT baked-in logic)
├─ lib/
│  ├─ time.js                # local-day keys, ranges, formatting
│  ├─ format.js              # formatting + sparkline paths
│  └─ selectors.js           # pure functions: today's state, insights…
├─ store/
│  └─ AppContext.jsx         # state + explicit mutation API, persisted
├─ components/               # reusable UI
│  ├─ primitives.jsx         # Panel, Ring, Bar, Button, SysLabel…
│  ├─ icons.jsx / iconset.jsx# line icon system (resolved by name)
│  ├─ brand.jsx, Modal.jsx, common.jsx, ActionToggleRow.jsx,
│  └─ CheckInModal.jsx
└─ screens/
   ├─ TodayScreen.jsx        # STEP 4 — the command center
   ├─ RecoveryScreen.jsx     # STEP 6 foundation (functional)
   ├─ ActionsScreen.jsx      # STEP 5 scaffold
   ├─ AnalyticsScreen.jsx    # STEP 7 scaffold
   └─ MoreScreen.jsx         # settings foundation (Step 9 partial)
```

## State model

The store is a single document persisted to `localStorage` under
`nexus.state.v1`. Mutations are explicit (never ad-hoc) and the document is
**versioned** (`version`, `schema`) so future migrations are possible.

```
{
  schema, version,
  meta,                // createdAt, lastOpenAt, demo flag
  preferences,         // name, timeFormat, weekStarts, insightLevel
  categories,          // user-defined taxonomy
  actions,             // fully customizable action definitions
  completionLog,       // per-action, per-day logs
  priorities,          // daily outcome lists
  dayMetrics,          // sleep/screen/energy/stress/mood/social per day
  recovery,            // recovery check-in entries
  journal, goals, dashboards, tiles
}
```

An **action definition** carries its full configuration (Step 5 target):

```
{ id, name, desc, icon, categoryId,
  type,       // boolean|quantity|duration|count|scale|avoidance|journal|event
  unit, target,
  schedule,   // { freq: daily|weekdays|weekends|custom|manual, time, days[] }
  valence,    // positive | negative(reduction) | neutral
  tracking,   // { analytics, recovery } inclusion toggles
  notes, customFields?, archived }
```

## Selector layer (the "brain")

`lib/selectors.js` keeps UI thin and answers the NEXUS questions in one place:

- `todayActions`, `nextAction`, `isComplete`, `logEntry`
- `systemStatus` (Today compact metrics)
- `recoverySummary`, `recoveryTrend`, `recoveryInsight`
- `metricAvg`, `completionRateOn`, `pickInsight` (Today's single insight)
- `goalProgress`, `priorJournalStreak`

Insights follow **DATA → OBSERVATION → PATTERN → EXPERIMENT** and always carry a
confidence label and a caveat (correlation ≠ causation).

## Design tokens (`styles/theme.css`)

- `--surface-*` surface stack, `--glass*` translucent panels
- `--text-1..4` hierarchy, `--ok/--warn/--neg/--info` status signals
- `--font-sans/--font-mono`, spacing scale, radii, elevation, motion timing
- Mobile-first; breakpoints at 560px (grid) and 1080px (side rail)

## Next build phases

See `README.md`. Advanced modules (editor UI, deep charting, dashboards,
journal/goals) are designed to plug onto the existing model without reshaping
the foundations.
