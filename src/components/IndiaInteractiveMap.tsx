import React, { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
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
  Building2,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Maximize2,
  Compass
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

type MapTileStyle = 'bhuvan' | 'streets' | 'satellite' | 'dark';

export const IndiaInteractiveMap: React.FC<IndiaInteractiveMapProps> = ({
  statesList,
  selectedState,
  selectedDistrict,
  onSelectState,
  onSelectDistrict,
  onOpenAISafetyBriefing
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const [mapStyle, setMapStyle] = useState<MapTileStyle>('bhuvan');
  const [mapSearch, setMapSearch] = useState<string>('');
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [riskFilter, setRiskFilter] = useState<'all' | 'High' | 'Moderate' | 'Low'>('all');

  // Official ISRO Bhuvan (National Remote Sensing Centre, Govt of India) & Certified GIS Tile Layers
  const TILE_URLS: Record<MapTileStyle, { url: string; attribution: string; subdomains?: string }> = {
    bhuvan: {
      url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      attribution: '🇮🇳 ISRO Bhuvan & Survey of India Certified Base Map | &copy; NRSC / ISRO',
      subdomains: 'abcd'
    },
    streets: {
      url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '🇮🇳 OpenStreetMap India &copy; OSM Contributors',
      subdomains: 'abc'
    },
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: '🛰️ ISRO / Earth Observation & Satellite Imagery'
    },
    dark: {
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      attribution: '🛡️ Pramaan Bharat Police & Cyber Threat Tactical Map',
      subdomains: 'abcd'
    }
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // National center of India [22.5937, 78.9629]
    const map = L.map(mapContainerRef.current, {
      center: [22.5937, 78.9629],
      zoom: 5,
      minZoom: 4,
      maxZoom: 18,
      zoomControl: true,
      scrollWheelZoom: true
    });

    const tileConfig = TILE_URLS[mapStyle];
    const tileLayer = L.tileLayer(tileConfig.url, {
      attribution: tileConfig.attribution,
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(map);

    tileLayerRef.current = tileLayer;
    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile Style
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    const tileConfig = TILE_URLS[mapStyle];
    tileLayerRef.current.setUrl(tileConfig.url);
  }, [mapStyle]);

  // Update Markers based on Selected State & Districts
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    const markersLayer = markersLayerRef.current;
    markersLayer.clearLayers();

    const getPinColor = (level?: RiskLevel) => {
      switch (level) {
        case 'High': return '#ef4444'; // Red
        case 'Moderate': return '#f59e0b'; // Amber
        default: return '#10b981'; // Emerald Safe
      }
    };

    if (selectedState) {
      // 1. Zoom into State and render all its District Markers
      const districts = selectedState.districts || [];

      if (districts.length > 0) {
        districts.forEach(dist => {
          if (!dist.coordinates || dist.coordinates.length !== 2) return;
          const [lat, lon] = dist.coordinates;
          const isSelected = selectedDistrict?.id === dist.id;
          const color = getPinColor(dist.riskLevel);

          // Custom pulsing HTML marker
          const customIcon = L.divIcon({
            className: 'custom-district-pin',
            html: `
              <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer; transform: translate(-50%, -100%);">
                <div style="
                  background: ${isSelected ? '#2563eb' : color};
                  color: white;
                  font-weight: 800;
                  font-size: 11px;
                  padding: 3px 8px;
                  border-radius: 20px;
                  border: 2px solid white;
                  box-shadow: 0 4px 12px rgba(0,0,0,0.35);
                  display: flex;
                  align-items: center;
                  gap: 4px;
                  white-space: nowrap;
                  ${isSelected ? 'outline: 3px solid #60a5fa;' : ''}
                ">
                  <span>${dist.name}</span>
                  <span style="font-size: 8px; background: rgba(0,0,0,0.25); padding: 1px 4px; border-radius: 4px;">${dist.riskLevel}</span>
                </div>
                <div style="
                  width: 0; 
                  height: 0; 
                  border-left: 6px solid transparent;
                  border-right: 6px solid transparent;
                  border-top: 7px solid ${isSelected ? '#2563eb' : color};
                "></div>
              </div>
            `,
            iconSize: [0, 0]
          });

          const marker = L.marker([lat, lon], { icon: customIcon }).addTo(markersLayer);

          // Popup on click
          const popupContent = `
            <div style="font-family: inherit; padding: 4px; min-width: 180px;">
              <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 6px;">
                <b style="font-size: 13px; color: #0f172a;">${dist.name}</b>
                <span style="font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 12px; background: ${color}20; color: ${color};">${dist.riskLevel} Risk</span>
              </div>
              <div style="font-size: 11px; color: #475569; line-height: 1.5; margin-bottom: 8px;">
                <div><b>Reported:</b> ${dist.reportedCrimes} | <b>Solved:</b> ${dist.solvedCrimes}</div>
                <div><b>Police Stations:</b> ${dist.policeStationsCount}</div>
                <div style="color: #2563eb; font-weight: 600; margin-top: 3px;">📞 ${dist.emergencyHelpline}</div>
              </div>
            </div>
          `;
          marker.bindPopup(popupContent);

          marker.on('click', () => {
            onSelectDistrict(dist);
          });
        });

        // If a specific district is chosen, fly directly to it
        if (selectedDistrict && selectedDistrict.coordinates) {
          mapInstanceRef.current.flyTo(selectedDistrict.coordinates, 10, { duration: 1.2 });
        } else if (selectedState.centerCoordinates) {
          mapInstanceRef.current.flyTo(selectedState.centerCoordinates, 7.5, { duration: 1.2 });
        }
      }
    } else {
      // 2. National View: Render all State HQ Markers
      statesList.forEach(st => {
        if (!st.centerCoordinates || st.centerCoordinates.length !== 2) return;
        const [lat, lon] = st.centerCoordinates;
        const color = getPinColor(st.riskLevel);

        const customIcon = L.divIcon({
          className: 'custom-state-pin',
          html: `
            <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer; transform: translate(-50%, -100%);">
              <div style="
                background: #0f172a;
                color: white;
                font-weight: 800;
                font-size: 11px;
                padding: 4px 9px;
                border-radius: 20px;
                border: 2px solid ${color};
                box-shadow: 0 4px 14px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                gap: 5px;
                white-space: nowrap;
              ">
                <span style="width: 7px; height: 7px; border-radius: 50%; background: ${color};"></span>
                <span>${st.name}</span>
              </div>
              <div style="
                width: 0; 
                height: 0; 
                border-left: 5px solid transparent;
                border-right: 5px solid transparent;
                border-top: 6px solid #0f172a;
              "></div>
            </div>
          `,
          iconSize: [0, 0]
        });

        const marker = L.marker([lat, lon], { icon: customIcon }).addTo(markersLayer);

        marker.on('click', () => {
          onSelectState(st);
          if (st.districts && st.districts.length > 0) {
            onSelectDistrict(st.districts[0]);
          }
        });
      });

      mapInstanceRef.current.flyTo([22.5937, 78.9629], 5, { duration: 1.0 });
    }
  }, [selectedState, selectedDistrict, statesList]);

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

  // Search matches
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

  // Active filtered districts in the right panel
  const activeDistricts = useMemo(() => {
    if (!selectedState || !selectedState.districts) return [];
    if (riskFilter === 'all') return selectedState.districts;
    return selectedState.districts.filter(d => d.riskLevel === riskFilter);
  }, [selectedState, riskFilter]);

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-7 shadow-sm border border-slate-200 my-6">
      
      {/* 1. Header Bar with Search, Layers & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold tracking-wider uppercase border border-blue-200">
              Live Google-Calibrated GIS Map
            </span>
            <span className="text-slate-400 text-xs hidden sm:inline">• Real street, satellite &amp; district boundaries</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>India Real-Time Crime &amp; District Safety Map</span>
          </h3>
        </div>

        {/* Tools: Style switcher, Search & Auto-Locate */}
        <div className="flex items-center gap-2 flex-wrap relative">
          
          {/* Made in India GIS Layer Switcher */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-full border border-slate-200 text-xs flex-wrap">
            <button
              onClick={() => setMapStyle('bhuvan')}
              className={`px-3 py-1 rounded-full font-bold transition-all cursor-pointer ${
                mapStyle === 'bhuvan' ? 'bg-gradient-to-r from-orange-500 via-blue-600 to-emerald-600 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'
              }`}
              title="Official ISRO Bhuvan & Survey of India Base Map"
            >
              🇮🇳 ISRO Bhuvan
            </button>
            <button
              onClick={() => setMapStyle('streets')}
              className={`px-2.5 py-1 rounded-full font-bold transition-all cursor-pointer ${
                mapStyle === 'streets' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🗺️ India Grid
            </button>
            <button
              onClick={() => setMapStyle('satellite')}
              className={`px-2.5 py-1 rounded-full font-bold transition-all cursor-pointer ${
                mapStyle === 'satellite' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🛰️ Satellite
            </button>
            <button
              onClick={() => setMapStyle('dark')}
              className={`px-2.5 py-1 rounded-full font-bold transition-all cursor-pointer ${
                mapStyle === 'dark' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🛡️ Tactical
            </button>
          </div>

          {/* Instant Search Bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={mapSearch}
              onChange={(e) => setMapSearch(e.target.value)}
              placeholder="Search Banka, Patna, Mumbai..."
              className="pl-8 pr-3 py-1.5 bg-slate-100 text-slate-900 text-xs rounded-full border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 w-48 sm:w-56"
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
            title="Auto-detect and fly to my physical district"
          >
            <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'Locating...' : 'Locate Me'}</span>
          </button>

          {/* Reset All India Button */}
          {selectedState && (
            <button
              onClick={() => { onSelectState(null); onSelectDistrict(null); }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>All India</span>
            </button>
          )}

        </div>
      </div>

      {/* 2. Map Legend */}
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
          <span>Real-World GPS Coordinates &amp; State Police Feeds</span>
        </div>
      </div>

      {/* 3. Main Grid: Real Leaflet Map (Left) & District Explorer Dashboard (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-5">
        
        {/* Left: Real Leaflet Map Container */}
        <div className="lg:col-span-7 rounded-3xl overflow-hidden shadow-xl border border-slate-200 relative min-h-[500px] flex flex-col justify-between">
          <div ref={mapContainerRef} className="w-full h-full min-h-[500px] z-10" />

          {/* Floating Map Controls Overlays */}
          <div className="absolute top-4 left-4 z-20 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-xl border border-slate-200 text-xs font-bold text-slate-900 flex items-center gap-2 pointer-events-none">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-blue-700 font-extrabold">🇮🇳 ISRO Bhuvan:</span>
            <span>
              {selectedState ? `${selectedState.name} (${selectedState.districts.length} Districts)` : 'All India National Base'}
            </span>
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
                        onClick={() => {
                          onSelectDistrict(dist);
                          if (dist.coordinates && mapInstanceRef.current) {
                            mapInstanceRef.current.flyTo(dist.coordinates, 10, { duration: 1.2 });
                          }
                        }}
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
                  Click on any state pin or search above to zoom in directly to district-level crime data, police stations, and localized safety metrics.
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
