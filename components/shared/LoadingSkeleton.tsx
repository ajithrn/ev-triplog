import React from 'react';

interface LoadingSkeletonProps {
  type?: 'card' | 'list' | 'table' | 'chart';
  count?: number;
  className?: string;
}

/**
 * Reusable loading skeleton component
 * Provides visual feedback while content is loading
 */
const LoadingSkeleton = React.memo<LoadingSkeletonProps>(({ 
  type = 'card', 
  count = 1,
  className = ''
}) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <div className={`card bg-base-200 shadow-lg border border-base-300 ${className}`}>
            <div className="card-body p-4 animate-pulse">
              <div className="h-4 bg-base-300 rounded w-1/3 mb-4"></div>
              <div className="h-8 bg-base-300 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-base-300 rounded w-1/4"></div>
            </div>
          </div>
        );
      
      case 'list':
        return (
          <div className={`space-y-3 ${className}`}>
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-base-200 rounded-lg animate-pulse">
                <div className="w-12 h-12 bg-base-300 rounded-full flex-shrink-0"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-base-300 rounded w-3/4"></div>
                  <div className="h-3 bg-base-300 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        );
      
      case 'table':
        return (
          <div className={`overflow-x-auto ${className}`}>
            <table className="table w-full">
              <thead>
                <tr>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <th key={i}>
                      <div className="h-4 bg-base-300 rounded w-full animate-pulse"></div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: count }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 4 }).map((_, j) => (
                      <td key={j}>
                        <div className="h-4 bg-base-300 rounded w-full animate-pulse"></div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      
      case 'chart':
        return (
          <div className={`card bg-base-200 shadow-lg border border-base-300 ${className}`}>
            <div className="card-body animate-pulse">
              <div className="h-6 bg-base-300 rounded w-1/3 mb-4"></div>
              <div className="h-64 bg-base-300 rounded"></div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return <>{renderSkeleton()}</>;
});

LoadingSkeleton.displayName = 'LoadingSkeleton';

export default LoadingSkeleton;
