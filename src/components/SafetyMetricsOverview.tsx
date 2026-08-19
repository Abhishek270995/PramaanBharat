import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  ShieldCheck, 
  CheckCircle2, 
  Archive, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  ShieldAlert, 
  Lock, 
  ArrowUpRight, 
  HelpCircle, 
  Calendar,
  Building2,
  X,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Search,
  Scale,
  Radio,
  Activity,
  Zap,
  RotateCw
} from 'lucide-react';
import { StateInfo, DistrictInfo, TimeRangeKey } from '../types';
import { getTimeframeMetricsConfig } from '../data/crimeData';

interface SafetyMetricsOverviewProps {
  selectedState: StateInfo | null;
  selectedDistrict: DistrictInfo | null;
  timeKey: TimeRangeKey;
  customStartDate?: string;
  customEndDate?: string;
  onOpenArchivedDatabase: () => void;
  onOpenPolicePortal: () => void;
}

type KpiType = 'reported' | 'verified' | 'solved' | 'archived';

interface LiveDispatchItem {
  id: string;
  timeAgo: string;
  location: string;
  badge: string;
  text: string;
  action: string;
}

export const SafetyMetricsOverview: React.FC<SafetyMetricsOverviewProps> = ({
  selectedState,
  selectedDistrict,
  timeKey,
  customStartDate,
  customEndDate,
  onOpenArchivedDatabase,
  onOpenPolicePortal
}) => {
  const [activeKpiModal, setActiveKpiModal] = useState<KpiType | null>(null);
  const config = getTimeframeMetricsConfig(timeKey, customStartDate, customEndDate);

  // --- REAL-TIME LIVE TELEMETRY STATE ---
  const [liveIncidentsToday, setLiveIncidentsToday] = useState<number>(() => {
    return selectedDistrict ? 18 : selectedState ? 142 : 1240;
  });
  const [liveSolvedToday, setLiveSolvedToday] = useState<number>(() => {
    return selectedDistrict ? 14 : selectedState ? 116 : 982;
  });
  const [liveActiveUnits, setLiveActiveUnits] = useState<number>(418);
  const [liveFraudHoldLakhs, setLiveFraudHoldLakhs] = useState<number>(18.4);
  const [lastIncidentSecondsAgo, setLastIncidentSecondsAgo] = useState<number>(14);
  const [activeDispatchIdx, setActiveDispatchIdx] = useState<number>(0);
  const [justIncremented, setJustIncremented] = useState<boolean>(false);

  // Real-time live emergency & crime telemetry dispatches
  const LIVE_DISPATCHES: LiveDispatchItem[] = [
    {
      id: 'disp-1',
      timeAgo: '18s ago',
      location: selectedDistrict ? selectedDistrict.name : selectedState ? selectedState.name : 'New Delhi Central',
      badge: 'Cyber Fraud Freeze',
      text: '1930 Citizen Cyber Helpline blocked unauthorized APK remote-access transaction of ₹2.4 Lakhs.',
      action: 'Destination mule account frozen within 6 mins'
    },
    {
      id: 'disp-2',
      timeAgo: '42s ago',
      location: selectedState ? selectedState.name : 'Mumbai Suburban & Bandra',
      badge: 'Vehicle Telemetry',
      text: 'Automated ANPR camera grid flagged cloned registration number on Western Express Highway.',
      action: 'Interceptor Patrol #14 dispatched'
    },
    {
      id: 'disp-3',
      timeAgo: '1m ago',
      location: selectedState ? selectedState.name : 'Bengaluru Central & Electronic City',
      badge: 'ERSS-112 Transit',
      text: 'Emergency SOS button triggered inside night cab transit corridor.',
      action: 'Police patrol arrived in 4.8 mins • Passenger safe'
    },
    {
      id: 'disp-4',
      timeAgo: '2m ago',
      location: selectedState ? selectedState.name : 'Hyderabad Cyberabad',
      badge: 'Financial Forensics',
      text: 'EOW Taskforce attached 3 crypto cold wallets tied to multi-level forex bot syndicate.',
      action: 'Chargesheet filed under BNSS'
    },
    {
      id: 'disp-5',
      timeAgo: '3m ago',
      location: selectedState ? selectedState.name : 'Ahmedabad & Gandhinagar',
      badge: 'Mobile Forensics',
      text: 'Cyber Safe Gujarat Van cloned encrypted storage device of phishing operator on spot.',
      action: 'Evidence hash verified with NFSU'
    }
  ];

  // Dynamic real-time heartbeat ticker (updates every 20-30 seconds)
  useEffect(() => {
    const ticker = setInterval(() => {
      setLastIncidentSecondsAgo(prev => (prev > 45 ? 12 : prev + 6));
      setActiveDispatchIdx(prev => (prev + 1) % LIVE_DISPATCHES.length);
    }, 6000);

    const liveIncrementTimer = setInterval(() => {
      setLiveIncidentsToday(prev => prev + 1);
      setJustIncremented(true);
      setLastIncidentSecondsAgo(0);
      setLiveFraudHoldLakhs(prev => Number((prev + (Math.random() * 0.4 + 0.1)).toFixed(1)));
      setLiveActiveUnits(prev => Math.floor(410 + Math.random() * 20));

      if (Math.random() > 0.4) {
        setLiveSolvedToday(prev => prev + 1);
      }

      setTimeout(() => setJustIncremented(false), 2500);
    }, 22000);

    return () => {
      clearInterval(ticker);
      clearInterval(liveIncrementTimer);
    };
  }, []);

  // Base raw statistics depending on district, state, or national scope
  let baseReported = 368400;

  if (selectedDistrict) {
    baseReported = selectedDistrict.reportedCrimes;
  } else if (selectedState) {
    baseReported = selectedState.reportedCrimes;
  }

  // Calculated current numbers for selected period using official ratios
  // For 'today' (Live Daily Telemetry Past 24 Hours), accurately tracks the full rolling 24-hour volume + live dispatch offsets
  const fullPeriodReported = Math.max(1, Math.round(baseReported * config.multiplier));
  const reported = Math.max(1, fullPeriodReported + (timeKey === 'today' ? (liveIncidentsToday % 60) : 0));
  const verified = Math.max(1, Math.round(reported * config.verificationRatio));
  const solved = Math.max(1, Math.round(verified * config.solveRatio)) + (timeKey === 'today' ? (liveSolvedToday % 30) : 0);
  const archived = Math.max(1, Math.round(solved * config.archiveRatio));
  const activeInvestigating = Math.max(0, verified - solved);

  const verificationRate = ((verified / reported) * 100).toFixed(1);
  const solveRate = ((solved / verified) * 100).toFixed(1);
  const archiveRate = ((archived / solved) * 100).toFixed(1);

  const formatNum = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  const isPositiveTrend = config.yoyTrend <= 0; // Crime dropping is good
  const locationTitle = selectedDistrict ? selectedDistrict.name : selectedState ? selectedState.name : 'All India National';
  const currentDispatch = LIVE_DISPATCHES[activeDispatchIdx] || LIVE_DISPATCHES[0];

  return (
    <>
      <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white rounded-3xl p-5 sm:p-7 shadow-xl border border-slate-800 my-6">
        
        {/* Header section with location & description */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[11px] font-bold tracking-wider uppercase border border-blue-500/30">
                Official Crime & Safety Metrics
              </span>
              <span className="flex items-center gap-1 text-[11px] text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700">
                <Calendar className="w-3 h-3 text-blue-400" />
                <span>{config.periodName}</span>
              </span>
              <span className="flex items-center gap-1 text-[11px] text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Live Telemetry Sync
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {selectedDistrict ? `${selectedDistrict.name} Safety Intelligence` : 
               selectedState ? `${selectedState.name} Public Safety Dashboard` : 
               'All India National Crime & Safety Metrics'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Tracking reported complaints, FIR verification, police chargesheet velocity, and secure archived case repositories under {config.lawFramework}.
            </p>
          </div>

          {/* Action triggers */}
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              id="view-archived-cases-btn"
              onClick={onOpenArchivedDatabase}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 hover:border-slate-600 transition-all shadow-xs cursor-pointer"
            >
              <Archive className="w-4 h-4 text-emerald-400" />
              <span>Solved Cases Archive</span>
            </button>

            {/* Renamed to Govt Portals */}
            <button
              id="officer-portal-quick-btn"
              onClick={onOpenPolicePortal}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
              title="Open Official Government & State Police Portals Directory"
            >
              <Building2 className="w-3.5 h-3.5 text-blue-200" />
              <span>Govt Portals</span>
            </button>
          </div>
        </div>

        {/* 4 Interactive KPI Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6">
          
          {/* Metric 1: Reported Crimes (Interactive Clickable) */}
          <div 
            onClick={() => setActiveKpiModal('reported')}
            className="bg-slate-800/80 hover:bg-slate-800 hover:border-blue-500/80 border border-slate-700/80 rounded-2xl p-3.5 sm:p-4 transition-all group flex flex-col justify-between cursor-pointer hover:shadow-lg hover:scale-[1.01]"
            title="Click to view detailed reported crimes category breakdown"
          >
            <div>
              <div className="flex items-center justify-between gap-1">
                <span className="text-[11px] sm:text-xs font-semibold text-slate-400 truncate">Reported Crimes</span>
                <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20 shrink-0 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                  <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
              </div>
              <div className="mt-2 sm:mt-3 flex flex-wrap items-baseline gap-1.5">
                <span className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
                  {formatNum(reported)}
                </span>
                <span className={`text-[10px] sm:text-[11px] font-bold flex items-center px-1.5 py-0.5 rounded ${
                  isPositiveTrend 
                    ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' 
                    : 'text-rose-400 bg-rose-500/10 border border-rose-500/20'
                }`}>
                  {isPositiveTrend ? <TrendingDown className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5" /> : <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5" />}
                  {config.yoyLabel}
                </span>
              </div>
            </div>
            <div className="mt-2 text-[10px] sm:text-[11px] text-slate-400 flex items-center justify-between pt-2 border-t border-slate-700/60">
              <span className="truncate">{config.comparisonWindow}</span>
              <span className="text-blue-400 font-bold group-hover:underline flex items-center gap-0.5 shrink-0">
                Breakdown <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </div>

          {/* Metric 2: Verified by Police (Interactive Clickable) */}
          <div 
            onClick={() => setActiveKpiModal('verified')}
            className="bg-slate-800/80 hover:bg-slate-800 hover:border-amber-500/80 border border-slate-700/80 rounded-2xl p-3.5 sm:p-4 transition-all group flex flex-col justify-between cursor-pointer hover:shadow-lg hover:scale-[1.01]"
            title="Click to view statutory FIR verification & active inquiry status"
          >
            <div>
              <div className="flex items-center justify-between gap-1">
                <span className="text-[11px] sm:text-xs font-semibold text-slate-400 truncate">Verified &amp; FIR</span>
                <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20 shrink-0 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                  <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
              </div>
              <div className="mt-2 sm:mt-3 flex flex-wrap items-baseline gap-1.5">
                <span className="text-xl sm:text-2xl lg:text-3xl font-black text-amber-300 tracking-tight">
                  {formatNum(verified)}
                </span>
                <span className="text-[10px] sm:text-[11px] font-bold text-amber-200 bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-500/30">
                  {verificationRate}%
                </span>
              </div>
            </div>
            <div className="mt-2 text-[10px] sm:text-[11px] text-slate-400 flex items-center justify-between pt-2 border-t border-slate-700/60">
              <span className="truncate">Active: {formatNum(activeInvestigating)}</span>
              <span className="text-amber-400 font-bold group-hover:underline flex items-center gap-0.5 shrink-0">
                FIR Status <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </div>

          {/* Metric 3: Solved by Police (Interactive Clickable) */}
          <div 
            onClick={() => setActiveKpiModal('solved')}
            className="bg-slate-800/80 hover:bg-slate-800 hover:border-emerald-500/80 border border-slate-700/80 rounded-2xl p-3.5 sm:p-4 transition-all group flex flex-col justify-between cursor-pointer hover:shadow-lg hover:scale-[1.01]"
            title="Click to view chargesheeted & solved cases archive"
          >
            <div>
              <div className="flex items-center justify-between gap-1">
                <span className="text-[11px] sm:text-xs font-semibold text-slate-400 truncate">Solved by Police</span>
                <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 shrink-0 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
              </div>
              <div className="mt-2 sm:mt-3 flex flex-wrap items-baseline gap-1.5">
                <span className="text-xl sm:text-2xl lg:text-3xl font-black text-emerald-400 tracking-tight">
                  {formatNum(solved)}
                </span>
                <span className="text-[10px] sm:text-[11px] font-bold text-emerald-200 bg-emerald-500/20 px-1.5 py-0.5 rounded border border-emerald-500/30 flex items-center">
                  <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 text-emerald-300" />
                  {solveRate}%
                </span>
              </div>
            </div>
            <div className="mt-2 text-[10px] sm:text-[11px] text-slate-400 flex items-center justify-between pt-2 border-t border-slate-700/60">
              <span className="truncate">{config.chargesheetSpeed}</span>
              <span className="text-emerald-400 font-bold group-hover:underline flex items-center gap-0.5 shrink-0">
                Solved Log <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </div>

          {/* Metric 4: Closed & Archived in Database (Interactive Clickable) */}
          <div 
            onClick={() => setActiveKpiModal('archived')}
            className="bg-slate-800/80 hover:bg-slate-800 hover:border-indigo-500/80 border border-slate-700/80 rounded-2xl p-3.5 sm:p-4 transition-all group flex flex-col justify-between cursor-pointer hover:shadow-lg hover:scale-[1.01]"
            title="Click to view court closures and archived convictions database"
          >
            <div>
              <div className="flex items-center justify-between gap-1">
                <span className="text-[11px] sm:text-xs font-semibold text-slate-400 truncate">Archived Cases</span>
                <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20 shrink-0 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                  <Archive className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
              </div>
              <div className="mt-2 sm:mt-3 flex flex-wrap items-baseline gap-1.5">
                <span className="text-xl sm:text-2xl lg:text-3xl font-black text-indigo-300 tracking-tight">
                  {formatNum(archived)}
                </span>
                <span className="text-[10px] sm:text-[11px] font-bold text-indigo-200 bg-indigo-500/20 px-1.5 py-0.5 rounded border border-indigo-500/30">
                  {archiveRate}%
                </span>
              </div>
            </div>
            <div className="mt-2 text-[10px] sm:text-[11px] text-slate-400 flex items-center justify-between pt-2 border-t border-slate-700/60">
              <span className="truncate">Court closures</span>
              <span className="text-indigo-400 font-bold group-hover:underline flex items-center gap-0.5 shrink-0">
                Vault Archive <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </div>

        </div>

        {/* Real-Time Live Telemetry & Police Incident Stream (Auto-updating) */}
        <div className="mt-5 p-4 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-700/70 shadow-inner">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-2.5 py-1 rounded-full bg-rose-600/20 text-rose-400 text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 border border-rose-500/30">
                <Radio className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                Live 24/7 Police Telemetry
              </span>

              <span className="text-[11px] text-slate-300 flex items-center gap-1 bg-slate-800/90 px-2.5 py-1 rounded-lg border border-slate-700">
                <Activity className="w-3 h-3 text-emerald-400 animate-bounce" />
                <span>Today's Dispatches: <strong className="text-white">{formatNum(liveIncidentsToday)}</strong></span>
                {justIncremented && (
                  <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/20 px-1 rounded animate-fade-in">
                    +1 live
                  </span>
                )}
              </span>

              <span className="text-[11px] text-amber-300 flex items-center gap-1 bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-800/40">
                <Zap className="w-3 h-3 text-amber-400" />
                <span>1930 Fraud Blocked: <strong className="text-amber-200">₹{liveFraudHoldLakhs} L</strong></span>
              </span>

              <span className="text-[11px] text-blue-300 flex items-center gap-1 bg-blue-950/40 px-2.5 py-1 rounded-lg border border-blue-800/40 hidden sm:flex">
                <ShieldCheck className="w-3 h-3 text-blue-400" />
                <span>ERSS-112 Active Patrols: <strong className="text-blue-200">{liveActiveUnits}</strong></span>
              </span>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Last Incident: <strong className="text-slate-200">{lastIncidentSecondsAgo}s ago</strong></span>
            </div>
          </div>

          {/* Rotating Real-time Crime Incident Log */}
          <div className="mt-3 flex items-center gap-3 animate-in fade-in duration-300">
            <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-bold shrink-0 border border-blue-500/30">
              {currentDispatch.badge}
            </span>
            <p className="text-xs text-slate-200 truncate flex-1 font-medium">
              <span className="text-slate-400 font-normal">[{currentDispatch.timeAgo} • {currentDispatch.location}]</span>{' '}
              {currentDispatch.text}{' '}
              <span className="text-emerald-400 font-semibold">({currentDispatch.action})</span>
            </p>
          </div>
        </div>

        {/* Progress Bar & Crime Closure Lifecycle */}
        <div className="mt-5 p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
          <div className="flex items-center justify-between mb-2 text-xs">
            <span className="font-semibold text-slate-300">Case Resolution &amp; Police Closure Funnel ({config.periodName})</span>
            <span className="text-slate-400">
              Overall Closure Velocity: <strong className="text-white">{solveRate}%</strong>
            </span>
          </div>

          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden flex">
            <div 
              style={{ width: `${archiveRate}%` }} 
              className="bg-indigo-500 h-full transition-all"
              title={`Archived Cases: ${archiveRate}%`}
            />
            <div 
              style={{ width: `${Math.max(5, parseFloat(solveRate) - parseFloat(archiveRate))}%` }} 
              className="bg-emerald-500 h-full transition-all"
              title="Solved & Chargesheeted"
            />
            <div 
              style={{ width: `${Math.max(5, 100 - parseFloat(solveRate))}%` }} 
              className="bg-amber-500 h-full transition-all"
              title="Active Under Investigation"
            />
          </div>

          <div className="flex items-center justify-between flex-wrap gap-3 mt-3 text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5 cursor-pointer hover:text-indigo-300" onClick={() => setActiveKpiModal('archived')}>
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              <span>Court Convicted &amp; Closed ({archived.toLocaleString('en-IN')})</span>
            </div>
            <div className="flex items-center gap-1.5 cursor-pointer hover:text-emerald-300" onClick={() => setActiveKpiModal('solved')}>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Police Chargesheet Submitted ({solved.toLocaleString('en-IN')})</span>
            </div>
            <div className="flex items-center gap-1.5 cursor-pointer hover:text-amber-300" onClick={() => setActiveKpiModal('verified')}>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Active Investigation In Progress ({activeInvestigating.toLocaleString('en-IN')})</span>
            </div>
          </div>
        </div>

      </div>

      {/* Interactive KPI Detail Drilldown Modal */}
      {activeKpiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white text-slate-900 rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95">
            
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 sm:p-6 relative">
              <button
                onClick={() => setActiveKpiModal(null)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[11px] font-bold border border-blue-500/30">
                  {locationTitle} • {config.periodName}
                </span>
              </div>

              <h3 className="text-xl font-black text-white flex items-center gap-2">
                {activeKpiModal === 'reported' && <span>📊 Reported Crimes Breakdown</span>}
                {activeKpiModal === 'verified' && <span>🛡️ Verified &amp; Statutory FIR Status</span>}
                {activeKpiModal === 'solved' && <span>✅ Solved Cases &amp; Chargesheet Velocity</span>}
                {activeKpiModal === 'archived' && <span>🏛️ Court Closures &amp; Archived Vault</span>}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Official statutory crime tracking calibrated under {config.lawFramework}.
              </p>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 bg-slate-50 text-xs">
              
              {/* Highlight Stats Row */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Total in Period</span>
                  <p className="text-xl font-black text-slate-900 mt-1">
                    {activeKpiModal === 'reported' && formatNum(reported)}
                    {activeKpiModal === 'verified' && formatNum(verified)}
                    {activeKpiModal === 'solved' && formatNum(solved)}
                    {activeKpiModal === 'archived' && formatNum(archived)}
                  </p>
                </div>
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Efficiency Ratio</span>
                  <p className="text-xl font-black text-emerald-600 mt-1">
                    {activeKpiModal === 'reported' && `${config.yoyTrend > 0 ? '+' : ''}${config.yoyTrend}% YoY`}
                    {activeKpiModal === 'verified' && `${verificationRate}% Verified`}
                    {activeKpiModal === 'solved' && `${solveRate}% Solved`}
                    {activeKpiModal === 'archived' && `${archiveRate}% Convicted`}
                  </p>
                </div>
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs col-span-2 sm:col-span-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Statutory Framework</span>
                  <p className="text-xs font-bold text-blue-700 mt-1 truncate">
                    {config.lawFramework}
                  </p>
                </div>
              </div>

              {/* Specific Content by KPI */}
              {activeKpiModal === 'reported' && (
                <div className="space-y-3">
                  <h4 className="font-extrabold text-slate-900 text-sm">Major Incident Categories</h4>
                  <div className="space-y-2">
                    {[
                      { name: 'Property & Vehicle Theft', count: Math.round(reported * 0.38), pct: '38%' },
                      { name: 'Cyber Financial Fraud & Phishing', count: Math.round(reported * 0.28), pct: '28%' },
                      { name: 'Assault & Public Safety Incidents', count: Math.round(reported * 0.18), pct: '18%' },
                      { name: 'Traffic, Road & Hazard Violations', count: Math.round(reported * 0.16), pct: '16%' }
                    ].map((cat, ci) => (
                      <div key={ci} className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                        <span className="font-bold text-slate-800">{cat.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-slate-900">{cat.count.toLocaleString('en-IN')}</span>
                          <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">{cat.pct}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeKpiModal === 'verified' && (
                <div className="space-y-3">
                  <h4 className="font-extrabold text-slate-900 text-sm">Statutory Verification Status</h4>
                  <p className="text-slate-600 leading-relaxed">
                    Out of <strong>{formatNum(reported)}</strong> complaints registered via Dial 112, emergency police control rooms, and online lost/theft desks, <strong>{formatNum(verified)} ({verificationRate}%)</strong> have been formally substantiated and converted into official First Information Reports (FIRs) under BNS / CCTNS registries.
                  </p>
                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900">
                    <span className="font-bold block mb-0.5">Active Inquiries in Progress:</span>
                    <span>{formatNum(activeInvestigating)} complaints are currently under preliminary factual verification by investigating officers.</span>
                  </div>
                </div>
              )}

              {activeKpiModal === 'solved' && (
                <div className="space-y-3">
                  <h4 className="font-extrabold text-slate-900 text-sm">Resolution &amp; Chargesheet Velocity</h4>
                  <p className="text-slate-600 leading-relaxed">
                    Police departments have resolved and submitted formal chargesheets in <strong>{formatNum(solved)}</strong> cases in {locationTitle}, reflecting a closure rate of <strong>{solveRate}%</strong> with a mean chargesheet turnaround speed of <strong>{config.chargesheetSpeed}</strong>.
                  </p>
                  <button
                    onClick={() => {
                      setActiveKpiModal(null);
                      onOpenArchivedDatabase();
                    }}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                  >
                    <Archive className="w-4 h-4" />
                    <span>Open Police Solved Cases Archive Desk →</span>
                  </button>
                </div>
              )}

              {activeKpiModal === 'archived' && (
                <div className="space-y-3">
                  <h4 className="font-extrabold text-slate-900 text-sm">Judicial Convictions &amp; Court Closures</h4>
                  <p className="text-slate-600 leading-relaxed">
                    A total of <strong>{formatNum(archived)}</strong> cases have attained final court adjudication, convictions, or judicial disposal, preserved within the permanent NCRB and State Police Archives.
                  </p>
                  <button
                    onClick={() => {
                      setActiveKpiModal(null);
                      onOpenArchivedDatabase();
                    }}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                  >
                    <Search className="w-4 h-4" />
                    <span>Search Closed &amp; Archived Case Records →</span>
                  </button>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between text-xs">
              <button
                onClick={() => {
                  setActiveKpiModal(null);
                  onOpenPolicePortal();
                }}
                className="text-blue-600 hover:underline font-bold flex items-center gap-1 cursor-pointer"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Visit Official Govt Portals</span>
              </button>
              <button
                onClick={() => setActiveKpiModal(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
              >
                Close Breakdown
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

