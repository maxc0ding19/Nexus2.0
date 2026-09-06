# NEXUS — Personal Operating System

> **Where am I? · What matters today? · What do I do next?**

NEXUS is a premium, mobile-first self-improvement application. It is not a
habit tracker or a gamified productivity app. It is a *personal operating
system* built to help you understand your behavior, spot patterns, and convert
long-term goals into a small number of clear daily actions — while reducing
information overload instead of adding to it.

No XP. No levels. No coins. No badges. No cartoon graphics. A serious,
disciplined, technical aesthetic that uses color only to communicate *status*.

---

## Current status — Production Ready (Phase 1–8 complete)

| Area | Status |
| --- | --- |
| **1. Data architecture** | ✅ Extensible domain model + seed system |
| **2. Design system** | ✅ Monochrome dark OS theme, tokens, components |
| **3. Responsive navigation** | ✅ Mobile bottom dock + desktop side rail |
| **4. Today Command Center** | ✅ Functional, interactive |
| **5. Recovery System (Phase 2)** | ✅ Overview, Event Log, Pattern Engine & Insights, Boundaries |
| **6. Custom Actions System (Phase 3)** | ✅ 8 Native Types, Custom Fields, Categories, History, Detail Views |
| **7. Analytics Engine (Phase 4)** | ✅ Command Center, Behavior Dive, Heatmaps, Correlations, Export |
| **8. Goals & Journaling System (Phase 5)** | ✅ Breakdown OS, Next Action Pulling, Daily & Weekly Reviews |
| **9. Custom Dashboards System (Phase 6)** | ✅ Multiple Dashboards, Widget Library, Configurator, Presets |
| **10. Guidance & Prioritization (Phase 7)** | ✅ Focus Mode, System Guidance, Idea Guardrails, Execution Metrics |
| **11. Product Polish & UX Refinement (Phase 8)** | ✅ Premium Polish, Micro-Animations, Mobile & Touch Optimization, Data Safety |

## Running

```bash
cd nexus
npm install
npm run dev      # http://localhost:5173
npm run build    # production build → dist/
```

## Build order philosophy

Everything is built in layers so that each system works before the next is
added. Advanced features are deliberately **not** all shipped in one pass —
foundations are verified first, then modules expand incrementally.

---

## Product systems

### Today Command Center (Step 4)
A single screen that answers the three NEXUS questions:

- **Header** — time, date, greeting, live `SYSTEM ONLINE` status.
- **Recovery overview** — status ring, trend, quick link into Recovery.
- **Today's priorities** — max 3 *outcomes* (not habits), addable inline.
- **Next action** — one unambiguous "do this next" callout.
- **Today's actions** — the scheduled checklist; tap rows to complete.
- **System status** — compact sleep / energy / screen / stress / consistency.
- **System insight** — one concise observation (no chart overload).

### Recovery (Step 6 — functional)
Analytical, non-shame-based. Check-ins capture difficulty (0–10), time of day,
contextual factors (sleep, stress, energy, screen, mood, social), whether you
redirected and what helped. Trends and a pattern observation are surfaced.
Language is supportive and direct — setbacks are data, not punishment.

---

## Design language (NEXUS OS)

- **Surfaces:** near-black `#0a0b0d` background, deep charcoal panels,
  translucent glass, hairline cool-gray borders.
- **Texture:** a faint technical grid/noise appears only in designated zones.
- **Color = status only:** subtle green (improving), muted amber (attention),
  restrained red (declining), muted blue (informational). The UI is otherwise
  monochrome.
- **Type:** Inter for UI; IBM Plex Mono for dates, metrics, system labels and
  metadata. Caps are reserved for small system labels (`RECOVERY`, `SYSTEM
  STATUS`, `NEXT ACTION`), never shouted in body copy.
- **Icons:** minimal line icons with round caps — functional, never emoji.

### Responsive
- **Mobile:** floating translucent bottom dock.
- **Desktop (≥1080px):** slim left rail with the full system.

### Motion
Subtle, deliberate. Reduced-motion is respected via
`prefers-reduced-motion`.

---

## Data architecture (Step 1)

A clean, extensible domain separated into logical collections (see
`docs/ARCHITECTURE.md`):

```
Actions          Action completions   Daily priorities   Recovery entries
Contextual fx    Journal entries      Goals              Goal progress
Metrics          Categories           Dashboard widgets  User preferences
```

Nothing is hardcoded into the app architecture. The included actions/categories
are **demo data only**, generated deterministically by `src/data/seed.js` and
opt-in via a fresh localStorage key. Your real NEXUS system is whatever you
build from your own categories, action types, schedules and targets.

All state is stored locally in the browser. Future sync can be layered on
without touching the data model.
