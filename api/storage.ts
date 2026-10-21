import { createHash } from 'node:crypto';

type CacheEntry<T> = { data: T };
type QuotaResult = {
  allowed: boolean;
  reason?: 'burst' | 'daily';
  requestsToday: number;
  remaining: number;
  retryAfterSeconds?: number;
};

const redisUrl = process.env.UPSTASH_REDIS_REST_URL?.replace(/\/$/, '');
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
const hasSharedRedis = Boolean(redisUrl && redisToken);
const memoryCache = new Map<string, { data: unknown; expiresAt: number }>();
const memoryQuota = new Map<string, { date: string; daily: number; minute: number; minuteCount: number }>();

async function redisCommand<T>(command: unknown[]): Promise<T> {
  if (!redisUrl || !redisToken) throw new Error('Shared Redis is not configured');

  const response = await fetch(redisUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${redisToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command),
    signal: AbortSignal.timeout(2500),
  });

  if (!response.ok) throw new Error(`Shared Redis returned ${response.status}`);
  const result = await response.json() as { result?: T; error?: string };
  if (result.error) throw new Error(`Shared Redis command failed: ${result.error}`);
  return result.result as T;
}

export const sharedStorageConfigured = hasSharedRedis;

export async function getCachedValue<T>(key: string): Promise<T | null> {
  if (!hasSharedRedis) {
    const entry = memoryCache.get(key);
    if (!entry) return null;
    if (entry.expiresAt <= Date.now()) {
      memoryCache.delete(key);
      return null;
    }
    return entry.data as T;
  }

  const value = await redisCommand<string | null>(['GET', `pb:cache:${key}`]);
  return value ? JSON.parse(value) as T : null;
}

export async function setCachedValue(key: string, data: unknown, ttlMs: number): Promise<void> {
  const ttlSeconds = Math.max(1, Math.ceil(ttlMs / 1000));
  if (!hasSharedRedis) {
    if (memoryCache.size >= 500) {
      const oldestKey = memoryCache.keys().next().value;
      if (oldestKey) memoryCache.delete(oldestKey);
    }
    memoryCache.set(key, { data, expiresAt: Date.now() + ttlMs });
    return;
  }

  await redisCommand(['SET', `pb:cache:${key}`, JSON.stringify(data), 'EX', ttlSeconds]);
}

export async function consumeQuota(options: {
  ip: string;
  today: string;
  minute: number;
  secondsUntilMidnight: number;
  dailyLimit: number;
  burstLimit: number;
}): Promise<QuotaResult> {
  const { ip, today, minute, secondsUntilMidnight, dailyLimit, burstLimit } = options;
  const ipDigest = createHash('sha256').update(ip).digest('hex');

  if (!hasSharedRedis) {
    const key = `${ipDigest}:${today}`;
    const record = memoryQuota.get(key) ?? { date: today, daily: 0, minute, minuteCount: 0 };
    if (record.minute !== minute) {
      record.minute = minute;
      record.minuteCount = 0;
    }
    record.minuteCount += 1;
    if (record.minuteCount > burstLimit) {
      memoryQuota.set(key, record);
      return { allowed: false, reason: 'burst', requestsToday: record.daily, remaining: Math.max(0, dailyLimit - record.daily), retryAfterSeconds: 60 - (Math.floor(Date.now() / 1000) % 60) };
    }
    if (record.daily >= dailyLimit) {
      memoryQuota.set(key, record);
      return { allowed: false, reason: 'daily', requestsToday: record.daily, remaining: 0 };
    }
    record.daily += 1;
    memoryQuota.set(key, record);
    return { allowed: true, requestsToday: record.daily, remaining: Math.max(0, dailyLimit - record.daily) };
  }

  const dailyKey = `pb:quota:${ipDigest}:${today}`;
  const minuteKey = `pb:burst:${ipDigest}:${minute}`;
  const script = [
    "local burst = redis.call('INCR', KEYS[1])",
    "if burst == 1 then redis.call('EXPIRE', KEYS[1], 61) end",
    "if burst > tonumber(ARGV[1]) then return {-1, tonumber(redis.call('GET', KEYS[2]) or '0')} end",
    "local daily = tonumber(redis.call('GET', KEYS[2]) or '0')",
    "if daily >= tonumber(ARGV[2]) then return {0, daily} end",
    "daily = redis.call('INCR', KEYS[2])",
    "if daily == 1 then redis.call('EXPIRE', KEYS[2], tonumber(ARGV[3])) end",
    "return {1, daily}",
  ].join('; ');
  const result = await redisCommand<[number, number]>([
    'EVAL', script, 2, minuteKey, dailyKey, burstLimit, dailyLimit, secondsUntilMidnight,
  ]);
  const [status, requestsToday] = result;
  if (status === -1) {
    return { allowed: false, reason: 'burst', requestsToday, remaining: Math.max(0, dailyLimit - requestsToday), retryAfterSeconds: 60 - (Math.floor(Date.now() / 1000) % 60) };
  }
  if (status === 0) return { allowed: false, reason: 'daily', requestsToday, remaining: 0 };
  return { allowed: true, requestsToday, remaining: Math.max(0, dailyLimit - requestsToday) };
}

export async function getQuotaUsage(ip: string, today: string): Promise<number> {
  const ipDigest = createHash('sha256').update(ip).digest('hex');
  if (!hasSharedRedis) return memoryQuota.get(`${ipDigest}:${today}`)?.daily ?? 0;

  const count = await redisCommand<string | null>(['GET', `pb:quota:${ipDigest}:${today}`]);
  return Number(count ?? 0);
}
