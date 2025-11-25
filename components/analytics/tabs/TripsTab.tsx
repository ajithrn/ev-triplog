'use client';

import { useTrips, useSettings, useAnalytics } from '@/src/presentation/hooks';
import { Trophy, TrendingDown, MapPin, Clock, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { filterTripsByDateRange, getTopTrips, analyzeDrivingPatterns, calculateTripStats } from '@/utils/analyticsCalculations';
import { formatCurrency } from '@/utils/formatters';
import { getEfficiencyRating, calculatePerformanceScore, formatTimeOfDay } from '@/utils/analyticsHelpers';
import StatCard from '../shared/StatCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function TripsTab() {
  const { trips } = useTrips();
  const { settings } = useSettings();
  const { dateRange } = useAnalytics();

  const filteredTrips = filterTripsByDateRange(trips, dateRange.start, dateRange.end);
  const completedTrips = filteredTrips.filter((t) => t.status === 'completed');

  if (completedTrips.length === 0) {
    return (
      <div className="card bg-base-200 shadow-xl border border-base-300">
        <div className="card-body items-center text-center">
          <Trophy className="h-16 w-16 text-primary mb-4" />
          <h2 className="card-title text-2xl">No Trip Data</h2>
          <p className="text-base-content/70">Complete some trips to see performance insights.</p>
        </div>
      </div>
    );
  }

  const stats = calculateTripStats(filteredTrips);
  const topEfficient = getTopTrips(filteredTrips, 'efficiency', 5);
  const topDistance = getTopTrips(filteredTrips, 'distance', 5);
  const drivingPatterns = analyzeDrivingPatterns(filteredTrips);
  const performanceScore = calculatePerformanceScore(stats);

  // Calculate average trip distance
  const avgDistance = stats.totalDistance / stats.totalTrips;

  // Categorize trips by distance
  const shortTrips = completedTrips.filter(t => t.totalDistance < 50).length;
  const mediumTrips = completedTrips.filter(t => t.totalDistance >= 50 && t.totalDistance < 150).length;
  const longTrips = completedTrips.filter(t => t.totalDistance >= 150).length;

  const distanceDistribution = [
    { name: 'Short (<50km)', value: shortTrips, color: '#10b981' },
    { name: 'Medium (50-150km)', value: mediumTrips, color: '#f59e0b' },
    { name: 'Long (>150km)', value: longTrips, color: '#ef4444' },
  ].filter(d => d.value > 0);

  // Time of day data
  const timeOfDayData = drivingPatterns.map(p => ({
    hour: `${p.hour}:00`,
    trips: p.count,
    avgDistance: p.averageDistance,
  }));

  const avgEfficiency = stats.totalDistance > 0 ? stats.totalDistance / stats.totalEnergyUsed : 0;
  const efficiencyRating = getEfficiencyRating(avgEfficiency);

  return (
    <div className="space-y-6">
      {/* Performance KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Performance Score"
          value={performanceScore}
          subtitle="out of 100"
          icon={Trophy}
          iconColor="text-warning"
        />
        <StatCard
          title="Avg Trip Distance"
          value={avgDistance.toFixed(1)}
          subtitle="kilometers"
          icon={MapPin}
        />
        <StatCard
          title="Efficiency Rating"
          value={efficiencyRating.rating}
          subtitle={efficiencyRating.description}
          icon={TrendingDown}
          iconColor={efficiencyRating.color}
        />
        <StatCard
          title="Total Trips"
          value={stats.totalTrips}
          subtitle={`${dateRange.label?.toLowerCase() || 'selected period'}`}
          icon={Calendar}
        />
      </div>

      {/* Trip Leaderboards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Most Efficient Trips */}
        <div className="card bg-base-200 shadow-xl border border-base-300">
          <div className="card-body">
            <h3 className="card-title text-lg flex items-center gap-2">
              <Trophy className="h-5 w-5 text-success" />
              Most Efficient
            </h3>
            <div className="divider mt-0"></div>
            <div className="space-y-2">
              {topEfficient.map((trip, index) => (
                <div key={trip.id} className="flex items-center gap-3 p-2 bg-base-300 rounded-lg">
                  <div className="badge badge-success badge-lg font-bold">{index + 1}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{trip.name}</p>
                    <p className="text-xs text-base-content/70">
                      {format(new Date(trip.startDate), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-success">{trip.efficiencyKmPerKwh.toFixed(2)}</p>
                    <p className="text-xs text-base-content/70">km/kWh</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Longest Trips */}
        <div className="card bg-base-200 shadow-xl border border-base-300">
          <div className="card-body">
            <h3 className="card-title text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5 text-info" />
              Longest Trips
            </h3>
            <div className="divider mt-0"></div>
            <div className="space-y-2">
              {topDistance.map((trip, index) => (
                <div key={trip.id} className="flex items-center gap-3 p-2 bg-base-300 rounded-lg">
                  <div className="badge badge-info badge-lg font-bold">{index + 1}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{trip.name}</p>
                    <p className="text-xs text-base-content/70">
                      {format(new Date(trip.startDate), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-info">{trip.totalDistance.toFixed(0)}</p>
                    <p className="text-xs text-base-content/70">km</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Distance Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card bg-base-200 shadow-xl border border-base-300">
          <div className="card-body">
            <h3 className="card-title">Trip Distance Distribution</h3>
            <div className="divider mt-0"></div>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={distanceDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {distanceDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-3 gap-2 mt-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-success">{shortTrips}</p>
                <p className="text-xs text-base-content/70">Short Trips</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-warning">{mediumTrips}</p>
                <p className="text-xs text-base-content/70">Medium Trips</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-error">{longTrips}</p>
                <p className="text-xs text-base-content/70">Long Trips</p>
              </div>
            </div>
          </div>
        </div>

        {/* Time of Day Analysis */}
        <div className="card bg-base-200 shadow-xl border border-base-300">
          <div className="card-body">
            <h3 className="card-title">Trips by Time of Day</h3>
            <div className="divider mt-0"></div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={timeOfDayData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="hour" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '12px',
                  }}
                />
                <Legend />
                <Bar dataKey="trips" fill="#3b82f6" name="Number of Trips" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Driving Patterns Summary */}
      <div className="card bg-base-200 shadow-xl border border-base-300">
        <div className="card-body">
          <h3 className="card-title">Driving Patterns Summary</h3>
          <div className="divider mt-0"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="stat bg-base-300 rounded-lg">
              <div className="stat-title">Most Active Time</div>
              <div className="stat-value text-2xl">
                {drivingPatterns.length > 0
                  ? formatTimeOfDay(drivingPatterns.reduce((max, p) => (p.count > max.count ? p : max)).hour)
                  : 'N/A'}
              </div>
              <div className="stat-desc">Peak driving period</div>
            </div>
            <div className="stat bg-base-300 rounded-lg">
              <div className="stat-title">Avg Trip Duration</div>
              <div className="stat-value text-2xl">
                {stats.totalTrips > 0 ? Math.round(stats.totalDistance / stats.totalTrips / 60) : 0}h
              </div>
              <div className="stat-desc">Estimated average</div>
            </div>
            <div className="stat bg-base-300 rounded-lg">
              <div className="stat-title">Trip Frequency</div>
              <div className="stat-value text-2xl">
                {(stats.totalTrips / Math.max(1, Math.ceil((dateRange.end - dateRange.start) / (1000 * 60 * 60 * 24)))).toFixed(1)}
              </div>
              <div className="stat-desc">Trips per day</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
