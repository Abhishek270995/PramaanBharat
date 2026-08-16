import React, { useState } from 'react';
import { 
  ShieldCheck, 
  X, 
  ExternalLink, 
  CheckCircle2, 
  Building2, 
  Calendar, 
  Languages, 
  Search, 
  Filter,
  Award,
  Scale,
  Newspaper,
  TrendingUp,
  Globe
} from 'lucide-react';
import { VERIFIED_SOURCES_CATALOG } from '../data/verifiedSources';
import { SourceTier, VerifiedSourceInfo } from '../types';

interface VerifiedSourcesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSourceFilter?: (sourceName: string) => void;
}

export const VerifiedSourcesModal: React.FC<VerifiedSourcesModalProps> = ({
  isOpen,
  onClose,
  onSelectSourceFilter
}) => {
  const [selectedTier, setSelectedTier] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!isOpen) return null;

  const tiers: { id: string; label: string; icon: React.ReactNode }[] = [
    { id: 'All', label: 'All Verified Sources', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
    { id: 'Official Statutory & Wire', label: 'Statutory & Wire', icon: <Award className="w-3.5 h-3.5 text-emerald-600" /> },
    { id: 'Legal & Judicial Desk', label: 'Legal & Judiciary', icon: <Scale className="w-3.5 h-3.5 text-amber-600" /> },
    { id: 'IFCN Certified Fact-Check', label: 'Fact-Check Desks', icon: <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" /> },
    { id: 'National Broadsheet', label: 'National Broadsheets', icon: <Newspaper className="w-3.5 h-3.5 text-blue-600" /> },
    { id: 'Business & Economy Desk', label: 'Business & Economy', icon: <TrendingUp className="w-3.5 h-3.5 text-indigo-600" /> },
    { id: 'Regional Language Broadsheet', label: 'Regional Language', icon: <Languages className="w-3.5 h-3.5 text-rose-600" /> },
    { id: 'International Bureau', label: 'International Wires', icon: <Globe className="w-3.5 h-3.5 text-cyan-600" /> }
  ];

  const filteredSources = VERIFIED_SOURCES_CATALOG.filter(source => {
    const matchesTier = selectedTier === 'All' || source.tier === selectedTier;
    const matchesSearch = searchQuery === '' || 
      source.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      source.shortName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      source.accreditation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      source.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTier && matchesSearch;
  });

  return (
    <div 
      id="verified-sources-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5"
    >
      <div 
        id="verified-sources-modal-container"
        className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col animate-in zoom-in-95 overflow-hidden"
      >
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50/80 flex items-start justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Verified Indian News Ecosystem</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-200">
                  {VERIFIED_SOURCES_CATALOG.length} Accredited Outlets
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Statutory registries, IFCN-certified fact-checkers, Supreme Court press desks, and PCI-accredited broadsheets.
              </p>
            </div>
          </div>

          <button
            id="close-verified-sources-modal"
            onClick={onClose}
            className="p-2 rounded-full bg-white hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors border border-slate-200 cursor-pointer shrink-0"
            title="Close directory"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Tier Filter Bar */}
        <div className="p-4 border-b border-slate-100 bg-white space-y-3 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by source name, accreditation body, or focus area..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Tier Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 text-xs">
            {tiers.map(t => (
              <button
                key={t.id}
                onClick={() => setSelectedTier(t.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl whitespace-nowrap transition-all text-xs font-semibold cursor-pointer ${
                  selectedTier === t.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {t.icon}
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Sources Grid Container */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSources.map((source) => (
              <div 
                key={source.id}
                id={`source-card-${source.id}`}
                className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: Name & Tier Badge */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                        <span>{source.name}</span>
                        {source.isGovernmentOfficial && (
                          <span className="px-1.5 py-0.2 bg-emerald-50 text-emerald-700 text-[10px] font-extrabold rounded-md border border-emerald-200">
                            Govt Official
                          </span>
                        )}
                        {source.isFactCheckSpecialist && (
                          <span className="px-1.5 py-0.2 bg-purple-50 text-purple-700 text-[10px] font-extrabold rounded-md border border-purple-200">
                            IFCN Certified
                          </span>
                        )}
                        {source.isLegalSpecialist && (
                          <span className="px-1.5 py-0.2 bg-amber-50 text-amber-800 text-[10px] font-extrabold rounded-md border border-amber-200">
                            Judicial Desk
                          </span>
                        )}
                      </h4>
                      <span className="text-[11px] font-semibold text-blue-600">
                        {source.tier}
                      </span>
                    </div>

                    <span className="text-[11px] font-mono font-bold text-slate-400 px-2 py-0.5 bg-slate-100 rounded-md">
                      Est. {source.established}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 leading-relaxed mb-3">
                    {source.description}
                  </p>

                  {/* Metadata Chips */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span className="font-medium text-slate-700">Accreditation:</span>
                      <span className="truncate text-slate-600">{source.accreditation}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>HQ: {source.headquarters}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Languages className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[140px]">{source.language}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100">
                  <a
                    href={`https://${source.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-blue-600 transition-colors"
                  >
                    <span>{source.website}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  {onSelectSourceFilter && (
                    <button
                      onClick={() => {
                        onSelectSourceFilter(source.name);
                        onClose();
                      }}
                      className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold transition-colors cursor-pointer"
                    >
                      Filter Feed by Source →
                    </button>
                  )}
                </div>

              </div>
            ))}
          </div>

          {filteredSources.length === 0 && (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <ShieldCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No verified sources found matching "{searchQuery}"</p>
              <p className="text-xs text-slate-400 mt-1">Try searching for other accredited publishers or reset filters.</p>
            </div>
          )}
        </div>

        {/* Modal Footer / Fact-Checking Standards */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>All sources adhere to Press Council of India standards or IFCN Code of Principles.</span>
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
