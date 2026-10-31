"use client";

import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  Building2,
  Check,
  Compass,
  Copy,
  Download,
  ExternalLink,
  FileSpreadsheet,
  FileText,
  Hospital,
  Info,
  Mail,
  MapPin,
  Phone,
  PhoneCall,
  Search,
  Shield,
  ShieldCheck,
  Siren,
  X,
} from "lucide-react";
import {
  NAGPUR_ESSENTIAL_SERVICES,
  NAGPUR_HELPLINES,
  SERVICE_CATEGORIES,
  type EssentialService,
  type ServiceCategory,
} from "@/lib/nearbyServicesData";
import { getPhoneDialerUrl } from "@/lib/geoUtils";

interface EmergencyDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectServiceOnMap?: (service: EssentialService) => void;
}

export function EmergencyDirectoryModal({
  isOpen,
  onClose,
  onSelectServiceOnMap,
}: EmergencyDirectoryModalProps) {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedLocality, setSelectedLocality] = useState<string>("all");
  const [hospitalSubFilter, setHospitalSubFilter] = useState<string>("all");
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const filteredServices = useMemo(() => {
    let list = NAGPUR_ESSENTIAL_SERVICES;

    if (activeTab === "police") {
      list = list.filter((s) => s.category === "police");
    } else if (activeTab === "hospital") {
      list = list.filter((s) => s.category === "hospital");
      if (hospitalSubFilter === "govt") {
        list = list.filter((s) => s.hospitalDetails?.isGovernment || s.hospitalDetails?.category === "government" || s.name.toLowerCase().includes("govt") || s.name.toLowerCase().includes("gmch") || s.name.toLowerCase().includes("mayo") || s.name.toLowerCase().includes("aiims"));
      } else if (hospitalSubFilter === "emergency") {
        list = list.filter((s) => s.is24x7);
      } else if (hospitalSubFilter === "specialist") {
        list = list.filter((s) => ["cardiac", "cancer", "eye", "orthopaedic"].includes(s.hospitalDetails?.category || "") || (s.specialties && /cardiac|cancer|eye|ortho/i.test(s.specialties)));
      } else if (hospitalSubFilter === "maternity") {
        list = list.filter((s) => ["maternity", "children"].includes(s.hospitalDetails?.category || "") || (s.specialties && /pediatric|maternity|children/i.test(s.specialties)));
      } else if (hospitalSubFilter === "clinics") {
        list = list.filter((s) => ["nursing_home", "clinic"].includes(s.hospitalDetails?.category || "") || /clinic|nursing/i.test(s.name));
      }
    } else if (activeTab === "pharmacy") {
      list = list.filter((s) => s.category === "pharmacy");
    } else if (activeTab === "fire_station") {
      list = list.filter((s) => s.category === "fire_station");
    } else if (activeTab === "emergency_other") {
      list = list.filter((s) => s.category === "emergency_other");
    }

    if (selectedLocality !== "all") {
      const locLower = selectedLocality.toLowerCase();
      list = list.filter((s) => {
        const hLoc = (s.hospitalDetails?.locality || s.landmark || s.address).toLowerCase();
        return hLoc.includes(locLower);
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.address.toLowerCase().includes(q) ||
          (s.landmark && s.landmark.toLowerCase().includes(q)) ||
          (s.notes && s.notes.toLowerCase().includes(q)) ||
          (s.phone && s.phone.includes(q)) ||
          (s.email && s.email.toLowerCase().includes(q)) ||
          (s.specialties && s.specialties.toLowerCase().includes(q)) ||
          (s.hospitalDetails?.locality && s.hospitalDetails.locality.toLowerCase().includes(q))
      );
    }

    return list;
  }, [activeTab, searchQuery, selectedLocality, hospitalSubFilter]);

  const filteredHelplines = useMemo(() => {
    if (activeTab !== "all" && activeTab !== "helplines") return [];
    if (!searchQuery.trim()) return NAGPUR_HELPLINES;
    const q = searchQuery.toLowerCase().trim();
    return NAGPUR_HELPLINES.filter(
      (h) =>
        h.name.toLowerCase().includes(q) ||
        h.number.includes(q) ||
        h.scope.toLowerCase().includes(q) ||
        h.type.toLowerCase().includes(q)
    );
  }, [activeTab, searchQuery]);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 dark:border-slate-800 p-4 sm:p-6 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-700 text-white shadow-md shadow-indigo-500/20">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
                  Nagpur Emergency Services Directory
                </h2>
                <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/80 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  35 Sources Verified
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Official directory of 37 Police Stations, 42+ Hospitals, 31 Pharmacies, and 24/7 Helplines
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Download PDF button */}
            <a
              href="/data/Nagpur_Emergency_Services_Directory.pdf"
              download="Nagpur_Emergency_Services_Directory.pdf"
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 active:scale-95 transition"
              title="Download publication-grade PDF Dossier"
            >
              <Download className="h-4 w-4" />
              <span>PDF Dossier</span>
            </a>

            {/* Close button */}
            <button
              onClick={onClose}
              className="rounded-xl p-2 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Search & Locality Filter Toolbar */}
        <div className="p-4 sm:px-6 sm:py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          <div className="flex items-center gap-2 flex-1 max-w-2xl flex-wrap sm:flex-nowrap">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search station, hospital, area, phone or specialty..."
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Locality Filter Selector */}
            <select
              value={selectedLocality}
              onChange={(e) => setSelectedLocality(e.target.value)}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold cursor-pointer"
            >
              <option value="all">🌐 All Localities</option>
              <option value="Dongargaon">Dongargaon / WCEM / Gumgaon</option>
              <option value="Jamtha">Jamtha (NCI / Stadium)</option>
              <option value="MIHAN">MIHAN (AIIMS)</option>
              <option value="Nandanvan">Nandanvan & Nandanvan Ext</option>
              <option value="Sakkardara">Sakkardara / Reshimbagh / Ayodhya</option>
              <option value="Medical Square">Medical Square & Ajni</option>
              <option value="Sitabuldi">Sitabuldi & Kingsway</option>
              <option value="Dhantoli">Dhantoli & Ramdaspeth</option>
              <option value="Dharampeth">Dharampeth & Shankar Nagar</option>
              <option value="Besa">Besa, Beltarodi & Manewada</option>
              <option value="Mankapur">Mankapur & Koradi Road</option>
              <option value="Wardhaman Nagar">Wardhaman Nagar & Pardi</option>
              <option value="Jaripatka">Jaripatka & Kamptee Road</option>
            </select>
          </div>

          {/* Quick Download Links */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 text-xs">
            <span className="text-[11px] font-bold text-slate-400 shrink-0">Export:</span>
            <a
              href="/data/nagpur_emergency_services.json"
              download
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100"
            >
              <FileText className="h-3 w-3 text-amber-500" /> JSON
            </a>
            <a
              href="/data/nagpur_police_stations.csv"
              download
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100"
            >
              <FileSpreadsheet className="h-3 w-3 text-blue-500" /> Police CSV
            </a>
            <a
              href="/data/nagpur_hospitals.csv"
              download
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100"
            >
              <FileSpreadsheet className="h-3 w-3 text-rose-500" /> Hospitals CSV
            </a>
            <a
              href="/data/nagpur_emergency_helplines.csv"
              download
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100"
            >
              <FileSpreadsheet className="h-3 w-3 text-emerald-500" /> Helplines CSV
            </a>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 px-4 sm:px-6 py-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 overflow-x-auto min-w-0 w-full no-scrollbar">
          {[
            { id: "all", label: "All Services", count: NAGPUR_ESSENTIAL_SERVICES.length + NAGPUR_HELPLINES.length },
            { id: "helplines", label: "🛡️ Helplines", count: NAGPUR_HELPLINES.length },
            { id: "hospital", label: "🏥 Hospitals", count: NAGPUR_ESSENTIAL_SERVICES.filter((s) => s.category === "hospital").length },
            { id: "police", label: "🚓 Police Stations", count: NAGPUR_ESSENTIAL_SERVICES.filter((s) => s.category === "police").length },
            { id: "pharmacy", label: "💊 Pharmacies", count: NAGPUR_ESSENTIAL_SERVICES.filter((s) => s.category === "pharmacy").length },
            { id: "fire_station", label: "🚒 Fire Stations", count: NAGPUR_ESSENTIAL_SERVICES.filter((s) => s.category === "fire_station").length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                activeTab === tab.id
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                  activeTab === tab.id
                    ? "bg-white/20 text-white"
                    : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Hospital Sub-Filter Bar */}
        {activeTab === "hospital" && (
          <div className="flex items-center gap-1.5 px-4 sm:px-6 py-2 bg-indigo-50/50 dark:bg-indigo-950/30 border-b border-indigo-100 dark:border-indigo-900/40 overflow-x-auto no-scrollbar">
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-500 dark:text-indigo-400 mr-1 shrink-0">
              Filter By Type:
            </span>
            {[
              { id: "all", label: "All Facilities" },
              { id: "govt", label: "🏛️ Government" },
              { id: "emergency", label: "🚨 24/7 Emergency" },
              { id: "specialist", label: "🔬 Specialists" },
              { id: "maternity", label: "👶 Maternity & Child" },
              { id: "clinics", label: "🩺 Clinics & Nursing" },
            ].map((sub) => (
              <button
                key={sub.id}
                onClick={() => setHospitalSubFilter(sub.id)}
                className={`text-xs px-2.5 py-1 rounded-lg font-bold transition whitespace-nowrap cursor-pointer ${
                  hospitalSubFilter === sub.id
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
              >
                {sub.label}
              </button>
            ))}
          </div>
        )}

        {/* Directory Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* Helplines section (when in All or Helplines tab) */}
          {(activeTab === "all" || activeTab === "helplines") && filteredHelplines.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Critical Emergency Helplines ({filteredHelplines.length})
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {filteredHelplines.map((h, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800/60 p-3 shadow-xs hover:border-indigo-300 transition"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-extrabold text-slate-900 dark:text-slate-100 truncate">
                          {h.name}
                        </span>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                          {h.type}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {h.scope}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <a
                        href={`tel:${h.number.replace(/[^0-9]/g, "")}`}
                        className="flex items-center gap-1 rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-black text-white shadow-xs hover:bg-rose-700 active:scale-95 transition"
                      >
                        <PhoneCall className="h-3.5 w-3.5" />
                        <span>{h.number}</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Essential Services Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Verified Facilities ({filteredServices.length})
              </h3>
            </div>

            {filteredServices.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                No services match your search query. Try typing another location or name.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredServices.map((service) => {
                  const dialerUrl = getPhoneDialerUrl(service.phone);
                  return (
                    <div
                      key={service.id}
                      className="group flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 p-4 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-800 hover:shadow-md transition"
                    >
                      <div>
                        {/* Header Badges */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                            {service.category === "police" && "🚓 Police Station"}
                            {service.category === "hospital" && "🏥 Hospital"}
                            {service.category === "pharmacy" && "💊 Pharmacy"}
                            {service.category === "fire_station" && "🚒 Fire Brigade"}
                            {service.category === "emergency_other" && "🛡️ Emergency Squad"}
                          </span>
                          <div className="flex items-center gap-1.5">
                            {service.accreditation && (
                              <span className="rounded-md bg-purple-100 dark:bg-purple-950 px-1.5 py-0.5 text-[9px] font-extrabold text-purple-700 dark:text-purple-300">
                                {service.accreditation}
                              </span>
                            )}
                            {service.hospitalDetails?.verificationStatus === "needs_review" ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                                <AlertTriangle className="h-3 w-3" /> Needs Review
                              </span>
                            ) : service.hospitalDetails?.verificationStatus === "unverified" || !service.verified ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-500 dark:text-rose-400">
                                <Info className="h-3 w-3" /> Unverified Location
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                <ShieldCheck className="h-3 w-3" /> Verified Premise
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Title */}
                        <h4 className="text-sm font-black text-slate-900 dark:text-slate-100 leading-snug">
                          {service.name}
                        </h4>

                        {/* Address */}
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-start gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span>{service.address}</span>
                        </p>

                        {/* Specialties */}
                        {service.specialties && (
                          <p className="text-[11px] text-indigo-800 dark:text-indigo-300 bg-indigo-50/60 dark:bg-indigo-950/40 p-2 rounded-xl border border-indigo-100 dark:border-indigo-900/40 mt-2">
                            <span className="font-bold">Services:</span> {service.specialties}
                          </p>
                        )}

                        {/* Notes / Timing */}
                        {service.notes && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
                            ℹ️ {service.notes}
                          </p>
                        )}

                        {/* Email / Website */}
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px]">
                          {service.email && (
                            <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                              <Mail className="h-3 w-3 text-slate-400" />
                              <a
                                href={`mailto:${service.email}`}
                                className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium truncate max-w-[200px]"
                              >
                                {service.email}
                              </a>
                            </div>
                          )}
                          {service.website && (
                            <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                              <ExternalLink className="h-3 w-3 text-slate-400" />
                              <a
                                href={service.website.startsWith("http") ? service.website : `https://${service.website}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium truncate max-w-[150px]"
                              >
                                Website
                              </a>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="mt-3.5 flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                        {dialerUrl ? (
                          <a
                            href={dialerUrl}
                            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 active:scale-95 transition"
                          >
                            <PhoneCall className="h-3.5 w-3.5" />
                            <span>Call {service.phone}</span>
                          </a>
                        ) : (
                          <span className="flex-1 text-center py-2 text-[11px] text-slate-400 font-medium">
                            Direct line via 112
                          </span>
                        )}

                        {onSelectServiceOnMap && (
                          <button
                            type="button"
                            onClick={() => {
                              onSelectServiceOnMap(service);
                              onClose();
                            }}
                            className="flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 active:scale-95 transition"
                          >
                            <Compass className="h-3.5 w-3.5 text-indigo-500" />
                            <span>Locate</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-200/80 dark:border-slate-800 p-3 sm:px-6 bg-slate-50/70 dark:bg-slate-900/70 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div>
            Data cross-verified against official Nagpur Police, Maharashtra Govt & GMC registries.
          </div>
          <div className="font-semibold text-slate-700 dark:text-slate-300">
            N-SHIELD AI Safety Intelligence Model
          </div>
        </div>
      </div>
    </div>
  );
}
