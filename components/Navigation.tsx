'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Car, Map, BarChart3, Menu, X, LayoutDashboard } from 'lucide-react';

export default function Navigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/vehicles', label: 'Vehicles', icon: Car },
    { href: '/trips', label: 'Trips', icon: Map },
    { href: '/analytics', label: 'Analytics', icon: BarChart3 },
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
            <div className="navbar w-full">
              {/* Logo - Left */}
              <div className="flex-1">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Car className="h-7 w-7 text-primary" />
              <span className="font-bold text-lg uppercase tracking-wide" style={{ color: 'var(--nav-text)' }}>
                EV Trip Log
              </span>
            </Link>
          </div>
          
          {/* Desktop Navigation - Right */}
          <div className="flex-none hidden md:flex">
            <ul className="menu menu-horizontal px-1 gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`gap-2 font-medium transition-all ${
                        isActive
                          ? 'text-primary'
                          : 'hover:text-primary'
                      }`}
                      style={{ color: isActive ? undefined : 'var(--nav-text)' }}
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
              <div className="flex-none md:hidden">
                <label htmlFor="mobile-drawer" className="btn btn-square btn-ghost hover:bg-white/20">
                  {mobileMenuOpen ? (
                    <X className="h-6 w-6" style={{ color: 'var(--nav-text)' }} />
                  ) : (
                    <Menu className="h-6 w-6" style={{ color: 'var(--nav-text)' }} />
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
            <div className="flex items-center gap-3">
              <Car className="h-7 w-7 text-primary" />
              <span className="text-lg font-bold uppercase tracking-wide" style={{ color: 'var(--nav-text)' }}>
                EV Trip Log
              </span>
            </div>
            <label htmlFor="mobile-drawer" className="btn btn-sm btn-circle btn-ghost hover:bg-white/20">
              <X className="h-5 w-5" style={{ color: 'var(--nav-text)' }} />
            </label>
          </div>

          {/* Drawer Items */}
          <ul className="gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`gap-3 font-medium transition-all ${
                      isActive
                        ? 'text-primary'
                        : 'hover:text-primary'
                    }`}
                    style={{ color: isActive ? undefined : 'var(--nav-text)' }}
                  >
                    <Icon className="h-5 w-5" />
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
