import React, { useMemo } from "react";
import { NavLink } from "react-router-dom";
import { useAppState } from "../state/AppStateContext";

function navClass({ isActive }) {
  return `nav-link ${isActive ? "active" : ""}`;
}

// PUBLIC_INTERFACE
export function Sidebar({ open, onClose }) {
  /**
   * Sidebar navigation for the SaaS-style dashboard layout.
   */
  const { state } = useAppState();

  const alertCount = useMemo(() => {
    const cutoff = Date.now() - 30 * 60 * 1000;
    return state.events.filter((e) => e.ts >= cutoff && (e.severity === "warning" || e.severity === "critical"))
      .length;
  }, [state.events]);

  const onlineCount = useMemo(() => state.devices.filter((d) => d.online).length, [state.devices]);

  return (
    <aside className={`sidebar ${open ? "open" : ""}`} aria-label="Sidebar navigation">
      <div className="sidebar-header">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true" />
          <div className="brand-text">
            <div className="brand-title">IOT SEC MONITOR</div>
            <div className="brand-subtitle">Frontend simulation</div>
          </div>
        </div>

        <button className="icon-btn sidebar-close" onClick={onClose} aria-label="Close sidebar">
          <span aria-hidden="true">×</span>
        </button>
      </div>

      <div className="sidebar-stats">
        <div className="stat">
          <div className="stat-label">Devices Online</div>
          <div className="stat-value">{onlineCount}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Alerts (30m)</div>
          <div className={`stat-value ${alertCount > 0 ? "warn" : ""}`}>{alertCount}</div>
        </div>
      </div>

      <nav className="nav" aria-label="Primary">
        <NavLink to="/dashboard" className={navClass} onClick={onClose}>
          <span className="nav-dot" aria-hidden="true" />
          Dashboard
        </NavLink>
        <NavLink to="/devices" className={navClass} onClick={onClose}>
          <span className="nav-dot" aria-hidden="true" />
          Devices
        </NavLink>
        <NavLink to="/logs" className={navClass} onClick={onClose}>
          <span className="nav-dot" aria-hidden="true" />
          Event Logs
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div className="footer-line" />
        <div className="footer-meta">
          <div>Persistence: localStorage</div>
          <div>Events: simulated realtime</div>
        </div>
      </div>
    </aside>
  );
}
