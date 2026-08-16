import React from 'react';
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
  Calendar
} from 'lucide-react';
import { CrimeCategory, CrimeCategoryStat, TimeRangeKey } from '../types';
import { getCategoryStatsForTimeframe, getTimeframeMetricsConfig } from '../data/crimeData';

interface CrimeCategoryAnalyticsProps {
  selectedCategory: CrimeCategory | null;
  onSelectCategory: (cat: CrimeCategory | null) => void;
  timeKey: TimeRangeKey;
  customStartDate?: string;
  customEndDate?: string;
}

export const CrimeCategoryAnalytics: React.FC<CrimeCategoryAnalyticsProps> = ({
  selectedCategory,
  onSelectCategory,
  timeKey,
  customStartDate,
  customEndDate
}) => {
  const timeframeConfig = getTimeframeMetricsConfig(timeKey, customStartDate, customEndDate);
  const categoriesData = getCategoryStatsForTimeframe(timeKey, customStartDate, customEndDate);

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

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-sm border border-slate-200 my-6">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-bold tracking-wider uppercase border border-indigo-200">
              Crime Categorization & Resolution Engine
            </span>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
              <Calendar className="w-3 h-3 text-indigo-600" />
              <span>{timeframeConfig.periodName}</span>
            </span>
          </div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">
            Incident Breakdown by Crime Category & Police Resolution Rates
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Compare reported volume, FIR verification compliance, chargesheet velocity, and YoY trends across offense types.
          </p>
        </div>

        {selectedCategory && (
          <button
            onClick={() => onSelectCategory(null)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition-colors self-start sm:self-auto cursor-pointer"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Clear Category Filter ({selectedCategory})</span>
          </button>
        )}
      </div>

      {/* Cards Grid for Categories */}
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
              onClick={() => onSelectCategory(isSelected ? null : catStat.category)}
              className={`rounded-2xl p-4 border transition-all cursor-pointer relative flex flex-col justify-between ${
                isSelected
                  ? 'bg-blue-50/70 border-blue-500 ring-2 ring-blue-500/20 shadow-md'
                  : 'bg-slate-50/60 hover:bg-slate-50 border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div>
                {/* Header with Icon & YoY */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-white shadow-2xs border border-slate-200/70 flex items-center justify-center">
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

              {/* Numbers & Progress Bar */}
              <div className="mt-4 pt-3 border-t border-slate-200/60">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-slate-500">Reported</span>
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
                  <span className="text-slate-500 flex items-center gap-0.5 font-medium">
                    <Clock className="w-3 h-3 text-slate-400" /> ~{catStat.averageResolutionDays}d
                  </span>
                </div>
              </div>

              {isSelected && (
                <div className="mt-2.5 text-[10px] text-blue-700 font-bold bg-blue-100/60 text-center py-1 rounded-md">
                  ✓ Active Category Filter (Click to Deselect)
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};
