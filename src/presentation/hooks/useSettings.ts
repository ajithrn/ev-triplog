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
  const defaultVehicleId = useSettingsStore((state) => state.defaultVehicleId);
  const lastBackupDate = useSettingsStore((state) => state.lastBackupDate);
  const isLoading = useSettingsStore((state) => state.isLoading);
  const error = useSettingsStore((state) => state.error);

  // Get store actions
  const loadSettings = useSettingsStore((state) => state.loadSettings);
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
    defaultVehicleId,
    lastBackupDate,
  };

  // Memoized callbacks for convenience methods
  const handleUpdateTheme = useCallback((newTheme: Settings['theme']) => {
    updateSettings({ theme: newTheme });
  }, [updateSettings]);

  const handleUpdateCurrency = useCallback((newCurrency: string) => {
    updateSettings({ currency: newCurrency });
  }, [updateSettings]);

  const handleUpdateDistanceUnit = useCallback((unit: Settings['distanceUnit']) => {
    updateSettings({ distanceUnit: unit });
  }, [updateSettings]);

  const handleUpdateDateFormat = useCallback((format: Settings['dateFormat']) => {
    updateSettings({ dateFormat: format });
  }, [updateSettings]);

  const handleUpdateTimeFormat = useCallback((format: Settings['timeFormat']) => {
    updateSettings({ timeFormat: format });
  }, [updateSettings]);

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
    defaultVehicleId,
    lastBackupDate,
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
