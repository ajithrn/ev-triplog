'use client';

import { useEffect, useState } from 'react';
import { useVehicles } from '@/contexts/VehicleContext';
import { useTrips } from '@/contexts/TripContext';
import { useSettings } from '@/contexts/SettingsContext';
import Link from 'next/link';
import { Car, Plus, MapPin, Battery, TrendingUp, Zap, Calendar, DollarSign } from 'lucide-react';
import { formatDistance, formatEnergy, formatBatteryPercent, formatEfficiency } from '@/utils/calculations';
import { formatCurrency } from '@/utils/formatters';
import { formatDate } from '@/utils/dateFormatters';

export default function Dashboard() {
  const { vehicles } = useVehicles();
  const { trips, activeTrip } = useTrips();
  const { settings } = useSettings();
  const [mounted, setMounted] = useState(false);

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

  const completedTrips = trips.filter((t) => t.status === 'completed');
  const totalDistance = completedTrips.reduce((sum, t) => sum + t.totalDistance, 0);
  const totalEnergy = completedTrips.reduce((sum, t) => sum + t.totalEnergyUsed, 0);
  const avgEfficiency = totalDistance > 0 ? totalEnergy / totalDistance : 0;
  
  // Calculate total battery percentage used across all trips
  const totalBatteryPercentUsed = completedTrips.reduce((sum, trip) => {
    if (trip.stops.length < 2) return sum;
    const firstStop = trip.stops[0];
    const lastStop = trip.stops[trip.stops.length - 1];
    return sum + (firstStop.batteryPercent - lastStop.batteryPercent);
  }, 0);
  
  // Calculate km per % (average across all trips)
  const kmPerPercent = totalBatteryPercentUsed > 0 ? totalDistance / totalBatteryPercentUsed : 0;
  
  // Calculate total charging cost
  const totalChargingCost = completedTrips.reduce((sum, trip) => {
    return sum + trip.stops.reduce((stopSum, stop) => {
      return stopSum + (stop.chargingSession?.cost || 0);
    }, 0);
  }, 0);
  
  // Calculate cost per km
  const costPerKm = totalDistance > 0 ? totalChargingCost / totalDistance : 0;

  const recentTrips = [...completedTrips]
    .sort((a, b) => b.startDate - a.startDate)
    .slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-base-content">Dashboard</h1>
          <p className="mt-1 text-base-content/70">Track your EV trips and efficiency</p>
        </div>
        {vehicles.length === 0 ? (
          <Link
            href="/vehicles"
            className="btn btn-primary shadow-lg hover:shadow-xl"
          >
            <Plus className="h-5 w-5" />
            Add Vehicle
          </Link>
        ) : (
          <Link
            href="/trips/new"
            className="btn btn-primary shadow-lg hover:shadow-xl"
          >
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
            <p className="text-base-content/70">Add your first vehicle to start tracking trips</p>
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
          {/* Active Trip Card */}
          {activeTrip && (
            <Link 
              href={`/trip-details?id=${activeTrip.id}`}
              className="alert alert-info shadow-lg hover:shadow-xl transition-all cursor-pointer"
            >
              <MapPin className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-sm sm:text-lg truncate">{activeTrip.name || 'Active Trip'}</h3>
                  <div className="badge badge-primary badge-sm">Active</div>
                </div>
                <p className="text-xs sm:text-sm opacity-80">
                  Started {formatDate(new Date(activeTrip.startDate), settings)} • Click to manage trip
                </p>
              </div>
            </Link>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            <div className="card bg-base-200 shadow-lg border border-base-300">
              <div className="card-body p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                  <h3 className="text-xs font-medium text-base-content/70">Total Trips</h3>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-base-content">{completedTrips.length}</p>
              </div>
            </div>

            <div className="card bg-base-200 shadow-lg border border-base-300">
              <div className="card-body p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-primary flex-shrink-0" />
                  <h3 className="text-xs font-medium text-base-content/70">Distance</h3>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-base-content">{totalDistance.toFixed(0)}</p>
                <p className="text-xs text-base-content/60 mt-1">kilometers</p>
              </div>
            </div>

            <div className="card bg-base-200 shadow-lg border border-base-300">
              <div className="card-body p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Battery className="h-4 w-4 text-primary flex-shrink-0" />
                  <h3 className="text-xs font-medium text-base-content/70">Energy</h3>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-base-content">{totalEnergy.toFixed(1)}</p>
                <p className="text-xs text-base-content/60 mt-1">kWh used</p>
              </div>
            </div>

            <div className="card bg-base-200 shadow-lg border border-base-300">
              <div className="card-body p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4 text-primary flex-shrink-0" />
                  <h3 className="text-xs font-medium text-base-content/70">Efficiency</h3>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-base-content">{avgEfficiency > 0 ? (1 / avgEfficiency).toFixed(2) : '0.00'}</p>
                <p className="text-xs text-base-content/60 mt-1">
                  km/kWh {kmPerPercent > 0 ? `(${kmPerPercent.toFixed(2)} km/%)` : ''}
                </p>
              </div>
            </div>

            <div className="card bg-base-200 shadow-lg border border-base-300">
              <div className="card-body p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-primary flex-shrink-0" />
                  <h3 className="text-xs font-medium text-base-content/70">Charging Cost</h3>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-base-content">{formatCurrency(totalChargingCost, settings)}</p>
                <p className="text-xs text-base-content/60 mt-1">total cost</p>
              </div>
            </div>

            <div className="card bg-base-200 shadow-lg border border-base-300">
              <div className="card-body p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-primary flex-shrink-0" />
                  <h3 className="text-xs font-medium text-base-content/70">Cost/km</h3>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-base-content">{formatCurrency(costPerKm, settings)}</p>
                <p className="text-xs text-base-content/60 mt-1">per kilometer</p>
              </div>
            </div>
          </div>

          {/* Recent Trips */}
          <div className="card bg-base-200 shadow-xl border border-base-300">
            <div className="card-body">
              <div className="flex items-center justify-between mb-4">
                <h2 className="card-title text-base-content">Recent Trips</h2>
                <Link href="/trips" className="btn btn-ghost btn-sm">
                  View All
                </Link>
              </div>
              <div className="divider mt-0"></div>
              {recentTrips.length === 0 ? (
                <div className="text-center py-8 text-base-content/70">
                  No completed trips yet. Start your first trip!
                </div>
              ) : (
                <div className="space-y-3">
                  {recentTrips.map((trip) => {
                    const vehicle = vehicles.find((v) => v.id === trip.vehicleId);
                    return (
                      <Link
                        key={trip.id}
                        href={`/trip-details?id=${trip.id}`}
                        className="flex items-center justify-between p-4 bg-base-300 rounded-lg hover:bg-base-300/80 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <MapPin className="h-5 w-5 text-primary flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm text-base-content truncate">{trip.name || 'Trip'}</h3>
                            <p className="text-xs text-base-content/60 truncate">{formatDate(new Date(trip.startDate), settings)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 lg:gap-6 flex-shrink-0">
                          <div className="text-right">
                            <div className="flex items-center justify-end gap-1 mb-1">
                              <TrendingUp className="h-3 w-3 text-primary" />
                              <p className="text-xs text-base-content/60">Distance</p>
                            </div>
                            <p className="font-semibold text-sm text-base-content">{formatDistance(trip.totalDistance)}</p>
                          </div>
                          <div className="text-right hidden lg:block">
                            <div className="flex items-center justify-end gap-1 mb-1">
                              <Battery className="h-3 w-3 text-primary" />
                              <p className="text-xs text-base-content/60">Energy</p>
                            </div>
                            <p className="font-semibold text-sm text-base-content">{formatEnergy(trip.totalEnergyUsed)}</p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center justify-end gap-1 mb-1">
                              <Zap className="h-3 w-3 text-primary" />
                              <p className="text-xs text-base-content/60">Efficiency</p>
                            </div>
                            <p className="font-semibold text-sm text-base-content">
                              {trip.averageEfficiency > 0 ? `${(1 / trip.averageEfficiency).toFixed(2)} km/kWh` : 'N/A'}
                            </p>
                          </div>
                          <div className="text-right hidden lg:block">
                            <div className="flex items-center justify-end gap-1 mb-1">
                              <MapPin className="h-3 w-3 text-primary" />
                              <p className="text-xs text-base-content/60">Stops</p>
                            </div>
                            <p className="font-semibold text-sm text-base-content">{trip.stops.length}</p>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
