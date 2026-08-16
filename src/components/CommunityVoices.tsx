import React, { useState } from 'react';
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
  Flame
} from 'lucide-react';
import { CommunityTopic, StateInfo, DistrictInfo } from '../types';
import { COMMUNITY_TOPICS } from '../data/communityData';
import { UserSubscription } from '../utils/subscriptionUtils';

interface CommunityVoicesProps {
  selectedState: StateInfo | null;
  selectedDistrict: DistrictInfo | null;
  subscription?: UserSubscription;
}

export const CommunityVoices: React.FC<CommunityVoicesProps> = ({
  selectedState,
  selectedDistrict,
  subscription
}) => {
  const [topics, setTopics] = useState<CommunityTopic[]>(COMMUNITY_TOPICS);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newDescription, setNewDescription] = useState<string>('');
  const [newLocality, setNewLocality] = useState<string>('');
  const [newCategory, setNewCategory] = useState<string>('Street Lighting / Infrastructure');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [aiClassificationResult, setAiClassificationResult] = useState<any>(null);

  // Filter topics
  const filteredTopics = topics.filter(t => {
    if (selectedState && t.state.toLowerCase() !== selectedState.name.toLowerCase()) {
      return false;
    }
    return true;
  });

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
        createdAt: 'Just now'
      };

      setTopics([newTopicItem, ...topics]);

      setTimeout(() => {
        setIsSubmitting(false);
        setShowCreateModal(false);
        setNewTitle('');
        setNewDescription('');
        setNewLocality('');
        setAiClassificationResult(null);
      }, 1500);

    } catch (err) {
      setIsSubmitting(false);
      setShowCreateModal(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-sm border border-slate-200 my-8">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[11px] font-bold tracking-wider uppercase border border-amber-200 flex items-center gap-1">
              <Flame className="w-3 h-3 text-amber-600" />
              Public Interest & Neighborhood Watch
            </span>
          </div>

          <h3 className="text-xl font-black text-slate-900 tracking-tight">
            Trending Safety Concerns & Citizen Discussions
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time public topics flagged by resident welfare associations (RWAs), verified by local beat officers and municipal wards.
          </p>
        </div>

        <button
          id="raise-safety-concern-btn"
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm shrink-0 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Raise Neighborhood Concern</span>
        </button>
      </div>

      {/* Topics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
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
                  topic.urgency === 'Urgent' ? 'bg-rose-100 text-rose-800' :
                  topic.urgency === 'High' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
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

            {/* Bottom bar with author, time, and upvote button */}
            <div className="flex items-center justify-between pt-3 mt-4 border-t border-slate-200/70 text-xs">
              <div className="text-[11px] text-slate-500">
                <span>By <strong className="text-slate-700">{topic.authorName}</strong></span>
                <span className="text-slate-400"> • {topic.createdAt}</span>
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
