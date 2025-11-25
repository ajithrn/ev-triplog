import type { Vehicle, Trip, Stop, ChargingSession } from './entities';

// Repository interfaces for data persistence
export interface IVehicleRepository {
  getAll(): Vehicle[];
  getById(id: string): Vehicle | undefined;
  add(vehicle: Vehicle): void;
  update(id: string, vehicle: Vehicle): void;
  delete(id: string): void;
}

export interface ITripRepository {
  getAll(): Trip[];
  getById(id: string): Trip | undefined;
  getByVehicleId(vehicleId: string): Trip[];
  getActive(): Trip | undefined;
  getCompleted(): Trip[];
  add(trip: Trip): void;
  update(id: string, trip: Trip): void;
  delete(id: string): void;
}

export interface IStorageRepository {
  exportAll(): { vehicles: Vehicle[]; trips: Trip[] };
  importAll(data: { vehicles: Vehicle[]; trips: Trip[] }): void;
  mergeImport(data: { vehicles: Vehicle[]; trips: Trip[] }): {
    vehiclesAdded: number;
    vehiclesUpdated: number;
    tripsAdded: number;
    tripsUpdated: number;
  };
  clearAll(): void;
}

// Use case interfaces
export interface IVehicleUseCases {
  createVehicle(data: Omit<Vehicle, 'id' | 'createdAt'>): Vehicle;
  updateVehicle(id: string, data: Partial<Omit<Vehicle, 'id' | 'createdAt'>>): Vehicle;
  deleteVehicle(id: string): void;
  getVehicleById(id: string): Vehicle | undefined;
  getAllVehicles(): Vehicle[];
}

export interface ITripUseCases {
  createTrip(name: string, vehicleId: string, initialStop: Omit<Stop, 'id' | 'tripId'>): Trip;
  addStop(tripId: string, stop: Omit<Stop, 'id' | 'tripId'>): Trip;
  updateStop(tripId: string, stopId: string, stop: Omit<Stop, 'id' | 'tripId'>): Trip;
  deleteStop(tripId: string, stopId: string): Trip;
  addChargingSession(tripId: string, stopId: string, session: ChargingSession): Trip;
  updateChargingSession(tripId: string, stopId: string, session: ChargingSession): Trip;
  deleteChargingSession(tripId: string, stopId: string): Trip;
  completeTrip(tripId: string): Trip;
  reopenTrip(tripId: string): Trip;
  deleteTrip(tripId: string): void;
  getTripById(id: string): Trip | undefined;
  getAllTrips(): Trip[];
  getActiveTrip(): Trip | undefined;
}
