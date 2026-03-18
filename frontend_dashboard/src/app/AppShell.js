import React, { useMemo, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { TopBar } from "../components/TopBar";
import { ToastCenter } from "../components/ToastCenter";
import { DashboardPage } from "../pages/DashboardPage";
import { DevicesPage } from "../pages/DevicesPage";
import { EventLogsPage } from "../pages/EventLogsPage";

function usePageTitle() {
  const location = useLocation();
  return useMemo(() => {
    const path = location.pathname;
    if (path === "/" || path.startsWith("/dashboard")) return "Dashboard";
    if (path.startsWith("/devices")) return "Devices";
    if (path.startsWith("/logs")) return "Event Logs";
    return "Dashboard";
  }, [location.pathname]);
}

// PUBLIC_INTERFACE
export function AppShell() {
  /** Dashboard shell with sidebar + topbar + routed main content. */
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pageTitle = usePageTitle();

  return (
    <div className="app-root">
      <div className="scanlines" aria-hidden="true" />
      <div className="app-shell">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="app-main">
          <TopBar
            title={pageTitle}
            onToggleSidebar={() => setSidebarOpen((v) => !v)}
          />
          <main className="app-content" aria-label="Main content">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/devices" element={<DevicesPage />} />
              <Route path="/logs" element={<EventLogsPage />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </div>

        <ToastCenter />
      </div>
    </div>
  );
}
