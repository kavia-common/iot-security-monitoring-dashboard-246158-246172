import React, { useMemo } from "react";
import { useAppState } from "../state/AppStateContext";

function isAlertEvent(e) {
  return e?.severity === "warning" || e?.severity === "critical";
}

// PUBLIC_INTERFACE
export function TopBar({ title, onToggleSidebar }) {
  /**
   * Top navigation bar with quick actions (simulate event, start/stop simulation, theme toggle).
   */
  const { state, actions } = useAppState();

  const activeAlerts = useMemo(() => {
    const cutoff = Date.now() - 15 * 60 * 1000;
    return state.events.filter((e) => {
      if (!e || typeof e.ts !== "number") return false;
      if (e.ts < cutoff) return false;
      if (!isAlertEvent(e)) return false;
      const status = state.alertStatusByEventId?.[e.id] || "active";
      // Default behavior: exclude Resolved; count Active + Acknowledged.
      return status !== "resolved";
    }).length;
  }, [state.events, state.alertStatusByEventId]);

  return (
    <header className="topbar" aria-label="Top bar">
      <div className="topbar-left">
        <button className="icon-btn" onClick={onToggleSidebar} aria-label="Toggle sidebar">
          <span className="hamburger" aria-hidden="true" />
        </button>
        <div className="topbar-title">
          <div className="page-title">{title}</div>
          <div className="page-subtitle">
            Alerts (15m): <span className={activeAlerts > 0 ? "txt-warn" : "txt-muted"}>{activeAlerts}</span>
          </div>
        </div>
      </div>

      <div className="topbar-actions">
        <button className="btn" onClick={actions.simulateEvent}>
          Simulate Event
        </button>

        <button
          className={`btn btn-secondary ${state.simulation.enabled ? "" : "btn-off"}`}
          onClick={() => actions.setSimulation({ enabled: !state.simulation.enabled })}
          aria-pressed={state.simulation.enabled}
        >
          {state.simulation.enabled ? "Realtime: ON" : "Realtime: OFF"}
        </button>

        <button className="btn btn-secondary" onClick={actions.toggleTheme}>
          Theme: {state.theme === "retro" ? "Retro" : "Light"}
        </button>
      </div>
    </header>
  );
}
