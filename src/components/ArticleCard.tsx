import React, { useState } from 'react';
import { 
  Bookmark, 
  Share2, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  CheckCircle, 
  Clock, 
  Eye, 
  ExternalLink,
  MapPin
} from 'lucide-react';
import { NewsArticle, LanguageCode } from '../types';
import { getSourceByName } from '../data/verifiedSources';
import { getLiveTimeAgo } from '../utils/dateUtils';

interface ArticleCardProps {
  article: NewsArticle;
  currentLanguage: LanguageCode;
  onSelectArticle: (article: NewsArticle) => void;
  isBookmarked: boolean;
  onToggleBookmark: (articleId: string) => void;
  onQuickAiSummary: (article: NewsArticle) => void;
  elapsedMinutes?: number;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  currentLanguage,
  onSelectArticle,
  isBookmarked,
  onToggleBookmark,
  onQuickAiSummary,
  elapsedMinutes = 0
}) => {
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Title in current language if available
  const displayTitle = (article.translatedTitles && article.translatedTitles[currentLanguage]) || article.title;

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported on this device/browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(`${displayTitle}. ${article.snippet}`);
    utterance.rate = 0.95;
    utterance.lang = currentLanguage === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.snippet,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${article.title}\n\nRead more on PramaanBharat: ${window.location.href}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleBookmark(article.id);
  };

  const handleAiSummary = (e: React.MouseEvent) => {
    e.stopPropagation();
    onQuickAiSummary(article);
  };

  return (
    <article
      onClick={() => onSelectArticle(article)}
      className="group bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-lg hover:border-blue-300 transition-all duration-300 flex flex-col justify-between cursor-pointer"
    >
      <div>
        {/* Source & Credentials Bar */}
        <div className="flex items-center justify-between gap-2 mb-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            {(() => {
              const srcInfo = getSourceByName(article.source);
              const targetUrl = article.originalUrl || (srcInfo?.website ? `https://${srcInfo.website}` : null);
              if (targetUrl) {
                return (
                  <a
                    href={targetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="font-bold text-xs text-slate-900 hover:text-blue-600 hover:underline flex items-center gap-1 transition-colors"
                    title={`Open verified report on ${article.source} ↗`}
                  >
                    <span>{article.source}</span>
                    <ExternalLink className="w-2.5 h-2.5 text-slate-400 group-hover:text-blue-500" />
                  </a>
                );
              }
              return (
                <span className="font-bold text-xs text-slate-900 flex items-center gap-1">
                  {article.source}
                </span>
              );
            })()}

            {(() => {
              const srcInfo = getSourceByName(article.source);
              if (srcInfo?.tier) {
                return (
                  <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.2 rounded-md">
                    {srcInfo.tier.replace(' BroadSheet', '').replace(' Desk', '')}
                  </span>
                );
              }
              return null;
            })()}
            <span className="text-slate-300">•</span>
            <span className="text-[11px] text-slate-500 font-medium">
              {getLiveTimeAgo(article.publishedAt, elapsedMinutes)}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {article.isVerifiedFactCheck && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200" title="Verified against primary statutory databases & fact check registries">
                <CheckCircle className="w-3 h-3 text-emerald-600" />
                <span>Verified Source</span>
              </span>
            )}
            
            {article.stateName && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                <MapPin className="w-2.5 h-2.5 text-blue-500" />
                {article.districtName ? article.districtName.split(' ')[0] : article.stateName}
              </span>
            )}
          </div>
        </div>

        {/* Layout: Text + Thumbnail */}
        <div className="flex gap-4 items-start">
          <div className="flex-1">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug tracking-tight">
              {displayTitle}
            </h3>
            <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
              {article.snippet}
            </p>
          </div>

          {article.imageUrl && (
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden shrink-0 bg-slate-100 border border-slate-200">
              <img
                src={article.imageUrl}
                alt={article.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="flex items-center flex-wrap gap-1.5 mt-3">
          {article.tags.slice(0, 3).map((tag, i) => (
            <span key={i} className="text-[10px] px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md font-medium">
              #{tag}
            </span>
          ))}
          {article.crimeCategory && (
            <span className="text-[10px] px-2 py-0.5 bg-rose-50 text-rose-700 rounded-md font-semibold border border-rose-100">
              🛡️ {article.crimeCategory}
            </span>
          )}
        </div>
      </div>

      {/* Footer Tools (AI Summary, Audio, Bookmark, Read time) */}
      <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-xs">
        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" /> {article.readTimeMinutes} min read
          </span>
          <span className="flex items-center gap-1 hidden sm:flex">
            <Eye className="w-3 h-3" /> {article.viewsCount.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Quick AI Summary Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickAiSummary(article);
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold transition-colors cursor-pointer"
            title="Read AI 3-Point Takeaways"
          >
            <Sparkles className="w-3 h-3 text-blue-600" />
            <span>AI Summary</span>
          </button>

          {/* Audio TTS */}
          <button
            onClick={handleSpeak}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              isSpeaking ? 'bg-amber-100 border-amber-300 text-amber-900' : 'border-slate-200 hover:bg-slate-100 text-slate-600'
            }`}
            title={isSpeaking ? 'Mute speech' : 'Listen aloud'}
          >
            {isSpeaking ? <VolumeX className="w-3.5 h-3.5 animate-spin" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
            title="Share article"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>

          {/* Bookmark */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleBookmark(article.id);
            }}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              isBookmarked ? 'bg-blue-50 border-blue-300 text-blue-600' : 'border-slate-200 hover:bg-slate-100 text-slate-600'
            }`}
            title={isBookmarked ? 'Remove bookmark' : 'Bookmark story'}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-blue-600' : ''}`} />
          </button>
        </div>
      </div>
    </article>
  );
};
