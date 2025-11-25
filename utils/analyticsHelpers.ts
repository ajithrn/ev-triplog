import { Trip } from '@/types';
import { InsightData, TripStats, calculateTripStats, findEfficiencyExtremes, analyzeChargingPatterns, analyzeBatteryUsage } from './analyticsCalculations';
import { formatCurrency } from './formatters';

/**
 * Generate smart insights based on trip data
 */
export function generateInsights(trips: Trip[], settings: any): InsightData[] {
  const insights: InsightData[] = [];
  const stats = calculateTripStats(trips);
  
  if (trips.length === 0) {
    return insights;
  }

  const completedTrips = trips.filter(t => t.status === 'completed');
  
  // Most efficient trip
  const { mostEfficient } = findEfficiencyExtremes(trips);
  if (mostEfficient) {
    insights.push({
      type: 'success',
      title: 'Best Performance',
      description: `"${mostEfficient.name}" achieved ${mostEfficient.efficiencyKmPerKwh.toFixed(2)} km/kWh - your most efficient trip!`,
      icon: '🏆',
    });
  }

  // Total savings vs ICE
  const iceSavings = calculateICESavings(stats.totalDistance, stats.totalChargingCost);
  if (iceSavings.savings > 0) {
    insights.push({
      type: 'success',
      title: 'Money Saved',
      description: `You've saved ${formatCurrency(iceSavings.savings, settings)} compared to a petrol vehicle (${iceSavings.savingsPercent.toFixed(0)}% savings).`,
      icon: '💰',
    });
  }

  // Charging optimization
  const chargingPatterns = analyzeChargingPatterns(trips);
  if (chargingPatterns.length > 1) {
    const cheapest = chargingPatterns.reduce((min, p) => p.averageCost < min.averageCost ? p : min);
    const mostUsed = chargingPatterns[0];
    
    if (cheapest.location !== mostUsed.location && mostUsed.averageCost > cheapest.averageCost * 1.2) {
      const potentialSavings = (mostUsed.averageCost - cheapest.averageCost) * mostUsed.count;
      insights.push({
        type: 'info',
        title: 'Charging Tip',
        description: `Using "${cheapest.location}" more often could save you ${formatCurrency(potentialSavings, settings)} based on your patterns.`,
        icon: '⚡',
      });
    }
  }

  // Battery health insight
  const batteryUsage = analyzeBatteryUsage(trips);
  if (batteryUsage.lowestEndPercent < 15) {
    insights.push({
      type: 'warning',
      title: 'Battery Alert',
      description: `Your lowest battery level was ${batteryUsage.lowestEndPercent.toFixed(0)}%. Plan charging stops to avoid range anxiety.`,
      icon: '🔋',
    });
  } else if (batteryUsage.averageBuffer >= 30) {
    insights.push({
      type: 'info',
      title: 'Battery Health',
      description: `You maintain a healthy ${batteryUsage.averageBuffer.toFixed(0)}% average battery buffer - great for battery longevity!`,
      icon: '🔋',
    });
  }

  // Average efficiency
  const avgEfficiency = stats.totalDistance > 0 ? stats.totalDistance / stats.totalEnergyUsed : 0;
  if (avgEfficiency > 0) {
    const rating = getEfficiencyRating(avgEfficiency);
    insights.push({
      type: rating.rating === 'Excellent' || rating.rating === 'Good' ? 'success' : 'info',
      title: 'Overall Efficiency',
      description: `Your average efficiency is ${avgEfficiency.toFixed(2)} km/kWh - ${rating.description.toLowerCase()}.`,
      icon: '📊',
    });
  }

  // Trip frequency
  if (completedTrips.length >= 5) {
    const avgDistance = stats.totalDistance / stats.totalTrips;
    insights.push({
      type: 'info',
      title: 'Usage Pattern',
      description: `You've completed ${stats.totalTrips} trips averaging ${avgDistance.toFixed(0)} km each. Total distance: ${stats.totalDistance.toFixed(0)} km.`,
      icon: '🚗',
    });
  }

  return insights.slice(0, 4); // Return top 4 insights
}

/**
 * Get trend indicator
 */
export function getTrendIndicator(value: number): {
  icon: string;
  color: string;
  text: string;
} {
  if (value > 0) {
    return {
      icon: '↑',
      color: 'text-success',
      text: `+${value.toFixed(1)}%`,
    };
  } else if (value < 0) {
    return {
      icon: '↓',
      color: 'text-error',
      text: `${value.toFixed(1)}%`,
    };
  } else {
    return {
      icon: '→',
      color: 'text-base-content/70',
      text: '0%',
    };
  }
}

/**
 * Get efficiency rating
 */
export function getEfficiencyRating(kmPerKwh: number): {
  rating: string;
  color: string;
  description: string;
} {
  if (kmPerKwh >= 7.3) {
    return {
      rating: 'Excellent',
      color: 'text-success',
      description: 'Outstanding efficiency!',
    };
  } else if (kmPerKwh >= 6.0) {
    return {
      rating: 'Good',
      color: 'text-success',
      description: 'Above average efficiency',
    };
  } else if (kmPerKwh >= 4.8) {
    return {
      rating: 'Average',
      color: 'text-warning',
      description: 'Typical efficiency',
    };
  } else if (kmPerKwh >= 3.8) {
    return {
      rating: 'Below Average',
      color: 'text-error',
      description: 'Room for improvement',
    };
  } else {
    return {
      rating: 'Poor',
      color: 'text-error',
      description: 'Needs attention',
    };
  }
}

/**
 * Format time of day
 */
export function formatTimeOfDay(hour: number): string {
  if (hour < 6) return 'Night';
  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Afternoon';
  if (hour < 21) return 'Evening';
  return 'Night';
}

/**
 * Get day of week name
 */
export function getDayOfWeek(date: Date): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
}

/**
 * Calculate savings vs ICE vehicle
 */
export function calculateICESavings(
  totalDistance: number,
  totalChargingCost: number,
  fuelPricePerLiter: number = 100, // Default ₹100/liter
  fuelEfficiency: number = 15 // Default 15 km/liter
): {
  evCost: number;
  iceCost: number;
  savings: number;
  savingsPercent: number;
} {
  const evCost = totalChargingCost;
  const litersNeeded = totalDistance / fuelEfficiency;
  const iceCost = litersNeeded * fuelPricePerLiter;
  const savings = iceCost - evCost;
  const savingsPercent = iceCost > 0 ? (savings / iceCost) * 100 : 0;

  return {
    evCost,
    iceCost,
    savings,
    savingsPercent,
  };
}

/**
 * Get performance score (0-100)
 */
export function calculatePerformanceScore(stats: TripStats): number {
  if (stats.totalTrips === 0) return 0;

  // Calculate efficiency score (0-40 points)
  const avgEfficiency = stats.totalDistance > 0 ? stats.totalDistance / stats.totalEnergyUsed : 0;
  const efficiencyScore = Math.min((avgEfficiency / 7) * 40, 40); // 7 km/kWh = max score

  // Calculate cost efficiency score (0-30 points)
  const costPerKm = stats.totalDistance > 0 ? stats.totalChargingCost / stats.totalDistance : 0;
  const costScore = Math.max(30 - (costPerKm * 100), 0); // Lower cost = higher score

  // Calculate consistency score (0-30 points)
  // This is a simplified version - in reality you'd calculate variance
  const consistencyScore = 25; // Placeholder

  return Math.round(efficiencyScore + costScore + consistencyScore);
}

/**
 * Get date range presets
 */
export function getDateRangePresets(): Array<{
  label: string;
  start: Date;
  end: Date;
}> {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return [
    {
      label: 'Last 7 Days',
      start: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
      end: now,
    },
    {
      label: 'Last 14 Days',
      start: new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000),
      end: now,
    },
    {
      label: 'Last 30 Days',
      start: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
      end: now,
    },
    {
      label: 'Last 3 Months',
      start: new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000),
      end: now,
    },
    {
      label: 'Last 6 Months',
      start: new Date(today.getTime() - 180 * 24 * 60 * 60 * 1000),
      end: now,
    },
    {
      label: 'Last Year',
      start: new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000),
      end: now,
    },
    {
      label: 'All Time',
      start: new Date(2020, 0, 1), // Arbitrary old date
      end: now,
    },
  ];
}
