'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Vehicle } from '@/types';
import {
  getVehicles,
  addVehicle as addVehicleToStorage,
  updateVehicle as updateVehicleInStorage,
  deleteVehicle as deleteVehicleFromStorage,
} from '@/utils/storage';
import { generateId } from '@/utils/calculations';

interface VehicleContextType {
  vehicles: Vehicle[];
  addVehicle: (vehicle: Omit<Vehicle, 'id' | 'createdAt'>) => void;
  updateVehicle: (id: string, vehicle: Omit<Vehicle, 'id' | 'createdAt'>) => void;
  deleteVehicle: (id: string) => void;
  getVehicleById: (id: string) => Vehicle | undefined;
  refreshVehicles: () => void;
}

const VehicleContext = createContext<VehicleContextType | undefined>(undefined);

export function VehicleProvider({ children }: { children: ReactNode }) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  // Load vehicles from storage on mount
  useEffect(() => {
    const loadedVehicles = getVehicles();
    setVehicles(loadedVehicles);
  }, []);

  const addVehicle = (vehicleData: Omit<Vehicle, 'id' | 'createdAt'>) => {
    const newVehicle: Vehicle = {
      ...vehicleData,
      id: generateId(),
      createdAt: Date.now(),
    };
    addVehicleToStorage(newVehicle);
    setVehicles((prev) => [...prev, newVehicle]);
  };

  const updateVehicle = (id: string, vehicleData: Omit<Vehicle, 'id' | 'createdAt'>) => {
    const existingVehicle = vehicles.find((v) => v.id === id);
    if (existingVehicle) {
      const updatedVehicle: Vehicle = {
        ...vehicleData,
        id,
        createdAt: existingVehicle.createdAt,
      };
      updateVehicleInStorage(id, updatedVehicle);
      setVehicles((prev) => prev.map((v) => (v.id === id ? updatedVehicle : v)));
    }
  };

  const deleteVehicle = (id: string) => {
    deleteVehicleFromStorage(id);
    setVehicles((prev) => prev.filter((v) => v.id !== id));
  };

  const getVehicleById = (id: string) => {
    return vehicles.find((v) => v.id === id);
  };

  const refreshVehicles = () => {
    const loadedVehicles = getVehicles();
    setVehicles(loadedVehicles);
  };

  return (
    <VehicleContext.Provider
      value={{
        vehicles,
        addVehicle,
        updateVehicle,
        deleteVehicle,
        getVehicleById,
        refreshVehicles,
      }}
    >
      {children}
    </VehicleContext.Provider>
  );
}

export function useVehicles() {
  const context = useContext(VehicleContext);
  if (context === undefined) {
    throw new Error('useVehicles must be used within a VehicleProvider');
  }
  return context;
}
