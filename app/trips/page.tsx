'use client';

import { useEffect, useState } from 'react';
import { useTrips } from '@/contexts/TripContext';
import { useVehicles } from '@/contexts/VehicleContext';
import Link from 'next/link';
import { Car, Plus, MapPin, Calendar, Battery, Zap } from 'lucide-react';
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
          <h1 className="text-3xl sm:text-4xl font-bold" style={{ color: 'var(--page-title)' }}>Trips</h1>
          <p className="mt-1" style={{ color: 'var(--page-subtitle)' }}>View and manage your trip history</p>
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
        <div className="card bg-base-100 shadow-xl card-hover">
          <div className="card-body items-center text-center">
            <Car className="h-16 w-16 text-primary mb-4" />
            <h2 className="card-title text-2xl">No Vehicles Yet</h2>
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
          <div role="tablist" className="tabs bg-base-100 p-2 rounded-l shadow-lg">
            <a
              role="tab"
              className={`tab rounded-lg transition-all ${
                filter === 'all' 
                  ? 'bg-primary/10 text-primary' 
                  : 'hover:'
              }`}
              onClick={() => setFilter('all')}
            >
              All Trips ({trips.length})
            </a>
            <a
              role="tab"
              className={`tab rounded-lg transition-all ${
                filter === 'active' 
                  ? 'bg-primary/10 text-primary' 
                  : 'hover:'
              }`}
              onClick={() => setFilter('active')}
            >
              Active ({trips.filter((t) => t.status === 'active').length})
            </a>
            <a
              role="tab"
              className={`tab rounded-lg transition-all ${
                filter === 'completed' 
                  ? 'bg-primary/10 text-primary' 
                  : 'hover:'
              }`}
              onClick={() => setFilter('completed')}
            >
              Completed ({trips.filter((t) => t.status === 'completed').length})
            </a>
          </div>

          {/* Trips List */}
          {sortedTrips.length === 0 ? (
            <div className="card bg-base-100 shadow-xl card-hover">
              <div className="card-body items-center text-center">
                <MapPin className="h-16 w-16 text-primary mb-4" />
                <h2 className="card-title text-2xl">No Trips Yet</h2>
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
                return (
                  <Link
                    key={trip.id}
                    href={`/trips/${trip.id}`}
                    className={`card shadow-lg card-hover ${
                      trip.status === 'active' 
                        ? 'border-2 border-primary' 
                        : 'bg-base-100'
                    }`}
                    style={trip.status === 'active' ? { 
                      backgroundColor: 'var(--card-bg)',
                      borderColor: 'var(--color-primary)'
                    } : undefined}
                  >
                    <div className="card-body p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <MapPin className={`h-10 w-10 ${
                          trip.status === 'active' ? 'text-primary' : 'text-base-content/50'
                        }`} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-base line-clamp-1">
                              {trip.name}
                            </h3>
                            {trip.status === 'active' && (
                              <div className="badge badge-primary badge-sm">Active</div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-base-content/70 mt-1">
                            <Car className="h-3 w-3" />
                            <span className="line-clamp-1">{vehicle?.name || 'Unknown Vehicle'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-base-content/70 mb-3">
                        <Calendar className="h-3 w-3" />
                        <span>{format(new Date(trip.startDate), 'PP')}</span>
                      </div>
                      <div className="stats stats-vertical shadow-sm bg-base-200/30 w-full">
                        <div className="stat p-2">
                          <div className="stat-figure text-primary">
                            <MapPin className="h-5 w-5" />
                          </div>
                          <div className="stat-title text-xs">Distance</div>
                          <div className="stat-value text-sm">{formatDistance(trip.totalDistance)}</div>
                        </div>
                        <div className="stat p-2">
                          <div className="stat-figure text-secondary">
                            <Battery className="h-5 w-5" />
                          </div>
                          <div className="stat-title text-xs">Energy</div>
                          <div className="stat-value text-sm">{formatEnergy(trip.totalEnergyUsed)}</div>
                        </div>
                        <div className="stat p-2">
                          <div className="stat-figure text-accent">
                            <Zap className="h-5 w-5" />
                          </div>
                          <div className="stat-title text-xs">Efficiency</div>
                          <div className="stat-value text-sm">
                            {trip.averageEfficiency > 0
                              ? `${trip.averageEfficiency.toFixed(2)}`
                              : 'N/A'}
                          </div>
                        </div>
                        <div className="stat p-2">
                          <div className="stat-figure text-success">
                            <MapPin className="h-5 w-5" />
                          </div>
                          <div className="stat-title text-xs">Stops</div>
                          <div className="stat-value text-sm">{trip.stops.length}</div>
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
