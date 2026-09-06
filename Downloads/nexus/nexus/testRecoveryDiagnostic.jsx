/**
 * Diagnostic test for RecoveryScreen and all screens
 */
import React from "react";
import ReactDOMServer from "react-dom/server";
import { AppProvider } from "./src/store/AppContext.jsx";
import RecoveryScreen from "./src/screens/RecoveryScreen.jsx";
import TodayScreen from "./src/screens/TodayScreen.jsx";
import ActionsScreen from "./src/screens/ActionsScreen.jsx";
import AnalyticsScreen from "./src/screens/AnalyticsScreen.jsx";
import GoalsScreen from "./src/screens/GoalsScreen.jsx";
import JournalScreen from "./src/screens/JournalScreen.jsx";
import DashboardsScreen from "./src/screens/DashboardsScreen.jsx";
import MoreScreen from "./src/screens/MoreScreen.jsx";

async function diagnose() {
  console.log("Diagnosing RecoveryScreen SSR render...");
  try {
    const html = ReactDOMServer.renderToString(
      React.createElement(AppProvider, null, React.createElement(RecoveryScreen, { navigate: () => {} }))
    );
    console.log("SUCCESS! RecoveryScreen rendered cleanly. HTML length:", html.length);
  } catch (err) {
    console.error("CRASH rendering RecoveryScreen:", err);
  }
}

diagnose();
