import type { Trip, Stop, ChargingSession, StopInput, TripMetrics } from '../domain/entities';
import type { ITripRepository } from '../domain/interfaces';
import { validateTrip, validateStop, validateChargingSession } from '../../shared/schemas/validation';

/**
 * Trip Use Cases
 * Pure business logic for trip operations
 */
export class TripUseCases {
  constructor(private repository: ITripRepository) {}

  /**
   * Create a new trip
   */
  createTrip(
    name: string,
    vehicleId: string,
    initialStop: StopInput,
    generateId: () => string
  ): Trip {
    // Validate trip name
    if (!name || name.trim().length === 0) {
      throw new Error('Trip name is required');
    }

    // Check for existing active trip
    const activeTrip = this.repository.getActive();
    if (activeTrip) {
      throw new Error('Cannot create a new trip while another trip is active');
    }

    const tripId = generateId();
    const stop: Stop = {
      ...initialStop,
      id: generateId(),
      tripId,
    };

    const newTrip: Trip = {
      id: tripId,
      name: name.trim(),
      vehicleId,
      startDate: initialStop.timestamp,
      status: 'active',
      stops: [stop],
      totalDistance: 0,
      totalEnergyUsed: 0,
      averageEfficiency: 0,
    };

    // Validate
    const validatedTrip = validateTrip(newTrip);

    // Persist
    this.repository.add(validatedTrip);

    return validatedTrip;
  }

  /**
   * Add a stop to a trip
   */
  addStop(
    tripId: string,
    stopData: StopInput,
    generateId: () => string,
    calculateMetrics: (trip: Trip) => TripMetrics
  ): Trip {
    const trip = this.repository.getById(tripId);
    
    if (!trip) {
      throw new Error(`Trip with id ${tripId} not found`);
    }

    if (trip.status !== 'active') {
      throw new Error('Cannot add stops to a completed trip');
    }

    // Validate stop data
    const lastStop = trip.stops[trip.stops.length - 1];
    
    // Business rules
    if (stopData.odometer <= lastStop.odometer) {
      throw new Error('Odometer reading must be greater than the previous stop');
    }

    if (stopData.timestamp < lastStop.timestamp) {
      throw new Error('Stop timestamp must be after the previous stop');
    }

    const newStop: Stop = {
      ...stopData,
      id: generateId(),
      tripId,
    };

    // Validate stop
    validateStop(newStop);

    const updatedStops = [...trip.stops, newStop];
    const metrics = calculateMetrics({ ...trip, stops: updatedStops });

    const updatedTrip: Trip = {
      ...trip,
      stops: updatedStops,
      ...metrics,
    };

    // Validate and persist
    const validatedTrip = validateTrip(updatedTrip);
    this.repository.update(tripId, validatedTrip);

    return validatedTrip;
  }

  /**
   * Update a stop
   */
  updateStop(
    tripId: string,
    stopId: string,
    stopData: StopInput,
    calculateMetrics: (trip: Trip) => TripMetrics
  ): Trip {
    const trip = this.repository.getById(tripId);
    
    if (!trip) {
      throw new Error(`Trip with id ${tripId} not found`);
    }

    const stopIndex = trip.stops.findIndex(s => s.id === stopId);
    if (stopIndex === -1) {
      throw new Error(`Stop with id ${stopId} not found`);
    }

    // Business rules: validate against adjacent stops
    const prevStop = stopIndex > 0 ? trip.stops[stopIndex - 1] : null;
    const nextStop = stopIndex < trip.stops.length - 1 ? trip.stops[stopIndex + 1] : null;

    if (prevStop && stopData.odometer <= prevStop.odometer) {
      throw new Error('Odometer must be greater than previous stop');
    }

    if (nextStop && stopData.odometer >= nextStop.odometer) {
      throw new Error('Odometer must be less than next stop');
    }

    if (prevStop && stopData.timestamp < prevStop.timestamp) {
      throw new Error('Timestamp must be after previous stop');
    }

    if (nextStop && stopData.timestamp > nextStop.timestamp) {
      throw new Error('Timestamp must be before next stop');
    }

    const updatedStops = trip.stops.map((stop) =>
      stop.id === stopId ? { ...stopData, id: stopId, tripId } : stop
    );

    const metrics = calculateMetrics({ ...trip, stops: updatedStops });

    const updatedTrip: Trip = {
      ...trip,
      stops: updatedStops,
      ...metrics,
    };

    const validatedTrip = validateTrip(updatedTrip);
    this.repository.update(tripId, validatedTrip);

    return validatedTrip;
  }

  /**
   * Delete a stop
   */
  deleteStop(
    tripId: string,
    stopId: string,
    calculateMetrics: (trip: Trip) => TripMetrics
  ): Trip {
    const trip = this.repository.getById(tripId);
    
    if (!trip) {
      throw new Error(`Trip with id ${tripId} not found`);
    }

    // Cannot delete the first stop
    if (trip.stops[0].id === stopId) {
      throw new Error('Cannot delete the first stop of a trip');
    }

    const updatedStops = trip.stops.filter((stop) => stop.id !== stopId);
    
    if (updatedStops.length === 0) {
      throw new Error('Trip must have at least one stop');
    }

    const metrics = calculateMetrics({ ...trip, stops: updatedStops });

    const updatedTrip: Trip = {
      ...trip,
      stops: updatedStops,
      ...metrics,
    };

    const validatedTrip = validateTrip(updatedTrip);
    this.repository.update(tripId, validatedTrip);

    return validatedTrip;
  }

  /**
   * Add charging session to a stop
   */
  addChargingSession(
    tripId: string,
    stopId: string,
    session: ChargingSession,
    calculateMetrics: (trip: Trip) => TripMetrics
  ): Trip {
    const trip = this.repository.getById(tripId);
    
    if (!trip) {
      throw new Error(`Trip with id ${tripId} not found`);
    }

    const stop = trip.stops.find(s => s.id === stopId);
    if (!stop) {
      throw new Error(`Stop with id ${stopId} not found`);
    }

    if (stop.chargingSession) {
      throw new Error('Stop already has a charging session. Update or delete it first.');
    }

    // Validate charging session
    validateChargingSession(session);

    const updatedStops = trip.stops.map((s) =>
      s.id === stopId ? { ...s, chargingSession: session } : s
    );

    const metrics = calculateMetrics({ ...trip, stops: updatedStops });

    const updatedTrip: Trip = {
      ...trip,
      stops: updatedStops,
      ...metrics,
    };

    const validatedTrip = validateTrip(updatedTrip);
    this.repository.update(tripId, validatedTrip);

    return validatedTrip;
  }

  /**
   * Complete a trip
   */
  completeTrip(tripId: string, calculateMetrics: (trip: Trip) => TripMetrics): Trip {
    const trip = this.repository.getById(tripId);
    
    if (!trip) {
      throw new Error(`Trip with id ${tripId} not found`);
    }

    if (trip.status === 'completed') {
      throw new Error('Trip is already completed');
    }

    if (trip.stops.length < 2) {
      throw new Error('Trip must have at least 2 stops to be completed');
    }

    const metrics = calculateMetrics(trip);

    const updatedTrip: Trip = {
      ...trip,
      status: 'completed',
      endDate: Date.now(),
      ...metrics,
    };

    const validatedTrip = validateTrip(updatedTrip);
    this.repository.update(tripId, validatedTrip);

    return validatedTrip;
  }

  /**
   * Reopen a completed trip
   */
  reopenTrip(tripId: string): Trip {
    const trip = this.repository.getById(tripId);
    
    if (!trip) {
      throw new Error(`Trip with id ${tripId} not found`);
    }

    if (trip.status === 'active') {
      throw new Error('Trip is already active');
    }

    // Check for existing active trip
    const activeTrip = this.repository.getActive();
    if (activeTrip) {
      throw new Error('Cannot reopen trip while another trip is active');
    }

    const updatedTrip: Trip = {
      ...trip,
      status: 'active',
      endDate: undefined,
    };

    const validatedTrip = validateTrip(updatedTrip);
    this.repository.update(tripId, validatedTrip);

    return validatedTrip;
  }

  /**
   * Delete a trip
   */
  deleteTrip(tripId: string): void {
    const trip = this.repository.getById(tripId);
    
    if (!trip) {
      throw new Error(`Trip with id ${tripId} not found`);
    }

    this.repository.delete(tripId);
  }

  /**
   * Get trip by ID
   */
  getTripById(tripId: string): Trip | undefined {
    return this.repository.getById(tripId);
  }

  /**
   * Get all trips for a vehicle
   */
  getTripsByVehicle(vehicleId: string): Trip[] {
    return this.repository.getByVehicleId(vehicleId);
  }

  /**
   * Get active trip
   */
  getActiveTrip(): Trip | undefined {
    return this.repository.getActive();
  }

  /**
   * Get completed trips
   */
  getCompletedTrips(): Trip[] {
    return this.repository.getCompleted();
  }

  /**
   * Validate trip can be created
   */
  canCreateTrip(): { canCreate: boolean; reason?: string } {
    const activeTrip = this.repository.getActive();
    
    if (activeTrip) {
      return {
        canCreate: false,
        reason: `Active trip "${activeTrip.name}" must be completed first`,
      };
    }

    return { canCreate: true };
  }
}
