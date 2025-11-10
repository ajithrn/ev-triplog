'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTrips } from '@/contexts/TripContext';
import { useVehicles } from '@/contexts/VehicleContext';
import Link from 'next/link';
import {
  ArrowLeft,
  MapPin,
  Plus,
  Battery,
  Zap,
  CheckCircle,
  Download,
  Trash2,
  DollarSign,
} from 'lucide-react';
import { format } from 'date-fns';
import {
  calculateTripStretches,
  formatDistance,
  formatEnergy,
} from '@/utils/calculations';
import { exportTripToCSV, exportTripToPDF } from '@/utils/export';
import StopForm from '@/components/trip-details/StopForm';
import StopCard from '@/components/trip-details/StopCard';

export default function TripDetailsClient() {
  const params = useParams();
  const router = useRouter();
  const { trips, getTripById, completeTrip, deleteTrip } = useTrips();
  const { vehicles } = useVehicles();
  const [mounted, setMounted] = useState(false);
  const [showAddStop, setShowAddStop] = useState(false);
  const [editingStop, setEditingStop] = useState<string | null>(null);
  const [showAddCharging, setShowAddCharging] = useState<string | null>(null);
  const [editingCharging, setEditingCharging] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteStopConfirm, setDeleteStopConfirm] = useState<string | null>(null);

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

  const trip = getTripById(params.id as string);
  
  if (!trip) {
    return (
      <div className="card bg-base-100 shadow-xl max-w-md mx-auto mt-12">
        <div className="card-body items-center text-center">
          <h2 className="card-title">Trip not found</h2>
          <div className="card-actions mt-4">
            <Link href="/trips" className="btn btn-primary">
              Back to Trips
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const vehicle = vehicles.find((v) => v.id === trip.vehicleId);
  const stretches = calculateTripStretches(trip.stops);
  
  // Calculate total charging cost
  const totalChargingCost = trip.stops.reduce((sum, stop) => {
    return sum + (stop.chargingSession?.cost || 0);
  }, 0);

  // Format trip date range
  const firstStop = trip.stops[0];
  const lastStop = trip.stops[trip.stops.length - 1];
  const tripDateRange = trip.status === 'completed' && trip.stops.length > 1
    ? `${format(new Date(firstStop.timestamp), 'MMM d')} - ${format(new Date(lastStop.timestamp), 'MMM d, yyyy')}`
    : format(new Date(trip.startDate), 'PPP');

  const handleCompleteTrip = () => {
    completeTrip(trip.id);
    router.push('/trips');
  };

  const handleDeleteTrip = () => {
    if (deleteConfirm) {
      deleteTrip(trip.id);
      router.push('/trips');
    } else {
      setDeleteConfirm(true);
      setTimeout(() => setDeleteConfirm(false), 3000);
    }
  };

  const handleDeleteStop = (stopId: string) => {
    if (deleteStopConfirm === stopId) {
      const { deleteStop } = useTrips();
      deleteStop(trip.id, stopId);
      setDeleteStopConfirm(null);
    } else {
      setDeleteStopConfirm(stopId);
      setTimeout(() => setDeleteStopConfirm(null), 3000);
    }
  };

  const handleExportCSV = () => {
    if (vehicle) {
      exportTripToCSV(trip, vehicle);
    }
  };

  const handleExportPDF = () => {
    if (vehicle) {
      exportTripToPDF(trip, vehicle);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <Link
          href="/trips"
          className="btn btn-ghost btn-sm gap-2 mb-4"
          style={{ color: 'var(--page-subtitle)' }}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Trips
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl sm:text-4xl font-bold" style={{ color: 'var(--page-title)' }}>{trip.name}</h1>
              {trip.status === 'active' && (
                <span className="badge badge-primary badge-lg">Active</span>
              )}
            </div>
            <p className="mt-1" style={{ color: 'var(--page-subtitle)' }}>
              {vehicle?.name} • {tripDateRange}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {trip.status === 'completed' && (
              <>
                <button
                  onClick={handleExportCSV}
                  className="btn btn-ghost gap-2"
                >
                  <Download className="h-4 w-4" />
                  CSV
                </button>
                <button
                  onClick={handleExportPDF}
                  className="btn btn-ghost gap-2"
                >
                  <Download className="h-4 w-4" />
                  PDF
                </button>
              </>
            )}
            {trip.status === 'active' && (
              <button
                onClick={handleCompleteTrip}
                className="btn btn-success gap-2"
              >
                <CheckCircle className="h-5 w-5" />
                Complete Trip
              </button>
            )}
            <button
              onClick={handleDeleteTrip}
              className={`btn gap-2 ${
                deleteConfirm
                  ? 'btn-error'
                  : 'btn-ghost'
              }`}
            >
              <Trash2 className="h-4 w-4" />
              {deleteConfirm ? 'Confirm?' : 'Delete'}
            </button>
          </div>
        </div>
      </div>

      {/* Trip Summary */}
      <div className="stats stats-vertical lg:stats-horizontal shadow-xl bg-base-100 w-full">
        <div className="stat">
          <div className="flex items-center gap-3 mb-2">
            <MapPin className="h-8 w-8 text-primary" />
            <div className="stat-title">Distance</div>
          </div>
          <div className="stat-value">{trip.totalDistance.toFixed(1)}</div>
          <div className="stat-desc">kilometers</div>
        </div>

        <div className="stat">
          <div className="flex items-center gap-3 mb-2">
            <Battery className="h-8 w-8 text-secondary" />
            <div className="stat-title">Energy</div>
          </div>
          <div className="stat-value">{trip.totalEnergyUsed.toFixed(2)}</div>
          <div className="stat-desc">kWh consumed</div>
        </div>

        <div className="stat">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="h-8 w-8 text-accent" />
            <div className="stat-title">Efficiency</div>
          </div>
          <div className="stat-value">
            {trip.averageEfficiency > 0 ? (1 / trip.averageEfficiency).toFixed(2) : 'N/A'}
          </div>
          <div className="stat-desc">km/kWh</div>
        </div>

        <div className="stat">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="h-8 w-8 text-warning" />
            <div className="stat-title">Charging Cost</div>
          </div>
          <div className="stat-value">${totalChargingCost.toFixed(2)}</div>
          <div className="stat-desc">total cost</div>
        </div>

        <div className="stat">
          <div className="flex items-center gap-3 mb-2">
            <MapPin className="h-8 w-8 text-success" />
            <div className="stat-title">Stops</div>
          </div>
          <div className="stat-value">{trip.stops.length}</div>
          <div className="stat-desc">total stops</div>
        </div>
      </div>

      {/* Add Stop Button */}
      {trip.status === 'active' && !showAddStop && (
        <button
          onClick={() => setShowAddStop(true)}
          className="btn btn-primary w-full gap-2"
        >
          <Plus className="h-5 w-5" />
          Add Stop
        </button>
      )}

      {/* Add Stop Form */}
      {showAddStop && <StopForm tripId={trip.id} onCancel={() => setShowAddStop(false)} />}

      {/* Stops Timeline */}
      <div className="space-y-6">
        {[...trip.stops].reverse().map((stop, reverseIndex) => {
          const index = trip.stops.length - 1 - reverseIndex;
          const stretch = index > 0 ? stretches[index - 1] : null;
          const isEditing = editingStop === stop.id;
          
          return (
            <div key={stop.id}>
              {/* Stretch Info */}
              {stretch && (
                <div className="card bg-base-100 shadow-lg mb-4">
                  <div className="card-body">
                    <h4 className="card-title text-sm">Stretch {index}</h4>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      <div className=" rounded-lg p-3">
                        <p className="text-xs opacity-70 mb-1">Distance</p>
                        <p className="font-semibold">{formatDistance(stretch.distance)}</p>
                      </div>
                      <div className=" rounded-lg p-3">
                        <p className="text-xs opacity-70 mb-1">Energy Used</p>
                        <p className="font-semibold">{formatEnergy(stretch.energyUsed)}</p>
                      </div>
                      <div className=" rounded-lg p-3">
                        <p className="text-xs opacity-70 mb-1">kWh/km</p>
                        <p className="font-semibold">{stretch.efficiencyKwhPerKm.toFixed(3)}</p>
                      </div>
                      <div className=" rounded-lg p-3">
                        <p className="text-xs opacity-70 mb-1">km/kWh</p>
                        <p className="font-semibold">{stretch.efficiencyKmPerKwh.toFixed(2)}</p>
                      </div>
                      <div className=" rounded-lg p-3">
                        <p className="text-xs opacity-70 mb-1">km per %</p>
                        <p className="font-semibold">{stretch.kmPerPercent.toFixed(2)} km</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Stop Card */}
              {isEditing ? (
                <StopForm
                  tripId={trip.id}
                  stop={stop}
                  onCancel={() => setEditingStop(null)}
                />
              ) : (
                <StopCard
                  stop={stop}
                  index={index}
                  tripId={trip.id}
                  showAddCharging={showAddCharging === stop.id}
                  editingCharging={editingCharging === stop.id}
                  onShowAddCharging={() => setShowAddCharging(stop.id)}
                  onHideAddCharging={() => setShowAddCharging(null)}
                  onEditCharging={() => setEditingCharging(stop.id)}
                  onCancelEditCharging={() => setEditingCharging(null)}
                  onEdit={() => setEditingStop(stop.id)}
                  onDelete={() => handleDeleteStop(stop.id)}
                  deleteConfirm={deleteStopConfirm === stop.id}
                  isActive={trip.status === 'active'}
                  isFirstStop={index === 0}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
