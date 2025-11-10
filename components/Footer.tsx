'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Github, Coffee, Heart, ChevronDown, ChevronUp } from 'lucide-react';

export default function Footer() {
  const [isExpanded, setIsExpanded] = useState(false);
  const expandedContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isExpanded && expandedContentRef.current) {
      // Scroll the expanded content into view smoothly
      setTimeout(() => {
        expandedContentRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'nearest' 
        });
      }, 100);
    }
  }, [isExpanded]);

  return (
    <footer className="border-t mt-12" style={{ borderColor: 'var(--border-color)' }}>
      <div className="container mx-auto px-4 py-2">
        {/* Collapsed View - Always Visible */}
        <div className="flex items-center justify-between">
          {/* Left: Logo only on mobile, logo + text on desktop */}
          <div className="flex items-end gap-2">
            <Image 
              src="/ev-trip-log-logo.png" 
              alt="EV Trip Log" 
              width={25} 
              height={25}
              className="object-contain"
              style={{ maxHeight: '25px', width: 'auto' }}
            />
            <h3 className="hidden sm:block text-sm font-semibold uppercase tracking-wide" style={{ color: '#667eea' }}>EV Trip Log</h3>
          </div>
          
          {/* Right: Developed by text + expand button */}
          <div className="flex items-center gap-2 sm:gap-4">
            <p className="text-xs" style={{ color: 'var(--foreground)', opacity: 0.7 }}>
              Developed by{' '}
              <a
                href="https://ajithrn.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors duration-200 font-medium"
              >
                ajith_rn
              </a>
            </p>
            
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 hover:opacity-80"
              style={{ 
                backgroundColor: isExpanded ? '#667eea' : 'transparent',
                border: 'none',
                boxShadow: 'none'
              }}
              aria-label={isExpanded ? 'Collapse footer' : 'Expand footer'}
            >
              {isExpanded ? (
                <ChevronUp className="h-5 w-5" style={{ color: isExpanded ? '#ffffff' : '#667eea', strokeWidth: 2.5 }} />
              ) : (
                <ChevronDown className="h-5 w-5" style={{ color: isExpanded ? '#ffffff' : '#667eea', strokeWidth: 2.5 }} />
              )}
            </button>
          </div>
        </div>

        {/* Expanded View */}
        {isExpanded && (
          <div 
            ref={expandedContentRef}
            className="mt-4 pt-4 border-t animate-fade-in" 
            style={{ borderColor: 'var(--border-color)' }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 items-start">
              {/* Left: Project Info */}
              <div className="text-center md:text-left">
                <p className="text-sm font-semibold uppercase mb-2">
                  EV Trip Log
                </p>
                <p className="text-xs" style={{ color: 'var(--foreground)', opacity: 0.7 }}>
                  Track trips, monitor efficiency, and optimize your EV experience
                </p>
              </div>

              {/* Center: Links */}
              <div className="flex flex-col items-center space-y-2">
                <div className="flex items-center space-x-6">
                  <a
                    href="https://github.com/ajithrn/ev-triplog"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center hover:text-white transition-colors duration-200"
                    style={{ color: 'var(--foreground)' }}
                  >
                    <Github className="h-4 w-4 mr-2" />
                    <span className="text-sm">GitHub</span>
                  </a>
                  <a
                    href="https://buymeacoffee.com/ajithrn"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center hover:text-yellow-400 transition-colors duration-200"
                    style={{ color: 'var(--foreground)' }}
                  >
                    <Coffee className="h-4 w-4 mr-2" />
                    <span className="text-sm">Buy me a coffee</span>
                  </a>
                </div>
                <div className="text-center">
                  <p className="text-xs mt-1 flex items-center justify-center" style={{ color: 'var(--foreground)', opacity: 0.6 }}>
                    Made with <Heart className="h-3 w-3 inline mx-1 text-red-400 fill-red-400" /> for a sustainable future
                  </p>
                </div>
              </div>

              {/* Right: Developer Info */}
              <div className="text-center md:text-right">
                <p className="text-xs" style={{ color: 'var(--foreground)', opacity: 0.6 }}>
                  © 2025 EV Trip Log
                </p>
                <p className="mt-1 text-xs" style={{ color: 'var(--foreground)', opacity: 0.6 }}>
                  Open source • MIT License
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </footer>
  );
}
