export type NewsCategory =
  | "All Updates"
  | "All Crimes"
  | "Theft"
  | "Vehicle Theft"
  | "Robbery"
  | "Burglary"
  | "Assault"
  | "Murder"
  | "Kidnapping"
  | "Crimes Against Women"
  | "Cybercrime"
  | "Fraud"
  | "Drugs and Smuggling"
  | "Missing Person"
  | "Other Crime";

export type SafetyNewsCategory =
  | "Theft"
  | "Vehicle Theft"
  | "Robbery"
  | "Burglary"
  | "Assault"
  | "Murder"
  | "Kidnapping"
  | "Crimes Against Women"
  | "Cybercrime"
  | "Fraud"
  | "Drugs and Smuggling"
  | "Missing Person"
  | "Other Crime";

export type ReportSourceType = "news" | "citizen" | "official";

export interface RecognizedLocation {
  name: string;
  lat: number;
  lng: number;
  isSpecificZone: boolean;
}

export type SafetyNewsArticle = {
  id: string;
  title: string;
  description: string;
  content: string;
  source: string;
  sourceUrl: string;
  imageUrl: string | null;
  publishedAt: string;
  category: SafetyNewsCategory;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
};

export type AreaRisk = {
  area: string;
  latitude: number;
  longitude: number;
  incidentCount: number;
  recentIncidentCount: number;
  riskScore: number;
  riskLevel: "Low" | "Medium" | "High";
  categories: Record<string, number>;
  latestIncidentAt: string;
};

export interface RealNewsArticle {
  id: string;
  title: string;
  description: string;
  content: string;
  link: string;
  source: string;
  sourceName: string;
  sourceUrl: string;
  imageUrl: string | null;
  pubDate: string;
  publishedAt: string;
  relativeTime: string;
  category: NewsCategory;
  isCrime: boolean;
  sourceType: ReportSourceType;
  location: RecognizedLocation | null;
  latitude: number | null;
  longitude: number | null;
  verificationStatus: "Reported by News Source" | "Citizen Report (Unverified)" | "Official Police / Civic Source";
  severity?: "low" | "medium" | "high" | "critical";
}

export interface CitizenSubmittedReport {
  id: string;
  title: string;
  description: string;
  category: NewsCategory;
  locationName: string;
  lat: number;
  lng: number;
  timestamp: string;
  submittedBy?: string;
  status: "unverified" | "under_review" | "verified_by_patrol";
}

export interface NewsApiResponse {
  articles: RealNewsArticle[];
  allArticles?: RealNewsArticle[]; // Unfiltered full feed for sidebar
  areaRisks?: AreaRisk[];
  totalResults: number;
  lastUpdated: string;
  source: "newsapi.org" | "fallback_offline";
  categoryCounts?: Record<NewsCategory, number>;
  error?: string | null;
}
