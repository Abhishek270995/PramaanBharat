import { NewsArticle, TimeRangeKey } from '../types';

/**
 * Calculates a precise numeric sort timestamp (in milliseconds) for any article
 * so latest articles are strictly ordered first.
 */
export function getArticleSortTimestamp(article: NewsArticle): number {
  if (article.publishedTimestamp && article.publishedTimestamp > 0) {
    return article.publishedTimestamp;
  }

  const pub = (article.publishedAt || '').toLowerCase().trim();
  const now = Date.now();

  if (pub.includes('just now')) {
    return now - 30 * 1000; // 30s ago
  }
  
  const minMatch = pub.match(/(\d+)\s*min/);
  if (minMatch && minMatch[1]) {
    return now - parseInt(minMatch[1], 10) * 60 * 1000;
  }

  const hrMatch = pub.match(/(\d+)\s*hour/);
  if (hrMatch && hrMatch[1]) {
    return now - parseInt(hrMatch[1], 10) * 3600 * 1000;
  }

  if (pub.includes('yesterday') || pub.includes('1 day')) {
    return now - 24 * 3600 * 1000;
  }

  const dayMatch = pub.match(/(\d+)\s*day/);
  if (dayMatch && dayMatch[1]) {
    return now - parseInt(dayMatch[1], 10) * 24 * 3600 * 1000;
  }

  if (article.publishedDate) {
    const parts = article.publishedDate.split('-');
    if (parts.length === 3) {
      return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10)).getTime();
    }
  }

  return now - 48 * 3600 * 1000;
}

/**
 * Sorts articles array so the latest news is always first (at top).
 */
export function sortArticlesByLatest(articles: NewsArticle[]): NewsArticle[] {
  return [...articles].sort((a, b) => {
    const timeA = getArticleSortTimestamp(a);
    const timeB = getArticleSortTimestamp(b);
    return timeB - timeA;
  });
}

/**
 * Parses article date into a standard Date object
 */
export function getArticleDate(article: NewsArticle, referenceDateStr?: string): Date {
  const now = new Date();
  const ref = referenceDateStr ? new Date(referenceDateStr) : now;

  if (article.publishedTimestamp && article.publishedTimestamp > 0) {
    return new Date(article.publishedTimestamp);
  }

  if (article.publishedDate) {
    const parts = article.publishedDate.split('-');
    if (parts.length === 3) {
      return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    }
  }

  // Fallback parsing from publishedAt relative text
  const pub = (article.publishedAt || '').toLowerCase();

  if (pub.includes('min') || pub.includes('hour') || pub.includes('today') || pub.includes('just now')) {
    return ref;
  }
  if (pub.includes('yesterday') || pub.includes('1 day ago')) {
    const d = new Date(ref);
    d.setDate(d.getDate() - 1);
    return d;
  }
  if (pub.includes('2 days ago')) {
    const d = new Date(ref);
    d.setDate(d.getDate() - 2);
    return d;
  }
  if (pub.includes('3 days ago')) {
    const d = new Date(ref);
    d.setDate(d.getDate() - 3);
    return d;
  }
  if (pub.includes('4 days ago')) {
    const d = new Date(ref);
    d.setDate(d.getDate() - 4);
    return d;
  }
  if (pub.includes('5 days ago')) {
    const d = new Date(ref);
    d.setDate(d.getDate() - 5);
    return d;
  }
  if (pub.includes('6 days ago') || pub.includes('1 week ago')) {
    const d = new Date(ref);
    d.setDate(d.getDate() - 7);
    return d;
  }
  if (pub.includes('2 weeks ago')) {
    const d = new Date(ref);
    d.setDate(d.getDate() - 14);
    return d;
  }
  if (pub.includes('3 weeks ago')) {
    const d = new Date(ref);
    d.setDate(d.getDate() - 21);
    return d;
  }
  if (pub.includes('1 month ago') || pub.includes('last month')) {
    const d = new Date(ref);
    d.setMonth(d.getMonth() - 1);
    return d;
  }
  if (pub.includes('2025')) {
    return new Date(2025, 6, 15);
  }
  if (pub.includes('2024')) {
    return new Date(2024, 6, 15);
  }

  return ref;
}

/**
 * Checks if an article falls within the specified timeframe
 */
export function isArticleInTimeRange(
  article: NewsArticle,
  timeKey: TimeRangeKey | string = 'ytd',
  customStartDate?: string,
  customEndDate?: string,
  referenceDateStr?: string
): boolean {
  const now = new Date();
  const ref = referenceDateStr ? new Date(referenceDateStr) : now;
  const articleDate = getArticleDate(article, referenceDateStr);

  const pub = (article.publishedAt || '').toLowerCase();
  const isRecentOrLive = 
    article.isBreaking ||
    pub.includes('min') || 
    pub.includes('hour') || 
    pub.includes('just now') || 
    pub.includes('today') ||
    (article.publishedTimestamp && (Date.now() - article.publishedTimestamp) < 24 * 60 * 60 * 1000);

  switch (timeKey) {
    case 'today': {
      if (isRecentOrLive) return true;
      const sameYear = articleDate.getFullYear() === ref.getFullYear();
      const sameMonth = articleDate.getMonth() === ref.getMonth();
      const sameDate = articleDate.getDate() === ref.getDate();
      return sameYear && sameMonth && sameDate;
    }

    case '7d': {
      if (isRecentOrLive) return true;
      const sevenDaysAgo = new Date(ref);
      sevenDaysAgo.setDate(ref.getDate() - 7);
      sevenDaysAgo.setHours(0, 0, 0, 0);
      const endOfRef = new Date(ref);
      endOfRef.setHours(23, 59, 59, 999);
      return articleDate >= sevenDaysAgo && articleDate <= endOfRef;
    }

    case '30d': {
      if (isRecentOrLive) return true;
      const thirtyDaysAgo = new Date(ref);
      thirtyDaysAgo.setDate(ref.getDate() - 30);
      thirtyDaysAgo.setHours(0, 0, 0, 0);
      const endOfRef = new Date(ref);
      endOfRef.setHours(23, 59, 59, 999);
      return articleDate >= thirtyDaysAgo && articleDate <= endOfRef;
    }

    case 'ytd': {
      if (isRecentOrLive) return true;
      const startOfYear = new Date(ref.getFullYear(), 0, 1);
      const endOfYear = new Date(ref.getFullYear(), 11, 31, 23, 59, 59);
      return articleDate >= startOfYear && articleDate <= endOfYear;
    }

    case '2025': {
      return articleDate.getFullYear() === 2025;
    }

    case '2024': {
      return articleDate.getFullYear() === 2024;
    }

    case 'custom': {
      if (!customStartDate && !customEndDate) return true;
      const start = customStartDate ? new Date(customStartDate) : new Date('2000-01-01');
      start.setHours(0, 0, 0, 0);
      const end = customEndDate ? new Date(customEndDate) : new Date('2099-12-31');
      end.setHours(23, 59, 59, 999);
      return articleDate >= start && articleDate <= end;
    }

    default:
      return true;
  }
}

/**
 * Filter list of articles by timeframe
 */
export function filterArticlesByTimeframe(
  articles: NewsArticle[],
  timeKey: TimeRangeKey | string = 'ytd',
  customStartDate?: string,
  customEndDate?: string
): NewsArticle[] {
  return articles.filter(a => isArticleInTimeRange(a, timeKey, customStartDate, customEndDate));
}

/**
 * Human-readable label for the selected timeframe
 */
export function getTimeframeLabel(
  timeKey?: TimeRangeKey | string,
  customStartDate?: string,
  customEndDate?: string
): string {
  switch (timeKey) {
    case 'today':
      return 'Today (August 15, 2026)';
    case '7d':
      return 'Past 7 Days (Aug 8 - Aug 15, 2026)';
    case '30d':
      return 'Past 30 Days (July 16 - Aug 15, 2026)';
    case 'ytd':
      return 'Year 2026 (Year to Date)';
    case '2025':
      return 'Year 2025 Archive';
    case '2024':
      return 'Year 2024 Archive';
    case 'custom':
      return customStartDate && customEndDate 
        ? `Custom Period (${customStartDate} to ${customEndDate})` 
        : 'Custom Date Range';
    default:
      return 'All Time';
  }
}

/**
 * Calculates dynamically progressing relative time so '25 mins ago' advances in real-time as the clock ticks
 */
export function getLiveTimeAgo(
  publishedAtStr: string,
  sessionElapsedMinutes: number = 0,
  publishedTimestamp?: number
): string {
  if (publishedTimestamp && publishedTimestamp > 0) {
    const diffMs = Date.now() - publishedTimestamp;
    const diffMins = Math.max(0, Math.floor(diffMs / 60000));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1 min ago';
    if (diffMins < 60) return `${diffMins} mins ago`;
    
    const hours = Math.floor(diffMins / 60);
    const remainingMins = diffMins % 60;
    if (hours < 24) {
      return remainingMins > 0 ? `${hours}h ${remainingMins}m ago` : (hours === 1 ? '1 hour ago' : `${hours} hours ago`);
    }
    
    const days = Math.floor(hours / 24);
    return days === 1 ? 'Yesterday' : `${days} days ago`;
  }

  if (!publishedAtStr) return 'Just now';
  
  // If it's a fixed historical date like 'March 15, 2026' or '2026-05-19', leave intact
  if (
    publishedAtStr.includes('Jan') || publishedAtStr.includes('Feb') || 
    publishedAtStr.includes('Mar') || publishedAtStr.includes('Apr') || 
    publishedAtStr.includes('May') || publishedAtStr.includes('Jun') || 
    publishedAtStr.includes('Jul') || publishedAtStr.includes('2024') || 
    publishedAtStr.includes('2025')
  ) {
    return publishedAtStr;
  }

  // Parse initial minutes or hours from relative string
  let initialMinutes = 15;
  const lower = publishedAtStr.toLowerCase().trim();
  
  if (lower.includes('just now')) {
    initialMinutes = 1;
  } else {
    const matchMin = lower.match(/(\d+)\s*min/);
    if (matchMin && matchMin[1]) {
      initialMinutes = parseInt(matchMin[1], 10);
    } else {
      const matchHr = lower.match(/(\d+)\s*hour/);
      if (matchHr && matchHr[1]) {
        initialMinutes = parseInt(matchHr[1], 10) * 60;
      } else if (lower.includes('yesterday') || lower.includes('1 day')) {
        initialMinutes = 24 * 60;
      } else if (lower.includes('days ago')) {
        const matchDays = lower.match(/(\d+)\s*day/);
        if (matchDays && matchDays[1]) {
          initialMinutes = parseInt(matchDays[1], 10) * 24 * 60;
        } else {
          return publishedAtStr;
        }
      } else {
        return publishedAtStr;
      }
    }
  }

  // Clamp session elapsed minutes to prevent unbounded growth from stale local storage
  const activeElapsed = Math.min(180, Math.max(0, sessionElapsedMinutes));
  const totalMinutes = Math.max(1, initialMinutes + activeElapsed);
  
  if (totalMinutes < 1) return 'Just now';
  if (totalMinutes === 1) return '1 min ago';
  if (totalMinutes < 60) return `${totalMinutes} mins ago`;
  
  const hours = Math.floor(totalMinutes / 60);
  const remainingMins = totalMinutes % 60;
  if (hours < 24) {
    return remainingMins > 0 ? `${hours}h ${remainingMins}m ago` : (hours === 1 ? '1 hour ago' : `${hours} hours ago`);
  }
  
  const days = Math.floor(hours / 24);
  return days === 1 ? 'Yesterday' : `${days} days ago`;
}
