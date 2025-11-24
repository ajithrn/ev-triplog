'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface DateRange {
  start: Date;
  end: Date;
  label: string;
}

interface AnalyticsContextType {
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState<DateRange>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
    end: new Date(),
    label: 'Last 30 days',
  });

  return (
    <AnalyticsContext.Provider
      value={{
        dateRange,
        setDateRange,
        activeTab,
        setActiveTab,
      }}
    >
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
}
