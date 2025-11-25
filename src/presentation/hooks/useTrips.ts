import { useCallback } from 'react';
import { useTripStore } from '../stores/tripStore';
import type { StopInput, ChargingSession } from '../../core/domain/entities';

/**
 * Custom hook for trip operations
 * Provides a clean API for components to interact with trip store
 */
export function useTrips() {
  // Get store state
  const trips = useTripStore((state) => state.trips);
  const activeTrip = useTripStore((state) => state.activeTrip);
  const isLoading = useTripStore((state) => state.isLoading);
  const error = useTripStore((state) => state.error);

  // Get store actions
  const loadTrips = useTripStore((state) => state.loadTrips);
  const createTrip = useTripStore((state) => state.createTrip);
  const updateTrip = useTripStore((state) => state.updateTrip);
  const deleteTrip = useTripStore((state) => state.deleteTrip);
  const completeTrip = useTripStore((state) => state.completeTrip);
  const reopenTrip = useTripStore((state) => state.reopenTrip);
  const addStop = useTripStore((state) => state.addStop);
  const updateStop = useTripStore((state) => state.updateStop);
  const deleteStop = useTripStore((state) => state.deleteStop);
  const addChargingSession = useTripStore((state) => state.addChargingSession);
  const updateChargingSession = useTripStore((state) => state.updateChargingSession);
  const deleteChargingSession = useTripStore((state) => state.deleteChargingSession);
  const getTripById = useTripStore((state) => state.getTripById);
  const getTripsByVehicle = useTripStore((state) => state.getTripsByVehicle);
  const getCompletedTrips = useTripStore((state) => state.getCompletedTrips);
  const clearError = useTripStore((state) => state.clearError);
  const refreshTrips = useTripStore((state) => state.refreshTrips);

  // Computed values
  const hasTrips = trips.length > 0;
  const hasActiveTrip = activeTrip !== null;
  const completedTrips = getCompletedTrips();

  // Memoized callbacks
  const handleCreateTrip = useCallback((name: string, vehicleId: string, initialStop: StopInput) => {
    return createTrip(name, vehicleId, initialStop);
  }, [createTrip]);

  const handleDeleteTrip = useCallback((id: string) => {
    deleteTrip(id);
  }, [deleteTrip]);

  const handleCompleteTrip = useCallback((id: string) => {
    completeTrip(id);
  }, [completeTrip]);

  const handleReopenTrip = useCallback((id: string) => {
    reopenTrip(id);
  }, [reopenTrip]);

  const handleAddStop = useCallback((tripId: string, stop: StopInput) => {
    addStop(tripId, stop);
  }, [addStop]);

  const handleUpdateStop = useCallback((tripId: string, stopId: string, stop: StopInput) => {
    updateStop(tripId, stopId, stop);
  }, [updateStop]);

  const handleDeleteStop = useCallback((tripId: string, stopId: string) => {
    deleteStop(tripId, stopId);
  }, [deleteStop]);

  const handleAddChargingSession = useCallback((tripId: string, stopId: string, session: ChargingSession) => {
    addChargingSession(tripId, stopId, session);
  }, [addChargingSession]);

  const handleUpdateChargingSession = useCallback((tripId: string, stopId: string, session: ChargingSession) => {
    updateChargingSession(tripId, stopId, session);
  }, [updateChargingSession]);

  const handleDeleteChargingSession = useCallback((tripId: string, stopId: string) => {
    deleteChargingSession(tripId, stopId);
  }, [deleteChargingSession]);

  return {
    // State
    trips,
    activeTrip,
    completedTrips,
    isLoading,
    error,
    hasTrips,
    hasActiveTrip,

    // Trip actions
    loadTrips,
    createTrip: handleCreateTrip,
    updateTrip,
    deleteTrip: handleDeleteTrip,
    completeTrip: handleCompleteTrip,
    reopenTrip: handleReopenTrip,
    getTripById,
    getTripsByVehicle,
    getCompletedTrips,

    // Stop actions
    addStop: handleAddStop,
    updateStop: handleUpdateStop,
    deleteStop: handleDeleteStop,

    // Charging session actions
    addChargingSession: handleAddChargingSession,
    updateChargingSession: handleUpdateChargingSession,
    deleteChargingSession: handleDeleteChargingSession,

    // Utility
    clearError,
    refreshTrips,
  };
}
