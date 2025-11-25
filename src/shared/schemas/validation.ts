import { z } from 'zod';

// Vehicle Schemas
export const VehicleSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Vehicle name is required'),
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
  batteryCapacity: z.number().positive('Battery capacity must be positive'),
  chargingEfficiency: z.number().min(0).max(100, 'Charging efficiency must be between 0 and 100'),
  createdAt: z.number(),
});

export const VehicleInputSchema = VehicleSchema.omit({ id: true, createdAt: true });

// Charging Session Schemas
export const ChargingSessionSchema = z.object({
  startSoc: z.number().min(0).max(100),
  endSoc: z.number().min(0).max(100),
  startKwh: z.number().min(0),
  endKwh: z.number().min(0),
  cost: z.number().min(0),
  duration: z.number().min(0),
  chargerType: z.string().optional(),
  location: z.string().optional(),
}).refine(
  (data) => data.endSoc >= data.startSoc,
  { message: 'End SoC must be greater than or equal to start SoC', path: ['endSoc'] }
).refine(
  (data) => data.endKwh >= data.startKwh,
  { message: 'End kWh must be greater than or equal to start kWh', path: ['endKwh'] }
);

// Stop Schemas
export const StopSchema = z.object({
  id: z.string(),
  tripId: z.string(),
  timestamp: z.number(),
  odometer: z.number().min(0),
  batteryPercent: z.number().min(0).max(100),
  batteryKwh: z.number().min(0),
  location: z.string().optional(),
  notes: z.string().optional(),
  chargingSession: ChargingSessionSchema.optional(),
});

export const StopInputSchema = StopSchema.omit({ id: true, tripId: true });

// Trip Schemas
export const TripSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Trip name is required'),
  vehicleId: z.string(),
  startDate: z.number(),
  endDate: z.number().optional(),
  status: z.enum(['active', 'completed']),
  stops: z.array(StopSchema),
  totalDistance: z.number().min(0),
  totalEnergyUsed: z.number().min(0),
  totalEnergyCharged: z.number().min(0).optional(),
  averageEfficiency: z.number().min(0),
});

export const TripInputSchema = z.object({
  name: z.string().min(1, 'Trip name is required'),
  vehicleId: z.string(),
  initialStop: StopInputSchema,
});

// Settings Schemas
export const SettingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
  currency: z.string().default('₹'),
  distanceUnit: z.enum(['km', 'miles']).default('km'),
  dateFormat: z.enum(['dd/MM/yyyy', 'MM/dd/yyyy', 'yyyy-MM-dd', 'MMMM d, yyyy', 'MMM d, yyyy', 'd MMM yyyy']).default('dd/MM/yyyy'),
  timeFormat: z.enum(['12h', '24h']).default('24h'),
  defaultVehicleId: z.string().optional(),
  lastBackupDate: z.number().optional(),
});

// Analytics Schemas
export const DateRangeSchema = z.object({
  start: z.number(),
  end: z.number(),
  label: z.string().optional(),
}).refine(
  (data) => data.end >= data.start,
  { message: 'End date must be after start date', path: ['end'] }
);

// Export inferred types
export type Vehicle = z.infer<typeof VehicleSchema>;
export type VehicleInput = z.infer<typeof VehicleInputSchema>;
export type ChargingSession = z.infer<typeof ChargingSessionSchema>;
export type Stop = z.infer<typeof StopSchema>;
export type StopInput = z.infer<typeof StopInputSchema>;
export type Trip = z.infer<typeof TripSchema>;
export type TripInput = z.infer<typeof TripInputSchema>;
export type Settings = z.infer<typeof SettingsSchema>;
export type DateRange = z.infer<typeof DateRangeSchema>;

// Validation helper functions
export function validateVehicle(data: unknown): Vehicle {
  return VehicleSchema.parse(data);
}

export function validateVehicleInput(data: unknown): VehicleInput {
  return VehicleInputSchema.parse(data);
}

export function validateTrip(data: unknown): Trip {
  return TripSchema.parse(data);
}

export function validateTripInput(data: unknown): TripInput {
  return TripInputSchema.parse(data);
}

export function validateStop(data: unknown): Stop {
  return StopSchema.parse(data);
}

export function validateStopInput(data: unknown): StopInput {
  return StopInputSchema.parse(data);
}

export function validateChargingSession(data: unknown): ChargingSession {
  return ChargingSessionSchema.parse(data);
}

export function validateSettings(data: unknown): Settings {
  return SettingsSchema.parse(data);
}

export function validateDateRange(data: unknown): DateRange {
  return DateRangeSchema.parse(data);
}

// Safe parse functions (returns result object instead of throwing)
export function safeValidateVehicle(data: unknown) {
  return VehicleSchema.safeParse(data);
}

export function safeValidateTrip(data: unknown) {
  return TripSchema.safeParse(data);
}

export function safeValidateStop(data: unknown) {
  return StopSchema.safeParse(data);
}
