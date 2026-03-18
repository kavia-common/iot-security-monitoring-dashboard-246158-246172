import { createId } from "../utils/id";

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function formatDeviceType(type) {
  if (type === "motion") return "Motion";
  if (type === "door") return "Door";
  if (type === "camera") return "Camera";
  return "Device";
}

function isAlert(severity) {
  return severity === "warning" || severity === "critical";
}

function summarizeSeverity(severity) {
  if (severity === "critical") return "Critical";
  if (severity === "warning") return "Warning";
  return "Info";
}

function countRecentAlerts(events, windowMs) {
  const cutoff = Date.now() - windowMs;
  let count = 0;
  // events are stored oldest->newest; scan backward for efficiency
  for (let i = events.length - 1; i >= 0; i -= 1) {
    const e = events[i];
    if (!e || typeof e.ts !== "number") continue;
    if (e.ts < cutoff) break;
    if (isAlert(e.severity)) count += 1;
  }
  return count;
}

function buildToast(event) {
  if (!isAlert(event.severity)) return null;
  return {
    id: createId(),
    createdAt: event.ts,
    severity: event.severity,
    title: `${summarizeSeverity(event.severity)} Alert`,
    message: `${event.deviceName}: ${event.message}`,
  };
}

// PUBLIC_INTERFACE
export function generateSimulatedEvent(appState) {
  /**
   * Generates a realistic (but simulated) IoT security event.
   * Returns event + optional devicePatch + optional toast.
   */
  const devices = Array.isArray(appState.devices) ? appState.devices : [];
  const events = Array.isArray(appState.events) ? appState.events : [];

  const onlineDevices = devices.filter((d) => d.online);
  const device = onlineDevices.length > 0 ? pick(onlineDevices) : pick(devices);

  const ts = Date.now();
  const base = {
    id: createId(),
    ts,
    deviceId: device?.id || "unknown",
    deviceName: device?.name || "Unknown device",
    deviceType: device?.type || "unknown",
  };

  // When everything is missing, still produce a generic system event.
  if (!device) {
    const event = {
      ...base,
      type: "SYSTEM_HEARTBEAT",
      severity: "info",
      message: "System heartbeat (simulated).",
    };
    return { event, devicePatch: null, toast: null };
  }

  const type = device.type;
  const recentAlertCount = countRecentAlerts(events, 2 * 60 * 1000); // 2 minutes

  // Tailored event sets per device type.
  let eventType = "DEVICE_ACTIVITY";
  let severity = "info";
  let message = `${formatDeviceType(type)} activity recorded.`;
  let devicePatch = { lastSeenAt: ts };

  if (type === "motion") {
    const option = pick(["MOTION_DETECTED", "MOTION_CLEARED", "SENSOR_TAMPER"]);
    if (option === "MOTION_DETECTED") {
      eventType = "MOTION_DETECTED";
      severity = pick(["info", "warning"]);
      message = severity === "warning" ? "Unusual motion pattern detected." : "Motion detected.";
    } else if (option === "MOTION_CLEARED") {
      eventType = "MOTION_CLEARED";
      severity = "info";
      message = "Motion cleared.";
    } else {
      eventType = "SENSOR_TAMPER";
      severity = "critical";
      message = "Possible tamper detected on motion sensor.";
    }
  } else if (type === "door") {
    const option = pick(["DOOR_OPEN", "DOOR_FORCED", "ACCESS_DENIED"]);
    if (option === "DOOR_OPEN") {
      eventType = "DOOR_OPEN";
      severity = pick(["info", "warning"]);
      message = severity === "warning" ? "Door opened at an unusual time." : "Door opened.";
    } else if (option === "DOOR_FORCED") {
      eventType = "DOOR_FORCED";
      severity = "critical";
      message = "Forced entry signature detected.";
    } else {
      eventType = "ACCESS_DENIED";
      severity = "warning";
      message = "Access denied (bad credential or badge).";
    }
  } else if (type === "camera") {
    const option = pick(["CAMERA_STREAM_OK", "CAMERA_OFFLINE", "CAMERA_RECONNECTED", "CAMERA_BLINDSPOT"]);
    if (option === "CAMERA_STREAM_OK") {
      eventType = "CAMERA_STREAM_OK";
      severity = "info";
      message = "Camera stream OK.";
    } else if (option === "CAMERA_OFFLINE") {
      eventType = "CAMERA_OFFLINE";
      severity = "critical";
      message = "Camera went offline unexpectedly.";
      devicePatch = { ...devicePatch, online: false };
    } else if (option === "CAMERA_RECONNECTED") {
      eventType = "CAMERA_RECONNECTED";
      severity = "info";
      message = "Camera reconnected.";
      devicePatch = { ...devicePatch, online: true };
    } else {
      eventType = "CAMERA_BLINDSPOT";
      severity = "warning";
      message = "Potential blindspot detected (lens obstruction).";
    }
  } else {
    // Generic fallback
    eventType = "DEVICE_ACTIVITY";
    severity = pick(["info", "warning"]);
    message = "Device activity (simulated).";
  }

  // Escalate if too many alerts recently (suspicious burst)
  const suspiciousBurst = recentAlertCount >= 3 && isAlert(severity);
  const finalSeverity = suspiciousBurst && severity === "warning" ? "critical" : severity;

  const event = {
    ...base,
    type: eventType,
    severity: finalSeverity,
    message: suspiciousBurst ? `${message} (burst detected)` : message,
  };

  const toast = buildToast(event);

  return { event, devicePatch, toast };
}
