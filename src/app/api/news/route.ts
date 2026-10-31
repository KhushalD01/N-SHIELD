import { NextRequest, NextResponse } from "next/server";
import {
  calculateAreaRisks,
  calculateCategoryCounts,
  deduplicateArticles,
  isCrimeCategory,
  isValidNagpurCrimeArticle,
  parseGoogleNewsItem,
  parseNewsApiArticle,
  parseNewsDataArticle,
} from "@/lib/newsService";
import type { NewsApiResponse, NewsCategory, RealNewsArticle } from "@/lib/newsTypes";

const STRICT_NAGPUR_CRIME_QUERY =
  '("Nagpur" OR "Nagpur city") AND (crime OR criminal OR police OR arrested OR arrest OR theft OR stolen OR robbery OR robbed OR burglary OR assault OR attacked OR murder OR killed OR kidnapping OR kidnapped OR rape OR molestation OR harassment OR "chain snatching" OR fraud OR scam OR cybercrime OR smuggling OR drugs OR narcotics OR weapon OR firing OR stabbing OR missing)';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const categoryParam = (searchParams.get("category") || "All Updates") as NewsCategory;
  const sortParam = searchParams.get("sort") || "latest";

  const newsApiKey = process.env.NEWS_API_KEY;
  const newsDataApiKey = process.env.NEWSDATA_API_KEY || "pub_0fd29490b3d342c793bdac82bdcd7478";

  const defaultCategoryCounts: Record<NewsCategory, number> = {
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

  let rawArticles: RealNewsArticle[] = [];
  let currentSource: "newsapi.org" | "fallback_offline" = "newsapi.org";

  // Tier 1: Try NewsAPI.org if key is configured
  if (newsApiKey) {
    try {
      const newsApiUrl = new URL("https://newsapi.org/v2/everything");
      newsApiUrl.searchParams.set("q", STRICT_NAGPUR_CRIME_QUERY);
      newsApiUrl.searchParams.set("language", "en");
      newsApiUrl.searchParams.set("sortBy", "publishedAt");
      newsApiUrl.searchParams.set("pageSize", "100");
      newsApiUrl.searchParams.set("apiKey", newsApiKey);

      const res = await fetch(newsApiUrl.toString(), {
        next: { revalidate: 900 },
        headers: {
          Accept: "application/json",
          "X-Api-Key": newsApiKey,
          "User-Agent": "N-SHIELD/1.0",
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.status === "ok" && Array.isArray(data.articles) && data.articles.length > 0) {
          rawArticles = data.articles
            .filter((art: any) => art && art.title && art.title !== "[Removed]")
            .map((item: any, idx: number) => parseNewsApiArticle(item, idx))
            .filter((art: RealNewsArticle) => isValidNagpurCrimeArticle(art.title, art.description, art.content));
        }
      }
    } catch (err) {
      console.warn("NewsAPI tier error, falling back to secondary tier");
    }
  }

  // Tier 2: Fetch from NewsData.io if API key present
  if (newsDataApiKey) {
    try {
      const primaryUrl = new URL("https://newsdata.io/api/1/latest");
      primaryUrl.searchParams.set("apikey", newsDataApiKey);
      primaryUrl.searchParams.set("q", 'Nagpur AND (crime OR police OR theft OR murder OR arrest OR fraud)');
      primaryUrl.searchParams.set("language", "en");

      const res = await fetch(primaryUrl.toString(), {
        next: { revalidate: 900 },
        headers: { Accept: "application/json" },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.status === "success" && Array.isArray(data.results) && data.results.length > 0) {
          const newsDataArticles = data.results
            .map((item: any, idx: number) => parseNewsDataArticle(item, idx))
            .filter((art: RealNewsArticle) => isValidNagpurCrimeArticle(art.title, art.description, art.content));
          rawArticles = [...rawArticles, ...newsDataArticles];
        }
      }
    } catch (err) {
      console.warn("NewsData tier fetch error");
    }
  }

  // Tier 3: Fetch multiple Google News RSS query streams in parallel for maximum Nagpur crime coverage
  const rssQueries = [
    'Nagpur AND (crime OR criminal OR police OR arrested OR arrest)',
    'Nagpur AND (theft OR stolen OR robbery OR robbed OR burglary OR housebreaking)',
    'Nagpur AND (assault OR attacked OR murder OR killed OR firing OR stabbing)',
    'Nagpur AND (fraud OR scam OR cybercrime OR smuggling OR drugs OR narcotics)',
    'Nagpur AND (kidnapping OR kidnapped OR rape OR molestation OR harassment OR missing)',
    'Nagpur AND (police OR FIR OR booked OR seized OR racket OR busted)',
  ];

  try {
    const rssPromises = rssQueries.map(async (query) => {
      const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-IN&gl=IN&ceid=IN:en`;
      const res = await fetch(rssUrl, {
        next: { revalidate: 300 },
        headers: { "User-Agent": "Mozilla/5.0" },
      });

      if (!res.ok) return [];

      const xml = await res.text();
      return xml
        .split("<item>")
        .slice(1)
        .map((item) => {
          const title = item.match(/<title>(.*?)<\/title>/)?.[1] || "";
          const link = item.match(/<link>(.*?)<\/link>/)?.[1] || "";
          const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || "";
          const source = item.match(/<source[^>]*>(.*?)<\/source>/)?.[1] || "";
          return { title, link, pubDate, source };
        })
        .filter((item) => item.title)
        .map((item, idx) => parseGoogleNewsItem(item, idx))
        .filter((art: RealNewsArticle) => isValidNagpurCrimeArticle(art.title, art.description, art.content));
    });

    const rssResultsLists = await Promise.all(rssPromises);
    const combinedRssArticles = rssResultsLists.flat();
    rawArticles = [...rawArticles, ...combinedRssArticles];
  } catch (err) {
    console.warn("Google News RSS fallback error", err);
  }

  if (rawArticles.length === 0) {
    return NextResponse.json<NewsApiResponse>(
      {
        articles: [],
        allArticles: [],
        areaRisks: [],
        totalResults: 0,
        categoryCounts: defaultCategoryCounts,
        lastUpdated: new Date().toISOString(),
        source: currentSource,
        error: "No recent Nagpur crime news was found for the selected period.",
      },
      { status: 200 }
    );
  }

  // Deduplicate articles
  const uniqueArticles = deduplicateArticles(rawArticles);

  // Calculate dynamic category counts
  const categoryCounts = calculateCategoryCounts(uniqueArticles);

  // Calculate location-based AreaRisk values
  const areaRisks = calculateAreaRisks(uniqueArticles);

  // Filter by selected category
  let filteredArticles = uniqueArticles;
  if (categoryParam === "All Updates" || categoryParam === "All Crimes") {
    filteredArticles = uniqueArticles;
  } else {
    filteredArticles = uniqueArticles.filter(
      (article) => article.category === categoryParam
    );
  }

  // Sort by pubDate if latest
  if (sortParam === "latest") {
    filteredArticles.sort(
      (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
    );
    uniqueArticles.sort(
      (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
    );
  }

  return NextResponse.json<NewsApiResponse>(
    {
      articles: filteredArticles,
      allArticles: uniqueArticles,
      areaRisks,
      totalResults: filteredArticles.length,
      categoryCounts,
      lastUpdated: new Date().toISOString(),
      source: currentSource,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=900, stale-while-revalidate=300",
      },
    }
  );
}

