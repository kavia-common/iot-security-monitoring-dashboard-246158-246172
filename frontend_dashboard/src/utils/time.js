function pad2(n) {
  return String(n).padStart(2, "0");
}

// PUBLIC_INTERFACE
export function formatTimestamp(ts) {
  /**
   * Formats a timestamp (ms) as YYYY-MM-DD HH:mm:ss in local time.
   */
  const d = new Date(ts);
  const yyyy = d.getFullYear();
  const mm = pad2(d.getMonth() + 1);
  const dd = pad2(d.getDate());
  const hh = pad2(d.getHours());
  const mi = pad2(d.getMinutes());
  const ss = pad2(d.getSeconds());
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
}

// PUBLIC_INTERFACE
export function formatShortTime(ts) {
  /**
   * Formats a timestamp (ms) as HH:mm for chart axis labels.
   */
  const d = new Date(ts);
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

// PUBLIC_INTERFACE
export function minutesAgoToCutoff(minutes) {
  /**
   * Returns epoch ms cutoff for "last N minutes" filter.
   */
  return Date.now() - minutes * 60 * 1000;
}

// PUBLIC_INTERFACE
export function formatAlertStatus(status) {
  /**
   * Formats internal alert status values (active|acknowledged|resolved|unknown) for UI display.
   */
  if (status === "acknowledged") return "Acknowledged";
  if (status === "resolved") return "Resolved";
  if (status === "active") return "Active";
  return "N/A";
}
