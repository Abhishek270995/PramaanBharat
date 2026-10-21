import { useCallback, useEffect, useState } from 'react';
import type { NewsArticle, NewsCategory } from '../types';
import { NEWS_ARTICLES } from '../data/newsData';
import { sortArticlesByLatest } from '../utils/dateUtils';
import { fetchLiveNewsArticles, fetchLiveWireArticles, mergeArticles } from '../services/newsService';

type UseLiveNewsOptions = {
  category: NewsCategory;
  state?: string;
  onQuotaReached: () => void;
  consumeCredit: () => boolean;
};

export function useLiveNews({ category, state, onQuotaReached, consumeCredit }: UseLiveNewsOptions) {
  const [articles, setArticles] = useState<NewsArticle[]>(() => sortArticlesByLatest(NEWS_ARTICLES));
  const [isFetching, setIsFetching] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(() => Date.now());

  const syncWire = useCallback(async (targetCategory = category, targetState = state) => {
    setIsSyncing(true);
    try {
      const fetched = await fetchLiveWireArticles(targetCategory, targetState);
      setArticles(current => sortArticlesByLatest(mergeArticles(current, fetched)));
      if (fetched.length) setLastSyncTime(Date.now());
    } catch (error) {
      console.warn('Live news wire is unavailable:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [category, state]);

  const fetchNews = useCallback(async (targetCategory = category, targetState = state) => {
    if (!consumeCredit()) {
      onQuotaReached();
      return;
    }

    setIsFetching(true);
    try {
      const fetched = await fetchLiveNewsArticles(targetCategory, targetState);
      setArticles(current => sortArticlesByLatest(mergeArticles(current, fetched)));
      if (fetched.length) setLastSyncTime(Date.now());
    } catch (error) {
      if ((error as { status?: number }).status === 429) onQuotaReached();
      else await syncWire(targetCategory, targetState);
    } finally {
      setIsFetching(false);
    }
  }, [category, consumeCredit, onQuotaReached, state, syncWire]);

  useEffect(() => {
    void syncWire();
    const interval = window.setInterval(() => void syncWire(), 90_000);
    return () => window.clearInterval(interval);
  }, [syncWire]);

  return { articles, isFetching, isSyncing, lastSyncTime, fetchNews, syncWire };
}
