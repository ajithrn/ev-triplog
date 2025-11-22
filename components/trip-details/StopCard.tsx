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
  isFirstStop: boolean;
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
  isFirstStop,
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
    <div className="card bg-base-200 shadow-xl card-hover border border-base-300">
      <div className="card-body p-4 sm:p-6">
        <div className="flex items-start justify-between mb-4 gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="card-title text-sm sm:text-base text-base-content">{isFirstStop ? 'Starting Point' : `Stop ${index}`}</h3>
            <p className="text-xs text-base-content/60">{format(new Date(stop.timestamp), 'PPp')}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 mb-4">
          <div className="bg-base-300 rounded-lg p-2 sm:p-3">
            <div className="text-xs text-base-content/60 mb-1">Odometer</div>
            <div className="text-sm font-semibold truncate text-base-content">{stop.odometer} km</div>
          </div>
          <div className="bg-base-300 rounded-lg p-2 sm:p-3">
            <div className="text-xs text-base-content/60 mb-1">Battery %</div>
            <div className="text-sm font-semibold truncate text-base-content">{formatBatteryPercent(stop.batteryPercent)}</div>
          </div>
          <div className="bg-base-300 rounded-lg p-2 sm:p-3">
            <div className="text-xs text-base-content/60 mb-1">Battery kWh</div>
            <div className="text-sm font-semibold truncate text-base-content">{formatEnergy(stop.batteryKwh)}</div>
          </div>
          <div className="bg-base-300 rounded-lg p-2 sm:p-3">
            <div className="text-xs text-base-content/60 mb-1">Location</div>
            <div className="text-xs font-semibold truncate text-base-content">{stop.location || 'N/A'}</div>
          </div>
        </div>

        {stop.notes && (
          <div className="alert alert-info mb-4">
            <div>
              <p className="text-xs sm:text-sm font-medium mb-1">Notes</p>
              <p className="text-xs sm:text-sm">{stop.notes}</p>
            </div>
          </div>
        )}

        {/* Action buttons at bottom */}
        {isActive && (
          <div className="flex justify-between items-center gap-2 mt-2">
            {/* Add Charging button on left */}
            {!isFirstStop && !stop.chargingSession && !showAddCharging ? (
              <button
                onClick={onShowAddCharging}
                className="btn btn-success btn-sm gap-1 sm:gap-2"
              >
                <Zap className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Add Charging</span>
              </button>
            ) : (
              <div></div>
            )}
            
            {/* Edit/Delete buttons on right */}
            <div className="flex gap-2">
              <button
                onClick={onEdit}
                className="p-1 hover:opacity-70 transition-opacity"
                title="Edit stop"
              >
                <Edit className="h-4 w-4 text-primary" strokeWidth={2.5} />
              </button>
              {!isFirstStop && (
                <button
                  onClick={onDelete}
                  className="p-1 hover:opacity-70 transition-opacity"
                  title={deleteConfirm ? 'Click again to confirm' : 'Delete stop'}
                >
                  <Trash2 className="h-4 w-4 text-error" strokeWidth={2.5} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Charging Session */}
        {stop.chargingSession && !editingCharging && (
          <div className="card bg-success/10 border border-success/20 shadow-lg mt-4">
            <div className="card-body p-3 sm:p-4">
              <div className="flex items-center justify-between mb-3 gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="badge badge-success badge-sm">
                    <Zap className="h-3 w-3" />
                  </div>
                  <h4 className="font-semibold text-sm text-base-content">Charging Session</h4>
                </div>
                {isActive && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={onEditCharging}
                      className="p-1 hover:opacity-70 transition-opacity"
                      title="Edit charging"
                    >
                      <Edit className="h-4 w-4 text-primary" strokeWidth={2.5} />
                    </button>
                    <button
                      onClick={handleDeleteCharging}
                      className="p-1 hover:opacity-70 transition-opacity"
                      title={deleteChargingConfirm ? 'Click again to confirm' : 'Delete charging'}
                    >
                      <Trash2 className="h-4 w-4 text-error" strokeWidth={2.5} />
                    </button>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
                <div className="bg-success/5 rounded-lg p-2 sm:p-3">
                  <div className="text-xs text-base-content/70 mb-1">SOC</div>
                  <div className="text-sm font-bold text-base-content">
                    {stop.chargingSession.startSoc}% → {stop.chargingSession.endSoc}%
                  </div>
                </div>
                <div className="bg-success/5 rounded-lg p-2 sm:p-3">
                  <div className="text-xs text-base-content/70 mb-1">Energy Added</div>
                  <div className="text-sm font-bold text-base-content">
                    {formatEnergy(calculateChargingEnergy(stop.chargingSession))}
                  </div>
                </div>
                <div className="bg-success/5 rounded-lg p-2 sm:p-3">
                  <div className="text-xs text-base-content/70 mb-1">Cost</div>
                  <div className="text-sm font-bold text-base-content">
                    {formatCost(stop.chargingSession.cost)}
                  </div>
                </div>
                <div className="bg-success/5 rounded-lg p-2 sm:p-3">
                  <div className="text-xs text-base-content/70 mb-1">Duration</div>
                  <div className="text-sm font-bold text-base-content">
                    {formatDuration(stop.chargingSession.duration)}
                  </div>
                </div>
              </div>
              <div className="bg-success/5 rounded-lg p-2 mt-3">
                <span className="text-xs sm:text-sm text-base-content/70">Cost per kWh: <span className="font-semibold text-base-content">{formatCost(calculateCostPerKwh(stop.chargingSession))}</span></span>
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
