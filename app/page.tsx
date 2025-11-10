'use client';

import { useEffect, useState } from 'react';
import { useVehicles } from '@/contexts/VehicleContext';
import { useTrips } from '@/contexts/TripContext';
import Link from 'next/link';
import { Car, Plus, MapPin, Battery, TrendingUp, Zap, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { formatDistance, formatEnergy, formatBatteryPercent, formatEfficiency } from '@/utils/calculations';

export default function Dashboard() {
  const { vehicles } = useVehicles();
  const { trips, activeTrip } = useTrips();
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

  const recentTrips = [...completedTrips]
    .sort((a, b) => b.startDate - a.startDate)
    .slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold" style={{ color: 'var(--page-title)' }}>Dashboard</h1>
          <p className="mt-1" style={{ color: 'var(--page-subtitle)' }}>Track your EV trips and efficiency</p>
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
        <div className="card bg-base-100 shadow-xl card-hover">
          <div className="card-body items-center text-center">
            <Car className="h-16 w-16 text-primary mb-4" />
            <h2 className="card-title text-2xl">No Vehicles Yet</h2>
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
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-12 w-12 text-primary" />
                    <div>
                      <h2 className="card-title text-2xl">{activeTrip.name || 'Active Trip'}</h2>
                      <p className="text-sm text-base-content/70">Currently in progress</p>
                    </div>
                  </div>
                  <Link href={`/trip-details?id=${activeTrip.id}`} className="btn btn-primary">
                    View Details
                  </Link>
                </div>
                <div className="stats stats-vertical sm:grid sm:grid-cols-2 lg:grid-cols-4 shadow-lg bg-base-100 w-full">
                  <div className="stat">
                    <div className="flex items-center gap-3 mb-2">
                      <Calendar className="h-8 w-8 text-info" />
                      <div className="stat-title">Started</div>
                    </div>
                    <div className="stat-value text-2xl">{format(new Date(activeTrip.startDate), 'PP')}</div>
                    <div className="stat-desc">{format(new Date(activeTrip.startDate), 'p')}</div>
                  </div>
                  <div className="stat">
                    <div className="flex items-center gap-3 mb-2">
                      <MapPin className="h-8 w-8 text-primary" />
                      <div className="stat-title">Distance</div>
                    </div>
                    <div className="stat-value">{activeTrip.totalDistance.toFixed(1)}</div>
                    <div className="stat-desc">kilometers</div>
                  </div>
                  <div className="stat">
                    <div className="flex items-center gap-3 mb-2">
                      <Battery className="h-8 w-8 text-secondary" />
                      <div className="stat-title">Energy</div>
                    </div>
                    <div className="stat-value">{activeTrip.totalEnergyUsed.toFixed(2)}</div>
                    <div className="stat-desc">kWh used</div>
                  </div>
                  <div className="stat">
                    <div className="flex items-center gap-3 mb-2">
                      <MapPin className="h-8 w-8 text-success" />
                      <div className="stat-title">Stops</div>
                    </div>
                    <div className="stat-value">{activeTrip.stops.length}</div>
                    <div className="stat-desc">total stops</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="stats stats-vertical sm:grid sm:grid-cols-2 lg:grid-cols-4 shadow-xl bg-base-100 w-full">
            <div className="stat">
              <div className="flex items-center gap-3 mb-2">
                <MapPin className="h-8 w-8 text-primary" />
                <div className="stat-title">Total Trips</div>
              </div>
              <div className="stat-value">{completedTrips.length}</div>
            </div>

            <div className="stat">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="h-8 w-8 text-success" />
                <div className="stat-title">Distance</div>
              </div>
              <div className="stat-value">{totalDistance.toFixed(0)}</div>
              <div className="stat-desc">kilometers</div>
            </div>

            <div className="stat">
              <div className="flex items-center gap-3 mb-2">
                <Battery className="h-8 w-8 text-warning" />
                <div className="stat-title">Energy</div>
              </div>
              <div className="stat-value">{totalEnergy.toFixed(1)}</div>
              <div className="stat-desc">kWh used</div>
            </div>

            <div className="stat">
              <div className="flex items-center gap-3 mb-2">
                <Zap className="h-8 w-8 text-info" />
                <div className="stat-title">Efficiency</div>
              </div>
              <div className="stat-value">{avgEfficiency.toFixed(2)}</div>
              <div className="stat-desc">kWh/km</div>
            </div>
          </div>

          {/* Recent Trips */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex items-center justify-between mb-4">
                <h2 className="card-title">Recent Trips</h2>
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
                        className="card bg-base-100 shadow-lg card-hover"
                      >
                        <div className="card-body p-4">
                          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div className="flex items-center gap-3 flex-shrink-0">
                              <MapPin className="h-8 w-8 text-primary" />
                              <div>
                                <h3 className="font-semibold text-base">{trip.name || 'Trip'}</h3>
                                <div className="flex items-center gap-2 text-xs text-base-content/70">
                                  <Car className="h-3 w-3" />
                                  <span>{vehicle?.name || 'Unknown Vehicle'}</span>
                                  <span>•</span>
                                  <Calendar className="h-3 w-3" />
                                  <span>{format(new Date(trip.startDate), 'PP')}</span>
                                </div>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-3">
                              <div className="bg-base-200/30 rounded-lg p-2 flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-primary flex-shrink-0" />
                                <div>
                                  <div className="text-xs opacity-70">Distance</div>
                                  <div className="font-semibold text-sm">{formatDistance(trip.totalDistance)}</div>
                                </div>
                              </div>
                              <div className="bg-base-200/30 rounded-lg p-2 flex items-center gap-2">
                                <Battery className="h-5 w-5 text-secondary flex-shrink-0" />
                                <div>
                                  <div className="text-xs opacity-70">Energy</div>
                                  <div className="font-semibold text-sm">{formatEnergy(trip.totalEnergyUsed)}</div>
                                </div>
                              </div>
                              <div className="bg-base-200/30 rounded-lg p-2 flex items-center gap-2">
                                <Zap className="h-5 w-5 text-accent flex-shrink-0" />
                                <div>
                                  <div className="text-xs opacity-70">Efficiency</div>
                                  <div className="font-semibold text-sm">{formatEfficiency(trip.averageEfficiency, 1 / trip.averageEfficiency)}</div>
                                </div>
                              </div>
                              <div className="bg-base-200/30 rounded-lg p-2 flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-success flex-shrink-0" />
                                <div>
                                  <div className="text-xs opacity-70">Stops</div>
                                  <div className="font-semibold text-sm">{trip.stops.length}</div>
                                </div>
                              </div>
                            </div>
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
