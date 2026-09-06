import React from "react";
import * as I from "./icons";

/* Resolve an icon by name → component. Used when data stores an
   icon identifier rather than a JSX node. */
export const ICONS = {
  compass: I.IconCompass, pulse: I.IconPulse, list: I.IconList,
  chart: I.IconChart, grid: I.IconGrid, book: I.IconBook,
  target: I.IconTarget, settings: I.IconSettings, moon: I.IconMoon,
  zap: I.IconZap, waves: I.IconWaves, phone: I.IconPhone, clock: I.IconClock,
  eye: I.IconEye, droplet: I.IconDroplet, refresh: I.IconRefresh,
  flag: I.IconFlag, spark: I.IconSpark, shield: I.IconShield,
  briefcase: I.IconBriefcase, calendar: I.IconCalendar, pen: I.IconPen,
  archive: I.IconArchive, bell: I.IconBell, nexus: I.IconNexus,
  check: I.IconCheck, plus: I.IconPlus, more: I.IconMore,
  arrow: I.IconArrow, chevronRight: I.IconChevronRight,
  chevronDown: I.IconChevronDown, close: I.IconClose,
};

export function DynIcon({ name, ...rest }) {
  const C = ICONS[name] || I.IconTarget;
  return <C {...rest} />;
}

/* A compact icon tile used as a category/action glyph. */
export function IconTile({ name = "target", size = 36, tone = "neutral" }) {
  const C = ICONS[name] || I.IconTarget;
  return (
    <span
      className="icon-tile"
      style={{ width: size, height: size, borderRadius: 10 }}
    >
      <C size={size * 0.5} />
    </span>
  );
}
