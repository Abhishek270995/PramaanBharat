import React, { useState } from 'react';
import { 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  X, 
  Phone, 
  ShieldAlert, 
  Volume2, 
  VolumeX, 
  Share2, 
  Check, 
  MapPin, 
  Calendar, 
  Building2, 
  Clock,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { LiveSafetyAlert } from '../types';

interface AlertDetailsModalProps {
  alert: LiveSafetyAlert | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenEmergencyModal: () => void;
}

export const AlertDetailsModal: React.FC<AlertDetailsModalProps> = ({
  alert,
  isOpen,
  onClose,
  onOpenEmergencyModal
}) => {
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen || !alert) return null;

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const textToSpeak = `${alert.severity} Safety Advisory for ${alert.locationName}. ${alert.title}. ${alert.description}. Issued by ${alert.issuedBy}. Active Helpline: ${alert.activeHelpline}.`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const handleShare = () => {
    const text = `🚨 *${alert.severity.toUpperCase()} SAFETY ALERT* 🚨\n\n*${alert.title}*\n📍 *Region:* ${alert.locationName}\n🏛️ *Issued By:* ${alert.issuedBy}\n\n${alert.description}\n\n📞 *Emergency Contact:* ${alert.activeHelpline}\n🔗 View verified updates: https://pramaanbharat.com`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const getSeverityStyle = (severity: LiveSafetyAlert['severity']) => {
    switch (severity) {
      case 'Critical':
        return {
          bg: 'bg-rose-600',
          border: 'border-rose-500',
          text: 'text-rose-400',
          cardBg: 'from-rose-950/40 via-slate-900 to-slate-950',
          icon: <AlertCircle className="w-6 h-6 text-white animate-pulse" />,
          label: 'CRITICAL SAFETY BULLETIN'
        };
      case 'Warning':
        return {
          bg: 'bg-amber-500',
          border: 'border-amber-500',
          text: 'text-amber-400',
          cardBg: 'from-amber-950/40 via-slate-900 to-slate-950',
          icon: <AlertTriangle className="w-6 h-6 text-slate-950" />,
          label: 'HIGH ALERT ADVISORY'
        };
      default:
        return {
          bg: 'bg-blue-600',
          border: 'border-blue-500',
          text: 'text-blue-400',
          cardBg: 'from-blue-950/40 via-slate-900 to-slate-950',
          icon: <Info className="w-6 h-6 text-white" />,
          label: 'OFFICIAL POLICE ADVISORY'
        };
    }
  };

  const style = getSeverityStyle(alert.severity);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className={`bg-gradient-to-b ${style.cardBg} text-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border ${style.border}/50 ring-4 ${style.border}/10 animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col`}
      >
        
        {/* Header Bar */}
        <div className="p-4 sm:p-6 border-b border-slate-800 flex items-start justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl ${style.bg} flex items-center justify-center shadow-lg shrink-0`}>
              {style.icon}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${style.bg} text-white`}>
                  {style.label}
                </span>
                <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-500" />
                  {alert.timestamp}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white mt-1 leading-tight">
                {alert.title}
              </h3>
            </div>
          </div>

          <button
            onClick={() => {
              if (isSpeaking && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
              }
              onClose();
            }}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-sm">
          
          {/* Location & Authority Metadata Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Affected Area</span>
                <p className="text-xs font-bold text-slate-200">{alert.locationName}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Issuing Department</span>
                <p className="text-xs font-bold text-slate-200">{alert.issuedBy}</p>
              </div>
            </div>
          </div>

          {/* Complete Advisory Detail Description */}
          <div className="space-y-2">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Detailed Intelligence & Citizen Instructions
            </h4>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-slate-200 text-sm leading-relaxed whitespace-pre-line font-normal">
              {alert.description}
            </div>
          </div>

          {/* Active Helpline Call-Out */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-950/40 to-slate-900 border border-rose-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">
                Official Incident Reporting Helpline
              </span>
              <p className="text-sm font-extrabold text-white mt-0.5">
                {alert.activeHelpline}
              </p>
            </div>

            <button
              onClick={() => {
                onClose();
                onOpenEmergencyModal();
              }}
              className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer shrink-0"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Open Emergency Directory</span>
            </button>
          </div>

          {/* Verification Badge */}
          <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Verified Police Advisory Feed
            </span>
            <span className="text-slate-400">{alert.expiresAt}</span>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={handleSpeak}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              isSpeaking 
                ? 'bg-amber-400 border-amber-500 text-slate-950' 
                : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200'
            }`}
          >
            {isSpeaking ? <VolumeX className="w-4 h-4 animate-spin" /> : <Volume2 className="w-4 h-4 text-blue-400" />}
            <span>{isSpeaking ? 'Stop Audio Readout' : 'Listen with Voice'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              <span>{copied ? 'Copied Alert!' : 'Share Alert'}</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
