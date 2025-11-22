'use client';

import { AVAILABLE_THEMES } from '@/types/settings';
import { useSettings } from '@/contexts/SettingsContext';
import { Check } from 'lucide-react';

export default function ThemeSelector() {
  const { settings, updateSettings } = useSettings();

  const handleThemeChange = (theme: string) => {
    updateSettings({ theme });
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Choose Theme</h3>
        <p className="text-sm opacity-70 mb-4">
          Select a theme to customize the appearance of the app
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
        {AVAILABLE_THEMES.map((theme) => (
          <button
            key={theme.value}
            onClick={() => handleThemeChange(theme.value)}
            className={`relative p-6 rounded-lg border-2 transition-all hover:scale-105 ${
              settings.theme === theme.value
                ? 'border-primary shadow-lg'
                : 'border-base-300 hover:border-base-content/20'
            }`}
            data-theme={theme.value}
          >
            {/* Theme preview colors */}
            <div className="flex gap-2 mb-3">
              <div className="w-6 h-6 rounded bg-primary"></div>
              <div className="w-6 h-6 rounded bg-secondary"></div>
              <div className="w-6 h-6 rounded bg-accent"></div>
            </div>

            {/* Theme name and description */}
            <div className="text-left">
              <div className="font-semibold text-lg flex items-center justify-between">
                {theme.label}
                {settings.theme === theme.value && (
                  <Check className="h-5 w-5 text-primary" />
                )}
              </div>
              <div className="text-sm opacity-70 mt-1">{theme.description}</div>
            </div>

            {/* Selected indicator */}
            {settings.theme === theme.value && (
              <div className="absolute inset-0 rounded-lg ring-2 ring-primary ring-offset-2 pointer-events-none"></div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
