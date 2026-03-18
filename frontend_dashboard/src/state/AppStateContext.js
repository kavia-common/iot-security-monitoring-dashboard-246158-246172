import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from "react";
import { DEFAULT_DEVICES, STORAGE_KEY, clampPersistedState } from "./defaultData";
import { generateSimulatedEvent } from "./simulator";

const AppStateContext = createContext(null);

function nowMs() {
  return Date.now();
}

function safeLoad() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return clampPersistedState(parsed);
  } catch {
    return null;
  }
}

function safeSave(state) {
  try {
    const payload = {
      version: 1,
      theme: state.theme,
      simulation: state.simulation,
      devices: state.devices,
      events: state.events,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore persistence errors (e.g., private mode / quota).
  }
}

function buildInitialState() {
  const persisted = safeLoad();
  const base = {
    theme: "retro",
    simulation: { enabled: true, intervalMs: 4500 },
    devices: DEFAULT_DEVICES,
    events: [],
    toasts: [],
  };

  if (!persisted) return base;
  return {
    ...base,
    ...persisted,
    // never persist toasts
    toasts: [],
  };
}

function capEvents(events, max = 500) {
  if (events.length <= max) return events;
  return events.slice(events.length - max);
}

function reducer(state, action) {
  switch (action.type) {
    case "SET_THEME": {
      return { ...state, theme: action.payload };
    }
    case "SET_SIMULATION": {
      return { ...state, simulation: { ...state.simulation, ...action.payload } };
    }
    case "TOGGLE_DEVICE_ONLINE": {
      const { deviceId } = action.payload;
      return {
        ...state,
        devices: state.devices.map((d) =>
          d.id === deviceId ? { ...d, online: !d.online, lastSeenAt: nowMs() } : d
        ),
      };
    }
    case "UPDATE_DEVICE": {
      const { deviceId, patch } = action.payload;
      return {
        ...state,
        devices: state.devices.map((d) => (d.id === deviceId ? { ...d, ...patch } : d)),
      };
    }
    case "ADD_EVENT": {
      const { event, devicePatch, toast } = action.payload;

      const devices = devicePatch
        ? state.devices.map((d) => (d.id === event.deviceId ? { ...d, ...devicePatch } : d))
        : state.devices.map((d) => (d.id === event.deviceId ? { ...d, lastSeenAt: event.ts } : d));

      const events = capEvents([...state.events, event]);
      const toasts = toast ? [...state.toasts, toast] : state.toasts;

      return { ...state, devices, events, toasts };
    }
    case "DISMISS_TOAST": {
      const { toastId } = action.payload;
      return { ...state, toasts: state.toasts.filter((t) => t.id !== toastId) };
    }
    default:
      return state;
  }
}

// PUBLIC_INTERFACE
export function AppStateProvider({ children }) {
  /**
   * Global state provider for the dashboard (devices/events/simulation/theme/toasts).
   * Also persists state to localStorage and runs the simulated real-time event timer.
   */
  const [state, dispatch] = useReducer(reducer, undefined, buildInitialState);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Apply theme to document root
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", state.theme);
  }, [state.theme]);

  // Persist (debounced)
  useEffect(() => {
    const t = window.setTimeout(() => safeSave(state), 250);
    return () => window.clearTimeout(t);
  }, [state]);

  const dismissToast = useCallback((toastId) => {
    dispatch({ type: "DISMISS_TOAST", payload: { toastId } });
  }, []);

  const setTheme = useCallback((theme) => {
    dispatch({ type: "SET_THEME", payload: theme });
  }, []);

  const toggleTheme = useCallback(() => {
    const current = stateRef.current.theme;
    dispatch({ type: "SET_THEME", payload: current === "retro" ? "light" : "retro" });
  }, []);

  const setSimulation = useCallback((patch) => {
    dispatch({ type: "SET_SIMULATION", payload: patch });
  }, []);

  const toggleDeviceOnline = useCallback((deviceId) => {
    dispatch({ type: "TOGGLE_DEVICE_ONLINE", payload: { deviceId } });
  }, []);

  const updateDevice = useCallback((deviceId, patch) => {
    dispatch({ type: "UPDATE_DEVICE", payload: { deviceId, patch } });
  }, []);

  const simulateEvent = useCallback(() => {
    const current = stateRef.current;
    const { event, devicePatch, toast } = generateSimulatedEvent(current);
    dispatch({ type: "ADD_EVENT", payload: { event, devicePatch, toast } });
  }, []);

  // Simulated realtime events
  useEffect(() => {
    if (!state.simulation.enabled) return;

    const id = window.setInterval(() => {
      simulateEvent();
    }, Math.max(800, state.simulation.intervalMs));

    return () => window.clearInterval(id);
  }, [state.simulation.enabled, state.simulation.intervalMs, simulateEvent]);

  const api = useMemo(() => {
    return {
      state,
      actions: {
        dismissToast,
        setTheme,
        toggleTheme,
        setSimulation,
        simulateEvent,
        toggleDeviceOnline,
        updateDevice,
      },
    };
  }, [
    state,
    dismissToast,
    setTheme,
    toggleTheme,
    setSimulation,
    simulateEvent,
    toggleDeviceOnline,
    updateDevice,
  ]);

  return <AppStateContext.Provider value={api}>{children}</AppStateContext.Provider>;
}

// PUBLIC_INTERFACE
export function useAppState() {
  /**
   * Access global app state and actions.
   * @returns {{state: object, actions: object}}
   */
  const ctx = useContext(AppStateContext);
  if (!ctx) {
    throw new Error("useAppState must be used within an AppStateProvider");
  }
  return ctx;
}
