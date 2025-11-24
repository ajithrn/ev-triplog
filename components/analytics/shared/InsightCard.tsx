'use client';

import { InsightData } from '@/utils/analyticsCalculations';
import { Lightbulb, TrendingUp, AlertTriangle, Info } from 'lucide-react';

interface InsightCardProps {
  insight: InsightData;
}

export default function InsightCard({ insight }: InsightCardProps) {
  const iconMap = {
    success: TrendingUp,
    warning: AlertTriangle,
    info: Info,
    error: AlertTriangle,
  };

  const Icon = iconMap[insight.type];

  return (
    <div className="card bg-base-200 shadow-lg border border-base-300">
      <div className="card-body p-4">
        <div className="flex items-start gap-3">
          <Icon className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-bold text-base text-base-content">{insight.title}</h3>
            <p className="text-sm mt-1 text-base-content/70">{insight.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
