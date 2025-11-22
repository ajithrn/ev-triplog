import { format as dateFnsFormat } from 'date-fns';
import { AppSettings } from '@/types/settings';

/**
 * Format date based on user settings
 */
export function formatDate(date: Date | number, settings?: AppSettings): string {
  const dateFormat = settings?.dateFormat || 'dd/MM/yyyy';
  return dateFnsFormat(date, dateFormat);
}

/**
 * Format date with time based on user settings
 */
export function formatDateTime(date: Date | number, settings?: AppSettings): string {
  const dateFormat = settings?.dateFormat || 'dd/MM/yyyy';
  return dateFnsFormat(date, `${dateFormat} HH:mm`);
}

/**
 * Format date in long format (e.g., "January 1, 2024")
 */
export function formatDateLong(date: Date | number): string {
  return dateFnsFormat(date, 'PPP');
}

/**
 * Format date and time in long format (e.g., "January 1, 2024 at 10:30 AM")
 */
export function formatDateTimeLong(date: Date | number): string {
  return dateFnsFormat(date, 'PPp');
}
