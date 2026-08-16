import React, { useState } from 'react';
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
  CheckCircle2
} from 'lucide-react';
import { NewsArticle, LanguageCode, NewsCategory, StateInfo, DistrictInfo, CrimeCategory, TimeRangeKey, SourceTier } from '../types';
import { ArticleCard } from './ArticleCard';
import { isArticleInTimeRange, getTimeframeLabel } from '../utils/dateUtils';
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
  timeKey = 'ytd',
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

  // First apply timeframe filter to base article set
  const timeframeArticles = isBookmarksView 
    ? articles 
    : articles.filter(a => isArticleInTimeRange(a, timeKey, customStartDate, customEndDate));

  // Category counts calculation helper based on current timeframe
  const getCategoryCount = (catId: NewsCategory) => {
    if (catId === 'All') return timeframeArticles.length;
    if (catId === 'For You') {
      return timeframeArticles.filter(a => 
        a.category === 'Public Safety & Crime' || 
        a.category === 'Tech' || 
        a.isBreaking
      ).length;
    }
    return timeframeArticles.filter(a => a.category === catId).length;
  };

  // Filter logic
  let filtered = timeframeArticles;

  if (isBookmarksView) {
    filtered = filtered.filter(a => bookmarkedIds.includes(a.id));
  } else {
    // Category filter
    if (activeCategory === 'For You') {
      // Personalized feed prioritizing followed states or safety / tech
      filtered = filtered.filter(a => 
        a.category === 'Public Safety & Crime' || 
        a.category === 'Tech' || 
        a.stateId === selectedState?.id ||
        a.isBreaking
      );
    } else if (activeCategory !== 'All') {
      filtered = filtered.filter(a => a.category === activeCategory);
    }

    // State & District filter
    if (selectedState) {
      filtered = filtered.filter(a => !a.stateId || a.stateId === selectedState.id);
    }

    if (selectedDistrict) {
      const match = filtered.filter(a => a.districtId === selectedDistrict.id);
      if (match.length > 0) filtered = match;
    }

    // Crime category filter
    if (selectedCrimeCategory) {
      filtered = filtered.filter(a => a.crimeCategory === selectedCrimeCategory);
    }

    // Source Tier filter
    if (selectedTierFilter !== 'All') {
      filtered = filtered.filter(a => {
        const srcInfo = getSourceByName(a.source);
        return a.sourceTier === selectedTierFilter || srcInfo?.tier === selectedTierFilter;
      });
    }

    // Specific Source filter
    if (selectedSourceFilter !== 'All') {
      filtered = filtered.filter(a => {
        const sLower = a.source.toLowerCase();
        const fLower = selectedSourceFilter.toLowerCase();
        return sLower.includes(fLower) || fLower.includes(sLower);
      });
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(a => 
        a.title.toLowerCase().includes(q) ||
        a.snippet.toLowerCase().includes(q) ||
        a.content.toLowerCase().includes(q) ||
        a.source.toLowerCase().includes(q) ||
        a.tags.some(t => t.toLowerCase().includes(q)) ||
        (a.stateName && a.stateName.toLowerCase().includes(q))
      );
    }
  }

  // Breaking article highlight if available
  const breakingArticle = !isBookmarksView && !searchQuery && selectedSourceFilter === 'All' && selectedTierFilter === 'All' ? filtered.find(a => a.isBreaking) : null;
  const standardArticles = breakingArticle ? filtered.filter(a => a.id !== breakingArticle.id) : filtered;
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

      {/* Breaking / Lead Story Hero Banner if present */}
      {breakingArticle && (
        <div className="mb-6">
          <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white p-6 sm:p-8 shadow-xl border border-slate-800 group cursor-pointer"
            onClick={() => onSelectArticle(breakingArticle)}
          >
            <div className="absolute top-4 left-4 z-10">
              <span className="px-3 py-1 rounded-full bg-rose-600 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                <Flame className="w-3.5 h-3.5 animate-bounce" />
                Breaking News
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10 mt-6 sm:mt-4">
              <div className="lg:col-span-8">
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                  <span className="font-bold text-white">{breakingArticle.source}</span>
                  <span>•</span>
                  <span>{breakingArticle.publishedAt}</span>
                  {breakingArticle.stateName && (
                    <>
                      <span>•</span>
                      <span className="text-blue-400 font-semibold">📍 {breakingArticle.stateName}</span>
                    </>
                  )}
                </div>

                <h3 className="text-xl sm:text-3xl font-black text-white group-hover:text-blue-400 transition-colors leading-tight tracking-tight">
                  {(breakingArticle.translatedTitles && breakingArticle.translatedTitles[currentLanguage]) || breakingArticle.title}
                </h3>

                <p className="text-sm text-slate-300 mt-3 line-clamp-3 leading-relaxed">
                  {breakingArticle.snippet}
                </p>

                <div className="flex items-center flex-wrap gap-2 mt-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onQuickAiSummary(breakingArticle);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>AI 3-Point Summary</span>
                  </button>

                  <span className="text-xs text-slate-400">
                    ⏱️ {breakingArticle.readTimeMinutes} min read
                  </span>
                </div>
              </div>

              {breakingArticle.imageUrl && (
                <div className="lg:col-span-4 rounded-2xl overflow-hidden h-48 sm:h-56 bg-slate-800 border border-slate-700">
                  <img
                    src={breakingArticle.imageUrl}
                    alt={breakingArticle.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
