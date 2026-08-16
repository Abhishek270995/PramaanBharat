import React, { useState, useEffect, useMemo } from 'react';
import { 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  Volume2, 
  VolumeX, 
  ShieldAlert, 
  Phone, 
  ExternalLink, 
  ChevronRight,
  Eye,
  Sparkles,
  MapPin,
  Clock
} from 'lucide-react';
import { LiveSafetyAlert, StateInfo, DistrictInfo } from '../types';
import { AlertDetailsModal } from './AlertDetailsModal';

interface LiveAlertsTickerProps {
  alerts: LiveSafetyAlert[];
  selectedState: StateInfo | null;
  selectedDistrict?: DistrictInfo | null;
  onSelectAlert: (alert: LiveSafetyAlert) => void;
  onOpenEmergencyModal: () => void;
}

export const LiveAlertsTicker: React.FC<LiveAlertsTickerProps> = ({
  alerts,
  selectedState,
  selectedDistrict,
  onSelectAlert,
  onOpenEmergencyModal
}) => {
  const [activeAlertIndex, setActiveAlertIndex] = useState<number>(0);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  // Filter alerts with priority for user's selected district, then selected state, then general
  const filteredAlerts = useMemo(() => {
    if (selectedDistrict) {
      const districtAlerts = alerts.filter(a => a.districtId === selectedDistrict.id);
      if (districtAlerts.length > 0) return districtAlerts;
    }
    if (selectedState) {
      const stateAlerts = alerts.filter(a => a.stateId === selectedState.id);
      if (stateAlerts.length > 0) return stateAlerts;
    }
    return alerts;
  }, [alerts, selectedState, selectedDistrict]);

  // Reset index when location changes
  useEffect(() => {
    setActiveAlertIndex(0);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [selectedState, selectedDistrict]);

  const currentAlert = filteredAlerts[activeAlertIndex] || filteredAlerts[0] || alerts[0];

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
          hoverBorder: 'hover:border-rose-500',
          icon: <AlertCircle className="w-3.5 h-3.5 animate-pulse" />,
          label: 'CRITICAL SAFETY ALERT'
        };
      case 'Warning':
        return {
          bg: 'bg-amber-500',
          text: 'text-slate-900',
          border: 'border-amber-600',
          hoverBorder: 'hover:border-amber-500',
          icon: <AlertTriangle className="w-3.5 h-3.5" />,
          label: 'HIGH ALERT ADVISORY'
        };
      default:
        return {
          bg: 'bg-blue-600',
          text: 'text-white',
          border: 'border-blue-700',
          hoverBorder: 'hover:border-blue-500',
          icon: <Info className="w-3.5 h-3.5" />,
          label: 'POLICE ADVISORY'
        };
    }
  };

  const badge = getSeverityBadge(currentAlert.severity);

  return (
    <>
      <div 
        className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white border-b border-slate-700/80 shadow-md group transition-all"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
            
            {/* Clickable Alert Banner */}
            <div 
              className="flex items-center gap-2 sm:gap-2.5 flex-1 min-w-0 cursor-pointer"
              onClick={() => {
                setIsDetailsModalOpen(true);
                onSelectAlert(currentAlert);
              }}
              title="Click to view full advisory intelligence & instructions"
            >
              {/* Severity Pill */}
              <div className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${badge.bg} ${badge.text} shrink-0 shadow-xs`}>
                {badge.icon}
                <span>{badge.label}</span>
              </div>

              {/* Location Pill */}
              <span className="hidden sm:inline-block text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-700/80 text-slate-200 shrink-0">
                📍 {currentAlert.locationName}
              </span>

              {/* Alert Title Message */}
              <p className="text-xs sm:text-sm text-slate-100 font-medium truncate group-hover:text-blue-300 transition-colors flex items-center gap-1.5">
                <span className="font-bold text-white mr-1 truncate">{currentAlert.title}:</span>
                <span className="text-slate-300 hidden lg:inline truncate">{currentAlert.description}</span>
                <span className="text-[10px] text-blue-400 bg-blue-500/10 px-1.5 py-0.2 rounded border border-blue-500/20 font-semibold hidden sm:inline-block shrink-0">
                  Click for Full Report
                </span>
              </p>
            </div>

            {/* Action Tools */}
            <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
              
              {/* View Full Report Button */}
              <button
                onClick={() => {
                  setIsDetailsModalOpen(true);
                  onSelectAlert(currentAlert);
                }}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/40 text-blue-300 text-xs font-semibold transition-colors cursor-pointer"
                title="Open full detailed dossier"
              >
                <Eye className="w-3 h-3" />
                <span>View Details</span>
              </button>

              {/* Audio Voice Read Out */}
              <button
                id="speak-alert-btn"
                onClick={handleSpeakAlert}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
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
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenEmergencyModal();
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-xs font-semibold transition-colors cursor-pointer"
                title="Dial Emergency Hotline"
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
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveAlertIndex(i);
                      }}
                      className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                        activeAlertIndex === i ? 'bg-blue-400 w-4' : 'bg-slate-600 hover:bg-slate-400'
                      }`}
                      title={`Alert ${i + 1}`}
                    />
                  ))}
                </div>
              )}

              {/* Arrow trigger */}
              <button
                onClick={() => {
                  setIsDetailsModalOpen(true);
                  onSelectAlert(currentAlert);
                }}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
                title="View full alert report"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

            </div>

          </div>
        </div>

        {/* Interactive Desktop Hover Preview Tooltip Card */}
        {isHovered && (
          <div 
            className="hidden md:block absolute left-4 right-4 sm:left-auto sm:right-10 top-full mt-1 w-full max-w-xl z-50 animate-in fade-in slide-in-from-top-2 duration-150 cursor-pointer"
            onClick={() => {
              setIsDetailsModalOpen(true);
              onSelectAlert(currentAlert);
            }}
          >
            <div className="bg-slate-900/98 backdrop-blur-xl text-white rounded-2xl p-4 shadow-2xl border border-slate-700 ring-4 ring-slate-900/50 space-y-2.5">
              <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <div className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${badge.bg} ${badge.text}`}>
                    {badge.label}
                  </div>
                  <span className="text-xs text-slate-300 font-bold">📍 {currentAlert.locationName}</span>
                </div>
                <span className="text-[10px] text-slate-400">{currentAlert.timestamp}</span>
              </div>

              <div>
                <h5 className="text-xs font-bold text-white">{currentAlert.title}</h5>
                <p className="text-xs text-slate-300 mt-1 line-clamp-3 leading-relaxed">
                  {currentAlert.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px]">
                <span className="text-amber-400 font-semibold flex items-center gap-1">
                  <Phone className="w-3 h-3" /> Helpline: {currentAlert.activeHelpline}
                </span>
                <span className="text-blue-400 font-bold flex items-center gap-0.5">
                  Click to open full dossier <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Full Detailed Incident Modal on Click */}
      <AlertDetailsModal
        alert={currentAlert}
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        onOpenEmergencyModal={onOpenEmergencyModal}
      />
    </>
  );
};
