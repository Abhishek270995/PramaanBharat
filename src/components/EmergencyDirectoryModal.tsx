import React, { useState } from 'react';
import { 
  Phone, 
  X, 
  Copy, 
  Check, 
  ShieldAlert, 
  PhoneCall, 
  AlertCircle,
  ExternalLink
} from 'lucide-react';

interface EmergencyDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyDirectoryModal: React.FC<EmergencyDirectoryModalProps> = ({
  isOpen,
  onClose
}) => {
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);

  if (!isOpen) return null;

  const helplines = [
    { number: '112', title: 'National Emergency Response Support System (ERSS)', desc: 'Unified single number for Police, Fire, and Ambulance across all Indian States & UTs.', color: 'bg-rose-600', badge: 'Primary' },
    { number: '1930', title: 'National Cyber Financial Fraud Reporting (I4C)', desc: 'Immediate lien freezing of stolen funds from unauthorized UPI, banking, or phishing transactions within 2-hour golden window.', color: 'bg-blue-600', badge: 'Cyber' },
    { number: '1090 / 1091', title: 'Women in Distress & Anti-Eve Teasing Helpline', desc: 'Discreet 24/7 emergency dispatch and She Teams / Pink Patrol intervention.', color: 'bg-pink-600', badge: 'Women' },
    { number: '1098', title: 'Childline India Foundation', desc: 'Emergency rescue, nutrition, and child protection services.', color: 'bg-amber-600', badge: 'Child' },
    { number: '1073', title: 'National Highway Road Safety Interceptor', desc: 'Emergency trauma dispatch for accidents across National Highways & Expressways.', color: 'bg-emerald-600', badge: 'Highway' },
    { number: '139', title: 'Indian Railways Security & Passenger Assistance', desc: 'Railway Protection Force (RPF) and medical assistance on running trains.', color: 'bg-indigo-600', badge: 'Railways' },
    { number: '108', title: 'Emergency Disaster & Medical Ambulance Service', desc: 'Advanced life support ambulances and disaster relief.', color: 'bg-red-500', badge: 'Medical' },
    { number: '1947', title: 'UIDAI Aadhaar Fraud & Identity Helpline', desc: 'Report compromised biometrics or fraudulent SIM issuance.', color: 'bg-cyan-600', badge: 'Identity' }
  ];

  const handleCopy = (num: string) => {
    navigator.clipboard.writeText(num.replace(/\s+/g, ''));
    setCopiedNumber(num);
    setTimeout(() => setCopiedNumber(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 relative">
        
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shadow-xs">
            <PhoneCall className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900">National Emergency Helplines of India</h3>
            <p className="text-xs text-slate-500">Toll-free 24x7 emergency and law enforcement dispatch lines</p>
          </div>
        </div>

        <div className="space-y-3 my-6">
          {helplines.map((h, i) => (
            <div
              key={i}
              className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase text-white ${h.color}`}>
                    {h.badge}
                  </span>
                  <span className="font-bold text-slate-900 text-sm">{h.title}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {h.desc}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                <span className="font-mono font-black text-lg text-slate-900 px-3 py-1 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  {h.number}
                </span>

                <button
                  onClick={() => handleCopy(h.number)}
                  className="p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors cursor-pointer"
                  title="Copy number"
                >
                  {copiedNumber === h.number ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>

                <a
                  href={`tel:${h.number.split('/')[0].trim()}`}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call</span>
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
          <span>All lines above are operational 24 hours a day, 7 days a week, toll-free across all telecom networks in India.</span>
        </div>

        <div className="flex justify-end pt-4 mt-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
          >
            Close Directory
          </button>
        </div>

      </div>
    </div>
  );
};
