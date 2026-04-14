import { create } from 'zustand';

export const useUIStore = create((set) => ({
  copilotOpen: false,
  filterOpen: false,
  scanlines: false,
  selectedFlight: null,
  setCopilotOpen: (v) => set({ copilotOpen: v }),
  setFilterOpen: (v) => set({ filterOpen: v }),
  toggleScanlines: () => set(s => ({ scanlines: !s.scanlines })),
  setSelectedFlight: (f) => set({ selectedFlight: f }),
}));