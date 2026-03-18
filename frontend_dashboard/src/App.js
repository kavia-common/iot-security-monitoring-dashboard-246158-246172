import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import { AppStateProvider } from "./state/AppStateContext";
import { AppShell } from "./app/AppShell";

function Healthz() {
  return (
    <pre
      style={{
        margin: 0,
        padding: 12,
        fontFamily:
          'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
      }}
    >
      ok
    </pre>
  );
}

// PUBLIC_INTERFACE
function App() {
  /**
   * Root React application component.
   * Provides routing + global app state (with localStorage persistence) and renders the SaaS dashboard shell.
   */
  // CRA dev server doesn't reliably serve arbitrary public/* files as standalone endpoints
  // (it may fall back to index.html), so we provide an explicit health route here.
  const healthPath = process.env.REACT_APP_HEALTHCHECK_PATH || "/healthz";

  return (
    <BrowserRouter>
      <Routes>
        <Route path={healthPath} element={<Healthz />} />
        <Route
          path="/*"
          element={
            <AppStateProvider>
              <AppShell />
            </AppStateProvider>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
