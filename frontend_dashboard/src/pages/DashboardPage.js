import React, { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAppState } from "../state/AppStateContext";
import { buildBuckets, countByType } from "../utils/analytics";
import { formatTimestamp } from "../utils/time";

function badgeClass(severity) {
  if (severity === "critical") return "badge critical";
  if (severity === "warning") return "badge warning";
  return "badge info";
}

function deviceStatusFromEvents(deviceId, events) {
  for (let i = events.length - 1; i >= 0; i -= 1) {
    const e = events[i];
    if (e.deviceId !== deviceId) continue;
    if (e.severity === "critical") return "critical";
    if (e.severity === "warning") return "warning";
    return "ok";
  }
  return "ok";
}

// PUBLIC_INTERFACE
export function DashboardPage() {
  /**
   * Dashboard page: device status overview, live alerts list, and activity charts.
   */
  const { state } = useAppState();

  const deviceCards = useMemo(() => {
    return state.devices.map((d) => {
      const status = d.online ? deviceStatusFromEvents(d.id, state.events) : "offline";
      return { ...d, status };
    });
  }, [state.devices, state.events]);

  const recentAlerts = useMemo(() => {
    const cutoff = Date.now() - 30 * 60 * 1000;
    return state.events
      .filter((e) => e.ts >= cutoff && (e.severity === "warning" || e.severity === "critical"))
      .slice(-12)
      .reverse();
  }, [state.events]);

  const bucketData = useMemo(() => buildBuckets(state.events, 60, 5), [state.events]);
  const typeData = useMemo(() => countByType(state.events, 24 * 60).slice(0, 10), [state.events]);

  return (
    <div className="page">
      <section className="grid grid-3">
        {deviceCards.map((d) => (
          <div key={d.id} className="card">
            <div className="card-head">
              <div>
                <div className="card-title">{d.name}</div>
                <div className="card-subtitle">
                  {d.location} • {d.type}
                </div>
              </div>
              <div className={`pill ${d.online ? "ok" : "offline"}`}>{d.online ? "ONLINE" : "OFFLINE"}</div>
            </div>

            <div className="card-body">
              <div className="kv">
                <div className="kv-label">Status</div>
                <div className="kv-value">
                  <span className={`status-dot ${d.status}`} aria-hidden="true" />
                  <span className="mono">{String(d.status).toUpperCase()}</span>
                </div>
              </div>
              <div className="kv">
                <div className="kv-label">Last seen</div>
                <div className="kv-value mono">{formatTimestamp(d.lastSeenAt)}</div>
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="grid grid-2">
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Live Alerts</div>
              <div className="card-subtitle">Last 30 minutes</div>
            </div>
          </div>

          <div className="card-body">
            {recentAlerts.length === 0 ? (
              <div className="empty">No alerts in the last 30 minutes.</div>
            ) : (
              <ul className="alerts" aria-label="Recent alerts">
                {recentAlerts.map((e) => (
                  <li key={e.id} className="alert-row">
                    <span className={badgeClass(e.severity)}>{e.severity.toUpperCase()}</span>
                    <span className="alert-main">
                      <span className="alert-device">{e.deviceName}</span>
                      <span className="txt-muted"> — {e.message}</span>
                    </span>
                    <span className="alert-time mono">{formatTimestamp(e.ts)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="card chart-card">
          <div className="card-head">
            <div>
              <div className="card-title">Activity Trend</div>
              <div className="card-subtitle">Events per 5 minutes (last hour)</div>
            </div>
          </div>
          <div className="card-body chart-body">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={bucketData} margin={{ top: 8, right: 12, bottom: 8, left: 0 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fill: "var(--text-muted)", fontSize: 12 }} />
                <YAxis tick={{ fill: "var(--text-muted)", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    background: "var(--panel)",
                    border: "1px solid var(--border)",
                    color: "var(--text)",
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="total" stroke="var(--accent)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="criticals" stroke="var(--danger)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="grid grid-1">
        <div className="card chart-card">
          <div className="card-head">
            <div>
              <div className="card-title">Top Event Types</div>
              <div className="card-subtitle">Last 24 hours (simulated)</div>
            </div>
          </div>
          <div className="card-body chart-body">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeData} margin={{ top: 8, right: 12, bottom: 8, left: 0 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis dataKey="type" tick={{ fill: "var(--text-muted)", fontSize: 12 }} interval={0} height={60} />
                <YAxis tick={{ fill: "var(--text-muted)", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    background: "var(--panel)",
                    border: "1px solid var(--border)",
                    color: "var(--text)",
                  }}
                />
                <Bar dataKey="count" fill="var(--accent-2)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
    </div>
  );
}
