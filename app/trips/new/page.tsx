'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTrips } from '@/contexts/TripContext';
import { useVehicles } from '@/contexts/VehicleContext';
import { MapPin, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewTripPage() {
  const router = useRouter();
  const { createTrip, activeTrip } = useTrips();
  const { vehicles } = useVehicles();
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    vehicleId: '',
    odometer: 0,
    batteryPercent: 100,
    location: '',
    notes: '',
  });

  useEffect(() => {
    setMounted(true);
    if (vehicles.length > 0 && !formData.vehicleId) {
      const firstVehicle = vehicles[0];
      setFormData((prev) => ({
        ...prev,
        vehicleId: firstVehicle.id,
      }));
    }
  }, [vehicles, formData.vehicleId]);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // Redirect if there's already an active trip
  if (activeTrip) {
    router.push(`/trips/${activeTrip.id}`);
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { name, vehicleId, batteryPercent, ...stopData } = formData;
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    if (!vehicle) return;
    
    const batteryKwh = (vehicle.batteryCapacity * batteryPercent) / 100;
    
    const trip = createTrip(name, vehicleId, {
      ...stopData,
      batteryPercent,
      batteryKwh,
      timestamp: Date.now(),
    });
    router.push(`/trips/${trip.id}`);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'odometer' || name === 'batteryPercent' ? Number(value) : value,
    }));
  };

  const selectedVehicle = vehicles.find((v) => v.id === formData.vehicleId);

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <Link
          href="/trips"
          className="inline-flex items-center space-x-2 text-white/80 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Trips</span>
        </Link>
        <h1 className="text-3xl sm:text-4xl font-bold text-white drop-shadow-lg">Start New Trip</h1>
        <p className="text-white/80 mt-1">Record your starting point and battery status</p>
      </div>

      {/* Form */}
      <div className="card bg-base-100 glass shadow-xl">
        <div className="card-body">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-control">
              <label htmlFor="name" className="label">
                <span className="label-text font-medium">Trip Name *</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Weekend Trip, Office Commute"
                className="input input-bordered w-full bg-base-200/50"
              />
            </div>

            <div className="form-control">
              <label htmlFor="vehicleId" className="label">
                <span className="label-text font-medium">Select Vehicle *</span>
              </label>
              <select
                id="vehicleId"
                name="vehicleId"
                required
                value={formData.vehicleId}
                onChange={handleChange}
                className="select select-bordered w-full bg-base-200/50"
              >
                <option value="">Choose a vehicle</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.name} ({vehicle.make} {vehicle.model})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-control">
              <label htmlFor="odometer" className="label">
                <span className="label-text font-medium">Starting Odometer (km) *</span>
              </label>
              <input
                type="number"
                id="odometer"
                name="odometer"
                required
                min="0"
                step="0.1"
                value={formData.odometer || ''}
                onChange={handleChange}
                placeholder="e.g., 12345.6"
                className="input input-bordered w-full bg-base-200/50"
              />
            </div>

            <div className="form-control">
              <label htmlFor="batteryPercent" className="label">
                <span className="label-text font-medium">Starting Battery % *</span>
              </label>
              <input
                type="number"
                id="batteryPercent"
                name="batteryPercent"
                required
                min="0"
                max="100"
                step="0.1"
                value={formData.batteryPercent}
                onChange={handleChange}
                className="input input-bordered w-full bg-base-200/50"
              />
              {selectedVehicle && (
                <label className="label">
                  <span className="label-text-alt">
                    Battery capacity: {selectedVehicle.batteryCapacity} kWh • Current: {((selectedVehicle.batteryCapacity * formData.batteryPercent) / 100).toFixed(2)} kWh
                  </span>
                </label>
              )}
            </div>

            <div className="form-control">
              <label htmlFor="location" className="label">
                <span className="label-text font-medium">Starting Location (Optional)</span>
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Home, Office"
                className="input input-bordered w-full bg-base-200/50"
              />
            </div>

            <div className="form-control">
              <label htmlFor="notes" className="label">
                <span className="label-text font-medium">Notes (Optional)</span>
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                value={formData.notes}
                onChange={handleChange}
                placeholder="Any notes about this trip..."
                className="textarea textarea-bordered w-full bg-base-200/50 resize-none"
              />
            </div>

            <div className="divider"></div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                type="submit"
                className="btn btn-primary w-full sm:flex-1 gap-2"
              >
                <MapPin className="h-5 w-5" />
                Start Trip
              </button>
              <Link
                href="/trips"
                className="btn btn-ghost w-full sm:w-auto"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
