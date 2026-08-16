import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  Globe, 
  Shield, 
  ShieldCheck, 
  Sparkles, 
  SlidersHorizontal, 
  Bookmark, 
  PhoneCall,
  Flame,
  Newspaper,
  Compass,
  Lock,
  ChevronDown
} from 'lucide-react';
import { StateInfo, DistrictInfo, LanguageCode, NewsCategory, AuthorizedOfficer } from '../types';
import { AVAILABLE_LANGUAGES } from '../data/communityData';

interface HeaderProps {
  selectedState: StateInfo | null;
  selectedDistrict: DistrictInfo | null;
  onSelectState: (state: StateInfo | null) => void;
  onSelectDistrict: (district: DistrictInfo | null) => void;
  statesList: StateInfo[];
  currentLanguage: LanguageCode;
  onChangeLanguage: (lang: LanguageCode) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeCategory: NewsCategory;
  onSelectCategory: (cat: NewsCategory) => void;
  authorizedOfficer: AuthorizedOfficer | null;
  onOpenPolicePortal: () => void;
  onOpenAISafetyBriefing: () => void;
  onOpenPersonalizeModal: () => void;
  onOpenEmergencyModal: () => void;
  bookmarkedCount: number;
  onToggleBookmarksView: () => void;
  isBookmarksView: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  selectedState,
  selectedDistrict,
  onSelectState,
  onSelectDistrict,
  statesList,
  currentLanguage,
  onChangeLanguage,
  searchQuery,
  onSearchChange,
  activeCategory,
  onSelectCategory,
  authorizedOfficer,
  onOpenPolicePortal,
  onOpenAISafetyBriefing,
  onOpenPersonalizeModal,
  onOpenEmergencyModal,
  bookmarkedCount,
  onToggleBookmarksView,
  isBookmarksView
}) => {
  const [istTime, setIstTime] = useState<string>('');
  const [showLangDropdown, setShowLangDropdown] = useState<boolean>(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
        weekday: 'short',
        day: 'numeric',
        month: 'short'
      };
      setIstTime(new Intl.DateTimeFormat('en-IN', options).format(now) + ' IST');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const categories: { id: NewsCategory; label: string; icon?: React.ReactNode }[] = [
    { id: 'All', label: 'All India' },
    { id: 'For You', label: 'For You', icon: <Sparkles className="w-3.5 h-3.5 text-amber-500" /> },
    { id: 'Public Safety & Crime', label: 'Safety & Crimes', icon: <Shield className="w-3.5 h-3.5 text-rose-500" /> },
    { id: 'State & Local', label: 'State & Cities', icon: <MapPin className="w-3.5 h-3.5 text-blue-500" /> },
    { id: 'National', label: 'National' },
    { id: 'Politics', label: 'Politics' },
    { id: 'Business', label: 'Business & Economy' },
    { id: 'Tech', label: 'Tech & Cyber' },
    { id: 'Health & Climate', label: 'Health & Weather' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top utility bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => { onSelectCategory('All'); onSelectState(null); }}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 via-white to-emerald-600 p-[2px] shadow-sm flex items-center justify-center">
                <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                  <span className="text-white font-black text-lg tracking-tighter">PB</span>
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xl tracking-tight text-slate-900">
                    Pramaan<span className="text-blue-600">Bharat</span>
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                    Verified News & Safety
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 hidden sm:inline-block font-medium">
                  {istTime || 'New Delhi, India'}
                </span>
              </div>
            </div>
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-xl hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="search-news-input"
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search Indian news, police archives, cyber alerts, state or city..."
                className="w-full pl-10 pr-4 py-2 bg-slate-100/90 hover:bg-slate-100 focus:bg-white text-slate-900 text-sm rounded-full border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-hidden"
              />
              {searchQuery && (
                <button 
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 px-1.5 py-0.5 rounded bg-slate-200"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Action buttons & Utilities */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">

            {/* AI Safety Advisor Button */}
            <button
              id="ai-safety-briefing-btn"
              onClick={onOpenAISafetyBriefing}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
              title="Generate AI Safety Briefing for this Region"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>AI Safety Advisor</span>
            </button>

            {/* Language Selector */}
            <div className="relative">
              <button
                id="language-selector-btn"
                onClick={() => { setShowLangDropdown(!showLangDropdown); setShowLocationDropdown(false); }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">
                  {AVAILABLE_LANGUAGES.find(l => l.code === currentLanguage)?.nativeName || 'English'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showLangDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Indian Regional Editions
                  </div>
                  {AVAILABLE_LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        onChangeLanguage(lang.code as LanguageCode);
                        setShowLangDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-blue-50 transition-colors ${
                        currentLanguage === lang.code ? 'text-blue-600 font-semibold bg-blue-50/50' : 'text-slate-700'
                      }`}
                    >
                      <span>{lang.name}</span>
                      <span className="text-slate-400 font-normal">{lang.nativeName}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Location Quick Switcher */}
            <div className="relative">
              <button
                id="location-selector-btn"
                onClick={() => { setShowLocationDropdown(!showLocationDropdown); setShowLangDropdown(false); }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold transition-colors cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span className="max-w-[100px] sm:max-w-[130px] truncate">
                  {selectedDistrict ? selectedDistrict.name : selectedState ? selectedState.name : 'All India'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showLocationDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs max-h-80 overflow-y-auto">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                    <span>Select Region</span>
                    <button 
                      onClick={() => { onSelectState(null); onSelectDistrict(null); setShowLocationDropdown(false); }}
                      className="text-blue-600 hover:underline lowercase font-medium"
                    >
                      Reset (National)
                    </button>
                  </div>
                  
                  <button
                    onClick={() => { onSelectState(null); onSelectDistrict(null); setShowLocationDropdown(false); }}
                    className={`w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-slate-50 font-medium ${
                      !selectedState ? 'text-blue-600 bg-blue-50/50 font-bold' : 'text-slate-700'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5 text-slate-400" />
                    <span>All India (National Overview)</span>
                  </button>

                  <div className="my-1 border-t border-slate-100" />
                  
                  {statesList.map(st => (
                    <button
                      key={st.id}
                      onClick={() => {
                        onSelectState(st);
                        onSelectDistrict(null);
                        setShowLocationDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-slate-50 ${
                        selectedState?.id === st.id && !selectedDistrict ? 'text-blue-600 bg-blue-50/50 font-bold' : 'text-slate-700'
                      }`}
                    >
                      <span>{st.name} ({st.code})</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                        st.riskLevel === 'High' ? 'bg-rose-100 text-rose-700' :
                        st.riskLevel === 'Moderate' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {st.riskLevel}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Bookmarks Toggle */}
            <button
              id="bookmarks-toggle-btn"
              onClick={onToggleBookmarksView}
              className={`p-2 rounded-lg border text-xs font-medium transition-colors relative cursor-pointer ${
                isBookmarksView ? 'bg-blue-50 border-blue-300 text-blue-600' : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
              }`}
              title="Saved Articles"
            >
              <Bookmark className={`w-4 h-4 ${bookmarkedCount > 0 ? 'fill-blue-500 text-blue-500' : ''}`} />
              {bookmarkedCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                  {bookmarkedCount}
                </span>
              )}
            </button>

            {/* Emergency Helplines Modal Trigger */}
            <button
              id="emergency-directory-btn"
              onClick={onOpenEmergencyModal}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-semibold transition-colors cursor-pointer"
              title="Emergency Indian Helplines (112 / 1930 / 1090)"
            >
              <PhoneCall className="w-3.5 h-3.5 text-rose-600 animate-bounce" />
              <span className="hidden md:inline">112 SOS</span>
            </button>

            {/* Police / Law Enforcement Authorized Vault */}
            <button
              id="police-portal-auth-btn"
              onClick={onOpenPolicePortal}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                authorizedOfficer 
                  ? 'bg-slate-900 border-slate-950 text-emerald-400 ring-2 ring-emerald-500/20' 
                  : 'border-slate-300 bg-slate-900 hover:bg-slate-800 text-white'
              }`}
              title="Law Enforcement Official Archive Portal"
            >
              {authorizedOfficer ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">Officer {authorizedOfficer.rank}</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Police Vault</span>
                </>
              )}
            </button>

          </div>
        </div>

        {/* Mobile Search input */}
        <div className="block md:hidden pb-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search Indian news, police archives, cyber alerts..."
              className="w-full pl-10 pr-4 py-2 bg-slate-100 text-slate-900 text-xs rounded-full border border-slate-200 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Category Navigation Pills (Google News Style) */}
        <nav className="flex items-center gap-1.5 overflow-x-auto py-2.5 scrollbar-none border-t border-slate-100 text-xs font-medium">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id && !isBookmarksView;
            return (
              <button
                key={cat.id}
                id={`cat-nav-${cat.id.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                onClick={() => onSelectCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full whitespace-nowrap transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white font-bold shadow-sm ring-2 ring-blue-500/30'
                    : 'text-slate-700 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 font-medium'
                }`}
              >
                {cat.icon}
                <span>{cat.label}</span>
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
              </button>
            );
          })}
          
          <button
            id="customize-feed-pill"
            onClick={onOpenPersonalizeModal}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full whitespace-nowrap text-slate-600 hover:text-blue-600 hover:bg-blue-50 border border-dashed border-slate-300 ml-auto text-xs transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-3 h-3" />
            <span>Customize Topics</span>
          </button>
        </nav>

      </div>
    </header>
  );
};
