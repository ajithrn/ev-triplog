import { useCallback } from 'react';
import { useVehicleStore } from '../stores/vehicleStore';
import type { VehicleInput } from '../../core/domain/entities';

/**
 * Custom hook for vehicle operations
 * Provides a clean API for components to interact with vehicle store
 */
export function useVehicles() {
  // Get store state
  const vehicles = useVehicleStore((state) => state.vehicles);
  const selectedVehicleId = useVehicleStore((state) => state.selectedVehicleId);
  const isLoading = useVehicleStore((state) => state.isLoading);
  const error = useVehicleStore((state) => state.error);

  // Get store actions
  const loadVehicles = useVehicleStore((state) => state.loadVehicles);
  const addVehicle = useVehicleStore((state) => state.addVehicle);
  const updateVehicle = useVehicleStore((state) => state.updateVehicle);
  const deleteVehicle = useVehicleStore((state) => state.deleteVehicle);
  const selectVehicle = useVehicleStore((state) => state.selectVehicle);
  const getVehicleById = useVehicleStore((state) => state.getVehicleById);
  const clearError = useVehicleStore((state) => state.clearError);
  const refreshVehicles = useVehicleStore((state) => state.refreshVehicles);

  // Computed values
  const selectedVehicle = selectedVehicleId ? getVehicleById(selectedVehicleId) : null;
  const hasVehicles = vehicles.length > 0;

  // Memoized callbacks
  const handleAddVehicle = useCallback((data: VehicleInput) => {
    return addVehicle(data);
  }, [addVehicle]);

  const handleUpdateVehicle = useCallback((id: string, data: Partial<VehicleInput>) => {
    updateVehicle(id, data);
  }, [updateVehicle]);

  const handleDeleteVehicle = useCallback((id: string) => {
    deleteVehicle(id);
  }, [deleteVehicle]);

  const handleSelectVehicle = useCallback((id: string | null) => {
    selectVehicle(id);
  }, [selectVehicle]);

  return {
    // State
    vehicles,
    selectedVehicle,
    selectedVehicleId,
    isLoading,
    error,
    hasVehicles,

    // Actions
    loadVehicles,
    addVehicle: handleAddVehicle,
    updateVehicle: handleUpdateVehicle,
    deleteVehicle: handleDeleteVehicle,
    selectVehicle: handleSelectVehicle,
    getVehicleById,
    clearError,
    refreshVehicles,
  };
}
