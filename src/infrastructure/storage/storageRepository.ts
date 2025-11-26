import type { Vehicle, Trip, Settings } from '../../core/domain/entities';
import type { IVehicleRepository, ITripRepository, IStorageRepository } from '../../core/domain/interfaces';
import { storageAdapter, STORAGE_KEYS } from './storageAdapter';
import { safeValidateVehicle, safeValidateTrip, validateSettings } from '../../shared/schemas/validation';

// Vehicle Repository Implementation
export class VehicleRepository implements IVehicleRepository {
  getAll(): Vehicle[] {
    const vehicles = storageAdapter.get<Vehicle[]>(STORAGE_KEYS.VEHICLES);
    if (!vehicles) return [];
    
    // Validate each vehicle
    return vehicles.filter(vehicle => {
      const result = safeValidateVehicle(vehicle);
      if (!result.success) {
        console.warn('Invalid vehicle data found:', result.error);
        return false;
      }
      return true;
    });
  }

  getById(id: string): Vehicle | undefined {
    const vehicles = this.getAll();
    return vehicles.find(v => v.id === id);
  }

  add(vehicle: Vehicle): void {
    const vehicles = this.getAll();
    vehicles.push(vehicle);
    storageAdapter.set(STORAGE_KEYS.VEHICLES, vehicles);
  }

  update(id: string, vehicle: Vehicle): void {
    const vehicles = this.getAll();
    const index = vehicles.findIndex(v => v.id === id);
    if (index !== -1) {
      vehicles[index] = vehicle;
      storageAdapter.set(STORAGE_KEYS.VEHICLES, vehicles);
    }
  }

  delete(id: string): void {
    const vehicles = this.getAll();
    const filtered = vehicles.filter(v => v.id !== id);
    storageAdapter.set(STORAGE_KEYS.VEHICLES, filtered);
  }
}

// Trip Repository Implementation
export class TripRepository implements ITripRepository {
  getAll(): Trip[] {
    const trips = storageAdapter.get<Trip[]>(STORAGE_KEYS.TRIPS);
    if (!trips) return [];
    
    // Validate each trip
    return trips.filter(trip => {
      const result = safeValidateTrip(trip);
      if (!result.success) {
        console.warn('Invalid trip data found:', result.error);
        return false;
      }
      return true;
    });
  }

  getById(id: string): Trip | undefined {
    const trips = this.getAll();
    return trips.find(t => t.id === id);
  }

  getByVehicleId(vehicleId: string): Trip[] {
    const trips = this.getAll();
    return trips.filter(t => t.vehicleId === vehicleId);
  }

  getActive(): Trip | undefined {
    const trips = this.getAll();
    return trips.find(t => t.status === 'active');
  }

  getCompleted(): Trip[] {
    const trips = this.getAll();
    return trips.filter(t => t.status === 'completed');
  }

  add(trip: Trip): void {
    const trips = this.getAll();
    trips.push(trip);
    storageAdapter.set(STORAGE_KEYS.TRIPS, trips);
  }

  update(id: string, trip: Trip): void {
    const trips = this.getAll();
    const index = trips.findIndex(t => t.id === id);
    if (index !== -1) {
      trips[index] = trip;
      storageAdapter.set(STORAGE_KEYS.TRIPS, trips);
    }
  }

  delete(id: string): void {
    const trips = this.getAll();
    const filtered = trips.filter(t => t.id !== id);
    storageAdapter.set(STORAGE_KEYS.TRIPS, filtered);
  }
}

// Settings Repository Implementation
export class SettingsRepository {
  get(): Settings | null {
    const settings = storageAdapter.get<Settings>(STORAGE_KEYS.SETTINGS);
    if (!settings) return null;
    
    try {
      return validateSettings(settings);
    } catch (error) {
      console.warn('Invalid settings data found:', error);
      return null;
    }
  }

  save(settings: Settings): void {
    storageAdapter.set(STORAGE_KEYS.SETTINGS, settings);
  }

  clear(): void {
    storageAdapter.remove(STORAGE_KEYS.SETTINGS);
  }
}

// Storage Repository Implementation
export class StorageRepository implements IStorageRepository {
  constructor(
    private vehicleRepo: IVehicleRepository,
    private tripRepo: ITripRepository
  ) {}

  exportAll(): { vehicles: Vehicle[]; trips: Trip[] } {
    return {
      vehicles: this.vehicleRepo.getAll(),
      trips: this.tripRepo.getAll(),
    };
  }

  importAll(data: { vehicles: Vehicle[]; trips: Trip[] }): void {
    storageAdapter.set(STORAGE_KEYS.VEHICLES, data.vehicles);
    storageAdapter.set(STORAGE_KEYS.TRIPS, data.trips);
  }

  mergeImport(data: { vehicles: Vehicle[]; trips: Trip[] }): {
    vehiclesAdded: number;
    vehiclesUpdated: number;
    tripsAdded: number;
    tripsUpdated: number;
  } {
    const existingVehicles = this.vehicleRepo.getAll();
    const existingTrips = this.tripRepo.getAll();
    
    let vehiclesAdded = 0;
    let vehiclesUpdated = 0;
    let tripsAdded = 0;
    let tripsUpdated = 0;
    
    // Merge vehicles
    const vehicleMap = new Map(existingVehicles.map(v => [v.id, v]));
    data.vehicles.forEach(vehicle => {
      if (vehicleMap.has(vehicle.id)) {
        vehicleMap.set(vehicle.id, vehicle);
        vehiclesUpdated++;
      } else {
        vehicleMap.set(vehicle.id, vehicle);
        vehiclesAdded++;
      }
    });
    
    // Merge trips
    const tripMap = new Map(existingTrips.map(t => [t.id, t]));
    data.trips.forEach(trip => {
      if (tripMap.has(trip.id)) {
        tripMap.set(trip.id, trip);
        tripsUpdated++;
      } else {
        tripMap.set(trip.id, trip);
        tripsAdded++;
      }
    });
    
    // Save merged data
    storageAdapter.set(STORAGE_KEYS.VEHICLES, Array.from(vehicleMap.values()));
    storageAdapter.set(STORAGE_KEYS.TRIPS, Array.from(tripMap.values()));
    
    return { vehiclesAdded, vehiclesUpdated, tripsAdded, tripsUpdated };
  }

  clearAll(): void {
    storageAdapter.clear();
  }
}

// Create singleton instances
export const vehicleRepository = new VehicleRepository();
export const tripRepository = new TripRepository();
export const settingsRepository = new SettingsRepository();
