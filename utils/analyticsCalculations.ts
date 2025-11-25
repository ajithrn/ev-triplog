import { Trip, Stop, ChargingSession } from '@/types';
import { format, startOfWeek, startOfMonth, isWithinInterval } from 'date-fns';

export interface TripStats {
  totalTrips: number;
  totalDistance: number;
  totalEnergyUsed: number;
  averageEfficiency: number;
  totalChargingCost: number;
  totalChargingSessions: number;
  totalEnergyCharged: number;
}

export interface TripWithEfficiency extends Trip {
  efficiencyKmPerKwh: number;
  costPerKm: number;
}

export interface InsightData {
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  description: string;
  icon: string;
}

export interface ChargingPattern {
  location: string;
  count: number;
  totalCost: number;
  averageCost: number;
  totalEnergy: number;
}

export interface DrivingPattern {
  hour: number;
  count: number;
  averageDistance: number;
}

/**
 * Filter trips by date range
 */
export function filterTripsByDateRange(
  trips: Trip[],
  startDate: number | Date,
  endDate: number | Date
): Trip[] {
  const start = typeof startDate === 'number' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'number' ? new Date(endDate) : endDate;
  
  return trips.filter((trip) =>
    isWithinInterval(new Date(trip.startDate), {
      start,
      end,
    })
  );
}

/**
 * Calculate comprehensive trip statistics
 */
export function calculateTripStats(trips: Trip[]): TripStats {
  const completedTrips = trips.filter((t) => t.status === 'completed');

  const totalTrips = completedTrips.length;
  const totalDistance = completedTrips.reduce((sum, t) => sum + t.totalDistance, 0);
  const totalEnergyUsed = completedTrips.reduce((sum, t) => sum + t.totalEnergyUsed, 0);
  const avgEfficiency = totalDistance > 0 ? totalEnergyUsed / totalDistance : 0;

  let totalChargingCost = 0;
  let totalChargingSessions = 0;
  let totalEnergyCharged = 0;

  completedTrips.forEach((trip) => {
    trip.stops.forEach((stop) => {
      if (stop.chargingSession) {
        totalChargingCost += stop.chargingSession.cost;
        totalChargingSessions++;
        totalEnergyCharged += stop.chargingSession.endKwh - stop.chargingSession.startKwh;
      }
    });
  });

  return {
    totalTrips,
    totalDistance,
    totalEnergyUsed,
    averageEfficiency: avgEfficiency,
    totalChargingCost,
    totalChargingSessions,
    totalEnergyCharged,
  };
}

/**
 * Find most and least efficient trips
 */
export function findEfficiencyExtremes(trips: Trip[]): {
  mostEfficient: TripWithEfficiency | null;
  leastEfficient: TripWithEfficiency | null;
} {
  const completedTrips = trips.filter(
    (t) => t.status === 'completed' && t.totalDistance > 0 && t.totalEnergyUsed > 0
  );

  if (completedTrips.length === 0) {
    return { mostEfficient: null, leastEfficient: null };
  }

  const tripsWithEfficiency: TripWithEfficiency[] = completedTrips.map((trip) => {
    const efficiencyKmPerKwh = trip.totalEnergyUsed > 0 ? trip.totalDistance / trip.totalEnergyUsed : 0;
    const totalCost = trip.stops.reduce(
      (sum, stop) => sum + (stop.chargingSession?.cost || 0),
      0
    );
    const costPerKm = trip.totalDistance > 0 ? totalCost / trip.totalDistance : 0;

    return {
      ...trip,
      efficiencyKmPerKwh,
      costPerKm,
    };
  });

  const sortedByEfficiency = [...tripsWithEfficiency].sort(
    (a, b) => b.efficiencyKmPerKwh - a.efficiencyKmPerKwh
  );

  return {
    mostEfficient: sortedByEfficiency[0],
    leastEfficient: sortedByEfficiency[sortedByEfficiency.length - 1],
  };
}

/**
 * Get top N trips by various criteria
 */
export function getTopTrips(
  trips: Trip[],
  criteria: 'efficiency' | 'distance' | 'cost',
  limit: number = 5
): TripWithEfficiency[] {
  const completedTrips = trips.filter(
    (t) => t.status === 'completed' && t.totalDistance > 0
  );

  const tripsWithMetrics: TripWithEfficiency[] = completedTrips.map((trip) => {
    const efficiencyKmPerKwh = trip.totalEnergyUsed > 0 ? trip.totalDistance / trip.totalEnergyUsed : 0;
    const totalCost = trip.stops.reduce(
      (sum, stop) => sum + (stop.chargingSession?.cost || 0),
      0
    );
    const costPerKm = trip.totalDistance > 0 ? totalCost / trip.totalDistance : 0;

    return {
      ...trip,
      efficiencyKmPerKwh,
      costPerKm,
    };
  });

  let sorted: TripWithEfficiency[];
  switch (criteria) {
    case 'efficiency':
      sorted = tripsWithMetrics.sort((a, b) => b.efficiencyKmPerKwh - a.efficiencyKmPerKwh);
      break;
    case 'distance':
      sorted = tripsWithMetrics.sort((a, b) => b.totalDistance - a.totalDistance);
      break;
    case 'cost':
      sorted = tripsWithMetrics.sort((a, b) => a.costPerKm - b.costPerKm);
      break;
  }

  return sorted.slice(0, limit);
}

/**
 * Analyze charging patterns
 */
export function analyzeChargingPatterns(trips: Trip[]): ChargingPattern[] {
  const patterns = new Map<string, ChargingPattern>();

  trips.forEach((trip) => {
    trip.stops.forEach((stop) => {
      if (stop.chargingSession) {
        // Normalize location: trim spaces and convert to lowercase for comparison
        const rawLocation = stop.chargingSession.location || stop.location || 'Unknown';
        const normalizedKey = rawLocation.trim().toLowerCase();
        // Keep original casing for display (use first occurrence)
        const displayLocation = rawLocation.trim();
        const energy = stop.chargingSession.endKwh - stop.chargingSession.startKwh;

        if (patterns.has(normalizedKey)) {
          const pattern = patterns.get(normalizedKey)!;
          pattern.count++;
          pattern.totalCost += stop.chargingSession.cost;
          pattern.totalEnergy += energy;
          pattern.averageCost = pattern.totalCost / pattern.count;
        } else {
          patterns.set(normalizedKey, {
            location: displayLocation,
            count: 1,
            totalCost: stop.chargingSession.cost,
            averageCost: stop.chargingSession.cost,
            totalEnergy: energy,
          });
        }
      }
    });
  });

  return Array.from(patterns.values()).sort((a, b) => b.count - a.count);
}

/**
 * Analyze driving patterns by time of day
 */
export function analyzeDrivingPatterns(trips: Trip[]): DrivingPattern[] {
  const patterns = new Map<number, { count: number; totalDistance: number }>();

  trips.forEach((trip) => {
    if (trip.status === 'completed') {
      const hour = new Date(trip.startDate).getHours();
      
      if (patterns.has(hour)) {
        const pattern = patterns.get(hour)!;
        pattern.count++;
        pattern.totalDistance += trip.totalDistance;
      } else {
        patterns.set(hour, {
          count: 1,
          totalDistance: trip.totalDistance,
        });
      }
    }
  });

  return Array.from(patterns.entries())
    .map(([hour, data]) => ({
      hour,
      count: data.count,
      averageDistance: data.totalDistance / data.count,
    }))
    .sort((a, b) => a.hour - b.hour);
}

/**
 * Calculate cost per kilometer trend using stretches
 */
export function calculateCostPerKmTrend(trips: Trip[]): Array<{
  date: string;
  costPerKm: number;
  distance: number;
  fromLocation: string;
  toLocation: string;
  energyUsed: number;
  estimatedCost: number;
}> {
  const completedTrips = trips
    .filter((t) => t.status === 'completed' && t.stops.length >= 2)
    .sort((a, b) => a.startDate - b.startDate);

  const stretchData: Array<{
    date: string;
    costPerKm: number;
    distance: number;
    fromLocation: string;
    toLocation: string;
    energyUsed: number;
    estimatedCost: number;
  }> = [];

  // Track cost per kWh across ALL trips (persists between trips)
  let lastKnownCostPerKwh = 0;

  completedTrips.forEach((trip) => {
    // Process each stretch in the trip
    for (let i = 0; i < trip.stops.length - 1; i++) {
      const fromStop = trip.stops[i];
      const toStop = trip.stops[i + 1];

      // Update cost per kWh if this stop has charging
      if (fromStop.chargingSession) {
        const chargingEnergy = fromStop.chargingSession.endKwh - fromStop.chargingSession.startKwh;
        if (chargingEnergy > 0) {
          lastKnownCostPerKwh = fromStop.chargingSession.cost / chargingEnergy;
        }
      }

      // Calculate stretch metrics
      const startBatteryKwh = fromStop.chargingSession 
        ? fromStop.chargingSession.endKwh 
        : fromStop.batteryKwh;
      
      const distance = toStop.odometer - fromStop.odometer;
      const energyUsed = startBatteryKwh - toStop.batteryKwh;

      // Calculate estimated cost for this stretch
      // Use the last known cost per kWh (from this trip or previous trips)
      const estimatedCost = energyUsed * lastKnownCostPerKwh;
      const costPerKm = distance > 0 ? estimatedCost / distance : 0;

      if (distance > 0) {
        stretchData.push({
          date: format(new Date(toStop.timestamp), 'MMM dd HH:mm'),
          costPerKm,
          distance,
          fromLocation: fromStop.location || 'Unknown',
          toLocation: toStop.location || 'Unknown',
          energyUsed,
          estimatedCost,
        });
      }
    }
  });

  return stretchData;
}

/**
 * Calculate battery usage patterns
 */
export function analyzeBatteryUsage(trips: Trip[]): {
  averageStartPercent: number;
  averageEndPercent: number;
  averageBuffer: number;
  lowestEndPercent: number;
} {
  const completedTrips = trips.filter((t) => t.status === 'completed' && t.stops.length >= 2);

  if (completedTrips.length === 0) {
    return {
      averageStartPercent: 0,
      averageEndPercent: 0,
      averageBuffer: 0,
      lowestEndPercent: 0,
    };
  }

  let totalStartPercent = 0;
  let totalEndPercent = 0;
  let lowestEndPercent = 100;

  completedTrips.forEach((trip) => {
    const firstStop = trip.stops[0];
    const lastStop = trip.stops[trip.stops.length - 1];

    totalStartPercent += firstStop.batteryPercent;
    totalEndPercent += lastStop.batteryPercent;
    lowestEndPercent = Math.min(lowestEndPercent, lastStop.batteryPercent);
  });

  const averageStartPercent = totalStartPercent / completedTrips.length;
  const averageEndPercent = totalEndPercent / completedTrips.length;
  const averageBuffer = averageEndPercent;

  return {
    averageStartPercent,
    averageEndPercent,
    averageBuffer,
    lowestEndPercent,
  };
}

/**
 * Compare periods (month-over-month, etc.)
 */
export function comparePeriods(
  currentTrips: Trip[],
  previousTrips: Trip[]
): {
  distanceChange: number;
  efficiencyChange: number;
  costChange: number;
  tripsChange: number;
} {
  const currentStats = calculateTripStats(currentTrips);
  const previousStats = calculateTripStats(previousTrips);

  const distanceChange =
    previousStats.totalDistance > 0
      ? ((currentStats.totalDistance - previousStats.totalDistance) / previousStats.totalDistance) * 100
      : 0;

  const currentEfficiency =
    currentStats.totalDistance > 0 ? currentStats.totalDistance / currentStats.totalEnergyUsed : 0;
  const previousEfficiency =
    previousStats.totalDistance > 0 ? previousStats.totalDistance / previousStats.totalEnergyUsed : 0;
  const efficiencyChange =
    previousEfficiency > 0 ? ((currentEfficiency - previousEfficiency) / previousEfficiency) * 100 : 0;

  const costChange =
    previousStats.totalChargingCost > 0
      ? ((currentStats.totalChargingCost - previousStats.totalChargingCost) /
          previousStats.totalChargingCost) *
        100
      : 0;

  const tripsChange =
    previousStats.totalTrips > 0
      ? ((currentStats.totalTrips - previousStats.totalTrips) / previousStats.totalTrips) * 100
      : 0;

  return {
    distanceChange,
    efficiencyChange,
    costChange,
    tripsChange,
  };
}

/**
 * Aggregate trips by period (weekly, monthly)
 */
export function aggregateByPeriod(
  trips: Trip[],
  period: 'week' | 'month'
): Array<{
  period: string;
  trips: number;
  distance: number;
  energy: number;
  cost: number;
  efficiency: number;
}> {
  const aggregated = new Map<string, {
    trips: number;
    distance: number;
    energy: number;
    cost: number;
  }>();

  trips.forEach((trip) => {
    if (trip.status === 'completed') {
      const date = new Date(trip.startDate);
      const key = period === 'week' 
        ? format(startOfWeek(date), 'MMM dd, yyyy')
        : format(startOfMonth(date), 'MMM yyyy');

      const cost = trip.stops.reduce(
        (sum, stop) => sum + (stop.chargingSession?.cost || 0),
        0
      );

      if (aggregated.has(key)) {
        const data = aggregated.get(key)!;
        data.trips++;
        data.distance += trip.totalDistance;
        data.energy += trip.totalEnergyUsed;
        data.cost += cost;
      } else {
        aggregated.set(key, {
          trips: 1,
          distance: trip.totalDistance,
          energy: trip.totalEnergyUsed,
          cost,
        });
      }
    }
  });

  return Array.from(aggregated.entries()).map(([period, data]) => ({
    period,
    trips: data.trips,
    distance: data.distance,
    energy: data.energy,
    cost: data.cost,
    efficiency: data.energy > 0 ? data.distance / data.energy : 0,
  }));
}
