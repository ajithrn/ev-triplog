import { Vehicle, Trip } from '@/types';
import { ImportResult } from '@/types/settings';

/**
 * Validate imported vehicle data
 */
export function validateVehicle(vehicle: any): vehicle is Vehicle {
  return (
    typeof vehicle === 'object' &&
    vehicle !== null &&
    typeof vehicle.id === 'string' &&
    typeof vehicle.name === 'string' &&
    typeof vehicle.make === 'string' &&
    typeof vehicle.model === 'string' &&
    typeof vehicle.year === 'number' &&
    typeof vehicle.batteryCapacity === 'number' &&
    typeof vehicle.chargingEfficiency === 'number' &&
    typeof vehicle.createdAt === 'number'
  );
}

/**
 * Validate imported trip data
 */
export function validateTrip(trip: any): trip is Trip {
  return (
    typeof trip === 'object' &&
    trip !== null &&
    typeof trip.id === 'string' &&
    typeof trip.name === 'string' &&
    typeof trip.vehicleId === 'string' &&
    typeof trip.startDate === 'number' &&
    typeof trip.status === 'string' &&
    (trip.status === 'active' || trip.status === 'completed') &&
    Array.isArray(trip.stops) &&
    typeof trip.totalDistance === 'number' &&
    typeof trip.totalEnergyUsed === 'number' &&
    typeof trip.averageEfficiency === 'number'
  );
}

/**
 * Validate imported data structure
 */
export function validateImportData(data: any): ImportResult {
  const errors: string[] = [];
  
  // Check if data is an object
  if (typeof data !== 'object' || data === null) {
    return {
      success: false,
      message: 'Invalid data format. Expected a JSON object.',
      errors: ['Data must be a valid JSON object'],
    };
  }

  // Check if vehicles array exists
  if (!Array.isArray(data.vehicles)) {
    errors.push('Missing or invalid "vehicles" array');
  }

  // Check if trips array exists
  if (!Array.isArray(data.trips)) {
    errors.push('Missing or invalid "trips" array');
  }

  if (errors.length > 0) {
    return {
      success: false,
      message: 'Invalid data structure',
      errors,
    };
  }

  // Validate each vehicle
  const invalidVehicles: number[] = [];
  data.vehicles.forEach((vehicle: any, index: number) => {
    if (!validateVehicle(vehicle)) {
      invalidVehicles.push(index + 1);
    }
  });

  if (invalidVehicles.length > 0) {
    errors.push(`Invalid vehicle data at positions: ${invalidVehicles.join(', ')}`);
  }

  // Validate each trip
  const invalidTrips: number[] = [];
  data.trips.forEach((trip: any, index: number) => {
    if (!validateTrip(trip)) {
      invalidTrips.push(index + 1);
    }
  });

  if (invalidTrips.length > 0) {
    errors.push(`Invalid trip data at positions: ${invalidTrips.join(', ')}`);
  }

  if (errors.length > 0) {
    return {
      success: false,
      message: 'Data validation failed',
      errors,
    };
  }

  return {
    success: true,
    message: 'Data validation successful',
    vehiclesImported: data.vehicles.length,
    tripsImported: data.trips.length,
  };
}

/**
 * Parse and validate JSON file
 */
export async function parseAndValidateJSON(file: File): Promise<ImportResult> {
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    return validateImportData(data);
  } catch (error) {
    return {
      success: false,
      message: 'Failed to parse JSON file',
      errors: [error instanceof Error ? error.message : 'Unknown error'],
    };
  }
}
