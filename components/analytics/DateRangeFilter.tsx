'use client';

import { useAnalytics } from '@/contexts/AnalyticsContext';
import { getDateRangePresets } from '@/utils/analyticsHelpers';
import { Calendar } from 'lucide-react';

export default function DateRangeFilter() {
  const { dateRange, setDateRange } = useAnalytics();
  const presets = getDateRangePresets();

  const handlePresetChange = (preset: { label: string; start: Date; end: Date }) => {
    setDateRange(preset);
  };

  return (
    <div className="card bg-base-200 shadow-lg border border-base-300">
      <div className="card-body p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <span className="font-medium text-base-content">Time Period:</span>
          </div>
          
          <div className="flex flex-wrap gap-2 flex-1">
            {presets.map((preset) => (
              <button
                key={preset.label}
                onClick={() => handlePresetChange(preset)}
                className={`btn btn-sm ${
                  dateRange.label === preset.label
                    ? 'btn-primary'
                    : 'btn-ghost'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
