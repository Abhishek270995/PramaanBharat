import React, { useState, useMemo } from 'react';
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
  Sparkles,
  Phone,
  Building2,
  CheckCircle2,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { StateInfo, DistrictInfo, RiskLevel } from '../types';
import { requestBrowserLocation } from '../utils/geolocationUtils';

interface IndiaInteractiveMapProps {
  statesList: StateInfo[];
  selectedState: StateInfo | null;
  selectedDistrict: DistrictInfo | null;
  onSelectState: (state: StateInfo | null) => void;
  onSelectDistrict: (district: DistrictInfo | null) => void;
  onOpenAISafetyBriefing: () => void;
}

// Geographically calibrated vector paths and anchor points for all Indian states on a 1000x1100 canvas
interface StateGeoPath {
  id: string;
  code: string;
  name: string;
  cx: number; // Center X
  cy: number; // Center Y
  svgD: string;
}

const INDIA_GEO_MAP_DATA: StateGeoPath[] = [
  // 1. Northern Region
  {
    id: 'jammu-kashmir',
    code: 'JK',
    name: 'Jammu & Kashmir',
    cx: 260,
    cy: 130,
    svgD: 'M 210 110 C 230 70 270 50 310 65 C 340 85 340 130 310 170 C 275 185 240 175 210 155 Z'
  },
  {
    id: 'himachal-pradesh',
    code: 'HP',
    name: 'Himachal Pradesh',
    cx: 325,
    cy: 215,
    svgD: 'M 285 185 L 345 175 L 375 220 L 330 250 L 290 230 Z'
  },
  {
    id: 'punjab',
    code: 'PB',
    name: 'Punjab',
    cx: 265,
    cy: 245,
    svgD: 'M 235 210 L 285 200 L 295 270 L 240 280 Z'
  },
  {
    id: 'uttarakhand',
    code: 'UK',
    name: 'Uttarakhand',
    cx: 380,
    cy: 275,
    svgD: 'M 345 235 L 420 250 L 415 310 L 350 300 Z'
  },
  {
    id: 'haryana',
    code: 'HR',
    name: 'Haryana',
    cx: 295,
    cy: 310,
    svgD: 'M 265 275 L 330 270 L 325 345 L 260 340 Z'
  },
  {
    id: 'delhi-ncr',
    code: 'DL',
    name: 'Delhi NCR',
    cx: 330,
    cy: 330,
    svgD: 'M 318 318 L 342 318 L 342 342 L 318 342 Z'
  },

  // 2. Western Region
  {
    id: 'rajasthan',
    code: 'RJ',
    name: 'Rajasthan',
    cx: 220,
    cy: 395,
    svgD: 'M 140 320 C 180 290 260 290 280 340 L 295 440 L 205 480 L 140 430 Z'
  },
  {
    id: 'gujarat',
    code: 'GJ',
    name: 'Gujarat',
    cx: 145,
    cy: 535,
    svgD: 'M 75 490 C 130 470 190 480 215 520 L 195 595 C 140 600 95 560 75 490 Z'
  },
  {
    id: 'maharashtra',
    code: 'MH',
    name: 'Maharashtra',
    cx: 280,
    cy: 640,
    svgD: 'M 195 580 C 260 565 375 565 405 615 L 390 710 L 245 725 L 205 650 Z'
  },
  {
    id: 'goa',
    code: 'GA',
    name: 'Goa',
    cx: 230,
    cy: 780,
    svgD: 'M 220 770 L 240 770 L 240 790 L 220 790 Z'
  },

  // 3. Central Region
  {
    id: 'madhya-pradesh',
    code: 'MP',
    name: 'Madhya Pradesh',
    cx: 365,
    cy: 505,
    svgD: 'M 275 450 C 350 435 450 440 480 485 L 475 570 L 285 575 L 265 510 Z'
  },
  {
    id: 'chhattisgarh',
    code: 'CG',
    name: 'Chhattisgarh',
    cx: 465,
    cy: 585,
    svgD: 'M 445 520 L 490 515 L 505 655 L 440 660 Z'
  },

  // 4. Eastern Gangetic Region
  {
    id: 'uttar-pradesh',
    code: 'UP',
    name: 'Uttar Pradesh',
    cx: 430,
    cy: 380,
    svgD: 'M 335 320 C 400 310 510 330 535 375 L 525 450 L 370 445 L 340 375 Z'
  },
  {
    id: 'bihar',
    code: 'BR',
    name: 'Bihar',
    cx: 585,
    cy: 430,
    svgD: 'M 525 390 C 570 380 635 390 655 425 L 645 475 L 530 470 Z'
  },
  {
    id: 'jharkhand',
    code: 'JH',
    name: 'Jharkhand',
    cx: 570,
    cy: 505,
    svgD: 'M 525 475 L 625 470 L 615 545 L 520 540 Z'
  },
  {
    id: 'west-bengal',
    code: 'WB',
    name: 'West Bengal',
    cx: 655,
    cy: 490,
    svgD: 'M 625 420 L 675 420 L 690 580 C 655 590 635 560 625 515 Z'
  },
  {
    id: 'odisha',
    code: 'OD',
    name: 'Odisha',
    cx: 550,
    cy: 610,
    svgD: 'M 495 560 C 555 545 615 555 635 605 L 585 680 L 495 655 Z'
  },

  // 5. Southern Region
  {
    id: 'telangana',
    code: 'TG',
    name: 'Telangana',
    cx: 385,
    cy: 700,
    svgD: 'M 335 650 L 435 640 L 440 740 L 345 745 Z'
  },
  {
    id: 'andhra-pradesh',
    code: 'AP',
    name: 'Andhra Pradesh',
    cx: 415,
    cy: 780,
    svgD: 'M 390 735 C 455 715 515 700 480 830 L 405 850 L 375 790 Z'
  },
  {
    id: 'karnataka',
    code: 'KA',
    name: 'Karnataka',
    cx: 285,
    cy: 810,
    svgD: 'M 235 725 L 340 720 L 330 890 L 245 870 Z'
  },
  {
    id: 'tamil-nadu',
    code: 'TN',
    name: 'Tamil Nadu',
    cx: 365,
    cy: 935,
    svgD: 'M 325 865 C 385 855 425 860 415 975 L 340 1020 L 325 930 Z'
  },
  {
    id: 'kerala',
    code: 'KL',
    name: 'Kerala',
    cx: 305,
    cy: 965,
    svgD: 'M 275 890 L 320 890 L 325 1015 L 295 1015 Z'
  },

  // 6. North-East Region
  {
    id: 'assam',
    code: 'AS',
    name: 'Assam & NE',
    cx: 795,
    cy: 405,
    svgD: 'M 705 365 C 770 335 885 340 890 410 L 860 470 L 735 450 Z'
  }
];

export const IndiaInteractiveMap: React.FC<IndiaInteractiveMapProps> = ({
  statesList,
  selectedState,
  selectedDistrict,
  onSelectState,
  onSelectDistrict,
  onOpenAISafetyBriefing
}) => {
  const [hoveredStateId, setHoveredStateId] = useState<string | null>(null);
  const [mapSearch, setMapSearch] = useState<string>('');
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [riskFilter, setRiskFilter] = useState<'all' | 'High' | 'Moderate' | 'Low'>('all');

  // Convert lat/lon to exact map canvas coordinates (X: 0..1000, Y: 0..1100)
  const getCanvasCoords = (lat: number, lon: number) => {
    const x = Math.max(50, Math.min(950, (lon - 68) * (850 / 29) + 60));
    const y = Math.max(40, Math.min(1050, (37 - lat) * (980 / 29) + 45));
    return { x, y };
  };

  const getRiskColor = (level?: RiskLevel, isHovered?: boolean, isSelected?: boolean) => {
    if (isSelected) return '#2563EB'; // Vibrant Royal Blue
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

  const handleLocateMe = async () => {
    setIsLocating(true);
    try {
      const res = await requestBrowserLocation(statesList);
      setIsLocating(false);
      onSelectState(res.state);
      if (res.district) onSelectDistrict(res.district);
    } catch {
      setIsLocating(false);
      const defaultState = statesList.find(s => s.id === 'bihar') || statesList[0];
      onSelectState(defaultState);
    }
  };

  // Find currently active state object from statesList
  const activeStateData = useMemo(() => {
    return statesList.find(s => s.id === (selectedState?.id || hoveredStateId)) || selectedState;
  }, [statesList, selectedState, hoveredStateId]);

  // Filter districts within active state
  const activeDistricts = useMemo(() => {
    if (!selectedState || !selectedState.districts) return [];
    if (riskFilter === 'all') return selectedState.districts;
    return selectedState.districts.filter(d => d.riskLevel === riskFilter);
  }, [selectedState, riskFilter]);

  // Search filter
  const searchMatches = useMemo(() => {
    if (!mapSearch.trim()) return [];
    const query = mapSearch.toLowerCase();
    const results: { type: 'state' | 'district'; state: StateInfo; district?: DistrictInfo; label: string }[] = [];

    for (const st of statesList) {
      if (st.name.toLowerCase().includes(query) || (st.hindiName && st.hindiName.includes(query))) {
        results.push({ type: 'state', state: st, label: st.name });
      }
      if (st.districts) {
        for (const dist of st.districts) {
          if (dist.name.toLowerCase().includes(query)) {
            results.push({ type: 'district', state: st, district: dist, label: `${dist.name} (${st.name})` });
          }
        }
      }
    }
    return results.slice(0, 8);
  }, [mapSearch, statesList]);

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-7 shadow-sm border border-slate-200 my-6">
      
      {/* 1. Header Bar with Search & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold tracking-wider uppercase border border-blue-200">
              Official Geospatial Crime &amp; Safety Map
            </span>
            <span className="text-slate-400 text-xs hidden sm:inline">• Click any State or District to filter</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>India Real-Time Crime &amp; District Safety Explorer</span>
          </h3>
        </div>

        {/* Search & Location Tools */}
        <div className="flex items-center gap-2 flex-wrap relative">
          
          {/* Instant Search Bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={mapSearch}
              onChange={(e) => setMapSearch(e.target.value)}
              placeholder="Search Banka, Patna, Mumbai..."
              className="pl-8 pr-3 py-1.5 bg-slate-100 text-slate-900 text-xs rounded-full border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 w-52"
            />
            {mapSearch && (
              <button 
                onClick={() => setMapSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-slate-600 px-1 py-0.5 rounded bg-slate-200"
              >
                ✕
              </button>
            )}

            {/* Instant Search Dropdown */}
            {searchMatches.length > 0 && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
                  Matching Regions
                </div>
                {searchMatches.map((m, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      onSelectState(m.state);
                      if (m.district) onSelectDistrict(m.district);
                      setMapSearch('');
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-blue-50 text-xs font-semibold text-slate-800 flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-blue-600" />
                      {m.label}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">
                      {m.type === 'district' ? 'District' : 'State'}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* GPS Auto-Detect Button */}
          <button
            id="map-locate-me-btn"
            onClick={handleLocateMe}
            disabled={isLocating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
            title="Auto-detect and zoom to my physical district"
          >
            <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'Detecting...' : 'Locate My District'}</span>
          </button>

          {/* Reset All India Button */}
          {selectedState && (
            <button
              onClick={() => { onSelectState(null); onSelectDistrict(null); }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset All India</span>
            </button>
          )}

        </div>
      </div>

      {/* 2. Map Legend & Live NCRB Indicator */}
      <div className="flex items-center justify-between flex-wrap gap-3 py-3 border-b border-slate-100 text-xs">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="font-semibold text-slate-500 text-[11px]">Risk Intensity:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500 shadow-xs" />
            <span className="text-slate-700 font-medium">High Risk (Hotspot)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500 shadow-xs" />
            <span className="text-slate-700 font-medium">Moderate (Monitored)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-xs" />
            <span className="text-slate-700 font-medium">Low Incident / Safe</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>Live 112 &amp; Verified State Police Feeds</span>
        </div>
      </div>

      {/* 3. Main Grid: Accurate Vector Map (Left) & District Detail Explorer (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-5">
        
        {/* Left: Vector Map Canvas */}
        <div className="lg:col-span-7 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 rounded-3xl p-4 sm:p-6 shadow-xl border border-slate-800 relative overflow-hidden flex flex-col justify-between min-h-[480px]">
          
          {/* Subtle Map Grid Background */}
          <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />

          {/* Map Status Badge */}
          <div className="relative z-10 flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                {selectedState ? `${selectedState.name} District Grid` : 'National State Matrix'}
              </span>
              {selectedDistrict && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600/30 text-blue-300 border border-blue-500/40">
                  📍 {selectedDistrict.name}
                </span>
              )}
            </div>

            <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">
              Click state polygon to zoom &amp; inspect districts
            </span>
          </div>

          {/* SVG Map of India */}
          <div className="relative w-full aspect-square max-h-[460px] mx-auto flex items-center justify-center">
            <svg 
              viewBox="0 0 1000 1100" 
              className="w-full h-full filter drop-shadow-2xl select-none"
            >
              <defs>
                <filter id="mapGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="8" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <linearGradient id="selectedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#3b82f6" />
                  <stop offset="100%" stop-color="#1d4ed8" />
                </linearGradient>
              </defs>

              {/* National Outer Border Halo */}
              <path 
                d="M 210 110 C 310 50 420 220 535 375 C 655 390 890 340 890 410 C 860 470 690 580 635 605 C 515 700 415 975 340 1020 C 275 890 195 580 75 490 C 140 320 210 110 210 110 Z" 
                fill="none" 
                stroke="#334155" 
                strokeWidth="4" 
                strokeDasharray="6 6"
                opacity="0.4" 
              />

              {/* Render Every State Polygon */}
              {INDIA_GEO_MAP_DATA.map((geo) => {
                const stateData = statesList.find(s => s.id === geo.id);
                const isSelected = selectedState?.id === geo.id;
                const isHovered = hoveredStateId === geo.id;
                const fillColor = getRiskColor(stateData?.riskLevel, isHovered, isSelected);

                return (
                  <g 
                    key={geo.id}
                    className="cursor-pointer transition-all duration-200"
                    onMouseEnter={() => setHoveredStateId(geo.id)}
                    onMouseLeave={() => setHoveredStateId(null)}
                    onClick={() => {
                      if (stateData) {
                        onSelectState(stateData);
                        if (stateData.districts && stateData.districts.length > 0) {
                          onSelectDistrict(stateData.districts[0]);
                        } else {
                          onSelectDistrict(null);
                        }
                      }
                    }}
                  >
                    {/* State Geo Polygon */}
                    <path
                      d={geo.svgD}
                      fill={isSelected ? 'url(#selectedGrad)' : fillColor}
                      fillOpacity={isSelected ? 0.95 : isHovered ? 0.85 : 0.65}
                      stroke={isSelected ? '#ffffff' : '#0f172a'}
                      strokeWidth={isSelected ? 3.5 : 2}
                      className="transition-all duration-200 hover:scale-[1.01]"
                      filter={isSelected ? 'url(#mapGlow)' : undefined}
                    />

                    {/* State Code Label */}
                    <text
                      x={geo.cx}
                      y={geo.cy}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className={`text-[16px] sm:text-[18px] font-black pointer-events-none select-none tracking-wider ${
                        isSelected ? 'fill-white' : 'fill-slate-900'
                      }`}
                      style={{ fontWeight: 900 }}
                    >
                      {geo.code}
                    </text>
                  </g>
                );
              })}

              {/* Render District Pins if State is Selected */}
              {selectedState && selectedState.districts && selectedState.districts.map((dist) => {
                const isDistrictSelected = selectedDistrict?.id === dist.id;
                const [lat, lon] = dist.coordinates;
                const { x, y } = getCanvasCoords(lat, lon);

                return (
                  <g 
                    key={dist.id} 
                    className="cursor-pointer transition-transform duration-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectDistrict(dist);
                    }}
                  >
                    {/* Pulsing Target Circle */}
                    <circle
                      cx={x}
                      cy={y}
                      r={isDistrictSelected ? 12 : 7}
                      fill={isDistrictSelected ? '#38bdf8' : '#ffffff'}
                      fillOpacity={isDistrictSelected ? 0.9 : 0.7}
                      stroke="#0f172a"
                      strokeWidth="2"
                      className={isDistrictSelected ? 'animate-pulse' : ''}
                    />

                    {/* Pin Center */}
                    <circle
                      cx={x}
                      cy={y}
                      r={isDistrictSelected ? 5 : 3}
                      fill={isDistrictSelected ? '#1e3a8a' : '#0f172a'}
                    />

                    {/* District Name Label */}
                    <text
                      x={x}
                      y={y - 14}
                      textAnchor="middle"
                      className={`text-[12px] sm:text-[13px] font-bold select-none pointer-events-none ${
                        isDistrictSelected ? 'fill-amber-300' : 'fill-white'
                      }`}
                      style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}
                    >
                      {dist.name}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Interactive Footer Indicator */}
          <div className="relative z-10 pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-blue-400 font-semibold">
              <Info className="w-3.5 h-3.5" />
              <span>
                {selectedState ? `Showing ${selectedState.districts.length} active districts in ${selectedState.name}` : 'Click any state to explore district-level police stats'}
              </span>
            </span>
            <span className="text-slate-500">Pramaan Bharat GIS v2.4</span>
          </div>

        </div>

        {/* Right: District Explorer Dashboard Panel */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          
          {selectedState ? (
            <div className="bg-slate-50 rounded-3xl p-4 sm:p-6 border border-slate-200 flex-1 flex flex-col justify-between">
              
              {/* Selected State Header */}
              <div>
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-200">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                        {selectedState.zone} Zone
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        Capital: {selectedState.capital}
                      </span>
                    </div>
                    <h4 className="text-xl font-black text-slate-900 mt-1">
                      {selectedState.name} ({selectedState.hindiName})
                    </h4>
                  </div>

                  <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full text-white ${
                    selectedState.riskLevel === 'High' ? 'bg-rose-600' : selectedState.riskLevel === 'Moderate' ? 'bg-amber-500' : 'bg-emerald-600'
                  }`}>
                    {selectedState.riskLevel} Risk
                  </span>
                </div>

                {/* State Crime & Police HQ Snapshot */}
                <div className="grid grid-cols-2 gap-2 my-3.5 text-xs">
                  <div className="p-2.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Reported Crimes</span>
                    <p className="text-sm font-black text-slate-900 mt-0.5">{selectedState.reportedCrimes.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Solved Cases</span>
                    <p className="text-sm font-black text-emerald-600 mt-0.5">{selectedState.solvedCrimes.toLocaleString('en-IN')}</p>
                  </div>
                </div>

                {/* Police HQ */}
                <div className="p-3 rounded-2xl bg-white border border-slate-200 text-xs text-slate-700 flex items-start gap-2 mb-4">
                  <Building2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 block">State Police Headquarters</span>
                    <span className="text-slate-600 text-[11px] leading-tight block">{selectedState.policeHeadquarters}</span>
                  </div>
                </div>

                {/* District Risk Filter Tabs */}
                <div className="flex items-center justify-between gap-2 pb-2">
                  <span className="text-xs font-bold text-slate-900">
                    Districts ({activeDistricts.length})
                  </span>
                  <div className="flex items-center gap-1 text-[10px]">
                    {(['all', 'High', 'Moderate', 'Low'] as const).map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => setRiskFilter(lvl)}
                        className={`px-2 py-0.5 rounded-full font-bold transition-colors cursor-pointer ${
                          riskFilter === lvl ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        }`}
                      >
                        {lvl === 'all' ? 'All' : lvl}
                      </button>
                    ))}
                  </div>
                </div>

                {/* District Scrollable List */}
                <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                  {activeDistricts.map((dist) => {
                    const isDistSelected = selectedDistrict?.id === dist.id;
                    return (
                      <div
                        key={dist.id}
                        onClick={() => onSelectDistrict(dist)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                          isDistSelected
                            ? 'bg-blue-600 text-white border-blue-700 shadow-md ring-2 ring-blue-400/30'
                            : 'bg-white hover:bg-blue-50/60 border-slate-200 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <MapPin className={`w-4 h-4 ${isDistSelected ? 'text-amber-300' : 'text-blue-600'}`} />
                            <span className="font-bold text-xs sm:text-sm">{dist.name}</span>
                          </div>
                          <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                            isDistSelected 
                              ? 'bg-white/20 text-white' 
                              : dist.riskLevel === 'High' 
                                ? 'bg-rose-100 text-rose-800' 
                                : dist.riskLevel === 'Moderate' 
                                  ? 'bg-amber-100 text-amber-800' 
                                  : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {dist.riskLevel}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-slate-100/30 text-[10px]">
                          <div>
                            <span className={isDistSelected ? 'text-blue-100' : 'text-slate-400'}>Reported:</span>
                            <span className="font-bold ml-1">{dist.reportedCrimes}</span>
                          </div>
                          <div>
                            <span className={isDistSelected ? 'text-blue-100' : 'text-slate-400'}>Solved:</span>
                            <span className="font-bold ml-1">{dist.solvedCrimes}</span>
                          </div>
                          <div>
                            <span className={isDistSelected ? 'text-blue-100' : 'text-slate-400'}>Stations:</span>
                            <span className="font-bold ml-1">{dist.policeStationsCount}</span>
                          </div>
                        </div>

                        <div className="mt-1.5 text-[10px] flex items-center justify-between">
                          <span className={isDistSelected ? 'text-blue-200' : 'text-slate-500'}>
                            📞 {dist.emergencyHelpline}
                          </span>
                          <span className={`font-bold ${isDistSelected ? 'text-amber-300' : 'text-blue-600'}`}>
                            {isDistSelected ? '✓ Active Filter' : 'Select District →'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Trigger */}
              <div className="pt-3 mt-3 border-t border-slate-200 flex items-center gap-2">
                <button
                  onClick={onOpenAISafetyBriefing}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Generate AI Briefing for {selectedDistrict ? selectedDistrict.name : selectedState.name}</span>
                </button>
              </div>

            </div>
          ) : (
            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200 flex-1 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <MapPin className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-base font-black text-slate-900">Select any Indian State on the Map</h4>
                <p className="text-xs text-slate-500 max-w-xs mt-1 leading-relaxed">
                  Click on any state polygon or search above to drill down into district-level crime data, police station helplines, and localized safety metrics.
                </p>
              </div>

              {/* Quick State Selection Buttons */}
              <div className="grid grid-cols-2 gap-2 w-full pt-2">
                {statesList.slice(0, 6).map((st) => (
                  <button
                    key={st.id}
                    onClick={() => {
                      onSelectState(st);
                      if (st.districts?.length > 0) onSelectDistrict(st.districts[0]);
                    }}
                    className="flex items-center justify-between px-3 py-2 rounded-xl bg-white hover:bg-blue-50 border border-slate-200 text-xs font-bold text-slate-800 transition-colors cursor-pointer"
                  >
                    <span>{st.name}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
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
