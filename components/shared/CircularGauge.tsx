import React from 'react';
import { LucideIcon } from 'lucide-react';

interface CircularGaugeProps {
  icon: LucideIcon;
  title: string;
  value: number;
  maxValue: number;
  unit: string;
  subtitle?: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
}

/**
 * Reusable circular gauge component
 * Used for displaying metrics in a circular progress format
 */
const CircularGauge = React.memo<CircularGaugeProps>(({
  icon: Icon,
  title,
  value,
  maxValue,
  unit,
  subtitle,
  color = 'text-primary',
  size = 'md',
  children
}) => {
  const percentage = Math.min((value / maxValue) * 100, 100);
  const radius = size === 'sm' ? 60 : size === 'lg' ? 80 : 72;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;

  const sizeClasses = {
    sm: 'w-32 h-32',
    md: 'w-40 h-40',
    lg: 'w-48 h-48',
  };

  const textSizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  return (
    <div className="card bg-base-200 shadow-xl border border-base-300">
      <div className="card-body">
        <h2 className="card-title flex items-center gap-2">
          <Icon className={`h-5 w-5 ${color}`} />
          {title}
        </h2>
        <div className="divider mt-0"></div>
        <div className="flex flex-col items-center justify-center gap-[3px]">
          <div className={`relative ${sizeClasses[size]}`}>
            <svg className="w-full h-full transform -rotate-90">
              {/* Background circle */}
              <circle
                cx={size === 'sm' ? '64' : size === 'lg' ? '96' : '80'}
                cy={size === 'sm' ? '64' : size === 'lg' ? '96' : '80'}
                r={radius}
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                className="text-base-300"
              />
              {/* Progress circle */}
              <circle
                cx={size === 'sm' ? '64' : size === 'lg' ? '96' : '80'}
                cy={size === 'sm' ? '64' : size === 'lg' ? '96' : '80'}
                r={radius}
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                strokeDasharray={strokeDasharray}
                className={color}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-[3px]">
              <p className={`${textSizeClasses[size]} font-bold leading-none m-0 p-0 flex-grow-0`}>
                {typeof value === 'number' ? value.toFixed(value >= 10 ? 0 : 1) : value}
              </p>
              <p className="text-xs text-base-content/70 leading-none m-0 p-0 flex-grow-0">
                {unit}
              </p>
              {subtitle && (
                <p className="text-[10px] text-base-content/60 leading-none m-0 p-0 flex-grow-0">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {children && (
            <div className="text-center mt-2">
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

CircularGauge.displayName = 'CircularGauge';

export default CircularGauge;
