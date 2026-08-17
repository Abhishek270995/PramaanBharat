import { VerifiedSourceInfo } from '../types';

export const VERIFIED_SOURCES_CATALOG: VerifiedSourceInfo[] = [
  // --- 1. OFFICIAL STATUTORY & WIRE SERVICES ---
  {
    id: 'pib',
    name: 'Press Information Bureau (PIB)',
    shortName: 'PIB India',
    tier: 'Official Statutory & Wire',
    description: 'Nodal agency of the Government of India for disseminating official cabinet notifications, policy decisions, and governmental advisories.',
    accreditation: 'Ministry of Information & Broadcasting, Govt of India',
    established: 1919,
    headquarters: 'New Delhi',
    language: 'Multilingual (13 Languages)',
    badgeColor: 'bg-emerald-600 text-white',
    website: 'pib.gov.in',
    isGovernmentOfficial: true
  },
  {
    id: 'pib-factcheck',
    name: 'PIB Fact Check',
    shortName: 'PIB Fact Check',
    tier: 'Official Statutory & Wire',
    description: 'Official fact-checking unit of the Government of India established to counter fake news, viral hoaxes, and misinformation regarding government policies and public safety.',
    accreditation: 'Statutory Anti-Misinformation Unit',
    established: 2019,
    headquarters: 'New Delhi',
    language: 'English & Hindi',
    badgeColor: 'bg-teal-600 text-white',
    website: 'factcheck.pib.gov.in',
    isGovernmentOfficial: true,
    isFactCheckSpecialist: true
  },
  {
    id: 'pti',
    name: 'Press Trust of India (PTI)',
    shortName: 'PTI Wire',
    tier: 'Official Statutory & Wire',
    description: 'India’s premier non-profit cooperative news agency providing rigorously verified real-time wire feeds to thousands of newspapers, broadcasters, and digital portals.',
    accreditation: 'Press Council of India (PCI) Charter',
    established: 1947,
    headquarters: 'New Delhi',
    language: 'English & Hindi (Bhasha)',
    badgeColor: 'bg-blue-600 text-white',
    website: 'ptinews.com'
  },
  {
    id: 'ani',
    name: 'Asian News International (ANI)',
    shortName: 'ANI News',
    tier: 'Official Statutory & Wire',
    description: 'Major South Asian multimedia news agency operating video bureaus across 100+ cities with direct coverage of defense, governance, and crime scenes.',
    accreditation: 'Accredited Multimedia News Agency',
    established: 1971,
    headquarters: 'New Delhi',
    language: 'English & Regional Services',
    badgeColor: 'bg-indigo-600 text-white',
    website: 'aninews.in'
  },
  {
    id: 'ncrb',
    name: 'National Crime Records Bureau (NCRB)',
    shortName: 'NCRB Telemetry',
    tier: 'Official Statutory & Wire',
    description: 'Central statutory repository of crime data, prison statistics, accidental deaths, and CCTNS digital police telemetry under the Ministry of Home Affairs.',
    accreditation: 'Ministry of Home Affairs (MHA)',
    established: 1986,
    headquarters: 'New Delhi',
    language: 'English & Hindi',
    badgeColor: 'bg-slate-800 text-white',
    website: 'ncrb.gov.in',
    isGovernmentOfficial: true
  },
  {
    id: 'dd-news',
    name: 'DD News / Prasar Bharati',
    shortName: 'DD News & AIR',
    tier: 'Official Statutory & Wire',
    description: 'India’s public service terrestrial television network delivering neutral, high-credibility national news broadcasts across all Indian states and Union Territories.',
    accreditation: 'Prasar Bharati (Broadcasting Corporation of India)',
    established: 1959,
    headquarters: 'New Delhi',
    language: 'Pan-India 22 Scheduled Languages',
    badgeColor: 'bg-orange-600 text-white',
    website: 'ddnews.gov.in',
    isGovernmentOfficial: true
  },

  // --- 2. LEGAL & JUDICIAL REPORTING DESKS ---
  {
    id: 'livelaw',
    name: 'LiveLaw',
    shortName: 'LiveLaw Legal Desk',
    tier: 'Legal & Judicial Desk',
    description: 'Pioneering legal journalism portal providing real-time live reporting of Supreme Court of India, High Courts, criminal law updates, and constitutional matters.',
    accreditation: 'Supreme Court & High Court Press Correspondents',
    established: 2013,
    headquarters: 'Kochi & New Delhi',
    language: 'English & Hindi',
    badgeColor: 'bg-amber-600 text-white',
    website: 'livelaw.in',
    isLegalSpecialist: true
  },
  {
    id: 'bar-and-bench',
    name: 'Bar and Bench',
    shortName: 'Bar & Bench',
    tier: 'Legal & Judicial Desk',
    description: 'Premier legal news website reporting verbatim court proceedings, judicial appointments, FIR quashing petitions, and legislative reforms including BNS & BNSS.',
    accreditation: 'Accredited Supreme Court Press Bureau',
    established: 2009,
    headquarters: 'Bengaluru & New Delhi',
    language: 'English & Hindi',
    badgeColor: 'bg-yellow-700 text-white',
    website: 'barandbench.com',
    isLegalSpecialist: true
  },

  // --- 3. LEADING NATIONAL BROADSSHEETS ---
  {
    id: 'the-hindu',
    name: 'The Hindu',
    shortName: 'The Hindu',
    tier: 'National Broadsheet',
    description: 'One of India’s most respected newspapers of record, renowned for in-depth investigative journalism, public interest reporting, and strict editorial accuracy.',
    accreditation: 'Audit Bureau of Circulations (ABC) & PCI',
    established: 1878,
    headquarters: 'Chennai',
    language: 'English',
    badgeColor: 'bg-slate-900 text-white',
    website: 'thehindu.com'
  },
  {
    id: 'indian-express',
    name: 'The Indian Express',
    shortName: 'Indian Express',
    tier: 'National Broadsheet',
    description: 'Celebrated national daily known for bold investigative reporting ("Journalism of Courage"), accountability investigations, and legal analysis.',
    accreditation: 'Audit Bureau of Circulations (ABC)',
    established: 1932,
    headquarters: 'Noida / New Delhi',
    language: 'English & Marathi (Loksatta)',
    badgeColor: 'bg-rose-700 text-white',
    website: 'indianexpress.com'
  },
  {
    id: 'hindustan-times',
    name: 'Hindustan Times',
    shortName: 'Hindustan Times',
    tier: 'National Broadsheet',
    description: 'Leading national publication with extensive urban crime coverage, civic investigative reporting, national politics, and data journalism.',
    accreditation: 'Audit Bureau of Circulations (ABC)',
    established: 1924,
    headquarters: 'New Delhi',
    language: 'English & Hindi (Hindustan)',
    badgeColor: 'bg-sky-700 text-white',
    website: 'hindustantimes.com'
  },
  {
    id: 'times-of-india',
    name: 'The Times of India',
    shortName: 'Times of India (TOI)',
    tier: 'National Broadsheet',
    description: 'India’s largest circulated English broadsheet with hyper-local police station and city crime bureaus operating in 50+ municipal divisions.',
    accreditation: 'Audit Bureau of Circulations (ABC)',
    established: 1838,
    headquarters: 'Mumbai',
    language: 'English',
    badgeColor: 'bg-red-700 text-white',
    website: 'timesofindia.indiatimes.com'
  },
  {
    id: 'deccan-herald',
    name: 'Deccan Herald',
    shortName: 'Deccan Herald',
    tier: 'National Broadsheet',
    description: 'Respected English-language daily with authoritative coverage of Southern India, technology governance in Bengaluru, and environmental policies.',
    accreditation: 'Audit Bureau of Circulations (ABC)',
    established: 1948,
    headquarters: 'Bengaluru',
    language: 'English & Kannada (Prajavani)',
    badgeColor: 'bg-blue-800 text-white',
    website: 'deccanherald.com'
  },
  {
    id: 'the-tribune',
    name: 'The Tribune',
    shortName: 'The Tribune',
    tier: 'National Broadsheet',
    description: 'Historic independent broadsheet serving Northern India, Punjab, Haryana, Himachal Pradesh, and Jammu & Kashmir with steadfast editorial independence.',
    accreditation: 'The Tribune Trust / ABC',
    established: 1881,
    headquarters: 'Chandigarh',
    language: 'English, Punjabi (Punjabi Tribune), Hindi (Dainik Tribune)',
    badgeColor: 'bg-cyan-800 text-white',
    website: 'tribuneindia.com'
  },
  {
    id: 'the-telegraph',
    name: 'The Telegraph',
    shortName: 'The Telegraph India',
    tier: 'National Broadsheet',
    description: 'Premier English daily of Eastern and North-Eastern India, respected for incisive political commentary, civic reporting, and cultural analysis.',
    accreditation: 'ABP Private Limited / ABC',
    established: 1982,
    headquarters: 'Kolkata',
    language: 'English',
    badgeColor: 'bg-zinc-800 text-white',
    website: 'telegraphindia.com'
  },

  // --- 4. BUSINESS, ECONOMY & FINANCIAL FRAUD DESKS ---
  {
    id: 'mint',
    name: 'Mint (Livemint)',
    shortName: 'Mint',
    tier: 'Business & Economy Desk',
    description: 'Leading financial daily in partnership with Wall Street Journal, focusing on RBI policy, banking security, corporate governance, and economic analytics.',
    accreditation: 'HT Media Financial Bureau',
    established: 2007,
    headquarters: 'New Delhi',
    language: 'English',
    badgeColor: 'bg-amber-700 text-white',
    website: 'livemint.com'
  },
  {
    id: 'economic-times',
    name: 'The Economic Times',
    shortName: 'Economic Times (ET)',
    tier: 'Business & Economy Desk',
    description: 'World’s second-most widely read English business newspaper covering corporate crime, SEBI enforcement, UPI fintech, and industrial policies.',
    accreditation: 'Times Group Financial Desk / ABC',
    established: 1961,
    headquarters: 'Mumbai',
    language: 'English & Hindi (ET Hindi)',
    badgeColor: 'bg-emerald-800 text-white',
    website: 'economictimes.indiatimes.com'
  },
  {
    id: 'business-standard',
    name: 'Business Standard',
    shortName: 'Business Standard',
    tier: 'Business & Economy Desk',
    description: 'Respected financial broadsheet known for stringent economic analysis, regulatory compliance reporting, and fiscal policy investigations.',
    accreditation: 'Business Standard Ltd / ABC',
    established: 1975,
    headquarters: 'New Delhi',
    language: 'English & Hindi',
    badgeColor: 'bg-indigo-900 text-white',
    website: 'business-standard.com'
  },

  // --- 5. IFCN CERTIFIED FACT-CHECKING DESKS ---
  {
    id: 'boomlive',
    name: 'BOOM Live',
    shortName: 'BOOM Fact Check',
    tier: 'IFCN Certified Fact-Check',
    description: 'Pioneering fact-checking newsroom certified by the International Fact-Checking Network (IFCN), debunking viral hoaxes, deepfakes, and communal claims.',
    accreditation: 'International Fact-Checking Network (IFCN)',
    established: 2014,
    headquarters: 'Mumbai',
    language: 'English, Hindi, Bengali',
    badgeColor: 'bg-purple-700 text-white',
    website: 'boomlive.in',
    isFactCheckSpecialist: true
  },
  {
    id: 'alt-news',
    name: 'Alt News',
    shortName: 'Alt News',
    tier: 'IFCN Certified Fact-Check',
    description: 'Non-profit fact-checking website focusing on tracing video manipulations, fake government circulars, and hate speech on digital platforms.',
    accreditation: 'Pravda Media Foundation / IFCN Signatory',
    established: 2017,
    headquarters: 'Ahmedabad',
    language: 'English & Hindi',
    badgeColor: 'bg-pink-700 text-white',
    website: 'altnews.in',
    isFactCheckSpecialist: true
  },

  // --- 6. INTERNATIONAL WIRE BUREAUS (INDIA OPERATIONS) ---
  {
    id: 'reuters-india',
    name: 'Reuters India',
    shortName: 'Reuters India',
    tier: 'International Bureau',
    description: 'Global news organization with accredited full-time correspondents reporting on Indian macroeconomics, energy, space program, and diplomacy.',
    accreditation: 'Thomson Reuters Bureau',
    established: 1851,
    headquarters: 'Mumbai & New Delhi',
    language: 'English',
    badgeColor: 'bg-orange-700 text-white',
    website: 'reuters.com/world/india/'
  },
  {
    id: 'bbc-india',
    name: 'BBC News Hindi & India',
    shortName: 'BBC News India',
    tier: 'International Bureau',
    description: 'British Broadcasting Corporation’s dedicated Indian multimedia desk delivering verified public health, social justice, and investigative reporting.',
    accreditation: 'BBC World Service Trust',
    established: 1940,
    headquarters: 'New Delhi',
    language: 'English, Hindi, Tamil, Telugu, Marathi, Gujarati, Punjabi',
    badgeColor: 'bg-red-800 text-white',
    website: 'bbc.com/hindi'
  },

  // --- 7. REGIONAL LANGUAGE BROADSSHEETS ---
  {
    id: 'dainik-bhaskar',
    name: 'Dainik Bhaskar',
    shortName: 'Dainik Bhaskar',
    tier: 'Regional Language Broadsheet',
    description: 'India’s largest circulated Hindi newspaper with grassroots investigative reporting across Madhya Pradesh, Rajasthan, Gujarat, Bihar, and Punjab.',
    accreditation: 'Audit Bureau of Circulations (ABC)',
    established: 1958,
    headquarters: 'Bhopal',
    language: 'Hindi, Gujarati (Divya Bhaskar), Marathi (Divya Marathi)',
    badgeColor: 'bg-amber-600 text-white',
    website: 'bhaskar.com'
  },
  {
    id: 'malayala-manorama',
    name: 'Malayala Manorama',
    shortName: 'Malayala Manorama',
    tier: 'Regional Language Broadsheet',
    description: 'One of India’s oldest and most influential Malayalam dailies with deep reporting across Kerala, disaster management, and public health.',
    accreditation: 'Audit Bureau of Circulations (ABC)',
    established: 1888,
    headquarters: 'Kottayam',
    language: 'Malayalam & English (Onmanorama)',
    badgeColor: 'bg-emerald-700 text-white',
    website: 'manoramaonline.com'
  },
  {
    id: 'anandabazar-patrika',
    name: 'Anandabazar Patrika (ABP)',
    shortName: 'Anandabazar Patrika',
    tier: 'Regional Language Broadsheet',
    description: 'Largest circulated Bengali daily newspaper delivering authoritative regional coverage across West Bengal, Tripura, and Eastern India.',
    accreditation: 'ABP Group / ABC',
    established: 1922,
    headquarters: 'Kolkata',
    language: 'Bengali & English',
    badgeColor: 'bg-blue-900 text-white',
    website: 'anandabazar.com'
  },
  {
    id: 'eenadu',
    name: 'Eenadu',
    shortName: 'Eenadu',
    tier: 'Regional Language Broadsheet',
    description: 'Highest-circulated Telugu daily with extensive mandal-level and district reporting across Andhra Pradesh and Telangana.',
    accreditation: 'Ushodaya Publications / ABC',
    established: 1974,
    headquarters: 'Hyderabad',
    language: 'Telugu',
    badgeColor: 'bg-red-600 text-white',
    website: 'eenadu.net'
  }
];

export const getSourceById = (id: string): VerifiedSourceInfo | undefined => {
  return VERIFIED_SOURCES_CATALOG.find(s => s.id === id || s.name.toLowerCase().includes(id.toLowerCase()));
};

export const getSourceByName = (name: string): VerifiedSourceInfo | undefined => {
  if (!name) return undefined;
  const n = name.toLowerCase();
  return VERIFIED_SOURCES_CATALOG.find(s => 
    s.name.toLowerCase() === n || 
    s.shortName.toLowerCase() === n ||
    n.includes(s.id) ||
    s.name.toLowerCase().includes(n) ||
    n.includes(s.shortName.toLowerCase())
  );
};

/**
 * Resolves the exact article / story URL on the official source publisher's website.
 * Instead of dumping the user onto a generic root homepage, it routes directly to the specific news story
 * or dedicated search/tag archive on the verified publisher's platform.
 */
export const getArticleSourceUrl = (article: { title: string; source: string; originalUrl?: string }): string => {
  if (!article) return 'https://news.google.com';

  const cleanTitle = (article.title || '')
    .replace(/[^\w\s-]/gi, ' ')
    .trim();

  // Extract core keywords from the headline
  const stopWords = new Set(['and', 'the', 'for', 'with', 'after', 'from', 'into', 'over', 'under', 'across', 'all', 'out', 'has', 'have', 'had', 'its', 'their', 'this', 'that', 'with', 'amid', 'launch', 'launches', 'busting', 'busts']);
  const keywords = cleanTitle
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w.toLowerCase()))
    .slice(0, 6)
    .join(' ');

  const encodedKeywords = encodeURIComponent(keywords || cleanTitle);
  const sLower = (article.source || '').toLowerCase();

  // 1. Direct deep-link mapping for verified news publishers to show the exact story
  if (sLower.includes('bar and bench')) {
    return `https://www.barandbench.com/search?q=${encodedKeywords}`;
  }
  if (sLower.includes('livelaw')) {
    return `https://www.livelaw.in/search?search=${encodedKeywords}`;
  }
  if (sLower.includes('pib fact check')) {
    return `https://factcheck.pib.gov.in`;
  }
  if (sLower.includes('press information bureau') || sLower.includes('pib')) {
    return `https://pib.gov.in/AllRelease.aspx`;
  }
  if (sLower.includes('press trust of india') || sLower.includes('pti')) {
    return `https://www.ptinews.com/search?search_text=${encodedKeywords}`;
  }
  if (sLower.includes('indian express')) {
    return `https://indianexpress.com/?s=${encodedKeywords}`;
  }
  if (sLower.includes('times of india')) {
    return `https://timesofindia.indiatimes.com/topic/${encodeURIComponent((keywords || cleanTitle).replace(/\s+/g, '-'))}`;
  }
  if (sLower.includes('hindu')) {
    return `https://www.thehindu.com/search/?q=${encodedKeywords}`;
  }
  if (sLower.includes('hindustan times')) {
    return `https://www.hindustantimes.com/search?q=${encodedKeywords}`;
  }
  if (sLower.includes('boom live') || sLower.includes('boom')) {
    return `https://www.boomlive.in/search?q=${encodedKeywords}`;
  }
  if (sLower.includes('alt news')) {
    return `https://www.altnews.in/?s=${encodedKeywords}`;
  }
  if (sLower.includes('livemint') || sLower.includes('mint')) {
    return `https://www.livemint.com/search?q=${encodedKeywords}`;
  }
  if (sLower.includes('deccan herald')) {
    return `https://www.deccanherald.com/search?q=${encodedKeywords}`;
  }
  if (sLower.includes('tribune')) {
    return `https://www.tribuneindia.com/search?q=${encodedKeywords}`;
  }
  if (sLower.includes('deccan chronicle')) {
    return `https://www.deccanchronicle.com/search?q=${encodedKeywords}`;
  }
  if (sLower.includes('telegraph')) {
    return `https://www.telegraphindia.com/search?search_text=${encodedKeywords}`;
  }
  if (sLower.includes('economic times')) {
    return `https://economictimes.indiatimes.com/topic/${encodeURIComponent((keywords || cleanTitle).replace(/\s+/g, '-'))}`;
  }
  if (sLower.includes('ani') || sLower.includes('asian news international')) {
    return `https://aninews.in/search?q=${encodedKeywords}`;
  }
  if (sLower.includes('eenadu')) {
    return `https://www.eenadu.net/search?q=${encodedKeywords}`;
  }
  if (sLower.includes('reuters')) {
    return `https://www.reuters.com/site-search/?query=${encodedKeywords}`;
  }
  if (sLower.includes('dd news') || sLower.includes('prasar bharati')) {
    return `https://ddnews.gov.in/search?q=${encodedKeywords}`;
  }
  if (sLower.includes('dainik jagran') || sLower.includes('jagran')) {
    return `https://www.jagran.com/search/${encodedKeywords}.html`;
  }
  if (sLower.includes('dainik bhaskar') || sLower.includes('bhaskar')) {
    return `https://www.bhaskar.com/search/?q=${encodedKeywords}`;
  }
  if (sLower.includes('amar ujala')) {
    return `https://www.amarujala.com/search?q=${encodedKeywords}`;
  }
  if (sLower.includes('lokmat')) {
    return `https://www.lokmat.com/search/?q=${encodedKeywords}`;
  }
  if (sLower.includes('anandabazar')) {
    return `https://www.anandabazar.com/search?q=${encodedKeywords}`;
  }
  if (sLower.includes('daily thanthi')) {
    return `https://www.dailythanthi.com/search?q=${encodedKeywords}`;
  }
  if (sLower.includes('prajavani')) {
    return `https://www.prajavani.net/search?q=${encodedKeywords}`;
  }
  if (sLower.includes('isro')) {
    return `https://www.isro.gov.in/Missions.html`;
  }
  if (sLower.includes('ncrb')) {
    return `https://ncrb.gov.in/en/crime-in-india-2022`;
  }

  // Fallback: Google News exact search targeting the story and publisher
  return `https://news.google.com/search?q=${encodeURIComponent(`"${cleanTitle}" ${article.source}`)}`;
};

