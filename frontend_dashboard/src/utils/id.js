function fallbackId() {
  return `id_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

// PUBLIC_INTERFACE
export function createId() {
  /**
   * Generates a reasonably unique id for UI keys, events, and toasts.
   */
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
  } catch {
    // ignore and fallback
  }
  return fallbackId();
}
