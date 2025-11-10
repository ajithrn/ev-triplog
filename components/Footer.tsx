import Link from 'next/link';
import { Car, Github, Coffee, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t mt-20" style={{ borderColor: 'var(--border-color)' }}>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {/* Left: Project Info */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start mb-2">
              <Car className="h-5 w-5 mr-2 text-blue-400" />
              <h3 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>EV Trip Log</h3>
            </div>
            <p className="text-sm" style={{ color: 'var(--foreground)', opacity: 0.8 }}>
              Your EV Trip Tracking Companion
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--foreground)', opacity: 0.6 }}>
              Track trips, monitor efficiency, and optimize your electric vehicle experience
            </p>
          </div>

          {/* Center: Links */}
          <div className="flex flex-col items-center space-y-3">
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
              <p className="text-xs flex items-center justify-center" style={{ color: 'var(--foreground)', opacity: 0.6 }}>
                Made with <Heart className="h-3 w-3 inline mx-1 text-red-400 fill-red-400" /> for a sustainable future
              </p>
            </div>
          </div>

          {/* Right: Developer Info */}
          <div className="text-center md:text-right">
            <p className="text-sm mb-1" style={{ color: 'var(--foreground)', opacity: 0.8 }}>
              Developed by
            </p>
            <a
              href="https://ajithrn.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors duration-200 font-medium"
            >
              ajithrn.com
            </a>
            <p className="text-xs mt-1" style={{ color: 'var(--foreground)', opacity: 0.6 }}>
              © 2025 EV Trip Log
            </p>
          </div>
        </div>

        {/* Bottom Border */}
        <div className="border-t mt-6 pt-4" style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex flex-col md:flex-row justify-between items-center text-xs" style={{ color: 'var(--foreground)', opacity: 0.6 }}>
            <p></p>
            <p className="mt-2 md:mt-0">Open source • MIT License</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
