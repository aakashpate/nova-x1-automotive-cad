import { create } from 'zustand';
import type { VehicleSystem } from './vehicleTypes';

interface VehicleStore {
  selectedComponent: string | null;
  exploded: boolean;
  xrayMode: boolean;
  activeSystemFilter: VehicleSystem | 'all';
  doorsOpen: boolean;
  hoodOpen: boolean;
  trunkOpen: boolean;
  lightsEnabled: boolean;
  roofTint: 'clear' | 'tinted' | 'dark';
  activeCameraPreset: string;
  inspectMode: boolean;
  wheelRotation: number;
  loading: boolean;
  loadingMessage: string;

  setSelectedComponent: (id: string | null) => void;
  toggleExploded: () => void;
  toggleXray: () => void;
  setSystemFilter: (filter: VehicleSystem | 'all') => void;
  toggleDoors: () => void;
  toggleHood: () => void;
  toggleTrunk: () => void;
  toggleLights: () => void;
  cycleRoofTint: () => void;
  setCameraPreset: (preset: string) => void;
  toggleInspectMode: () => void;
  setWheelRotation: (r: number) => void;
  setLoading: (loading: boolean, message?: string) => void;
  reset: () => void;
}

export const useVehicleStore = create<VehicleStore>((set) => ({
  selectedComponent: null,
  exploded: false,
  xrayMode: false,
  activeSystemFilter: 'all',
  doorsOpen: false,
  hoodOpen: false,
  trunkOpen: false,
  lightsEnabled: true,
  roofTint: 'clear',
  activeCameraPreset: 'orbit',
  inspectMode: false,
  wheelRotation: 0,
  loading: true,
  loadingMessage: 'INITIALIZING VEHICLE SYSTEMS',

  setSelectedComponent: (id) => set({ selectedComponent: id }),
  toggleExploded: () => set((s) => ({ exploded: !s.exploded, selectedComponent: null })),
  toggleXray: () => set((s) => ({ xrayMode: !s.xrayMode })),
  setSystemFilter: (filter) => set({ activeSystemFilter: filter }),
  toggleDoors: () => set((s) => ({ doorsOpen: !s.doorsOpen })),
  toggleHood: () => set((s) => ({ hoodOpen: !s.hoodOpen })),
  toggleTrunk: () => set((s) => ({ trunkOpen: !s.trunkOpen })),
  toggleLights: () => set((s) => ({ lightsEnabled: !s.lightsEnabled })),
  cycleRoofTint: () =>
    set((s) => ({
      roofTint: s.roofTint === 'clear' ? 'tinted' : s.roofTint === 'tinted' ? 'dark' : 'clear',
    })),
  setCameraPreset: (preset) => set({ activeCameraPreset: preset }),
  toggleInspectMode: () => set((s) => ({ inspectMode: !s.inspectMode })),
  setWheelRotation: (r) => set({ wheelRotation: r }),
  setLoading: (loading, message) => set({ loading, loadingMessage: message || 'INITIALIZING VEHICLE SYSTEMS' }),
  reset: () =>
    set({
      selectedComponent: null,
      exploded: false,
      xrayMode: false,
      activeSystemFilter: 'all',
      doorsOpen: false,
      hoodOpen: false,
      trunkOpen: false,
      lightsEnabled: true,
      roofTint: 'clear',
      activeCameraPreset: 'orbit',
      inspectMode: false,
    }),
}));
