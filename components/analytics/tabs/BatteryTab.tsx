'use client';

import { useTrips } from '@/contexts/TripContext';
import { useAnalytics } from '@/contexts/AnalyticsContext';
import { Battery, AlertTriangle, TrendingUp, Activity, Gauge, Shield, Thermometer } from 'lucide-react';
import { filterTripsByDateRange, analyzeBatteryUsage, calculateTripStats } from '@/utils/analyticsCalculations';
import StatCard from '../shared/StatCard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { format } from 'date-fns';

export default function BatteryTab() {
  const { trips } = useTrips();
  const { dateRange } = useAnalytics();

  const filteredTrips = filterTripsByDateRange(trips, dateRange.start, dateRange.end);
  const completedTrips = filteredTrips.filter((t) => t.status === 'completed' && t.stops.length >= 2);

  if (completedTrips.length === 0) {
    return (
      <div className="card bg-base-200 shadow-xl border border-base-300">
        <div className="card-body items-center text-center">
          <Battery className="h-16 w-16 text-primary mb-4" />
          <h2 className="card-title text-2xl">No Battery Data</h2>
          <p className="text-base-content/70">Complete some trips to see battery usage patterns.</p>
        </div>
      </div>
    );
  }

  const batteryUsage = analyzeBatteryUsage(filteredTrips);
  const stats = calculateTripStats(filteredTrips);

  // Prepare battery level trends
  const batteryTrends = completedTrips
    .sort((a, b) => a.startDate - b.startDate)
    .map((trip) => ({
      date: format(new Date(trip.startDate), 'MMM dd'),
      start: trip.stops[0].batteryPercent,
      end: trip.stops[trip.stops.length - 1].batteryPercent,
    }));

  // Calculate range anxiety score (0-100, lower is better)
  const rangeAnxietyScore = Math.max(0, 100 - batteryUsage.averageBuffer * 2);
  const rangeAnxietyLevel =
    rangeAnxietyScore < 30 ? 'Low' : rangeAnxietyScore < 60 ? 'Moderate' : 'High';
  const rangeAnxietyColor =
    rangeAnxietyScore < 30 ? 'text-success' : rangeAnxietyScore < 60 ? 'text-warning' : 'text-error';

  return (
    <div className="space-y-6">
      {/* Battery Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Avg Start Level"
          value={`${batteryUsage.averageStartPercent.toFixed(0)}%`}
          subtitle="battery at trip start"
          icon={Battery}
          iconColor="text-success"
        />
        <StatCard
          title="Avg End Level"
          value={`${batteryUsage.averageEndPercent.toFixed(0)}%`}
          subtitle="battery at trip end"
          icon={Battery}
          iconColor="text-warning"
        />
        <StatCard
          title="Safety Buffer"
          value={`${batteryUsage.averageBuffer.toFixed(0)}%`}
          subtitle="average remaining"
          icon={Activity}
        />
        <StatCard
          title="Lowest End Level"
          value={`${batteryUsage.lowestEndPercent.toFixed(0)}%`}
          subtitle="minimum recorded"
          icon={AlertTriangle}
          iconColor="text-error"
        />
      </div>

      {/* Range Anxiety Score */}
      <div className="card bg-base-200 shadow-xl border border-base-300">
        <div className="card-body">
          <h3 className="card-title">Range Anxiety Score</h3>
          <div className="divider mt-0"></div>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                <div className={`text-6xl font-bold ${rangeAnxietyColor}`}>{rangeAnxietyScore.toFixed(0)}</div>
                <div>
                  <p className="text-2xl font-semibold">{rangeAnxietyLevel}</p>
                  <p className="text-sm text-base-content/70">Anxiety Level</p>
                </div>
              </div>
              <progress
                className={`progress ${
                  rangeAnxietyScore < 30 ? 'progress-success' : rangeAnxietyScore < 60 ? 'progress-warning' : 'progress-error'
                } w-full`}
                value={rangeAnxietyScore}
                max="100"
              ></progress>
            </div>
            <div className="flex-1">
              <div className="space-y-2">
                <div className="alert alert-info">
                  <div className="text-sm">
                    {rangeAnxietyScore < 30 ? (
                      <>
                        <strong>Excellent!</strong> You maintain a healthy battery buffer. You're comfortable with your EV's range.
                      </>
                    ) : rangeAnxietyScore < 60 ? (
                      <>
                        <strong>Good.</strong> You generally maintain adequate battery levels, but occasionally cut it close.
                      </>
                    ) : (
                      <>
                        <strong>Consider planning better.</strong> You often end trips with low battery. Plan more charging stops for peace of mind.
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Battery Level Trends */}
      <div className="card bg-base-200 shadow-xl border border-base-300">
        <div className="card-body">
          <h3 className="card-title">Battery Level Trends</h3>
          <div className="divider mt-0"></div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={batteryTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#6b7280" />
              <YAxis stroke="#6b7280" label={{ value: 'Battery %', angle: -90, position: 'insideLeft' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '12px',
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="start"
                stackId="1"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.6}
                name="Start Level %"
              />
              <Area
                type="monotone"
                dataKey="end"
                stackId="2"
                stroke="#f59e0b"
                fill="#f59e0b"
                fillOpacity={0.6}
                name="End Level %"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Battery Usage Insights */}
      <div className="card bg-base-200 shadow-xl border border-base-300">
        <div className="card-body">
          <h3 className="card-title">Battery Usage Insights</h3>
          <div className="divider mt-0"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="stat bg-base-300 rounded-lg">
              <div className="stat-title">Typical Usage Pattern</div>
              <div className="stat-value text-2xl">
                {batteryUsage.averageStartPercent.toFixed(0)}% → {batteryUsage.averageEndPercent.toFixed(0)}%
              </div>
              <div className="stat-desc">Average battery change per trip</div>
            </div>
            <div className="stat bg-base-300 rounded-lg">
              <div className="stat-title">Battery Utilization</div>
              <div className="stat-value text-2xl">
                {((batteryUsage.averageStartPercent - batteryUsage.averageEndPercent) / batteryUsage.averageStartPercent * 100).toFixed(0)}%
              </div>
              <div className="stat-desc">Of available battery used</div>
            </div>
            <div className="stat bg-base-300 rounded-lg">
              <div className="stat-title">Charging Frequency</div>
              <div className="stat-value text-2xl">
                {stats.totalChargingSessions > 0
                  ? (stats.totalTrips / stats.totalChargingSessions).toFixed(1)
                  : 'N/A'}
              </div>
              <div className="stat-desc">Trips per charging session</div>
            </div>
          </div>
        </div>
      </div>

      {/* Battery Health Tips */}
      <div className="card bg-base-200 shadow-xl border border-base-300">
        <div className="card-body">
          <h3 className="card-title flex items-center gap-2">
            <Battery className="h-5 w-5 text-primary" />
            Battery Health Tips
          </h3>
          <div className="divider mt-0"></div>
          <div className="space-y-3">
            <div className="card bg-base-300 border border-base-content/10">
              <div className="card-body p-4">
                <div className="flex items-start gap-3">
                  <Gauge className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-base">Optimal Charging Range</h4>
                    <p className="text-sm text-base-content/70">
                      Keep your battery between 20-80% for daily use. This extends battery life and maintains optimal performance.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="card bg-base-300 border border-base-content/10">
              <div className="card-body p-4">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-base">Avoid Deep Discharges</h4>
                    <p className="text-sm text-base-content/70">
                      Try not to let your battery drop below 20% regularly. Deep discharges can reduce battery lifespan over time.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="card bg-base-300 border border-base-content/10">
              <div className="card-body p-4">
                <div className="flex items-start gap-3">
                  <Thermometer className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-base">Temperature Awareness</h4>
                    <p className="text-sm text-base-content/70">
                      Extreme temperatures affect battery performance. Park in shade during summer and consider preconditioning in winter.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
