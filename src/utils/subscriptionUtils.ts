// Subscription and AI Quota Management for Pramaan Bharat

export interface UserSubscription {
  isPro: boolean;
  tier: 'free' | 'weekly' | 'monthly' | 'annual';
  tierName: string;
  expiresAt: number | null; // Unix timestamp ms
  dailyAiQuota: number;
  aiCreditsRemaining: number;
  lastResetDate: string; // YYYY-MM-DD
}

const STORAGE_KEY = 'pramaan_user_subscription';
const DEFAULT_FREE_QUOTA = 3;

export const getTodayDateKey = (): string => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
};

export const getSubscriptionState = (): UserSubscription => {
  const today = getTodayDateKey();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: UserSubscription = JSON.parse(raw);
      // Old app versions could enable Pro locally without payment verification.
      parsed.isPro = false;
      parsed.tier = 'free';
      parsed.tierName = 'Free Citizen Tier';
      parsed.dailyAiQuota = DEFAULT_FREE_QUOTA;
      parsed.expiresAt = null;
      parsed.aiCreditsRemaining = Math.min(parsed.aiCreditsRemaining || DEFAULT_FREE_QUOTA, DEFAULT_FREE_QUOTA);
      delete (parsed as UserSubscription & { authToken?: string }).authToken;

      // Reset daily quota if new day
      if (parsed.lastResetDate !== today) {
        parsed.lastResetDate = today;
        parsed.aiCreditsRemaining = parsed.isPro ? 9999 : DEFAULT_FREE_QUOTA;
      }

      return parsed;
    }
  } catch (e) {
    console.error('Failed to read subscription state', e);
  }

  // Default state
  const defaultSub: UserSubscription = {
    isPro: false,
    tier: 'free',
    tierName: 'Free Citizen Tier',
    expiresAt: null,
    dailyAiQuota: DEFAULT_FREE_QUOTA,
    aiCreditsRemaining: DEFAULT_FREE_QUOTA,
    lastResetDate: today
  };
  saveSubscriptionState(defaultSub);
  return defaultSub;
};

export const saveSubscriptionState = (sub: UserSubscription): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sub));
    window.dispatchEvent(new Event('subscription_updated'));
  } catch (e) {
    console.error('Failed to save subscription state', e);
  }
};

export const consumeAiCredit = (): { success: boolean; remaining: number; isPro: boolean } => {
  const sub = getSubscriptionState();
  if (sub.isPro) {
    return { success: true, remaining: 9999, isPro: true };
  }

  if (sub.aiCreditsRemaining > 0) {
    sub.aiCreditsRemaining -= 1;
    saveSubscriptionState(sub);
    return { success: true, remaining: sub.aiCreditsRemaining, isPro: false };
  }

  return { success: false, remaining: 0, isPro: false };
};

export const cancelProSubscription = (): UserSubscription => {
  const sub: UserSubscription = {
    isPro: false,
    tier: 'free',
    tierName: 'Free Citizen Tier',
    expiresAt: null,
    dailyAiQuota: DEFAULT_FREE_QUOTA,
    aiCreditsRemaining: DEFAULT_FREE_QUOTA,
    lastResetDate: getTodayDateKey()
  };
  saveSubscriptionState(sub);
  return sub;
};
