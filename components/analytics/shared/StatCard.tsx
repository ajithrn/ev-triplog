'use client';

import { LucideIcon } from 'lucide-react';
import { getTrendIndicator } from '@/utils/analyticsHelpers';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: number;
  iconColor?: string;
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  iconColor = 'text-primary',
}: StatCardProps) {
  const trendData = trend !== undefined ? getTrendIndicator(trend) : null;

  return (
    <div className="card bg-base-200 shadow-lg border border-base-300 hover:shadow-xl transition-shadow">
      <div className="card-body p-4">
        <div className="flex items-center gap-2 mb-2">
          <Icon className={`h-5 w-5 ${iconColor} flex-shrink-0`} />
          <h3 className="text-sm font-medium text-base-content/70">{title}</h3>
        </div>
        
        <div className="flex items-end justify-between">
          <div>
            <p className="text-3xl font-bold text-base-content">{value}</p>
            {subtitle && (
              <p className="text-xs text-base-content/60 mt-1">{subtitle}</p>
            )}
          </div>
          
          {trendData && (
            <div className={`flex items-center gap-1 ${trendData.color} font-semibold text-sm`}>
              <span>{trendData.icon}</span>
              <span>{trendData.text}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
