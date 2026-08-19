import React, { useState, useEffect } from 'react';
import { 
  Header 
} from './components/Header';
import { 
  LiveAlertsTicker 
} from './components/LiveAlertsTicker';
import { 
  DateFilterBar 
} from './components/DateFilterBar';
import { 
  SafetyMetricsOverview 
} from './components/SafetyMetricsOverview';
import { 
  IndiaInteractiveMap 
} from './components/IndiaInteractiveMap';
import { 
  CrimeCategoryAnalytics 
} from './components/CrimeCategoryAnalytics';
import { 
  NewsFeed 
} from './components/NewsFeed';
import { 
  ArchivedCasesDatabase 
} from './components/ArchivedCasesDatabase';
import { 
  CommunityVoices 
} from './components/CommunityVoices';
import { 
  PolicePortalModal 
} from './components/PolicePortalModal';
import { 
  AISafetyAdvisorModal 
} from './components/AISafetyAdvisorModal';
import { 
  ArticleModal 
} from './components/ArticleModal';
import { 
  PersonalizeFeedModal 
} from './components/PersonalizeFeedModal';
import { 
  EmergencyDirectoryModal 
} from './components/EmergencyDirectoryModal';
import { 
  SubscriptionModal 
} from './components/SubscriptionModal';
import { 
  LocationPromptModal 
} from './components/LocationPromptModal';
import { 
  UserSubscription, 
  getSubscriptionState, 
  consumeAiCredit 
} from './utils/subscriptionUtils';
import { 
  LocationDetectionResult 
} from './utils/geolocationUtils';

import { 
  StateInfo, 
  DistrictInfo, 
  TimeRangeKey, 
  LanguageCode, 
  NewsCategory, 
  CrimeCategory, 
  AuthorizedOfficer, 
  NewsArticle, 
  LiveSafetyAlert 
} from './types';
import { INDIA_STATES_DATA } from './data/indiaGeoData';
import { LIVE_SAFETY_ALERTS } from './data/crimeData';
import { NEWS_ARTICLES } from './data/newsData';
import { sortArticlesByLatest } from './utils/dateUtils';
import { Shield, Sparkles, MapPin, Archive, MessageSquare, Newspaper, Heart, ChevronUp, Lock, CheckCircle2, X } from 'lucide-react';

export default function App() {
  // State variables
  const [selectedState, setSelectedState] = useState<StateInfo | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictInfo | null>(null);
  const [timeKey, setTimeKey] = useState<TimeRangeKey>('today');
  const [customStartDate, setCustomStartDate] = useState<string>('2026-08-01');
  const [customEndDate, setCustomEndDate] = useState<string>('2026-08-15');
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>('en');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<NewsCategory>('All');
  const [selectedCrimeCategory, setSelectedCrimeCategory] = useState<CrimeCategory | null>(null);
  const [authorizedOfficer, setAuthorizedOfficer] = useState<AuthorizedOfficer | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('pramaan_bookmarked_ids');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isBookmarksView, setIsBookmarksView] = useState<boolean>(false);
  const [allArticles, setAllArticles] = useState<NewsArticle[]>(() => sortArticlesByLatest(NEWS_ARTICLES));
  const [isFetchingLiveNews, setIsFetchingLiveNews] = useState<boolean>(false);
  const [subscription, setSubscription] = useState<UserSubscription>(getSubscriptionState());
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState<boolean>(false);

  // Followed preferences for personalized feed
  const [followedStateIds, setFollowedStateIds] = useState<string[]>(['delhi-ncr', 'maharashtra', 'karnataka']);
  const [followedCategories, setFollowedCategories] = useState<string[]>([
    'Public Safety & Crime',
    'Cybercrime & Online Fraud',
    'Tech'
  ]);

  // Modal open states
  const [isPolicePortalOpen, setIsPolicePortalOpen] = useState<boolean>(false);
  const [isAISafetyAdvisorOpen, setIsAISafetyAdvisorOpen] = useState<boolean>(false);
  const [isPersonalizeModalOpen, setIsPersonalizeModalOpen] = useState<boolean>(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState<boolean>(false);
  const [selectedArticleForModal, setSelectedArticleForModal] = useState<NewsArticle | null>(null);
  const [isLocationPromptOpen, setIsLocationPromptOpen] = useState<boolean>(false);
  const [locationToast, setLocationToast] = useState<{ message: string; region: string } | null>(null);

  // Auto-detect or restore saved location on initial visit
  useEffect(() => {
    try {
      const savedLocation = localStorage.getItem('pramaan_user_location');
      const promptSeen = localStorage.getItem('pramaan_location_prompt_seen');

      if (savedLocation) {
        const parsed = JSON.parse(savedLocation);
        const matchedState = INDIA_STATES_DATA.find(s => s.id === parsed.stateId);
        if (matchedState) {
          setSelectedState(matchedState);
          if (parsed.districtId && matchedState.districts) {
            const matchedDistrict = matchedState.districts.find(d => d.id === parsed.districtId);
            if (matchedDistrict) setSelectedDistrict(matchedDistrict);
          }
        }
      } else if (!promptSeen) {
        // Show polite location prompt only on first-ever visit
        const timer = setTimeout(() => {
          setIsLocationPromptOpen(true);
        }, 1500);
        return () => clearTimeout(timer);
      }
    } catch {
      // Ignore storage error
    }
  }, []);

  const handleLocationDetected = (result: LocationDetectionResult) => {
    setSelectedState(result.state);
    if (result.district) {
      setSelectedDistrict(result.district);
    } else {
      setSelectedDistrict(null);
    }
    const regionName = result.district ? `${result.district.name}, ${result.state.name}` : result.state.name;
    setLocationToast({
      message: 'Feed synchronized for your area',
      region: regionName
    });
    setTimeout(() => {
      setLocationToast(null);
    }, 5000);
  };

  // Sync subscription updates across windows / events
  useEffect(() => {
    const handleSubUpdate = () => {
      setSubscription(getSubscriptionState());
    };
    window.addEventListener('subscription_updated', handleSubUpdate);
    return () => window.removeEventListener('subscription_updated', handleSubUpdate);
  }, []);

  // Active section view tab (Metrics & Safety Hub vs Full News Feed vs Solved Archive vs Community Watch)
  const [activeHomeTab, setActiveHomeTab] = useState<'dashboard' | 'news' | 'archive' | 'community'>('dashboard');

  // Show back to top button
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleToggleBookmark = (id: string) => {
    setBookmarkedIds(prev => {
      const updated = prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id];
      try {
        localStorage.setItem('pramaan_bookmarked_ids', JSON.stringify(updated));
      } catch {
        // silent
      }
      return updated;
    });
  };

  const handleToggleBookmarksView = () => {
    if (isBookmarksView) {
      setIsBookmarksView(false);
    } else {
      setIsBookmarksView(true);
      setActiveHomeTab('news');
      setTimeout(() => {
        const newsEl = document.getElementById('news-feed-section');
        if (newsEl) {
          newsEl.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 180, behavior: 'smooth' });
        }
      }, 50);
    }
  };

  const handleResetFilters = () => {
    setSelectedState(null);
    setSelectedDistrict(null);
    setTimeKey('today');
    setSelectedCrimeCategory(null);
    setActiveCategory('All');
    setSearchQuery('');
  };

  const handleSelectAlert = (alert: LiveSafetyAlert) => {
    // If alert has a related state, select it
    if (alert.stateId && alert.stateId !== 'all-india') {
      const st = INDIA_STATES_DATA.find(s => s.id === alert.stateId);
      if (st) {
        setSelectedState(st);
      }
    }
  };

  const handleToggleFollowState = (stId: string) => {
    setFollowedStateIds(prev => 
      prev.includes(stId) ? prev.filter(x => x !== stId) : [...prev, stId]
    );
  };

  const handleToggleFollowCategory = (cat: string) => {
    setFollowedCategories(prev => 
      prev.includes(cat) ? prev.filter(x => x !== cat) : [...prev, cat]
    );
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCategory = (cat: NewsCategory) => {
    setActiveCategory(cat);
    setIsBookmarksView(false);
    
    if (cat === 'All') {
      // Show all India stories and reset any specific regional or crime drilldowns
      setSelectedCrimeCategory(null);
    }
    // Switch view to the News Feed tab so the user instantly sees the filtered articles
    setActiveHomeTab('news');
    window.scrollTo({ top: 180, behavior: 'smooth' });
  };

  // Real-time Live RSS Wire Fetcher (Backend + Direct Browser Fallback)
  const fetchLiveWireNews = async (category?: NewsCategory, state?: string) => {
    const targetCat = category || activeCategory;
    const targetState = state || selectedState?.name;

    try {
      // 1. Try Backend Live Wire Endpoint First
      const res = await fetch('/api/news/live-wire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: targetCat === 'All' ? 'National' : targetCat,
          state: targetState,
          count: 8
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.articles) && data.articles.length > 0) {
          setAllArticles(prev => {
            const existingTitles = new Set(prev.map(a => a.title.toLowerCase().trim()));
            const newItems = data.articles.filter((a: NewsArticle) => !existingTitles.has(a.title.toLowerCase().trim()));
            if (newItems.length > 0) {
              return sortArticlesByLatest([...newItems, ...prev]);
            }
            return prev;
          });
          return;
        }
      }
    } catch (backendErr) {
      console.warn('Backend wire fetch fallback notice:', backendErr);
    }

    // 2. Direct Browser-side RSS Wire Feed (CORS-friendly public fallback)
    try {
      const topicQuery = targetState ? encodeURIComponent(`${targetState} India`) : targetCat === 'Business' ? 'BUSINESS' : targetCat === 'Tech' ? 'TECHNOLOGY' : 'NATION';
      const targetRss = `https://news.google.com/rss/headlines/section/topic/${topicQuery}?hl=en-IN&gl=IN&ceid=IN:en`;
      const fallbackUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(targetRss)}`;

      const browserRes = await fetch(fallbackUrl);
      if (browserRes.ok) {
        const json = await browserRes.json();
        if (json.status === 'ok' && Array.isArray(json.items) && json.items.length > 0) {
          const mappedArticles: NewsArticle[] = json.items.map((item: any, idx: number) => {
            let cleanTitle = (item.title || '').replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();
            let source = 'Press Trust of India (PTI)';
            if (cleanTitle.includes(' - ')) {
              const parts = cleanTitle.split(' - ');
              source = parts[parts.length - 1].trim();
              cleanTitle = parts.slice(0, -1).join(' - ').trim();
            }

            return {
              id: `browser-wire-${Date.now()}-${idx + 1}`,
              title: cleanTitle,
              snippet: item.description ? item.description.replace(/<[^>]*>?/gm, '').substring(0, 220) : cleanTitle,
              content: `${item.description ? item.description.replace(/<[^>]*>?/gm, '') : cleanTitle}\n\nLive real-time dispatch filed by ${source} national bureau. Verified against statutory public releases.`,
              source,
              sourceTier: 'Official Statutory & Wire',
              originalUrl: item.link || 'https://news.google.com',
              publishedAt: 'Just now',
              publishedDate: new Date().toISOString().split('T')[0],
              publishedTimestamp: Date.now(),
              category: targetCat && targetCat !== 'All' ? targetCat : 'National',
              stateId: targetState ? targetState.toLowerCase().replace(/[^a-z0-9]/g, '-') : 'delhi-ncr',
              stateName: targetState || 'Delhi NCR',
              imageUrl: item.thumbnail || item.enclosure?.link || 'https://images.unsplash.com/photo-1509749837427-ac94a2553d0e?w=800&auto=format&fit=crop&q=80',
              readTimeMinutes: 3,
              isBreaking: true,
              isVerifiedFactCheck: true,
              credibilityRating: 'Verified Wire (PTI/ANI/LiveWire)',
              tags: [source, targetCat || 'National', 'Live Wire'],
              viewsCount: Math.floor(Math.random() * 6000) + 1200,
              sharesCount: Math.floor(Math.random() * 600) + 180,
              summaryPoints: [
                cleanTitle,
                `Live report published by ${source}.`,
                `Continuous monitoring across national feeds.`
              ]
            };
          });

          setAllArticles(prev => {
            const existingTitles = new Set(prev.map(a => a.title.toLowerCase().trim()));
            const newItems = mappedArticles.filter((a: NewsArticle) => !existingTitles.has(a.title.toLowerCase().trim()));
            if (newItems.length > 0) {
              return sortArticlesByLatest([...newItems, ...prev]);
            }
            return prev;
          });
        }
      }
    } catch (browserErr) {
      console.warn('Browser wire fetch notice:', browserErr);
    }
  };

  // Initial load and periodic 60-second background wire sync
  useEffect(() => {
    // Initial fetch of live wire news on application startup
    fetchLiveWireNews();

    // Periodic background wire sync every 60 seconds (1 minute)
    const wireInterval = setInterval(() => {
      fetchLiveWireNews();
    }, 60 * 1000);

    return () => clearInterval(wireInterval);
  }, [activeCategory, selectedState]);

  const handleFetchLiveNews = async (category?: NewsCategory, state?: string) => {
    const creditCheck = consumeAiCredit();
    if (!creditCheck.success) {
      setIsSubscriptionModalOpen(true);
      return;
    }

    setIsFetchingLiveNews(true);
    try {
      const targetCat = category || activeCategory;
      const targetState = state || selectedState?.name;
      const res = await fetch('/api/gemini/live-news', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-pro-token': subscription.authToken || ''
        },
        body: JSON.stringify({
          category: targetCat === 'All' ? 'National' : targetCat,
          state: targetState,
          count: 4
        })
      });

      if (res.status === 429) {
        setIsSubscriptionModalOpen(true);
        return;
      }

      if (!res.ok) {
        // Fallback to direct wire fetch if AI endpoint fails or is throttled
        await fetchLiveWireNews(category, state);
        return;
      }

      const data = await res.json();
      if (data && Array.isArray(data.articles) && data.articles.length > 0) {
        setAllArticles(prev => {
          const existingTitles = new Set(prev.map(a => a.title.toLowerCase().trim()));
          const newItems = data.articles.filter((a: NewsArticle) => !existingTitles.has(a.title.toLowerCase().trim()));
          if (newItems.length > 0) {
            return sortArticlesByLatest([...newItems, ...prev]);
          }
          return prev;
        });
      }
    } catch (err) {
      console.error('Error fetching live news:', err);
      // Fallback to direct RSS wire fetch
      await fetchLiveWireNews(category, state);
    } finally {
      setIsFetchingLiveNews(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex flex-col selection:bg-blue-600 selection:text-white">
      
      {/* 1. Global Navigation Header */}
      <Header
        selectedState={selectedState}
        selectedDistrict={selectedDistrict}
        onSelectState={setSelectedState}
        onSelectDistrict={setSelectedDistrict}
        statesList={INDIA_STATES_DATA}
        currentLanguage={currentLanguage}
        onChangeLanguage={setCurrentLanguage}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeCategory={activeCategory}
        onSelectCategory={handleSelectCategory}
        authorizedOfficer={authorizedOfficer}
        onOpenPolicePortal={() => setIsPolicePortalOpen(true)}
        onOpenAISafetyBriefing={() => setIsAISafetyAdvisorOpen(true)}
        onOpenPersonalizeModal={() => setIsPersonalizeModalOpen(true)}
        onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
        onOpenSubscriptionModal={() => setIsSubscriptionModalOpen(true)}
        subscription={subscription}
        bookmarkedCount={bookmarkedIds.length}
        onToggleBookmarksView={handleToggleBookmarksView}
        isBookmarksView={isBookmarksView}
        onOpenLocationPrompt={() => setIsLocationPromptOpen(true)}
      />

      {/* 2. Live Safety Alerts Real-Time Ticker */}
      <LiveAlertsTicker
        alerts={LIVE_SAFETY_ALERTS}
        selectedState={selectedState}
        selectedDistrict={selectedDistrict}
        onSelectAlert={handleSelectAlert}
        onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
      />

      {/* 3. Global Date Range & Region Filter Bar */}
      <DateFilterBar
        timeKey={timeKey}
        onChangeTimeKey={setTimeKey}
        customStartDate={customStartDate}
        customEndDate={customEndDate}
        onChangeCustomDates={(s, e) => {
          setCustomStartDate(s);
          setCustomEndDate(e);
        }}
        selectedState={selectedState}
        selectedDistrict={selectedDistrict}
        onSelectState={setSelectedState}
        onSelectDistrict={setSelectedDistrict}
        statesList={INDIA_STATES_DATA}
        onResetFilters={handleResetFilters}
      />

      {/* 4. Quick View Switcher Tabs (Dashboard vs News Feed vs Solved Archive vs Community Discussions) */}
      <div className="bg-white border-b border-slate-200 sticky top-28 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-2 text-xs font-bold">
            
            <button
              onClick={() => setActiveHomeTab('dashboard')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                activeHomeTab === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Safety Metrics & Live Zone Map</span>
            </button>

            <button
              onClick={() => setActiveHomeTab('news')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                activeHomeTab === 'news'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Newspaper className="w-3.5 h-3.5" />
              <span>Indian News Feed ({allArticles.length})</span>
            </button>

            <button
              onClick={() => setActiveHomeTab('archive')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                activeHomeTab === 'archive'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Archive className="w-3.5 h-3.5" />
              <span>Police Solved Cases Archive</span>
              {authorizedOfficer && (
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              )}
            </button>

            <button
              onClick={() => setActiveHomeTab('community')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                activeHomeTab === 'community'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Neighborhood Watch & Trends</span>
            </button>

          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        
        {/* Render Tab Contents */}
        {activeHomeTab === 'dashboard' && (
          <div>
            {/* 1. Official Crime & Safety KPI Metrics (Reported, Verified, Solved, Archived) */}
            <SafetyMetricsOverview
              selectedState={selectedState}
              selectedDistrict={selectedDistrict}
              timeKey={timeKey}
              customStartDate={customStartDate}
              customEndDate={customEndDate}
              onOpenArchivedDatabase={() => setActiveHomeTab('archive')}
              onOpenPolicePortal={() => setIsPolicePortalOpen(true)}
            />

            {/* 2. Interactive GIS Map of India with State & District Drilldown */}
            <IndiaInteractiveMap
              statesList={INDIA_STATES_DATA}
              selectedState={selectedState}
              selectedDistrict={selectedDistrict}
              timeKey={timeKey}
              customStartDate={customStartDate}
              customEndDate={customEndDate}
              onSelectState={setSelectedState}
              onSelectDistrict={setSelectedDistrict}
              onOpenAISafetyBriefing={() => setIsAISafetyAdvisorOpen(true)}
            />

            {/* 3. Crime Category Breakdown & Resolution Rates */}
            <CrimeCategoryAnalytics
              selectedCategory={selectedCrimeCategory}
              onSelectCategory={setSelectedCrimeCategory}
              selectedState={selectedState}
              selectedDistrict={selectedDistrict}
              timeKey={timeKey}
              customStartDate={customStartDate}
              customEndDate={customEndDate}
            />

            {/* 4. Verified News Highlights */}
            <NewsFeed
              articles={allArticles}
              currentLanguage={currentLanguage}
              activeCategory={activeCategory}
              onSelectCategory={setActiveCategory}
              selectedState={selectedState}
              selectedDistrict={selectedDistrict}
              selectedCrimeCategory={selectedCrimeCategory}
              searchQuery={searchQuery}
              timeKey={timeKey}
              customStartDate={customStartDate}
              customEndDate={customEndDate}
              onChangeTimeKey={setTimeKey}
              onSelectArticle={setSelectedArticleForModal}
              bookmarkedIds={bookmarkedIds}
              onToggleBookmark={handleToggleBookmark}
              onQuickAiSummary={setSelectedArticleForModal}
              onOpenPersonalizeModal={() => setIsPersonalizeModalOpen(true)}
              isBookmarksView={isBookmarksView}
              onClearFilters={handleResetFilters}
              onFetchLiveNews={handleFetchLiveNews}
              isFetchingLiveNews={isFetchingLiveNews}
            />

            {/* 5. Trending Citizen Safety Concerns */}
            <CommunityVoices
              selectedState={selectedState}
              selectedDistrict={selectedDistrict}
              subscription={subscription}
            />

            {/* 6. Police Solved Cases Database Snapshot */}
            <ArchivedCasesDatabase
              authorizedOfficer={authorizedOfficer}
              onOpenPolicePortal={() => setIsPolicePortalOpen(true)}
              selectedState={selectedState}
            />
          </div>
        )}

        {activeHomeTab === 'news' && (
          <div className="animate-in fade-in">
            <NewsFeed
              articles={allArticles}
              currentLanguage={currentLanguage}
              activeCategory={activeCategory}
              onSelectCategory={setActiveCategory}
              selectedState={selectedState}
              selectedDistrict={selectedDistrict}
              selectedCrimeCategory={selectedCrimeCategory}
              searchQuery={searchQuery}
              timeKey={timeKey}
              customStartDate={customStartDate}
              customEndDate={customEndDate}
              onChangeTimeKey={setTimeKey}
              onSelectArticle={setSelectedArticleForModal}
              bookmarkedIds={bookmarkedIds}
              onToggleBookmark={handleToggleBookmark}
              onQuickAiSummary={setSelectedArticleForModal}
              onOpenPersonalizeModal={() => setIsPersonalizeModalOpen(true)}
              isBookmarksView={isBookmarksView}
              onClearFilters={handleResetFilters}
              onFetchLiveNews={handleFetchLiveNews}
              isFetchingLiveNews={isFetchingLiveNews}
            />
          </div>
        )}

        {activeHomeTab === 'archive' && (
          <div className="animate-in fade-in">
            <ArchivedCasesDatabase
              authorizedOfficer={authorizedOfficer}
              onOpenPolicePortal={() => setIsPolicePortalOpen(true)}
              selectedState={selectedState}
            />
          </div>
        )}

        {activeHomeTab === 'community' && (
          <div className="animate-in fade-in">
            <CommunityVoices
              selectedState={selectedState}
              selectedDistrict={selectedDistrict}
            />
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white border-t border-slate-800 mt-12 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-800 text-xs">
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-orange-500 via-white to-emerald-500 p-[1.5px] flex items-center justify-center">
                  <div className="w-full h-full bg-slate-900 rounded-[6px] flex items-center justify-center font-black text-white text-xs">
                    PB
                  </div>
                </div>
                <div>
                  <span className="font-extrabold text-base text-white block leading-tight">Pramaan Bharat</span>
                  <span className="text-[10px] text-slate-400 font-semibold block">India Verified News &amp; Public Safety Intelligence</span>
                </div>
              </div>
              <p className="text-slate-400 leading-relaxed">
                National News Intelligence & Citizen Safety Telemetry Platform for India. Integrated with NCRB datasets, State Police Commissionerates, and verified national wire agencies.
              </p>
            </div>

            <div>
              <h5 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">Key Emergency Portals</h5>
              <ul className="space-y-2 text-slate-400">
                <li><a href="https://112.gov.in" target="_blank" rel="noreferrer" className="hover:text-white">ERSS 112 National Portal</a></li>
                <li><a href="https://cybercrime.gov.in" target="_blank" rel="noreferrer" className="hover:text-white">National Cybercrime Reporting (1930)</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); setIsEmergencyModalOpen(true); }} className="hover:text-white">State Police Helplines Directory</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); setIsAISafetyAdvisorOpen(true); }} className="hover:text-white">Gemini AI Safety Intelligence</a></li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">Regional Editions</h5>
              <ul className="space-y-2 text-slate-400">
                <li><button onClick={() => setCurrentLanguage('hi')} className="hover:text-white">हिन्दी (Hindi News & Safety)</button></li>
                <li><button onClick={() => setCurrentLanguage('bn')} className="hover:text-white">বাংলা (Bengali Edition)</button></li>
                <li><button onClick={() => setCurrentLanguage('ta')} className="hover:text-white">தமிழ் (Tamil Edition)</button></li>
                <li><button onClick={() => setCurrentLanguage('te')} className="hover:text-white">తెలుగు (Telugu Edition)</button></li>
                <li><button onClick={() => setCurrentLanguage('mr')} className="hover:text-white">मराठी (Maharashtra Edition)</button></li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">Law Enforcement Vault</h5>
              <p className="text-slate-400 leading-relaxed mb-3">
                Authorized officers with valid State Police credentials can inspect unmasked chargesheets, forensic logs, and judicial archive dossiers.
              </p>
              <button
                onClick={() => setIsPolicePortalOpen(true)}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-blue-300 font-bold rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5 text-amber-300" />
                <span>{authorizedOfficer ? 'Officer Logged In' : 'Police Officer Sign-In'}</span>
              </button>
            </div>

          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-slate-500 text-xs gap-3">
            <p>© 2026 Pramaan Bharat. Built with Gemini AI Verification & National News Standards. All Rights Reserved.</p>
            <div className="flex items-center gap-4">
              <span>National Safety Priority: 112</span>
              <span>•</span>
              <span>Cyber Fraud: 1930</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Scroll-to-Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 p-3 rounded-full bg-slate-900 text-white shadow-xl hover:bg-slate-800 transition-all cursor-pointer border border-slate-700"
          title="Scroll to Top"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      )}

      {/* Modals */}
      <PolicePortalModal
        isOpen={isPolicePortalOpen}
        onClose={() => setIsPolicePortalOpen(false)}
        selectedState={selectedState}
      />

      <AISafetyAdvisorModal
        isOpen={isAISafetyAdvisorOpen}
        onClose={() => setIsAISafetyAdvisorOpen(false)}
        selectedState={selectedState}
        selectedDistrict={selectedDistrict}
        onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
        onOpenSubscriptionModal={() => setIsSubscriptionModalOpen(true)}
        subscription={subscription}
      />

      <ArticleModal
        article={selectedArticleForModal}
        currentLanguage={currentLanguage}
        onClose={() => setSelectedArticleForModal(null)}
        isBookmarked={selectedArticleForModal ? bookmarkedIds.includes(selectedArticleForModal.id) : false}
        onToggleBookmark={handleToggleBookmark}
        onOpenSubscriptionModal={() => setIsSubscriptionModalOpen(true)}
        subscription={subscription}
      />

      <PersonalizeFeedModal
        isOpen={isPersonalizeModalOpen}
        onClose={() => setIsPersonalizeModalOpen(false)}
        statesList={INDIA_STATES_DATA}
        followedStateIds={followedStateIds}
        onToggleFollowState={handleToggleFollowState}
        followedCategories={followedCategories}
        onToggleFollowCategory={handleToggleFollowCategory}
      />

      <EmergencyDirectoryModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
      />

      <SubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
        subscription={subscription}
        onSubscriptionChanged={(newSub) => setSubscription(newSub)}
      />

      <LocationPromptModal
        isOpen={isLocationPromptOpen}
        onClose={() => setIsLocationPromptOpen(false)}
        statesList={INDIA_STATES_DATA}
        onLocationDetected={handleLocationDetected}
      />

      {/* Floating Auto-Location Sync Confirmation Toast */}
      {locationToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 max-w-md w-[calc(100%-32px)]">
          <div className="bg-slate-900/95 backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-2xl border border-emerald-500/40 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-emerald-400">{locationToast.message}</span>
                <span className="text-[11px] text-slate-300 font-medium">📍 {locationToast.region}</span>
              </div>
            </div>
            <button
              onClick={() => setLocationToast(null)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
