import React from "react";

/* ------------------------------------------------------------
   NEXUS line icon set. 24x24 grid, 1.5 stroke, round caps.
   Functional and minimal — never decorative.
   ------------------------------------------------------------ */

const base = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export const IconCompass = (p) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M14.8 9.2 13 13l-3.8 1.8L11 11l3.8-1.8z" />
  </svg>
);

export const IconPulse = (p) => (
  <svg {...base} {...p}>
    <path d="M2 12h4l2.2-6 3.6 12 2.4-7 1.4 1h6.4" />
  </svg>
);

export const IconList = (p) => (
  <svg {...base} {...p}>
    <rect x="3.5" y="4" width="17" height="16" rx="3" />
    <path d="M8 9h8M8 13h8M8 17h4.5" />
  </svg>
);

export const IconChart = (p) => (
  <svg {...base} {...p}>
    <path d="M3.5 3.5v17h17" />
    <path d="M7.5 16v-5M11.5 16V8M15.5 16v-7M19.5 16V6" />
  </svg>
);

export const IconGrid = (p) => (
  <svg {...base} {...p}>
    <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
    <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
    <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
    <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
  </svg>
);

export const IconBook = (p) => (
  <svg {...base} {...p}>
    <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15.5H6.5A2.5 2.5 0 0 0 4 21V5.5z" />
    <path d="M4 18.5A2.5 2.5 0 0 1 6.5 16H20" />
  </svg>
);

export const IconTarget = (p) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <circle cx="12" cy="12" r="4.5" />
    <circle cx="12" cy="12" r="0.6" fill="currentColor" />
  </svg>
);

export const IconSettings = (p) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2.8v2.4M12 18.8v2.4M4.2 6.5l2 1.2M17.8 16.3l2 1.2M4.2 17.5l2-1.2M17.8 7.7l2-1.2" opacity="0" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1-1.55 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.64 8.6a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34h.01A1.7 1.7 0 0 0 10 2.7V2.6a2 2 0 1 1 4 0v.09A1.7 1.7 0 0 0 15 4.23a1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87v.01a1.7 1.7 0 0 0 1.55 1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.51 1z" />
  </svg>
);

export const IconChevronRight = (p) => (
  <svg {...base} {...p}>
    <path d="m9 5 7 7-7 7" />
  </svg>
);
export const IconChevronLeft = (p) => (
  <svg {...base} {...p}>
    <path d="m15 5-7 7 7 7" />
  </svg>
);
export const IconChevronDown = (p) => (
  <svg {...base} {...p}>
    <path d="m5 9 7 7 7-7" />
  </svg>
);
export const IconCheck = (p) => (
  <svg {...base} {...p}>
    <path d="M4.5 12.5 9.5 17.5 19.5 6.5" />
  </svg>
);
export const IconPlus = (p) => (
  <svg {...base} {...p}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);
export const IconArrow = (p) => (
  <svg {...base} {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);
export const IconArrowUpRight = (p) => (
  <svg {...base} {...p}>
    <path d="M7 17 17 7M8 7h9v9" />
  </svg>
);
export const IconClose = (p) => (
  <svg {...base} {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);
export const IconMore = (p) => (
  <svg {...base} {...p}>
    <circle cx="5.5" cy="12" r="1" fill="currentColor" />
    <circle cx="12" cy="12" r="1" fill="currentColor" />
    <circle cx="18.5" cy="12" r="1" fill="currentColor" />
  </svg>
);

/* --- metrics --- */
export const IconMoon = (p) => (
  <svg {...base} {...p}>
    <path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z" />
  </svg>
);
export const IconZap = (p) => (
  <svg {...base} {...p}>
    <path d="M13 2 4.5 13.5H11L9.8 22 18.5 10H12l1-8z" />
  </svg>
);
export const IconWaves = (p) => (
  <svg {...base} {...p}>
    <path d="M3 12c1.8 0 1.8-2 3.6-2s1.8 2 3.6 2 1.8-2 3.6-2 1.8 2 3.6 2 1.8-2 3.6-2" />
    <path d="M3 16.5c1.8 0 1.8-2 3.6-2s1.8 2 3.6 2 1.8-2 3.6-2 1.8 2 3.6 2 1.8-2 3.6-2" />
  </svg>
);
export const IconPhone = (p) => (
  <svg {...base} {...p}>
    <rect x="7" y="2.5" width="10" height="19" rx="2.5" />
    <path d="M10.5 5.5h3" />
  </svg>
);
export const IconClock = (p) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </svg>
);
export const IconEye = (p) => (
  <svg {...base} {...p}>
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
export const IconDroplet = (p) => (
  <svg {...base} {...p}>
    <path d="M12 3.5s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z" />
  </svg>
);
export const IconRefresh = (p) => (
  <svg {...base} {...p}>
    <path d="M20 12a8 8 0 1 1-2.6-5.9" />
    <path d="M20 3.5V8h-4.5" />
  </svg>
);
export const IconFlag = (p) => (
  <svg {...base} {...p}>
    <path d="M5.5 21V4.5M5.5 4.5c4-2 6 2 9.5 0v7c-3.5 2-5.5-2-9.5 0" />
  </svg>
);
export const IconSpark = (p) => (
  <svg {...base} {...p}>
    <path d="M12 3.5 13.8 10l6.7 1.8L13.8 13.6 12 20l-1.8-6.4L3.5 11.8 10.2 10z" />
  </svg>
);
export const IconShield = (p) => (
  <svg {...base} {...p}>
    <path d="M12 3 5 5.5v5c0 4.5 3 8 7 9.5 4-1.5 7-5 7-9.5v-5L12 3z" />
  </svg>
);
export const IconBriefcase = (p) => (
  <svg {...base} {...p}>
    <rect x="3.5" y="7.5" width="17" height="12" rx="2.5" />
    <path d="M9 7.5V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5" />
  </svg>
);
export const IconCalendar = (p) => (
  <svg {...base} {...p}>
    <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
    <path d="M3.5 10h17M8 3v4M16 3v4" />
  </svg>
);
export const IconPen = (p) => (
  <svg {...base} {...p}>
    <path d="M14.5 4.5 19.5 9.5 9 20H4v-5L14.5 4.5z" />
  </svg>
);
export const IconEdit = IconPen;

export const IconTrash = (p) => (
  <svg {...base} {...p}>
    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);
export const IconArchive = (p) => (
  <svg {...base} {...p}>
    <rect x="3.5" y="4" width="17" height="5" rx="1" />
    <path d="M5.5 9v10a1.5 1.5 0 0 0 1.5 1.5h10A1.5 1.5 0 0 0 18.5 19V9M10 13h4" />
  </svg>
);
export const IconBell = (p) => (
  <svg {...base} {...p}>
    <path d="M6 10a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 14 6 10z" />
    <path d="M10 19a2 2 0 0 0 4 0" />
  </svg>
);

export const IconNexus = (p) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="7" />
    <circle cx="12" cy="12" r="2.2" fill="currentColor" stroke="none" />
    <path d="M4 4l2.6 2.6M20 4l-2.6 2.6M4 20l2.6-2.6M20 20l-2.6-2.6" />
  </svg>
);
