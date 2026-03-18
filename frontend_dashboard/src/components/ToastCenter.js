import React, { useEffect, useRef } from "react";
import { useAppState } from "../state/AppStateContext";

function toastClass(severity) {
  if (severity === "critical") return "toast critical";
  if (severity === "warning") return "toast warning";
  return "toast info";
}

// PUBLIC_INTERFACE
export function ToastCenter() {
  /**
   * Renders toast notifications triggered by warning/critical events.
   * Auto-dismisses after a short duration.
   */
  const { state, actions } = useAppState();
  const timersRef = useRef(new Map());

  useEffect(() => {
    const timers = timersRef.current;

    for (const t of state.toasts) {
      if (timers.has(t.id)) continue;

      const timeoutId = window.setTimeout(() => {
        actions.dismissToast(t.id);
        timers.delete(t.id);
      }, 6000);

      timers.set(t.id, timeoutId);
    }

    // Cleanup timers for toasts that disappeared
    for (const [toastId, timeoutId] of timers.entries()) {
      if (!state.toasts.find((x) => x.id === toastId)) {
        window.clearTimeout(timeoutId);
        timers.delete(toastId);
      }
    }
  }, [state.toasts, actions]);

  if (!state.toasts.length) return null;

  return (
    <div className="toast-center" role="status" aria-live="polite" aria-label="Notifications">
      {state.toasts.map((t) => (
        <div key={t.id} className={toastClass(t.severity)}>
          <div className="toast-head">
            <div className="toast-title">{t.title}</div>
            <button className="icon-btn" onClick={() => actions.dismissToast(t.id)} aria-label="Dismiss notification">
              <span aria-hidden="true">×</span>
            </button>
          </div>
          <div className="toast-body">{t.message}</div>
        </div>
      ))}
    </div>
  );
}
