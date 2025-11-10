import { Stop, Stretch, Trip, ChargingSession } from '@/types';

/**
 * Calculate efficiency metrics between two stops
 */
export function calculateStretch(fromStop: Stop, toStop: Stop): Stretch {
  const distance = toStop.odometer - fromStop.odometer;
  
  // If fromStop has a charging session, use the battery level AFTER charging
  const startBatteryKwh = fromStop.chargingSession 
    ? fromStop.chargingSession.endKwh 
    : fromStop.batteryKwh;
  const startBatteryPercent = fromStop.chargingSession 
    ? fromStop.chargingSession.endSoc 
    : fromStop.batteryPercent;
  
  const energyUsed = startBatteryKwh - toStop.batteryKwh;
  const batteryPercentUsed = startBatteryPercent - toStop.batteryPercent;

  return {
    fromStop,
    toStop,
    distance,
    energyUsed,
    batteryPercentUsed,
    efficiencyKwhPerKm: distance > 0 ? energyUsed / distance : 0,
    efficiencyKmPerKwh: energyUsed > 0 ? distance / energyUsed : 0,
    kmPerPercent: batteryPercentUsed > 0 ? distance / batteryPercentUsed : 0,
  };
}

/**
 * Calculate all stretches for a trip
 */
export function calculateTripStretches(stops: Stop[]): Stretch[] {
  const stretches: Stretch[] = [];
  
  for (let i = 0; i < stops.length - 1; i++) {
    stretches.push(calculateStretch(stops[i], stops[i + 1]));
  }
  
  return stretches;
}

/**
 * Calculate trip totals and averages
 */
export function calculateTripMetrics(trip: Trip): {
  totalDistance: number;
  totalEnergyUsed: number;
  totalEnergyCharged: number;
  averageEfficiency: number;
} {
  if (trip.stops.length < 2) {
    return {
      totalDistance: 0,
      totalEnergyUsed: 0,
      totalEnergyCharged: 0,
      averageEfficiency: 0,
    };
  }

  // Calculate by summing all stretches (which accounts for charging sessions)
  const stretches = calculateTripStretches(trip.stops);
  
  const totalDistance = stretches.reduce((sum, stretch) => sum + stretch.distance, 0);
  const energyConsumed = stretches.reduce((sum, stretch) => sum + stretch.energyUsed, 0);
  
  // Calculate energy from all charging sessions
  const energyCharged = trip.stops.reduce((sum, stop) => {
    if (stop.chargingSession) {
      return sum + calculateChargingEnergy(stop.chargingSession);
    }
    return sum;
  }, 0);
  
  // Total energy used is just the energy consumed while driving
  // Charging sessions add energy back to the battery, they don't add to consumption
  const totalEnergyUsed = energyConsumed;
  const averageEfficiency = totalDistance > 0 ? energyConsumed / totalDistance : 0;

  return {
    totalDistance,
    totalEnergyUsed,
    totalEnergyCharged: energyCharged,
    averageEfficiency,
  };
}

/**
 * Calculate energy added during charging session
 */
export function calculateChargingEnergy(session: ChargingSession): number {
  return session.endKwh - session.startKwh;
}

/**
 * Calculate cost per kWh for charging session
 */
export function calculateCostPerKwh(session: ChargingSession): number {
  const energyAdded = calculateChargingEnergy(session);
  return energyAdded > 0 ? session.cost / energyAdded : 0;
}

/**
 * Format efficiency for display
 */
export function formatEfficiency(kwhPerKm: number, kmPerKwh: number): string {
  return `${kwhPerKm.toFixed(2)} kWh/km (${kmPerKwh.toFixed(2)} km/kWh)`;
}

/**
 * Format distance
 */
export function formatDistance(km: number): string {
  return `${km.toFixed(1)} km`;
}

/**
 * Format energy
 */
export function formatEnergy(kwh: number): string {
  return `${kwh.toFixed(2)} kWh`;
}

/**
 * Format battery percentage
 */
export function formatBatteryPercent(percent: number): string {
  return `${percent.toFixed(1)}%`;
}

/**
 * Format cost
 */
export function formatCost(cost: number, currency: string = '₹'): string {
  return `${currency}${cost.toFixed(2)}`;
}

/**
 * Format duration in minutes to human readable
 */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
}

/**
 * Generate unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
