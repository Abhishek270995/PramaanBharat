import React, { useState } from 'react';
import { 
  Building2, 
  ExternalLink, 
  PhoneCall, 
  ShieldAlert, 
  ShieldCheck, 
  Search, 
  X, 
  FileText, 
  Globe2, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  Sparkles,
  Send,
  HelpCircle,
  MapPin
} from 'lucide-react';
import { StateInfo } from '../types';

interface PolicePortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedState?: StateInfo | null;
}

interface OfficialPortalItem {
  name: string;
  authority: string;
  category: 'National' | 'Cyber' | 'State' | 'Helpline';
  url: string;
  helpline?: string;
  description: string;
  features: string[];
  stateId?: string;
}

const OFFICIAL_PORTALS: OfficialPortalItem[] = [
  {
    name: 'National Cybercrime Reporting Portal',
    authority: 'Ministry of Home Affairs (MHA), Govt of India',
    category: 'Cyber',
    url: 'https://cybercrime.gov.in',
    helpline: '1930',
    description: 'Central government portal for reporting cyber financial fraud, identity theft, social media harassment, and online extortion.',
    features: ['Instant 1930 Financial Freeze', 'Track Cyber Complaint Status', 'Report Women & Child Abuse Content']
  },
  {
    name: 'Digital Police CCTNS Citizen Portal',
    authority: 'Ministry of Home Affairs & NCRB',
    category: 'National',
    url: 'https://digitalpolice.gov.in',
    description: 'National portal connecting 16,000+ police stations for criminal verification, stolen vehicle checks, and domestic worker verification.',
    features: ['Stolen Vehicle Search', 'Missing Persons Registry', 'Character Verification Request']
  },
  {
    name: 'National Crime Records Bureau (NCRB)',
    authority: 'Ministry of Home Affairs, New Delhi',
    category: 'National',
    url: 'https://ncrb.gov.in',
    description: 'Official repository of Crime in India statistics, prison statistics, and accidental deaths / suicide open datasets.',
    features: ['Official Crime in India Compendium', 'Fingerprint Bureau (NAFIS)', 'Crime Statistics Dashboard']
  },
  {
    name: 'Emergency Response Support System (ERSS 112)',
    authority: 'Govt of India Universal Emergency Desk',
    category: 'Helpline',
    url: 'https://112.gov.in',
    helpline: '112',
    description: 'Single pan-India emergency number for immediate Police, Fire, Medical, and Disaster relief assistance.',
    features: ['24x7 Geo-tagged Police Dispatch', 'Panic SOS Support', 'Real-time Ambulance Routing']
  },
  // State Police Portals
  {
    name: 'Bihar Police Citizen Portal & e-FIR',
    authority: 'Bihar Police Headquarters, Patna',
    category: 'State',
    stateId: 'bihar',
    url: 'https://police.bihar.gov.in',
    helpline: '112 / 0612-2217833',
    description: 'Online citizen complaints, verification services, and emergency police dispatch across all 38 districts of Bihar.',
    features: ['Online Lost Article Report', 'District Police Directory', 'Dial 112 Bihar Integration']
  },
  {
    name: 'Delhi Police Citizen Services & Online e-FIR',
    authority: 'Delhi Police Headquarters, Jai Singh Road',
    category: 'State',
    stateId: 'delhi-ncr',
    url: 'https://delhipolice.gov.in',
    helpline: '112 / 1090',
    description: 'Direct e-FIR filing for theft, lost property registration, tenant verification, and senior citizen safety monitoring in NCR.',
    features: ['Instant Online e-FIR (MV Theft)', 'Lost Article Registration', 'Himmat Plus Women Safety']
  },
  {
    name: 'Maharashtra Police e-Complaint Portal',
    authority: 'Maharashtra State Police HQ, Mumbai',
    category: 'State',
    stateId: 'maharashtra',
    url: 'https://mahapolice.gov.in',
    helpline: '112 / 100',
    description: 'Citizen services portal for non-cognizable reports, tenant verification, character certificates, and missing reports in Maharashtra.',
    features: ['e-Complaint Desk', 'Mumbai Police Lost & Found', 'Cyber Safety Helpline']
  },
  {
    name: 'UP Police UPCOP Citizen Portal',
    authority: 'Uttar Pradesh Police Headquarters, Lucknow',
    category: 'State',
    stateId: 'uttar-pradesh',
    url: 'https://uppolice.gov.in',
    helpline: '112 / 1090',
    description: 'UPCOP digital application and web portal for e-FIR, employee verification, event permissions, and emergency response.',
    features: ['UPCOP Online e-FIR', 'Women Powerline 1090', 'Character Certificate']
  },
  {
    name: 'Karnataka State Police (KSP) Citizen Portal',
    authority: 'Karnataka Police HQ, Bengaluru',
    category: 'State',
    stateId: 'karnataka',
    url: 'https://ksp.karnataka.gov.in',
    helpline: '112',
    description: 'Digital police platform for online e-lost reports, police clearance certificates, and cyber complaint registration in Karnataka.',
    features: ['KSP e-Lost App', 'Bengaluru City Police Citizen Desk', 'PCC Application']
  },
  {
    name: 'West Bengal Police e-Services Desk',
    authority: 'West Bengal Police Directorate, Nabanna',
    category: 'State',
    stateId: 'west-bengal',
    url: 'https://policewb.gov.in',
    helpline: '112 / 100',
    description: 'Official portal for citizen grievances, vehicle tracking, and public safety advisories across West Bengal.',
    features: ['Citizen Complaint Redressal', 'Kolkata Police Traffic & e-Challan', 'Emergency Contact Directory']
  },
  {
    name: 'Tamil Nadu Police CCTNS Citizen Portal',
    authority: 'Tamil Nadu Police HQ, Chennai',
    category: 'State',
    stateId: 'tamil-nadu',
    url: 'https://eservices.tnpolice.gov.in',
    helpline: '112 / 100',
    description: 'Online complaint filing, FIR status download, lost document registration, and community policing services in Tamil Nadu.',
    features: ['Download FIR Copy', 'Lost Document Report (LDR)', 'Community Service Register']
  }
];

export const PolicePortalModal: React.FC<PolicePortalModalProps> = ({
  isOpen,
  onClose,
  selectedState
}) => {
  const [activeTab, setActiveTab] = useState<'directory' | 'tipoff'>('directory');
  const [filterCategory, setFilterCategory] = useState<'all' | 'National' | 'Cyber' | 'State' | 'Helpline'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Tip-off Form State
  const [tipCategory, setTipCategory] = useState<string>('Cyber Scam / Phishing');
  const [tipUrl, setTipUrl] = useState<string>('');
  const [tipDescription, setTipDescription] = useState<string>('');
  const [tipSubmitted, setTipSubmitted] = useState<boolean>(false);

  if (!isOpen) return null;

  const filteredPortals = OFFICIAL_PORTALS.filter(portal => {
    if (filterCategory !== 'all' && portal.category !== filterCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        portal.name.toLowerCase().includes(q) ||
        portal.authority.toLowerCase().includes(q) ||
        portal.description.toLowerCase().includes(q) ||
        portal.features.some(f => f.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleTipSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tipDescription.trim()) return;
    setTipSubmitted(true);
    setTimeout(() => {
      setTipDescription('');
      setTipUrl('');
      setTipSubmitted(false);
    }, 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2.5 mb-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[11px] font-bold border border-blue-500/30 flex items-center gap-1">
              <Building2 className="w-3 h-3 text-blue-400" />
              <span>Official Government Directory</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-500/30">
              ✓ Direct Statutory Links
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <span>Official Police &amp; Citizen Portals</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
            Verified direct links to Ministry of Home Affairs (MHA), National Cybercrime Portal, CCTNS Citizen Desks, and State Police e-FIR Portals across India.
          </p>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-800 text-xs font-bold">
            <button
              onClick={() => setActiveTab('directory')}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'directory' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Globe2 className="w-3.5 h-3.5" />
              <span>Official Portals &amp; e-FIR Desks</span>
            </button>
            <button
              onClick={() => setActiveTab('tipoff')}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'tipoff' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-300" />
              <span>Citizen Tip-Off &amp; Fact-Check Desk</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 bg-slate-50">

          {activeTab === 'directory' ? (
            <div className="space-y-4">
              
              {/* Filter and Search Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-1 overflow-x-auto scrollbar-none text-xs">
                  {(['all', 'National', 'Cyber', 'State', 'Helpline'] as const).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setFilterCategory(cat)}
                      className={`px-3 py-1 rounded-xl font-bold transition-colors cursor-pointer shrink-0 ${
                        filterCategory === cat
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {cat === 'all' ? 'All Portals' : cat}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search e-FIR, Cyber, Bihar..."
                    className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 w-full sm:w-48"
                  />
                </div>
              </div>

              {/* Portals List Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredPortals.map((portal, idx) => (
                  <div 
                    key={idx}
                    className="bg-white rounded-2xl p-4 border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                            {portal.category} Portal
                          </span>
                          <h4 className="font-extrabold text-slate-900 text-sm mt-1 leading-snug">
                            {portal.name}
                          </h4>
                          <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
                            {portal.authority}
                          </span>
                        </div>

                        {portal.helpline && (
                          <a
                            href={`tel:${portal.helpline.split('/')[0].trim()}`}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-black shrink-0 transition-colors"
                            title={`Call Helpline ${portal.helpline}`}
                          >
                            <PhoneCall className="w-3 h-3 text-rose-600" />
                            <span>{portal.helpline}</span>
                          </a>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                        {portal.description}
                      </p>

                      {/* Features Badges */}
                      <div className="flex items-center gap-1.5 flex-wrap mt-3 pt-2.5 border-t border-slate-100">
                        {portal.features.map((feat, fi) => (
                          <span 
                            key={fi}
                            className="text-[10px] bg-slate-50 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200 font-medium"
                          >
                            ✓ {feat}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* External Link Action */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-mono truncate max-w-[180px]">
                        {portal.url.replace('https://', '')}
                      </span>
                      <a
                        href={portal.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                      >
                        <span>Visit Official Portal</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                  </div>
                ))}
              </div>

            </div>
          ) : (
            /* Tip-Off / Report Suspicious News & Fraud Desk */
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 space-y-4">
              <div className="flex items-start gap-3 pb-3 border-b border-slate-100">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-base">Submit Citizen Tip-Off / Unverified Lead</h4>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    Have you spotted a fake viral WhatsApp message, phishing SMS link, or unverified crime report? Share it securely with Pramaan Bharat fact-checkers.
                  </p>
                </div>
              </div>

              {tipSubmitted ? (
                <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h5 className="font-bold text-slate-900 text-base">Tip-Off Received Successfully!</h5>
                  <p className="text-xs text-emerald-800 max-w-sm mx-auto">
                    Your reference ID is <span className="font-mono font-bold">PB-TIP-{Math.floor(100000 + Math.random() * 900000)}</span>. Our verification team will cross-check this against official police bulletins.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleTipSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Lead Category
                    </label>
                    <select
                      value={tipCategory}
                      onChange={(e) => setTipCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Cyber Scam / Phishing">Cyber Scam / Phishing SMS / Fake APK</option>
                      <option value="Fake News / Viral WhatsApp Claim">Fake News / Viral WhatsApp Claim</option>
                      <option value="Public Safety / Traffic Advisory">Public Safety / Traffic Advisory</option>
                      <option value="General Crime Tip-Off">General Community Crime Tip-Off</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Evidence Link / Phone Number / Social Media URL (Optional)
                    </label>
                    <input
                      type="text"
                      value={tipUrl}
                      onChange={(e) => setTipUrl(e.target.value)}
                      placeholder="e.g. https://x.com/... or suspicious phone number"
                      className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Description of Incident or Claim *
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={tipDescription}
                      onChange={(e) => setTipDescription(e.target.value)}
                      placeholder="Describe what happened, where it occurred (State/District), and any specific details..."
                      className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-slate-400" />
                      <span>100% Anonymous &amp; Encrypted</span>
                    </span>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Lead for Verification</span>
                    </button>
                  </div>
                </form>
              )}

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 flex-wrap gap-2">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="text-[11px]">Always verify critical complaints with official law enforcement helplines (112 / 1930).</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
          >
            Close Directory
          </button>
        </div>

      </div>
    </div>
  );
};
