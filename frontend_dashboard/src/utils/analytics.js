import { formatShortTime } from "./time";

function severityRank(sev) {
  if (sev === "critical") return 3;
  if (sev === "warning") return 2;
  return 1;
}

// PUBLIC_INTERFACE
export function buildBuckets(events, windowMinutes = 60, bucketMinutes = 5) {
  /**
   * Builds time buckets for the last `windowMinutes`, grouped by `bucketMinutes`.
   * Returns [{ts,label,total,warnings,criticals}]
   */
  const now = Date.now();
  const windowMs = windowMinutes * 60 * 1000;
  const bucketMs = bucketMinutes * 60 * 1000;
  const start = now - windowMs;

  const bucketCount = Math.ceil(windowMs / bucketMs);
  const buckets = Array.from({ length: bucketCount }, (_, i) => {
    const ts = start + i * bucketMs;
    return { ts, label: formatShortTime(ts), total: 0, warnings: 0, criticals: 0 };
  });

  for (const e of events) {
    if (!e || typeof e.ts !== "number") continue;
    if (e.ts < start) continue;
    const idx = Math.min(bucketCount - 1, Math.floor((e.ts - start) / bucketMs));
    buckets[idx].total += 1;
    if (e.severity === "warning") buckets[idx].warnings += 1;
    if (e.severity === "critical") buckets[idx].criticals += 1;
  }

  return buckets;
}

// PUBLIC_INTERFACE
export function countByType(events, minutes = 24 * 60) {
  /**
   * Counts events by type for the last N minutes.
   * Returns [{type,count,severity}] where severity is max severity observed for that type.
   */
  const cutoff = Date.now() - minutes * 60 * 1000;
  const map = new Map();

  for (const e of events) {
    if (!e || typeof e.ts !== "number") continue;
    if (e.ts < cutoff) continue;

    const existing = map.get(e.type) || { type: e.type, count: 0, severity: "info" };
    existing.count += 1;
    if (severityRank(e.severity) > severityRank(existing.severity)) {
      existing.severity = e.severity;
    }
    map.set(e.type, existing);
  }

  return Array.from(map.values()).sort((a, b) => b.count - a.count);
}
