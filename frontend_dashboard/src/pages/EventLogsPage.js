import React, { useMemo, useState } from "react";
import { useAppState } from "../state/AppStateContext";
import { formatTimestamp, minutesAgoToCutoff } from "../utils/time";

const TIME_RANGES = [
  { value: "15m", label: "Last 15 minutes", cutoff: () => minutesAgoToCutoff(15) },
  { value: "1h", label: "Last 1 hour", cutoff: () => minutesAgoToCutoff(60) },
  { value: "24h", label: "Last 24 hours", cutoff: () => minutesAgoToCutoff(24 * 60) },
  { value: "all", label: "All time", cutoff: () => 0 },
];

function severityClass(sev) {
  if (sev === "critical") return "badge critical";
  if (sev === "warning") return "badge warning";
  return "badge info";
}

// PUBLIC_INTERFACE
export function EventLogsPage() {
  /**
   * Event Logs page: full event history with filtering by type/time range/severity.
   */
  const { state } = useAppState();
  const [typeFilter, setTypeFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [timeRange, setTimeRange] = useState("1h");

  const eventTypes = useMemo(() => {
    const set = new Set(state.events.map((e) => e.type));
    return ["all", ...Array.from(set).sort()];
  }, [state.events]);

  const filtered = useMemo(() => {
    const range = TIME_RANGES.find((r) => r.value === timeRange) || TIME_RANGES[1];
    const cutoff = range.cutoff();

    let list = state.events.filter((e) => e.ts >= cutoff);

    if (typeFilter !== "all") list = list.filter((e) => e.type === typeFilter);
    if (severityFilter !== "all") list = list.filter((e) => e.severity === severityFilter);

    // newest first for display
    return list.slice().reverse();
  }, [state.events, typeFilter, severityFilter, timeRange]);

  return (
    <div className="page">
      <section className="card">
        <div className="card-head">
          <div>
            <div className="card-title">Event Logs</div>
            <div className="card-subtitle">Filter by type, severity, and time range</div>
          </div>
        </div>

        <div className="card-body">
          <div className="filters" aria-label="Event log filters">
            <div className="filter">
              <label className="label" htmlFor="typeFilter">
                Event Type
              </label>
              <select
                id="typeFilter"
                className="select"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                {eventTypes.map((t) => (
                  <option key={t} value={t}>
                    {t === "all" ? "All types" : t}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter">
              <label className="label" htmlFor="severityFilter">
                Severity
              </label>
              <select
                id="severityFilter"
                className="select"
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div className="filter">
              <label className="label" htmlFor="timeRange">
                Time Range
              </label>
              <select id="timeRange" className="select" value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
                {TIME_RANGES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="empty">No events match the current filters.</div>
          ) : (
            <div className="table-wrap" role="region" aria-label="Events table" tabIndex={0}>
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ width: 190 }}>Time</th>
                    <th style={{ width: 150 }}>Device</th>
                    <th style={{ width: 190 }}>Type</th>
                    <th style={{ width: 120 }}>Severity</th>
                    <th>Message</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((e) => (
                    <tr key={e.id}>
                      <td className="mono">{formatTimestamp(e.ts)}</td>
                      <td>{e.deviceName}</td>
                      <td className="mono">{e.type}</td>
                      <td>
                        <span className={severityClass(e.severity)}>{e.severity.toUpperCase()}</span>
                      </td>
                      <td>{e.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="hint">
            Tip: use <span className="mono">Simulate Event</span> in the top bar to generate new data.
          </div>
        </div>
      </section>
    </div>
  );
}
