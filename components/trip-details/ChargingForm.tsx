'use client';

import { useState } from 'react';
import { useTrips } from '@/contexts/TripContext';
import { useVehicles } from '@/contexts/VehicleContext';
import { useSettings } from '@/contexts/SettingsContext';
import { getCurrencySymbol } from '@/utils/formatters';

interface ChargingFormProps {
  tripId: string;
  stopId: string;
  currentBatteryKwh: number;
  currentBatteryPercent: number;
  session?: any;
  onCancel: () => void;
}

export default function ChargingForm({
  tripId,
  stopId,
  currentBatteryKwh,
  currentBatteryPercent,
  session,
  onCancel,
}: ChargingFormProps) {
  const { addChargingSession, updateChargingSession, getTripById } = useTrips();
  const { vehicles } = useVehicles();
  const [formData, setFormData] = useState({
    endSoc: session?.endSoc || 100,
    unitsConsumed: 0,
    cost: session?.cost || 0,
    duration: session?.duration || 0,
    chargerType: session?.chargerType || '',
    location: session?.location || '',
  });

  const trip = getTripById(tripId);
  const vehicle = vehicles.find((v) => v.id === trip?.vehicleId);
  const { settings } = useSettings();
  const currencySymbol = getCurrencySymbol(settings);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!vehicle) return;
    
    const endKwh = (vehicle.batteryCapacity * formData.endSoc) / 100;
    
    const chargingSession = {
      startSoc: currentBatteryPercent,
      endSoc: formData.endSoc,
      startKwh: currentBatteryKwh,
      endKwh: endKwh,
      cost: formData.cost,
      duration: formData.duration,
      chargerType: formData.chargerType,
      location: formData.location,
    };
    
    if (session) {
      updateChargingSession(tripId, stopId, chargingSession);
    } else {
      addChargingSession(tripId, stopId, chargingSession);
    }
    onCancel();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ['endSoc', 'unitsConsumed', 'cost', 'duration'].includes(name)
        ? Number(value)
        : value,
    }));
  };

  const calculatedEndKwh = vehicle ? (vehicle.batteryCapacity * formData.endSoc) / 100 : 0;
  const energyAdded = calculatedEndKwh - currentBatteryKwh;
  const chargingEfficiency = vehicle?.chargingEfficiency || 88;
  const estimatedUnitsFromCharger = energyAdded / (chargingEfficiency / 100);
  const costPerKwh = energyAdded > 0 && formData.cost > 0 ? formData.cost / energyAdded : 0;
  const costPerKwhFromCharger = estimatedUnitsFromCharger > 0 && formData.cost > 0 ? formData.cost / estimatedUnitsFromCharger : 0;

  return (
    <div className="card bg-base-200 border border-base-300 shadow-lg mt-4">
      <div className="card-body">
        <h4 className="card-title text-base text-base-content">{session ? 'Edit Charging Session' : 'Add Charging Session'}</h4>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-base-300 rounded-lg p-3">
              <p className="text-xs text-base-content/70 mb-1">Starting SOC</p>
              <p className="text-xl font-bold text-base-content">{currentBatteryPercent.toFixed(1)}%</p>
              <p className="text-xs text-base-content/60 mt-1">{currentBatteryKwh.toFixed(2)} kWh</p>
            </div>
            <div className="bg-base-300 rounded-lg p-3">
              <p className="text-xs text-base-content/70 mb-1">Energy to Battery</p>
              <p className="text-xl font-bold text-base-content">{energyAdded.toFixed(2)} kWh</p>
            </div>
            <div className="bg-base-300 rounded-lg p-3">
              <p className="text-xs text-base-content/70 mb-1">Est. Units from Charger</p>
              <p className="text-xl font-bold text-base-content">{estimatedUnitsFromCharger.toFixed(2)} kWh</p>
              <p className="text-xs text-base-content/60 mt-1">{chargingEfficiency}% efficiency</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">End SOC % *</span>
              </label>
              <input
                type="number"
                name="endSoc"
                required
                min={currentBatteryPercent}
                max="100"
                step="0.1"
                value={formData.endSoc}
                onChange={handleChange}
                className="input input-bordered w-full"
              />
              <label className="label">
                <span className="label-text-alt">
                  End battery: {calculatedEndKwh.toFixed(2)} kWh
                </span>
              </label>
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Units Consumed (kWh)</span>
                <span className="label-text-alt">(Optional)</span>
              </label>
              <input
                type="number"
                name="unitsConsumed"
                min="0"
                step="0.01"
                value={formData.unitsConsumed || ''}
                onChange={handleChange}
                placeholder="From charger display"
                className="input input-bordered w-full"
              />
              {formData.unitsConsumed > 0 && (
                <label className="label">
                  <span className="label-text-alt">
                    vs Battery: {Math.abs(energyAdded - formData.unitsConsumed).toFixed(2)} kWh • 
                    vs Est. Charger: {Math.abs(estimatedUnitsFromCharger - formData.unitsConsumed).toFixed(2)} kWh
                  </span>
                </label>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Cost ({currencySymbol}) *</span>
              </label>
              <input
                type="number"
                name="cost"
                required
                min="0"
                step="0.01"
                value={formData.cost || ''}
                onChange={handleChange}
                className="input input-bordered w-full"
              />
              {costPerKwh > 0 && (
                <label className="label">
                  <span className="label-text-alt">
                    {currencySymbol}{costPerKwh.toFixed(2)}/kWh (battery) • {currencySymbol}{costPerKwhFromCharger.toFixed(2)}/kWh (charger)
                  </span>
                </label>
              )}
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Duration (min) *</span>
              </label>
              <input
                type="number"
                name="duration"
                required
                min="0"
                value={formData.duration || ''}
                onChange={handleChange}
                className="input input-bordered w-full"
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Charger Type</span>
              </label>
              <input
                type="text"
                name="chargerType"
                value={formData.chargerType}
                onChange={handleChange}
                placeholder="e.g., DC Fast"
                className="input input-bordered w-full"
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Location</span>
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Station A"
                className="input input-bordered w-full"
              />
            </div>
          </div>
          <div className="divider"></div>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              type="submit"
              className="btn btn-success w-full sm:flex-1"
            >
              {session ? 'Update Charging Session' : 'Add Charging Session'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-ghost w-full sm:w-auto"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
