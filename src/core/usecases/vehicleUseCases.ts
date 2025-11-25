import type { Vehicle, VehicleInput } from '../domain/entities';
import type { IVehicleRepository } from '../domain/interfaces';
import { validateVehicle, validateVehicleInput } from '../../shared/schemas/validation';

/**
 * Vehicle Use Cases
 * Pure business logic for vehicle operations
 */
export class VehicleUseCases {
  constructor(private repository: IVehicleRepository) {}

  /**
   * Create a new vehicle
   */
  createVehicle(data: VehicleInput, generateId: () => string): Vehicle {
    // Validate input
    const validatedInput = validateVehicleInput(data);

    // Create vehicle entity
    const vehicle: Vehicle = {
      ...validatedInput,
      id: generateId(),
      createdAt: Date.now(),
    };

    // Validate complete vehicle
    const validatedVehicle = validateVehicle(vehicle);

    // Persist
    this.repository.add(validatedVehicle);

    return validatedVehicle;
  }

  /**
   * Update an existing vehicle
   */
  updateVehicle(id: string, data: Partial<VehicleInput>): Vehicle {
    const existingVehicle = this.repository.getById(id);
    
    if (!existingVehicle) {
      throw new Error(`Vehicle with id ${id} not found`);
    }

    // Merge with existing data
    const updatedVehicle: Vehicle = {
      ...existingVehicle,
      ...data,
    };

    // Validate
    const validatedVehicle = validateVehicle(updatedVehicle);

    // Persist
    this.repository.update(id, validatedVehicle);

    return validatedVehicle;
  }

  /**
   * Delete a vehicle
   */
  deleteVehicle(id: string): void {
    const vehicle = this.repository.getById(id);
    
    if (!vehicle) {
      throw new Error(`Vehicle with id ${id} not found`);
    }

    this.repository.delete(id);
  }

  /**
   * Get vehicle by ID
   */
  getVehicleById(id: string): Vehicle | undefined {
    return this.repository.getById(id);
  }

  /**
   * Get all vehicles
   */
  getAllVehicles(): Vehicle[] {
    return this.repository.getAll();
  }

  /**
   * Check if vehicle name is unique
   */
  isVehicleNameUnique(name: string, excludeId?: string): boolean {
    const vehicles = this.repository.getAll();
    return !vehicles.some(v => 
      v.name.toLowerCase() === name.toLowerCase() && v.id !== excludeId
    );
  }

  /**
   * Get vehicle statistics
   */
  getVehicleStats(id: string): {
    totalTrips: number;
    totalDistance: number;
    totalEnergyUsed: number;
    averageEfficiency: number;
  } | null {
    const vehicle = this.repository.getById(id);
    
    if (!vehicle) {
      return null;
    }

    // This would typically fetch trip data, but we'll return a placeholder
    // The actual implementation would use the trip repository
    return {
      totalTrips: 0,
      totalDistance: 0,
      totalEnergyUsed: 0,
      averageEfficiency: 0,
    };
  }

  /**
   * Validate vehicle data without persisting
   */
  validateVehicleData(data: VehicleInput): { valid: boolean; errors?: string[] } {
    try {
      validateVehicleInput(data);
      return { valid: true };
    } catch (error) {
      if (error instanceof Error) {
        return { valid: false, errors: [error.message] };
      }
      return { valid: false, errors: ['Unknown validation error'] };
    }
  }
}
