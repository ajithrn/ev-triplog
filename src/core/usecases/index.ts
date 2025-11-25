// Export all use cases
export { VehicleUseCases } from './vehicleUseCases';
export { TripUseCases } from './tripUseCases';
export { AnalyticsUseCases } from './analyticsUseCases';

// Create singleton instances (can be used directly or injected)
import { vehicleRepository, tripRepository } from '../../infrastructure/storage/storageRepository';
import { VehicleUseCases } from './vehicleUseCases';
import { TripUseCases } from './tripUseCases';
import { AnalyticsUseCases } from './analyticsUseCases';

export const vehicleUseCases = new VehicleUseCases(vehicleRepository);
export const tripUseCases = new TripUseCases(tripRepository);
export const analyticsUseCases = new AnalyticsUseCases();
