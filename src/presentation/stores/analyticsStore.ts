import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { DateRange } from '../../core/domain/entities';
import { startOfMonth, endOfMonth, startOfYear, subMonths } from 'date-fns';

interface AnalyticsState {
  dateRange: DateRange;
  activeTab: string;
  isLoading: boolean;
  error: string | null;
}

interface AnalyticsActions {
  // Date range operations
  setDateRange: (start: number, end: number) => void;
  setPresetRange: (preset: 'last7Days' | 'last14Days' | 'last30Days' | 'last3Months' | 'last6Months' | 'lastYear' | 'allTime') => void;
  setCustomRange: (start: Date, end: Date) => void;
  
  // Tab operations
  setActiveTab: (tab: string) => void;
  
  // Utility
  clearError: () => void;
  resetDateRange: () => void;
}

type AnalyticsStore = AnalyticsState & AnalyticsActions;

// Default date range (last 30 days)
const getDefaultDateRange = (): DateRange => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return {
    start: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).getTime(),
    end: now.getTime(),
    label: 'Last 30 Days',
  };
};

export const useAnalyticsStore = create<AnalyticsStore>()(
  devtools(
    persist(
      immer((set) => ({
        // Initial state
        dateRange: getDefaultDateRange(),
        activeTab: 'overview',
        isLoading: false,
        error: null,

        // Set date range
        setDateRange: (start: number, end: number) => {
          try {
            if (end < start) {
              throw new Error('End date must be after start date');
            }

            set((state) => {
              state.dateRange = { start, end, label: 'Custom Range' };
              state.error = null;
            });
          } catch (error) {
            set((state) => {
              state.error = error instanceof Error ? error.message : 'Failed to set date range';
            });
            throw error;
          }
        },

        // Set preset date range
        setPresetRange: (preset) => {
          try {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            let start: number;
            let end: number;
            let label: string;

            switch (preset) {
              case 'last7Days':
                start = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).getTime();
                end = now.getTime();
                label = 'Last 7 Days';
                break;
              
              case 'last14Days':
                start = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000).getTime();
                end = now.getTime();
                label = 'Last 14 Days';
                break;
              
              case 'last30Days':
                start = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).getTime();
                end = now.getTime();
                label = 'Last 30 Days';
                break;
              
              case 'last3Months':
                start = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000).getTime();
                end = now.getTime();
                label = 'Last 3 Months';
                break;
              
              case 'last6Months':
                start = new Date(today.getTime() - 180 * 24 * 60 * 60 * 1000).getTime();
                end = now.getTime();
                label = 'Last 6 Months';
                break;
              
              case 'lastYear':
                start = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000).getTime();
                end = now.getTime();
                label = 'Last Year';
                break;
              
              case 'allTime':
                start = new Date(2020, 0, 1).getTime(); // Arbitrary old date
                end = now.getTime();
                label = 'All Time';
                break;
              
              default:
                throw new Error('Invalid preset range');
            }

            set((state) => {
              state.dateRange = { start, end, label };
              state.error = null;
            });
          } catch (error) {
            set((state) => {
              state.error = error instanceof Error ? error.message : 'Failed to set preset range';
            });
            throw error;
          }
        },

        // Set custom date range
        setCustomRange: (start: Date, end: Date) => {
          try {
            const startTime = start.getTime();
            const endTime = end.getTime();

            if (endTime < startTime) {
              throw new Error('End date must be after start date');
            }

            set((state) => {
              state.dateRange = { start: startTime, end: endTime, label: 'Custom Range' };
              state.error = null;
            });
          } catch (error) {
            set((state) => {
              state.error = error instanceof Error ? error.message : 'Failed to set custom range';
            });
            throw error;
          }
        },

        // Clear error
        clearError: () => {
          set((state) => {
            state.error = null;
          });
        },

        // Set active tab
        setActiveTab: (tab: string) => {
          set((state) => {
            state.activeTab = tab;
          });
        },

        // Reset to default date range (this month)
        resetDateRange: () => {
          set((state) => {
            state.dateRange = getDefaultDateRange();
            state.error = null;
          });
        },
      })),
      {
        name: 'analytics-storage',
        partialize: (state) => ({
          dateRange: state.dateRange,
          activeTab: state.activeTab,
        }),
      }
    ),
    { name: 'AnalyticsStore' }
  )
);

// Selectors for optimized access
export const selectDateRange = (state: AnalyticsStore) => state.dateRange;
export const selectStartDate = (state: AnalyticsStore) => state.dateRange.start;
export const selectEndDate = (state: AnalyticsStore) => state.dateRange.end;
export const selectActiveTab = (state: AnalyticsStore) => state.activeTab;
export const selectIsLoading = (state: AnalyticsStore) => state.isLoading;
export const selectError = (state: AnalyticsStore) => state.error;

// Helper to check if a timestamp is within the current date range
export const isWithinDateRange = (timestamp: number, dateRange: DateRange): boolean => {
  return timestamp >= dateRange.start && timestamp <= dateRange.end;
};
