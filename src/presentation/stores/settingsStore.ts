import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { Settings } from '../../core/domain/entities';
import { settingsRepository } from '../../infrastructure/storage/storageRepository';

interface SettingsState extends Settings {
  isLoading: boolean;
  error: string | null;
}

interface SettingsActions {
  // Settings operations
  loadSettings: () => void;
  updateSettings: (settings: Partial<Settings>) => void;
  resetSettings: () => void;
  
  // Utility
  clearError: () => void;
}

type SettingsStore = SettingsState & SettingsActions;

// Default settings
const DEFAULT_SETTINGS: Settings = {
  theme: 'system',
  currency: '₹',
  distanceUnit: 'km',
  dateFormat: 'dd/MM/yyyy',
  timeFormat: '24h',
  defaultVehicleId: undefined,
  lastBackupDate: undefined,
};

// Helper function to get current settings from store
const getCurrentSettings = (state: SettingsStore): Settings => ({
  theme: state.theme,
  currency: state.currency,
  distanceUnit: state.distanceUnit,
  dateFormat: state.dateFormat,
  timeFormat: state.timeFormat,
  defaultVehicleId: state.defaultVehicleId,
  lastBackupDate: state.lastBackupDate,
});

// Helper function to apply theme to document
const applyTheme = (theme: Settings['theme']) => {
  if (typeof window !== 'undefined') {
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }
};

export const useSettingsStore = create<SettingsStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial state
        ...DEFAULT_SETTINGS,
        isLoading: false,
        error: null,

        // Load settings from storage
        loadSettings: () => {
          try {
            set((state) => {
              state.isLoading = true;
              state.error = null;
            });

            const storedSettings = settingsRepository.get();
            
            if (storedSettings) {
              set((state) => {
                Object.assign(state, storedSettings);
                state.isLoading = false;
              });
              // Apply the loaded theme
              applyTheme(storedSettings.theme);
            } else {
              set((state) => {
                state.isLoading = false;
              });
              // Apply default theme
              applyTheme(DEFAULT_SETTINGS.theme);
            }
          } catch (error) {
            set((state) => {
              state.error = error instanceof Error ? error.message : 'Failed to load settings';
              state.isLoading = false;
            });
          }
        },

        // Update settings (handles all setting updates)
        updateSettings: (newSettings: Partial<Settings>) => {
          try {
            set((state) => {
              Object.assign(state, newSettings);
              state.error = null;
            });

            const currentSettings = getCurrentSettings(get());
            settingsRepository.save(currentSettings);

            // Apply theme if it was updated
            if (newSettings.theme) {
              applyTheme(newSettings.theme);
            }
          } catch (error) {
            set((state) => {
              state.error = error instanceof Error ? error.message : 'Failed to update settings';
            });
            throw error;
          }
        },

        // Reset to default settings
        resetSettings: () => {
          try {
            set((state) => {
              Object.assign(state, DEFAULT_SETTINGS);
              state.error = null;
            });

            settingsRepository.save(DEFAULT_SETTINGS);
            applyTheme(DEFAULT_SETTINGS.theme);
          } catch (error) {
            set((state) => {
              state.error = error instanceof Error ? error.message : 'Failed to reset settings';
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
      })),
      {
        name: 'settings-storage',
        partialize: (state) => ({
          theme: state.theme,
          currency: state.currency,
          distanceUnit: state.distanceUnit,
          dateFormat: state.dateFormat,
          timeFormat: state.timeFormat,
          defaultVehicleId: state.defaultVehicleId,
          lastBackupDate: state.lastBackupDate,
        }),
      }
    ),
    { name: 'SettingsStore' }
  )
);

// Selectors for optimized access
export const selectTheme = (state: SettingsStore) => state.theme;
export const selectCurrency = (state: SettingsStore) => state.currency;
export const selectDistanceUnit = (state: SettingsStore) => state.distanceUnit;
export const selectDateFormat = (state: SettingsStore) => state.dateFormat;
export const selectTimeFormat = (state: SettingsStore) => state.timeFormat;
export const selectSettings = (state: SettingsStore): Settings => getCurrentSettings(state);
export const selectIsLoading = (state: SettingsStore) => state.isLoading;
export const selectError = (state: SettingsStore) => state.error;
