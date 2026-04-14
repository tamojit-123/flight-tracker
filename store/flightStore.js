import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export const useFlightStore = create(immer((set) => ({
  trackedFlight: null,
  altitudeHistory: [],
  positionHistory: [],
  setTrackedFlight: (f) => set(s => { s.trackedFlight = f; }),
  pushAltitude: (entry) => set(s => {
    s.altitudeHistory.push(entry);
    if (s.altitudeHistory.length > 120) s.altitudeHistory.shift();
  }),
  pushPosition: (entry) => set(s => {
    s.positionHistory.push(entry);
    if (s.positionHistory.length > 300) s.positionHistory.shift();
  }),
  clearHistory: () => set(s => { 
    s.altitudeHistory = []; 
    s.positionHistory = [];
  }),
})));