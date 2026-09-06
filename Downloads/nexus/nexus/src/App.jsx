import React, { useState, useEffect, useCallback } from "react";
import { useApp } from "./store/AppContext";
import {
  IconCompass, IconPulse, IconList, IconChart, IconGrid,
} from "./components/icons";
import { Logo } from "./components/brand";
import TodayScreen from "./screens/TodayScreen";
import RecoveryScreen from "./screens/RecoveryScreen";
import ActionsScreen from "./screens/ActionsScreen";
import AnalyticsScreen from "./screens/AnalyticsScreen";
import MoreScreen from "./screens/MoreScreen";
import GoalsScreen from "./screens/GoalsScreen";
import JournalScreen from "./screens/JournalScreen";
import DashboardsScreen from "./screens/DashboardsScreen";

/* ------------------------------------------------------------
   NEXUS — primary navigation model.
   Mobile: bottom dock. Desktop: left rail.
   ------------------------------------------------------------ */
const NAV = [
  { id: "today", label: "Today", icon: IconCompass },
  { id: "recovery", label: "Recovery", icon: IconPulse },
  { id: "actions", label: "Actions", icon: IconList },
  { id: "analytics", label: "Analytics", icon: IconChart },
  { id: "more", label: "More", icon: IconGrid },
];

const SCREENS = {
  today: TodayScreen,
  recovery: RecoveryScreen,
  actions: ActionsScreen,
  analytics: AnalyticsScreen,
  more: MoreScreen,
  goals: GoalsScreen,
  journal: JournalScreen,
  dashboards: DashboardsScreen,
};

function useActiveSection() {
  const [route, setRoute] = useState("today");
  const [sub, setSub] = useState(null);
  useEffect(() => {
    const m = window.location.hash.match(/^#\/([a-z]+)(?:\/([a-z]+))?/);
    if (m) {
      if (SCREENS[m[1]]) {
        setRoute(m[1]);
        setSub(m[2] || null);
      }
    } else if (window.location.hash) {
      window.history.replaceState(null, "", "#/today");
    }
  }, []);
  const navigate = useCallback((routeId, subId = null) => {
    window.location.hash = subId
      ? `/${routeId}/${subId}`
      : `/${routeId}`;
    setRoute(routeId);
    setSub(subId);
    window.scrollTo({ top: 0, behavior: "instant" in window ? "auto" : "auto" });
  }, []);
  return { route, sub, navigate };
}

export default function App() {
  const { route, sub, navigate } = useActiveSection();
  const Screen = SCREENS[route] || TodayScreen;
  const props = { route, sub, navigate };

  return (
    <div className="app-scroll">
      {/* Desktop side rail */}
      <nav className="side-nav" aria-label="Primary">
        <div className="side-nav__brand">
          <Logo />
        </div>
        <div className="side-nav__nav">
          {NAV.map((n) => {
            const I = n.icon;
            const active = route === n.id;
            return (
              <button
                key={n.id}
                className={`nav-item ${active ? "is-active" : ""}`}
                onClick={() => navigate(n.id)}
              >
                <I size={19} />
                <span>{n.label}</span>
              </button>
            );
          })}
        </div>
        <div className="side-nav__footer syslabel" style={{ lineHeight: 1.6 }}>
          NEXUS v1.0
          <div className="mt1" style={{ opacity: 0.7 }}>Data stored locally</div>
        </div>
      </nav>

      <div className="main--desktop">
        <Screen key={route} {...props} />

        {/* Mobile bottom dock */}
        <nav className="bottom-nav" aria-label="Primary">
          {NAV.map((n) => {
            const I = n.icon;
            const active = route === n.id;
            return (
              <button
                key={n.id}
                className={`nav-item ${active ? "is-active" : ""}`}
                onClick={() => navigate(n.id)}
              >
                <I size={20} />
                <span>{n.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
