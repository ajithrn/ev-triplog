'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTrips } from '@/contexts/TripContext';
import { useVehicles } from '@/contexts/VehicleContext';
import { useSettings } from '@/contexts/SettingsContext';
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
  Edit,
  X,
  AlertCircle,
} from 'lucide-react';
import {
  calculateTripStretches,
  formatDistance,
  formatEnergy,
} from '@/utils/calculations';
import { exportTripToCSV, exportTripToPDF } from '@/utils/export';
import { formatCurrency } from '@/utils/formatters';
import { formatDate } from '@/utils/dateFormatters';
import StopForm from '@/components/trip-details/StopForm';
import StopCard from '@/components/trip-details/StopCard';

export default function TripDetailsClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { trips, getTripById, completeTrip, reopenTrip, deleteTrip } = useTrips();
  const { vehicles } = useVehicles();
  const { settings } = useSettings();
  const [mounted, setMounted] = useState(false);
  const [showAddStop, setShowAddStop] = useState(false);
  const [editingStop, setEditingStop] = useState<string | null>(null);
  const [showAddCharging, setShowAddCharging] = useState<string | null>(null);
  const [editingCharging, setEditingCharging] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteStopConfirm, setDeleteStopConfirm] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showRedirectNotification, setShowRedirectNotification] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if redirected from new trip page
    const fromNewTrip = searchParams.get('from');
    if (fromNewTrip === 'new-trip') {
      setShowRedirectNotification(true);
    }
  }, [searchParams]);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  const tripId = searchParams.get('id');
  const trip = tripId ? getTripById(tripId) : null;
  
  if (!trip) {
    return (
      <div className="card bg-base-200 shadow-xl max-w-md mx-auto mt-12 border border-base-300">
        <div className="card-body items-center text-center">
          <h2 className="card-title text-base-content">Trip not found</h2>
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

  // Calculate cost per km
  const costPerKm = trip.totalDistance > 0 ? totalChargingCost / trip.totalDistance : 0;

  const handleCompleteTrip = () => {
    completeTrip(trip.id);
    setIsEditMode(false);
    router.push('/trips');
  };

  const handleReopenTrip = () => {
    reopenTrip(trip.id);
    setIsEditMode(true);
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
      {/* Redirect Notification */}
      {showRedirectNotification && (
        <div className="alert alert-info shadow-lg">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold">Active Trip in Progress</h3>
            <p className="text-sm">You already have an active trip. Please complete or manage this trip before starting a new one.</p>
          </div>
          <button
            onClick={() => setShowRedirectNotification(false)}
            className="btn btn-sm btn-circle btn-ghost"
            aria-label="Dismiss notification"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div>
        <Link
          href="/trips"
          className="btn btn-ghost btn-sm gap-2 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Trips
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 sm:gap-3">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-base-content">{trip.name}</h1>
              {trip.status === 'active' && (
                <span className="badge badge-primary badge-sm sm:badge-md">Active</span>
              )}
            </div>
            <p className="mt-1 text-xs sm:text-sm text-base-content/70">
              {vehicle?.name} • {formatDate(new Date(trip.startDate), settings)}
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
                {!isEditMode ? (
                  <button
                    onClick={handleReopenTrip}
                    className="btn btn-ghost text-warning gap-2"
                  >
                    <Edit className="h-5 w-5" />
                    Edit Trip
                  </button>
                ) : (
                  <button
                    onClick={handleCompleteTrip}
                    className="btn btn-success gap-2"
                  >
                    <CheckCircle className="h-5 w-5" />
                    Save & Complete
                  </button>
                )}
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
                  : 'btn-ghost text-error'
              }`}
            >
              <Trash2 className="h-4 w-4" />
              {deleteConfirm ? 'Confirm?' : 'Delete'}
            </button>
          </div>
        </div>
      </div>

      {/* Trip Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="card bg-base-200 shadow-lg border border-base-300">
          <div className="card-body p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
              <h3 className="text-xs font-medium text-base-content/70">Distance</h3>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-base-content">{trip.totalDistance.toFixed(1)}</p>
            <p className="text-xs text-base-content/60 mt-1">kilometers</p>
          </div>
        </div>

        <div className="card bg-base-200 shadow-lg border border-base-300">
          <div className="card-body p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2">
              <Battery className="h-4 w-4 text-primary flex-shrink-0" />
              <h3 className="text-xs font-medium text-base-content/70">Energy</h3>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-base-content">{trip.totalEnergyUsed.toFixed(2)}</p>
            <p className="text-xs text-base-content/60 mt-1">kWh consumed</p>
          </div>
        </div>

        <div className="card bg-base-200 shadow-lg border border-base-300">
          <div className="card-body p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-primary flex-shrink-0" />
              <h3 className="text-xs font-medium text-base-content/70">Efficiency</h3>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-base-content">
              {trip.averageEfficiency > 0 ? (1 / trip.averageEfficiency).toFixed(2) : 'N/A'}
            </p>
            <p className="text-xs text-base-content/60 mt-1">km/kWh</p>
          </div>
        </div>

        <div className="card bg-base-200 shadow-lg border border-base-300">
          <div className="card-body p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-primary flex-shrink-0" />
              <h3 className="text-xs font-medium text-base-content/70">Charging Cost</h3>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-base-content">{formatCurrency(totalChargingCost, settings)}</p>
            <p className="text-xs text-base-content/60 mt-1">total cost</p>
          </div>
        </div>

        <div className="card bg-base-200 shadow-lg border border-base-300">
          <div className="card-body p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-primary flex-shrink-0" />
              <h3 className="text-xs font-medium text-base-content/70">Cost/km</h3>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-base-content">{formatCurrency(costPerKm, settings)}</p>
            <p className="text-xs text-base-content/60 mt-1">per kilometer</p>
          </div>
        </div>

        <div className="card bg-base-200 shadow-lg border border-base-300">
          <div className="card-body p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
              <h3 className="text-xs font-medium text-base-content/70">Stops</h3>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-base-content">{trip.stops.length}</p>
            <p className="text-xs text-base-content/60 mt-1">total stops</p>
          </div>
        </div>
      </div>

      {/* Add Stop Button */}
      {(trip.status === 'active' || isEditMode) && !showAddStop && (
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
          const stretch = index < trip.stops.length - 1 ? stretches[index] : null;
          const isEditing = editingStop === stop.id;
          
          return (
            <div key={stop.id}>
              {/* Stretch Info */}
              {stretch && (
                <div className="card bg-info/10 border border-info/20 shadow-lg mb-4">
                  <div className="card-body p-4">
                    <h4 className="card-title text-xs sm:text-sm mb-2 text-base-content">Stretch {index + 1}</h4>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2 sm:gap-3">
                      <div className="rounded-lg p-2 sm:p-3 bg-info/5">
                        <p className="text-[10px] sm:text-xs text-base-content/60 mb-1">Distance</p>
                        <p className="font-semibold text-xs sm:text-sm text-base-content">{formatDistance(stretch.distance)}</p>
                      </div>
                      <div className="rounded-lg p-2 sm:p-3 bg-info/5">
                        <p className="text-[10px] sm:text-xs text-base-content/60 mb-1">Energy Used</p>
                        <p className="font-semibold text-xs sm:text-sm text-base-content">{formatEnergy(stretch.energyUsed)}</p>
                      </div>
                      <div className="rounded-lg p-2 sm:p-3 bg-info/5">
                        <p className="text-[10px] sm:text-xs text-base-content/60 mb-1">kWh/km</p>
                        <p className="font-semibold text-xs sm:text-sm text-base-content">{stretch.efficiencyKwhPerKm.toFixed(3)}</p>
                      </div>
                      <div className="rounded-lg p-2 sm:p-3 bg-info/5">
                        <p className="text-[10px] sm:text-xs text-base-content/60 mb-1">km/kWh</p>
                        <p className="font-semibold text-xs sm:text-sm text-base-content">{stretch.efficiencyKmPerKwh.toFixed(2)}</p>
                      </div>
                      <div className="rounded-lg p-2 sm:p-3 bg-info/5">
                        <p className="text-[10px] sm:text-xs text-base-content/60 mb-1">km per %</p>
                        <p className="font-semibold text-xs sm:text-sm text-base-content">{stretch.kmPerPercent.toFixed(2)} km</p>
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
                  isActive={trip.status === 'active' || isEditMode}
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
