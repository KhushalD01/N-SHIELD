"use client";

import React, { useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  Filter,
  Flame,
  Info,
  MapPin,
  Newspaper,
  PlusCircle,
  Radio,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  User,
  Users,
} from "lucide-react";
import type {
  CitizenSubmittedReport,
  NewsCategory,
  RealNewsArticle,
} from "@/lib/newsTypes";

const CATEGORIES: NewsCategory[] = [
  "All Crimes",
  "Theft",
  "Vehicle Theft",
  "Robbery",
  "Burglary",
  "Assault",
  "Murder",
  "Kidnapping",
  "Crimes Against Women",
  "Cybercrime",
  "Fraud",
  "Drugs and Smuggling",
  "Missing Person",
  "Other Crime",
];

const CATEGORY_BADGES: Record<
  NewsCategory,
  { label: string; icon: string; bg: string; text: string; border: string }
> = {
  "All Updates": { label: "All Crimes", icon: "🛡️", bg: "bg-rose-50 dark:bg-rose-950/60", text: "text-rose-700 dark:text-rose-300", border: "border-rose-200 dark:border-rose-800" },
  "All Crimes": { label: "All Crimes", icon: "🛡️", bg: "bg-rose-50 dark:bg-rose-950/60", text: "text-rose-700 dark:text-rose-300", border: "border-rose-200 dark:border-rose-800" },
  Theft: { label: "Theft", icon: "🔴", bg: "bg-rose-50 dark:bg-rose-950/60", text: "text-rose-700 dark:text-rose-300", border: "border-rose-200 dark:border-rose-800" },
  "Vehicle Theft": { label: "Vehicle Theft", icon: "🔴", bg: "bg-rose-50 dark:bg-rose-950/60", text: "text-rose-700 dark:text-rose-300", border: "border-rose-200 dark:border-rose-800" },
  Robbery: { label: "Robbery", icon: "🔴", bg: "bg-rose-100 dark:bg-rose-950", text: "text-rose-800 dark:text-rose-200", border: "border-rose-300 dark:border-rose-700" },
  Burglary: { label: "Burglary", icon: "🔴", bg: "bg-rose-50 dark:bg-rose-950/60", text: "text-rose-700 dark:text-rose-300", border: "border-rose-200 dark:border-rose-800" },
  Assault: { label: "Assault", icon: "🔴", bg: "bg-red-50 dark:bg-red-950/60", text: "text-red-700 dark:text-red-300", border: "border-red-200 dark:border-red-800" },
  Murder: { label: "Murder", icon: "🚨", bg: "bg-red-100 dark:bg-red-950", text: "text-red-800 dark:text-red-200", border: "border-red-300 dark:border-red-700" },
  Kidnapping: { label: "Kidnapping", icon: "⚠️", bg: "bg-amber-50 dark:bg-amber-950/60", text: "text-amber-700 dark:text-amber-300", border: "border-amber-200 dark:border-amber-800" },
  "Crimes Against Women": { label: "Crimes Against Women", icon: "🛡️", bg: "bg-rose-100 dark:bg-rose-950/80", text: "text-rose-900 dark:text-rose-200", border: "border-rose-300 dark:border-rose-700" },
  Cybercrime: { label: "Cybercrime", icon: "💻", bg: "bg-blue-50 dark:bg-blue-950/60", text: "text-blue-700 dark:text-blue-300", border: "border-blue-200 dark:border-blue-800" },
  Fraud: { label: "Fraud", icon: "💳", bg: "bg-indigo-50 dark:bg-indigo-950/60", text: "text-indigo-700 dark:text-indigo-300", border: "border-indigo-200 dark:border-indigo-800" },
  "Drugs and Smuggling": { label: "Drugs & Smuggling", icon: "🚫", bg: "bg-purple-50 dark:bg-purple-950/60", text: "text-purple-700 dark:text-purple-300", border: "border-purple-200 dark:border-purple-800" },
  "Missing Person": { label: "Missing Person", icon: "👤", bg: "bg-amber-50 dark:bg-amber-950/60", text: "text-amber-700 dark:text-amber-300", border: "border-amber-200 dark:border-amber-800" },
  "Other Crime": { label: "Other Crime", icon: "🚨", bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-700 dark:text-slate-300", border: "border-slate-200 dark:border-slate-700" },
};

interface RealNewsSectionProps {
  articles: RealNewsArticle[];
  categoryCounts?: Record<NewsCategory, number>;
  citizenReports: CitizenSubmittedReport[];
  loading: boolean;
  isRefreshing: boolean;
  error: string | null;
  selectedCategory: NewsCategory;
  onSelectCategory: (cat: NewsCategory) => void;
  sortBy: "latest" | "relevant";
  onSelectSortBy: (sort: "latest" | "relevant") => void;
  lastUpdated: string;
  onRefresh: () => void;
  onSelectArticleLocation?: (article: RealNewsArticle) => void;
  onOpenReportModal?: () => void;
}

export function RealNewsSection({
  articles,
  categoryCounts,
  citizenReports,
  loading,
  isRefreshing,
  error,
  selectedCategory,
  onSelectCategory,
  sortBy,
  onSelectSortBy,
  lastUpdated,
  onRefresh,
  onSelectArticleLocation,
  onOpenReportModal,
}: RealNewsSectionProps) {
  const [activeTab, setActiveTab] = useState<"news" | "citizen">("news");

  // Filter citizen reports by category
  const filteredCitizenReports =
    selectedCategory === "All Updates" || selectedCategory === "All Crimes"
      ? citizenReports
      : citizenReports.filter((r) => r.category === selectedCategory);

  const getEmptyCategoryMessage = (category: NewsCategory) => {
    return "No recent Nagpur crime news was found for the selected period.";
  };

  return (
    <section className="space-y-4 rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-5 shadow-sm backdrop-blur-md">
      
      {/* --------------------------------------------------------------------- */}
      {/* 1. SECTION HEADER: TITLE, REFRESH & TABS                              */}
      {/* --------------------------------------------------------------------- */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
              <Newspaper className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-50 tracking-tight">
                Nagpur Crime News
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Recent crime-related reports collected from external news sources.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Switcher: News Reports vs. Citizen Reports */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="flex rounded-2xl bg-slate-100 dark:bg-slate-800 p-1 text-xs font-bold border border-slate-200/70 dark:border-slate-700/70">
            <button
              type="button"
              onClick={() => setActiveTab("news")}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 transition-all ${
                activeTab === "news"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <span>📰 News Reports</span>
              <span className="rounded-full bg-slate-200 dark:bg-slate-700 px-1.5 py-0.2 text-[10px]">
                {articles.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("citizen")}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 transition-all ${
                activeTab === "citizen"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <span>👤 Citizen Reports</span>
              <span className="rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-1.5 py-0.2 text-[10px]">
                {citizenReports.length}
              </span>
            </button>
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-700 transition active:scale-95"
            title="Reload latest news"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-indigo-600 ${isRefreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh News</span>
          </button>

          {onOpenReportModal && (
            <button
              type="button"
              onClick={onOpenReportModal}
              className="flex items-center gap-1.5 rounded-2xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>Report Incident</span>
            </button>
          )}
        </div>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* 2. CATEGORY FILTERS WITH DYNAMIC COUNTS                               */}
      {/* --------------------------------------------------------------------- */}
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 min-w-0 w-full">
          {/* Category Filter Tabs with dynamic numbers */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full min-w-0 flex-1 no-scrollbar">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat;
              const meta = CATEGORY_BADGES[cat];
              const count = categoryCounts ? categoryCounts[cat] ?? 0 : 0;

              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => onSelectCategory(cat)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                      : "bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  <span>{meta.icon}</span>
                  <span>{cat}</span>
                  {count > 0 && (
                    <span
                      className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                        isActive
                          ? "bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-900 font-black"
                          : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Sort & Timestamp */}
          <div className="flex items-center justify-between sm:justify-end gap-2 text-xs font-semibold text-slate-500 shrink-0 w-full sm:w-auto">
            <select
              value={sortBy}
              onChange={(e) => onSelectSortBy(e.target.value as any)}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none"
            >
              <option value="latest">Latest</option>
              <option value="relevant">Most Relevant</option>
            </select>
          </div>
        </div>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* 3. NEWS FEED / SKELETON / EMPTY CATEGORY STATES                       */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === "news" ? (
        <>
          {loading ? (
            /* Skeleton Loading State (No fake news) */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((idx) => (
                <div
                  key={idx}
                  className="animate-pulse rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-4 space-y-3"
                >
                  <div className="flex justify-between items-center">
                    <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded-md" />
                    <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded-md" />
                  </div>
                  <div className="h-5 w-4/5 bg-slate-300 dark:bg-slate-600 rounded-md" />
                  <div className="h-12 w-full bg-slate-200 dark:bg-slate-700 rounded-md" />
                  <div className="flex justify-between items-center pt-2">
                    <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded-md" />
                    <div className="h-7 w-20 bg-slate-300 dark:bg-slate-600 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          ) : error && articles.length === 0 ? (
            /* Error State without fake content */
            <div className="rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 p-6 text-center">
              <ShieldAlert className="mx-auto h-8 w-8 text-rose-500" />
              <h4 className="mt-2 text-sm font-bold text-rose-900 dark:text-rose-200">
                Unable to load the latest news
              </h4>
              <p className="mt-1 text-xs text-rose-700 dark:text-rose-300 max-w-md mx-auto">
                {error}
              </p>
              <button
                type="button"
                onClick={onRefresh}
                className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-rose-700 transition"
              >
                <RefreshCw className="h-3 w-3" /> Retry
              </button>
            </div>
          ) : articles.length === 0 ? (
            /* Strict Empty Category State — NEVER fill with unrelated articles */
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-8 text-center space-y-2">
              <Info className="mx-auto h-8 w-8 text-slate-400" />
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {getEmptyCategoryMessage(selectedCategory)}
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Try another category or check again later.
              </p>
              <div className="pt-2 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={onRefresh}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Refresh News</span>
                </button>
                <button
                  type="button"
                  onClick={() => onSelectCategory("All Updates")}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-indigo-700 transition"
                >
                  View All Updates
                </button>
              </div>
            </div>
          ) : (
            /* Category-Filtered Real News Cards Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {articles.map((article) => {
                const badge = CATEGORY_BADGES[article.category] || CATEGORY_BADGES["Other Crime"];
                return (
                  <article
                    key={article.id}
                    className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 p-4 transition-all hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md"
                  >
                    <div>
                      {/* Top Meta Row */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-extrabold tracking-wide uppercase border ${badge.bg} ${badge.text} ${badge.border}`}
                        >
                          <span>{badge.icon}</span>
                          <span>{article.category.toUpperCase()}</span>
                        </span>

                        {/* Location Tag */}
                        {article.location && (
                          <button
                            type="button"
                            onClick={() => onSelectArticleLocation && onSelectArticleLocation(article)}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                            title="View location on safety map"
                          >
                            <MapPin className="h-3 w-3" />
                            <span>📍 {article.location.name}</span>
                          </button>
                        )}
                      </div>

                      {/* Headline */}
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition line-clamp-2">
                        {article.title}
                      </h3>

                      {/* Description */}
                      {article.description && (
                        <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                          {article.description}
                        </p>
                      )}
                    </div>

                    {/* Footer Row: Source, Time, and Read Full Story Button */}
                    <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex flex-col gap-2">
                      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          Source: {article.sourceName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {article.relativeTime}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-1">
                        {/* Verification Tag */}
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>📰 Reported by News Source</span>
                        </span>

                        {/* Real Article URL Button */}
                        <a
                          href={article.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-indigo-700 active:scale-95 shrink-0"
                        >
                          <span>Read Full Story</span>
                          <ArrowUpRight className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </>
      ) : (
        /* ------------------------------------------------------------------- */
        /* CITIZEN SUBMITTED REPORTS TAB                                       */
        /* ------------------------------------------------------------------- */
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800 p-3.5 text-xs text-amber-900 dark:text-amber-200">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
              <span>
                <strong>Citizen Reports</strong> are submitted by community members and are marked <em>Unverified</em> until confirmed by field officers.
              </span>
            </div>
          </div>

          {filteredCitizenReports.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No citizen reports submitted in this category.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCitizenReports.map((report) => (
                <div
                  key={report.id}
                  className="flex flex-col justify-between rounded-2xl border border-amber-200/80 dark:border-amber-800/80 bg-amber-50/20 dark:bg-slate-800/50 p-4 space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-2 py-0.5 text-[10px] font-bold">
                        👤 Citizen Report (Unverified)
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500">
                        📍 {report.locationName}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-2">
                      {report.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      {report.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Submitted by: {report.submittedBy || "Citizen"}</span>
                    <span>{new Date(report.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* 4. SAFETY NOTICE DISCLAIMER                                           */}
      {/* --------------------------------------------------------------------- */}
      <div className="mt-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 p-3.5 text-slate-500 dark:text-slate-400 text-xs flex items-start gap-2.5">
        <Info className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Safety Notice:</strong> Information shown here is collected from available news and incident sources. Reports may change as more information becomes available. N-SHIELD does not independently verify every external news report.
        </p>
      </div>
    </section>
  );
}
