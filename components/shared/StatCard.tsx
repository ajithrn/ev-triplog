import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  unit?: string;
  iconColor?: string;
  className?: string;
}

/**
 * Reusable stat card component
 * Used throughout the app for displaying statistics
 */
const StatCard = React.memo<StatCardProps>(({ 
  icon: Icon, 
  label, 
  value, 
  unit, 
  iconColor = 'text-primary',
  className = ''
}) => {
  return (
    <div className={`card bg-base-200 shadow-lg border border-base-300 ${className}`}>
      <div className="card-body p-3 sm:p-4">
        <div className="flex items-center gap-2 mb-2">
          <Icon className={`h-4 w-4 ${iconColor} flex-shrink-0`} />
          <h3 className="text-xs font-medium text-base-content/70">{label}</h3>
        </div>
        <p className="text-2xl sm:text-3xl font-bold text-base-content">
          {value}
        </p>
        {unit && (
          <p className="text-xs text-base-content/60 mt-1">{unit}</p>
        )}
      </div>
    </div>
  );
});

StatCard.displayName = 'StatCard';

export default StatCard;
