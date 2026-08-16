import React, { useState } from 'react';
import { Calendar, Filter, MapPin, RefreshCw, X, ChevronRight, Check } from 'lucide-react';
import { TimeRangeKey, StateInfo, DistrictInfo } from '../types';

interface DateFilterBarProps {
  timeKey: TimeRangeKey;
  onChangeTimeKey: (key: TimeRangeKey) => void;
  customStartDate: string;
  customEndDate: string;
  onChangeCustomDates: (start: string, end: string) => void;
  selectedState: StateInfo | null;
  selectedDistrict: DistrictInfo | null;
  onSelectState: (state: StateInfo | null) => void;
  onSelectDistrict: (district: DistrictInfo | null) => void;
  statesList: StateInfo[];
  onResetFilters: () => void;
}

export const DateFilterBar: React.FC<DateFilterBarProps> = ({
  timeKey,
  onChangeTimeKey,
  customStartDate,
  customEndDate,
  onChangeCustomDates,
  selectedState,
  selectedDistrict,
  onSelectState,
  onSelectDistrict,
  statesList,
  onResetFilters
}) => {
  const [showCustomModal, setShowCustomModal] = useState<boolean>(false);
  const [tempStart, setTempStart] = useState<string>(customStartDate || '2026-08-01');
  const [tempEnd, setTempEnd] = useState<string>(customEndDate || '2026-08-15');

  const timeOptions: { key: TimeRangeKey; label: string; badge?: string }[] = [
    { key: 'today', label: 'Today (Live)' },
    { key: '7d', label: 'Last 7 Days' },
    { key: '30d', label: 'Last 30 Days' },
    { key: 'ytd', label: '2026 (YTD)', badge: 'Current' },
    { key: '2025', label: 'Year 2025' },
    { key: '2024', label: 'Year 2024' },
    { key: 'custom', label: 'Custom Dates' }
  ];

  const handleApplyCustom = () => {
    onChangeCustomDates(tempStart, tempEnd);
    onChangeTimeKey('custom');
    setShowCustomModal(false);
  };

  const hasActiveFilters = selectedState !== null || selectedDistrict !== null || timeKey !== 'ytd';

  return (
    <div className="bg-white border-b border-slate-200 py-3 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          
          {/* Left: Time Period Selector Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mr-1 shrink-0">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>Timeframe:</span>
            </div>

            {timeOptions.map((opt) => {
              const isSelected = timeKey === opt.key;
              return (
                <button
                  key={opt.key}
                  id={`time-filter-${opt.key}`}
                  onClick={() => {
                    if (opt.key === 'custom') {
                      setShowCustomModal(true);
                    } else {
                      onChangeTimeKey(opt.key);
                    }
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white font-semibold shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <span>{opt.label}</span>
                  {opt.badge && (
                    <span className={`text-[9px] px-1 py-0.2 rounded font-bold ${
                      isSelected ? 'bg-blue-800 text-blue-100' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {opt.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right: State & District Deep Filter & Reset Button */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
            
            {/* State Filter Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <label htmlFor="state-filter-select" className="text-slate-500 font-medium">State:</label>
              <select
                id="state-filter-select"
                value={selectedState?.id || ''}
                onChange={(e) => {
                  const stateId = e.target.value;
                  if (!stateId) {
                    onSelectState(null);
                    onSelectDistrict(null);
                  } else {
                    const st = statesList.find(s => s.id === stateId) || null;
                    onSelectState(st);
                    onSelectDistrict(null);
                  }
                }}
                className="bg-transparent font-semibold text-slate-800 focus:outline-hidden cursor-pointer"
              >
                <option value="">All India (National)</option>
                {statesList.map(st => (
                  <option key={st.id} value={st.id}>
                    {st.name} ({st.code})
                  </option>
                ))}
              </select>
            </div>

            {/* District Filter Dropdown (Enabled if state has districts) */}
            {selectedState && selectedState.districts.length > 0 && (
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs animate-in fade-in">
                <span className="text-slate-500 font-medium">District/City:</span>
                <select
                  id="district-filter-select"
                  value={selectedDistrict?.id || ''}
                  onChange={(e) => {
                    const distId = e.target.value;
                    if (!distId) {
                      onSelectDistrict(null);
                    } else {
                      const dist = selectedState.districts.find(d => d.id === distId) || null;
                      onSelectDistrict(dist);
                    }
                  }}
                  className="bg-transparent font-semibold text-slate-800 focus:outline-hidden cursor-pointer"
                >
                  <option value="">All {selectedState.name} Districts</option>
                  {selectedState.districts.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Clear / Reset Filters */}
            {hasActiveFilters && (
              <button
                id="reset-all-filters-btn"
                onClick={onResetFilters}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold transition-colors cursor-pointer"
                title="Reset all date and region filters"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}

          </div>

        </div>

        {/* Current Active Filter Indicator Breadcrumb */}
        <div className="flex items-center flex-wrap gap-2 mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-600">
          <span className="font-semibold text-slate-400 uppercase tracking-wider">Active Metrics Scope:</span>
          
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-semibold border border-blue-200">
            📍 {selectedDistrict ? `${selectedDistrict.name}, ${selectedState?.name}` : selectedState ? selectedState.name : 'All India (National)'}
            {selectedState && (
              <button 
                onClick={() => { onSelectState(null); onSelectDistrict(null); }}
                className="hover:text-rose-600 ml-0.5"
                title="Remove state filter"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </span>

          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
            📅 {timeKey === 'custom' ? `${tempStart} to ${tempEnd}` : timeOptions.find(t => t.key === timeKey)?.label}
          </span>

          {selectedDistrict && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
              🚔 {selectedDistrict.policeStationsCount} Police Stations Monitored
            </span>
          )}
        </div>

      </div>

      {/* Custom Date Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">Select Custom Date Range</h3>
              </div>
              <button onClick={() => setShowCustomModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 my-5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">From Date (Starting):</label>
                <input
                  type="date"
                  value={tempStart}
                  onChange={(e) => setTempStart(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">To Date (Ending):</label>
                <input
                  type="date"
                  value={tempEnd}
                  onChange={(e) => setTempEnd(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="p-3 bg-blue-50 rounded-xl text-xs text-blue-800 leading-relaxed">
                ℹ️ Pramaan Bharat will recalculate verified FIR numbers, solved police cases, and category risk metrics for the exact selected historical interval.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowCustomModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyCustom}
                className="px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Apply Date Filter</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
