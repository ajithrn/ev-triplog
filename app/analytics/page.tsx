'use client';

import { useEffect, useState } from 'react';
import { AnalyticsProvider } from '@/contexts/AnalyticsContext';
import DateRangeFilter from '@/components/analytics/DateRangeFilter';
import TabNavigation from '@/components/analytics/TabNavigation';
import OverviewTab from '@/components/analytics/tabs/OverviewTab';
import TripsTab from '@/components/analytics/tabs/TripsTab';
import ChargingTab from '@/components/analytics/tabs/ChargingTab';
import CostsTab from '@/components/analytics/tabs/CostsTab';
import BatteryTab from '@/components/analytics/tabs/BatteryTab';
import CompareTab from '@/components/analytics/tabs/CompareTab';
import { useAnalytics } from '@/contexts/AnalyticsContext';

function AnalyticsContent() {
  const { activeTab } = useAnalytics();
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

export default function AnalyticsPage() {
  return (
    <AnalyticsProvider>
      <AnalyticsContent />
    </AnalyticsProvider>
  );
}
