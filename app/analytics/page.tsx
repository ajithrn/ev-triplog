'use client';

import { useEffect, useState } from 'react';
import { useTrips } from '@/contexts/TripContext';
import { useVehicles } from '@/contexts/VehicleContext';
import { BarChart3, TrendingUp, DollarSign, Battery } from 'lucide-react';
import { format } from 'date-fns';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function AnalyticsPage() {
  const { trips } = useTrips();
  const { vehicles } = useVehicles();
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

  // Calculate statistics
  const totalTrips = completedTrips.length;
  const totalDistance = completedTrips.reduce((sum, t) => sum + t.totalDistance, 0);
  const totalEnergy = completedTrips.reduce((sum, t) => sum + t.totalEnergyUsed, 0);
  const avgEfficiency = totalDistance > 0 ? totalEnergy / totalDistance : 0;

  // Calculate charging costs
  let totalChargingCost = 0;
  let totalChargingSessions = 0;
  completedTrips.forEach((trip) => {
    trip.stops.forEach((stop) => {
      if (stop.chargingSession) {
        totalChargingCost += stop.chargingSession.cost;
        totalChargingSessions++;
      }
    });
  });

  // Prepare chart data
  const efficiencyData = completedTrips
    .sort((a, b) => a.startDate - b.startDate)
    .map((trip) => ({
      date: format(new Date(trip.startDate), 'MMM dd'),
      efficiency: trip.averageEfficiency > 0 ? 1 / trip.averageEfficiency : 0,
      distance: trip.totalDistance,
    }));

  const distanceData = completedTrips
    .sort((a, b) => a.startDate - b.startDate)
    .map((trip) => ({
      date: format(new Date(trip.startDate), 'MMM dd'),
      distance: trip.totalDistance,
      energy: trip.totalEnergyUsed,
    }));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold" style={{ color: 'var(--page-title)' }}>Analytics</h1>
        <p className="mt-1" style={{ color: 'var(--page-subtitle)' }}>View your EV performance trends and statistics</p>
      </div>

      {completedTrips.length === 0 ? (
        <div className="card bg-base-100 shadow-xl card-hover">
          <div className="card-body items-center text-center">
            <BarChart3 className="h-16 w-16 text-primary mb-4" />
            <h2 className="card-title text-2xl">No Data Yet</h2>
            <p className="text-base-content/70">Complete some trips to see analytics and trends</p>
          </div>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="stats stats-vertical lg:stats-horizontal shadow-xl bg-base-100 w-full">
            <div className="stat">
              <div className="flex items-center gap-3 mb-2">
                <BarChart3 className="h-8 w-8 text-primary" />
                <div className="stat-title">Total Trips</div>
              </div>
              <div className="stat-value text-primary">{totalTrips}</div>
            </div>

            <div className="stat">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="h-8 w-8 text-success" />
                <div className="stat-title">Distance</div>
              </div>
              <div className="stat-value text-success">{totalDistance.toFixed(0)}</div>
              <div className="stat-desc">kilometers</div>
            </div>

            <div className="stat">
              <div className="flex items-center gap-3 mb-2">
                <Battery className="h-8 w-8 text-warning" />
                <div className="stat-title">Efficiency</div>
              </div>
              <div className="stat-value text-warning">{avgEfficiency > 0 ? (1 / avgEfficiency).toFixed(2) : '0.00'}</div>
              <div className="stat-desc">km/kWh</div>
            </div>

            <div className="stat">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="h-8 w-8 text-info" />
                <div className="stat-title">Charging</div>
              </div>
              <div className="stat-value text-info">₹{totalChargingCost.toFixed(0)}</div>
              <div className="stat-desc">{totalChargingSessions} sessions</div>
            </div>
          </div>

          {/* Efficiency Trend Chart */}
          <div className="card bg-base-100 shadow-xl card-hover">
            <div className="card-body">
              <h2 className="card-title">Efficiency Trend</h2>
              <div className="divider mt-0"></div>
              <div className=" rounded-xl p-4">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={efficiencyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" stroke="#6b7280" />
                    <YAxis label={{ value: 'km/kWh', angle: -90, position: 'insideLeft' }} stroke="#6b7280" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        borderRadius: '12px',
                        backdropFilter: 'blur(10px)'
                      }} 
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="efficiency"
                      stroke="url(#colorGradient)"
                      strokeWidth={3}
                      name="Efficiency (km/kWh)"
                      dot={{ fill: '#3b82f6', r: 4 }}
                    />
                    <defs>
                      <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                    </defs>
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Distance & Energy Chart */}
          <div className="card bg-base-100 shadow-xl card-hover">
            <div className="card-body">
              <h2 className="card-title">Distance & Energy Usage</h2>
              <div className="divider mt-0"></div>
              <div className=" rounded-xl p-4">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={distanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        borderRadius: '12px',
                        backdropFilter: 'blur(10px)'
                      }} 
                    />
                    <Legend />
                    <Bar dataKey="distance" fill="#10b981" name="Distance (km)" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="energy" fill="#f59e0b" name="Energy (kWh)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Vehicle Breakdown */}
          {vehicles.length > 1 && (
            <div className="card bg-base-100 shadow-xl card-hover">
              <div className="card-body">
                <h2 className="card-title">Vehicle Breakdown</h2>
                <div className="divider mt-0"></div>
                <div className="space-y-4">
                  {vehicles.map((vehicle) => {
                    const vehicleTrips = completedTrips.filter((t) => t.vehicleId === vehicle.id);
                    const vehicleDistance = vehicleTrips.reduce((sum, t) => sum + t.totalDistance, 0);
                    const vehicleEnergy = vehicleTrips.reduce((sum, t) => sum + t.totalEnergyUsed, 0);
                    const vehicleEfficiency = vehicleDistance > 0 ? vehicleEnergy / vehicleDistance : 0;

                    return (
                      <div key={vehicle.id} className="card ">
                        <div className="card-body">
                          <h3 className="card-title text-base">{vehicle.name}</h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-2">
                            <div>
                              <p className="text-base-content/70 mb-1">Trips</p>
                              <p className="font-bold">{vehicleTrips.length}</p>
                            </div>
                            <div>
                              <p className="text-base-content/70 mb-1">Distance</p>
                              <p className="font-bold">{vehicleDistance.toFixed(0)} km</p>
                            </div>
                            <div>
                              <p className="text-base-content/70 mb-1">Energy</p>
                              <p className="font-bold">{vehicleEnergy.toFixed(1)} kWh</p>
                            </div>
                            <div>
                              <p className="text-base-content/70 mb-1">Efficiency</p>
                              <p className="font-bold">{vehicleEfficiency > 0 ? (1 / vehicleEfficiency).toFixed(2) : '0.00'} km/kWh</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
