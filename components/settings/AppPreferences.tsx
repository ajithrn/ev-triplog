'use client';

import { useState } from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { useVehicles } from '@/contexts/VehicleContext';
import { Save, CheckCircle } from 'lucide-react';

export default function AppPreferences() {
  const { settings, updateSettings } = useSettings();
  const { vehicles } = useVehicles();
  const [localSettings, setLocalSettings] = useState(settings);
  const [showSaved, setShowSaved] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (key: string, value: any) => {
    setLocalSettings((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    updateSettings(localSettings);
    setHasChanges(false);
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">App Preferences</h3>
        <p className="text-sm opacity-70 mb-4">
          Configure default settings for your app
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Distance Unit */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold">Distance Unit</span>
          </label>
          <select
            className="select select-bordered w-full"
            value={localSettings.distanceUnit}
            onChange={(e) => handleChange('distanceUnit', e.target.value)}
          >
            <option value="km">Kilometers (km)</option>
            <option value="miles">Miles (mi)</option>
          </select>
          <label className="label">
            <span className="label-text-alt opacity-70">
              Choose your preferred distance measurement
            </span>
          </label>
        </div>

        {/* Currency */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold">Currency</span>
          </label>
          <select
            className="select select-bordered w-full"
            value={localSettings.currency}
            onChange={(e) => handleChange('currency', e.target.value)}
          >
            <option value="₹">Indian Rupee (₹)</option>
            <option value="$">US Dollar ($)</option>
            <option value="€">Euro (€)</option>
            <option value="£">British Pound (£)</option>
            <option value="¥">Japanese Yen (¥)</option>
            <option value="AUD">Australian Dollar (AUD)</option>
            <option value="CAD">Canadian Dollar (CAD)</option>
          </select>
          <label className="label">
            <span className="label-text-alt opacity-70">
              Select your preferred currency symbol
            </span>
          </label>
        </div>

        {/* Date Format */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold">Date Format</span>
          </label>
          <select
            className="select select-bordered w-full"
            value={localSettings.dateFormat}
            onChange={(e) => handleChange('dateFormat', e.target.value)}
          >
            <option value="dd/MM/yyyy">31/12/2024 (DD/MM/YYYY)</option>
            <option value="MM/dd/yyyy">12/31/2024 (MM/DD/YYYY)</option>
            <option value="yyyy-MM-dd">2024-12-31 (YYYY-MM-DD)</option>
            <option value="MMMM d, yyyy">December 31, 2024</option>
            <option value="MMM d, yyyy">Dec 31, 2024</option>
            <option value="d MMM yyyy">31 Dec 2024</option>
          </select>
          <label className="label">
            <span className="label-text-alt opacity-70">
              Choose how dates are displayed
            </span>
          </label>
        </div>

        {/* Default Vehicle */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold">Default Vehicle</span>
          </label>
          <select
            className="select select-bordered w-full"
            value={localSettings.defaultVehicleId || ''}
            onChange={(e) => handleChange('defaultVehicleId', e.target.value || undefined)}
          >
            <option value="">None (Select manually)</option>
            {vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.name} ({vehicle.make} {vehicle.model})
              </option>
            ))}
          </select>
          <label className="label">
            <span className="label-text-alt opacity-70">
              {vehicles.length === 0
                ? 'Add a vehicle first to set as default'
                : 'Pre-select a vehicle for new trips'}
            </span>
          </label>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={!hasChanges}
          className={`btn btn-primary ${!hasChanges ? 'btn-disabled' : ''}`}
        >
          <Save className="h-4 w-4" />
          Save Preferences
        </button>
        {showSaved && (
          <div className="flex items-center gap-2 text-success">
            <CheckCircle className="h-5 w-5" />
            <span className="font-semibold">Preferences saved successfully!</span>
          </div>
        )}
      </div>

      {/* Info Alert */}
      <div className="alert alert-info">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          className="stroke-current shrink-0 w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
        <span className="text-sm">
          Note: Distance unit conversion is not yet implemented. Changing the unit will only affect the display label.
        </span>
      </div>
    </div>
  );
}
