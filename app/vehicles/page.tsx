'use client';

import { useEffect, useState } from 'react';
import { useVehicles } from '@/contexts/VehicleContext';
import Link from 'next/link';
import { Car, Plus, Edit, Trash2, Battery } from 'lucide-react';
import { format } from 'date-fns';

export default function VehiclesPage() {
  const { vehicles, deleteVehicle } = useVehicles();
  const [mounted, setMounted] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  const handleDelete = (id: string) => {
    if (deleteConfirm === id) {
      deleteVehicle(id);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold" style={{ color: 'var(--page-title)' }}>Vehicles</h1>
          <p className="mt-1" style={{ color: 'var(--page-subtitle)' }}>Manage your electric vehicles</p>
        </div>
        <Link href="/vehicles/new" className="btn btn-primary shadow-lg hover:shadow-xl">
          <Plus className="h-5 w-5" />
          Add Vehicle
        </Link>
      </div>

      {/* Vehicles Grid */}
      {vehicles.length === 0 ? (
        <div className="card bg-base-100 shadow-xl card-hover">
          <div className="card-body items-center text-center">
            <Car className="h-16 w-16 text-primary mb-4" />
            <h2 className="card-title text-2xl">No Vehicles Yet</h2>
            <p className="text-base-content/70">Add your first electric vehicle to start tracking trips</p>
            <div className="card-actions mt-4">
              <Link href="/vehicles/new" className="btn btn-primary">
                <Plus className="h-5 w-5" />
                Add Vehicle
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => (
            <div key={vehicle.id} className="card bg-base-100 shadow-lg card-hover">
              <div className="card-body">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Car className="h-12 w-12 text-primary" />
                    <div>
                      <h3 className="card-title text-lg">{vehicle.name}</h3>
                      <p className="text-sm text-base-content/70">
                        {vehicle.make} {vehicle.model}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-base-content/70">Year</span>
                    <span className="font-medium">{vehicle.year}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-base-content/70 flex items-center gap-1">
                      <Battery className="h-4 w-4" />
                      Battery Capacity
                    </span>
                    <span className="font-medium">{vehicle.batteryCapacity} kWh</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-base-content/70">Added</span>
                    <span className="font-medium">
                      {format(new Date(vehicle.createdAt), 'PP')}
                    </span>
                  </div>
                </div>

                <div className="divider my-2"></div>

                <div className="card-actions justify-end gap-2">
                  <Link
                    href={`/edit-vehicle?id=${vehicle.id}`}
                    className="btn btn-sm btn-ghost gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(vehicle.id)}
                    className={`btn btn-sm gap-2 ${
                      deleteConfirm === vehicle.id
                        ? 'btn-error'
                        : 'btn-ghost'
                    }`}
                  >
                    <Trash2 className="h-4 w-4" />
                    {deleteConfirm === vehicle.id ? 'Confirm?' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
