import React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./store/AppContext";
import App from "./App";
import "./styles/theme.css";
import "./styles/base.css";
import "./styles/ui.css";
import "./styles/nav.css";
import "./styles/screens.css";
import "./styles/modal.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>
);
