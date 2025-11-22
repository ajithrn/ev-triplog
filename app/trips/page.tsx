'use client';

import { useEffect, useState } from 'react';
import { useTrips } from '@/contexts/TripContext';
import { useVehicles } from '@/contexts/VehicleContext';
import Link from 'next/link';
import { Car, Plus, MapPin, Calendar, Battery, Zap, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { formatDistance, formatEnergy } from '@/utils/calculations';

export default function TripsPage() {
  const { trips } = useTrips();
  const { vehicles } = useVehicles();
  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  const filteredTrips = trips.filter((trip) => {
    if (filter === 'all') return true;
    return trip.status === filter;
  });

  const sortedTrips = [...filteredTrips].sort((a, b) => b.startDate - a.startDate);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-base-content">Trips</h1>
          <p className="mt-1 text-base-content/70">View and manage your trip history</p>
        </div>
        {vehicles.length > 0 && (
          <Link href="/trips/new" className="btn btn-primary shadow-lg hover:shadow-xl">
            <Plus className="h-5 w-5" />
            New Trip
          </Link>
        )}
      </div>

      {/* No vehicles message */}
      {vehicles.length === 0 && (
        <div className="card bg-base-200 shadow-xl card-hover border border-base-300">
          <div className="card-body items-center text-center">
            <Car className="h-16 w-16 text-primary mb-4" />
            <h2 className="card-title text-2xl text-base-content">No Vehicles Yet</h2>
            <p className="text-base-content/70">Add a vehicle first to start tracking trips</p>
            <div className="card-actions mt-4">
              <Link href="/vehicles/new" className="btn btn-primary">
                <Plus className="h-5 w-5" />
                Add Vehicle
              </Link>
            </div>
          </div>
        </div>
      )}

      {vehicles.length > 0 && (
        <>
          {/* Filter Tabs */}
          <div role="tablist" className="tabs bg-base-200 p-2 rounded-lg shadow-lg border border-base-300">
            <a
              role="tab"
              className={`tab rounded-lg transition-all ${
                filter === 'all' 
                  ? 'bg-primary text-primary-content' 
                  : 'hover:bg-base-200'
              }`}
              onClick={() => setFilter('all')}
            >
              All Trips ({trips.length})
            </a>
            <a
              role="tab"
              className={`tab rounded-lg transition-all ${
                filter === 'active' 
                  ? 'bg-primary text-primary-content' 
                  : 'hover:bg-base-200'
              }`}
              onClick={() => setFilter('active')}
            >
              Active ({trips.filter((t) => t.status === 'active').length})
            </a>
            <a
              role="tab"
              className={`tab rounded-lg transition-all ${
                filter === 'completed' 
                  ? 'bg-primary text-primary-content' 
                  : 'hover:bg-base-200'
              }`}
              onClick={() => setFilter('completed')}
            >
              Completed ({trips.filter((t) => t.status === 'completed').length})
            </a>
          </div>

          {/* Trips List */}
          {sortedTrips.length === 0 ? (
            <div className="card bg-base-200 shadow-xl card-hover border border-base-300">
              <div className="card-body items-center text-center">
                <MapPin className="h-16 w-16 text-primary mb-4" />
                <h2 className="card-title text-2xl text-base-content">No Trips Yet</h2>
                <p className="text-base-content/70">Start your first trip to begin tracking</p>
                <div className="card-actions mt-4">
                  <Link href="/trips/new" className="btn btn-primary">
                    <Plus className="h-5 w-5" />
                    New Trip
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedTrips.map((trip) => {
                const vehicle = vehicles.find((v) => v.id === trip.vehicleId);
                // Calculate total charging cost
                const totalChargingCost = trip.stops.reduce((sum, stop) => {
                  return sum + (stop.chargingSession?.cost || 0);
                }, 0);
                return (
                  <Link
                    key={trip.id}
                    href={`/trip-details?id=${trip.id}`}
                    className={`card bg-base-200 shadow-lg card-hover border ${
                      trip.status === 'active' 
                        ? 'border-2 border-primary' 
                        : 'border-base-300'
                    }`}
                  >
                    <div className="card-body p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <MapPin className={`h-10 w-10 ${
                          trip.status === 'active' ? 'text-primary' : 'text-base-content/50'
                        }`} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-base line-clamp-1 text-base-content">
                              {trip.name}
                            </h3>
                            {trip.status === 'active' && (
                              <div className="badge badge-primary badge-sm">Active</div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-base-content/60 mt-1">
                            <Car className="h-3 w-3" />
                            <span className="line-clamp-1">{vehicle?.name || 'Unknown Vehicle'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-base-content/60 mb-3">
                        <Calendar className="h-3 w-3" />
                        <span>{format(new Date(trip.startDate), 'PP')}</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 bg-base-300 rounded-lg">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                            <span className="text-xs font-medium text-base-content/70">Distance</span>
                          </div>
                          <span className="text-sm font-bold text-base-content">{formatDistance(trip.totalDistance)}</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-base-300 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Battery className="h-4 w-4 text-primary flex-shrink-0" />
                            <span className="text-xs font-medium text-base-content/70">Energy</span>
                          </div>
                          <span className="text-sm font-bold text-base-content">{formatEnergy(trip.totalEnergyUsed)}</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-base-300 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4 text-primary flex-shrink-0" />
                            <span className="text-xs font-medium text-base-content/70">Efficiency</span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-bold text-base-content">
                              {trip.averageEfficiency > 0
                                ? `${(1 / trip.averageEfficiency).toFixed(2)} km/kWh`
                                : 'N/A'}
                            </span>
                            {trip.stops.length >= 2 && vehicle && (() => {
                              const kmPerKwh = trip.averageEfficiency > 0 ? 1 / trip.averageEfficiency : 0;
                              const kwhPerPercent = vehicle.batteryCapacity / 100;
                              const kmPerPercent = kmPerKwh * kwhPerPercent;
                              return kmPerPercent > 0 ? (
                                <div className="text-[10px] text-base-content/60">
                                  {kmPerPercent.toFixed(2)} km/%
                                </div>
                              ) : null;
                            })()}
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-base-300 rounded-lg">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-primary flex-shrink-0" />
                            <span className="text-xs font-medium text-base-content/70">Charging Cost</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold text-base-content">₹{totalChargingCost.toFixed(2)}</div>
                            {trip.totalDistance > 0 && totalChargingCost > 0 && (
                              <div className="text-[10px] text-base-content/60">
                                ₹{(totalChargingCost / trip.totalDistance).toFixed(2)}/km
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-base-300 rounded-lg">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                            <span className="text-xs font-medium text-base-content/70">Stops</span>
                          </div>
                          <span className="text-sm font-bold text-base-content">{trip.stops.length}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
