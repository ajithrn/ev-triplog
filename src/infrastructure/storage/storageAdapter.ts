// Low-level storage operations with error handling
const STORAGE_KEYS = {
  VEHICLES: 'ev-triplog-vehicles',
  TRIPS: 'ev-triplog-trips',
  SETTINGS: 'ev-triplog-settings',
} as const;

export class StorageAdapter {
  private isAvailable(): boolean {
    if (typeof window === 'undefined') return false;
    
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  get<T>(key: string): T | null {
    if (!this.isAvailable()) {
      console.warn('localStorage is not available');
      return null;
    }

    try {
      const item = localStorage.getItem(key);
      if (!item) return null;
      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`Error reading from localStorage (${key}):`, error);
      return null;
    }
  }

  set<T>(key: string, data: T): boolean {
    if (!this.isAvailable()) {
      console.warn('localStorage is not available');
      return false;
    }

    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        console.error('Storage quota exceeded. Please clear some data.');
      } else {
        console.error(`Error saving to localStorage (${key}):`, error);
      }
      return false;
    }
  }

  remove(key: string): boolean {
    if (!this.isAvailable()) {
      console.warn('localStorage is not available');
      return false;
    }

    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing from localStorage (${key}):`, error);
      return false;
    }
  }

  clear(): boolean {
    if (!this.isAvailable()) {
      console.warn('localStorage is not available');
      return false;
    }

    try {
      // Only clear our app's keys
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  }

  getStorageInfo(): { used: number; available: number; percentage: number } {
    if (!this.isAvailable()) {
      return { used: 0, available: 0, percentage: 0 };
    }

    try {
      let used = 0;
      Object.values(STORAGE_KEYS).forEach(key => {
        const item = localStorage.getItem(key);
        if (item) {
          used += new Blob([item]).size;
        }
      });

      // Most browsers allow 5-10MB, we'll assume 5MB
      const available = 5 * 1024 * 1024;
      const percentage = (used / available) * 100;

      return { used, available, percentage };
    } catch (error) {
      console.error('Error getting storage info:', error);
      return { used: 0, available: 0, percentage: 0 };
    }
  }
}

export const storageAdapter = new StorageAdapter();
export { STORAGE_KEYS };
