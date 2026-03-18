import React, { useMemo, useState } from "react";
import { useAppState } from "../state/AppStateContext";
import { formatTimestamp } from "../utils/time";

// PUBLIC_INTERFACE
export function DevicesPage() {
  /**
   * Devices page: manage device availability and view/edit device metadata.
   */
  const { state, actions } = useAppState();
  const [selectedId, setSelectedId] = useState(state.devices[0]?.id || "");

  const selected = useMemo(
    () => state.devices.find((d) => d.id === selectedId) || state.devices[0] || null,
    [state.devices, selectedId]
  );

  return (
    <div className="page">
      <section className="grid grid-2">
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Device Fleet</div>
              <div className="card-subtitle">Toggle online/offline and select a device to view details</div>
            </div>
          </div>

          <div className="card-body">
            <div className="device-list" role="list">
              {state.devices.map((d) => (
                <button
                  key={d.id}
                  className={`device-row ${selected?.id === d.id ? "selected" : ""}`}
                  onClick={() => setSelectedId(d.id)}
                  type="button"
                >
                  <span className={`status-dot ${d.online ? "ok" : "offline"}`} aria-hidden="true" />
                  <span className="device-row-main">
                    <span className="device-row-name">{d.name}</span>
                    <span className="device-row-meta">
                      {d.type} • {d.location}
                    </span>
                  </span>
                  <span className={`pill ${d.online ? "ok" : "offline"}`}>{d.online ? "ONLINE" : "OFFLINE"}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Device Details</div>
              <div className="card-subtitle">{selected ? selected.id : "No device selected"}</div>
            </div>
          </div>

          <div className="card-body">
            {!selected ? (
              <div className="empty">No device selected.</div>
            ) : (
              <div className="form">
                <div className="form-row">
                  <label className="label" htmlFor="devName">
                    Name
                  </label>
                  <input
                    id="devName"
                    className="input"
                    value={selected.name}
                    onChange={(e) => actions.updateDevice(selected.id, { name: e.target.value })}
                  />
                </div>

                <div className="form-row">
                  <label className="label" htmlFor="devLocation">
                    Location
                  </label>
                  <input
                    id="devLocation"
                    className="input"
                    value={selected.location}
                    onChange={(e) => actions.updateDevice(selected.id, { location: e.target.value })}
                  />
                </div>

                <div className="form-row">
                  <div className="label">Type</div>
                  <div className="mono">{selected.type}</div>
                </div>

                <div className="form-row">
                  <div className="label">Last Seen</div>
                  <div className="mono">{formatTimestamp(selected.lastSeenAt)}</div>
                </div>

                <div className="form-actions">
                  <button className="btn" onClick={() => actions.toggleDeviceOnline(selected.id)} type="button">
                    Toggle Online
                  </button>
                </div>

                <div className="hint">
                  Note: simulation may also set the camera offline/online based on simulated events.
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
