import React from "react";
import { BrowserRouter } from "react-router-dom";
import "./App.css";
import { AppStateProvider } from "./state/AppStateContext";
import { AppShell } from "./app/AppShell";

// PUBLIC_INTERFACE
function App() {
  /**
   * Root React application component.
   * Provides routing + global app state (with localStorage persistence) and renders the SaaS dashboard shell.
   */
  return (
    <BrowserRouter>
      <AppStateProvider>
        <AppShell />
      </AppStateProvider>
    </BrowserRouter>
  );
}

export default App;
