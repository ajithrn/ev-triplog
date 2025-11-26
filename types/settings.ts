// Settings Types
export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  defaultVehicleId?: string;
  distanceUnit: 'km' | 'miles';
  currency: string;
  dateFormat: 'dd/MM/yyyy' | 'MM/dd/yyyy' | 'yyyy-MM-dd' | 'MMMM d, yyyy' | 'MMM d, yyyy' | 'd MMM yyyy';
  timeFormat: '12h' | '24h';
  lastBackupDate?: number;
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  distanceUnit: 'km',
  currency: '₹',
  dateFormat: 'dd/MM/yyyy',
  timeFormat: '24h',
};

export const AVAILABLE_THEMES = [
  { value: 'system', label: 'Default', description: 'Use system theme' },
  { value: 'light', label: 'Light', description: 'Clean and bright' },
  { value: 'dark', label: 'Dark', description: 'Easy on the eyes' },
];

export interface ImportResult {
  success: boolean;
  message: string;
  vehiclesImported?: number;
  tripsImported?: number;
  errors?: string[];
}
