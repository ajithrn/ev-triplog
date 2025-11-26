'use client';

import { Settings as SettingsIcon, Palette, Database, Sliders } from 'lucide-react';
import ThemeSelector from '@/components/settings/ThemeSelector';
import DataManagement from '@/components/settings/DataManagement';
import AppPreferences from '@/components/settings/AppPreferences';

export default function SettingsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold text-base-content">Settings</h1>
        <p className="mt-1 text-base-content/70">Customize your app experience and manage your data</p>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {/* Theme Settings */}
        <div className="card bg-base-200 shadow-lg border border-base-300">
          <div className="card-body">
            <div className="flex items-center gap-2 mb-4">
              <Palette className="h-6 w-6 text-primary" />
              <h2 className="card-title">Appearance</h2>
            </div>
            <ThemeSelector />
          </div>
        </div>

        {/* App Preferences */}
        <div className="card bg-base-200 shadow-lg border border-base-300">
          <div className="card-body">
            <div className="flex items-center gap-2 mb-4">
              <Sliders className="h-6 w-6 text-primary" />
              <h2 className="card-title">Preferences</h2>
            </div>
            <AppPreferences />
          </div>
        </div>

        {/* Data Management */}
        <div className="card bg-base-200 shadow-lg border border-base-300">
          <div className="card-body">
            <div className="flex items-center gap-2 mb-4">
              <Database className="h-6 w-6 text-primary" />
              <h2 className="card-title">Data Management</h2>
            </div>
            <DataManagement />
          </div>
        </div>
      </div>
    </div>
  );
}
