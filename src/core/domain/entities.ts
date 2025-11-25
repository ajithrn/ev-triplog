// Import and re-export types from validation schemas
import type {
  Vehicle,
  VehicleInput,
  ChargingSession,
  Stop,
  StopInput,
  Trip,
  TripInput,
  Settings,
  DateRange,
} from '../../shared/schemas/validation';

export type {
  Vehicle,
  VehicleInput,
  ChargingSession,
  Stop,
  StopInput,
  Trip,
  TripInput,
  Settings,
  DateRange,
};

// Additional domain types that don't need validation

export interface Stretch {
  fromStop: Stop;
  toStop: Stop;
  distance: number;
  energyUsed: number;
  batteryPercentUsed: number;
  efficiencyKwhPerKm: number;
  efficiencyKmPerKwh: number;
  kmPerPercent: number;
  estimatedCost: number;
  costPerKm: number;
}

export interface TripMetrics {
  totalDistance: number;
  totalEnergyUsed: number;
  totalEnergyCharged?: number;
  averageEfficiency: number;
}

export interface TripStats {
  totalTrips: number;
  totalDistance: number;
  totalEnergyUsed: number;
  averageEfficiency: number;
  totalChargingCost: number;
  totalChargingSessions: number;
}

export interface EfficiencyDataPoint {
  date: string;
  efficiency: number;
  distance: number;
}

export interface ChargingCostDataPoint {
  date: string;
  cost: number;
  energyAdded: number;
}

export interface ChargingPattern {
  location: string;
  sessions: number;
  totalCost: number;
  totalEnergy: number;
  avgCostPerKwh: number;
}

export interface DrivingPattern {
  timeOfDay: string;
  trips: number;
  totalDistance: number;
  avgEfficiency: number;
}

export interface EfficiencyRating {
  rating: string;
  color: string;
  description: string;
}

export interface InsightData {
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  description: string;
  icon?: string;
}

export interface ICESavings {
  savings: number;
  savingsPercent: number;
  evCost: number;
  iceCost: number;
}

// Import/Export types
export interface ImportResult {
  success: boolean;
  vehicles?: Vehicle[];
  trips?: Trip[];
  errors?: string[];
}

export interface MergeResult {
  vehiclesAdded: number;
  vehiclesUpdated: number;
  tripsAdded: number;
  tripsUpdated: number;
}
