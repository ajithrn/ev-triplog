'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useVehicles } from '@/contexts/VehicleContext';
import { Car, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function EditVehiclePage() {
  const params = useParams();
  const router = useRouter();
  const { vehicles, updateVehicle } = useVehicles();
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    batteryCapacity: 0,
    chargingEfficiency: 88,
  });

  useEffect(() => {
    setMounted(true);
    const vehicle = vehicles.find((v) => v.id === params.id);
    if (vehicle) {
      setFormData({
        name: vehicle.name,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        batteryCapacity: vehicle.batteryCapacity,
        chargingEfficiency: vehicle.chargingEfficiency || 88,
      });
    }
  }, [vehicles, params.id]);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  const vehicle = vehicles.find((v) => v.id === params.id);

  if (!vehicle) {
    return (
      <div className="card bg-base-100 glass shadow-xl max-w-md mx-auto mt-12">
        <div className="card-body items-center text-center">
          <h2 className="card-title">Vehicle not found</h2>
          <div className="card-actions mt-4">
            <Link href="/vehicles" className="btn btn-primary">
              Back to Vehicles
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateVehicle(params.id as string, formData);
    router.push('/vehicles');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ['year', 'batteryCapacity', 'chargingEfficiency'].includes(name) ? Number(value) : value,
    }));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <Link
          href="/vehicles"
          className="btn btn-ghost btn-sm gap-2 text-white/80 hover:text-white mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Vehicles
        </Link>
        <h1 className="text-3xl sm:text-4xl font-bold text-white drop-shadow-lg">Edit Vehicle</h1>
        <p className="text-white/80 mt-1">Update your vehicle details</p>
      </div>

      {/* Form */}
      <div className="card bg-base-100 glass shadow-xl">
        <div className="card-body">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Vehicle Name *</span>
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., My Tesla Model 3"
                className="input input-bordered w-full bg-base-200/50"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Make *</span>
                </label>
                <input
                  type="text"
                  name="make"
                  required
                  value={formData.make}
                  onChange={handleChange}
                  placeholder="e.g., Tesla"
                  className="input input-bordered w-full bg-base-200/50"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Model *</span>
                </label>
                <input
                  type="text"
                  name="model"
                  required
                  value={formData.model}
                  onChange={handleChange}
                  placeholder="e.g., Model 3"
                  className="input input-bordered w-full bg-base-200/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Year *</span>
                </label>
                <input
                  type="number"
                  name="year"
                  required
                  min="2000"
                  max={new Date().getFullYear() + 1}
                  value={formData.year}
                  onChange={handleChange}
                  className="input input-bordered w-full bg-base-200/50"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Battery Capacity (kWh) *</span>
                </label>
                <input
                  type="number"
                  name="batteryCapacity"
                  required
                  min="1"
                  step="0.1"
                  value={formData.batteryCapacity || ''}
                  onChange={handleChange}
                  placeholder="e.g., 75"
                  className="input input-bordered w-full bg-base-200/50"
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Charging Efficiency (%) *</span>
              </label>
              <input
                type="number"
                name="chargingEfficiency"
                required
                min="70"
                max="100"
                step="0.1"
                value={formData.chargingEfficiency || ''}
                onChange={handleChange}
                className="input input-bordered w-full bg-base-200/50"
              />
              <label className="label">
                <span className="label-text-alt">
                  Typical: 85-90%. For a {formData.batteryCapacity || 53} kWh battery at {formData.chargingEfficiency}% efficiency, 
                  full charge requires ~{formData.batteryCapacity && formData.chargingEfficiency ? (formData.batteryCapacity / (formData.chargingEfficiency / 100)).toFixed(1) : '60'} kWh from charger
                </span>
              </label>
            </div>

            <div className="divider"></div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                type="submit"
                className="btn btn-primary w-full sm:flex-1 gap-2"
              >
                <Car className="h-5 w-5" />
                Update Vehicle
              </button>
              <Link
                href="/vehicles"
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
