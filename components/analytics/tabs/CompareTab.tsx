'use client';

import { useTrips, useVehicles, useSettings, useAnalytics } from '@/src/presentation/hooks';
import { ArrowLeftRight, Car, TrendingUp, TrendingDown } from 'lucide-react';
import { filterTripsByDateRange, calculateTripStats, comparePeriods } from '@/utils/analyticsCalculations';
import { formatCurrency } from '@/utils/formatters';
import StatCard from '../shared/StatCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { subMonths } from 'date-fns';

export default function CompareTab() {
  const { trips } = useTrips();
  const { vehicles } = useVehicles();
  const { settings } = useSettings();
  const { dateRange } = useAnalytics();

  const filteredTrips = filterTripsByDateRange(trips, dateRange.start, dateRange.end);
  const completedTrips = filteredTrips.filter((t) => t.status === 'completed');

  if (completedTrips.length === 0) {
    return (
      <div className="card bg-base-200 shadow-xl border border-base-300">
        <div className="card-body items-center text-center">
          <ArrowLeftRight className="h-16 w-16 text-primary mb-4" />
          <h2 className="card-title text-2xl">No Data to Compare</h2>
          <p className="text-base-content/70">Complete some trips to see comparisons.</p>
        </div>
      </div>
    );
  }

  // Calculate previous period for comparison
  const periodLength = dateRange.end - dateRange.start;
  const previousStart = new Date(dateRange.start - periodLength);
  const previousEnd = new Date(dateRange.start);
  const previousTrips = filterTripsByDateRange(trips, previousStart, previousEnd);

  const comparison = comparePeriods(filteredTrips, previousTrips);
  const currentStats = calculateTripStats(filteredTrips);
  const previousStats = calculateTripStats(previousTrips);

  // Vehicle comparison data
  const vehicleComparison = vehicles.map((vehicle) => {
    const vehicleTrips = completedTrips.filter((t) => t.vehicleId === vehicle.id);
    const vehicleStats = calculateTripStats(vehicleTrips);
    const efficiency = vehicleStats.totalDistance > 0 ? vehicleStats.totalDistance / vehicleStats.totalEnergyUsed : 0;
    const costPerKm = vehicleStats.totalDistance > 0 ? vehicleStats.totalChargingCost / vehicleStats.totalDistance : 0;

    return {
      name: vehicle.name,
      trips: vehicleStats.totalTrips,
      distance: vehicleStats.totalDistance,
      efficiency,
      cost: vehicleStats.totalChargingCost,
      costPerKm,
    };
  }).filter(v => v.trips > 0);

  return (
    <div className="space-y-6">
      {/* Period Comparison Stats */}
      <div>
        <h2 className="text-xl font-bold text-base-content mb-3">Period Comparison</h2>
        <p className="text-sm text-base-content/70 mb-4">
          Comparing current period vs. previous period of equal length
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            title="Trips"
            value={currentStats.totalTrips}
            subtitle={`vs ${previousStats.totalTrips} before`}
            icon={Car}
            trend={comparison.tripsChange}
          />
          <StatCard
            title="Distance"
            value={`${currentStats.totalDistance.toFixed(0)} km`}
            subtitle={`vs ${previousStats.totalDistance.toFixed(0)} km`}
            icon={TrendingUp}
            trend={comparison.distanceChange}
          />
          <StatCard
            title="Efficiency"
            value={`${(currentStats.totalDistance / currentStats.totalEnergyUsed).toFixed(2)}`}
            subtitle="km/kWh"
            icon={TrendingUp}
            trend={comparison.efficiencyChange}
          />
          <StatCard
            title="Cost"
            value={formatCurrency(currentStats.totalChargingCost, settings)}
            subtitle={`vs ${formatCurrency(previousStats.totalChargingCost, settings)}`}
            icon={TrendingDown}
            trend={comparison.costChange}
          />
        </div>
      </div>

      {/* Period Comparison Details */}
      <div className="card bg-base-200 shadow-xl border border-base-300">
        <div className="card-body">
          <h3 className="card-title">Period-over-Period Analysis</h3>
          <div className="divider mt-0"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Current Period</h4>
              <div className="space-y-2">
                <div className="flex justify-between p-2 bg-base-300 rounded">
                  <span>Total Trips:</span>
                  <span className="font-bold">{currentStats.totalTrips}</span>
                </div>
                <div className="flex justify-between p-2 bg-base-300 rounded">
                  <span>Total Distance:</span>
                  <span className="font-bold">{currentStats.totalDistance.toFixed(0)} km</span>
                </div>
                <div className="flex justify-between p-2 bg-base-300 rounded">
                  <span>Total Energy:</span>
                  <span className="font-bold">{currentStats.totalEnergyUsed.toFixed(1)} kWh</span>
                </div>
                <div className="flex justify-between p-2 bg-base-300 rounded">
                  <span>Total Cost:</span>
                  <span className="font-bold">{formatCurrency(currentStats.totalChargingCost, settings)}</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Previous Period</h4>
              <div className="space-y-2">
                <div className="flex justify-between p-2 bg-base-300 rounded">
                  <span>Total Trips:</span>
                  <span className="font-bold">{previousStats.totalTrips}</span>
                </div>
                <div className="flex justify-between p-2 bg-base-300 rounded">
                  <span>Total Distance:</span>
                  <span className="font-bold">{previousStats.totalDistance.toFixed(0)} km</span>
                </div>
                <div className="flex justify-between p-2 bg-base-300 rounded">
                  <span>Total Energy:</span>
                  <span className="font-bold">{previousStats.totalEnergyUsed.toFixed(1)} kWh</span>
                </div>
                <div className="flex justify-between p-2 bg-base-300 rounded">
                  <span>Total Cost:</span>
                  <span className="font-bold">{formatCurrency(previousStats.totalChargingCost, settings)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vehicle Comparison */}
      {vehicleComparison.length > 1 && (
        <>
          <div>
            <h2 className="text-xl font-bold text-base-content mb-3">Vehicle Comparison</h2>
            <p className="text-sm text-base-content/70 mb-4">
              Comparing performance across your vehicles for the selected period
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Efficiency Comparison */}
            <div className="card bg-base-200 shadow-xl border border-base-300">
              <div className="card-body">
                <h3 className="card-title">Efficiency Comparison</h3>
                <div className="divider mt-0"></div>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={vehicleComparison}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        borderRadius: '12px',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="efficiency" fill="#10b981" name="Efficiency (km/kWh)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Cost Comparison */}
            <div className="card bg-base-200 shadow-xl border border-base-300">
              <div className="card-body">
                <h3 className="card-title">Cost per km Comparison</h3>
                <div className="divider mt-0"></div>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={vehicleComparison}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        borderRadius: '12px',
                      }}
                      formatter={(value: any) => formatCurrency(value, settings)}
                    />
                    <Legend />
                    <Bar dataKey="costPerKm" fill="#f59e0b" name="Cost per km" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Vehicle Details Table */}
          <div className="card bg-base-200 shadow-xl border border-base-300">
            <div className="card-body">
              <h3 className="card-title">Vehicle Performance Details</h3>
              <div className="divider mt-0"></div>
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Vehicle</th>
                      <th>Trips</th>
                      <th>Distance</th>
                      <th>Efficiency</th>
                      <th>Total Cost</th>
                      <th>Cost/km</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vehicleComparison.map((vehicle, index) => (
                      <tr key={index}>
                        <td className="font-semibold">{vehicle.name}</td>
                        <td>{vehicle.trips}</td>
                        <td>{vehicle.distance.toFixed(0)} km</td>
                        <td>{vehicle.efficiency.toFixed(2)} km/kWh</td>
                        <td>{formatCurrency(vehicle.cost, settings)}</td>
                        <td>{formatCurrency(vehicle.costPerKm, settings)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      {vehicleComparison.length === 1 && (
        <div className="card bg-base-200 shadow-xl border border-base-300">
          <div className="card-body items-center text-center">
            <Car className="h-16 w-16 text-primary mb-4" />
            <h3 className="card-title text-xl">Single Vehicle</h3>
            <p className="text-base-content/70">
              Add more vehicles to see vehicle-to-vehicle comparisons.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
