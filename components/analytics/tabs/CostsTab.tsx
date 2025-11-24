'use client';

import { useTrips } from '@/contexts/TripContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useAnalytics } from '@/contexts/AnalyticsContext';
import { DollarSign, TrendingDown, TrendingUp, Fuel, Clock, Zap, MapPin } from 'lucide-react';
import { filterTripsByDateRange, calculateTripStats, calculateCostPerKmTrend } from '@/utils/analyticsCalculations';
import { calculateICESavings } from '@/utils/analyticsHelpers';
import { formatCurrency } from '@/utils/formatters';
import StatCard from '../shared/StatCard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function CostsTab() {
  const { trips } = useTrips();
  const { settings } = useSettings();
  const { dateRange } = useAnalytics();

  const filteredTrips = filterTripsByDateRange(trips, dateRange.start, dateRange.end);
  const stats = calculateTripStats(filteredTrips);

  if (stats.totalTrips === 0) {
    return (
      <div className="card bg-base-200 shadow-xl border border-base-300">
        <div className="card-body items-center text-center">
          <DollarSign className="h-16 w-16 text-primary mb-4" />
          <h2 className="card-title text-2xl">No Cost Data</h2>
          <p className="text-base-content/70">Complete some trips to see cost analytics.</p>
        </div>
      </div>
    );
  }

  const costPerKm = stats.totalDistance > 0 ? stats.totalChargingCost / stats.totalDistance : 0;
  const costPerKwh = stats.totalEnergyCharged > 0 ? stats.totalChargingCost / stats.totalEnergyCharged : 0;
  const costTrend = calculateCostPerKmTrend(filteredTrips);
  
  // Calculate ICE savings
  const iceSavings = calculateICESavings(stats.totalDistance, stats.totalChargingCost);

  return (
    <div className="space-y-6">
      {/* Cost Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Total Cost"
          value={formatCurrency(stats.totalChargingCost, settings)}
          subtitle={`${dateRange.label.toLowerCase()}`}
          icon={DollarSign}
        />
        <StatCard
          title="Cost per km"
          value={formatCurrency(costPerKm, settings)}
          subtitle="per kilometer"
          icon={TrendingDown}
        />
        <StatCard
          title="Cost per kWh"
          value={formatCurrency(costPerKwh, settings)}
          subtitle="per kilowatt-hour"
          icon={DollarSign}
        />
        <StatCard
          title="Avg per Session"
          value={formatCurrency(stats.totalChargingCost / Math.max(1, stats.totalChargingSessions), settings)}
          subtitle={`${stats.totalChargingSessions} sessions`}
          icon={DollarSign}
        />
      </div>

      {/* Cost per km Trend */}
      <div className="card bg-base-200 shadow-xl border border-base-300">
        <div className="card-body">
          <h3 className="card-title">Cost per Kilometer Trend (by Stretch)</h3>
          <div className="divider mt-0"></div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={costTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                stroke="#6b7280"
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '12px',
                  padding: '12px',
                }}
                content={({ active, payload }: any) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-base-100 p-3 rounded-lg shadow-lg border border-base-300">
                        <p className="font-bold text-base mb-2">{data.date}</p>
                        <p className="text-xs text-base-content/70 mb-2">
                          📍 {data.fromLocation} → {data.toLocation}
                        </p>
                        <div className="space-y-1 text-sm">
                          <p className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-green-500"></span>
                            <span className="font-semibold">Distance:</span>
                            <span>{data.distance.toFixed(1)} km</span>
                          </p>
                          <p className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                            <span className="font-semibold">Energy Used:</span>
                            <span>{data.energyUsed.toFixed(2)} kWh</span>
                          </p>
                          <p className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                            <span className="font-semibold">Est. Cost:</span>
                            <span>{formatCurrency(data.estimatedCost, settings)}</span>
                          </p>
                          <p className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                            <span className="font-semibold">Cost/km:</span>
                            <span>{formatCurrency(data.costPerKm, settings)}</span>
                          </p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="costPerKm"
                stroke="#10b981"
                strokeWidth={3}
                name="Cost per km"
                dot={{ fill: '#10b981', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Savings vs ICE Vehicle */}
      <div className="card bg-base-200 shadow-xl border border-base-300">
        <div className="card-body">
          <h3 className="card-title flex items-center gap-2">
            <Fuel className="h-5 w-5 text-success" />
            Savings vs. Petrol/Diesel Vehicle
          </h3>
          <div className="divider mt-0"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="stat bg-base-300 rounded-lg">
                <div className="stat-title">Your EV Cost</div>
                <div className="stat-value text-success">{formatCurrency(iceSavings.evCost, settings)}</div>
                <div className="stat-desc">Total charging cost</div>
              </div>
              <div className="stat bg-base-300 rounded-lg">
                <div className="stat-title">Equivalent ICE Cost</div>
                <div className="stat-value text-error">{formatCurrency(iceSavings.iceCost, settings)}</div>
                <div className="stat-desc">At ₹100/liter, 15 km/l</div>
              </div>
            </div>
            <div className="flex flex-col justify-center items-center bg-success/10 rounded-lg p-6">
              <div className="text-center">
                <p className="text-sm text-base-content/70 mb-2">Total Savings</p>
                <p className="text-5xl font-bold text-success mb-2">
                  {formatCurrency(iceSavings.savings, settings)}
                </p>
                <p className="text-lg text-success font-semibold">
                  {iceSavings.savingsPercent.toFixed(0)}% saved
                </p>
                <p className="text-sm text-base-content/70 mt-4">
                  You're saving money and the environment!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="card bg-base-200 shadow-xl border border-base-300">
        <div className="card-body">
          <h3 className="card-title">Cost Analysis</h3>
          <div className="divider mt-0"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="stat bg-base-300 rounded-lg">
              <div className="stat-title">Daily Average</div>
              <div className="stat-value text-2xl">
                {formatCurrency(
                  stats.totalChargingCost /
                    Math.max(1, Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24))),
                  settings
                )}
              </div>
              <div className="stat-desc">Average cost per day</div>
            </div>
            <div className="stat bg-base-300 rounded-lg">
              <div className="stat-title">Cost per Trip</div>
              <div className="stat-value text-2xl">
                {formatCurrency(stats.totalChargingCost / Math.max(1, stats.totalTrips), settings)}
              </div>
              <div className="stat-desc">Average per trip</div>
            </div>
            <div className="stat bg-base-300 rounded-lg">
              <div className="stat-title">Projected Monthly</div>
              <div className="stat-value text-2xl">
                {formatCurrency(
                  (stats.totalChargingCost /
                    Math.max(1, Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24)))) *
                    30,
                  settings
                )}
              </div>
              <div className="stat-desc">Based on current usage</div>
            </div>
          </div>
        </div>
      </div>

      {/* Cost Optimization Tips */}
      <div className="card bg-base-200 shadow-xl border border-base-300">
        <div className="card-body">
          <h3 className="card-title flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-primary" />
            Cost Optimization Tips
          </h3>
          <div className="divider mt-0"></div>
          <div className="space-y-3">
            <div className="card bg-base-300 border border-base-content/10">
              <div className="card-body p-4">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-base">Charge During Off-Peak Hours</h4>
                    <p className="text-sm text-base-content/70">Many locations offer lower rates during off-peak hours (typically 10 PM - 6 AM).</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="card bg-base-300 border border-base-content/10">
              <div className="card-body p-4">
                <div className="flex items-start gap-3">
                  <Zap className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-base">Optimize Charging Range</h4>
                    <p className="text-sm text-base-content/70">Charging between 20-80% is often more cost-effective and better for battery health.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="card bg-base-300 border border-base-content/10">
              <div className="card-body p-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-base">Compare Charging Locations</h4>
                    <p className="text-sm text-base-content/70">
                      Check the Charging tab to find your most economical charging locations and use them more frequently.
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
