'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import TripDetailsClient from './TripDetailsClient';

function TripDetailsContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  if (!id) {
    return (
      <div className="text-center py-8">
        <h1 className="text-2xl font-bold text-red-600">Invalid Trip ID</h1>
        <p className="mt-2">Please select a trip from the trips list.</p>
      </div>
    );
  }

  return <TripDetailsClient />;
}

export default function TripDetailsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><span className="loading loading-spinner loading-lg text-primary"></span></div>}>
      <TripDetailsContent />
    </Suspense>
  );
}
