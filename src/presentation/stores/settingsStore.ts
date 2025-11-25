import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { Settings } from '../../core/domain/entities';
import { storageAdapter, STORAGE_KEYS } from '../../infrastructure/storage/storageAdapter';
import { validateSettings } from '../../shared/schemas/validation';

interface SettingsState extends Settings {
  isLoading: boolean;
  error: string | null;
}

interface SettingsActions {
  // Settings operations
  loadSettings: () => void;
  updateTheme: (theme: Settings['theme']) => void;
  updateCurrency: (currency: string) => void;
  updateDistanceUnit: (unit: Settings['distanceUnit']) => void;
  updateDateFormat: (format: Settings['dateFormat']) => void;
  updateTimeFormat: (format: Settings['timeFormat']) => void;
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

            const storedSettings = storageAdapter.get<Settings>(STORAGE_KEYS.SETTINGS);
            
            if (storedSettings) {
              try {
                const validatedSettings = validateSettings(storedSettings);
                set((state) => {
                  Object.assign(state, validatedSettings);
                  state.isLoading = false;
                });
              } catch (error) {
                console.warn('Invalid settings found, using defaults:', error);
                set((state) => {
                  Object.assign(state, DEFAULT_SETTINGS);
                  state.isLoading = false;
                });
              }
            } else {
              set((state) => {
                state.isLoading = false;
              });
            }
          } catch (error) {
            set((state) => {
              state.error = error instanceof Error ? error.message : 'Failed to load settings';
              state.isLoading = false;
            });
          }
        },

        // Update theme
        updateTheme: (theme: Settings['theme']) => {
          try {
            set((state) => {
              state.theme = theme;
              state.error = null;
            });

            const currentSettings = get();
            const settings: Settings = {
              theme: currentSettings.theme,
              currency: currentSettings.currency,
              distanceUnit: currentSettings.distanceUnit,
              dateFormat: currentSettings.dateFormat,
              timeFormat: currentSettings.timeFormat,
            };
            storageAdapter.set(STORAGE_KEYS.SETTINGS, settings);

            // Apply theme to document
            if (typeof window !== 'undefined') {
              if (theme === 'system') {
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
              } else {
                document.documentElement.setAttribute('data-theme', theme);
              }
            }
          } catch (error) {
            set((state) => {
              state.error = error instanceof Error ? error.message : 'Failed to update theme';
            });
            throw error;
          }
        },

        // Update currency
        updateCurrency: (currency: string) => {
          try {
            set((state) => {
              state.currency = currency;
              state.error = null;
            });

            const currentSettings = get();
            const settings: Settings = {
              theme: currentSettings.theme,
              currency: currentSettings.currency,
              distanceUnit: currentSettings.distanceUnit,
              dateFormat: currentSettings.dateFormat,
              timeFormat: currentSettings.timeFormat,
            };
            storageAdapter.set(STORAGE_KEYS.SETTINGS, settings);
          } catch (error) {
            set((state) => {
              state.error = error instanceof Error ? error.message : 'Failed to update currency';
            });
            throw error;
          }
        },

        // Update distance unit
        updateDistanceUnit: (unit: Settings['distanceUnit']) => {
          try {
            set((state) => {
              state.distanceUnit = unit;
              state.error = null;
            });

            const currentSettings = get();
            const settings: Settings = {
              theme: currentSettings.theme,
              currency: currentSettings.currency,
              distanceUnit: currentSettings.distanceUnit,
              dateFormat: currentSettings.dateFormat,
              timeFormat: currentSettings.timeFormat,
            };
            storageAdapter.set(STORAGE_KEYS.SETTINGS, settings);
          } catch (error) {
            set((state) => {
              state.error = error instanceof Error ? error.message : 'Failed to update distance unit';
            });
            throw error;
          }
        },

        // Update date format
        updateDateFormat: (format: Settings['dateFormat']) => {
          try {
            set((state) => {
              state.dateFormat = format;
              state.error = null;
            });

            const currentSettings = get();
            const settings: Settings = {
              theme: currentSettings.theme,
              currency: currentSettings.currency,
              distanceUnit: currentSettings.distanceUnit,
              dateFormat: currentSettings.dateFormat,
              timeFormat: currentSettings.timeFormat,
            };
            storageAdapter.set(STORAGE_KEYS.SETTINGS, settings);
          } catch (error) {
            set((state) => {
              state.error = error instanceof Error ? error.message : 'Failed to update date format';
            });
            throw error;
          }
        },

        // Update time format
        updateTimeFormat: (format: Settings['timeFormat']) => {
          try {
            set((state) => {
              state.timeFormat = format;
              state.error = null;
            });

            const currentSettings = get();
            const settings: Settings = {
              theme: currentSettings.theme,
              currency: currentSettings.currency,
              distanceUnit: currentSettings.distanceUnit,
              dateFormat: currentSettings.dateFormat,
              timeFormat: currentSettings.timeFormat,
            };
            storageAdapter.set(STORAGE_KEYS.SETTINGS, settings);
          } catch (error) {
            set((state) => {
              state.error = error instanceof Error ? error.message : 'Failed to update time format';
            });
            throw error;
          }
        },

        // Update multiple settings at once
        updateSettings: (newSettings: Partial<Settings>) => {
          try {
            set((state) => {
              Object.assign(state, newSettings);
              state.error = null;
            });

            const currentSettings = get();
            const settings: Settings = {
              theme: currentSettings.theme,
              currency: currentSettings.currency,
              distanceUnit: currentSettings.distanceUnit,
              dateFormat: currentSettings.dateFormat,
              timeFormat: currentSettings.timeFormat,
            };
            storageAdapter.set(STORAGE_KEYS.SETTINGS, settings);

            // Apply theme if it was updated
            if (newSettings.theme && typeof window !== 'undefined') {
              if (newSettings.theme === 'system') {
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
              } else {
                document.documentElement.setAttribute('data-theme', newSettings.theme);
              }
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

            storageAdapter.set(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);

            // Apply default theme
            if (typeof window !== 'undefined') {
              const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
              document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
            }
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
export const selectSettings = (state: SettingsStore): Settings => ({
  theme: state.theme,
  currency: state.currency,
  distanceUnit: state.distanceUnit,
  dateFormat: state.dateFormat,
  timeFormat: state.timeFormat,
});
export const selectIsLoading = (state: SettingsStore) => state.isLoading;
export const selectError = (state: SettingsStore) => state.error;
