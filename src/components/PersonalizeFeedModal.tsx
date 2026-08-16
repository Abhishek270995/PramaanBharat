import React, { useState } from 'react';
import { 
  SlidersHorizontal, 
  X, 
  Check, 
  MapPin, 
  ShieldAlert, 
  Sparkles, 
  BookOpen,
  Bell,
  ShieldCheck
} from 'lucide-react';
import { StateInfo } from '../types';
import { VERIFIED_SOURCES_CATALOG } from '../data/verifiedSources';

interface PersonalizeFeedModalProps {
  isOpen: boolean;
  onClose: () => void;
  statesList: StateInfo[];
  followedStateIds: string[];
  onToggleFollowState: (stateId: string) => void;
  followedCategories: string[];
  onToggleFollowCategory: (cat: string) => void;
  followedSourceIds?: string[];
  onToggleFollowSource?: (sourceId: string) => void;
}

export const PersonalizeFeedModal: React.FC<PersonalizeFeedModalProps> = ({
  isOpen,
  onClose,
  statesList,
  followedStateIds,
  onToggleFollowState,
  followedCategories,
  onToggleFollowCategory,
  followedSourceIds = ['pib', 'pti', 'the-hindu', 'livelaw', 'mint'],
  onToggleFollowSource
}) => {
  const [activeTab, setActiveTab] = useState<'states' | 'categories' | 'sources'>('sources');

  if (!isOpen) return null;

  const availableTopicInterests = [
    { id: 'Public Safety & Crime', label: 'Public Safety & Police Alerts', icon: '🚨' },
    { id: 'Cybercrime & Online Fraud', label: 'Cybercrime, Phishing & UPI Scams', icon: '🛡️' },
    { id: 'Women & Child Safety', label: 'Women Safety & Transit Security', icon: '👩' },
    { id: 'Tech', label: 'Tech, AI & Semiconductors', icon: '💻' },
    { id: 'Business', label: 'Business, RBI & Markets', icon: '📈' },
    { id: 'National', label: 'National & Defense Policy', icon: '🇮🇳' },
    { id: 'Health & Climate', label: 'Health, Weather & Climate', icon: '🌦️' },
    { id: 'Traffic & Hit-and-Run', label: 'Expressway & Traffic Safety', icon: '🚗' }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 relative">
        
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900">Personalize Your News Feed</h3>
            <p className="text-xs text-slate-500">Configure followed genuine newsrooms, state bureaus, and safety topics</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl mb-6">
          <button
            onClick={() => setActiveTab('sources')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'sources'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verified Sources ({followedSourceIds.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('states')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'states'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>States & Metros ({followedStateIds.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'categories'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Topics ({followedCategories.length})</span>
          </button>
        </div>

        <div className="my-2 min-h-[280px]">
          
          {/* TAB 1: Follow Verified Sources */}
          {activeTab === 'sources' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Follow Accredited News Agencies & Desks</span>
                </span>
                <span className="text-[11px] text-slate-400">{followedSourceIds.length} of {VERIFIED_SOURCES_CATALOG.length} Selected</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[360px] overflow-y-auto pr-1">
                {VERIFIED_SOURCES_CATALOG.map((source) => {
                  const isFollowed = followedSourceIds.includes(source.id);
                  return (
                    <button
                      key={source.id}
                      onClick={() => onToggleFollowSource ? onToggleFollowSource(source.id) : null}
                      className={`p-3 rounded-xl border text-xs text-left transition-all flex items-center justify-between cursor-pointer ${
                        isFollowed
                          ? 'bg-emerald-50/70 border-emerald-500 text-emerald-950 font-bold shadow-2xs'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="truncate mr-2">
                        <div className="font-bold flex items-center gap-1">
                          <span className="truncate">{source.name}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium truncate mt-0.5">
                          {source.tier} • {source.accreditation.split(',')[0]}
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                        isFollowed ? 'bg-emerald-600 text-white' : 'border border-slate-300'
                      }`}>
                        {isFollowed && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: Follow Regions / States */}
          {activeTab === 'states' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span>Followed Indian States & Metros</span>
                </span>
                <span className="text-[11px] text-slate-400">{followedStateIds.length} Selected</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[360px] overflow-y-auto pr-1">
                {statesList.map((st) => {
                  const isFollowed = followedStateIds.includes(st.id);
                  return (
                    <button
                      key={st.id}
                      onClick={() => onToggleFollowState(st.id)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all flex items-center justify-between cursor-pointer ${
                        isFollowed
                          ? 'bg-blue-50 border-blue-500 text-blue-800 shadow-2xs font-bold'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                      }`}
                    >
                      <span className="truncate">{st.name}</span>
                      {isFollowed && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: Follow Topics */}
          {activeTab === 'categories' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <span>Safety & News Categories of Interest</span>
                </span>
                <span className="text-[11px] text-slate-400">{followedCategories.length} Selected</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {availableTopicInterests.map((top) => {
                  const isFollowed = followedCategories.includes(top.id);
                  return (
                    <button
                      key={top.id}
                      onClick={() => onToggleFollowCategory(top.id)}
                      className={`p-3 rounded-xl border text-xs font-medium text-left transition-all flex items-center justify-between cursor-pointer ${
                        isFollowed
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-900 font-bold shadow-2xs'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{top.icon}</span>
                        <span className="leading-snug">{top.label}</span>
                      </div>
                      {isFollowed && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Save Preferences & Update Feed
          </button>
        </div>

      </div>
    </div>
  );
};

