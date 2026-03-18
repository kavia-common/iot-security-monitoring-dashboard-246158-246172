import React, { useEffect, useMemo } from "react";
import { useAppState } from "../state/AppStateContext";
import { formatTimestamp } from "../utils/time";

function resolveValidSelectedId(devices, preferredId) {
  if (!Array.isArray(devices) || devices.length === 0) return "";
  if (preferredId && devices.some((d) => d.id === preferredId)) return preferredId;
  return devices[0]?.id || "";
}

// PUBLIC_INTERFACE
export function DevicesPage() {
  /**
   * Devices page: manage device availability and view/edit device metadata.
   *
   * WM-8117 bug fix:
   * - Selected device persists across reloads via Context/localStorage (`state.selectedDeviceId`)
   * - Safe fallback to first device if the stored id no longer exists
   */
  const { state, actions } = useAppState();

  // Ensure selectedDeviceId is always valid for the current devices list.
  useEffect(() => {
    const nextId = resolveValidSelectedId(state.devices, state.selectedDeviceId);
    if (nextId && nextId !== state.selectedDeviceId) {
      actions.setSelectedDeviceId(nextId);
    }
    // If no devices, ensure we don't keep stale selection around.
    if (!nextId && state.selectedDeviceId) {
      actions.setSelectedDeviceId("");
    }
  }, [state.devices, state.selectedDeviceId, actions]);

  const selected = useMemo(() => {
    const validId = resolveValidSelectedId(state.devices, state.selectedDeviceId);
    return state.devices.find((d) => d.id === validId) || null;
  }, [state.devices, state.selectedDeviceId]);

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
                  onClick={() => actions.setSelectedDeviceId(d.id)}
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

                <div className="hint">Note: simulation may also set the camera offline/online based on simulated events.</div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
