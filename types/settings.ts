// Settings Types
export interface AppSettings {
  theme: string;
  defaultVehicleId?: string;
  distanceUnit: 'km' | 'miles';
  currency: string;
  dateFormat: 'dd/MM/yyyy' | 'MM/dd/yyyy' | 'yyyy-MM-dd' | 'MMMM d, yyyy' | 'MMM d, yyyy' | 'd MMM yyyy';
  lastBackupDate?: number;
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light',
  distanceUnit: 'km',
  currency: '₹',
  dateFormat: 'dd/MM/yyyy',
};

export const AVAILABLE_THEMES = [
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
