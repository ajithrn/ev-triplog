'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import EditVehicleClient from './EditVehicleClient';

function EditVehicleContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  if (!id) {
    return (
      <div className="text-center py-8">
        <h1 className="text-2xl font-bold text-red-600">Invalid Vehicle ID</h1>
        <p className="mt-2">Please select a vehicle from the vehicles list.</p>
      </div>
    );
  }

  return <EditVehicleClient />;
}

export default function EditVehiclePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><span className="loading loading-spinner loading-lg text-primary"></span></div>}>
      <EditVehicleContent />
    </Suspense>
  );
}
