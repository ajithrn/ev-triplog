// Import stores for initialization
import { useVehicleStore } from './vehicleStore';
import { useTripStore } from './tripStore';
import { useSettingsStore } from './settingsStore';

// Export all stores
export { useVehicleStore } from './vehicleStore';
export { useTripStore } from './tripStore';
export { useSettingsStore } from './settingsStore';
export { useAnalyticsStore } from './analyticsStore';

// Export vehicle selectors
export {
  selectVehicles,
  selectSelectedVehicle,
  selectVehicleById,
  selectIsLoading as selectVehiclesLoading,
  selectError as selectVehiclesError,
} from './vehicleStore';

// Export trip selectors
export {
  selectTrips,
  selectActiveTrip,
  selectTripById,
  selectTripsByVehicle,
  selectCompletedTrips,
  selectIsLoading as selectTripsLoading,
  selectError as selectTripsError,
} from './tripStore';

// Export settings selectors
export {
  selectTheme,
  selectCurrency,
  selectDistanceUnit,
  selectDateFormat,
  selectTimeFormat,
  selectSettings,
  selectIsLoading as selectSettingsLoading,
  selectError as selectSettingsError,
} from './settingsStore';

// Export analytics selectors
export {
  selectDateRange,
  selectStartDate,
  selectEndDate,
  selectIsLoading as selectAnalyticsLoading,
  selectError as selectAnalyticsError,
  isWithinDateRange,
} from './analyticsStore';

// Initialize all stores (call this on app startup)
export const initializeStores = () => {
  const vehicleStore = useVehicleStore.getState();
  const tripStore = useTripStore.getState();
  const settingsStore = useSettingsStore.getState();
  
  // Load data from storage
  vehicleStore.loadVehicles();
  tripStore.loadTrips();
  settingsStore.loadSettings();
};
