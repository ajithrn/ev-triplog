'use client';

import { useAnalytics } from '@/contexts/AnalyticsContext';
import { BarChart3, Car, Zap, DollarSign, Battery, ArrowLeftRight } from 'lucide-react';
import { useState, useEffect } from 'react';

const tabs = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'trips', label: 'Trips & Performance', icon: Car },
  { id: 'charging', label: 'Charging', icon: Zap },
  { id: 'costs', label: 'Costs', icon: DollarSign },
  { id: 'battery', label: 'Battery', icon: Battery },
  { id: 'compare', label: 'Compare', icon: ArrowLeftRight },
];

export default function TabNavigation() {
  const { activeTab, setActiveTab } = useAnalytics();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isMobile) {
    // Mobile: Dropdown selector
    return (
      <div className="form-control w-full">
        <select
          className="select select-bordered w-full"
          value={activeTab}
          onChange={(e) => setActiveTab(e.target.value)}
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <option key={tab.id} value={tab.id}>
                {tab.label}
              </option>
            );
          })}
        </select>
      </div>
    );
  }

  // Desktop: Tabs
  return (
    <div role="tablist" className="tabs tabs-boxed bg-base-200 p-1">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            role="tab"
            className={`tab gap-2 ${activeTab === tab.id ? 'tab-active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden lg:inline">{tab.label}</span>
            <span className="lg:hidden">{tab.label.split(' ')[0]}</span>
          </button>
        );
      })}
    </div>
  );
}
