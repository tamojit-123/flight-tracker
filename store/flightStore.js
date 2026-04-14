import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export const useFlightStore = create(immer((set) => ({
  trackedFlight: null,
  altitudeHistory: [],
  setTrackedFlight: (f) => set(s => { s.trackedFlight = f; }),
  pushAltitude: (entry) => set(s => {
    s.altitudeHistory.push(entry);
    if (s.altitudeHistory.length > 120) s.altitudeHistory.shift();
  }),
  clearHistory: () => set(s => { s.altitudeHistory = []; }),
})));