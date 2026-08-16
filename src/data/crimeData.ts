import { CrimeCategory, CrimeCategoryStat, SolvedArchivedCase, LiveSafetyAlert, TimeRangeKey, StateInfo, DistrictInfo } from '../types';

export const CRIME_CATEGORIES_DATA: CrimeCategoryStat[] = [
  {
    category: 'Cybercrime & Online Fraud',
    reported: 94200,
    verified: 88500,
    solved: 76400,
    archived: 64800,
    yoyChange: 18.4,
    averageResolutionDays: 14,
    iconName: 'ShieldAlert',
    color: '#3B82F6', // Blue
    description: 'UPI phishing, fake investment portals, OTP screen-share scams, Aadhaar spoofing, deepfake blackmail.'
  },
  {
    category: 'Theft & Burglary',
    reported: 78500,
    verified: 73200,
    solved: 64100,
    archived: 57300,
    yoyChange: -6.2,
    averageResolutionDays: 19,
    iconName: 'Lock',
    color: '#F59E0B', // Amber
    description: 'Residential break-ins, gold chain snatching, vehicle lifting, commercial warehouse inventory thefts.'
  },
  {
    category: 'Women & Child Safety',
    reported: 48900,
    verified: 46800,
    solved: 42900,
    archived: 38600,
    yoyChange: -4.8,
    averageResolutionDays: 9,
    iconName: 'HeartHandshake',
    color: '#EC4899', // Pink
    description: 'Emergency 1090/112 fast-response, transit harassment monitoring, domestic welfare, night escort beats.'
  },
  {
    category: 'Financial & Corporate Fraud',
    reported: 41200,
    verified: 38900,
    solved: 32600,
    archived: 28400,
    yoyChange: 12.1,
    averageResolutionDays: 45,
    iconName: 'Coins',
    color: '#8B5CF6', // Purple
    description: 'Illegal multi-level Ponzi schemes, fake loan apps, forged land title deeds, GST evasion rings.'
  },
  {
    category: 'Traffic & Hit-and-Run',
    reported: 53100,
    verified: 49800,
    solved: 46200,
    archived: 41900,
    yoyChange: -2.3,
    averageResolutionDays: 6,
    iconName: 'Car',
    color: '#10B981', // Emerald
    description: 'Highway CCTV camera tracking, rash driving on expressways, hit-and-run detection via ANPR mesh.'
  },
  {
    category: 'Violent Offenses',
    reported: 29400,
    verified: 27900,
    solved: 25100,
    archived: 22100,
    yoyChange: -8.7,
    averageResolutionDays: 24,
    iconName: 'AlertTriangle',
    color: '#EF4444', // Red
    description: 'Grievous hurt, unlawful armed assembly, extortion threats, property altercation assaults.'
  },
  {
    category: 'Narcotics & NDPS',
    reported: 16800,
    verified: 15900,
    solved: 14200,
    archived: 12100,
    yoyChange: 22.5,
    averageResolutionDays: 32,
    iconName: 'Pill',
    color: '#06B6D4', // Cyan
    description: 'Synthetic MDMA raids, international drone courier interceptions, interstate cannabis border seizures.'
  },
  {
    category: 'Public Order & Nuisance',
    reported: 21800,
    verified: 20100,
    solved: 19100,
    archived: 17400,
    yoyChange: -11.2,
    averageResolutionDays: 4,
    iconName: 'Volume2',
    color: '#64748B', // Slate
    description: 'Unlicensed loudspeaker night violations, illegal public encroachments, riot hoax spreaders.'
  }
];

export const SOLVED_ARCHIVED_CASES: SolvedArchivedCase[] = [
  {
    id: 'CASE-2026-MH-8901',
    firNumber: 'FIR/0491/2026/BKC-CYBER',
    maskedFirNumber: 'FIR/0491/2026/BKC-***',
    stateId: 'maharashtra',
    stateName: 'Maharashtra',
    districtId: 'mumbai-city',
    districtName: 'Mumbai City & Suburban',
    policeStation: 'BKC Cyber Police Station, Bandra Kurla Complex',
    investigatingOfficer: 'Senior Insp. Suhas V. Kulkarni',
    officerBadge: 'MH-POL-4412',
    category: 'Cybercrime & Online Fraud',
    title: 'Inter-State Multi-Crore Fake Institutional Trading Portal Busted',
    incidentDate: '2026-06-12',
    solvedDate: '2026-07-28',
    archivedDate: '2026-08-04',
    summary: 'A syndicate operating 14 fake institutional trading applications impersonating regulated Indian brokerage houses was dismantled. Over 185 mule bank accounts frozen across 6 states.',
    policeActionTaken: 'Special task team tracked IP server clusters in Cambodia and Delhi. Simultaneous raids in Noida and Surat resulted in 8 arrests and seizure of 42 laptops and 91 SIM cards.',
    recoveryDetails: '₹4.82 Crores retrieved in mule bank liens; 100% returned to 48 affected senior citizen victims.',
    convictionStatus: 'Chargesheet Filed - Fast Track Court',
    accusedCount: 8,
    evidenceTags: ['Digital Forensics', 'Mule Ledger', 'IP Trace Records', 'Call Audio Logs'],
    confidentialForensicBrief: 'Accused utilized modified Telegram bots linked to crypto-wash conduits in USDT. Forensic image hash SHA-256 verified by Central Forensic Science Laboratory (CFSL).',
    isRestrictedClassified: true
  },
  {
    id: 'CASE-2026-DL-1102',
    firNumber: 'FIR/0182/2026/SPL-CELL',
    maskedFirNumber: 'FIR/0182/2026/SPL-***',
    stateId: 'delhi-ncr',
    stateName: 'Delhi NCR',
    districtId: 'south-delhi',
    districtName: 'South Delhi & Saket',
    policeStation: 'Special Cell Southern Range, Lodhi Colony',
    investigatingOfficer: 'ACP Dheeraj Malhotra',
    officerBadge: 'DL-POL-8821',
    category: 'Theft & Burglary',
    title: 'High-Tech Luxury Vehicle Lifting Syndicate with OBD Jammer Scanners Cracked',
    incidentDate: '2026-04-18',
    solvedDate: '2026-05-30',
    archivedDate: '2026-06-15',
    summary: 'Syndicate using frequency sniffers and On-Board Diagnostic (OBD) key duplicators targeting parked SUVs across Delhi NCR neutralized.',
    policeActionTaken: 'CCTV ANPR network mapped escape routes towards Meerut toll gates. GPS telemetry sting arrested kingpin in trans-Yamuna warehouse.',
    recoveryDetails: '19 stolen luxury SUVs valued at ₹7.2 Crores recovered with forged chassis plates and handed back to legitimate owners.',
    convictionStatus: 'Convicted in District Court',
    accusedCount: 5,
    evidenceTags: ['ANPR Video Feeds', 'OBD Cloner Hardware', 'Fake RTO Certificates'],
    confidentialForensicBrief: 'Key programmer decoded CAN-bus immobilizers in under 90 seconds. Manufacturer patch issued to automotive OEMs.',
    isRestrictedClassified: false
  },
  {
    id: 'CASE-2026-KA-3420',
    firNumber: 'FIR/0319/2026/IND-NGR',
    maskedFirNumber: 'FIR/0319/2026/IND-***',
    stateId: 'karnataka',
    stateName: 'Karnataka',
    districtId: 'bengaluru-urban',
    districtName: 'Bengaluru Urban & Tech Corridors',
    policeStation: 'Indiranagar Police Station, Bengaluru City',
    investigatingOfficer: 'Insp. Manjunath Reddy',
    officerBadge: 'KA-CCB-1104',
    category: 'Financial & Corporate Fraud',
    title: 'Bogus AI Cloud Computing Data Center Investment Scheme Closed',
    incidentDate: '2026-03-02',
    solvedDate: '2026-04-20',
    archivedDate: '2026-05-10',
    summary: 'Fraudulent company promising 40% monthly returns on GPU server leasing lured tech employees. Over ₹11 Crores diverted into luxury properties.',
    policeActionTaken: 'CID Economic Offenses Wing seized company assets, frozen demat balances, and sealed 2 commercial offices in Whitefield.',
    recoveryDetails: 'Properties worth ₹9.4 Crores attached under KPID Act; court appointed commissioner overseeing liquidation and investor refund.',
    convictionStatus: 'Convicted in District Court',
    accusedCount: 4,
    evidenceTags: ['Bank Financial Audit', 'Seized Hard Drives', 'KPID Attachment Order'],
    confidentialForensicBrief: 'No physical GPU hardware existed; website dashboard generated mock hash rate outputs via Javascript animation.',
    isRestrictedClassified: true
  },
  {
    id: 'CASE-2026-TN-6781',
    firNumber: 'FIR/0094/2026/CHN-CYBER',
    maskedFirNumber: 'FIR/0094/2026/CHN-***',
    stateId: 'tamil-nadu',
    stateName: 'Tamil Nadu',
    districtId: 'chennai',
    districtName: 'Chennai Metropolitan',
    policeStation: 'Cyber Crime Wing, Vepery, Chennai',
    investigatingOfficer: 'DSP Anandhan K.',
    officerBadge: 'TN-POL-3910',
    category: 'Cybercrime & Online Fraud',
    title: 'Aadhaar Biometric AePS Unauthorized Cash Withdrawal Ring Dismantled',
    incidentDate: '2026-02-14',
    solvedDate: '2026-03-22',
    archivedDate: '2026-04-05',
    summary: 'Scammers extracted silicon polymer finger molds from public registry sale deeds to fraudulently trigger AePS rural micro-ATM withdrawals.',
    policeActionTaken: 'Tamil Nadu Cyber Cell cross-referenced biometric failure spikes with Common Service Centers (CSC) in 3 districts, arresting 6 operators.',
    recoveryDetails: '₹62 Lakhs seized in cash and returned to 142 affected rural farmers and pensioners.',
    convictionStatus: 'Chargesheet Filed - Fast Track Court',
    accusedCount: 6,
    evidenceTags: ['Biometric Silicon Molds', 'Micro-ATM POS Devices', 'Registry Copy Records'],
    confidentialForensicBrief: 'UIDAI updated face-authentication multi-factor protocol across all regional banking points post this investigation.',
    isRestrictedClassified: false
  },
  {
    id: 'CASE-2026-UP-4921',
    firNumber: 'FIR/0211/2026/LKO-GOMTI',
    maskedFirNumber: 'FIR/0211/2026/LKO-***',
    stateId: 'uttar-pradesh',
    stateName: 'Uttar Pradesh',
    districtId: 'lucknow',
    districtName: 'Lucknow Police Commissionerate',
    policeStation: 'Gomti Nagar Police Station, Lucknow',
    investigatingOfficer: 'ACP Shalini Singh',
    officerBadge: 'UP-POL-7729',
    category: 'Women & Child Safety',
    title: 'Swift 1090 Emergency Drone Escort & Stalking Ring Neutralized',
    incidentDate: '2026-05-19',
    solvedDate: '2026-05-24',
    archivedDate: '2026-06-01',
    summary: 'A group harassing women evening healthcare workers near Shaheed Path was apprehended within 48 hours following live 112 SOS drone surveillance.',
    policeActionTaken: 'Patrol cars coordinated with live video feeds from smart traffic towers. 3 suspects arrested on the spot under Bharatiya Nyaya Sanhita (BNS).',
    recoveryDetails: 'Unlawful motorcycles seized; permanent women safety beat post established in the hospital corridor.',
    convictionStatus: 'Convicted in District Court',
    accusedCount: 3,
    evidenceTags: ['Smart City CCTV Footage', 'Call Records', 'BNS Section 78/79 Chargesheet'],
    confidentialForensicBrief: 'Case closed with zero recurrence in the sector over subsequent 90 days.',
    isRestrictedClassified: false
  },
  {
    id: 'CASE-2026-TG-5520',
    firNumber: 'FIR/0147/2026/CYB-MADHAPUR',
    maskedFirNumber: 'FIR/0147/2026/CYB-***',
    stateId: 'telangana',
    stateName: 'Telangana',
    districtId: 'hyderabad',
    districtName: 'Hyderabad (Cyberabad & Rachakonda)',
    policeStation: 'Madhapur Police Station, Cyberabad',
    investigatingOfficer: 'ACP R. Venkateshwarlu',
    officerBadge: 'TG-POL-9920',
    category: 'Narcotics & NDPS',
    title: 'Darknet Hydroponic Weed & Synthetic MDMA International Courier Intercepted',
    incidentDate: '2026-01-10',
    solvedDate: '2026-02-18',
    archivedDate: '2026-03-02',
    summary: 'Consignment packaged inside commercial coffee maker machines routed from Europe seized at international air cargo.',
    policeActionTaken: 'Telangana Anti-Narcotics Bureau (TGANB) conducted controlled delivery operation to trace receiving buyers in financial district.',
    recoveryDetails: '4.2 kg high-grade hydroponic cannabis & 850 grams MDMA worth ₹3.5 Crores incinerated per court destruction orders.',
    convictionStatus: 'Convicted in District Court',
    accusedCount: 4,
    evidenceTags: ['Narcotics Test Kit Verification', 'Customs Parcel Scans', 'Encrypted Chat Backups'],
    confidentialForensicBrief: 'Linked to international illicit vendor handle on Tor network. Coordination report filed with Interpol & NCB.',
    isRestrictedClassified: true
  }
];

export const LIVE_SAFETY_ALERTS: LiveSafetyAlert[] = [
  {
    id: 'ALERT-BR-01',
    title: 'Bihar Police & Banka District Advisory: Fraudulent KCC Loan & DBT Subsidy Calls',
    description: 'Cyber fraudsters targeting farmers and citizens across Banka, Bhagalpur & Munger with fake Kisan Credit Card subsidy approvals requiring screen-sharing apps. Report suspicious calls to 1930 / 112 immediately.',
    severity: 'Critical',
    stateId: 'bihar',
    districtId: 'banka',
    locationName: 'Banka, Bhagalpur & Munger (Bihar)',
    issuedBy: 'Bihar Police Cyber Crime Wing & Banka SP Office',
    timestamp: '10 mins ago',
    expiresAt: 'Active Advisory for next 72 hours',
    category: 'Cybercrime & Online Fraud',
    activeHelpline: '1930 (National Cybercrime) / 06424-222233',
    isPinned: false
  },
  {
    id: 'ALERT-BR-02',
    title: 'Patna Traffic Police Advisory: Bailey Road & Dak Bungalow Junction Diversion',
    description: 'Emergency smart city metro utility upgrade on Bailey Road stretch. Heavy vehicles diverted via Digha-AIIMS elevated corridor. Commuters advised to plan peak hour travel accordingly.',
    severity: 'Warning',
    stateId: 'bihar',
    districtId: 'patna',
    locationName: 'Bailey Road Corridor, Patna',
    issuedBy: 'Patna Traffic Police Control Room',
    timestamp: '35 mins ago',
    expiresAt: 'Valid till 23:00 IST',
    category: 'Traffic Hazard',
    activeHelpline: '0612-2201977 / 112',
    isPinned: false
  },
  {
    id: 'ALERT-01',
    title: 'Delhi NCR Cyber Cell Red Advisory: Fraudulent Traffic Challan APK Messages',
    description: 'Spam SMS claiming "Pending e-Challan payment for vehicle DL-XX" with link to malicious .apk file stealing SMS OTPs. Do NOT install unknown APK files. Use only echallan.parivahan.gov.in.',
    severity: 'Critical',
    stateId: 'delhi-ncr',
    districtId: 'new-delhi',
    locationName: 'Delhi NCR, Noida, Gurugram',
    issuedBy: 'Delhi Police Cyber Cell & CERT-In',
    timestamp: '22 mins ago',
    expiresAt: 'Active for next 48 hours',
    category: 'Cybercrime & Online Fraud',
    activeHelpline: '1930 (National Cybercrime)',
    isPinned: false
  },
  {
    id: 'ALERT-02',
    title: 'Bengaluru Traffic & Waterlogging Advisory: Outer Ring Road & Bellandur Diverted',
    description: 'Heavy monsoon downpour causing 2-feet waterlogging near Ecospace and Silk Board. Traffic police deploying emergency sump pumps. Commuters advised to use Metro or Bannerghatta alternative routes.',
    severity: 'Warning',
    stateId: 'karnataka',
    districtId: 'bengaluru-urban',
    locationName: 'Outer Ring Road, Bengaluru',
    issuedBy: 'Bengaluru Traffic Police (BTP)',
    timestamp: '45 mins ago',
    expiresAt: 'Expected clearance by 23:30 IST',
    category: 'Traffic Hazard',
    activeHelpline: '080-22942222 / 1073',
    isPinned: true
  },
  {
    id: 'ALERT-03',
    title: 'Mumbai Coastal Security: High Tide Alert & Enhanced Night Marine Patrol',
    description: '4.45m high tide alert coupled with squally winds. Citizens advised to avoid venturing near promenade rocks at Marine Drive, Bandra Bandstand and Juhu Beach. Coastal beat squads stationed.',
    severity: 'Advisory',
    stateId: 'maharashtra',
    districtId: 'mumbai-city',
    locationName: 'South & Western Coastline, Mumbai',
    issuedBy: 'Mumbai Police & BMC Disaster Management',
    timestamp: '1 hour ago',
    expiresAt: 'Valid until 04:00 AM IST',
    category: 'Disaster',
    activeHelpline: '1916 (Disaster Cell) / 112',
    isPinned: false
  },
  {
    id: 'ALERT-04',
    title: 'Hyderabad IT Corridor: Women Commuter Late Night "She Teams" Escort Live',
    description: 'Cyberabad Police She Teams have deployed 24/7 dedicated mobile patrol vans across Gachibowli, Hitec City, and Madhapur for women IT personnel commuting between 9 PM and 6 AM.',
    severity: 'Advisory',
    stateId: 'telangana',
    districtId: 'hyderabad',
    locationName: 'Financial District & Raidurgam, Hyderabad',
    issuedBy: 'Cyberabad Police Commissionerate',
    timestamp: '2 hours ago',
    expiresAt: 'Continuous 24x7 Protocol',
    category: 'Women & Child Safety',
    activeHelpline: 'She Teams WhatsApp: 9490616555 / 112',
    isPinned: false
  },
  {
    id: 'ALERT-05',
    title: 'Kolkata Cyber Alert: Fake Electricity Disconnection Warning Calls Circulating',
    description: 'Frauds impersonating CESC / WBSEDCL threatening immediate power cut unless a test ₹10 payment is made via remote sharing app (AnyDesk/TeamViewer). State utility never makes such calls.',
    severity: 'Warning',
    stateId: 'west-bengal',
    districtId: 'kolkata',
    locationName: 'Kolkata Metropolitan & Salt Lake',
    issuedBy: 'Kolkata Police Cyber Wing',
    timestamp: '3 hours ago',
    expiresAt: 'Active Advisory',
    category: 'Cybercrime & Online Fraud',
    activeHelpline: '1930 / 033-22143024',
    isPinned: false
  }
];

export const ARCHIVED_CASES_DATA = SOLVED_ARCHIVED_CASES;

export interface TimeframeMetricsConfig {
  multiplier: number;
  verificationRatio: number;
  solveRatio: number;
  archiveRatio: number;
  yoyTrend: number;
  yoyLabel: string;
  isDeclinePositive: boolean;
  periodName: string;
  comparisonWindow: string;
  lawFramework: string;
  chargesheetSpeed: string;
}

export const TIMEFRAME_CONFIGS: Record<TimeRangeKey, TimeframeMetricsConfig> = {
  today: {
    multiplier: 0.0032,
    verificationRatio: 0.968, // 96.8% verified in instant e-FIR triage
    solveRatio: 0.742,
    archiveRatio: 0.695,
    yoyTrend: -1.8,
    yoyLabel: '-1.8% vs Daily Avg',
    isDeclinePositive: true,
    periodName: 'Live Daily Telemetry (Past 24 Hours)',
    comparisonWindow: 'vs 30-day baseline average',
    lawFramework: 'Live 112 & e-FIR Stream',
    chargesheetSpeed: 'Instant Dispatch'
  },
  '7d': {
    multiplier: 0.0215,
    verificationRatio: 0.956, // 95.6%
    solveRatio: 0.898,
    archiveRatio: 0.872,
    yoyTrend: -4.1,
    yoyLabel: '-4.1% WoW',
    isDeclinePositive: true,
    periodName: 'Rolling 7-Day Safety Summary',
    comparisonWindow: 'vs previous 7-day period',
    lawFramework: 'BNSS Fast-Track FIRs',
    chargesheetSpeed: 'Avg 9 Days'
  },
  '30d': {
    multiplier: 0.088,
    verificationRatio: 0.948, // 94.8%
    solveRatio: 0.892,
    archiveRatio: 0.868,
    yoyTrend: -2.9,
    yoyLabel: '-2.9% MoM',
    isDeclinePositive: true,
    periodName: 'Rolling 30-Day Intelligence Window',
    comparisonWindow: 'vs preceding 30-day period',
    lawFramework: 'BNSS Digital Police Grid',
    chargesheetSpeed: 'Avg 12 Days'
  },
  ytd: {
    multiplier: 0.65,
    verificationRatio: 0.938, // 93.8% verified (2026 YTD)
    solveRatio: 0.884,
    archiveRatio: 0.862,
    yoyTrend: -3.8,
    yoyLabel: '-3.8% YoY',
    isDeclinePositive: true,
    periodName: 'Year 2026 (YTD 8-Month Telemetry)',
    comparisonWindow: 'vs 2025 Jan-Aug Baseline',
    lawFramework: 'Bharatiya Nagarik Suraksha Sanhita (BNSS)',
    chargesheetSpeed: 'Avg 14 Days'
  },
  '2025': {
    multiplier: 1.038,        // Full year 2025 archive
    verificationRatio: 0.914, // 91.4% verified (2025 Transition year)
    solveRatio: 0.846,
    archiveRatio: 0.831,
    yoyTrend: -1.4,
    yoyLabel: '-1.4% YoY',
    isDeclinePositive: true,
    periodName: 'Year 2025 (Full Annual Archive)',
    comparisonWindow: 'vs 2024 Full Year Official NCRB',
    lawFramework: 'BNS / BNSS Nationwide Transition',
    chargesheetSpeed: 'Avg 18 Days'
  },
  '2024': {
    multiplier: 1.077,        // Full year 2024 archive
    verificationRatio: 0.879, // 87.9% verified (2024 Pre-BNS legacy)
    solveRatio: 0.792,
    archiveRatio: 0.765,
    yoyTrend: 4.2,            // +4.2% YoY rise
    yoyLabel: '+4.2% YoY',
    isDeclinePositive: false,
    periodName: 'Year 2024 (Full Annual Archive)',
    comparisonWindow: 'vs 2023 Full Year Historical NCRB',
    lawFramework: 'Legacy CrPC & IPC Framework',
    chargesheetSpeed: 'Avg 24 Days'
  },
  custom: {
    multiplier: 0.15,
    verificationRatio: 0.932,
    solveRatio: 0.865,
    archiveRatio: 0.840,
    yoyTrend: -2.5,
    yoyLabel: '-2.5% YoY',
    isDeclinePositive: true,
    periodName: 'Custom Historical Interval',
    comparisonWindow: 'vs parallel preceding interval',
    lawFramework: 'BNS & State Telemetry Mesh',
    chargesheetSpeed: 'Avg 15 Days'
  }
};

// Year/timeframe-specific category rate dynamics
const CATEGORY_TIME_METRICS: Record<string, Record<CrimeCategory, { yoyChange: number; verificationRatio: number; solveRatio: number; avgDays: number }>> = {
  ytd: {
    'Cybercrime & Online Fraud': { yoyChange: 18.4, verificationRatio: 0.940, solveRatio: 0.863, avgDays: 14 },
    'Theft & Burglary': { yoyChange: -6.2, verificationRatio: 0.932, solveRatio: 0.875, avgDays: 19 },
    'Women & Child Safety': { yoyChange: -4.8, verificationRatio: 0.957, solveRatio: 0.916, avgDays: 9 },
    'Financial & Corporate Fraud': { yoyChange: 12.1, verificationRatio: 0.944, solveRatio: 0.838, avgDays: 45 },
    'Traffic & Hit-and-Run': { yoyChange: -2.3, verificationRatio: 0.938, solveRatio: 0.928, avgDays: 6 },
    'Violent Offenses': { yoyChange: -8.7, verificationRatio: 0.949, solveRatio: 0.899, avgDays: 24 },
    'Narcotics & NDPS': { yoyChange: 22.5, verificationRatio: 0.946, solveRatio: 0.893, avgDays: 32 },
    'Public Order & Nuisance': { yoyChange: -11.2, verificationRatio: 0.922, solveRatio: 0.950, avgDays: 4 }
  },
  '2025': {
    'Cybercrime & Online Fraud': { yoyChange: 26.8, verificationRatio: 0.915, solveRatio: 0.829, avgDays: 21 },
    'Theft & Burglary': { yoyChange: -3.4, verificationRatio: 0.921, solveRatio: 0.847, avgDays: 23 },
    'Women & Child Safety': { yoyChange: -2.1, verificationRatio: 0.938, solveRatio: 0.888, avgDays: 12 },
    'Financial & Corporate Fraud': { yoyChange: 19.4, verificationRatio: 0.916, solveRatio: 0.820, avgDays: 52 },
    'Traffic & Hit-and-Run': { yoyChange: 1.8, verificationRatio: 0.920, solveRatio: 0.892, avgDays: 8 },
    'Violent Offenses': { yoyChange: -4.5, verificationRatio: 0.934, solveRatio: 0.876, avgDays: 28 },
    'Narcotics & NDPS': { yoyChange: 15.2, verificationRatio: 0.932, solveRatio: 0.872, avgDays: 38 },
    'Public Order & Nuisance': { yoyChange: -5.6, verificationRatio: 0.912, solveRatio: 0.922, avgDays: 5 }
  },
  '2024': {
    'Cybercrime & Online Fraud': { yoyChange: 34.5, verificationRatio: 0.877, solveRatio: 0.764, avgDays: 29 },
    'Theft & Burglary': { yoyChange: 5.2, verificationRatio: 0.907, solveRatio: 0.815, avgDays: 28 },
    'Women & Child Safety': { yoyChange: 3.6, verificationRatio: 0.910, solveRatio: 0.856, avgDays: 16 },
    'Financial & Corporate Fraud': { yoyChange: 24.0, verificationRatio: 0.896, solveRatio: 0.784, avgDays: 61 },
    'Traffic & Hit-and-Run': { yoyChange: 4.1, verificationRatio: 0.901, solveRatio: 0.878, avgDays: 10 },
    'Violent Offenses': { yoyChange: 1.2, verificationRatio: 0.922, solveRatio: 0.851, avgDays: 34 },
    'Narcotics & NDPS': { yoyChange: 8.9, verificationRatio: 0.908, solveRatio: 0.849, avgDays: 45 },
    'Public Order & Nuisance': { yoyChange: 7.4, verificationRatio: 0.893, solveRatio: 0.876, avgDays: 7 }
  },
  '30d': {
    'Cybercrime & Online Fraud': { yoyChange: 14.2, verificationRatio: 0.952, solveRatio: 0.878, avgDays: 11 },
    'Theft & Burglary': { yoyChange: -5.8, verificationRatio: 0.941, solveRatio: 0.884, avgDays: 16 },
    'Women & Child Safety': { yoyChange: -6.1, verificationRatio: 0.965, solveRatio: 0.932, avgDays: 7 },
    'Financial & Corporate Fraud': { yoyChange: 9.5, verificationRatio: 0.950, solveRatio: 0.852, avgDays: 39 },
    'Traffic & Hit-and-Run': { yoyChange: -3.2, verificationRatio: 0.948, solveRatio: 0.938, avgDays: 5 },
    'Violent Offenses': { yoyChange: -9.4, verificationRatio: 0.958, solveRatio: 0.912, avgDays: 20 },
    'Narcotics & NDPS': { yoyChange: 18.0, verificationRatio: 0.951, solveRatio: 0.905, avgDays: 28 },
    'Public Order & Nuisance': { yoyChange: -12.8, verificationRatio: 0.935, solveRatio: 0.960, avgDays: 3 }
  },
  '7d': {
    'Cybercrime & Online Fraud': { yoyChange: 11.5, verificationRatio: 0.960, solveRatio: 0.890, avgDays: 9 },
    'Theft & Burglary': { yoyChange: -7.4, verificationRatio: 0.952, solveRatio: 0.894, avgDays: 14 },
    'Women & Child Safety': { yoyChange: -8.2, verificationRatio: 0.972, solveRatio: 0.945, avgDays: 5 },
    'Financial & Corporate Fraud': { yoyChange: 7.8, verificationRatio: 0.958, solveRatio: 0.865, avgDays: 34 },
    'Traffic & Hit-and-Run': { yoyChange: -4.5, verificationRatio: 0.956, solveRatio: 0.946, avgDays: 4 },
    'Violent Offenses': { yoyChange: -10.1, verificationRatio: 0.964, solveRatio: 0.925, avgDays: 17 },
    'Narcotics & NDPS': { yoyChange: 16.3, verificationRatio: 0.959, solveRatio: 0.918, avgDays: 24 },
    'Public Order & Nuisance': { yoyChange: -14.0, verificationRatio: 0.948, solveRatio: 0.970, avgDays: 2 }
  },
  today: {
    'Cybercrime & Online Fraud': { yoyChange: 8.2, verificationRatio: 0.972, solveRatio: 0.760, avgDays: 8 },
    'Theft & Burglary': { yoyChange: -4.1, verificationRatio: 0.965, solveRatio: 0.745, avgDays: 12 },
    'Women & Child Safety': { yoyChange: -5.0, verificationRatio: 0.985, solveRatio: 0.820, avgDays: 3 },
    'Financial & Corporate Fraud': { yoyChange: 6.2, verificationRatio: 0.968, solveRatio: 0.710, avgDays: 30 },
    'Traffic & Hit-and-Run': { yoyChange: -2.8, verificationRatio: 0.970, solveRatio: 0.840, avgDays: 3 },
    'Violent Offenses': { yoyChange: -7.5, verificationRatio: 0.978, solveRatio: 0.790, avgDays: 14 },
    'Narcotics & NDPS': { yoyChange: 12.0, verificationRatio: 0.970, solveRatio: 0.750, avgDays: 20 },
    'Public Order & Nuisance': { yoyChange: -9.1, verificationRatio: 0.960, solveRatio: 0.880, avgDays: 2 }
  }
};

// Helper to scale metrics dynamically based on selected TimeRangeKey
export const getTimeMultiplier = (
  timeKey: TimeRangeKey | string,
  customStartDate?: string,
  customEndDate?: string
): number => {
  if (timeKey === 'custom' && customStartDate && customEndDate) {
    try {
      const s = new Date(customStartDate).getTime();
      const e = new Date(customEndDate).getTime();
      if (!isNaN(s) && !isNaN(e) && e >= s) {
        const days = Math.max(1, Math.round((e - s) / (1000 * 60 * 60 * 24)));
        return Math.min(2.5, Math.max(0.003, (days / 365) * 0.98));
      }
    } catch {
      // fallback
    }
  }

  const cfg = TIMEFRAME_CONFIGS[timeKey as TimeRangeKey];
  return cfg ? cfg.multiplier : 0.65;
};

// Get full dynamic timeframe metrics package for KPI cards
export const getTimeframeMetricsConfig = (
  timeKey: TimeRangeKey | string,
  customStartDate?: string,
  customEndDate?: string
): TimeframeMetricsConfig => {
  if (timeKey === 'custom' && customStartDate && customEndDate) {
    const mult = getTimeMultiplier('custom', customStartDate, customEndDate);
    // Interpolate year context if custom dates specify a particular year
    const yearStart = customStartDate.slice(0, 4);
    if (yearStart === '2024') {
      return {
        ...TIMEFRAME_CONFIGS['2024'],
        multiplier: mult,
        periodName: `Custom Period in 2024 (${customStartDate} to ${customEndDate})`
      };
    } else if (yearStart === '2025') {
      return {
        ...TIMEFRAME_CONFIGS['2025'],
        multiplier: mult,
        periodName: `Custom Period in 2025 (${customStartDate} to ${customEndDate})`
      };
    }
    return {
      ...TIMEFRAME_CONFIGS.custom,
      multiplier: mult,
      periodName: `Custom Period (${customStartDate} to ${customEndDate})`
    };
  }

  return TIMEFRAME_CONFIGS[timeKey as TimeRangeKey] || TIMEFRAME_CONFIGS.ytd;
};

// Get dynamically calculated Category Statistics for the selected timeframe & location
export const getCategoryStatsForTimeframe = (
  timeKey: TimeRangeKey | string,
  customStartDate?: string,
  customEndDate?: string,
  selectedState?: StateInfo | null,
  selectedDistrict?: DistrictInfo | null
): CrimeCategoryStat[] => {
  const config = getTimeframeMetricsConfig(timeKey, customStartDate, customEndDate);
  const metricsMap = CATEGORY_TIME_METRICS[timeKey] || CATEGORY_TIME_METRICS.ytd;

  // Base reported scale factor for location relative to national baseline (368,400)
  let locationFactor = 1.0;
  if (selectedDistrict) {
    locationFactor = selectedDistrict.reportedCrimes / 368400;
  } else if (selectedState) {
    locationFactor = selectedState.reportedCrimes / 368400;
  }

  return CRIME_CATEGORIES_DATA.map((cat) => {
    const dyn = metricsMap[cat.category] || {
      yoyChange: cat.yoyChange,
      verificationRatio: config.verificationRatio,
      solveRatio: config.solveRatio,
      avgDays: cat.averageResolutionDays
    };

    const baseReported = Math.max(1, Math.round(cat.reported * locationFactor));
    const reported = Math.max(1, Math.round(baseReported * config.multiplier));
    const verified = Math.max(1, Math.round(reported * dyn.verificationRatio));
    const solved = Math.max(1, Math.round(verified * dyn.solveRatio));
    const archived = Math.max(1, Math.round(solved * config.archiveRatio));

    return {
      ...cat,
      reported,
      verified,
      solved,
      archived,
      yoyChange: dyn.yoyChange,
      averageResolutionDays: dyn.avgDays
    };
  });
};
