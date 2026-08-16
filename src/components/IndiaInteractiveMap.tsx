import React, { useState } from 'react';
import { 
  MapPin, 
  Navigation, 
  ShieldAlert, 
  ShieldCheck, 
  Eye, 
  TrendingUp, 
  PhoneCall, 
  Layers, 
  Info, 
  Search,
  ExternalLink,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { StateInfo, DistrictInfo, RiskLevel } from '../types';

interface IndiaInteractiveMapProps {
  statesList: StateInfo[];
  selectedState: StateInfo | null;
  selectedDistrict: DistrictInfo | null;
  onSelectState: (state: StateInfo | null) => void;
  onSelectDistrict: (district: DistrictInfo | null) => void;
  onOpenAISafetyBriefing: () => void;
}

export const IndiaInteractiveMap: React.FC<IndiaInteractiveMapProps> = ({
  statesList,
  selectedState,
  selectedDistrict,
  onSelectState,
  onSelectDistrict,
  onOpenAISafetyBriefing
}) => {
  const [hoveredState, setHoveredState] = useState<StateInfo | null>(null);
  const [mapSearch, setMapSearch] = useState<string>('');
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  // SVG grid coordinate layout positions for India states for clean responsive vector rendering
  // (x, y percentages matching India's geographic outline)
  const STATE_COORDINATES: Record<string, { x: number; y: number; label: string; svgD: string }> = {
    'delhi-ncr': { x: 38, y: 26, label: 'Delhi NCR', svgD: 'M 36 24 L 41 24 L 41 28 L 36 28 Z' },
    'punjab': { x: 32, y: 20, label: 'Punjab', svgD: 'M 29 17 L 36 17 L 35 24 L 29 23 Z' },
    'rajasthan': { x: 25, y: 34, label: 'Rajasthan', svgD: 'M 18 27 L 34 26 L 33 42 L 20 42 Z' },
    'uttar-pradesh': { x: 47, y: 32, label: 'Uttar Pradesh', svgD: 'M 37 27 L 57 29 L 55 42 L 37 38 Z' },
    'gujarat': { x: 19, y: 46, label: 'Gujarat', svgD: 'M 12 42 L 27 41 L 28 54 L 14 55 Z' },
    'madhya-pradesh': { x: 42, y: 48, label: 'Madhya Pradesh', svgD: 'M 31 43 L 53 43 L 52 56 L 31 55 Z' },
    'maharashtra': { x: 34, y: 61, label: 'Maharashtra', svgD: 'M 24 55 L 47 55 L 46 70 L 26 69 Z' },
    'telangana': { x: 46, y: 66, label: 'Telangana', svgD: 'M 42 61 L 52 61 L 51 72 L 41 71 Z' },
    'andhra-pradesh': { x: 48, y: 76, label: 'Andhra Pradesh', svgD: 'M 44 71 L 57 68 L 51 86 L 43 83 Z' },
    'karnataka': { x: 33, y: 76, label: 'Karnataka', svgD: 'M 28 69 L 41 69 L 39 87 L 29 86 Z' },
    'tamil-nadu': { x: 43, y: 88, label: 'Tamil Nadu', svgD: 'M 36 84 L 49 84 L 46 97 L 38 97 Z' },
    'kerala': { x: 34, y: 90, label: 'Kerala', svgD: 'M 31 87 L 37 87 L 36 98 L 32 98 Z' },
    'west-bengal': { x: 67, y: 46, label: 'West Bengal', svgD: 'M 63 38 L 71 39 L 69 57 L 63 56 Z' },
    'odisha': { x: 61, y: 58, label: 'Odisha', svgD: 'M 54 52 L 67 52 L 64 66 L 53 65 Z' },
    'assam': { x: 80, y: 35, label: 'Assam & NE', svgD: 'M 73 30 L 88 29 L 87 43 L 73 42 Z' }
  };

  const getRiskColor = (level: RiskLevel, isHovered: boolean, isSelected: boolean) => {
    if (isSelected) return '#2563EB'; // Vibrant Blue
    if (isHovered) return '#3B82F6';

    switch (level) {
      case 'High':
        return '#EF4444'; // Red
      case 'Moderate':
        return '#F59E0B'; // Amber
      default:
        return '#10B981'; // Emerald
    }
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation not supported by browser.');
      return;
    }

    setIsLocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { latitude, longitude } = pos.coords;
        
        // Find nearest state by Euclidean distance to centerCoordinates
        let closestState = statesList[0];
        let minDistance = Infinity;

        statesList.forEach(st => {
          const [sLat, sLng] = st.centerCoordinates;
          const dist = Math.sqrt(Math.pow(latitude - sLat, 2) + Math.pow(longitude - sLng, 2));
          if (dist < minDistance) {
            minDistance = dist;
            closestState = st;
          }
        });

        onSelectState(closestState);
        if (closestState.districts.length > 0) {
          onSelectDistrict(closestState.districts[0]);
        }
      },
      () => {
        setIsLocating(false);
        // Fallback to Delhi NCR if user denies permission
        const defaultState = statesList.find(s => s.id === 'delhi-ncr') || statesList[0];
        onSelectState(defaultState);
      }
    );
  };

  const filteredStates = mapSearch 
    ? statesList.filter(s => 
        s.name.toLowerCase().includes(mapSearch.toLowerCase()) ||
        s.hindiName.includes(mapSearch) ||
        s.districts.some(d => d.name.toLowerCase().includes(mapSearch.toLowerCase()))
      )
    : statesList;

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-sm border border-slate-200 my-6">
      
      {/* Title & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[11px] font-bold tracking-wider uppercase border border-rose-200">
              Interactive Risk Map & Zone Explorer
            </span>
            <span className="text-slate-400 text-xs hidden sm:inline">• Click on any region to filter news</span>
          </div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>India Real-Time Crime & Public Safety Map</span>
          </h3>
        </div>

        {/* GPS Locate Me & Search */}
        <div className="flex items-center gap-2 flex-wrap">
          
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={mapSearch}
              onChange={(e) => setMapSearch(e.target.value)}
              placeholder="Find state or city..."
              className="pl-8 pr-3 py-1.5 bg-slate-100 text-slate-900 text-xs rounded-full border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-blue-500 w-44"
            />
          </div>

          <button
            id="locate-user-region-btn"
            onClick={handleLocateMe}
            disabled={isLocating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-semibold transition-colors cursor-pointer"
            title="Auto-detect nearest Indian state & district"
          >
            <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'Locating...' : 'Locate My Region'}</span>
          </button>

          {selectedState && (
            <button
              onClick={() => { onSelectState(null); onSelectDistrict(null); }}
              className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium transition-colors"
            >
              Reset Map
            </button>
          )}

        </div>
      </div>

      {/* Map Legend */}
      <div className="flex items-center justify-between flex-wrap gap-3 py-3 border-b border-slate-100 text-xs">
        <div className="flex items-center gap-4">
          <span className="font-semibold text-slate-500 text-[11px]">Risk Intensity:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-rose-500 shadow-xs" />
            <span className="text-slate-700 font-medium">High Risk (Hotspot)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-amber-500 shadow-xs" />
            <span className="text-slate-700 font-medium">Moderate (Monitored)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-emerald-500 shadow-xs" />
            <span className="text-slate-700 font-medium">Low Incident / Safe</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 font-medium">
          Source: State Police Commissionerates & NCRB Integrated Feeds
        </div>
      </div>

      {/* Main Map + District Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4 items-start">
        
        {/* Left 7 Columns: Interactive Vector Map Stage */}
        <div className="lg:col-span-7 bg-slate-950 rounded-2xl p-4 sm:p-6 relative overflow-hidden border border-slate-800 shadow-inner flex flex-col items-center justify-center min-h-[420px]">
          
          {/* Background grid subtle overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px] opacity-30" />

          {/* SVG Map Canvas */}
          <svg
            viewBox="0 0 100 105"
            className="w-full max-w-[480px] h-auto relative z-10 select-none drop-shadow-2xl"
          >
            {/* National Boundary outline subtle */}
            <path
              d="M 32 10 L 42 10 L 52 18 L 68 28 L 88 28 L 92 42 L 75 45 L 70 58 L 58 75 L 48 98 L 36 98 L 28 75 L 14 55 L 14 38 L 26 22 Z"
              fill="none"
              stroke="#334155"
              strokeWidth="1.2"
              strokeDasharray="2 2"
            />

            {/* Render Each State as an interactive polygon block */}
            {statesList.map((st) => {
              const coords = STATE_COORDINATES[st.id];
              if (!coords) return null;

              const isSelected = selectedState?.id === st.id;
              const isHovered = hoveredState?.id === st.id;
              const fillColor = getRiskColor(st.riskLevel, isHovered, isSelected);

              return (
                <g
                  key={st.id}
                  className="cursor-pointer transition-all duration-200"
                  onClick={() => {
                    onSelectState(st);
                    onSelectDistrict(st.districts[0] || null);
                  }}
                  onMouseEnter={() => setHoveredState(st)}
                  onMouseLeave={() => setHoveredState(null)}
                >
                  <path
                    d={coords.svgD}
                    fill={fillColor}
                    stroke={isSelected ? '#FFFFFF' : '#0F172A'}
                    strokeWidth={isSelected ? '1.5' : '0.8'}
                    className="transition-all hover:brightness-125 filter"
                  />
                  {/* State abbreviation text */}
                  <text
                    x={coords.x}
                    y={coords.y}
                    fill="#FFFFFF"
                    fontSize="3.2"
                    fontWeight="bold"
                    textAnchor="middle"
                    pointerEvents="none"
                    className="drop-shadow-xs"
                  >
                    {st.code}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Interactive Floating Hover Card */}
          {hoveredState && (
            <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-72 bg-slate-900/95 backdrop-blur-md text-white p-3.5 rounded-xl border border-slate-700 shadow-2xl z-20 animate-in fade-in zoom-in-95 pointer-events-none">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-sm text-white">{hoveredState.name}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-black uppercase ${
                  hoveredState.riskLevel === 'High' ? 'bg-rose-500 text-white' :
                  hoveredState.riskLevel === 'Moderate' ? 'bg-amber-500 text-slate-950' : 'bg-emerald-500 text-white'
                }`}>
                  {hoveredState.riskLevel} Risk
                </span>
              </div>
              
              <p className="text-[11px] text-slate-300 mt-1 line-clamp-1">
                ⚠️ {hoveredState.primaryConcern}
              </p>

              <div className="grid grid-cols-3 gap-1.5 mt-2.5 pt-2 border-t border-slate-800 text-[10px]">
                <div>
                  <span className="text-slate-400 block">Reported</span>
                  <span className="font-bold text-white">{hoveredState.reportedCrimes.toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Verified</span>
                  <span className="font-bold text-amber-300">{hoveredState.verifiedCrimes.toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Solved</span>
                  <span className="font-bold text-emerald-400">{hoveredState.solvedCrimes.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          )}

          {/* Bottom helper text */}
          <div className="relative z-10 mt-3 text-[11px] text-slate-400 flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-blue-400" />
            <span>Click any state block above to drill into district police stations & verified alerts.</span>
          </div>
        </div>

        {/* Right 5 Columns: Selected State & District Drilldown */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          
          {selectedState ? (
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 shadow-2xs">
              
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-lg font-black text-slate-900">{selectedState.name}</h4>
                    <span className="text-xs text-slate-500 font-semibold">({selectedState.hindiName})</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Zone: <strong className="text-slate-700">{selectedState.zone} India</strong> • Capital: <strong>{selectedState.capital}</strong>
                  </p>
                </div>

                <span className={`text-xs px-2.5 py-1 rounded-md font-bold uppercase ${
                  selectedState.riskLevel === 'High' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                  selectedState.riskLevel === 'Moderate' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                }`}>
                  {selectedState.riskLevel} Risk
                </span>
              </div>

              {/* State Police HQ */}
              <div className="p-3 bg-white rounded-xl border border-slate-200/80 my-3 text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">State Police HQ</span>
                <span className="font-semibold text-slate-800">{selectedState.policeHeadquarters}</span>
                <p className="text-slate-600 mt-1">
                  <strong>Key Focus:</strong> {selectedState.primaryConcern}
                </p>
              </div>

              {/* Districts List Selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Districts & Police Commissionerates ({selectedState.districts.length})
                  </span>
                  <span className="text-[11px] text-blue-600 font-semibold">Click to select district</span>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {selectedState.districts.map((dist) => {
                    const isDistSelected = selectedDistrict?.id === dist.id;
                    return (
                      <div
                        key={dist.id}
                        id={`district-card-${dist.id}`}
                        onClick={() => onSelectDistrict(dist)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer ${
                          isDistSelected
                            ? 'bg-blue-600 text-white border-blue-700 shadow-sm'
                            : 'bg-white hover:bg-slate-100/80 border-slate-200 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 font-bold text-xs">
                            <MapPin className={`w-3.5 h-3.5 ${isDistSelected ? 'text-white' : 'text-blue-600'}`} />
                            <span>{dist.name}</span>
                          </div>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                            isDistSelected 
                              ? 'bg-blue-700 text-white' 
                              : dist.riskLevel === 'High' ? 'bg-rose-100 text-rose-700' :
                                dist.riskLevel === 'Moderate' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {dist.riskLevel}
                          </span>
                        </div>

                        <p className={`text-[11px] mt-1 line-clamp-1 ${isDistSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                          {dist.primaryConcern}
                        </p>

                        <div className={`flex items-center justify-between mt-2 pt-2 border-t text-[10px] ${
                          isDistSelected ? 'border-blue-500 text-blue-100' : 'border-slate-100 text-slate-400'
                        }`}>
                          <span>🚨 {dist.policeStationsCount} Police Stations</span>
                          <span>☎️ {dist.emergencyHelpline.split('/')[0]}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* AI Briefing Button for this state */}
              <button
                onClick={onOpenAISafetyBriefing}
                className="w-full mt-4 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Generate AI Safety Intelligence for {selectedState.name}</span>
              </button>

            </div>
          ) : (
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 text-center flex flex-col items-center justify-center min-h-[360px]">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-3">
                <MapPin className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Select an Indian State on the Map</h4>
              <p className="text-xs text-slate-500 max-w-xs mt-1.5 leading-relaxed">
                Click any region or state polygon to inspect local police stations, reported crime statistics, district hotspots, and live emergency contacts.
              </p>

              <div className="grid grid-cols-2 gap-2 w-full mt-5">
                {statesList.slice(0, 6).map(st => (
                  <button
                    key={st.id}
                    onClick={() => {
                      onSelectState(st);
                      onSelectDistrict(st.districts[0] || null);
                    }}
                    className="p-2 bg-white hover:bg-blue-50 hover:border-blue-300 border border-slate-200 rounded-xl text-left text-xs font-semibold text-slate-800 transition-colors flex items-center justify-between"
                  >
                    <span>{st.name}</span>
                    <ChevronRight className="w-3 h-3 text-slate-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
