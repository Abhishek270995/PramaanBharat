export type LanguageCode = 'en' | 'hi' | 'bn' | 'ta' | 'te' | 'mr' | 'gu' | 'kn';

export interface Language {
  code: LanguageCode;
  name: string;
  nativeName: string;
}

export type TimeRangeKey = 'today' | '7d' | '30d' | 'ytd' | '2025' | '2024' | 'custom';

export interface TimeFilter {
  key: TimeRangeKey;
  label: string;
  startDate?: string;
  endDate?: string;
}

export type RiskLevel = 'Low' | 'Moderate' | 'High' | 'Critical Alert';

export interface DistrictInfo {
  id: string;
  name: string;
  stateId: string;
  reportedCrimes: number;
  verifiedCrimes: number;
  solvedCrimes: number;
  archivedCases: number;
  riskLevel: RiskLevel;
  primaryConcern: string;
  policeStationsCount: number;
  emergencyHelpline: string;
  coordinates: [number, number]; // [lat, lng]
}

export interface StateInfo {
  id: string;
  name: string;
  hindiName: string;
  code: string;
  capital: string;
  zone: 'North' | 'South' | 'West' | 'East' | 'Central' | 'North-East';
  reportedCrimes: number;
  verifiedCrimes: number;
  solvedCrimes: number;
  archivedCases: number;
  riskLevel: RiskLevel;
  primaryConcern: string;
  policeHeadquarters: string;
  districts: DistrictInfo[];
  svgPathId?: string;
  centerCoordinates: [number, number];
}

export type CrimeCategory = 
  | 'Cybercrime & Online Fraud'
  | 'Women & Child Safety'
  | 'Theft & Burglary'
  | 'Financial & Corporate Fraud'
  | 'Violent Offenses'
  | 'Narcotics & NDPS'
  | 'Traffic & Hit-and-Run'
  | 'Public Order & Nuisance';

export interface CrimeCategoryStat {
  category: CrimeCategory;
  reported: number;
  verified: number;
  solved: number;
  archived: number;
  yoyChange: number; // percentage
  averageResolutionDays: number;
  iconName: string;
  color: string;
  description: string;
}

export interface SolvedArchivedCase {
  id: string;
  firNumber: string;
  maskedFirNumber: string;
  stateId: string;
  stateName: string;
  state?: string;
  districtId: string;
  districtName: string;
  district?: string;
  policeStation: string;
  investigatingOfficer: string;
  officerBadge: string;
  category: CrimeCategory;
  crimeCategory?: CrimeCategory;
  title: string;
  incidentDate: string;
  dateOfIncident?: string;
  solvedDate: string;
  archivedDate: string;
  dateClosed?: string;
  summary: string;
  chargesheetSummary?: string;
  policeActionTaken: string;
  recoveryDetails?: string;
  convictionStatus: 'Convicted in District Court' | 'Chargesheet Filed - Fast Track Court' | 'Property Recovered & Closed' | 'Compound Settlement by Lok Adalat' | 'Acquittal / Case Closed' | string;
  courtConvictionOutcome?: string;
  status?: string;
  accusedCount: number;
  accusedDetails?: string;
  sectionsApplied?: string[];
  confidentialForensicBrief?: string;
  evidenceTags: string[];
  isRestrictedClassified: boolean;
}

export type NewsCategory = 
  | 'All'
  | 'For You'
  | 'Public Safety & Crime'
  | 'National'
  | 'State & Local'
  | 'Politics'
  | 'Business'
  | 'Tech'
  | 'Sports'
  | 'Entertainment'
  | 'Health & Climate';

export type CredibilityRating = 
  | 'Official Press Brief'
  | 'Verified Wire (PTI/ANI)'
  | 'Accredited Legal Wire'
  | 'Statutory Government Release'
  | 'IFCN Certified Fact Check'
  | 'Correspondent Ground Report'
  | 'Financial & Market Desk';

export type SourceTier = 
  | 'Official Statutory & Wire'
  | 'Legal & Judicial Desk'
  | 'National Broadsheet'
  | 'Business & Economy Desk'
  | 'IFCN Certified Fact-Check'
  | 'International Bureau'
  | 'Regional Language Broadsheet';

export interface VerifiedSourceInfo {
  id: string;
  name: string;
  shortName: string;
  tier: SourceTier;
  description: string;
  accreditation: string;
  established: number;
  headquarters: string;
  language: string;
  badgeColor: string;
  website: string;
  isGovernmentOfficial?: boolean;
  isFactCheckSpecialist?: boolean;
  isLegalSpecialist?: boolean;
}

export interface NewsArticle {
  id: string;
  title: string;
  translatedTitles?: Partial<Record<LanguageCode, string>>;
  snippet: string;
  content: string;
  source: string;
  sourceId?: string;
  sourceTier?: SourceTier;
  sourceLogo?: string;
  publishedAt: string;
  publishedDate?: string; // ISO format: 'YYYY-MM-DD' for precise filtering
  category: NewsCategory;
  crimeCategory?: CrimeCategory;
  stateId?: string;
  stateName?: string;
  districtId?: string;
  districtName?: string;
  imageUrl: string;
  readTimeMinutes: number;
  isBreaking?: boolean;
  isVerifiedFactCheck?: boolean;
  credibilityRating: CredibilityRating | string;
  tags: string[];
  viewsCount: number;
  sharesCount: number;
  relatedArticleIds?: string[];
  summaryPoints?: string[];
  originalUrl?: string;
  publishedTimestamp?: number;
}

export interface LiveSafetyAlert {
  id: string;
  title: string;
  description: string;
  severity: 'Critical' | 'Warning' | 'Advisory';
  stateId: string;
  districtId?: string;
  locationName: string;
  issuedBy: string;
  timestamp: string;
  expiresAt: string;
  category: CrimeCategory | 'Disaster' | 'Traffic Hazard';
  activeHelpline: string;
  isPinned: boolean;
}

export interface CommunityTopic {
  id: string;
  title: string;
  description: string;
  locality: string;
  district: string;
  state: string;
  category: string;
  urgency: 'Low' | 'Medium' | 'High' | 'Urgent';
  authorName: string;
  authorType: 'Resident Citizen' | 'RWA Member' | 'Community Safety Volunteer' | 'Local Merchant';
  upvotes: number;
  hasUpvoted?: boolean;
  commentsCount: number;
  policeStatus: 'Under Verification' | 'Police Patrol Assigned' | 'Ward Action Initiated' | 'Resolved by Community & Police';
  policeRemarks?: string;
  createdAt: string;
  createdTimestamp?: number;
}

export interface AuthorizedOfficer {
  badgeId?: string;
  badgeNumber?: string;
  name?: string;
  officerName?: string;
  designation?: string;
  jurisdiction?: string;
  policeStation?: string;
  state?: string;
  rank?: string;
  accessLevel?: string;
  clearanceLevel?: string;
  token?: string;
  permissions?: string[];
}

export interface AISafetyBriefing {
  regionName: string;
  overallRiskLevel: RiskLevel;
  executiveSummary: string;
  keyThreatVectors: string[];
  actionableAdvisories: string[];
  emergencyContacts: { agency: string; number: string }[];
  lastUpdated: string;
}

export type ArchivedCase = SolvedArchivedCase;
