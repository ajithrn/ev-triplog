import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { Trip, Stop, ChargingSession, StopInput } from '../../core/domain/entities';
import { tripRepository } from '../../infrastructure/storage/storageRepository';
import { generateId, calculateTripMetrics } from '../../../utils/calculations';

interface TripState {
  trips: Trip[];
  activeTrip: Trip | null;
  isLoading: boolean;
  error: string | null;
}

interface TripActions {
  // Trip CRUD operations
  loadTrips: () => void;
  createTrip: (name: string, vehicleId: string, initialStop: StopInput) => Trip;
  updateTrip: (id: string, data: Partial<Omit<Trip, 'id' | 'stops'>>) => void;
  deleteTrip: (id: string) => void;
  completeTrip: (id: string) => void;
  reopenTrip: (id: string) => void;
  
  // Stop operations
  addStop: (tripId: string, stop: StopInput) => void;
  updateStop: (tripId: string, stopId: string, stop: StopInput) => void;
  deleteStop: (tripId: string, stopId: string) => void;
  
  // Charging session operations
  addChargingSession: (tripId: string, stopId: string, session: ChargingSession) => void;
  updateChargingSession: (tripId: string, stopId: string, session: ChargingSession) => void;
  deleteChargingSession: (tripId: string, stopId: string) => void;
  
  // Selectors
  getTripById: (id: string) => Trip | undefined;
  getTripsByVehicle: (vehicleId: string) => Trip[];
  getCompletedTrips: () => Trip[];
  
  // Utility
  clearError: () => void;
  refreshTrips: () => void;
}

type TripStore = TripState & TripActions;

export const useTripStore = create<TripStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial state
        trips: [],
        activeTrip: null,
        isLoading: false,
        error: null,

        // Load trips from storage
        loadTrips: () => {
          try {
            set((state) => {
              state.isLoading = true;
              state.error = null;
            });

            const trips = tripRepository.getAll();
            const active = tripRepository.getActive();
            
            set((state) => {
              state.trips = trips;
              state.activeTrip = active || null;
              state.isLoading = false;
            });
          } catch (error) {
            set((state) => {
              state.error = error instanceof Error ? error.message : 'Failed to load trips';
              state.isLoading = false;
            });
          }
        },

        // Create new trip
        createTrip: (name: string, vehicleId: string, initialStop: StopInput) => {
          try {
            const tripId = generateId();
            const stop: Stop = {
              ...initialStop,
              id: generateId(),
              tripId,
            };

            const newTrip: Trip = {
              id: tripId,
              name,
              vehicleId,
              startDate: initialStop.timestamp,
              status: 'active',
              stops: [stop],
              totalDistance: 0,
              totalEnergyUsed: 0,
              averageEfficiency: 0,
            };

            tripRepository.add(newTrip);

            set((state) => {
              state.trips.push(newTrip);
              state.activeTrip = newTrip;
              state.error = null;
            });

            return newTrip;
          } catch (error) {
            set((state) => {
              state.error = error instanceof Error ? error.message : 'Failed to create trip';
            });
            throw error;
          }
        },

        // Update trip
        updateTrip: (id: string, data: Partial<Omit<Trip, 'id' | 'stops'>>) => {
          try {
            const existingTrip = get().trips.find(t => t.id === id);
            if (!existingTrip) {
              throw new Error('Trip not found');
            }

            const updatedTrip: Trip = {
              ...existingTrip,
              ...data,
            };

            tripRepository.update(id, updatedTrip);

            set((state) => {
              const index = state.trips.findIndex(t => t.id === id);
              if (index !== -1) {
                state.trips[index] = updatedTrip;
              }
              if (state.activeTrip?.id === id) {
                state.activeTrip = updatedTrip;
              }
              state.error = null;
            });
          } catch (error) {
            set((state) => {
              state.error = error instanceof Error ? error.message : 'Failed to update trip';
            });
            throw error;
          }
        },

        // Delete trip
        deleteTrip: (id: string) => {
          try {
            tripRepository.delete(id);

            set((state) => {
              state.trips = state.trips.filter(t => t.id !== id);
              if (state.activeTrip?.id === id) {
                state.activeTrip = null;
              }
              state.error = null;
            });
          } catch (error) {
            set((state) => {
              state.error = error instanceof Error ? error.message : 'Failed to delete trip';
            });
            throw error;
          }
        },

        // Complete trip
        completeTrip: (id: string) => {
          try {
            const trip = get().trips.find(t => t.id === id);
            if (!trip) {
              throw new Error('Trip not found');
            }

            const metrics = calculateTripMetrics(trip);
            const updatedTrip: Trip = {
              ...trip,
              status: 'completed',
              endDate: Date.now(),
              ...metrics,
            };

            tripRepository.update(id, updatedTrip);

            set((state) => {
              const index = state.trips.findIndex(t => t.id === id);
              if (index !== -1) {
                state.trips[index] = updatedTrip;
              }
              if (state.activeTrip?.id === id) {
                state.activeTrip = null;
              }
              state.error = null;
            });
          } catch (error) {
            set((state) => {
              state.error = error instanceof Error ? error.message : 'Failed to complete trip';
            });
            throw error;
          }
        },

        // Reopen trip
        reopenTrip: (id: string) => {
          try {
            const trip = get().trips.find(t => t.id === id);
            if (!trip) {
              throw new Error('Trip not found');
            }

            const updatedTrip: Trip = {
              ...trip,
              status: 'active',
              endDate: undefined,
            };

            tripRepository.update(id, updatedTrip);

            set((state) => {
              const index = state.trips.findIndex(t => t.id === id);
              if (index !== -1) {
                state.trips[index] = updatedTrip;
              }
              state.activeTrip = updatedTrip;
              state.error = null;
            });
          } catch (error) {
            set((state) => {
              state.error = error instanceof Error ? error.message : 'Failed to reopen trip';
            });
            throw error;
          }
        },

        // Add stop to trip
        addStop: (tripId: string, stopData: StopInput) => {
          try {
            const trip = get().trips.find(t => t.id === tripId);
            if (!trip) {
              throw new Error('Trip not found');
            }

            const newStop: Stop = {
              ...stopData,
              id: generateId(),
              tripId,
            };

            const updatedStops = [...trip.stops, newStop];
            const metrics = calculateTripMetrics({ ...trip, stops: updatedStops });

            const updatedTrip: Trip = {
              ...trip,
              stops: updatedStops,
              ...metrics,
            };

            tripRepository.update(tripId, updatedTrip);

            set((state) => {
              const index = state.trips.findIndex(t => t.id === tripId);
              if (index !== -1) {
                state.trips[index] = updatedTrip;
              }
              if (state.activeTrip?.id === tripId) {
                state.activeTrip = updatedTrip;
              }
              state.error = null;
            });
          } catch (error) {
            set((state) => {
              state.error = error instanceof Error ? error.message : 'Failed to add stop';
            });
            throw error;
          }
        },

        // Update stop
        updateStop: (tripId: string, stopId: string, stopData: StopInput) => {
          try {
            const trip = get().trips.find(t => t.id === tripId);
            if (!trip) {
              throw new Error('Trip not found');
            }

            const updatedStops = trip.stops.map((stop) =>
              stop.id === stopId ? { ...stopData, id: stopId, tripId } : stop
            );
            const metrics = calculateTripMetrics({ ...trip, stops: updatedStops });

            const updatedTrip: Trip = {
              ...trip,
              stops: updatedStops,
              ...metrics,
            };

            tripRepository.update(tripId, updatedTrip);

            set((state) => {
              const index = state.trips.findIndex(t => t.id === tripId);
              if (index !== -1) {
                state.trips[index] = updatedTrip;
              }
              if (state.activeTrip?.id === tripId) {
                state.activeTrip = updatedTrip;
              }
              state.error = null;
            });
          } catch (error) {
            set((state) => {
              state.error = error instanceof Error ? error.message : 'Failed to update stop';
            });
            throw error;
          }
        },

        // Delete stop
        deleteStop: (tripId: string, stopId: string) => {
          try {
            const trip = get().trips.find(t => t.id === tripId);
            if (!trip) {
              throw new Error('Trip not found');
            }

            const updatedStops = trip.stops.filter((stop) => stop.id !== stopId);
            const metrics = calculateTripMetrics({ ...trip, stops: updatedStops });

            const updatedTrip: Trip = {
              ...trip,
              stops: updatedStops,
              ...metrics,
            };

            tripRepository.update(tripId, updatedTrip);

            set((state) => {
              const index = state.trips.findIndex(t => t.id === tripId);
              if (index !== -1) {
                state.trips[index] = updatedTrip;
              }
              if (state.activeTrip?.id === tripId) {
                state.activeTrip = updatedTrip;
              }
              state.error = null;
            });
          } catch (error) {
            set((state) => {
              state.error = error instanceof Error ? error.message : 'Failed to delete stop';
            });
            throw error;
          }
        },

        // Add charging session
        addChargingSession: (tripId: string, stopId: string, session: ChargingSession) => {
          try {
            const trip = get().trips.find(t => t.id === tripId);
            if (!trip) {
              throw new Error('Trip not found');
            }

            const updatedStops = trip.stops.map((stop) =>
              stop.id === stopId ? { ...stop, chargingSession: session } : stop
            );
            const metrics = calculateTripMetrics({ ...trip, stops: updatedStops });

            const updatedTrip: Trip = {
              ...trip,
              stops: updatedStops,
              ...metrics,
            };

            tripRepository.update(tripId, updatedTrip);

            set((state) => {
              const index = state.trips.findIndex(t => t.id === tripId);
              if (index !== -1) {
                state.trips[index] = updatedTrip;
              }
              if (state.activeTrip?.id === tripId) {
                state.activeTrip = updatedTrip;
              }
              state.error = null;
            });
          } catch (error) {
            set((state) => {
              state.error = error instanceof Error ? error.message : 'Failed to add charging session';
            });
            throw error;
          }
        },

        // Update charging session
        updateChargingSession: (tripId: string, stopId: string, session: ChargingSession) => {
          try {
            const trip = get().trips.find(t => t.id === tripId);
            if (!trip) {
              throw new Error('Trip not found');
            }

            const updatedStops = trip.stops.map((stop) =>
              stop.id === stopId ? { ...stop, chargingSession: session } : stop
            );
            const metrics = calculateTripMetrics({ ...trip, stops: updatedStops });

            const updatedTrip: Trip = {
              ...trip,
              stops: updatedStops,
              ...metrics,
            };

            tripRepository.update(tripId, updatedTrip);

            set((state) => {
              const index = state.trips.findIndex(t => t.id === tripId);
              if (index !== -1) {
                state.trips[index] = updatedTrip;
              }
              if (state.activeTrip?.id === tripId) {
                state.activeTrip = updatedTrip;
              }
              state.error = null;
            });
          } catch (error) {
            set((state) => {
              state.error = error instanceof Error ? error.message : 'Failed to update charging session';
            });
            throw error;
          }
        },

        // Delete charging session
        deleteChargingSession: (tripId: string, stopId: string) => {
          try {
            const trip = get().trips.find(t => t.id === tripId);
            if (!trip) {
              throw new Error('Trip not found');
            }

            const updatedStops = trip.stops.map((stop) =>
              stop.id === stopId ? { ...stop, chargingSession: undefined } : stop
            );
            const metrics = calculateTripMetrics({ ...trip, stops: updatedStops });

            const updatedTrip: Trip = {
              ...trip,
              stops: updatedStops,
              ...metrics,
            };

            tripRepository.update(tripId, updatedTrip);

            set((state) => {
              const index = state.trips.findIndex(t => t.id === tripId);
              if (index !== -1) {
                state.trips[index] = updatedTrip;
              }
              if (state.activeTrip?.id === tripId) {
                state.activeTrip = updatedTrip;
              }
              state.error = null;
            });
          } catch (error) {
            set((state) => {
              state.error = error instanceof Error ? error.message : 'Failed to delete charging session';
            });
            throw error;
          }
        },

        // Get trip by ID
        getTripById: (id: string) => {
          return get().trips.find(t => t.id === id);
        },

        // Get trips by vehicle
        getTripsByVehicle: (vehicleId: string) => {
          return get().trips.filter(t => t.vehicleId === vehicleId);
        },

        // Get completed trips
        getCompletedTrips: () => {
          return get().trips.filter(t => t.status === 'completed');
        },

        // Clear error
        clearError: () => {
          set((state) => {
            state.error = null;
          });
        },

        // Refresh trips from storage
        refreshTrips: () => {
          get().loadTrips();
        },
      })),
      {
        name: 'trip-storage',
        partialize: (state) => ({
          // Don't persist the full trips array, load from storage instead
        }),
      }
    ),
    { name: 'TripStore' }
  )
);

// Selectors for optimized access
export const selectTrips = (state: TripStore) => state.trips;
export const selectActiveTrip = (state: TripStore) => state.activeTrip;
export const selectTripById = (id: string) => (state: TripStore) => 
  state.trips.find(t => t.id === id);
export const selectTripsByVehicle = (vehicleId: string) => (state: TripStore) =>
  state.trips.filter(t => t.vehicleId === vehicleId);
export const selectCompletedTrips = (state: TripStore) =>
  state.trips.filter(t => t.status === 'completed');
export const selectIsLoading = (state: TripStore) => state.isLoading;
export const selectError = (state: TripStore) => state.error;
