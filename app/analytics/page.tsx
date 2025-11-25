'use client';

import { useAnalytics } from '@/src/presentation/hooks';
import DateRangeFilter from '@/components/analytics/DateRangeFilter';
import TabNavigation from '@/components/analytics/TabNavigation';
import OverviewTab from '@/components/analytics/tabs/OverviewTab';
import TripsTab from '@/components/analytics/tabs/TripsTab';
import ChargingTab from '@/components/analytics/tabs/ChargingTab';
import CostsTab from '@/components/analytics/tabs/CostsTab';
import BatteryTab from '@/components/analytics/tabs/BatteryTab';
import CompareTab from '@/components/analytics/tabs/CompareTab';
import { LoadingSkeleton } from '@/components/shared';

export default function AnalyticsPage() {
  const { activeTab, isLoading } = useAnalytics();

  if (isLoading) {
    return <LoadingSkeleton type="card" count={3} />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold text-base-content">Analytics</h1>
        <p className="mt-1 text-base-content/70">
          Comprehensive insights into your EV performance and usage patterns
        </p>
      </div>

      {/* Date Range Filter */}
      <DateRangeFilter />

      {/* Tab Navigation */}
      <TabNavigation />

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'trips' && <TripsTab />}
        {activeTab === 'charging' && <ChargingTab />}
        {activeTab === 'costs' && <CostsTab />}
        {activeTab === 'battery' && <BatteryTab />}
        {activeTab === 'compare' && <CompareTab />}
      </div>
    </div>
  );
}
