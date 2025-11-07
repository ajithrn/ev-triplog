import { Vehicle, Trip } from '@/types';

const STORAGE_KEYS = {
  VEHICLES: 'ev-triplog-vehicles',
  TRIPS: 'ev-triplog-trips',
} as const;

// Generic storage functions
function getFromStorage<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error reading from localStorage (${key}):`, error);
    return null;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving to localStorage (${key}):`, error);
  }
}

// Vehicle storage functions
export function getVehicles(): Vehicle[] {
  return getFromStorage<Vehicle[]>(STORAGE_KEYS.VEHICLES) || [];
}

export function saveVehicles(vehicles: Vehicle[]): void {
  saveToStorage(STORAGE_KEYS.VEHICLES, vehicles);
}

export function addVehicle(vehicle: Vehicle): void {
  const vehicles = getVehicles();
  vehicles.push(vehicle);
  saveVehicles(vehicles);
}

export function updateVehicle(id: string, updatedVehicle: Vehicle): void {
  const vehicles = getVehicles();
  const index = vehicles.findIndex(v => v.id === id);
  if (index !== -1) {
    vehicles[index] = updatedVehicle;
    saveVehicles(vehicles);
  }
}

export function deleteVehicle(id: string): void {
  const vehicles = getVehicles();
  const filtered = vehicles.filter(v => v.id !== id);
  saveVehicles(filtered);
}

export function getVehicleById(id: string): Vehicle | undefined {
  const vehicles = getVehicles();
  return vehicles.find(v => v.id === id);
}

// Trip storage functions
export function getTrips(): Trip[] {
  return getFromStorage<Trip[]>(STORAGE_KEYS.TRIPS) || [];
}

export function saveTrips(trips: Trip[]): void {
  saveToStorage(STORAGE_KEYS.TRIPS, trips);
}

export function addTrip(trip: Trip): void {
  const trips = getTrips();
  trips.push(trip);
  saveTrips(trips);
}

export function updateTrip(id: string, updatedTrip: Trip): void {
  const trips = getTrips();
  const index = trips.findIndex(t => t.id === id);
  if (index !== -1) {
    trips[index] = updatedTrip;
    saveTrips(trips);
  }
}

export function deleteTrip(id: string): void {
  const trips = getTrips();
  const filtered = trips.filter(t => t.id !== id);
  saveTrips(filtered);
}

export function getTripById(id: string): Trip | undefined {
  const trips = getTrips();
  return trips.find(t => t.id === id);
}

export function getActiveTrip(): Trip | undefined {
  const trips = getTrips();
  return trips.find(t => t.status === 'active');
}

export function getTripsByVehicle(vehicleId: string): Trip[] {
  const trips = getTrips();
  return trips.filter(t => t.vehicleId === vehicleId);
}

export function getCompletedTrips(): Trip[] {
  const trips = getTrips();
  return trips.filter(t => t.status === 'completed');
}

// Export all data
export function exportAllData(): { vehicles: Vehicle[]; trips: Trip[] } {
  return {
    vehicles: getVehicles(),
    trips: getTrips(),
  };
}

// Import all data
export function importAllData(data: { vehicles: Vehicle[]; trips: Trip[] }): void {
  saveVehicles(data.vehicles);
  saveTrips(data.trips);
}

// Clear all data
export function clearAllData(): void {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem(STORAGE_KEYS.VEHICLES);
  localStorage.removeItem(STORAGE_KEYS.TRIPS);
}
