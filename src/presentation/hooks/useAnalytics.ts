import { useCallback } from 'react';
import { useAnalyticsStore } from '../stores/analyticsStore';

/**
 * Custom hook for analytics operations
 * Provides a clean API for components to interact with analytics store
 */
export function useAnalytics() {
  // Get store state
  const dateRange = useAnalyticsStore((state) => state.dateRange);
  const activeTab = useAnalyticsStore((state) => state.activeTab);
  const isLoading = useAnalyticsStore((state) => state.isLoading);
  const error = useAnalyticsStore((state) => state.error);

  // Get store actions
  const setDateRange = useAnalyticsStore((state) => state.setDateRange);
  const setPresetRange = useAnalyticsStore((state) => state.setPresetRange);
  const setCustomRange = useAnalyticsStore((state) => state.setCustomRange);
  const setActiveTab = useAnalyticsStore((state) => state.setActiveTab);
  const clearError = useAnalyticsStore((state) => state.clearError);
  const resetDateRange = useAnalyticsStore((state) => state.resetDateRange);

  // Computed values
  const startDate = new Date(dateRange.start);
  const endDate = new Date(dateRange.end);

  // Memoized callbacks
  const handleSetDateRange = useCallback((start: number, end: number) => {
    setDateRange(start, end);
  }, [setDateRange]);

  const handleSetPresetRange = useCallback((preset: 'last7Days' | 'last14Days' | 'last30Days' | 'last3Months' | 'last6Months' | 'lastYear' | 'allTime') => {
    setPresetRange(preset);
  }, [setPresetRange]);

  const handleSetCustomRange = useCallback((start: Date, end: Date) => {
    setCustomRange(start, end);
  }, [setCustomRange]);

  const handleResetDateRange = useCallback(() => {
    resetDateRange();
  }, [resetDateRange]);

  return {
    // State
    dateRange,
    startDate,
    endDate,
    activeTab,
    isLoading,
    error,

    // Actions
    setDateRange: handleSetDateRange,
    setPresetRange: handleSetPresetRange,
    setCustomRange: handleSetCustomRange,
    setActiveTab,
    resetDateRange: handleResetDateRange,
    clearError,
  };
}
