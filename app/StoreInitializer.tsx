'use client';

import { useEffect } from 'react';
import { initializeStores } from '@/src/presentation/stores';

/**
 * StoreInitializer Component
 * Initializes all Zustand stores on app startup
 * Must be a client component to use useEffect
 */
export default function StoreInitializer() {
  useEffect(() => {
    // Initialize all stores by loading data from localStorage
    initializeStores();
  }, []);

  // This component doesn't render anything
  return null;
}
