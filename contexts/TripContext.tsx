'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Trip, Stop, ChargingSession } from '@/types';
import {
  getTrips,
  addTrip as addTripToStorage,
  updateTrip as updateTripInStorage,
  deleteTrip as deleteTripFromStorage,
  getActiveTrip as getActiveTripFromStorage,
} from '@/utils/storage';
import { generateId, calculateTripMetrics } from '@/utils/calculations';

interface TripContextType {
  trips: Trip[];
  activeTrip: Trip | null;
  createTrip: (name: string, vehicleId: string, initialStop: Omit<Stop, 'id' | 'tripId'>) => Trip;
  addStop: (tripId: string, stop: Omit<Stop, 'id' | 'tripId'>) => void;
  updateStop: (tripId: string, stopId: string, stop: Omit<Stop, 'id' | 'tripId'>) => void;
  deleteStop: (tripId: string, stopId: string) => void;
  addChargingSession: (tripId: string, stopId: string, session: ChargingSession) => void;
  updateChargingSession: (tripId: string, stopId: string, session: ChargingSession) => void;
  deleteChargingSession: (tripId: string, stopId: string) => void;
  completeTrip: (tripId: string) => void;
  reopenTrip: (tripId: string) => void;
  deleteTrip: (tripId: string) => void;
  getTripById: (id: string) => Trip | undefined;
  refreshTrips: () => void;
}

const TripContext = createContext<TripContextType | undefined>(undefined);

export function TripProvider({ children }: { children: ReactNode }) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);

  // Load trips from storage on mount
  useEffect(() => {
    const loadedTrips = getTrips();
    setTrips(loadedTrips);
    const active = getActiveTripFromStorage();
    setActiveTrip(active || null);
  }, []);

  const createTrip = (name: string, vehicleId: string, initialStop: Omit<Stop, 'id' | 'tripId'>): Trip => {
    const tripId = generateId();
    const stop: Stop = {
      ...initialStop,
      id: generateId(),
      tripId,
    };

    const newTrip: Trip = {
      id: tripId,
      name,
      vehicleId,
      startDate: initialStop.timestamp, // Use the first stop's timestamp as trip start date
      status: 'active',
      stops: [stop],
      totalDistance: 0,
      totalEnergyUsed: 0,
      averageEfficiency: 0,
    };

    addTripToStorage(newTrip);
    setTrips((prev) => [...prev, newTrip]);
    setActiveTrip(newTrip);
    return newTrip;
  };

  const addStop = (tripId: string, stopData: Omit<Stop, 'id' | 'tripId'>) => {
    const trip = trips.find((t) => t.id === tripId);
    if (!trip) return;

    const newStop: Stop = {
      ...stopData,
      id: generateId(),
      tripId,
    };

    const updatedStops = [...trip.stops, newStop];
    const metrics = calculateTripMetrics({ ...trip, stops: updatedStops });

    const updatedTrip: Trip = {
      ...trip,
      stops: updatedStops,
      ...metrics,
    };

    updateTripInStorage(tripId, updatedTrip);
    setTrips((prev) => prev.map((t) => (t.id === tripId ? updatedTrip : t)));
    if (activeTrip?.id === tripId) {
      setActiveTrip(updatedTrip);
    }
  };

  const updateStop = (tripId: string, stopId: string, stopData: Omit<Stop, 'id' | 'tripId'>) => {
    const trip = trips.find((t) => t.id === tripId);
    if (!trip) return;

    const updatedStops = trip.stops.map((stop) =>
      stop.id === stopId ? { ...stopData, id: stopId, tripId } : stop
    );
    const metrics = calculateTripMetrics({ ...trip, stops: updatedStops });

    const updatedTrip: Trip = {
      ...trip,
      stops: updatedStops,
      ...metrics,
    };

    updateTripInStorage(tripId, updatedTrip);
    setTrips((prev) => prev.map((t) => (t.id === tripId ? updatedTrip : t)));
    if (activeTrip?.id === tripId) {
      setActiveTrip(updatedTrip);
    }
  };

  const deleteStop = (tripId: string, stopId: string) => {
    const trip = trips.find((t) => t.id === tripId);
    if (!trip) return;

    const updatedStops = trip.stops.filter((stop) => stop.id !== stopId);
    const metrics = calculateTripMetrics({ ...trip, stops: updatedStops });

    const updatedTrip: Trip = {
      ...trip,
      stops: updatedStops,
      ...metrics,
    };

    updateTripInStorage(tripId, updatedTrip);
    setTrips((prev) => prev.map((t) => (t.id === tripId ? updatedTrip : t)));
    if (activeTrip?.id === tripId) {
      setActiveTrip(updatedTrip);
    }
  };

  const addChargingSession = (tripId: string, stopId: string, session: ChargingSession) => {
    const trip = trips.find((t) => t.id === tripId);
    if (!trip) return;

    const updatedStops = trip.stops.map((stop) =>
      stop.id === stopId ? { ...stop, chargingSession: session } : stop
    );
    const metrics = calculateTripMetrics({ ...trip, stops: updatedStops });

    const updatedTrip: Trip = {
      ...trip,
      stops: updatedStops,
      ...metrics,
    };

    updateTripInStorage(tripId, updatedTrip);
    setTrips((prev) => prev.map((t) => (t.id === tripId ? updatedTrip : t)));
    if (activeTrip?.id === tripId) {
      setActiveTrip(updatedTrip);
    }
  };

  const updateChargingSession = (tripId: string, stopId: string, session: ChargingSession) => {
    const trip = trips.find((t) => t.id === tripId);
    if (!trip) return;

    const updatedStops = trip.stops.map((stop) =>
      stop.id === stopId ? { ...stop, chargingSession: session } : stop
    );
    const metrics = calculateTripMetrics({ ...trip, stops: updatedStops });

    const updatedTrip: Trip = {
      ...trip,
      stops: updatedStops,
      ...metrics,
    };

    updateTripInStorage(tripId, updatedTrip);
    setTrips((prev) => prev.map((t) => (t.id === tripId ? updatedTrip : t)));
    if (activeTrip?.id === tripId) {
      setActiveTrip(updatedTrip);
    }
  };

  const deleteChargingSession = (tripId: string, stopId: string) => {
    const trip = trips.find((t) => t.id === tripId);
    if (!trip) return;

    const updatedStops = trip.stops.map((stop) =>
      stop.id === stopId ? { ...stop, chargingSession: undefined } : stop
    );
    const metrics = calculateTripMetrics({ ...trip, stops: updatedStops });

    const updatedTrip: Trip = {
      ...trip,
      stops: updatedStops,
      ...metrics,
    };

    updateTripInStorage(tripId, updatedTrip);
    setTrips((prev) => prev.map((t) => (t.id === tripId ? updatedTrip : t)));
    if (activeTrip?.id === tripId) {
      setActiveTrip(updatedTrip);
    }
  };

  const completeTrip = (tripId: string) => {
    const trip = trips.find((t) => t.id === tripId);
    if (!trip) return;

    const metrics = calculateTripMetrics(trip);
    const updatedTrip: Trip = {
      ...trip,
      status: 'completed',
      endDate: Date.now(),
      ...metrics,
    };

    updateTripInStorage(tripId, updatedTrip);
    setTrips((prev) => prev.map((t) => (t.id === tripId ? updatedTrip : t)));
    if (activeTrip?.id === tripId) {
      setActiveTrip(null);
    }
  };

  const reopenTrip = (tripId: string) => {
    const trip = trips.find((t) => t.id === tripId);
    if (!trip) return;

    const updatedTrip: Trip = {
      ...trip,
      status: 'active',
      endDate: undefined,
    };

    updateTripInStorage(tripId, updatedTrip);
    setTrips((prev) => prev.map((t) => (t.id === tripId ? updatedTrip : t)));
    setActiveTrip(updatedTrip);
  };

  const deleteTrip = (tripId: string) => {
    deleteTripFromStorage(tripId);
    setTrips((prev) => prev.filter((t) => t.id !== tripId));
    if (activeTrip?.id === tripId) {
      setActiveTrip(null);
    }
  };

  const getTripById = (id: string) => {
    return trips.find((t) => t.id === id);
  };

  const refreshTrips = () => {
    const loadedTrips = getTrips();
    setTrips(loadedTrips);
    const active = getActiveTripFromStorage();
    setActiveTrip(active || null);
  };

  return (
    <TripContext.Provider
      value={{
        trips,
        activeTrip,
        createTrip,
        addStop,
        updateStop,
        deleteStop,
        addChargingSession,
        updateChargingSession,
        deleteChargingSession,
        completeTrip,
        reopenTrip,
        deleteTrip,
        getTripById,
        refreshTrips,
      }}
    >
      {children}
    </TripContext.Provider>
  );
}

export function useTrips() {
  const context = useContext(TripContext);
  if (context === undefined) {
    throw new Error('useTrips must be used within a TripProvider');
  }
  return context;
}
