import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { Vehicle, VehicleInput } from '../../core/domain/entities';
import { vehicleRepository } from '../../infrastructure/storage/storageRepository';
import { generateId } from '../../../utils/calculations';

interface VehicleState {
  vehicles: Vehicle[];
  selectedVehicleId: string | null;
  isLoading: boolean;
  error: string | null;
}

interface VehicleActions {
  // CRUD operations
  loadVehicles: () => void;
  addVehicle: (data: VehicleInput) => Vehicle;
  updateVehicle: (id: string, data: Partial<VehicleInput>) => void;
  deleteVehicle: (id: string) => void;
  
  // Selectors
  getVehicleById: (id: string) => Vehicle | undefined;
  selectVehicle: (id: string | null) => void;
  
  // Utility
  clearError: () => void;
  refreshVehicles: () => void;
}

type VehicleStore = VehicleState & VehicleActions;

export const useVehicleStore = create<VehicleStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial state
        vehicles: [],
        selectedVehicleId: null,
        isLoading: false,
        error: null,

        // Load vehicles from storage
        loadVehicles: () => {
          try {
            set((state) => {
              state.isLoading = true;
              state.error = null;
            });

            const vehicles = vehicleRepository.getAll();
            
            set((state) => {
              state.vehicles = vehicles;
              state.isLoading = false;
            });
          } catch (error) {
            set((state) => {
              state.error = error instanceof Error ? error.message : 'Failed to load vehicles';
              state.isLoading = false;
            });
          }
        },

        // Add new vehicle
        addVehicle: (data: VehicleInput) => {
          try {
            const newVehicle: Vehicle = {
              ...data,
              id: generateId(),
              createdAt: Date.now(),
            };

            vehicleRepository.add(newVehicle);

            set((state) => {
              state.vehicles.push(newVehicle);
              state.error = null;
            });

            return newVehicle;
          } catch (error) {
            set((state) => {
              state.error = error instanceof Error ? error.message : 'Failed to add vehicle';
            });
            throw error;
          }
        },

        // Update existing vehicle
        updateVehicle: (id: string, data: Partial<VehicleInput>) => {
          try {
            const existingVehicle = get().vehicles.find(v => v.id === id);
            if (!existingVehicle) {
              throw new Error('Vehicle not found');
            }

            const updatedVehicle: Vehicle = {
              ...existingVehicle,
              ...data,
            };

            vehicleRepository.update(id, updatedVehicle);

            set((state) => {
              const index = state.vehicles.findIndex(v => v.id === id);
              if (index !== -1) {
                state.vehicles[index] = updatedVehicle;
              }
              state.error = null;
            });
          } catch (error) {
            set((state) => {
              state.error = error instanceof Error ? error.message : 'Failed to update vehicle';
            });
            throw error;
          }
        },

        // Delete vehicle
        deleteVehicle: (id: string) => {
          try {
            vehicleRepository.delete(id);

            set((state) => {
              state.vehicles = state.vehicles.filter(v => v.id !== id);
              if (state.selectedVehicleId === id) {
                state.selectedVehicleId = null;
              }
              state.error = null;
            });
          } catch (error) {
            set((state) => {
              state.error = error instanceof Error ? error.message : 'Failed to delete vehicle';
            });
            throw error;
          }
        },

        // Get vehicle by ID
        getVehicleById: (id: string) => {
          return get().vehicles.find(v => v.id === id);
        },

        // Select vehicle
        selectVehicle: (id: string | null) => {
          set((state) => {
            state.selectedVehicleId = id;
          });
        },

        // Clear error
        clearError: () => {
          set((state) => {
            state.error = null;
          });
        },

        // Refresh vehicles from storage
        refreshVehicles: () => {
          get().loadVehicles();
        },
      })),
      {
        name: 'vehicle-storage',
        partialize: (state) => ({
          selectedVehicleId: state.selectedVehicleId,
        }),
      }
    ),
    { name: 'VehicleStore' }
  )
);

// Selectors for optimized access
export const selectVehicles = (state: VehicleStore) => state.vehicles;
export const selectSelectedVehicle = (state: VehicleStore) => {
  if (!state.selectedVehicleId) return null;
  return state.vehicles.find(v => v.id === state.selectedVehicleId) || null;
};
export const selectVehicleById = (id: string) => (state: VehicleStore) => 
  state.vehicles.find(v => v.id === id);
export const selectIsLoading = (state: VehicleStore) => state.isLoading;
export const selectError = (state: VehicleStore) => state.error;
