'use client';

import { useTrips, useVehicles, useSettings, useAnalytics } from '@/src/presentation/hooks';
import { BarChart3, TrendingUp, DollarSign, Battery, Activity, Clock, Bolt } from 'lucide-react';
import { format, startOfWeek, startOfMonth } from 'date-fns';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Area, AreaChart, ComposedChart } from 'recharts';
import { formatCurrency } from '@/utils/formatters';
import { filterTripsByDateRange, calculateTripStats, aggregateByPeriod, analyzeChargingPatterns } from '@/utils/analyticsCalculations';
import { generateInsights, getEfficiencyRating, calculateICESavings } from '@/utils/analyticsHelpers';
import StatCard from '../shared/StatCard';
import InsightCard from '../shared/InsightCard';

export default function OverviewTab() {
  const { trips } = useTrips();
  const { vehicles } = useVehicles();
  const { settings } = useSettings();
  const { dateRange } = useAnalytics();

  // Filter trips by date range
  const filteredTrips = filterTripsByDateRange(trips, dateRange.start, dateRange.end);
  const completedTrips = filteredTrips.filter((t) => t.status === 'completed');

  // Calculate statistics
  const stats = calculateTripStats(filteredTrips);
  const avgEfficiency = stats.averageEfficiency > 0 ? 1 / stats.averageEfficiency : 0;

  // Calculate km per % using the same method as dashboard
  const kmPerKwh = avgEfficiency;
  const vehiclesUsed = new Set(completedTrips.map(t => t.vehicleId));
  const avgBatteryCapacity = vehiclesUsed.size > 0
    ? Array.from(vehiclesUsed).reduce((sum, vehicleId) => {
        const vehicle = vehicles.find(v => v.id === vehicleId);
        return sum + (vehicle?.batteryCapacity || 0);
      }, 0) / vehiclesUsed.size
    : 0;
  const kwhPerPercent = avgBatteryCapacity / 100;
  const kmPerPercent = kmPerKwh * kwhPerPercent;

  // Generate insights
  const insights = generateInsights(filteredTrips, settings);

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

  if (completedTrips.length === 0) {
    return (
      <div className="card bg-base-200 shadow-xl border border-base-300">
        <div className="card-body items-center text-center">
          <BarChart3 className="h-16 w-16 text-primary mb-4" />
          <h2 className="card-title text-2xl">No Data for Selected Period</h2>
          <p className="text-base-content/70">
            No completed trips found in the selected time range. Try selecting a different period.
          </p>
        </div>
      </div>
    );
  }

  // Prepare consumption timeline data - show ALL stretches
  const allStretches: Array<{
    period: string;
    fullPeriod: string;
    date: number;
    distance: number;
    energy: number;
    efficiency: number;
    fromLocation: string;
    toLocation: string;
  }> = [];

  completedTrips.forEach((trip) => {
    // Calculate stretches for this trip
    for (let i = 0; i < trip.stops.length - 1; i++) {
      const fromStop = trip.stops[i];
      const toStop = trip.stops[i + 1];
      
      // Calculate stretch metrics
      const startBatteryKwh = fromStop.chargingSession 
        ? fromStop.chargingSession.endKwh 
        : fromStop.batteryKwh;
      
      const distance = toStop.odometer - fromStop.odometer;
      const energyUsed = startBatteryKwh - toStop.batteryKwh;
      const efficiency = energyUsed > 0 ? distance / energyUsed : 0;
      
      allStretches.push({
        period: format(new Date(toStop.timestamp), 'MMM dd'),
        fullPeriod: format(new Date(toStop.timestamp), 'MMM dd HH:mm'),
        date: toStop.timestamp,
        distance: distance,
        energy: energyUsed,
        efficiency: efficiency,
        fromLocation: fromStop.location || 'Unknown',
        toLocation: toStop.location || 'Unknown',
      });
    }
  });

  // Sort by date - show all stretches
  const consumptionData = allStretches
    .sort((a, b) => a.date - b.date);

  // Prepare charging trend data
  const chargingSessions: Array<{
    date: string;
    fullDate: string;
    timestamp: number;
    startPercent: number;
    endPercent: number;
    percentCharged: number;
    cost: number;
    location: string;
    energyAdded: number;
  }> = [];

  completedTrips.forEach((trip) => {
    trip.stops.forEach((stop) => {
      if (stop.chargingSession) {
        const session = stop.chargingSession;
        chargingSessions.push({
          date: format(new Date(stop.timestamp), 'MMM dd'),
          fullDate: format(new Date(stop.timestamp), 'MMM dd HH:mm'),
          timestamp: stop.timestamp,
          startPercent: session.startSoc,
          endPercent: session.endSoc,
          percentCharged: session.endSoc - session.startSoc,
          cost: session.cost,
          location: session.location || stop.location || 'Unknown',
          energyAdded: session.endKwh - session.startKwh,
        });
      }
    });
  });

  // Sort by date
  const chargingTrendData = chargingSessions
    .sort((a, b) => a.timestamp - b.timestamp);

  // Prepare charging cost breakdown
  const chargingPatterns = analyzeChargingPatterns(filteredTrips);
  const costBreakdown = chargingPatterns.slice(0, 5).map((pattern, index) => ({
    name: pattern.location,
    value: pattern.totalCost,
    color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index],
  }));

  // Get efficiency rating
  const efficiencyRating = getEfficiencyRating(avgEfficiency);

  // Calculate savings vs ICE
  const iceSavings = calculateICESavings(stats.totalDistance, stats.totalChargingCost);

  // Recent trips (last 5)
  const recentTrips = completedTrips
    .sort((a, b) => b.startDate - a.startDate)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Circular Gauges - Efficiency, Cost/km, Distance & Energy, Savings */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Efficiency Rating Gauge */}
        <div className="card bg-base-200 shadow-xl border border-base-300">
          <div className="card-body">
            <h2 className="card-title flex items-center gap-2">
              <Battery className="h-5 w-5 text-primary" />
              Efficiency Rating
            </h2>
            <div className="divider mt-0"></div>
            <div className="flex flex-col items-center justify-center gap-[3px]">
              <div className="relative w-40 h-40">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="72"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    className="text-base-300"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="72"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${(avgEfficiency / 10) * 452} 452`}
                    className={efficiencyRating.color}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-[3px]">
                  <p className="text-3xl font-bold leading-none m-0 p-0 flex-grow-0">{avgEfficiency.toFixed(1)}</p>
                  <p className="text-xs text-base-content/70 leading-none m-0 p-0 flex-grow-0">km/kWh</p>
                  {kmPerPercent > 0 && (
                    <p className="text-[10px] text-base-content/60 leading-none m-0 p-0 flex-grow-0">{kmPerPercent.toFixed(1)} km/%</p>
                  )}
                </div>
              </div>
              <div className="text-center">
                <p className={`text-sm font-bold ${efficiencyRating.color}`}>
                  {efficiencyRating.rating}
                </p>
                <p className="text-xs text-base-content/70">{efficiencyRating.description}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Cost per km Gauge */}
        <div className="card bg-base-200 shadow-xl border border-base-300">
          <div className="card-body">
            <h2 className="card-title flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Cost per Kilometer
            </h2>
            <div className="divider mt-0"></div>
            <div className="flex flex-col items-center justify-center gap-[3px]">
              <div className="relative w-40 h-40">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="72"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    className="text-base-300"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="72"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${Math.min((stats.totalChargingCost / stats.totalDistance) / 5, 1) * 452} 452`}
                    className="text-success"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-[3px]">
                  <p className="text-2xl font-bold leading-none m-0 p-0 flex-grow-0">
                    {stats.totalDistance > 0 ? formatCurrency(stats.totalChargingCost / stats.totalDistance, settings) : formatCurrency(0, settings)}
                  </p>
                  <p className="text-xs text-base-content/70 leading-none m-0 p-0 flex-grow-0">per km</p>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-success">
                  Total: {formatCurrency(stats.totalChargingCost, settings)}
                </p>
                <p className="text-xs text-base-content/70">{stats.totalChargingSessions} sessions</p>
              </div>
            </div>
          </div>
        </div>

        {/* Distance & Energy Concentric Gauge */}
        <div className="card bg-base-200 shadow-xl border border-base-300">
          <div className="card-body">
            <h2 className="card-title flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Distance & Energy
            </h2>
            <div className="divider mt-0"></div>
            <div className="flex flex-col items-center justify-center gap-[3px]">
              <div className="relative w-40 h-40">
                <svg className="w-full h-full transform -rotate-90">
                  {/* Outer circle - Distance (background) */}
                  <circle
                    cx="80"
                    cy="80"
                    r="72"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    className="text-base-300"
                  />
                  {/* Outer circle - Distance (progress) */}
                  <circle
                    cx="80"
                    cy="80"
                    r="72"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${Math.min(stats.totalDistance / 1000, 1) * 452} 452`}
                    className="text-info"
                    strokeLinecap="round"
                  />
                  {/* Inner circle - Energy (background) */}
                  <circle
                    cx="80"
                    cy="80"
                    r="52"
                    stroke="currentColor"
                    strokeWidth="10"
                    fill="none"
                    className="text-base-300"
                  />
                  {/* Inner circle - Energy (progress) */}
                  <circle
                    cx="80"
                    cy="80"
                    r="52"
                    stroke="currentColor"
                    strokeWidth="10"
                    fill="none"
                    strokeDasharray={`${Math.min(stats.totalEnergyUsed / 500, 1) * 327} 327`}
                    className="text-warning"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-[3px]">
                  <p className="text-xl font-bold text-info leading-none m-0 p-0 flex-grow-0">{stats.totalDistance.toFixed(0)}</p>
                  <p className="text-[10px] text-base-content/70 leading-none m-0 p-0 flex-grow-0">km</p>
                  <p className="text-lg font-bold text-warning leading-none m-0 p-0 flex-grow-0">{stats.totalEnergyUsed.toFixed(0)}</p>
                  <p className="text-[10px] text-base-content/70 leading-none m-0 p-0 flex-grow-0">kWh</p>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold">{stats.totalTrips} Trips</p>
                <p className="text-xs text-base-content/70">in selected period</p>
              </div>
            </div>
          </div>
        </div>

        {/* Total Savings Gauge */}
        <div className="card bg-base-200 shadow-xl border border-base-300">
          <div className="card-body">
            <h2 className="card-title flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Total Savings
            </h2>
            <div className="divider mt-0"></div>
            <div className="flex flex-col items-center justify-center gap-[3px]">
              <div className="relative w-40 h-40">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="72"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    className="text-base-300"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="72"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${Math.min(iceSavings.savingsPercent / 100, 1) * 452} 452`}
                    className="text-success"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-[3px]">
                  <p className="text-2xl font-bold leading-none m-0 p-0 flex-grow-0">
                    {formatCurrency(iceSavings.savings, settings)}
                  </p>
                  <p className="text-xs text-base-content/70 leading-none m-0 p-0 flex-grow-0">vs petrol</p>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-success">
                  {iceSavings.savingsPercent.toFixed(0)}% Saved
                </p>
                <p className="text-xs text-base-content/70">compared to ICE</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Consumption Timeline */}
      {consumptionData.length > 0 && (
        <div className="card bg-base-200 shadow-xl border border-base-300">
          <div className="card-body">
            <h2 className="card-title flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Consumption Timeline
            </h2>
            <div className="divider mt-0"></div>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={consumptionData} margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
                <defs>
                  <linearGradient id="colorDistance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.2}/>
                  </linearGradient>
                  <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.2}/>
                  </linearGradient>
                  <linearGradient id="colorEfficiency" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="period" 
                  stroke="#6b7280" 
                  angle={-45} 
                  textAnchor="end" 
                  height={80}
                />
                <YAxis 
                  yAxisId="left" 
                  stroke="#10b981" 
                  label={{ value: 'Distance (km) / Energy (kWh)', angle: -90, position: 'insideLeft' }}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  stroke="#8b5cf6" 
                  label={{ value: 'Efficiency (km/kWh)', angle: 90, position: 'insideRight' }}
                />
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
                          <p className="font-bold text-base mb-2">{data.fullPeriod}</p>
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
                              <span className="font-semibold">Energy:</span>
                              <span>{data.energy.toFixed(2)} kWh</span>
                            </p>
                            <p className="flex items-center gap-2">
                              <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                              <span className="font-semibold">Efficiency:</span>
                              <span>{data.efficiency.toFixed(2)} km/kWh</span>
                            </p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="distance"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#colorDistance)"
                  name="Distance (km)"
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="energy"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  fill="url(#colorEnergy)"
                  name="Energy (kWh)"
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="efficiency"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  fill="url(#colorEfficiency)"
                  name="Efficiency (km/kWh)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Charging Trend */}
      {chargingTrendData.length > 0 && (
        <div className="card bg-base-200 shadow-xl border border-base-300">
          <div className="card-body">
            <h2 className="card-title flex items-center gap-2">
              <Bolt className="h-5 w-5 text-primary" />
              Charging Trend
            </h2>
            <div className="divider mt-0"></div>
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart data={chargingTrendData} margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
                <defs>
                  <linearGradient id="colorCharged" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.3}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6b7280" 
                  angle={-45} 
                  textAnchor="end" 
                  height={80}
                />
                <YAxis 
                  yAxisId="left" 
                  stroke="#10b981" 
                  label={{ value: 'Battery % Charged', angle: -90, position: 'insideLeft' }}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  stroke="#ef4444" 
                  label={{ value: `Cost (${settings.currency})`, angle: 90, position: 'insideRight' }}
                />
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
                          <p className="font-bold text-base mb-2">{data.fullDate}</p>
                          <p className="text-xs text-base-content/70 mb-2">📍 {data.location}</p>
                          <div className="space-y-1 text-sm">
                            <p className="flex items-center gap-2">
                              <span className="w-3 h-3 rounded-full bg-green-500"></span>
                              <span className="font-semibold">Charged:</span>
                              <span>{data.startPercent.toFixed(0)}% → {data.endPercent.toFixed(0)}%</span>
                            </p>
                            <p className="flex items-center gap-2">
                              <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                              <span className="font-semibold">Amount:</span>
                              <span>{data.percentCharged.toFixed(1)}% ({data.energyAdded.toFixed(2)} kWh)</span>
                            </p>
                            <p className="flex items-center gap-2">
                              <span className="w-3 h-3 rounded-full bg-red-500"></span>
                              <span className="font-semibold">Cost:</span>
                              <span>{formatCurrency(data.cost, settings)}</span>
                            </p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                <Bar
                  yAxisId="left"
                  dataKey="percentCharged"
                  fill="url(#colorCharged)"
                  name="% Charged"
                  radius={[8, 8, 0, 0]}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="cost"
                  stroke="#ef4444"
                  strokeWidth={2}
                  name={`Cost (${settings.currency})`}
                  dot={{ fill: '#ef4444', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Vehicle Breakdown */}
      {vehicles.length > 1 && (
        <div className="card bg-base-200 shadow-xl border border-base-300">
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
                  <div key={vehicle.id} className="card bg-base-300">
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
                          <p className="font-bold">
                            {vehicleEfficiency > 0 ? (1 / vehicleEfficiency).toFixed(2) : '0.00'} km/kWh
                          </p>
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
    </div>
  );
}
