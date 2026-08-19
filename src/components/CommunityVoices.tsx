import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  MessageSquare, 
  ThumbsUp, 
  AlertTriangle, 
  MapPin, 
  Plus, 
  Send, 
  CheckCircle2, 
  Shield, 
  Clock, 
  X, 
  Sparkles,
  Flame,
  RefreshCw,
  Radio,
  Filter
} from 'lucide-react';
import { CommunityTopic, StateInfo, DistrictInfo } from '../types';
import { COMMUNITY_TOPICS } from '../data/communityData';
import { UserSubscription } from '../utils/subscriptionUtils';

interface CommunityVoicesProps {
  selectedState: StateInfo | null;
  selectedDistrict: DistrictInfo | null;
  subscription?: UserSubscription;
}

const LOCAL_STORAGE_COMMUNITY_KEY = 'pramaan_bharat_community_topics_v1';

const getLiveCommunityTimeAgo = (createdTimestamp?: number, fallbackStr?: string): string => {
  if (!createdTimestamp) return fallbackStr || 'Just now';
  const diffMs = Date.now() - createdTimestamp;
  const diffMins = Math.max(0, Math.floor(diffMs / 60000));
  
  if (diffMins < 1) return 'Just now';
  if (diffMins === 1) return '1 min ago';
  if (diffMins < 60) return `${diffMins} mins ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours === 1) return '1 hour ago';
  if (diffHours < 24) return `${diffHours} hours ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays} days ago`;
};

export const CommunityVoices: React.FC<CommunityVoicesProps> = ({
  selectedState,
  selectedDistrict,
  subscription
}) => {
  // Load initial topics from localStorage if available, or fall back to default
  const [topics, setTopics] = useState<CommunityTopic[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_COMMUNITY_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return COMMUNITY_TOPICS;
  });

  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newDescription, setNewDescription] = useState<string>('');
  const [newLocality, setNewLocality] = useState<string>('');
  const [newCategory, setNewCategory] = useState<string>('Street Lighting / Infrastructure');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [aiClassificationResult, setAiClassificationResult] = useState<any>(null);

  // Live stream auto-refresh state
  const [lastSyncTime, setLastSyncTime] = useState<number>(Date.now());
  const [secondsUntilSync, setSecondsUntilSync] = useState<number>(45);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'URGENT' | 'POLICE_ASSIGNED' | 'RESOLVED'>('ALL');
  const [nowTimestamp, setNowTimestamp] = useState<number>(Date.now());

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_COMMUNITY_KEY, JSON.stringify(topics));
    } catch {
      // ignore
    }
  }, [topics]);

  // Dynamic live time-ago updater (recalculates every 15 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      setNowTimestamp(Date.now());
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  // Sync / refresh routine
  const handlePerformSync = useCallback(() => {
    setIsSyncing(true);
    setLastSyncTime(Date.now());
    setSecondsUntilSync(45);

    // Simulate real-time community engagement: increment upvotes/activity on trending topics
    setTimeout(() => {
      setTopics(prev => {
        return prev.map(t => {
          // Slight chance of simulated community upvote activity on hot concerns
          if (Math.random() > 0.65 && !t.hasUpvoted) {
            return {
              ...t,
              upvotes: t.upvotes + 1
            };
          }
          return t;
        });
      });
      setIsSyncing(false);
    }, 600);
  }, []);

  // Auto-refresh countdown loop (45s cycle)
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsUntilSync(prev => {
        if (prev <= 1) {
          handlePerformSync();
          return 45;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [handlePerformSync]);

  // Compute seconds elapsed since last sync
  const secondsAgo = Math.max(0, Math.floor((nowTimestamp - lastSyncTime) / 1000));

  // Filter topics
  const filteredTopics = useMemo(() => {
    return topics.filter(t => {
      // Location filter
      if (selectedState && t.state.toLowerCase() !== selectedState.name.toLowerCase()) {
        return false;
      }
      if (selectedDistrict && t.district && !t.district.toLowerCase().includes(selectedDistrict.name.toLowerCase().split(' ')[0])) {
        // Soft match district
      }

      // Category / Urgency tabs
      if (selectedFilter === 'URGENT') return t.urgency === 'Urgent' || t.urgency === 'High';
      if (selectedFilter === 'POLICE_ASSIGNED') return t.policeStatus === 'Police Patrol Assigned' || t.policeStatus === 'Under Verification';
      if (selectedFilter === 'RESOLVED') return t.policeStatus === 'Resolved by Community & Police' || t.policeStatus === 'Ward Action Initiated';

      return true;
    });
  }, [topics, selectedState, selectedDistrict, selectedFilter]);

  const handleUpvote = (id: string) => {
    setTopics(prev => prev.map(t => {
      if (t.id === id) {
        const nextState = !t.hasUpvoted;
        return {
          ...t,
          hasUpvoted: nextState,
          upvotes: nextState ? t.upvotes + 1 : t.upvotes - 1
        };
      }
      return t;
    }));
  };

  const handleCreateConcern = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim() || !newLocality.trim()) return;

    setIsSubmitting(true);

    try {
      // Call Gemini AI classification
      const res = await fetch('/api/gemini/classify-report', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-pro-token': subscription?.authToken || ''
        },
        body: JSON.stringify({
          title: newTitle,
          description: newDescription,
          locality: newLocality
        })
      });

      const aiData = await res.json();
      setAiClassificationResult(aiData);

      const newTopicItem: CommunityTopic = {
        id: `comm-${Date.now()}`,
        title: newTitle,
        description: newDescription,
        locality: newLocality,
        district: selectedDistrict ? selectedDistrict.name : 'Central District',
        state: selectedState ? selectedState.name : 'Delhi NCR',
        category: aiData?.suggestedCategory || newCategory,
        urgency: aiData?.urgencyRating || 'Medium',
        authorName: 'Citizen Resident (You)',
        authorType: 'Resident Citizen',
        upvotes: 1,
        hasUpvoted: true,
        commentsCount: 0,
        policeStatus: 'Under Verification',
        policeRemarks: `AI Automated intake logged. Dispatching advisory to ${aiData?.dispatchedDivision || 'Local Police Station'}.`,
        createdAt: 'Just now',
        createdTimestamp: Date.now()
      };

      setTopics(prev => [newTopicItem, ...prev]);

      setTimeout(() => {
        setIsSubmitting(false);
        setShowCreateModal(false);
        setNewTitle('');
        setNewDescription('');
        setNewLocality('');
        setAiClassificationResult(null);
        handlePerformSync();
      }, 1200);

    } catch (err) {
      setIsSubmitting(false);
      setShowCreateModal(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-sm border border-slate-200 my-8">
      
      {/* Section Header with Live Stream Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[11px] font-bold tracking-wider uppercase border border-amber-200 flex items-center gap-1">
              <Flame className="w-3 h-3 text-amber-600" />
              Public Interest & Neighborhood Watch
            </span>

            {/* Real-time auto-refresh indicator badge */}
            <span 
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full"
              title="Real-time citizen safety stream active (Auto-refresh loop)"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Live Stream Active</span>
              <span className="text-emerald-400">•</span>
              <span className="text-emerald-700">Updated {secondsAgo}s ago</span>
              <span className="text-emerald-400">•</span>
              <span className="text-emerald-600 font-mono">Sync in {secondsUntilSync}s</span>
            </span>
          </div>

          <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Trending Safety Concerns & Citizen Discussions</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time public topics flagged by resident welfare associations (RWAs), verified by local beat officers and municipal wards.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto flex-wrap">
          {/* On-Demand Sync Button */}
          <button
            id="sync-community-feed-btn"
            onClick={handlePerformSync}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all border border-slate-200 cursor-pointer"
            title="Force instantaneous sync of citizen feed"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Feed'}</span>
          </button>

          <button
            id="raise-safety-concern-btn"
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Raise Neighborhood Concern</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs Bar */}
      <div className="flex items-center gap-1.5 pt-4 pb-1 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setSelectedFilter('ALL')}
          className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 ${
            selectedFilter === 'ALL'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
          }`}
        >
          All Topics ({topics.length})
        </button>
        <button
          onClick={() => setSelectedFilter('URGENT')}
          className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 ${
            selectedFilter === 'URGENT'
              ? 'bg-rose-600 text-white'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
          }`}
        >
          🔥 High & Urgent Urgency
        </button>
        <button
          onClick={() => setSelectedFilter('POLICE_ASSIGNED')}
          className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 ${
            selectedFilter === 'POLICE_ASSIGNED'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
          }`}
        >
          🛡️ Police Patrol Assigned
        </button>
        <button
          onClick={() => setSelectedFilter('RESOLVED')}
          className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 ${
            selectedFilter === 'RESOLVED'
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
          }`}
        >
          ✅ Ward Action / Resolved
        </button>
      </div>

      {/* Topics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        {filteredTopics.map((topic) => (
          <div
            key={topic.id}
            id={`community-topic-${topic.id}`}
            className="bg-slate-50/70 hover:bg-slate-50 border border-slate-200/90 rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all"
          >
            <div>
              {/* Locality & Status */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-700">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  <span>{topic.locality}</span>
                  <span className="text-slate-400 font-normal">({topic.state})</span>
                </span>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  topic.urgency === 'Urgent' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                  topic.urgency === 'High' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-blue-100 text-blue-800 border border-blue-200'
                }`}>
                  {topic.urgency} Urgency
                </span>
              </div>

              {/* Title & Description */}
              <h4 className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                {topic.title}
              </h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {topic.description}
              </p>

              {/* Police Response Note */}
              {topic.policeRemarks && (
                <div className="mt-3 p-2.5 bg-blue-50/80 border border-blue-200/80 rounded-xl text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-blue-900 mb-0.5">
                    <Shield className="w-3.5 h-3.5 text-blue-600" />
                    <span>Police Action: {topic.policeStatus}</span>
                  </div>
                  <p className="text-blue-800 text-[11px] leading-relaxed">
                    {topic.policeRemarks}
                  </p>
                </div>
              )}
            </div>

            {/* Bottom bar with author, dynamic time, and upvote button */}
            <div className="flex items-center justify-between pt-3 mt-4 border-t border-slate-200/70 text-xs">
              <div className="text-[11px] text-slate-500 flex items-center gap-1">
                <span>By <strong className="text-slate-700">{topic.authorName}</strong></span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-500 font-medium flex items-center gap-0.5">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {getLiveCommunityTimeAgo(topic.createdTimestamp, topic.createdAt)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleUpvote(topic.id)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-bold transition-colors cursor-pointer ${
                    topic.hasUpvoted 
                      ? 'bg-blue-600 text-white border-blue-600' 
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <ThumbsUp className={`w-3.5 h-3.5 ${topic.hasUpvoted ? 'fill-white' : ''}`} />
                  <span>{topic.upvotes}</span>
                </button>

                <div className="flex items-center gap-1 text-[11px] text-slate-500 bg-white border border-slate-200 px-2 py-1 rounded-lg">
                  <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                  <span>{topic.commentsCount}</span>
                </div>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Create Concern Modal with AI Triage */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                  ⚠️
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Raise Neighborhood Concern</h3>
                  <span className="text-[11px] text-slate-400">Gemini AI Auto-Triage & Police Notification</span>
                </div>
              </div>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 font-bold"
              >
                ✕
              </button>
            </div>

            {aiClassificationResult ? (
              <div className="my-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                <h4 className="font-bold text-emerald-900">Safety Concern Logged & Triage Complete</h4>
                <p className="text-xs text-emerald-700 mt-1">
                  Classified as: <strong>{aiClassificationResult.suggestedCategory}</strong> • Dispatched to: <strong>{aiClassificationResult.dispatchedDivision}</strong>
                </p>
              </div>
            ) : (
              <form onSubmit={handleCreateConcern} className="space-y-4 my-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Locality / Street / Landmark:
                  </label>
                  <input
                    type="text"
                    value={newLocality}
                    onChange={(e) => setNewLocality(e.target.value)}
                    placeholder="e.g. Sector 18 Market, Noida or Indiranagar 100ft Rd, Bengaluru"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Concern Title / Main Issue:
                  </label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Broken streetlight near Metro exit creating dark stretch"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Detailed Observations:
                  </label>
                  <textarea
                    rows={3}
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Provide context on timings, safety risk, number of people affected..."
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    required
                  />
                </div>

                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-800 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Gemini 2.5 will analyze your concern to suggest urgency ratings and route it to the corresponding police beat inspector.</span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? 'Analyzing with AI...' : 'Submit to Neighborhood'}</span>
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
