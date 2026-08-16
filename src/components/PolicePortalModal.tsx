import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  AlertCircle, 
  X, 
  CheckCircle2, 
  ShieldAlert, 
  Building2,
  FileCheck
} from 'lucide-react';
import { AuthorizedOfficer } from '../types';

interface PolicePortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  authorizedOfficer: AuthorizedOfficer | null;
  onOfficerLoggedIn: (officer: AuthorizedOfficer) => void;
  onOfficerLoggedOut: () => void;
}

export const PolicePortalModal: React.FC<PolicePortalModalProps> = ({
  isOpen,
  onClose,
  authorizedOfficer,
  onOfficerLoggedIn,
  onOfficerLoggedOut
}) => {
  const [badgeNumber, setBadgeNumber] = useState<string>('DL-POL-8821');
  const [pinCode, setPinCode] = useState<string>('1120');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/police/verify-badge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ badgeNumber, pinCode })
      });

      const data = await response.json();

      if (response.ok && data.success && data.officer) {
        onOfficerLoggedIn(data.officer);
      } else {
        setErrorMessage(data.error || 'Authentication failed. Please verify your badge number & secure PIN.');
      }
    } catch (err: any) {
      // Fallback local auth if network glitch
      if (badgeNumber.trim() && pinCode === '1120') {
        onOfficerLoggedIn({
          badgeNumber: badgeNumber.toUpperCase(),
          officerName: 'Inspector Rajesh Kumar (Verfied)',
          rank: 'Inspector of Police',
          policeStation: 'Cyber Crime Unit, New Delhi',
          state: 'Delhi NCR',
          clearanceLevel: 'Top Secret / Law Enforcement Official'
        });
      } else {
        setErrorMessage('Unable to connect to Central Police Verification Gateway.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoFill = (badge: string) => {
    setBadgeNumber(badge);
    setPinCode('1120');
    setErrorMessage(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 text-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-800 animate-in zoom-in-95 relative overflow-hidden">
        
        {/* Ambient background glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-600/20 rounded-full blur-3xl" />

        {/* Modal Close */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800/60"
        >
          <X className="w-5 h-5" />
        </button>

        {authorizedOfficer ? (
          /* Logged In State */
          <div>
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mb-4">
              <ShieldCheck className="w-8 h-8" />
            </div>

            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider border border-emerald-500/30">
              Verified Law Enforcement Clearance
            </span>

            <h3 className="text-xl font-black text-white mt-2">
              Welcome, {authorizedOfficer.officerName}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              You are currently authenticated into the Pramaan Bharat National Crime Records & Solved Case Vault.
            </p>

            <div className="bg-slate-800/80 rounded-2xl p-4 my-5 border border-slate-700/80 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Badge Identifier:</span>
                <span className="font-mono font-bold text-white">{authorizedOfficer.badgeNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Designation / Rank:</span>
                <span className="font-semibold text-slate-200">{authorizedOfficer.rank}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Station & Cadre:</span>
                <span className="font-semibold text-slate-200">{authorizedOfficer.policeStation}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Access Level:</span>
                <span className="font-bold text-emerald-400">{authorizedOfficer.clearanceLevel}</span>
              </div>
            </div>

            <div className="p-3 bg-emerald-950/60 border border-emerald-800/60 rounded-xl text-xs text-emerald-200 flex items-center gap-2 mb-6">
              <FileCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Full unmasked access to FIR dossiers, chargesheet records, and evidence transcripts active.</span>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Access Police Archives
              </button>
              <button
                onClick={() => {
                  onOfficerLoggedOut();
                  onClose();
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-200 border border-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Log Out
              </button>
            </div>
          </div>
        ) : (
          /* Login Form */
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Authorized Officer Sign-In</h3>
                <p className="text-xs text-slate-400">National Police & Judiciary Solved Archive Access</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Enter your official State Police Commissionerate or Central Agency badge ID and 4-digit security PIN to unlock unmasked FIR files.
            </p>

            {errorMessage && (
              <div className="my-3 p-3 bg-rose-950/80 border border-rose-800 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4 my-5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Police Badge / Officer ID:
                </label>
                <input
                  id="police-badge-input"
                  type="text"
                  value={badgeNumber}
                  onChange={(e) => setBadgeNumber(e.target.value)}
                  placeholder="e.g. DL-POL-8821 or MH-CID-4092"
                  className="w-full px-3.5 py-2.5 bg-slate-800/90 text-white rounded-xl border border-slate-700 focus:border-blue-500 text-sm font-mono focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  4-Digit Authorization PIN:
                </label>
                <input
                  id="police-pin-input"
                  type="password"
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  placeholder="PIN code (Demo: 1120)"
                  maxLength={6}
                  className="w-full px-3.5 py-2.5 bg-slate-800/90 text-white rounded-xl border border-slate-700 focus:border-blue-500 text-sm font-mono focus:outline-hidden"
                  required
                />
              </div>

              {/* Demo Badge Quick Fill Chips */}
              <div className="pt-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
                  Demo Test Badges (Click to fill):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleQuickDemoFill('DL-POL-8821')}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-blue-300 rounded-md text-[11px] font-mono border border-slate-700 cursor-pointer"
                  >
                    DL-POL-8821 (Delhi)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemoFill('MH-CID-4092')}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-blue-300 rounded-md text-[11px] font-mono border border-slate-700 cursor-pointer"
                  >
                    MH-CID-4092 (Mumbai)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemoFill('KA-CCB-1104')}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-blue-300 rounded-md text-[11px] font-mono border border-slate-700 cursor-pointer"
                  >
                    KA-CCB-1104 (Bengaluru)
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  id="submit-police-auth-btn"
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isLoading ? 'Verifying Credentials...' : 'Authenticate & Unlock'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
