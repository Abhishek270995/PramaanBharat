// Subscription and AI Quota Management for Pramaan Bharat

export interface UserSubscription {
  isPro: boolean;
  tier: 'free' | 'weekly' | 'monthly' | 'annual';
  tierName: string;
  expiresAt: number | null; // Unix timestamp ms
  dailyAiQuota: number;
  aiCreditsRemaining: number;
  lastResetDate: string; // YYYY-MM-DD
  authToken?: string;
}

const STORAGE_KEY = 'pramaan_user_subscription';
const DEFAULT_FREE_QUOTA = 3;

export const getTodayDateKey = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

export const getSubscriptionState = (): UserSubscription => {
  const today = getTodayDateKey();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: UserSubscription = JSON.parse(raw);
      
      // Check if pro has expired
      if (parsed.isPro && parsed.expiresAt && Date.now() > parsed.expiresAt) {
        parsed.isPro = false;
        parsed.tier = 'free';
        parsed.tierName = 'Free Citizen Tier';
        parsed.dailyAiQuota = DEFAULT_FREE_QUOTA;
        parsed.expiresAt = null;
      }

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

export const activateProSubscription = (tier: 'weekly' | 'monthly' | 'annual'): UserSubscription => {
  const durations: Record<string, number> = {
    weekly: 7 * 24 * 60 * 60 * 1000,
    monthly: 30 * 24 * 60 * 60 * 1000,
    annual: 365 * 24 * 60 * 60 * 1000
  };

  const names: Record<string, string> = {
    weekly: 'Pramaan Weekly Pass',
    monthly: 'Pramaan Pro Monthly',
    annual: 'Pramaan Champion Annual'
  };

  const newSub: UserSubscription = {
    isPro: true,
    tier,
    tierName: names[tier] || 'Pramaan Pro',
    expiresAt: Date.now() + (durations[tier] || durations.monthly),
    dailyAiQuota: 9999,
    aiCreditsRemaining: 9999,
    lastResetDate: getTodayDateKey(),
    authToken: `PRO-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
  };

  saveSubscriptionState(newSub);
  return newSub;
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
