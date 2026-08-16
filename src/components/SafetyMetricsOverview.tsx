import React from 'react';
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
  Calendar
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

export const SafetyMetricsOverview: React.FC<SafetyMetricsOverviewProps> = ({
  selectedState,
  selectedDistrict,
  timeKey,
  customStartDate,
  customEndDate,
  onOpenArchivedDatabase,
  onOpenPolicePortal
}) => {
  const config = getTimeframeMetricsConfig(timeKey, customStartDate, customEndDate);

  // Base raw statistics depending on district, state, or national scope
  let baseReported = 368400;

  if (selectedDistrict) {
    baseReported = selectedDistrict.reportedCrimes;
  } else if (selectedState) {
    baseReported = selectedState.reportedCrimes;
  }

  // Calculated current numbers for selected period using year-specific ratios
  const reported = Math.max(1, Math.round(baseReported * config.multiplier));
  const verified = Math.max(1, Math.round(reported * config.verificationRatio));
  const solved = Math.max(1, Math.round(verified * config.solveRatio));
  const archived = Math.max(1, Math.round(solved * config.archiveRatio));
  const activeInvestigating = Math.max(0, verified - solved);

  const verificationRate = ((verified / reported) * 100).toFixed(1);
  const solveRate = ((solved / verified) * 100).toFixed(1);
  const archiveRate = ((archived / solved) * 100).toFixed(1);

  const formatNum = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  const isPositiveTrend = config.yoyTrend <= 0; // Crime dropping is good

  return (
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
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            id="view-archived-cases-btn"
            onClick={onOpenArchivedDatabase}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 hover:border-slate-600 transition-all shadow-xs cursor-pointer"
          >
            <Archive className="w-4 h-4 text-emerald-400" />
            <span>Solved Cases Archive</span>
          </button>

          <button
            id="officer-portal-quick-btn"
            onClick={onOpenPolicePortal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5 text-amber-300" />
            <span>Authorized Officer Login</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6">
        
        {/* Metric 1: Reported Crimes */}
        <div className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-2xl p-3.5 sm:p-4 transition-all group flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-1">
              <span className="text-[11px] sm:text-xs font-semibold text-slate-400 truncate">Reported Crimes</span>
              <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20 shrink-0">
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
            <span className="text-blue-400 font-medium shrink-0">Monitored</span>
          </div>
        </div>

        {/* Metric 2: Verified by Police */}
        <div className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-2xl p-3.5 sm:p-4 transition-all group flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-1">
              <span className="text-[11px] sm:text-xs font-semibold text-slate-400 truncate">Verified & FIR</span>
              <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20 shrink-0">
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
            <span className="text-amber-400 font-medium shrink-0">{config.lawFramework.split(' ')[0]}</span>
          </div>
        </div>

        {/* Metric 3: Solved by Police */}
        <div className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-2xl p-3.5 sm:p-4 transition-all group flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-1">
              <span className="text-[11px] sm:text-xs font-semibold text-slate-400 truncate">Solved by Police</span>
              <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 shrink-0">
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
            <span className="truncate">Chargesheet velocity</span>
            <span className="text-emerald-400 font-medium shrink-0">{config.chargesheetSpeed}</span>
          </div>
        </div>

        {/* Metric 4: Closed & Archived in Database */}
        <div className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-2xl p-3.5 sm:p-4 transition-all group flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-1">
              <span className="text-[11px] sm:text-xs font-semibold text-slate-400 truncate">Archived Cases</span>
              <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20 shrink-0">
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
            <span className="text-indigo-400 font-medium shrink-0">Vault Log</span>
          </div>
        </div>
      </div>

      {/* Progress Bar & Crime Closure Lifecycle */}
      <div className="mt-6 p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
        <div className="flex items-center justify-between mb-2 text-xs">
          <span className="font-semibold text-slate-300">Case Resolution & Police Closure Funnel ({config.periodName})</span>
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
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            <span>Court Convicted & Closed ({archived.toLocaleString('en-IN')})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Police Chargesheet Submitted ({solved.toLocaleString('en-IN')})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Active Investigation In Progress ({activeInvestigating.toLocaleString('en-IN')})</span>
          </div>
        </div>
      </div>

    </div>
  );
};

