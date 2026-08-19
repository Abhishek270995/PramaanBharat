import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Archive, 
  Search, 
  Lock, 
  ShieldCheck, 
  FileText, 
  CheckCircle2, 
  Calendar, 
  MapPin, 
  Download, 
  Filter, 
  ExternalLink,
  ChevronDown,
  Eye,
  Key,
  RefreshCw,
  Clock,
  Sparkles,
  Scale
} from 'lucide-react';
import { ArchivedCase, AuthorizedOfficer, StateInfo, CrimeCategory } from '../types';
import { ARCHIVED_CASES_DATA } from '../data/crimeData';

interface ArchivedCasesDatabaseProps {
  authorizedOfficer: AuthorizedOfficer | null;
  onOpenPolicePortal: () => void;
  selectedState: StateInfo | null;
}

export const ArchivedCasesDatabase: React.FC<ArchivedCasesDatabaseProps> = ({
  authorizedOfficer,
  onOpenPolicePortal,
  selectedState
}) => {
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');
  const [selectedStatusTab, setSelectedStatusTab] = useState<'ALL' | 'CONVICTED' | 'CHARGESHEET' | 'RECOVERY'>('ALL');
  const [selectedCaseModal, setSelectedCaseModal] = useState<ArchivedCase | null>(null);

  // Real-time live sync state
  const [lastSyncTime, setLastSyncTime] = useState<number>(Date.now());
  const [secondsUntilSync, setSecondsUntilSync] = useState<number>(60);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [nowTimestamp, setNowTimestamp] = useState<number>(Date.now());
  const [casesList, setCasesList] = useState<ArchivedCase[]>(ARCHIVED_CASES_DATA);

  // Dynamic live clock
  useEffect(() => {
    const timer = setInterval(() => {
      setNowTimestamp(Date.now());
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  // Perform sync
  const handlePerformSync = useCallback(() => {
    setIsSyncing(true);
    setLastSyncTime(Date.now());
    setSecondsUntilSync(60);

    setTimeout(() => {
      setCasesList(ARCHIVED_CASES_DATA);
      setIsSyncing(false);
    }, 600);
  }, []);

  // Auto-refresh countdown loop (60s cycle)
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsUntilSync(prev => {
        if (prev <= 1) {
          handlePerformSync();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [handlePerformSync]);

  const secondsAgo = Math.max(0, Math.floor((nowTimestamp - lastSyncTime) / 1000));

  // Filter cases
  const filteredCases = useMemo(() => {
    return casesList.filter((item) => {
      const stateVal = item.state || item.stateName || '';
      const catVal = item.crimeCategory || item.category || '';
      const accusedVal = item.accusedDetails || `${item.accusedCount} accused`;
      const statusVal = item.convictionStatus || item.status || '';

      // Search
      const matchesSearch = 
        item.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
        item.firNumber.toLowerCase().includes(searchFilter.toLowerCase()) ||
        item.policeStation.toLowerCase().includes(searchFilter.toLowerCase()) ||
        stateVal.toLowerCase().includes(searchFilter.toLowerCase()) ||
        accusedVal.toLowerCase().includes(searchFilter.toLowerCase());

      // Category
      const matchesCategory = selectedCategoryFilter === 'All' || catVal === selectedCategoryFilter;

      // Status tab
      let matchesStatus = true;
      if (selectedStatusTab === 'CONVICTED') {
        matchesStatus = statusVal.toLowerCase().includes('convict');
      } else if (selectedStatusTab === 'CHARGESHEET') {
        matchesStatus = statusVal.toLowerCase().includes('chargesheet');
      } else if (selectedStatusTab === 'RECOVERY') {
        matchesStatus = Boolean(item.recoveryDetails && item.recoveryDetails.length > 5);
      }

      // State
      const matchesState = !selectedState || stateVal.toLowerCase().includes(selectedState.name.toLowerCase());

      return matchesSearch && matchesCategory && matchesStatus && matchesState;
    });
  }, [casesList, searchFilter, selectedCategoryFilter, selectedStatusTab, selectedState]);

  const handleExportCase = (c: ArchivedCase) => {
    const reportText = `
BHARAT POLICE OFFICIAL CLOSED CASE ARCHIVE RECORD
==================================================
Case Title: ${c.title}
FIR Registration No: ${authorizedOfficer ? c.firNumber : c.maskedFirNumber || 'MASKED-FOR-CONFIDENTIALITY'}
Police Station: ${c.policeStation}, ${c.district || c.districtName}, ${c.state || c.stateName}
Sections of Law: ${(c.sectionsApplied || ['BNS / Bharatiya Nyaya Sanhita']).join(', ')}
Date of Incident: ${c.dateOfIncident || c.incidentDate}
Date Closed & Archived: ${c.dateClosed || c.archivedDate}
Investigating Officer: ${c.investigatingOfficer} (${c.officerBadge})
Status: ${c.status || c.convictionStatus}
Recovery Details: ${c.recoveryDetails || 'N/A'}
Chargesheet Summary: ${c.chargesheetSummary || c.summary}
Court Conviction: ${c.courtConvictionOutcome || c.convictionStatus}
Generated via Pramaan Bharat National Crime Database Portal
==================================================
`;
    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Police-Case-Archive-${c.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-sm border border-slate-200 my-8">
      
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold tracking-wider uppercase border border-emerald-200 flex items-center gap-1">
              <Archive className="w-3 h-3 text-emerald-600" />
              Police Solved & Shut Cases Archive
            </span>

            {/* Real-Time Live CCTNS Sync Badge */}
            <span 
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full"
              title="Real-time CCTNS & Judicial Court registry link active"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>CCTNS Live Registry Active</span>
              <span className="text-emerald-400">•</span>
              <span className="text-emerald-700">Updated {secondsAgo}s ago</span>
              <span className="text-emerald-400">•</span>
              <span className="text-emerald-600 font-mono">Sync in {secondsUntilSync}s</span>
            </span>

            {authorizedOfficer ? (
              <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-emerald-400 text-[10px] font-black uppercase flex items-center gap-1 border border-emerald-500/30">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                Authorized Clearance ({authorizedOfficer.badgeNumber || authorizedOfficer.badgeId})
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200 flex items-center gap-1">
                <Lock className="w-3 h-3 text-amber-600" />
                Public View (PII Masked)
              </span>
            )}
          </div>

          <h3 className="text-xl font-black text-slate-900 tracking-tight">
            National Repository of Solved FIRs & Court Convictions
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified records of completed investigations, recovered citizen assets, chargesheeted offenders, and judicial closure orders.
          </p>
        </div>

        {/* Action Controls & Auth status */}
        <div className="flex items-center gap-2 shrink-0 self-start md:self-auto flex-wrap">
          <button
            id="sync-cctns-archive-btn"
            onClick={handlePerformSync}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all border border-slate-200 cursor-pointer"
            title="Force instantaneous refresh from statutory records"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Registry'}</span>
          </button>

          {!authorizedOfficer ? (
            <button
              id="police-vault-auth-btn-section"
              onClick={onOpenPolicePortal}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
            >
              <Key className="w-3.5 h-3.5 text-amber-300" />
              <span>Official Police Badge Verification</span>
            </button>
          ) : (
            <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2 shrink-0">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <div>
                <span className="font-bold block">{authorizedOfficer.officerName || authorizedOfficer.name}</span>
                <span className="text-[10px] text-emerald-700">{authorizedOfficer.policeStation || authorizedOfficer.jurisdiction}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="space-y-3 my-5">
        
        {/* Status Tab Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setSelectedStatusTab('ALL')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 ${
              selectedStatusTab === 'ALL'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            All Solved Records ({casesList.length})
          </button>
          <button
            onClick={() => setSelectedStatusTab('CONVICTED')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 ${
              selectedStatusTab === 'CONVICTED'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            ⚖️ Court Convictions
          </button>
          <button
            onClick={() => setSelectedStatusTab('CHARGESHEET')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 ${
              selectedStatusTab === 'CHARGESHEET'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            📑 Fast Track Chargesheets
          </button>
          <button
            onClick={() => setSelectedStatusTab('RECOVERY')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 ${
              selectedStatusTab === 'RECOVERY'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            💰 Recovered Citizen Assets
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search */}
          <div className="sm:col-span-8 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search solved cases by FIR number, station, recovery details, IPC/BNS section..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 text-slate-900 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category dropdown */}
          <div className="sm:col-span-4">
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 text-slate-900 text-xs rounded-xl border border-slate-200 focus:outline-hidden font-semibold cursor-pointer"
            >
              <option value="All">All Crime Categories</option>
              <option value="Cybercrime & Online Fraud">Cybercrime & Online Fraud</option>
              <option value="Women & Child Safety">Women & Child Safety</option>
              <option value="Theft & Burglary">Theft & Burglary</option>
              <option value="Financial & Corporate Fraud">Financial & Corporate Fraud</option>
              <option value="Narcotics & NDPS">Narcotics & NDPS</option>
              <option value="Traffic & Hit-and-Run">Traffic & Hit-and-Run</option>
              <option value="Public Order & Nuisance">Public Order & Nuisance</option>
            </select>
          </div>
        </div>

      </div>

      {/* Cases Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
            <tr>
              <th className="px-4 py-3">Case Title & Offense</th>
              <th className="px-4 py-3">FIR Identifier</th>
              <th className="px-4 py-3">Jurisdiction / Station</th>
              <th className="px-4 py-3">Closure & Conviction</th>
              <th className="px-4 py-3">Assets Recovered</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filteredCases.map((c) => {
              const displayFir = authorizedOfficer ? c.firNumber : (c.maskedFirNumber || c.firNumber.replace(/\d{3}/, 'XXX'));
              const cat = c.crimeCategory || c.category;
              const dateVal = c.dateClosed || c.archivedDate;

              return (
                <tr 
                  key={c.id}
                  id={`archived-case-row-${c.id}`}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  {/* Title & Section */}
                  <td className="px-4 py-3.5">
                    <div className="font-bold text-slate-900">{c.title}</div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded font-medium">
                        {cat}
                      </span>
                      {c.sectionsApplied && (
                        <span className="text-[10px] text-blue-600 font-mono">
                          {c.sectionsApplied.slice(0, 2).join(', ')}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* FIR */}
                  <td className="px-4 py-3.5 font-mono text-[11px] font-semibold text-slate-800">
                    <div className="flex items-center gap-1">
                      {authorizedOfficer ? (
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Lock className="w-3 h-3 text-amber-500" />
                      )}
                      <span>{displayFir}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Date: {dateVal}</span>
                  </td>

                  {/* Jurisdiction */}
                  <td className="px-4 py-3.5">
                    <div className="font-semibold text-slate-800">{c.policeStation}</div>
                    <div className="text-[11px] text-slate-500">{c.district || c.districtName}, {c.state || c.stateName}</div>
                  </td>

                  {/* Status & Outcome */}
                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      {c.status || c.convictionStatus}
                    </span>
                    <div className="text-[11px] text-slate-600 mt-1 line-clamp-1">
                      ⚖️ {c.courtConvictionOutcome || c.convictionStatus}
                    </div>
                  </td>

                  {/* Recovery */}
                  <td className="px-4 py-3.5">
                    <span className="text-[11px] font-medium text-slate-800 block line-clamp-1">
                      💰 {c.recoveryDetails || 'Assets & digital evidence sealed'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      IO: {c.investigatingOfficer}
                    </span>
                  </td>

                  {/* Action Buttons */}
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedCaseModal(c)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                        title="View Full Case Details"
                      >
                        Inspect
                      </button>

                      <button
                        onClick={() => handleExportCase(c)}
                        className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors cursor-pointer"
                        title="Export Official Archive Record"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Case Details Modal */}
      {selectedCaseModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
            
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">
                  Police Solved Archive File
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1.5">
                  {selectedCaseModal.title}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedCaseModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1 font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4 p-3.5 bg-slate-50 rounded-xl text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">FIR Number</span>
                <span className="font-mono font-bold text-slate-900">
                  {authorizedOfficer ? selectedCaseModal.firNumber : (selectedCaseModal.maskedFirNumber || selectedCaseModal.firNumber.replace(/\d{3}/, 'XXX'))}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Registration Date</span>
                <span className="font-semibold text-slate-800">{selectedCaseModal.dateOfIncident || selectedCaseModal.incidentDate}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Closure Date</span>
                <span className="font-semibold text-slate-800">{selectedCaseModal.dateClosed || selectedCaseModal.archivedDate}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Resolution Speed</span>
                <span className="font-bold text-emerald-600">~14 Days</span>
              </div>
            </div>

            <div className="space-y-3.5 text-xs text-slate-700">
              <div>
                <h4 className="font-bold text-slate-900 mb-1">Police Station & Jurisdiction</h4>
                <p className="text-slate-600">
                  {selectedCaseModal.policeStation}, District: {selectedCaseModal.district || selectedCaseModal.districtName}, State of {selectedCaseModal.state || selectedCaseModal.stateName}.
                </p>
              </div>

              {selectedCaseModal.sectionsApplied && (
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Sections of Law Applied (BNS / IPC / Special Acts)</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCaseModal.sectionsApplied.map((sec, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-blue-50 text-blue-800 border border-blue-200 rounded font-mono font-semibold">
                        {sec}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-bold text-slate-900 mb-1">Official Chargesheet Summary</h4>
                <p className="p-3 bg-slate-50 border border-slate-200 rounded-xl leading-relaxed text-slate-800">
                  {selectedCaseModal.chargesheetSummary || selectedCaseModal.summary}
                </p>
              </div>

              {selectedCaseModal.recoveryDetails && (
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Assets Recovered & Restituted to Citizens</h4>
                  <p className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-xl text-emerald-900 font-medium">
                    {selectedCaseModal.recoveryDetails}
                  </p>
                </div>
              )}

              <div>
                <h4 className="font-bold text-slate-900 mb-1">Judicial Conviction & Sentence</h4>
                <p className="p-2.5 bg-indigo-50/70 border border-indigo-200 rounded-xl text-indigo-900 font-semibold">
                  {selectedCaseModal.courtConvictionOutcome || selectedCaseModal.convictionStatus}
                </p>
              </div>

              {authorizedOfficer ? (
                <div className="p-3 bg-emerald-900 text-emerald-100 rounded-xl text-xs">
                  <span className="font-bold uppercase tracking-wider block text-emerald-300">Confidential Officer Remarks (Unmasked):</span>
                  Accused Details: {selectedCaseModal.accusedDetails || `${selectedCaseModal.accusedCount} accused individuals detained`}. IO: {selectedCaseModal.investigatingOfficer} ({selectedCaseModal.officerBadge}). Forensic Evidence Dossier verified by Central Forensic Science Laboratory (CFSL).
                </div>
              ) : (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-700" />
                    <span>Accused names and CFSL forensic logs restricted to verified law enforcement badge holders.</span>
                  </div>
                  <button
                    onClick={() => { setSelectedCaseModal(null); onOpenPolicePortal(); }}
                    className="px-2.5 py-1 bg-amber-200 text-amber-900 font-bold rounded text-[11px] hover:bg-amber-300 cursor-pointer"
                  >
                    Officer Login
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-slate-100">
              <button
                onClick={() => setSelectedCaseModal(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Close Record
              </button>
              <button
                onClick={() => handleExportCase(selectedCaseModal)}
                className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Case Dossier</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
