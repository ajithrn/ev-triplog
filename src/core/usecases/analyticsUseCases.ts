import type { Trip, TripStats, ChargingPattern, DrivingPattern, EfficiencyRating, InsightData, ICESavings } from '../domain/entities';

/**
 * Analytics Use Cases
 * Pure business logic for analytics calculations
 */
export class AnalyticsUseCases {
  /**
   * Calculate trip statistics for a given set of trips
   */
  calculateTripStats(trips: Trip[]): TripStats {
    const completedTrips = trips.filter(t => t.status === 'completed');

    if (completedTrips.length === 0) {
      return {
        totalTrips: 0,
        totalDistance: 0,
        totalEnergyUsed: 0,
        averageEfficiency: 0,
        totalChargingCost: 0,
        totalChargingSessions: 0,
      };
    }

    const totalDistance = completedTrips.reduce((sum, t) => sum + t.totalDistance, 0);
    const totalEnergyUsed = completedTrips.reduce((sum, t) => sum + t.totalEnergyUsed, 0);
    const totalChargingCost = completedTrips.reduce((sum, t) => {
      return sum + t.stops.reduce((stopSum, stop) => {
        return stopSum + (stop.chargingSession?.cost || 0);
      }, 0);
    }, 0);

    const totalChargingSessions = completedTrips.reduce((sum, t) => {
      return sum + t.stops.filter(s => s.chargingSession).length;
    }, 0);

    const averageEfficiency = totalDistance > 0 ? totalEnergyUsed / totalDistance : 0;

    return {
      totalTrips: completedTrips.length,
      totalDistance,
      totalEnergyUsed,
      averageEfficiency,
      totalChargingCost,
      totalChargingSessions,
    };
  }

  /**
   * Analyze charging patterns across trips
   */
  analyzeChargingPatterns(trips: Trip[]): ChargingPattern[] {
    const locationMap = new Map<string, {
      sessions: number;
      totalCost: number;
      totalEnergy: number;
    }>();

    trips.forEach(trip => {
      trip.stops.forEach(stop => {
        if (stop.chargingSession) {
          const location = stop.chargingSession.location || stop.location || 'Unknown';
          const existing = locationMap.get(location) || {
            sessions: 0,
            totalCost: 0,
            totalEnergy: 0,
          };

          const energy = stop.chargingSession.endKwh - stop.chargingSession.startKwh;

          locationMap.set(location, {
            sessions: existing.sessions + 1,
            totalCost: existing.totalCost + stop.chargingSession.cost,
            totalEnergy: existing.totalEnergy + energy,
          });
        }
      });
    });

    return Array.from(locationMap.entries())
      .map(([location, data]) => ({
        location,
        sessions: data.sessions,
        totalCost: data.totalCost,
        totalEnergy: data.totalEnergy,
        avgCostPerKwh: data.totalEnergy > 0 ? data.totalCost / data.totalEnergy : 0,
      }))
      .sort((a, b) => b.totalCost - a.totalCost);
  }

  /**
   * Analyze driving patterns (time of day, day of week)
   */
  analyzeDrivingPatterns(trips: Trip[]): DrivingPattern[] {
    const timeMap = new Map<string, {
      trips: number;
      totalDistance: number;
      totalEnergy: number;
    }>();

    trips.forEach(trip => {
      const date = new Date(trip.startDate);
      const hour = date.getHours();
      let timeOfDay: string;

      if (hour >= 5 && hour < 12) {
        timeOfDay = 'Morning (5AM-12PM)';
      } else if (hour >= 12 && hour < 17) {
        timeOfDay = 'Afternoon (12PM-5PM)';
      } else if (hour >= 17 && hour < 21) {
        timeOfDay = 'Evening (5PM-9PM)';
      } else {
        timeOfDay = 'Night (9PM-5AM)';
      }

      const existing = timeMap.get(timeOfDay) || {
        trips: 0,
        totalDistance: 0,
        totalEnergy: 0,
      };

      timeMap.set(timeOfDay, {
        trips: existing.trips + 1,
        totalDistance: existing.totalDistance + trip.totalDistance,
        totalEnergy: existing.totalEnergy + trip.totalEnergyUsed,
      });
    });

    return Array.from(timeMap.entries())
      .map(([timeOfDay, data]) => ({
        timeOfDay,
        trips: data.trips,
        totalDistance: data.totalDistance,
        avgEfficiency: data.totalDistance > 0 ? data.totalEnergy / data.totalDistance : 0,
      }))
      .sort((a, b) => b.trips - a.trips);
  }

  /**
   * Get efficiency rating based on km/kWh
   */
  getEfficiencyRating(kmPerKwh: number): EfficiencyRating {
    if (kmPerKwh >= 7) {
      return {
        rating: 'Excellent',
        color: 'text-success',
        description: 'Outstanding efficiency! You\'re maximizing your EV\'s potential.',
      };
    } else if (kmPerKwh >= 6) {
      return {
        rating: 'Very Good',
        color: 'text-success',
        description: 'Great efficiency! Your driving habits are very economical.',
      };
    } else if (kmPerKwh >= 5) {
      return {
        rating: 'Good',
        color: 'text-info',
        description: 'Good efficiency. Room for minor improvements.',
      };
    } else if (kmPerKwh >= 4) {
      return {
        rating: 'Average',
        color: 'text-warning',
        description: 'Average efficiency. Consider eco-driving techniques.',
      };
    } else if (kmPerKwh > 0) {
      return {
        rating: 'Below Average',
        color: 'text-error',
        description: 'Below average efficiency. Review driving habits and conditions.',
      };
    } else {
      return {
        rating: 'No Data',
        color: 'text-base-content',
        description: 'Not enough data to calculate efficiency.',
      };
    }
  }

  /**
   * Calculate savings compared to ICE vehicle
   */
  calculateICESavings(
    totalDistance: number,
    evCost: number,
    iceFuelPrice: number = 100, // per liter
    iceFuelEfficiency: number = 15 // km per liter
  ): ICESavings {
    if (totalDistance === 0) {
      return {
        savings: 0,
        savingsPercent: 0,
        evCost: 0,
        iceCost: 0,
      };
    }

    const litersNeeded = totalDistance / iceFuelEfficiency;
    const iceCost = litersNeeded * iceFuelPrice;
    const savings = iceCost - evCost;
    const savingsPercent = iceCost > 0 ? (savings / iceCost) * 100 : 0;

    return {
      savings: Math.max(0, savings),
      savingsPercent: Math.max(0, savingsPercent),
      evCost,
      iceCost,
    };
  }

  /**
   * Generate insights based on trip data
   */
  generateInsights(trips: Trip[]): InsightData[] {
    const insights: InsightData[] = [];
    const stats = this.calculateTripStats(trips);

    if (stats.totalTrips === 0) {
      return [{
        type: 'info',
        title: 'No trips yet',
        description: 'Start tracking your trips to see insights and analytics.',
      }];
    }

    // Efficiency insight
    const avgKmPerKwh = stats.averageEfficiency > 0 ? 1 / stats.averageEfficiency : 0;
    const rating = this.getEfficiencyRating(avgKmPerKwh);
    
    insights.push({
      type: avgKmPerKwh >= 5 ? 'success' : avgKmPerKwh >= 4 ? 'info' : 'warning',
      title: `${rating.rating} Efficiency`,
      description: `Your average efficiency is ${avgKmPerKwh.toFixed(2)} km/kWh. ${rating.description}`,
    });

    // Cost insight
    const costPerKm = stats.totalDistance > 0 ? stats.totalChargingCost / stats.totalDistance : 0;
    if (costPerKm > 0) {
      insights.push({
        type: 'info',
        title: 'Cost Efficiency',
        description: `Your average cost is ${costPerKm.toFixed(2)} per km. Total spent: ${stats.totalChargingCost.toFixed(2)}`,
      });
    }

    // Savings insight
    const savings = this.calculateICESavings(stats.totalDistance, stats.totalChargingCost);
    if (savings.savings > 0) {
      insights.push({
        type: 'success',
        title: 'Money Saved',
        description: `You've saved ${savings.savings.toFixed(2)} (${savings.savingsPercent.toFixed(0)}%) compared to a petrol vehicle!`,
      });
    }

    // Charging insight
    if (stats.totalChargingSessions > 0) {
      const avgCostPerSession = stats.totalChargingCost / stats.totalChargingSessions;
      insights.push({
        type: 'info',
        title: 'Charging Summary',
        description: `${stats.totalChargingSessions} charging sessions with an average cost of ${avgCostPerSession.toFixed(2)} per session.`,
      });
    }

    return insights;
  }

  /**
   * Filter trips by date range
   */
  filterTripsByDateRange(trips: Trip[], startDate: number, endDate: number): Trip[] {
    return trips.filter(trip => {
      return trip.startDate >= startDate && trip.startDate <= endDate;
    });
  }

  /**
   * Find efficiency extremes (best and worst trips)
   */
  findEfficiencyExtremes(trips: Trip[]): {
    best: Trip | null;
    worst: Trip | null;
  } {
    const completedTrips = trips.filter(t => t.status === 'completed' && t.averageEfficiency > 0);

    if (completedTrips.length === 0) {
      return { best: null, worst: null };
    }

    const sorted = [...completedTrips].sort((a, b) => a.averageEfficiency - b.averageEfficiency);

    return {
      best: sorted[0], // Lowest kWh/km = best efficiency
      worst: sorted[sorted.length - 1],
    };
  }

  /**
   * Calculate performance score (0-100)
   */
  calculatePerformanceScore(stats: TripStats): number {
    if (stats.totalTrips === 0) return 0;

    const avgKmPerKwh = stats.averageEfficiency > 0 ? 1 / stats.averageEfficiency : 0;
    
    // Score based on efficiency (0-100)
    // 7+ km/kWh = 100, 4 km/kWh = 50, 0 km/kWh = 0
    const efficiencyScore = Math.min(100, (avgKmPerKwh / 7) * 100);

    return Math.round(efficiencyScore);
  }
}
