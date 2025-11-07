'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Edit, Trash2, Zap } from 'lucide-react';
import { useTrips } from '@/contexts/TripContext';
import {
  formatDistance,
  formatEnergy,
  formatBatteryPercent,
  formatCost,
  formatDuration,
  calculateChargingEnergy,
  calculateCostPerKwh,
} from '@/utils/calculations';
import ChargingForm from './ChargingForm';

interface StopCardProps {
  stop: any;
  index: number;
  tripId: string;
  showAddCharging: boolean;
  editingCharging: boolean;
  onShowAddCharging: () => void;
  onHideAddCharging: () => void;
  onEditCharging: () => void;
  onCancelEditCharging: () => void;
  onEdit: () => void;
  onDelete: () => void;
  deleteConfirm: boolean;
  isActive: boolean;
}

export default function StopCard({
  stop,
  index,
  tripId,
  showAddCharging,
  editingCharging,
  onShowAddCharging,
  onHideAddCharging,
  onEditCharging,
  onCancelEditCharging,
  onEdit,
  onDelete,
  deleteConfirm,
  isActive,
}: StopCardProps) {
  const { deleteChargingSession } = useTrips();
  const [deleteChargingConfirm, setDeleteChargingConfirm] = useState(false);

  const handleDeleteCharging = () => {
    if (deleteChargingConfirm) {
      deleteChargingSession(tripId, stop.id);
      setDeleteChargingConfirm(false);
    } else {
      setDeleteChargingConfirm(true);
      setTimeout(() => setDeleteChargingConfirm(false), 3000);
    }
  };

  return (
    <div className="card bg-base-100 glass shadow-xl card-hover">
      <div className="card-body">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="card-title text-lg">Stop {index + 1}</h3>
            <p className="text-sm opacity-70">{format(new Date(stop.timestamp), 'PPp')}</p>
          </div>
          <div className="flex items-center gap-2">
            {isActive && (
              <>
                <button
                  onClick={onEdit}
                  className="btn btn-ghost btn-sm btn-square"
                  title="Edit stop"
                >
                  <Edit className="h-4 w-4" />
                </button>
                {index > 0 && (
                  <button
                    onClick={onDelete}
                    className={`btn btn-sm btn-square ${
                      deleteConfirm
                        ? 'btn-error'
                        : 'btn-ghost'
                    }`}
                    title={deleteConfirm ? 'Click again to confirm' : 'Delete stop'}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
                {!stop.chargingSession && !showAddCharging && (
                  <button
                    onClick={onShowAddCharging}
                    className="btn btn-success btn-sm gap-2"
                  >
                    <Zap className="h-4 w-4" />
                    Add Charging
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="stat bg-base-200/50 rounded-lg p-3">
            <div className="stat-title text-xs">Odometer</div>
            <div className="stat-value text-lg">{stop.odometer} km</div>
          </div>
          <div className="stat bg-base-200/50 rounded-lg p-3">
            <div className="stat-title text-xs">Battery %</div>
            <div className="stat-value text-lg">{formatBatteryPercent(stop.batteryPercent)}</div>
          </div>
          <div className="stat bg-base-200/50 rounded-lg p-3">
            <div className="stat-title text-xs">Battery kWh</div>
            <div className="stat-value text-lg">{formatEnergy(stop.batteryKwh)}</div>
          </div>
          <div className="stat bg-base-200/50 rounded-lg p-3">
            <div className="stat-title text-xs">Location</div>
            <div className="stat-value text-lg">{stop.location || 'N/A'}</div>
          </div>
        </div>

        {stop.notes && (
          <div className="alert alert-info mb-4">
            <div>
              <p className="text-sm font-medium mb-1">Notes</p>
              <p>{stop.notes}</p>
            </div>
          </div>
        )}

        {/* Charging Session */}
        {stop.chargingSession && !editingCharging && (
          <div className="card bg-success/10 border border-success/20 shadow-lg mt-4">
            <div className="card-body">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="badge badge-success badge-lg">
                    <Zap className="h-4 w-4" />
                  </div>
                  <h4 className="font-semibold">Charging Session</h4>
                </div>
                {isActive && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={onEditCharging}
                      className="btn btn-ghost btn-sm btn-square"
                      title="Edit charging"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={handleDeleteCharging}
                      className={`btn btn-sm btn-square ${
                        deleteChargingConfirm
                          ? 'btn-error'
                          : 'btn-ghost'
                      }`}
                      title={deleteChargingConfirm ? 'Click again to confirm' : 'Delete charging'}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="stat bg-base-200/50 rounded-lg p-3">
                  <div className="stat-title text-xs">SOC</div>
                  <div className="stat-value text-base">
                    {stop.chargingSession.startSoc}% → {stop.chargingSession.endSoc}%
                  </div>
                </div>
                <div className="stat bg-base-200/50 rounded-lg p-3">
                  <div className="stat-title text-xs">Energy Added</div>
                  <div className="stat-value text-base">
                    {formatEnergy(calculateChargingEnergy(stop.chargingSession))}
                  </div>
                </div>
                <div className="stat bg-base-200/50 rounded-lg p-3">
                  <div className="stat-title text-xs">Cost</div>
                  <div className="stat-value text-base">
                    {formatCost(stop.chargingSession.cost)}
                  </div>
                </div>
                <div className="stat bg-base-200/50 rounded-lg p-3">
                  <div className="stat-title text-xs">Duration</div>
                  <div className="stat-value text-base">
                    {formatDuration(stop.chargingSession.duration)}
                  </div>
                </div>
              </div>
              <div className="alert alert-info mt-2">
                <span className="text-sm">Cost per kWh: {formatCost(calculateCostPerKwh(stop.chargingSession))}</span>
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit Charging Form */}
        {(showAddCharging || editingCharging) && (
          <ChargingForm
            tripId={tripId}
            stopId={stop.id}
            currentBatteryKwh={stop.batteryKwh}
            currentBatteryPercent={stop.batteryPercent}
            session={editingCharging ? stop.chargingSession : undefined}
            onCancel={editingCharging ? onCancelEditCharging : onHideAddCharging}
          />
        )}
      </div>
    </div>
  );
}
