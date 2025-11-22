'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { Car, Map, BarChart3, Menu, X, LayoutDashboard, Sun, Moon } from 'lucide-react';

export default function Navigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Get theme from localStorage or follow system preference
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    
    if (savedTheme) {
      // Use saved preference
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      // Follow system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const systemTheme = prefersDark ? 'dark' : 'light';
      setTheme(systemTheme);
      document.documentElement.setAttribute('data-theme', systemTheme);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

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
            <Link href="/" className="flex items-end gap-2 hover:opacity-80 transition-opacity">
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
          <div className="flex-none hidden md:flex items-center gap-2">
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
                          ? ''
                          : 'hover:text-primary'
                      }`}
                      style={{ color: isActive ? '#667eea' : 'var(--nav-text)' }}
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <button
              onClick={toggleTheme}
              className="btn btn-ghost btn-circle"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </button>
          </div>

              {/* Mobile Menu Button - Right */}
              <div className="flex-none md:hidden flex items-center gap-2">
                <label htmlFor="mobile-drawer" className="btn-square btn-ghost hover:bg-white/20">
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
          <div className="flex items-end justify-between mb-6 pb-4 border-b border-white/20">
            <div className="flex items-end gap-2">
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

          {/* Theme Toggle in Drawer - At Bottom */}
          <div className="mt-4 pt-4 border-t border-base-300">
            <button
              onClick={toggleTheme}
              className="btn btn-ghost w-full justify-start gap-4 text-lg py-4"
            >
              {theme === 'light' ? (
                <>
                  <Moon className="h-6 w-6" />
                  Dark Mode
                </>
              ) : (
                <>
                  <Sun className="h-6 w-6" />
                  Light Mode
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
