'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useVehicles } from '@/contexts/VehicleContext';
import { Car, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewVehiclePage() {
  const router = useRouter();
  const { addVehicle } = useVehicles();
  const [formData, setFormData] = useState({
    name: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    batteryCapacity: 0,
    chargingEfficiency: 88, // Default 88% efficiency (12% loss)
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addVehicle(formData);
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
        <h1 className="text-3xl sm:text-4xl font-bold text-white drop-shadow-lg">Add New Vehicle</h1>
        <p className="text-white/80 mt-1">Enter your electric vehicle details</p>
      </div>

      {/* Form */}
      <div className="card glass-card shadow-xl">
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
                Add Vehicle
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
