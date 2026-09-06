/* ------------------------------------------------------------
   NEXUS domain constants — the vocabulary of the system.
   Nothing here is a hardcoded "habit"; these are user-editable
   definitions and taxonomy options.
   ------------------------------------------------------------ */

export const ACTION_TYPES = {
  BOOLEAN: {
    id: "boolean",
    label: "Boolean",
    desc: "Done or not done",
    targetLabel: "Complete",
  },
  QUANTITY: {
    id: "quantity",
    label: "Quantity",
    desc: "Amount toward a target",
    targetLabel: "Target",
  },
  DURATION: {
    id: "duration",
    label: "Duration",
    desc: "Track time spent",
    targetLabel: "Minutes",
  },
  COUNT: {
    id: "count",
    label: "Count",
    desc: "Repeated reps / count",
    targetLabel: "Count",
  },
  SCALE: {
    id: "scale",
    label: "Scale",
    desc: "Subjective 1–10 rating",
    targetLabel: "1–10",
  },
  AVOIDANCE: {
    id: "avoidance",
    label: "Boundary",
    desc: "An avoidance or boundary to respect",
    targetLabel: "Respect",
  },
  JOURNAL: {
    id: "journal",
    label: "Journal",
    desc: "A reflective written entry",
    targetLabel: "Write",
  },
  EVENT: {
    id: "event",
    label: "Event",
    desc: "A custom event or contextual log",
    targetLabel: "Log",
  },
};

export const ACTION_TYPE_IDS = Object.values(ACTION_TYPES).map((t) => t.id);

/* Classification of an action by behavior valence. */
export const VALENCE = {
  POSITIVE: { id: "positive", label: "Positive behavior", tone: "ok" },
  NEGATIVE: { id: "negative", label: "Reduction / avoidance", tone: "warn" },
  NEUTRAL: { id: "neutral", label: "Neutral / context", tone: "info" },
};

/* ---- Scheduling ---------------------------------------------- */
export const SCHEDULE = {
  DAILY: { id: "daily", label: "Daily" },
  WEEKDAYS: { id: "weekdays", label: "Weekdays" },
  WEEKENDS: { id: "weekends", label: "Weekends" },
  CUSTOM: { id: "custom", label: "Custom days" },
  MANUAL: { id: "manual", label: "Manual" },
};

export const WEEKDAYS = [
  { n: 1, s: "Mon", l: "Monday" },
  { n: 2, s: "Tue", l: "Tuesday" },
  { n: 3, s: "Wed", l: "Wednesday" },
  { n: 4, s: "Thu", l: "Thursday" },
  { n: 5, s: "Fri", l: "Friday" },
  { n: 6, s: "Sat", l: "Saturday" },
  { n: 0, s: "Sun", l: "Sunday" },
];

/* ---- Recovery contextual factors ---------------------------- */
export const FACTOR_SLIDERS = [
  {
    id: "sleep",
    label: "Sleep",
    icon: "moon",
    min: 0,
    max: 10,
    low: "Low / poor",
    high: "High / restful",
  },
  {
    id: "stress",
    label: "Stress",
    icon: "waves",
    min: 0,
    max: 10,
    low: "Low",
    high: "High",
  },
  {
    id: "energy",
    label: "Energy",
    icon: "zap",
    min: 0,
    max: 10,
    low: "Low",
    high: "High",
  },
  {
    id: "screen",
    label: "Screen time",
    icon: "phone",
    min: 0,
    max: 10,
    low: "Low",
    high: "High",
  },
  {
    id: "mood",
    label: "Mood",
    icon: "eye",
    min: 0,
    max: 10,
    low: "Low",
    high: "High",
  },
  {
    id: "social",
    label: "Social interaction",
    icon: "grid",
    min: 0,
    max: 10,
    low: "None",
    high: "A lot",
  },
];

/* Urge / difficulty scale for a recovery check-in. */
export const URGE_SCALE = {
  min: 0,
  max: 10,
  low: "No urge",
  high: "Strong urge",
};

export const TIMES_OF_DAY = [
  { id: "morning", label: "Morning" },
  { id: "afternoon", label: "Afternoon" },
  { id: "evening", label: "Evening" },
  { id: "night", label: "Night / late" },
];

/* ---- Recovery event types ----------------------------------- */
export const RECOVERY_EVENT_TYPES = [
  { id: "redirection", label: "Successful Redirection", desc: "Felt urge/trigger and chose another action", tone: "ok" },
  { id: "urge", label: "Urge", desc: "Noticed an urge or trigger", tone: "warn" },
  { id: "difficult_moment", label: "Difficult Moment", desc: "High temptation or stressful context", tone: "warn" },
  { id: "setback", label: "Setback", desc: "Lapse occurred — recorded strictly as data", tone: "neg" },
  { id: "checkin", label: "Daily Check-in", desc: "Overall daily recovery assessment", tone: "neutral" },
  { id: "custom", label: "Custom Event", desc: "Custom recovery-related log", tone: "info" },
];

/* Pre-set redirection strategies for fast single-tap logging */
export const DEFAULT_REDIRECTION_STRATEGIES = [
  "Exercise / Physical reset",
  "Leaving the environment",
  "Going outside / Walk",
  "Talking to someone",
  "Meditation / Breathwork",
  "Starting another task",
  "Putting the phone away",
  "Cold shower",
];

