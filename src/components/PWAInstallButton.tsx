import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../utils/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg bg-[#3D251A] hover:bg-[#4E3123] border border-[#C4A66A]/50 text-[#C4A66A] font-cinzel text-xs font-semibold tracking-wider transition-all shadow"
        title="Install TYPEWRITER App for Desktop / Mobile"
        aria-label="Install App"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg bg-[#281B15] hover:bg-[#3D251A] border border-[#9D7946]/40 text-[#E6D4B0] font-cinzel text-xs transition-colors"
          aria-label="Install on iOS"
        >
          <Smartphone className="w-3.5 h-3.5 text-[#C4A66A]" />
          <span>Install on iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-xl bg-[#1A1411] border-2 border-[#9D7946] p-6 shadow-2xl text-[#F5EBDD]">
              <div className="flex items-center justify-between mb-3 border-b border-[#9D7946]/30 pb-2">
                <h3 className="font-cinzel text-base font-bold text-[#C4A66A]">
                  Add to iPhone / iPad
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-full text-[#A7A096] hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="font-serif-vintage text-sm text-[#E6D4B0]/80 leading-relaxed mb-4">
                1. Tap the <strong>Share</strong> icon in the Safari navigation bar.<br />
                2. Scroll down and choose <strong>Add to Home Screen</strong>.<br />
                3. Open TYPEWRITER directly from your home screen as a standalone application.
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2 bg-[#9D7946] text-[#171310] font-cinzel font-bold text-xs uppercase rounded-lg hover:brightness-110"
              >
                Understood
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <button
      onClick={() => alert('To install TYPEWRITER as an app, use your browser menu (Chrome / Edge / Safari) and select "Install app" or "Add to Home Screen".')}
      className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-[#281B15]/60 hover:bg-[#3D251A] border border-[#9D7946]/30 text-[#A7A096] hover:text-[#E6D4B0] font-cinzel text-[11px] transition-colors"
      title="Install as native app"
    >
      <Smartphone className="w-3.5 h-3.5 text-[#9D7946]" />
      <span>Install App</span>
    </button>
  );
};
