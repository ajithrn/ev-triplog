'use client';

import { useState } from 'react';
import DatePicker from 'react-datepicker';
import { useTrips } from '@/contexts/TripContext';
import { useVehicles } from '@/contexts/VehicleContext';

interface StopFormProps {
  tripId: string;
  stop?: any;
  onCancel: () => void;
}

export default function StopForm({ tripId, stop, onCancel }: StopFormProps) {
  const { addStop, updateStop, getTripById } = useTrips();
  const { vehicles } = useVehicles();
  const [selectedDate, setSelectedDate] = useState<Date>(stop ? new Date(stop.timestamp) : new Date());
  const [formData, setFormData] = useState({
    odometer: stop?.odometer || 0,
    batteryPercent: stop?.batteryPercent || 0,
    location: stop?.location || '',
    notes: stop?.notes || '',
  });

  const trip = getTripById(tripId);
  const vehicle = vehicles.find((v) => v.id === trip?.vehicleId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const batteryKwh = vehicle ? (vehicle.batteryCapacity * formData.batteryPercent) / 100 : 0;
    const stopData = {
      ...formData,
      batteryKwh,
      timestamp: selectedDate.getTime(),
    };
    
    if (stop) {
      updateStop(tripId, stop.id, stopData);
    } else {
      addStop(tripId, stopData);
    }
    onCancel();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'odometer' || name === 'batteryPercent' ? Number(value) : value,
    }));
  };

  const calculatedKwh = vehicle ? (vehicle.batteryCapacity * formData.batteryPercent) / 100 : 0;

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h3 className="card-title">{stop ? 'Edit Stop' : 'Add New Stop'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Date & Time *</span>
            </label>
            <DatePicker
              selected={selectedDate}
              onChange={(date) => date && setSelectedDate(date)}
              showTimeSelect
              dateFormat="PPp"
              className="input input-bordered w-full bg-base-200/50"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Odometer (km) *</span>
              </label>
              <input
                type="number"
                name="odometer"
                required
                min="0"
                step="0.1"
                value={formData.odometer || ''}
                onChange={handleChange}
                className="input input-bordered w-full bg-base-200/50"
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Battery % *</span>
              </label>
              <input
                type="number"
                name="batteryPercent"
                required
                min="0"
                max="100"
                step="0.1"
                value={formData.batteryPercent || ''}
                onChange={handleChange}
                className="input input-bordered w-full bg-base-200/50"
              />
              {vehicle && formData.batteryPercent > 0 && (
                <label className="label">
                  <span className="label-text-alt">
                    Battery kWh: {calculatedKwh.toFixed(2)} kWh
                  </span>
                </label>
              )}
            </div>
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
              className="input input-bordered w-full bg-base-200/50"
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Notes</span>
            </label>
            <textarea
              name="notes"
              rows={2}
              value={formData.notes}
              onChange={handleChange}
              className="textarea textarea-bordered w-full bg-base-200/50 resize-none"
            />
          </div>
          <div className="divider"></div>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              type="submit"
              className="btn btn-primary w-full sm:flex-1"
            >
              {stop ? 'Update Stop' : 'Add Stop'}
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
