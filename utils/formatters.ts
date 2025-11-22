import { AppSettings } from '@/types/settings';

/**
 * Format currency based on user settings
 */
export function formatCurrency(amount: number, settings?: AppSettings): string {
  const currency = settings?.currency || '₹';
  
  // Format the number with 2 decimal places
  const formattedAmount = amount.toFixed(2);
  
  // Handle different currency formats
  switch (currency) {
    case '$':
    case '€':
    case '£':
    case '¥':
    case '₹':
      return `${currency}${formattedAmount}`;
    case 'AUD':
    case 'CAD':
      return `${currency} ${formattedAmount}`;
    default:
      return `${currency} ${formattedAmount}`;
  }
}

/**
 * Format distance based on user settings
 */
export function formatDistance(distance: number, settings?: AppSettings): string {
  const unit = settings?.distanceUnit || 'km';
  
  // Note: Conversion not implemented yet, just changes the label
  return `${distance.toFixed(1)} ${unit}`;
}

/**
 * Get currency symbol from settings
 */
export function getCurrencySymbol(settings?: AppSettings): string {
  return settings?.currency || '₹';
}

/**
 * Get distance unit from settings
 */
export function getDistanceUnit(settings?: AppSettings): string {
  return settings?.distanceUnit || 'km';
}
