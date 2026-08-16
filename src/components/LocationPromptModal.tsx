import React, { useState } from 'react';
import { MapPin, Navigation, Sparkles, X } from 'lucide-react';
import { StateInfo } from '../types';
import { requestBrowserLocation, LocationDetectionResult } from '../utils/geolocationUtils';

interface LocationPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  statesList: StateInfo[];
  onLocationDetected: (result: LocationDetectionResult) => void;
}

export const LocationPromptModal: React.FC<LocationPromptModalProps> = ({
  isOpen,
  onClose,
  statesList,
  onLocationDetected
}) => {
  const [isDetecting, setIsDetecting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleDismiss = () => {
    try {
      localStorage.setItem('pramaan_location_prompt_seen', 'true');
    } catch {
      // ignore
    }
    onClose();
  };

  const handleAllowLocation = () => {
    setIsDetecting(true);
    try {
      localStorage.setItem('pramaan_location_prompt_seen', 'true');
    } catch {
      // ignore
    }
    
    // Instantly close the modal popup so it never hangs or lingers on screen
    onClose();

    // Trigger fast background detection and notify App.tsx
    requestBrowserLocation(statesList)
      .then((result) => {
        setIsDetecting(false);
        onLocationDetected(result);
      })
      .catch(() => {
        setIsDetecting(false);
      });
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white rounded-2xl p-4 sm:p-5 shadow-2xl border border-blue-500/30 ring-4 ring-blue-500/10">
        
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
              <Navigation className="w-4 h-4 text-blue-400 animate-pulse" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                <span>Personalize Regional Feed</span>
                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40">
                  Geo-Sync
                </span>
              </h4>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                Allow location access to automatically view verified crime alerts, police metrics, and local news for your city.
              </p>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-3.5 flex items-center gap-2 pt-3 border-t border-slate-800">
          <button
            id="enable-auto-location-btn"
            onClick={handleAllowLocation}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Enable Auto-Location</span>
          </button>

          <button
            onClick={handleDismiss}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors cursor-pointer shrink-0"
          >
            Keep All India
          </button>
        </div>

      </div>
    </div>
  );
};
