"use client";

import { useState, useEffect, useCallback } from "react";
import type {
  AreaRisk,
  CitizenSubmittedReport,
  NewsApiResponse,
  NewsCategory,
  RealNewsArticle,
} from "@/lib/newsTypes";

const DEFAULT_CATEGORY_COUNTS: Record<NewsCategory, number> = {
  "All Updates": 0,
  "All Crimes": 0,
  Theft: 0,
  "Vehicle Theft": 0,
  Robbery: 0,
  Burglary: 0,
  Assault: 0,
  Murder: 0,
  Kidnapping: 0,
  "Crimes Against Women": 0,
  Cybercrime: 0,
  Fraud: 0,
  "Drugs and Smuggling": 0,
  "Missing Person": 0,
  "Other Crime": 0,
};

export function useRealNews() {
  const [articles, setArticles] = useState<RealNewsArticle[]>([]);
  const [allArticles, setAllArticles] = useState<RealNewsArticle[]>([]);
  const [areaRisks, setAreaRisks] = useState<AreaRisk[]>([]);
  const [categoryCounts, setCategoryCounts] = useState<Record<NewsCategory, number>>(DEFAULT_CATEGORY_COUNTS);
  const [citizenReports, setCitizenReports] = useState<CitizenSubmittedReport[]>([
    {
      id: "cit-rep-01",
      title: "Suspicious Activity Reported Near Variety Square Alley",
      description: "Unidentified individuals spotted attempting door handles along the back lane late night.",
      category: "Other Crime",
      locationName: "Sitabuldi",
      lat: 21.1472,
      lng: 79.0838,
      timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
      submittedBy: "Verified Citizen",
      status: "under_review",
    },
    {
      id: "cit-rep-02",
      title: "Attempted Two-Wheeler Theft on Wardha Road Flyover Descent",
      description: "Parked motorcycle ignition lock tampered with near Wardha Road flyover descent.",
      category: "Vehicle Theft",
      locationName: "Wardha Road",
      lat: 21.1065,
      lng: 79.0722,
      timestamp: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
      submittedBy: "Citizen Volunteer",
      status: "unverified",
    },
  ]);

  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory>("All Updates");
  const [sortBy, setSortBy] = useState<"latest" | "relevant">("latest");
  const [lastUpdated, setLastUpdated] = useState<string>("");

  const fetchNews = useCallback(
    async (isManualRefresh = false) => {
      if (isManualRefresh) setIsRefreshing(true);
      else setLoading(true);
      setError(null);

      try {
        const url = new URL("/api/news", window.location.origin);
        url.searchParams.set("category", selectedCategory);
        url.searchParams.set("sort", sortBy);
        if (isManualRefresh) {
          url.searchParams.set("_t", Date.now().toString());
        }

        const res = await fetch(url.toString(), {
          cache: isManualRefresh ? "no-store" : "default",
        });
        const data: NewsApiResponse = await res.json();

        if (data.error && data.articles.length === 0 && (!data.allArticles || data.allArticles.length === 0)) {
          setError(data.error);
          setArticles([]);
          setAllArticles([]);
          setAreaRisks([]);
        } else {
          setArticles(data.articles || []);
          setAllArticles(data.allArticles || data.articles || []);
          setAreaRisks(data.areaRisks || []);
          if (data.categoryCounts) {
            setCategoryCounts(data.categoryCounts);
          }
          setError(null);
        }

        const now = new Date();
        setLastUpdated(
          now.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })
        );
      } catch (err: any) {
        setError("Live safety news is temporarily unavailable. Please try again later.");
        setArticles([]);
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [selectedCategory, sortBy]
  );

  useEffect(() => {
    fetchNews(false);
  }, [fetchNews]);

  const submitCitizenReport = (report: Omit<CitizenSubmittedReport, "id" | "timestamp" | "status">) => {
    const newReport: CitizenSubmittedReport = {
      ...report,
      id: `cit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      status: "unverified",
    };
    setCitizenReports((prev) => [newReport, ...prev]);
    return newReport;
  };

  return {
    articles,
    allArticles,
    areaRisks,
    categoryCounts,
    citizenReports,
    loading,
    isRefreshing,
    error,
    selectedCategory,
    setSelectedCategory,
    sortBy,
    setSortBy,
    lastUpdated,
    refreshNews: () => fetchNews(true),
    submitCitizenReport,
  };
}
