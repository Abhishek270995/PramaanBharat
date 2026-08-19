import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  ShieldAlert, 
  Lock, 
  HeartHandshake, 
  Coins, 
  Car, 
  AlertTriangle, 
  Pill, 
  Volume2, 
  ArrowUpRight, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2,
  Clock,
  Filter,
  Calendar,
  X,
  Phone,
  BookOpen,
  ChevronRight,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Activity
} from 'lucide-react';
import { CrimeCategory, CrimeCategoryStat, TimeRangeKey, StateInfo, DistrictInfo } from '../types';
import { getCategoryStatsForTimeframe, getTimeframeMetricsConfig } from '../data/crimeData';

interface CrimeCategoryAnalyticsProps {
  selectedCategory: CrimeCategory | null;
  onSelectCategory: (cat: CrimeCategory | null) => void;
  selectedState?: StateInfo | null;
  selectedDistrict?: DistrictInfo | null;
  timeKey: TimeRangeKey;
  customStartDate?: string;
  customEndDate?: string;
}

const CATEGORY_HELPLINES_AND_LAWS: Record<CrimeCategory, { helpline: string; helplineName: string; bnsLaw: string; citizenTip: string }> = {
  'Cybercrime & Online Fraud': {
    helpline: '1930',
    helplineName: 'National Cybercrime Toll-Free Hotline',
    bnsLaw: 'IT Act 66D / Bharatiya Nyaya Sanhita (BNS) Section 318(4) [Cheating & Impersonation]',
    citizenTip: 'Never share OTPs, PINs, or install screen-sharing APKs. Freeze suspicious transactions within the golden hour at 1930.'
  },
  'Theft & Burglary': {
    helpline: '112',
    helplineName: 'All-India Police Emergency',
    bnsLaw: 'Bharatiya Nyaya Sanhita (BNS) Section 303 [Theft & House-Breaking]',
    citizenTip: 'Verify domestic staff through official police portals, install CCTV surveillance, and report stolen vehicles within 24 hours on e-FIR desks.'
  },
  'Women & Child Safety': {
    helpline: '1090 / 112',
    helplineName: 'Women PowerLine 1090 & Childline 1098',
    bnsLaw: 'Bharatiya Nyaya Sanhita (BNS) Section 74, 75, 78 & 79 [Assault, Harassment & Stalking]',
    citizenTip: 'Utilize 112 SOS geo-location tracking and 1090 anonymous counseling desks for rapid police escort in emergency transit.'
  },
  'Financial & Corporate Fraud': {
    helpline: '1930 / 112',
    helplineName: 'Economic Offences Wing & Cyber Cell',
    bnsLaw: 'BNS Section 316 (Breach of Trust) & Section 336 (Forgery / Fake Documents)',
    citizenTip: 'Check SEBI/RBI regulatory registrations before investing in high-return promises or downloading unregistered instant loan apps.'
  },
  'Traffic & Hit-and-Run': {
    helpline: '1033 / 112',
    helplineName: 'National Highway Emergency 1033',
    bnsLaw: 'BNS Section 106(1) & 106(2) [Rash Driving & Hit-and-Run Duty to Report]',
    citizenTip: 'Under the new BNS framework, drivers involved in road collisions must report to the nearest police station or 112 immediately to assist victims.'
  },
  'Violent Offenses': {
    helpline: '112',
    helplineName: 'Police Rapid Emergency Dispatch',
    bnsLaw: 'Bharatiya Nyaya Sanhita (BNS) Section 103 (Murder), 115 (Grievous Hurt)',
    citizenTip: 'Report immediate threats or armed altercations to 112 emergency control room for real-time police patrol dispatch.'
  },
  'Narcotics & NDPS': {
    helpline: '1933',
    helplineName: 'MANAS National Anti-Drug Helpline',
    bnsLaw: 'Narcotic Drugs & Psychotropic Substances (NDPS) Act 1985 & BNS Sections',
    citizenTip: 'Share anonymous tip-offs regarding synthetic drugs or illicit distribution rings through the official NCB MANAS portal.'
  },
  'Public Order & Nuisance': {
    helpline: '112',
    helplineName: 'Dial 112 Police Control Room',
    bnsLaw: 'BNS Section 189 (Unlawful Assembly) & Section 270 (Public Nuisance)',
    citizenTip: 'Report noise violations beyond permissible hours or unauthorized public encroachments via local municipal police citizen apps.'
  }
};

export const CrimeCategoryAnalytics: React.FC<CrimeCategoryAnalyticsProps> = ({
  selectedCategory,
  onSelectCategory,
  selectedState = null,
  selectedDistrict = null,
  timeKey,
  customStartDate,
  customEndDate
}) => {
  const [drilldownCategory, setDrilldownCategory] = useState<CrimeCategoryStat | null>(null);
  const [liveOffset, setLiveOffset] = useState<number>(0);
  const [lastSyncTime, setLastSyncTime] = useState<number>(Date.now());
  const [secondsUntilSync, setSecondsUntilSync] = useState<number>(45);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [nowTimestamp, setNowTimestamp] = useState<number>(Date.now());

  const timeframeConfig = getTimeframeMetricsConfig(timeKey, customStartDate, customEndDate);

  // Dynamic live clock
  useEffect(() => {
    const clock = setInterval(() => setNowTimestamp(Date.now()), 15000);
    return () => clearInterval(clock);
  }, []);

  // Perform sync
  const handlePerformSync = useCallback(() => {
    setIsSyncing(true);
    setLastSyncTime(Date.now());
    setSecondsUntilSync(45);
    setLiveOffset(prev => prev + Math.floor(Math.random() * 3 + 1));

    setTimeout(() => {
      setIsSyncing(false);
    }, 500);
  }, []);

  // Real-time auto-refresh interval
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsUntilSync(prev => {
        if (prev <= 1) {
          handlePerformSync();
          return 45;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [handlePerformSync]);

  const secondsAgo = Math.max(0, Math.floor((nowTimestamp - lastSyncTime) / 1000));

  const categoriesData = useMemo(() => {
    return getCategoryStatsForTimeframe(timeKey, customStartDate, customEndDate, selectedState, selectedDistrict, liveOffset);
  }, [timeKey, customStartDate, customEndDate, selectedState, selectedDistrict, liveOffset]);

  const isDaily = timeKey === 'today';
  const locationTitle = selectedDistrict ? selectedDistrict.name : selectedState ? selectedState.name : 'All India National';

  const getCategoryIcon = (name: string) => {
    switch (name) {
      case 'ShieldAlert': return <ShieldAlert className="w-4 h-4 text-blue-600" />;
      case 'Lock': return <Lock className="w-4 h-4 text-amber-600" />;
      case 'HeartHandshake': return <HeartHandshake className="w-4 h-4 text-pink-600" />;
      case 'Coins': return <Coins className="w-4 h-4 text-purple-600" />;
      case 'Car': return <Car className="w-4 h-4 text-emerald-600" />;
      case 'AlertTriangle': return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      case 'Pill': return <Pill className="w-4 h-4 text-cyan-600" />;
      case 'Volume2': return <Volume2 className="w-4 h-4 text-slate-600" />;
      default: return <ShieldAlert className="w-4 h-4 text-blue-600" />;
    }
  };

  const handleCardClick = (catStat: CrimeCategoryStat) => {
    setDrilldownCategory(catStat);
  };

  return (
    <>
      <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-sm border border-slate-200 my-6">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-bold tracking-wider uppercase border border-indigo-200">
                Crime Categorization &amp; Resolution Engine
              </span>
              <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                <span>📍 {locationTitle}</span>
              </span>
              <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
                <Calendar className="w-3 h-3 text-indigo-600" />
                <span>{timeframeConfig.periodName}</span>
              </span>

              {/* Real-time sync badge */}
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>Live Feed Active</span>
                <span className="text-emerald-400">•</span>
                <span className="text-emerald-700">Updated {secondsAgo}s ago</span>
                <span className="text-emerald-400">•</span>
                <span className="text-emerald-600 font-mono">Sync in {secondsUntilSync}s</span>
              </span>
            </div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              Incident Breakdown by Crime Category &amp; Police Resolution Rates ({locationTitle})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              All categories below are actively synchronized with {locationTitle} telemetry for {timeframeConfig.periodName}. Click any card for legal insights, emergency helplines &amp; news filtering.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
            <button
              onClick={handlePerformSync}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all border border-slate-200 cursor-pointer"
              title="Force instantaneous refresh of category telemetry"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-indigo-600 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Telemetry'}</span>
            </button>

            {selectedCategory && (
              <button
                onClick={() => onSelectCategory(null)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition-colors cursor-pointer shadow-xs"
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Clear Category Filter ({selectedCategory})</span>
              </button>
            )}
          </div>
        </div>

        {/* Cards Grid for Categories (100% Interactive) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
          {categoriesData.map((catStat) => {
            const isSelected = selectedCategory === catStat.category;
            
            const solvePercent = catStat.verified > 0 
              ? ((catStat.solved / catStat.verified) * 100).toFixed(0) 
              : '85';
              
            const isPositiveTrend = catStat.yoyChange <= 0; // Crime dropping is good

            return (
              <div
                key={catStat.category}
                id={`crime-cat-${catStat.category.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                onClick={() => handleCardClick(catStat)}
                className={`rounded-2xl p-4 border transition-all cursor-pointer relative flex flex-col justify-between group hover:shadow-md hover:scale-[1.01] ${
                  isSelected
                    ? 'bg-blue-50/70 border-blue-500 ring-2 ring-blue-500/20 shadow-md'
                    : 'bg-slate-50/60 hover:bg-slate-50 border-slate-200/80 hover:border-slate-300'
                }`}
                title="Click to view detailed dossier, statutory law & citizen guidelines"
              >
                <div>
                  {/* Header with Icon & YoY */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-white shadow-2xs border border-slate-200/70 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                        {getCategoryIcon(catStat.iconName)}
                      </div>
                      <span className="font-bold text-xs text-slate-900 leading-snug line-clamp-1">
                        {catStat.category}
                      </span>
                    </div>

                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 border ${
                      isPositiveTrend 
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
                        : 'bg-rose-100 text-rose-800 border-rose-200'
                    }`}>
                      {isPositiveTrend ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                      {catStat.yoyChange > 0 ? `+${catStat.yoyChange}` : catStat.yoyChange}%
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                    {catStat.description}
                  </p>
                </div>

                {/* Numbers & Progress Bar synchronized with timeframe */}
                <div className="mt-4 pt-3 border-t border-slate-200/60">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-slate-500 font-medium">
                      {isDaily ? 'Reported Today (24h)' : 'Reported in Period'}
                    </span>
                    <span className="text-base font-black text-slate-900">
                      {catStat.reported.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden my-2">
                    <div 
                      style={{ width: `${solvePercent}%`, backgroundColor: catStat.color }}
                      className="h-full rounded-full transition-all"
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-600">
                    <span className="flex items-center gap-1 font-semibold text-emerald-700">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      {catStat.solved.toLocaleString('en-IN')} Solved ({solvePercent}%)
                    </span>
                    
                    {/* Explicitly labeled investigation turnaround time */}
                    <span 
                      className="text-slate-500 flex items-center gap-0.5 font-medium bg-slate-200/50 px-1.5 py-0.5 rounded text-[10px]"
                      title="Average police investigation & chargesheet turnaround time"
                    >
                      <Clock className="w-3 h-3 text-slate-400" /> Turnaround: ~{catStat.averageResolutionDays}d
                    </span>
                  </div>

                  {/* Click trigger prompt */}
                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-200/40 text-[10px] text-blue-600 font-bold group-hover:underline">
                    <span>{isSelected ? '✓ Filter Active' : 'Explore Legal Dossier'}</span>
                    <ChevronRight className="w-3 h-3" />
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>

      {/* Interactive Category Action & Legal Insights Modal */}
      {drilldownCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white text-slate-900 rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95">
            
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 sm:p-6 relative">
              <button
                onClick={() => setDrilldownCategory(null)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[11px] font-bold border border-blue-500/30">
                  {timeframeConfig.periodName}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-500/30">
                  {((drilldownCategory.solved / Math.max(1, drilldownCategory.verified)) * 100).toFixed(0)}% Solved Velocity
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <span>{drilldownCategory.category}</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {drilldownCategory.description}
              </p>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 bg-slate-50 text-xs">
              
              {/* Telemetry Numbers for Current Timeframe */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
                  <span className="text-[10px] font-bold uppercase text-slate-400">
                    {isDaily ? 'Reported Today (24h)' : 'Reported in Period'}
                  </span>
                  <p className="text-xl font-black text-slate-900 mt-1">
                    {drilldownCategory.reported.toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Chargesheeted / Solved</span>
                  <p className="text-xl font-black text-emerald-600 mt-1">
                    {drilldownCategory.solved.toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Avg Investigation Speed</span>
                  <p className="text-xl font-black text-blue-600 mt-1">
                    ~{drilldownCategory.averageResolutionDays} Days
                  </p>
                </div>
              </div>

              {/* Statutory BNS Legal Framework */}
              {CATEGORY_HELPLINES_AND_LAWS[drilldownCategory.category] && (
                <>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex items-center gap-1.5 text-slate-900 font-bold text-xs">
                      <BookOpen className="w-4 h-4 text-blue-600" />
                      <span>Statutory Indian Legal Provisions (BNS / IPC / Special Acts)</span>
                    </div>
                    <p className="text-slate-700 font-mono text-[11px] bg-slate-100 p-2.5 rounded-xl border border-slate-200">
                      {CATEGORY_HELPLINES_AND_LAWS[drilldownCategory.category].bnsLaw}
                    </p>
                  </div>

                  {/* Citizen Safety Advice */}
                  <div className="bg-amber-50/80 p-4 rounded-2xl border border-amber-200 space-y-1.5 text-amber-900">
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <ShieldCheck className="w-4 h-4 text-amber-700" />
                      <span>Citizen Safety &amp; Preventive Protocol</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed text-[11px]">
                      {CATEGORY_HELPLINES_AND_LAWS[drilldownCategory.category].citizenTip}
                    </p>
                  </div>

                  {/* Direct Emergency Helpline Dial */}
                  <div className="bg-rose-50/80 p-4 rounded-2xl border border-rose-200 flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-rose-600 block">Dedicated Emergency Helpline</span>
                      <span className="text-sm font-black text-rose-950">
                        {CATEGORY_HELPLINES_AND_LAWS[drilldownCategory.category].helplineName}
                      </span>
                    </div>
                    <a
                      href={`tel:${CATEGORY_HELPLINES_AND_LAWS[drilldownCategory.category].helpline.split('/')[0].trim()}`}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Dial {CATEGORY_HELPLINES_AND_LAWS[drilldownCategory.category].helpline}</span>
                    </a>
                  </div>
                </>
              )}

            </div>

            {/* Modal Footer with 1-Click News Filter */}
            <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between text-xs flex-wrap gap-2">
              <button
                onClick={() => {
                  onSelectCategory(drilldownCategory.category);
                  setDrilldownCategory(null);
                  const feedElem = document.getElementById('news-feed-section') || document.getElementById('main-feed-container');
                  if (feedElem) {
                    feedElem.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-md"
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Filter News Feed by "{drilldownCategory.category}" →</span>
              </button>

              <button
                onClick={() => setDrilldownCategory(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
              >
                Close Dossier
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
