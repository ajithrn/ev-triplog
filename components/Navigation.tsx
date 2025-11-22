'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { Car, Map, BarChart3, Menu, X, LayoutDashboard, Settings } from 'lucide-react';

export default function Navigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/vehicles', label: 'Vehicles', icon: Car },
    { href: '/trips', label: 'Trips', icon: Map },
    { href: '/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="drawer">
      <input 
        id="mobile-drawer" 
        type="checkbox" 
        className="drawer-toggle" 
        checked={mobileMenuOpen}
        onChange={(e) => setMobileMenuOpen(e.target.checked)}
      />
      <div className="drawer-content flex flex-col">
        {/* Navbar */}
        <div className="navbar sticky top-0 z-50 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <div className="container mx-auto px-4">
            <div className="navbar w-full pb-0">
              {/* Logo - Left */}
              <div className="flex-1">
            <Link href="/" className="flex items-end gap-2 hover:opacity-80 transition-opacity pb-2">
              <Image 
                src="/ev-trip-log-logo.png" 
                alt="EV Trip Log" 
                width={35} 
                height={35}
                className="object-contain"
                style={{ maxHeight: '35px', width: 'auto' }}
              />
              <span className="font-semibold text-s uppercase tracking-wide" style={{ color: '#667eea' }}>
                EV Trip Log
              </span>
            </Link>
          </div>
          
          {/* Desktop Navigation - Right */}
          <div className="flex-none hidden lg:flex items-end gap-2">
            <ul className="menu menu-horizontal px-0 gap-2" style={{ minHeight: 'auto' }}>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`gap-2 font-medium transition-all pb-2 ${
                        isActive
                          ? ''
                          : 'hover:text-primary'
                      }`}
                      style={{ 
                        color: isActive ? '#667eea' : 'var(--nav-text)',
                        minHeight: 'auto',
                        height: 'auto',
                        paddingTop: '0.5rem'
                      }}
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

              {/* Mobile Menu Button - Right */}
              <div className="flex-none lg:hidden flex items-end gap-2">
                <label htmlFor="mobile-drawer" className="btn btn-ghost btn-square hover:bg-white/20 pb-2" style={{ minWidth: '65px' }}>
                  {mobileMenuOpen ? (
                    <X className="h-7 w-7" style={{ color: 'var(--nav-text)' }} />
                  ) : (
                    <Menu className="h-7 w-7" style={{ color: 'var(--nav-text)' }} />
                  )}
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Drawer Side */}
      <div className="drawer-side z-50">
        <label htmlFor="mobile-drawer" className="drawer-overlay"></label>
        <div className="menu p-4 w-72 min-h-full bg-base-100 shadow-2xl">
          {/* Drawer Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/20">
            <div className="flex items-center gap-2">
              <Image 
                src="/ev-trip-log-logo.png" 
                alt="EV Trip Log" 
                width={35} 
                height={35}
                className="object-contain"
                style={{ maxHeight: '35px', width: 'auto' }}
              />
              <span className="text-s font-semibold uppercase tracking-wide" style={{ color: '#667eea' }}>
                EV Trip Log
              </span>
            </div>
            <label htmlFor="mobile-drawer" className="btn btn-sm btn-circle btn-ghost hover:bg-white/20">
              <X className="h-5 w-5" style={{ color: 'var(--nav-text)' }} />
            </label>
          </div>

          {/* Drawer Items */}
          <ul className="gap-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`gap-4 font-medium text-lg py-4 transition-all ${
                      isActive
                        ? ''
                        : 'hover:text-primary'
                    }`}
                    style={{ color: isActive ? '#667eea' : 'var(--nav-text)' }}
                  >
                    <Icon className="h-6 w-6" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
