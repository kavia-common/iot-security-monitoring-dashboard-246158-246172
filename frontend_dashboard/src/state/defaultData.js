export const STORAGE_KEY = "iotsec-dashboard:v1";

export const DEFAULT_DEVICES = [
  {
    id: "dev-motion-1",
    name: "Motion Sensor",
    type: "motion",
    location: "Lobby",
    online: true,
    lastSeenAt: Date.now(),
  },
  {
    id: "dev-door-1",
    name: "Door Sensor",
    type: "door",
    location: "Server Room",
    online: true,
    lastSeenAt: Date.now(),
  },
  {
    id: "dev-camera-1",
    name: "Camera",
    type: "camera",
    location: "Loading Bay",
    online: true,
    lastSeenAt: Date.now(),
  },
];

function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function clampArray(value, max) {
  if (!Array.isArray(value)) return [];
  if (value.length <= max) return value;
  return value.slice(value.length - max);
}

function isValidAlertStatus(value) {
  return value === "active" || value === "acknowledged" || value === "resolved";
}

function sanitizeAlertStatusByEventId(value) {
  if (!isPlainObject(value)) return {};
  const out = {};
  for (const [k, v] of Object.entries(value)) {
    if (typeof k !== "string") continue;
    if (!isValidAlertStatus(v)) continue;
    out[k] = v;
  }
  return out;
}

function sanitizeSelectedDeviceId(value) {
  if (typeof value !== "string") return "";
  return value;
}

// PUBLIC_INTERFACE
export function clampPersistedState(value) {
  /**
   * Sanitizes persisted localStorage payload to avoid runtime errors after schema changes.
   */
  if (!isPlainObject(value)) return null;

  const theme = value.theme === "light" || value.theme === "retro" ? value.theme : "retro";
  const simulation = isPlainObject(value.simulation)
    ? {
        enabled: Boolean(value.simulation.enabled),
        intervalMs: typeof value.simulation.intervalMs === "number" ? value.simulation.intervalMs : 4500,
      }
    : { enabled: true, intervalMs: 4500 };

  const devices = Array.isArray(value.devices) && value.devices.length > 0 ? value.devices : null;
  const events = clampArray(value.events, 500);

  // Alert lifecycle persistence: map of eventId -> status (active|acknowledged|resolved)
  const alertStatusByEventId = sanitizeAlertStatusByEventId(value.alertStatusByEventId);

  // Devices page UI persistence: selected device id (validated at runtime against actual devices list)
  const selectedDeviceId = sanitizeSelectedDeviceId(value.selectedDeviceId);

  return {
    theme,
    simulation,
    devices: devices || DEFAULT_DEVICES,
    events,
    alertStatusByEventId,
    selectedDeviceId,
  };
}
