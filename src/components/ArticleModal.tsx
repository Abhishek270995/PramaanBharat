import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Bookmark, 
  Share2, 
  Clock, 
  CheckCircle, 
  ShieldAlert, 
  ExternalLink,
  MapPin,
  Eye,
  FileText,
  Crown
} from 'lucide-react';
import { NewsArticle, LanguageCode } from '../types';
import { getSourceByName, getArticleSourceUrl } from '../data/verifiedSources';
import { UserSubscription, consumeAiCredit } from '../utils/subscriptionUtils';

interface ArticleModalProps {
  article: NewsArticle | null;
  currentLanguage: LanguageCode;
  onClose: () => void;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
  onOpenSubscriptionModal?: () => void;
  subscription?: UserSubscription;
}

export const ArticleModal: React.FC<ArticleModalProps> = ({
  article,
  currentLanguage,
  onClose,
  isBookmarked,
  onToggleBookmark,
  onOpenSubscriptionModal,
  subscription
}) => {
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [aiSummary, setAiSummary] = useState<string[] | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);

  if (!article) return null;

  const displayTitle = (article.translatedTitles && article.translatedTitles[currentLanguage]) || article.title;

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const textToSpeak = `${displayTitle}. Source: ${article.source}. ${article.content}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const handleGenerateAiSummary = async () => {
    if (article.summaryPoints && article.summaryPoints.length > 0) {
      setAiSummary(article.summaryPoints);
      return;
    }

    const creditCheck = consumeAiCredit();
    if (!creditCheck.success) {
      if (onOpenSubscriptionModal) {
        onClose();
        onOpenSubscriptionModal();
      }
      return;
    }

    setIsGeneratingAi(true);
    try {
      const res = await fetch('/api/gemini/summarize-news', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-pro-token': subscription?.authToken || ''
        },
        body: JSON.stringify({
          title: article.title,
          content: article.content,
          language: currentLanguage
        })
      });

      if (res.status === 429) {
        if (onOpenSubscriptionModal) {
          onClose();
          onOpenSubscriptionModal();
          return;
        }
      }

      const data = await res.json();
      if (data.points && Array.isArray(data.points)) {
        setAiSummary(data.points);
      } else {
        setAiSummary([article.snippet]);
      }
    } catch {
      setAiSummary([article.snippet]);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.snippet,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${article.title} - Pramaan Bharat News`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Source & Date Info */}
        <div className="flex items-center flex-wrap gap-2 text-xs text-slate-500 mb-3">
          {(() => {
            const targetUrl = getArticleSourceUrl(article);
            if (targetUrl) {
              return (
                <a
                  href={targetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-extrabold text-slate-900 text-sm hover:text-blue-600 flex items-center gap-1 transition-colors underline-offset-2 hover:underline"
                  title={`Open exact report on ${article.source} ↗`}
                >
                  <span>{article.source}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                </a>
              );
            }
            return <span className="font-extrabold text-slate-900 text-sm">{article.source}</span>;
          })()}
          <span>•</span>
          <span className="font-medium text-slate-700">{article.publishedAt}</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> {article.readTimeMinutes} min read
          </span>
          {article.stateName && (
            <>
              <span>•</span>
              <span className="text-blue-600 font-semibold flex items-center gap-0.5">
                <MapPin className="w-3 h-3" /> {article.districtName ? `${article.districtName}, ${article.stateName}` : article.stateName}
              </span>
            </>
          )}
        </div>

        {/* Title */}
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug tracking-tight">
          {displayTitle}
        </h2>

        {/* Credentials & Fact-check badge */}
        <div className="flex items-center flex-wrap gap-2 my-3.5">
          {article.isVerifiedFactCheck && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>{article.credibilityRating || 'Fact-Checked Official Source'}</span>
            </span>
          )}

          {article.crimeCategory && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-200">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
              <span>{article.crimeCategory}</span>
            </span>
          )}

          <span className="text-xs text-slate-400 ml-auto flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" /> {article.viewsCount.toLocaleString('en-IN')} readers
          </span>
        </div>

        {/* Hero Image */}
        {article.imageUrl && (
          <div className="w-full h-64 sm:h-80 rounded-2xl overflow-hidden my-4 bg-slate-100 border border-slate-200">
            <img
              src={article.imageUrl}
              alt={article.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* AI Key Takeaways Box */}
        <div className="my-5 p-4 sm:p-5 bg-gradient-to-br from-blue-50/90 to-indigo-50/90 border border-blue-200/90 rounded-2xl">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
              <span className="font-black text-xs uppercase tracking-wider text-blue-950">
                Gemini 2.5 AI Key Fact Takeaways
              </span>
            </div>

            {!aiSummary && (
              <button
                onClick={handleGenerateAiSummary}
                disabled={isGeneratingAi}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                {isGeneratingAi ? 'Summarizing...' : 'Generate 3-Bullet Summary'}
              </button>
            )}
          </div>

          <div className="space-y-2">
            {(aiSummary || article.summaryPoints || [article.snippet]).map((pt, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-slate-800 leading-relaxed font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                <span>{pt}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Full Article Content */}
        <div className="prose prose-slate max-w-none text-sm text-slate-700 leading-relaxed space-y-4 my-6">
          {article.content.split('\n\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>

        {/* Source Trust & Accreditation Card */}
        {(() => {
          const srcInfo = getSourceByName(article.source);
          if (srcInfo) {
            return (
              <div className="my-5 p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900">{srcInfo.name}</span>
                    <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-bold">
                      {srcInfo.tier}
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-1">
                    Accredited by: <strong className="text-slate-700">{srcInfo.accreditation}</strong> • HQ: {srcInfo.headquarters} (Est. {srcInfo.established})
                  </p>
                </div>
                <a
                  href={`https://${srcInfo.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-blue-300 text-blue-700 font-bold shrink-0 text-center"
                >
                  Visit Official Portal ↗
                </a>
              </div>
            );
          }
          return null;
        })()}

        {/* Tags */}
        <div className="flex items-center flex-wrap gap-1.5 pt-4 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-400 mr-1">Topics:</span>
          {article.tags.map((tag, i) => (
            <span key={i} className="text-xs px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg font-medium">
              #{tag}
            </span>
          ))}
        </div>

        {/* Interactive Bottom Bar */}
        <div className="flex items-center justify-between pt-5 mt-5 border-t border-slate-200 flex-wrap gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleSpeak}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isSpeaking ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {isSpeaking ? <VolumeX className="w-4 h-4 animate-spin" /> : <Volume2 className="w-4 h-4" />}
              <span>{isSpeaking ? 'Stop Reading' : 'Listen Aloud (Audio)'}</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>{copied ? 'Link Copied!' : 'Share'}</span>
            </button>

            {/* Direct Official Source Link */}
            {(() => {
              const targetUrl = getArticleSourceUrl(article);
              if (targetUrl) {
                return (
                  <a
                    href={targetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition-colors cursor-pointer"
                    title={`Open exact report on ${article.source}`}
                  >
                    <ExternalLink className="w-4 h-4 text-blue-600" />
                    <span>Read on {article.source} ↗</span>
                  </a>
                );
              }
              return null;
            })()}
          </div>

          <button
            onClick={() => onToggleBookmark(article.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              isBookmarked 
                ? 'bg-blue-50 text-blue-700 border border-blue-300' 
                : 'bg-slate-900 hover:bg-slate-800 text-white'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-blue-600' : ''}`} />
            <span>{isBookmarked ? 'Saved to Bookmarks' : 'Save Story'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
