import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sparkles, 
  Flame, 
  MapPin, 
  ShieldAlert, 
  Filter, 
  Bookmark, 
  SlidersHorizontal,
  Search,
  Newspaper,
  ChevronRight,
  RefreshCw,
  TrendingUp,
  Globe2,
  Calendar,
  X,
  ShieldCheck,
  Award,
  Scale,
  CheckCircle2,
  CheckCircle,
  ExternalLink,
  Clock,
  Radio
} from 'lucide-react';
import { NewsArticle, LanguageCode, NewsCategory, StateInfo, DistrictInfo, CrimeCategory, TimeRangeKey, SourceTier } from '../types';
import { ArticleCard } from './ArticleCard';
import { isArticleInTimeRange, getTimeframeLabel, getLiveTimeAgo } from '../utils/dateUtils';
import { VERIFIED_SOURCES_CATALOG, getSourceByName } from '../data/verifiedSources';
import { VerifiedSourcesModal } from './VerifiedSourcesModal';

interface NewsFeedProps {
  articles: NewsArticle[];
  currentLanguage: LanguageCode;
  activeCategory: NewsCategory;
  onSelectCategory: (cat: NewsCategory) => void;
  selectedState: StateInfo | null;
  selectedDistrict: DistrictInfo | null;
  selectedCrimeCategory: CrimeCategory | null;
  searchQuery: string;
  timeKey?: TimeRangeKey;
  customStartDate?: string;
  customEndDate?: string;
  onChangeTimeKey?: (key: TimeRangeKey) => void;
  onSelectArticle: (article: NewsArticle) => void;
  bookmarkedIds: string[];
  onToggleBookmark: (id: string) => void;
  onQuickAiSummary: (article: NewsArticle) => void;
  onOpenPersonalizeModal: () => void;
  isBookmarksView: boolean;
  onClearFilters: () => void;
  onFetchLiveNews?: (category?: NewsCategory, state?: string) => Promise<void>;
  isFetchingLiveNews?: boolean;
}

export const NewsFeed: React.FC<NewsFeedProps> = ({
  articles,
  currentLanguage,
  activeCategory,
  onSelectCategory,
  selectedState,
  selectedDistrict,
  selectedCrimeCategory,
  searchQuery,
  timeKey = 'today',
  customStartDate,
  customEndDate,
  onChangeTimeKey,
  onSelectArticle,
  bookmarkedIds,
  onToggleBookmark,
  onQuickAiSummary,
  onOpenPersonalizeModal,
  isBookmarksView,
  onClearFilters,
  onFetchLiveNews,
  isFetchingLiveNews = false
}) => {
  const [selectedSourceFilter, setSelectedSourceFilter] = useState<string>('All');
  const [selectedTierFilter, setSelectedTierFilter] = useState<string>('All');
  const [isVerifiedSourcesModalOpen, setIsVerifiedSourcesModalOpen] = useState<boolean>(false);
  const [breakingSlideIndex, setBreakingSlideIndex] = useState<number>(0);
  const [isHeroHovered, setIsHeroHovered] = useState<boolean>(false);
  
  // Track elapsed time with real timestamp anchor so refreshing or staying on page keeps time advancing continuously
  const [elapsedMinutes, setElapsedMinutes] = useState<number>(() => {
    try {
      const storedAnchor = sessionStorage.getItem('pramaan_session_anchor_time');
      if (storedAnchor) {
        const diff = Math.max(0, Math.floor((Date.now() - parseInt(storedAnchor, 10)) / 60000));
        return diff;
      } else {
        sessionStorage.setItem('pramaan_session_anchor_time', Date.now().toString());
        return 0;
      }
    } catch {
      return 0;
    }
  });

  // Live timer heartbeat every 20 seconds to update relative time across the page dynamically
  useEffect(() => {
    const updateElapsed = () => {
      try {
        const storedAnchor = sessionStorage.getItem('pramaan_session_anchor_time');
        if (storedAnchor) {
          const diff = Math.max(0, Math.floor((Date.now() - parseInt(storedAnchor, 10)) / 60000));
          setElapsedMinutes(diff);
        } else {
          sessionStorage.setItem('pramaan_session_anchor_time', Date.now().toString());
          setElapsedMinutes(0);
        }
      } catch {
        setElapsedMinutes(prev => prev + 1);
      }
    };

    const timer = setInterval(updateElapsed, 20000);
    return () => clearInterval(timer);
  }, []);

  // First apply timeframe filter to base article set
  const timeframeArticles = isBookmarksView 
    ? articles 
    : articles.filter(a => isArticleInTimeRange(a, timeKey, customStartDate, customEndDate));

  // Filter logic
  let filtered = useMemo(() => {
    let list = timeframeArticles;

    if (isBookmarksView) {
      return list.filter(a => bookmarkedIds.includes(a.id));
    }

    // 1. State & District filter (strictly prioritized)
    if (selectedDistrict) {
      const districtMatches = list.filter(a => a.districtId === selectedDistrict.id);
      const stateMatches = list.filter(a => a.stateId === (selectedDistrict.stateId || selectedState?.id));
      if (districtMatches.length > 0) {
        const otherStateMatches = stateMatches.filter(a => !districtMatches.some(dm => dm.id === a.id));
        list = [...districtMatches, ...otherStateMatches];
      } else if (stateMatches.length > 0) {
        list = stateMatches;
      }
    } else if (selectedState) {
      const stateMatches = list.filter(a => 
        a.stateId === selectedState.id || 
        (a.stateName && a.stateName.toLowerCase().includes(selectedState.name.toLowerCase()))
      );
      if (stateMatches.length > 0) {
        list = stateMatches;
      }
    }

    // 2. Category filter
    if (activeCategory === 'For You') {
      list = list.filter(a => 
        a.category === 'Public Safety & Crime' || 
        a.category === 'Tech' || 
        a.stateId === selectedState?.id ||
        a.isBreaking
      );
    } else if (activeCategory !== 'All') {
      list = list.filter(a => a.category === activeCategory);
    }

    // 3. Crime category filter
    if (selectedCrimeCategory) {
      list = list.filter(a => a.crimeCategory === selectedCrimeCategory);
    }

    // 4. Source Tier filter
    if (selectedTierFilter !== 'All') {
      list = list.filter(a => {
        const srcInfo = getSourceByName(a.source);
        return a.sourceTier === selectedTierFilter || srcInfo?.tier === selectedTierFilter;
      });
    }

    // 5. Specific Source filter
    if (selectedSourceFilter !== 'All') {
      list = list.filter(a => {
        const sLower = a.source.toLowerCase();
        const fLower = selectedSourceFilter.toLowerCase();
        return sLower.includes(fLower) || fLower.includes(sLower);
      });
    }

    // 6. Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(a => 
        a.title.toLowerCase().includes(q) ||
        a.snippet.toLowerCase().includes(q) ||
        a.content.toLowerCase().includes(q) ||
        a.source.toLowerCase().includes(q) ||
        a.tags.some(t => t.toLowerCase().includes(q)) ||
        (a.stateName && a.stateName.toLowerCase().includes(q))
      );
    }

    return list;
  }, [
    timeframeArticles, 
    isBookmarksView, 
    bookmarkedIds, 
    selectedDistrict, 
    selectedState, 
    activeCategory, 
    selectedCrimeCategory, 
    selectedTierFilter, 
    selectedSourceFilter, 
    searchQuery
  ]);

  // Multi-slide breaking news pool with 8-12 verified top slides across categories & regions
  const breakingPool = useMemo(() => {
    if (isBookmarksView || searchQuery || selectedSourceFilter !== 'All' || selectedTierFilter !== 'All') {
      return [];
    }

    const pool: NewsArticle[] = [];
    const seenIds = new Set<string>();

    // 1. If location filter is active, prioritize breaking & top stories for that location first
    if (selectedState || selectedDistrict) {
      filtered.filter(a => a.isBreaking).forEach(a => {
        if (!seenIds.has(a.id)) { pool.push(a); seenIds.add(a.id); }
      });

      filtered.filter(a => a.sourceTier === 'Official Statutory & Wire' || a.sourceTier === 'Legal & Judicial Desk').forEach(a => {
        if (!seenIds.has(a.id) && pool.length < 5) { pool.push(a); seenIds.add(a.id); }
      });
    }

    // 2. Add high-impact national & state breaking articles across categories
    timeframeArticles.filter(a => a.isBreaking).forEach(a => {
      if (!seenIds.has(a.id) && pool.length < 12) {
        pool.push(a);
        seenIds.add(a.id);
      }
    });

    // 3. Supplement with high-credibility verified wire stories (PIB Fact Check, PTI, ANI, LiveLaw, Bar and Bench, The Hindu)
    timeframeArticles.filter(a => 
      a.sourceTier === 'Official Statutory & Wire' || 
      a.sourceTier === 'Legal & Judicial Desk' ||
      a.sourceTier === 'IFCN Certified Fact-Check' ||
      a.isVerifiedFactCheck
    ).forEach(a => {
      if (!seenIds.has(a.id) && pool.length < 10) {
        pool.push(a);
        seenIds.add(a.id);
      }
    });

    return pool.length > 0 ? pool : timeframeArticles.slice(0, 8);
  }, [filtered, timeframeArticles, isBookmarksView, searchQuery, selectedSourceFilter, selectedTierFilter, selectedState, selectedDistrict]);

  // Reset slide index when location or category changes
  useEffect(() => {
    setBreakingSlideIndex(0);
  }, [selectedState?.id, selectedDistrict?.id, activeCategory, articles.length]);

  // Auto-cycle breaking news banner every 5.5 seconds (pauses on hover)
  useEffect(() => {
    if (breakingPool.length <= 1 || isHeroHovered) return;

    const timer = setInterval(() => {
      setBreakingSlideIndex(prev => (prev + 1) % breakingPool.length);
    }, 5500);

    return () => clearInterval(timer);
  }, [breakingPool.length, isHeroHovered]);

  const activeBreakingArticle = breakingPool[breakingSlideIndex] || breakingPool[0] || null;
  const standardArticles = activeBreakingArticle 
    ? filtered.filter(a => a.id !== activeBreakingArticle.id) 
    : filtered;

  // Category counts calculation helper based on current timeframe
  const getCategoryCount = (catId: NewsCategory) => {
    if (catId === 'All') return filtered.length;
    if (catId === 'For You') {
      return filtered.filter(a => 
        a.category === 'Public Safety & Crime' || 
        a.category === 'Tech' || 
        a.isBreaking
      ).length;
    }
    return filtered.filter(a => a.category === catId).length;
  };
  const timeLabel = getTimeframeLabel(timeKey, customStartDate, customEndDate);

  const handleClearAll = () => {
    setSelectedSourceFilter('All');
    setSelectedTierFilter('All');
    onClearFilters();
  };

  return (
    <section className="my-8" id="news-feed-section">
      
      {/* Feed Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center flex-wrap gap-2">
            {isBookmarksView ? (
              <div className="flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-blue-600 fill-blue-600" />
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Your Saved Articles ({filtered.length})</h2>
              </div>
            ) : (
              <div className="flex items-center flex-wrap gap-2">
                <Newspaper className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  {activeCategory === 'For You' ? 'Your Personalized Briefing' :
                   activeCategory === 'Public Safety & Crime' ? 'Police & Public Safety Bulletins' :
                   activeCategory === 'State & Local' ? (selectedState ? `${selectedState.name} Local Desk` : 'Regional State News') :
                   activeCategory === 'All' ? 'Top Stories & Verified Indian Coverage' :
                   `${activeCategory} Coverage`}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 font-bold text-xs">
                  {filtered.length} {filtered.length === 1 ? 'Article' : 'Articles'}
                </span>
                
                {/* Active Timeframe Badge */}
                {timeKey !== 'ytd' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-semibold">
                    <Calendar className="w-3 h-3 text-amber-600" />
                    <span>{timeLabel}</span>
                    {onChangeTimeKey && (
                      <button 
                        onClick={() => onChangeTimeKey('ytd')}
                        className="hover:text-amber-950 ml-0.5 cursor-pointer"
                        title="Reset time filter to 2026 YTD"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </span>
                )}

                {/* Source Filter Badge */}
                {selectedSourceFilter !== 'All' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-[11px] font-semibold">
                    <ShieldCheck className="w-3 h-3 text-blue-600" />
                    <span>Source: {selectedSourceFilter}</span>
                    <button 
                      onClick={() => setSelectedSourceFilter('All')}
                      className="hover:text-blue-950 ml-0.5 cursor-pointer"
                      title="Clear source filter"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {/* Tier Filter Badge */}
                {selectedTierFilter !== 'All' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold">
                    <Award className="w-3 h-3 text-emerald-600" />
                    <span>{selectedTierFilter}</span>
                    <button 
                      onClick={() => setSelectedTierFilter('All')}
                      className="hover:text-emerald-950 ml-0.5 cursor-pointer"
                      title="Clear tier filter"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Verified reports from accredited wire services (PTI/ANI, PIB), judicial desks (LiveLaw), broadsheets (The Hindu, Indian Express, HT, TOI), and fact-checkers.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Verified Directory Button */}
          <button
            onClick={() => setIsVerifiedSourcesModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-all cursor-pointer shadow-2xs"
            title="Browse all 22 verified newsrooms and their press accreditations"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Verified Sources ({VERIFIED_SOURCES_CATALOG.length})</span>
          </button>

          {onFetchLiveNews && !isBookmarksView && (
            <button
              onClick={() => onFetchLiveNews(activeCategory, selectedState?.name)}
              disabled={isFetchingLiveNews}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
              title="Generate fresh verified real-time articles via Gemini 3.7 Flash"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetchingLiveNews ? 'animate-spin' : ''}`} />
              <span>{isFetchingLiveNews ? 'Fetching Live Wire...' : '✨ Fetch Live News with AI'}</span>
            </button>
          )}

          {activeCategory === 'For You' && (
            <button
              onClick={onOpenPersonalizeModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Personalize Feed</span>
            </button>
          )}

          {(selectedState || selectedCrimeCategory || searchQuery || activeCategory !== 'All' || timeKey !== 'ytd' || selectedSourceFilter !== 'All' || selectedTierFilter !== 'All') && (
            <button
              onClick={handleClearAll}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium transition-colors cursor-pointer"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Category Pills Bar inside News Feed with dynamic count badges */}
      {!isBookmarksView && (
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-2 mb-3 text-xs">
          {[
            { id: 'All' as NewsCategory, label: 'All India News' },
            { id: 'For You' as NewsCategory, label: 'For You', icon: <Sparkles className="w-3 h-3 text-amber-500" /> },
            { id: 'Public Safety & Crime' as NewsCategory, label: 'Safety & Crimes', icon: <ShieldAlert className="w-3 h-3 text-rose-500" /> },
            { id: 'State & Local' as NewsCategory, label: 'State & Cities', icon: <MapPin className="w-3 h-3 text-blue-500" /> },
            { id: 'National' as NewsCategory, label: 'National' },
            { id: 'Politics' as NewsCategory, label: 'Politics' },
            { id: 'Business' as NewsCategory, label: 'Business & Economy' },
            { id: 'Tech' as NewsCategory, label: 'Tech & Cyber' },
            { id: 'Health & Climate' as NewsCategory, label: 'Health & Climate' }
          ].map((cat) => {
            const isSelected = activeCategory === cat.id;
            const count = getCategoryCount(cat.id);
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 font-medium'
                }`}
              >
                {cat.icon}
                <span>{cat.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  isSelected ? 'bg-blue-800 text-blue-100' : 'bg-slate-100 text-slate-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Genuine Verified Sources Quick Filter Row */}
      {!isBookmarksView && (
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-4 mb-4 text-xs border-b border-slate-100">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 shrink-0 flex items-center gap-1 mr-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Verified Desks:</span>
          </span>

          <button
            onClick={() => { setSelectedSourceFilter('All'); setSelectedTierFilter('All'); }}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              selectedSourceFilter === 'All' && selectedTierFilter === 'All'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            All Outlets
          </button>

          {/* Quick Filter buttons for popular genuine desks */}
          {[
            { label: '🏛️ PIB & Statutory Wires', tier: 'Official Statutory & Wire' },
            { label: '⚖️ Legal (LiveLaw / Bar & Bench)', tier: 'Legal & Judicial Desk' },
            { label: '🔍 IFCN Fact-Checkers', tier: 'IFCN Certified Fact-Check' },
            { label: '📰 National Broadsheets', tier: 'National Broadsheet' },
            { label: '📈 Mint & Business', tier: 'Business & Economy Desk' },
            { label: '🌐 Regional Desks', tier: 'Regional Language Broadsheet' }
          ].map((item, idx) => {
            const isSelected = selectedTierFilter === item.tier;
            return (
              <button
                key={idx}
                onClick={() => {
                  setSelectedTierFilter(isSelected ? 'All' : item.tier);
                  setSelectedSourceFilter('All');
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white font-bold shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Multi-Slide Breaking / Lead Story Hero Carousel */}
      {activeBreakingArticle && (() => {
        const srcInfo = getSourceByName(activeBreakingArticle.source);
        const targetUrl = activeBreakingArticle.originalUrl || (srcInfo?.website ? `https://${srcInfo.website}` : null);

        return (
          <div 
            className="mb-6"
            onMouseEnter={() => setIsHeroHovered(true)}
            onMouseLeave={() => setIsHeroHovered(false)}
          >
            <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white p-6 sm:p-8 shadow-2xl border border-slate-800 group cursor-pointer"
              onClick={() => onSelectArticle(activeBreakingArticle)}
            >
              {/* Subtle background glow */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

              {/* Top Bar with Breaking Tag, Live Ticker & Multi-Slide Controls */}
              <div className="flex items-center justify-between gap-3 relative z-10 flex-wrap mb-4">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="px-3.5 py-1 rounded-full bg-linear-to-r from-rose-600 to-red-600 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-rose-900/40 animate-pulse">
                    <Radio className="w-3.5 h-3.5" />
                    {activeBreakingArticle.isBreaking ? 'Live Breaking News' : 'Top Verified Story'}
                  </span>

                  {breakingPool.length > 1 && (
                    <span className="text-[11px] font-bold text-slate-300 bg-slate-800/90 px-3 py-1 rounded-full border border-slate-700 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      Slide {breakingSlideIndex + 1} of {breakingPool.length}
                    </span>
                  )}

                  {isHeroHovered && breakingPool.length > 1 && (
                    <span className="text-[10px] text-amber-300/90 bg-amber-950/60 px-2.5 py-0.5 rounded-md border border-amber-800/40">
                      Paused on hover
                    </span>
                  )}
                </div>

                {/* Multi-slide Navigation Controls */}
                {breakingPool.length > 1 && (
                  <div className="flex items-center gap-2 bg-slate-800/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700 shadow-md">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setBreakingSlideIndex(prev => (prev - 1 + breakingPool.length) % breakingPool.length);
                      }}
                      className="w-7 h-7 rounded-full bg-slate-700 hover:bg-rose-600 text-white flex items-center justify-center text-sm font-bold transition-all cursor-pointer shadow-xs"
                      title="Previous breaking news slide"
                    >
                      ‹
                    </button>

                    <div className="flex items-center gap-1.5 px-1">
                      {breakingPool.map((_, i) => (
                        <button
                          key={i}
                          onClick={(e) => {
                            e.stopPropagation();
                            setBreakingSlideIndex(i);
                          }}
                          className={`h-2 rounded-full transition-all cursor-pointer ${
                            breakingSlideIndex === i 
                              ? 'bg-rose-500 w-6 shadow-sm shadow-rose-500/50' 
                              : 'bg-slate-600 hover:bg-slate-400 w-2'
                          }`}
                          title={`Jump to Breaking News #${i + 1}`}
                        />
                      ))}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setBreakingSlideIndex(prev => (prev + 1) % breakingPool.length);
                      }}
                      className="w-7 h-7 rounded-full bg-slate-700 hover:bg-rose-600 text-white flex items-center justify-center text-sm font-bold transition-all cursor-pointer shadow-xs"
                      title="Next breaking news slide"
                    >
                      ›
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
                <div className="lg:col-span-8">
                  {/* Source Attribution & Live Dynamic Timestamp */}
                  <div className="flex items-center gap-2 text-xs text-slate-300 mb-3 flex-wrap">
                    {targetUrl ? (
                      <a
                        href={targetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="font-bold text-white hover:text-blue-400 underline-offset-4 hover:underline flex items-center gap-1.5 transition-colors px-2.5 py-1 rounded-md bg-slate-800/90 border border-slate-700 hover:border-blue-500 shadow-xs"
                        title={`Open official report on ${activeBreakingArticle.source} ↗`}
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{activeBreakingArticle.source}</span>
                        <ExternalLink className="w-3 h-3 text-blue-400" />
                      </a>
                    ) : (
                      <span className="font-bold text-white px-2.5 py-1 rounded-md bg-slate-800/90 border border-slate-700 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{activeBreakingArticle.source}</span>
                      </span>
                    )}

                    <span>•</span>
                    <span className="text-amber-300 font-semibold flex items-center gap-1 bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-800/30">
                      <Clock className="w-3 h-3 text-amber-400" />
                      {getLiveTimeAgo(activeBreakingArticle.publishedAt, elapsedMinutes, activeBreakingArticle.publishedTimestamp)}
                    </span>

                    {activeBreakingArticle.stateName && (
                      <>
                        <span>•</span>
                        <span className="text-blue-300 font-semibold flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-blue-400" />
                          {activeBreakingArticle.stateName}
                        </span>
                      </>
                    )}
                    {activeBreakingArticle.districtName && (
                      <span className="text-emerald-300 font-medium">({activeBreakingArticle.districtName})</span>
                    )}
                  </div>

                  <h3 className="text-xl sm:text-3xl font-black text-white group-hover:text-blue-300 transition-colors leading-tight tracking-tight">
                    {(activeBreakingArticle.translatedTitles && activeBreakingArticle.translatedTitles[currentLanguage]) || activeBreakingArticle.title}
                  </h3>

                  <p className="text-sm text-slate-300 mt-3 line-clamp-3 leading-relaxed">
                    {activeBreakingArticle.snippet}
                  </p>

                  {/* Actions Bar with Direct News Source Redirect */}
                  <div className="flex items-center flex-wrap gap-2.5 mt-5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onQuickAiSummary(activeBreakingArticle);
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md hover:shadow-blue-600/30 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>AI 3-Point Takeaway</span>
                    </button>

                    {/* Direct Redirection to Original News Publisher Website */}
                    {targetUrl && (
                      <a
                        href={targetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400/30 text-xs font-black transition-all shadow-md hover:shadow-emerald-600/30 cursor-pointer"
                        title={`Open complete story directly on ${activeBreakingArticle.source} (External Link)`}
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-white" />
                        <span>Read on {activeBreakingArticle.source} ↗</span>
                      </a>
                    )}

                    <span className="text-xs text-slate-400 ml-auto sm:ml-2">
                      ⏱️ {activeBreakingArticle.readTimeMinutes} min read
                    </span>
                  </div>
                </div>

                {activeBreakingArticle.imageUrl && (
                  <div className="lg:col-span-4 rounded-2xl overflow-hidden h-48 sm:h-56 bg-slate-800 border border-slate-700 relative shadow-inner">
                    <img
                      src={activeBreakingArticle.imageUrl}
                      alt={activeBreakingArticle.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-slate-900/60 via-transparent to-transparent pointer-events-none" />
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Grid of Articles */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {standardArticles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              currentLanguage={currentLanguage}
              onSelectArticle={onSelectArticle}
              isBookmarked={bookmarkedIds.includes(article.id)}
              onToggleBookmark={onToggleBookmark}
              onQuickAiSummary={onQuickAiSummary}
              elapsedMinutes={elapsedMinutes}
            />
          ))}
        </div>
      ) : isBookmarksView ? (
        <div className="bg-slate-50 rounded-3xl p-10 text-center border border-slate-200 my-8">
          <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-4">
            <Bookmark className="w-8 h-8 fill-blue-600/30" />
          </div>
          <h4 className="text-lg font-bold text-slate-900">No saved articles yet</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1.5 leading-relaxed">
            You have not bookmarked any stories yet. Click the bookmark icon on any verified article or public safety advisory to save it for quick reference anytime.
          </p>
          <div className="flex items-center justify-center gap-3 mt-5">
            <button
              onClick={handleClearAll}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              Browse Top Indian Stories &amp; Safety Bulletins
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 rounded-3xl p-10 text-center border border-slate-200 my-8">
          <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8" />
          </div>
          <h4 className="text-lg font-bold text-slate-900">No news articles found for active criteria</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1.5">
            {selectedSourceFilter !== 'All' || selectedTierFilter !== 'All'
              ? `No articles found for the selected source desk. Try choosing "All Outlets" or reset filters.`
              : timeKey !== 'ytd' 
                ? `No articles match the timeframe "${timeLabel}". Try switching to "All India", changing your date range, or clicking below to reset.`
                : 'Try adjusting your search terms, removing state restrictions, or switching to "All India". You can also fetch live real-time coverage using Gemini AI.'}
          </p>
          <div className="flex items-center justify-center flex-wrap gap-3 mt-4">
            {(selectedSourceFilter !== 'All' || selectedTierFilter !== 'All') && (
              <button
                onClick={() => { setSelectedSourceFilter('All'); setSelectedTierFilter('All'); }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Show All 22 Verified Sources
              </button>
            )}
            {timeKey !== 'ytd' && onChangeTimeKey && (
              <button
                onClick={() => onChangeTimeKey('ytd')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Switch to All 2026 Stories
              </button>
            )}
            <button
              onClick={handleClearAll}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Reset All Filters
            </button>
            {onFetchLiveNews && (
              <button
                onClick={() => onFetchLiveNews(activeCategory, selectedState?.name)}
                disabled={isFetchingLiveNews}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Fetch AI Live News for this Section</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Verified Sources Directory Modal */}
      <VerifiedSourcesModal
        isOpen={isVerifiedSourcesModalOpen}
        onClose={() => setIsVerifiedSourcesModalOpen(false)}
        onSelectSourceFilter={(sourceName) => {
          setSelectedSourceFilter(sourceName);
          setSelectedTierFilter('All');
        }}
      />

    </section>
  );
};
