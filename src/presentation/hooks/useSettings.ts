import { useCallback } from 'react';
import { useSettingsStore } from '../stores/settingsStore';
import type { Settings } from '../../core/domain/entities';

/**
 * Custom hook for settings operations
 * Provides a clean API for components to interact with settings store
 */
export function useSettings() {
  // Get store state
  const theme = useSettingsStore((state) => state.theme);
  const currency = useSettingsStore((state) => state.currency);
  const distanceUnit = useSettingsStore((state) => state.distanceUnit);
  const dateFormat = useSettingsStore((state) => state.dateFormat);
  const timeFormat = useSettingsStore((state) => state.timeFormat);
  const isLoading = useSettingsStore((state) => state.isLoading);
  const error = useSettingsStore((state) => state.error);

  // Get store actions
  const loadSettings = useSettingsStore((state) => state.loadSettings);
  const updateTheme = useSettingsStore((state) => state.updateTheme);
  const updateCurrency = useSettingsStore((state) => state.updateCurrency);
  const updateDistanceUnit = useSettingsStore((state) => state.updateDistanceUnit);
  const updateDateFormat = useSettingsStore((state) => state.updateDateFormat);
  const updateTimeFormat = useSettingsStore((state) => state.updateTimeFormat);
  const updateSettings = useSettingsStore((state) => state.updateSettings);
  const resetSettings = useSettingsStore((state) => state.resetSettings);
  const clearError = useSettingsStore((state) => state.clearError);

  // Computed values
  const settings: Settings = {
    theme,
    currency,
    distanceUnit,
    dateFormat,
    timeFormat,
  };

  // Memoized callbacks
  const handleUpdateTheme = useCallback((newTheme: Settings['theme']) => {
    updateTheme(newTheme);
  }, [updateTheme]);

  const handleUpdateCurrency = useCallback((newCurrency: string) => {
    updateCurrency(newCurrency);
  }, [updateCurrency]);

  const handleUpdateDistanceUnit = useCallback((unit: Settings['distanceUnit']) => {
    updateDistanceUnit(unit);
  }, [updateDistanceUnit]);

  const handleUpdateDateFormat = useCallback((format: Settings['dateFormat']) => {
    updateDateFormat(format);
  }, [updateDateFormat]);

  const handleUpdateTimeFormat = useCallback((format: Settings['timeFormat']) => {
    updateTimeFormat(format);
  }, [updateTimeFormat]);

  const handleUpdateSettings = useCallback((newSettings: Partial<Settings>) => {
    updateSettings(newSettings);
  }, [updateSettings]);

  const handleResetSettings = useCallback(() => {
    resetSettings();
  }, [resetSettings]);

  return {
    // State
    settings,
    theme,
    currency,
    distanceUnit,
    dateFormat,
    timeFormat,
    isLoading,
    error,

    // Actions
    loadSettings,
    updateTheme: handleUpdateTheme,
    updateCurrency: handleUpdateCurrency,
    updateDistanceUnit: handleUpdateDistanceUnit,
    updateDateFormat: handleUpdateDateFormat,
    updateTimeFormat: handleUpdateTimeFormat,
    updateSettings: handleUpdateSettings,
    resetSettings: handleResetSettings,
    clearError,
  };
}
