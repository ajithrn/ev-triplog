// Vehicle Types
export interface Vehicle {
  id: string;
  name: string;
  make: string;
  model: string;
  year: number;
  batteryCapacity: number; // in kWh
  chargingEfficiency: number; // percentage (e.g., 88 means 88% efficient, 12% loss)
  createdAt: number;
}

// Charging Session Types
export interface ChargingSession {
  startSoc: number; // State of Charge in %
  endSoc: number; // State of Charge in %
  startKwh: number; // Battery kWh at start
  endKwh: number; // Battery kWh at end
  cost: number; // Cost in currency
  duration: number; // Duration in minutes
  chargerType?: string; // Optional charger type
  location?: string; // Optional location
}

// Stop Types
export interface Stop {
  id: string;
  tripId: string;
  timestamp: number;
  odometer: number; // in km
  batteryPercent: number; // Battery % remaining
  batteryKwh: number; // Battery kWh remaining
  location?: string;
  notes?: string;
  chargingSession?: ChargingSession;
}

// Trip Types
export interface Trip {
  id: string;
  name: string; // Trip name
  vehicleId: string;
  startDate: number;
  endDate?: number;
  status: 'active' | 'completed';
  stops: Stop[];
  totalDistance: number; // in km
  totalEnergyUsed: number; // in kWh (energy consumed while driving)
  totalEnergyCharged?: number; // in kWh (energy added at charging stations)
  averageEfficiency: number; // in kWh/km
}

// Stretch (between two stops) Types
export interface Stretch {
  fromStop: Stop;
  toStop: Stop;
  distance: number; // in km
  energyUsed: number; // in kWh
  batteryPercentUsed: number; // in %
  efficiencyKwhPerKm: number; // kWh/km
  efficiencyKmPerKwh: number; // km/kWh
  kmPerPercent: number; // km per %
}

// Form Types
export interface VehicleFormData {
  name: string;
  make: string;
  model: string;
  year: number;
  batteryCapacity: number;
}

export interface StopFormData {
  odometer: number;
  batteryPercent: number;
  batteryKwh: number;
  location?: string;
  notes?: string;
}

export interface ChargingFormData {
  startSoc: number;
  endSoc: number;
  cost: number;
  duration: number;
  chargerType?: string;
  location?: string;
}

// Analytics Types
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
