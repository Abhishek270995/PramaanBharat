import React, { useState } from 'react';
import { AlertCircle, AlertTriangle, Info, Volume2, VolumeX, ShieldAlert, Phone, ExternalLink, ChevronRight } from 'lucide-react';
import { LiveSafetyAlert, StateInfo } from '../types';

interface LiveAlertsTickerProps {
  alerts: LiveSafetyAlert[];
  selectedState: StateInfo | null;
  onSelectAlert: (alert: LiveSafetyAlert) => void;
  onOpenEmergencyModal: () => void;
}

export const LiveAlertsTicker: React.FC<LiveAlertsTickerProps> = ({
  alerts,
  selectedState,
  onSelectAlert,
  onOpenEmergencyModal
}) => {
  const [activeAlertIndex, setActiveAlertIndex] = useState<number>(0);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Filter alerts if state is selected
  const filteredAlerts = selectedState 
    ? alerts.filter(a => a.stateId === selectedState.id || a.stateId === 'all-india' || a.isPinned)
    : alerts;

  const currentAlert = filteredAlerts[activeAlertIndex] || alerts[0];

  const handleSpeakAlert = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    if (currentAlert) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(`${currentAlert.title}. ${currentAlert.description}`);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  if (!currentAlert) return null;

  const getSeverityBadge = (severity: LiveSafetyAlert['severity']) => {
    switch (severity) {
      case 'Critical':
        return {
          bg: 'bg-rose-600',
          text: 'text-white',
          border: 'border-rose-700',
          icon: <AlertCircle className="w-3.5 h-3.5 animate-pulse" />,
          label: 'CRITICAL SAFETY ALERT'
        };
      case 'Warning':
        return {
          bg: 'bg-amber-500',
          text: 'text-slate-900',
          border: 'border-amber-600',
          icon: <AlertTriangle className="w-3.5 h-3.5" />,
          label: 'HIGH ALERT ADVISORY'
        };
      default:
        return {
          bg: 'bg-blue-600',
          text: 'text-white',
          border: 'border-blue-700',
          icon: <Info className="w-3.5 h-3.5" />,
          label: 'POLICE ADVISORY'
        };
    }
  };

  const badge = getSeverityBadge(currentAlert.severity);

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white border-b border-slate-700/80 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
          
          {/* Alert Tag & Text */}
          <div 
            className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer group"
            onClick={() => onSelectAlert(currentAlert)}
          >
            {/* Severity Pill */}
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${badge.bg} ${badge.text} shrink-0 shadow-xs`}>
              {badge.icon}
              <span>{badge.label}</span>
            </div>

            {/* Location Pill */}
            <span className="hidden sm:inline-block text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-700/80 text-slate-200 shrink-0">
              📍 {currentAlert.locationName}
            </span>

            {/* Alert Message */}
            <p className="text-xs sm:text-sm text-slate-100 font-medium truncate group-hover:text-blue-300 transition-colors">
              <span className="font-bold text-white mr-1.5">{currentAlert.title}:</span>
              <span className="text-slate-300 hidden lg:inline">{currentAlert.description}</span>
            </p>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
            
            {/* Audio Voice Read Out */}
            <button
              id="speak-alert-btn"
              onClick={handleSpeakAlert}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                isSpeaking ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
              title={isSpeaking ? 'Stop voice readout' : 'Listen to alert (Speech synthesis)'}
            >
              {isSpeaking ? <VolumeX className="w-3.5 h-3.5 animate-spin" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span className="text-[11px]">{isSpeaking ? 'Mute' : 'Listen'}</span>
            </button>

            {/* Active Helpline direct dial */}
            <button
              id="alert-helpline-quick-btn"
              onClick={onOpenEmergencyModal}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Phone className="w-3 h-3 text-rose-400" />
              <span>{currentAlert.activeHelpline.split('/')[0]}</span>
            </button>

            {/* Navigation Dots for multiple alerts */}
            {filteredAlerts.length > 1 && (
              <div className="flex items-center gap-1 pl-1">
                {filteredAlerts.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveAlertIndex(i)}
                    className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                      activeAlertIndex === i ? 'bg-blue-400 w-4' : 'bg-slate-600 hover:bg-slate-400'
                    }`}
                    title={`Alert ${i + 1}`}
                  />
                ))}
              </div>
            )}

            {/* View Full Incident Button */}
            <button
              onClick={() => onSelectAlert(currentAlert)}
              className="text-slate-400 hover:text-white p-1"
              title="View full alert report"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

          </div>

        </div>
      </div>
    </div>
  );
};
