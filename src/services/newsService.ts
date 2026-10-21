import type { NewsArticle, NewsCategory } from '../types';

type NewsFeedResponse = {
  articles?: NewsArticle[];
};

async function requestArticles(
  endpoint: string,
  category: NewsCategory,
  state?: string,
): Promise<NewsArticle[]> {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
    body: JSON.stringify({
      category: category === 'All' ? 'National' : category,
      state,
      count: endpoint.includes('live-wire') ? 8 : 4,
    }),
  });

  if (!response.ok) {
    const error = new Error(`News request failed (${response.status})`);
    Object.assign(error, { status: response.status });
    throw error;
  }

  const data = (await response.json()) as NewsFeedResponse;
  return Array.isArray(data.articles) ? data.articles : [];
}

export function fetchLiveWireArticles(category: NewsCategory, state?: string) {
  return requestArticles('/api/news/live-wire', category, state);
}

export function fetchLiveNewsArticles(category: NewsCategory, state?: string) {
  return requestArticles('/api/gemini/live-news', category, state);
}

export function mergeArticles(current: NewsArticle[], incoming: NewsArticle[]) {
  if (!incoming.length) return current;

  const existingTitles = new Set(current.map(article => article.title.toLowerCase().trim()));
  const newArticles = incoming.filter(article => !existingTitles.has(article.title.toLowerCase().trim()));
  return newArticles.length ? [...newArticles, ...current] : current;
}
