import { NewsArticle, TimeRangeKey } from '../types';

/**
 * Parses article date into a standard Date object
 */
export function getArticleDate(article: NewsArticle, referenceDateStr: string = '2026-08-15'): Date {
  if (article.publishedDate) {
    const parts = article.publishedDate.split('-');
    if (parts.length === 3) {
      return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    }
  }

  // Fallback parsing from publishedAt relative text
  const pub = (article.publishedAt || '').toLowerCase();
  const ref = new Date(referenceDateStr);

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
  referenceDateStr: string = '2026-08-15'
): boolean {
  const articleDate = getArticleDate(article, referenceDateStr);
  const ref = new Date(referenceDateStr);

  switch (timeKey) {
    case 'today': {
      // Must be same day as referenceDate
      const sameYear = articleDate.getFullYear() === ref.getFullYear();
      const sameMonth = articleDate.getMonth() === ref.getMonth();
      const sameDate = articleDate.getDate() === ref.getDate();
      return sameYear && sameMonth && sameDate;
    }

    case '7d': {
      const sevenDaysAgo = new Date(ref);
      sevenDaysAgo.setDate(ref.getDate() - 7);
      sevenDaysAgo.setHours(0, 0, 0, 0);
      const endOfRef = new Date(ref);
      endOfRef.setHours(23, 59, 59, 999);
      return articleDate >= sevenDaysAgo && articleDate <= endOfRef;
    }

    case '30d': {
      const thirtyDaysAgo = new Date(ref);
      thirtyDaysAgo.setDate(ref.getDate() - 30);
      thirtyDaysAgo.setHours(0, 0, 0, 0);
      const endOfRef = new Date(ref);
      endOfRef.setHours(23, 59, 59, 999);
      return articleDate >= thirtyDaysAgo && articleDate <= endOfRef;
    }

    case 'ytd': {
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
 * Calculates dynamically progressing relative time so '25 mins ago' advances in real-time
 */
export function getLiveTimeAgo(publishedAtStr: string, sessionElapsedMinutes: number = 0): string {
  if (!publishedAtStr) return 'Just now';
  
  // If it's a fixed date like 'March 15, 2026' or '2026-05-19', leave intact
  if (publishedAtStr.includes('202') || publishedAtStr.includes('Jan') || publishedAtStr.includes('Feb') || publishedAtStr.includes('Mar') || publishedAtStr.includes('Apr') || publishedAtStr.includes('May') || publishedAtStr.includes('Jun') || publishedAtStr.includes('Jul')) {
    return publishedAtStr;
  }

  // Parse initial minutes or hours from relative string
  let initialMinutes = 15;
  const lower = publishedAtStr.toLowerCase();
  
  if (lower.includes('just now')) {
    initialMinutes = 2;
  } else {
    const matchMin = lower.match(/(\d+)\s*min/);
    if (matchMin && matchMin[1]) {
      initialMinutes = parseInt(matchMin[1], 10);
    } else {
      const matchHr = lower.match(/(\d+)\s*hour/);
      if (matchHr && matchHr[1]) {
        initialMinutes = parseInt(matchHr[1], 10) * 60;
      } else {
        return publishedAtStr;
      }
    }
  }

  const totalMinutes = initialMinutes + sessionElapsedMinutes;
  
  if (totalMinutes < 1) return 'Just now';
  if (totalMinutes < 60) return `${totalMinutes} mins ago`;
  
  const hours = Math.floor(totalMinutes / 60);
  const remainingMins = totalMinutes % 60;
  if (hours < 24) {
    return hours === 1 ? (remainingMins > 0 ? `1h ${remainingMins}m ago` : '1 hour ago') : `${hours} hours ago`;
  }
  
  const days = Math.floor(hours / 24);
  return days === 1 ? '1 day ago' : `${days} days ago`;
}
