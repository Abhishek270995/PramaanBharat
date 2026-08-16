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
  ChevronDown,
  Crown,
  X,
  Building2
} from 'lucide-react';
import { StateInfo, DistrictInfo, LanguageCode, NewsCategory, AuthorizedOfficer } from '../types';
import { AVAILABLE_LANGUAGES } from '../data/communityData';
import { UserSubscription } from '../utils/subscriptionUtils';

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
  onOpenSubscriptionModal: () => void;
  subscription: UserSubscription;
  bookmarkedCount: number;
  onToggleBookmarksView: () => void;
  isBookmarksView: boolean;
  onOpenLocationPrompt?: () => void;
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
  onOpenSubscriptionModal,
  subscription,
  bookmarkedCount,
  onToggleBookmarksView,
  isBookmarksView,
  onOpenLocationPrompt
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

  const currentLocationLabel = selectedDistrict 
    ? selectedDistrict.name 
    : selectedState 
      ? selectedState.name 
      : 'All India';

  const currentLanguageName = AVAILABLE_LANGUAGES.find(l => l.code === currentLanguage)?.nativeName || 'English';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* === MAIN HEADER ROW === */}
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div 
              className="flex items-center gap-2 cursor-pointer" 
              onClick={() => { onSelectCategory('All'); onSelectState(null); onSelectDistrict(null); }}
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-orange-600 via-white to-emerald-600 p-[2px] shadow-xs flex items-center justify-center">
                <div className="w-full h-full bg-slate-900 rounded-[9px] flex items-center justify-center">
                  <span className="text-white font-black text-sm sm:text-base tracking-tighter">PB</span>
                </div>
              </div>
              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-base sm:text-lg md:text-xl tracking-tight text-slate-900 leading-tight">
                    Pramaan<span className="text-blue-600">Bharat</span>
                  </span>
                  <span className="text-[8.5px] sm:text-[9.5px] font-extrabold uppercase tracking-wider px-1.5 py-0.2 rounded-full bg-blue-50 text-blue-700 border border-blue-200 shrink-0 inline-flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                    Verified
                  </span>
                </div>
                <span className="text-[9px] sm:text-[10px] md:text-[11px] font-semibold text-slate-500 tracking-tight leading-tight block mt-0.5">
                  India Verified News &amp; Public Safety Intelligence
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Search bar */}
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

          {/* Desktop Action Buttons (> 768px) */}
          <div className="hidden md:flex items-center gap-2 lg:gap-2.5 shrink-0">
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

            {/* Language Selector Desktop */}
            <div className="relative">
              <button
                id="language-selector-btn"
                onClick={() => { setShowLangDropdown(!showLangDropdown); setShowLocationDropdown(false); }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-slate-500" />
                <span>{currentLanguageName}</span>
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

            {/* Location Quick Switcher Desktop */}
            <div className="relative">
              <button
                id="location-selector-btn"
                onClick={() => { setShowLocationDropdown(!showLocationDropdown); setShowLangDropdown(false); }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold transition-colors cursor-pointer max-w-[150px]"
              >
                <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="truncate">{currentLocationLabel}</span>
                <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
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

                  {onOpenLocationPrompt && (
                    <button
                      onClick={() => {
                        setShowLocationDropdown(false);
                        onOpenLocationPrompt();
                      }}
                      className="w-full text-left px-3 py-2 flex items-center gap-2 text-blue-700 bg-blue-50/80 hover:bg-blue-100 font-bold border-b border-blue-100 transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                      <span>⚡ Auto-Detect My Location</span>
                    </button>
                  )}
                  
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

            {/* Bookmarks Toggle Desktop */}
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

            {/* AI Subscription / Quota Badge Desktop */}
            <button
              id="subscription-tier-btn"
              onClick={onOpenSubscriptionModal}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                subscription.isPro
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 border-amber-600 text-white shadow-xs'
                  : 'bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-blue-200 text-blue-800'
              }`}
              title={subscription.isPro ? "Pramaan Pro Active" : "View AI Credits & Subscription Plans"}
            >
              {subscription.isPro ? (
                <>
                  <Crown className="w-3.5 h-3.5 fill-white text-white" />
                  <span>PRO ACTIVE</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>AI: {subscription.aiCreditsRemaining}/{subscription.dailyAiQuota}</span>
                </>
              )}
            </button>

            {/* Emergency Helplines Modal Trigger Desktop */}
            <button
              id="emergency-directory-btn"
              onClick={onOpenEmergencyModal}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-semibold transition-colors cursor-pointer"
              title="Emergency Indian Helplines (112 / 1930 / 1090)"
            >
              <PhoneCall className="w-3.5 h-3.5 text-rose-600" />
              <span>112 SOS</span>
            </button>

            {/* Official Government & Police Portals Directory Desktop */}
            <button
              id="police-directory-btn"
              onClick={onOpenPolicePortal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
              title="Official Government & State Police Portals, e-FIR, CCTNS & Cyber Crime (1930)"
            >
              <Building2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Govt Portals</span>
            </button>
          </div>

          {/* Mobile Right Quick Action Group (< 768px) */}
          <div className="flex md:hidden items-center gap-1.5 shrink-0">
            {/* AI Credit / Pro Button Mobile */}
            <button
              id="mobile-subscription-btn"
              onClick={onOpenSubscriptionModal}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
                subscription.isPro
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 border-amber-600 text-white'
                  : 'bg-blue-50 border-blue-200 text-blue-800'
              }`}
            >
              {subscription.isPro ? (
                <>
                  <Crown className="w-3 h-3 fill-white text-white" />
                  <span>PRO</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3 text-blue-600" />
                  <span>{subscription.aiCreditsRemaining} AI</span>
                </>
              )}
            </button>

            {/* Bookmarks Mobile */}
            <button
              onClick={onToggleBookmarksView}
              className={`p-1.5 rounded-lg border text-xs transition-colors relative cursor-pointer ${
                isBookmarksView ? 'bg-blue-50 border-blue-300 text-blue-600' : 'border-slate-200 bg-white text-slate-700'
              }`}
              title="Saved"
            >
              <Bookmark className={`w-3.5 h-3.5 ${bookmarkedCount > 0 ? 'fill-blue-500 text-blue-500' : ''}`} />
              {bookmarkedCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-blue-600 text-white rounded-full text-[8px] font-bold flex items-center justify-center">
                  {bookmarkedCount}
                </span>
              )}
            </button>

            {/* 112 SOS Mobile */}
            <button
              onClick={onOpenEmergencyModal}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-bold"
              title="Emergency 112"
            >
              <PhoneCall className="w-3 h-3 text-rose-600" />
              <span>112</span>
            </button>
          </div>

        </div>

        {/* === MOBILE SUB-HEADER BAR (< 768px) with Quick Region / Edition / Police Controls === */}
        <div className="block md:hidden pb-2.5 space-y-2">
          
          {/* Quick Selectors Row */}
          <div className="grid grid-cols-3 gap-1.5">
            
            {/* Mobile Region Button */}
            <div className="relative">
              <button
                onClick={() => { setShowLocationDropdown(!showLocationDropdown); setShowLangDropdown(false); }}
                className="w-full flex items-center justify-between gap-1 px-2 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 text-[11px] font-semibold"
              >
                <div className="flex items-center gap-1 truncate">
                  <MapPin className="w-3 h-3 text-blue-600 shrink-0" />
                  <span className="truncate">{currentLocationLabel}</span>
                </div>
                <ChevronDown className="w-2.5 h-2.5 text-slate-400 shrink-0" />
              </button>

              {showLocationDropdown && (
                <div className="fixed inset-x-3 top-28 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 text-xs max-h-72 overflow-y-auto">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between border-b border-slate-100 pb-2 mb-1">
                    <span>Select Region</span>
                    <button 
                      onClick={() => { onSelectState(null); onSelectDistrict(null); setShowLocationDropdown(false); }}
                      className="text-blue-600 font-bold"
                    >
                      Reset to All India
                    </button>
                  </div>

                  {onOpenLocationPrompt && (
                    <button
                      onClick={() => {
                        setShowLocationDropdown(false);
                        onOpenLocationPrompt();
                      }}
                      className="w-full text-left px-3 py-2 flex items-center gap-2 text-blue-700 bg-blue-50/80 font-bold border-b border-blue-100 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                      <span>⚡ Auto-Detect My Location</span>
                    </button>
                  )}

                  <button
                    onClick={() => { onSelectState(null); onSelectDistrict(null); setShowLocationDropdown(false); }}
                    className={`w-full text-left px-3 py-2 flex items-center gap-2 ${!selectedState ? 'text-blue-600 bg-blue-50 font-bold' : 'text-slate-700'}`}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>All India (National Overview)</span>
                  </button>
                  {statesList.map(st => (
                    <button
                      key={st.id}
                      onClick={() => {
                        onSelectState(st);
                        onSelectDistrict(null);
                        setShowLocationDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between border-t border-slate-50 ${
                        selectedState?.id === st.id && !selectedDistrict ? 'text-blue-600 bg-blue-50 font-bold' : 'text-slate-700'
                      }`}
                    >
                      <span>{st.name} ({st.code})</span>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                        st.riskLevel === 'High' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {st.riskLevel}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile Language Button */}
            <div className="relative">
              <button
                onClick={() => { setShowLangDropdown(!showLangDropdown); setShowLocationDropdown(false); }}
                className="w-full flex items-center justify-between gap-1 px-2 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 text-[11px] font-semibold"
              >
                <div className="flex items-center gap-1 truncate">
                  <Globe className="w-3 h-3 text-slate-500 shrink-0" />
                  <span className="truncate">{currentLanguageName}</span>
                </div>
                <ChevronDown className="w-2.5 h-2.5 text-slate-400 shrink-0" />
              </button>

              {showLangDropdown && (
                <div className="fixed inset-x-3 top-28 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 text-xs max-h-72 overflow-y-auto">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2 mb-1">
                    Select Language Edition
                  </div>
                  {AVAILABLE_LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        onChangeLanguage(lang.code as LanguageCode);
                        setShowLangDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between border-b border-slate-50 ${
                        currentLanguage === lang.code ? 'text-blue-600 bg-blue-50 font-bold' : 'text-slate-700'
                      }`}
                    >
                      <span>{lang.name}</span>
                      <span className="text-slate-400">{lang.nativeName}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile Police Vault Button */}
            <button
              onClick={onOpenPolicePortal}
              className={`flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg border text-[11px] font-bold ${
                authorizedOfficer
                  ? 'bg-slate-900 text-emerald-400 border-slate-950'
                  : 'bg-slate-900 text-white border-slate-800'
              }`}
            >
              {authorizedOfficer ? (
                <>
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>Officer</span>
                </>
              ) : (
                <>
                  <Lock className="w-3 h-3 text-amber-400" />
                  <span>Police</span>
                </>
              )}
            </button>

          </div>

          {/* Mobile Search input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search news, cyber alerts, state, district..."
              className="w-full pl-8 pr-7 py-1.5 bg-slate-100 text-slate-900 text-xs rounded-full border border-slate-200 focus:outline-hidden"
            />
            {searchQuery && (
              <button 
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

        </div>

        {/* === CATEGORY NAVIGATION PILLS BAR === */}
        <nav className="flex items-center gap-1.5 overflow-x-auto py-2 scrollbar-none border-t border-slate-100 text-xs font-medium">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id && !isBookmarksView;
            return (
              <button
                key={cat.id}
                id={`cat-nav-${cat.id.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                onClick={() => onSelectCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full whitespace-nowrap transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white font-bold shadow-2xs ring-2 ring-blue-500/30'
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
            className="flex items-center gap-1 px-3 py-1.5 rounded-full whitespace-nowrap text-slate-600 hover:text-blue-600 hover:bg-blue-50 border border-dashed border-slate-300 ml-auto text-xs transition-colors cursor-pointer shrink-0"
          >
            <SlidersHorizontal className="w-3 h-3" />
            <span className="hidden sm:inline">Customize Topics</span>
            <span className="sm:hidden">Topics</span>
          </button>
        </nav>

      </div>
    </header>
  );
};
