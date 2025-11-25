'use client';

import { useTrips, useSettings, useAnalytics } from '@/src/presentation/hooks';
import { Zap, MapPin, Clock, DollarSign } from 'lucide-react';
import { filterTripsByDateRange, analyzeChargingPatterns, calculateTripStats } from '@/utils/analyticsCalculations';
import { formatCurrency } from '@/utils/formatters';
import StatCard from '../shared/StatCard';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';

export default function ChargingTab() {
  const { trips } = useTrips();
  const { settings } = useSettings();
  const { dateRange } = useAnalytics();

  const filteredTrips = filterTripsByDateRange(trips, dateRange.start, dateRange.end);
  const stats = calculateTripStats(filteredTrips);
  const chargingPatterns = analyzeChargingPatterns(filteredTrips);

  if (stats.totalChargingSessions === 0) {
    return (
      <div className="card bg-base-200 shadow-xl border border-base-300">
        <div className="card-body items-center text-center">
          <Zap className="h-16 w-16 text-primary mb-4" />
          <h2 className="card-title text-2xl">No Charging Data</h2>
          <p className="text-base-content/70">Add charging sessions to see charging analytics.</p>
        </div>
      </div>
    );
  }

  const avgCostPerSession = stats.totalChargingCost / stats.totalChargingSessions;
  const avgEnergyPerSession = stats.totalEnergyCharged / stats.totalChargingSessions;
  const costPerKwh = stats.totalEnergyCharged > 0 ? stats.totalChargingCost / stats.totalEnergyCharged : 0;

  // Prepare chart data
  const locationData = chargingPatterns.map(p => ({
    name: p.location,
    sessions: p.count,
    cost: p.totalCost,
    avgCost: p.averageCost,
  }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-6">
      {/* Charging Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Total Sessions"
          value={stats.totalChargingSessions}
          subtitle={`${dateRange.label?.toLowerCase() || 'selected period'}`}
          icon={Zap}
        />
        <StatCard
          title="Total Cost"
          value={formatCurrency(stats.totalChargingCost, settings)}
          subtitle="all sessions"
          icon={DollarSign}
        />
        <StatCard
          title="Avg Cost/Session"
          value={formatCurrency(avgCostPerSession, settings)}
          subtitle="per session"
          icon={DollarSign}
        />
        <StatCard
          title="Cost per kWh"
          value={formatCurrency(costPerKwh, settings)}
          subtitle="per kilowatt-hour"
          icon={Zap}
        />
      </div>

      {/* Charging Locations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card bg-base-200 shadow-xl border border-base-300">
          <div className="card-body">
            <h3 className="card-title">Charging by Location</h3>
            <div className="divider mt-0"></div>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={locationData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="sessions"
                >
                  {locationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card bg-base-200 shadow-xl border border-base-300">
          <div className="card-body">
            <h3 className="card-title">Cost by Location</h3>
            <div className="divider mt-0"></div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={locationData}>
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
                <Bar dataKey="avgCost" fill="#10b981" name="Avg Cost" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charging Locations List */}
      <div className="card bg-base-200 shadow-xl border border-base-300">
        <div className="card-body">
          <h3 className="card-title">Charging Location Details</h3>
          <div className="divider mt-0"></div>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Location</th>
                  <th>Sessions</th>
                  <th>Total Cost</th>
                  <th>Avg Cost</th>
                  <th>Total Energy</th>
                </tr>
              </thead>
              <tbody>
                {chargingPatterns.map((pattern, index) => (
                  <tr key={index}>
                    <td className="font-semibold">{pattern.location}</td>
                    <td>{pattern.count}</td>
                    <td>{formatCurrency(pattern.totalCost, settings)}</td>
                    <td>{formatCurrency(pattern.averageCost, settings)}</td>
                    <td>{pattern.totalEnergy.toFixed(1)} kWh</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Charging Insights */}
      <div className="card bg-base-200 shadow-xl border border-base-300">
        <div className="card-body">
          <h3 className="card-title">Charging Insights</h3>
          <div className="divider mt-0"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="stat bg-base-300 rounded-lg">
              <div className="stat-title">Most Used Location</div>
              <div className="stat-value text-xl">
                {chargingPatterns.length > 0 ? chargingPatterns[0].location : 'N/A'}
              </div>
              <div className="stat-desc">{chargingPatterns.length > 0 ? `${chargingPatterns[0].count} sessions` : ''}</div>
            </div>
            <div className="stat bg-base-300 rounded-lg">
              <div className="stat-title">Cheapest Location</div>
              <div className="stat-value text-xl">
                {chargingPatterns.length > 0
                  ? chargingPatterns.reduce((min, p) => (p.averageCost < min.averageCost ? p : min)).location
                  : 'N/A'}
              </div>
              <div className="stat-desc">
                {chargingPatterns.length > 0
                  ? formatCurrency(
                      chargingPatterns.reduce((min, p) => (p.averageCost < min.averageCost ? p : min)).averageCost,
                      settings
                    )
                  : ''}
              </div>
            </div>
            <div className="stat bg-base-300 rounded-lg">
              <div className="stat-title">Avg Energy Added</div>
              <div className="stat-value text-xl">{avgEnergyPerSession.toFixed(1)} kWh</div>
              <div className="stat-desc">Per charging session</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
