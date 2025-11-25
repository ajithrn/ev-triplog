import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

/**
 * Reusable empty state component
 * Displayed when there's no data to show
 */
const EmptyState = React.memo<EmptyStateProps>(({ 
  icon: Icon, 
  title, 
  description, 
  action,
  className = ''
}) => {
  return (
    <div className={`card bg-base-200 shadow-xl border border-base-300 ${className}`}>
      <div className="card-body items-center text-center py-12">
        <Icon className="h-16 w-16 text-base-content/30 mb-4" />
        <h2 className="card-title text-2xl text-base-content">{title}</h2>
        <p className="text-base-content/70 max-w-md">{description}</p>
        {action && (
          <div className="card-actions mt-6">
            <button onClick={action.onClick} className="btn btn-primary">
              {action.label}
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

EmptyState.displayName = 'EmptyState';

export default EmptyState;
