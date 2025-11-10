'use client';

import { useEffect, useState } from 'react';
import { X, Download, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed (standalone mode)
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes('android-app://');
    
    setIsStandalone(isInStandaloneMode);

    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);

    // Check if user has already dismissed the prompt
    const hasSeenPrompt = localStorage.getItem('pwa-install-prompt-dismissed');
    
    if (isInStandaloneMode || hasSeenPrompt) {
      return;
    }

    // For Android/Desktop - listen for beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show prompt after a short delay (2 seconds)
      setTimeout(() => {
        setShowPrompt(true);
      }, 2000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For iOS - show custom prompt after delay
    if (iOS && !isInStandaloneMode) {
      setTimeout(() => {
        setShowPrompt(true);
      }, 2000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }

    // Clear the deferredPrompt
    setDeferredPrompt(null);
    setShowPrompt(false);
    localStorage.setItem('pwa-install-prompt-dismissed', 'true');
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-prompt-dismissed', 'true');
  };

  const handleRemindLater = () => {
    setShowPrompt(false);
    // Don't set localStorage, so it can show again on next visit
  };

  if (!showPrompt || isStandalone) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="card bg-neutral text-neutral-content shadow-2xl max-w-md w-full animate-in slide-in-from-bottom duration-300 sm:slide-in-from-bottom-0">
        <div className="card-body">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-3">
              <Smartphone className="w-10 h-10 text-primary" />
              <div>
                <h3 className="card-title text-lg">Install EV Trip Log</h3>
                <p className="text-sm opacity-80">Get the app experience</p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="btn btn-ghost btn-sm btn-circle"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="divider my-2"></div>

          <p className="text-sm mb-4 opacity-90">
            Install EV Trip Log for a fast, native app experience that works offline. 
            Access your trips anytime, anywhere, without needing an app store. 
            Get instant loading and seamless performance right from your home screen.
          </p>

          {isIOS ? (
            <div className="space-y-3">
              <div className="alert alert-info shadow-lg">
                <div>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <div className="text-sm">
                    <p className="font-bold mb-2">To install on iOS:</p>
                    <ol className="list-decimal list-inside space-y-1 ml-2">
                      <li>Tap the Share button <span className="kbd kbd-sm">⎋</span></li>
                      <li>Scroll and tap "Add to Home Screen"</li>
                      <li>Tap "Add"</li>
                    </ol>
                  </div>
                </div>
              </div>
              <div className="card-actions justify-end gap-2">
                <button
                  onClick={handleDismiss}
                  className="btn btn-ghost"
                >
                  Not Now
                </button>
                <button
                  onClick={handleDismiss}
                  className="btn btn-primary"
                >
                  Got It
                </button>
              </div>
            </div>
          ) : (
            <div className="card-actions justify-end gap-2">
              <button
                onClick={handleRemindLater}
                className="btn btn-ghost"
              >
                Remind Later
              </button>
              <button
                onClick={handleInstallClick}
                className="btn btn-primary gap-2"
              >
                <Download className="w-4 h-4" />
                Install
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
