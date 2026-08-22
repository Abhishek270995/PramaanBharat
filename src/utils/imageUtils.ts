/**
 * Contextual High-Resolution News Image Classifier & Resolver
 * Extracts real images from RSS sources or maps titles to rich, diverse, topic-specific editorial photography.
 */

const TOPIC_IMAGE_POOLS: { keywords: string[]; images: string[] }[] = [
  {
    // Railways & Trains
    keywords: ['railway', 'train', 'vande bharat', 'rajdhani', 'kavach', 'track', 'locomotive', 'station', 'irctc'],
    images: [
      'https://images.unsplash.com/photo-1509749837427-ac94a2553d0e?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=800&auto=format&fit=crop&q=80'
    ]
  },
  {
    // Court & Judiciary & Laws
    keywords: ['court', 'judge', 'supreme court', 'high court', 'bns', 'bnss', 'bail', 'verdict', 'judiciary', 'chargesheet', 'counsel', 'bench', 'magistrate'],
    images: [
      'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1453733197781-30886f6424a9?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=800&auto=format&fit=crop&q=80'
    ]
  },
  {
    // Cyber & Online Scams & AI
    keywords: ['cyber', 'scam', 'phishing', 'deepfake', 'hacked', 'apk', 'digital arrest', 'crypto', 'otp', 'online fraud', 'mule', 'malware', 'ai ', 'artificial intelligence'],
    images: [
      'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80'
    ]
  },
  {
    // Police & Law Enforcement & Crime
    keywords: ['police', 'arrest', 'seized', 'cbi', 'ed ', 'acb', 'raid', 'custody', 'cop', 'patrol', 'special cell', 'crime', 'murder', 'theft', 'burglary', 'smuggling'],
    images: [
      'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1589578527966-fdac0f44566c?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1508847154043-be5407fcaa5a?w=800&auto=format&fit=crop&q=80'
    ]
  },
  {
    // Fire & Emergency & Disaster
    keywords: ['fire', 'blaze', 'blast', 'burn', 'flame', 'rescue', 'disaster', 'ndrf', 'sdrf', 'emergency', 'evacuate'],
    images: [
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1508873696983-2df5293cb325?w=800&auto=format&fit=crop&q=80'
    ]
  },
  {
    // Space & ISRO & Defense & Science
    keywords: ['isro', 'satellite', 'rocket', 'drdo', 'space', 'missile', 'gaganyaan', 'chandrayaan', 'gslv', 'pslv', 'orbit', 'telemetry'],
    images: [
      'https://images.unsplash.com/photo-1517976487515-534a28cb75f5?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80'
    ]
  },
  {
    // Weather & Flood & Climate & Monsoon
    keywords: ['rain', 'flood', 'monsoon', 'storm', 'cyclone', 'imd', 'weather', 'heatwave', 'inundation', 'imd '],
    images: [
      'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1561553873-e8491a564fd0?w=800&auto=format&fit=crop&q=80'
    ]
  },
  {
    // Education & Exams & Youth
    keywords: ['nta', 'exam', 'neet', 'jee', 'student', 'school', 'college', 'university', 'paper leak', 'recruitment', 'omr', 'education'],
    images: [
      'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&auto=format&fit=crop&q=80'
    ]
  },
  {
    // Economy, Business, Banking & Markets
    keywords: ['rbi', 'bank', 'rupee', 'stock', 'market', 'gdp', 'inflation', 'trade', 'startup', 'sensex', 'nifty', 'economy', 'tax', 'gst', 'tender', 'funds'],
    images: [
      'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=80'
    ]
  },
  {
    // Health, Medicine & Food Safety
    keywords: ['hospital', 'doctor', 'patient', 'health', 'medical', 'food safety', 'mid-day meal', 'poison', 'disease', 'vaccine', 'drug'],
    images: [
      'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80'
    ]
  },
  {
    // Highways, Transport & Smart Cities
    keywords: ['expressway', 'highway', 'road', 'traffic', 'bridge', 'flyover', 'metro', 'ev ', 'electric vehicle', 'infrastructure', 'cctv', 'smart city'],
    images: [
      'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&auto=format&fit=crop&q=80'
    ]
  },
  {
    // Green Energy & Environment
    keywords: ['solar', 'wind', 'renewable', 'energy', 'carbon', 'khavda', 'green', 'forest', 'wildlife', 'rhino', 'tiger', 'national park'],
    images: [
      'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1575550959106-5a7defe28b56?w=800&auto=format&fit=crop&q=80'
    ]
  },
  {
    // Agriculture & Rural
    keywords: ['farmer', 'agriculture', 'crop', 'mandi', 'monsoon', 'harvest', 'rural', 'fertilizer', 'kisan'],
    images: [
      'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800&auto=format&fit=crop&q=80'
    ]
  },
  {
    // Governance, Parliament & National Pride
    keywords: ['parliament', 'cabinet', 'minister', 'pib', 'governance', 'election', 'delhi', 'modi', 'constitution', 'summit', 'bilateral', 'pmo'],
    images: [
      'https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&auto=format&fit=crop&q=80'
    ]
  }
];

const DEFAULT_EDITORIAL_FALLBACKS = [
  'https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&auto=format&fit=crop&q=80'
];

/**
 * Derives a deterministic integer hash from a string
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Resolves a highly relevant, high-resolution, unique thumbnail for a news article.
 * If rawImg is already a valid image URL (not a repetitive default), it preserves it.
 * Otherwise, it classifies the headline and returns a matching editorial photo.
 */
export function getRelevantNewsImage(
  title: string,
  rawImg?: string,
  category?: string,
  saltIndex: number = 0
): string {
  // If the article has an explicit, valid non-generic external image from an authentic CDN, use it
  if (rawImg && typeof rawImg === 'string' && rawImg.startsWith('http')) {
    // Check if it's the repetitive train photo that was previously over-assigned
    const isOverusedTrain = rawImg.includes('photo-1509749837427-ac94a2553d0e');
    const isActualTrainStory = title.toLowerCase().includes('train') || title.toLowerCase().includes('railway') || title.toLowerCase().includes('kavach');

    if (!isOverusedTrain || isActualTrainStory) {
      return rawImg;
    }
  }

  const textToScan = `${title} ${category || ''}`.toLowerCase();
  const hash = hashString(title) + saltIndex;

  // Search through topic pools for the best match
  for (const pool of TOPIC_IMAGE_POOLS) {
    for (const kw of pool.keywords) {
      if (textToScan.includes(kw)) {
        return pool.images[hash % pool.images.length];
      }
    }
  }

  // Fallback to rotating diverse editorial imagery
  return DEFAULT_EDITORIAL_FALLBACKS[hash % DEFAULT_EDITORIAL_FALLBACKS.length];
}
