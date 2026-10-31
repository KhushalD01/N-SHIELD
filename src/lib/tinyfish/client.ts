/**
 * N-SHIELD TinyFish Web Research & Browser Automation Client
 *
 * Implements official TinyFish Search, Fetch, and Agent APIs for live public safety,
 * crime incident reports, and news verification in Nagpur, Maharashtra.
 *
 * Documentation: https://docs.tinyfish.ai/
 * Security:
 * - TINYFISH_API_KEY is strictly server-side (process.env.TINYFISH_API_KEY).
 * - All web content is treated as untrusted (sanitized against prompt injection & HTML).
 * - In-memory TTL caching prevents redundant API calls and respects pricing quotas.
 */

import type { WebResearchItem } from "@/lib/validation/assistantSchemas";

const TINYFISH_SEARCH_API = "https://api.search.tinyfish.ai";
const TINYFISH_FETCH_API = "https://api.fetch.tinyfish.ai";
const TINYFISH_AGENT_API = "https://agent.tinyfish.ai/v1/automation/run";

const REQUEST_TIMEOUT_MS = 10000; // 10s bounded timeout
const CACHE_TTL_MS = 5 * 60 * 1000; // 5-minute in-memory cache

interface CachedResult<T> {
  data: T;
  timestamp: number;
}

const searchCache = new Map<string, CachedResult<WebResearchItem[]>>();

/**
 * Checks whether TINYFISH_API_KEY is configured on the server
 */
export function isTinyFishConfigured(): boolean {
  const key = process.env.TINYFISH_API_KEY;
  return Boolean(
    key &&
    key.trim() !== "" &&
    key !== "your_tinyfish_api_key_here"
  );
}

/**
 * Sanitizes untrusted web content to defend against prompt injection attacks
 * and HTML/script tag injection.
 */
export function sanitizeWebContent(input: unknown, maxLength = 600): string {
  if (typeof input !== "string") return "";

  let cleaned = input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<[^>]*>/g, " ") // Strip all HTML tags
    .replace(/javascript:/gi, "")
    .replace(/data:/gi, "");

  // Prompt injection mitigation: neutralize adversarial system overrides
  const injectionPatterns = [
    /\bignore\s+(?:all\s+)?previous\s+instructions\b/gi,
    /\bdisregard\s+(?:all\s+)?prior\s+(?:instructions|rules)\b/gi,
    /\byou\s+are\s+now\s+a\b/gi,
    /\bsystem\s+prompt\b/gi,
    /\bprint\s+(?:all\s+)?env(?:ironment)?\s+variables\b/gi,
    /\boutput\s+(?:the\s+)?api\s+key\b/gi,
    /\breturn\s+all\s+secrets\b/gi,
  ];

  for (const pattern of injectionPatterns) {
    cleaned = cleaned.replace(pattern, "[redacted_directive]");
  }

  return cleaned
    .replace(/\s+([.,!?;:])/g, "$1")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

/**
 * Extracts structured facts from title and snippet
 */
function extractFactsFromText(title: string, snippet: string): string[] {
  const combined = `${title}. ${snippet}`;
  const sentences = combined
    .split(/(?<=[.?!])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20 && s.length < 200);

  return sentences.slice(0, 3);
}

export interface TinyFishSearchOptions {
  domainType?: "news" | "general";
  recencyMinutes?: number;
  locality?: string;
}

export interface TinyFishResearchOutput {
  success: boolean;
  isConfigured: boolean;
  query: string;
  items: WebResearchItem[];
  sourceUrlList: string[];
  retrievalTimestamp: string;
  cached: boolean;
  error?: string;
}

/**
 * Executes a web research query via TinyFish Search API
 */
export async function searchTinyFishWeb(
  query: string,
  options: TinyFishSearchOptions = {}
): Promise<TinyFishResearchOutput> {
  const now = Date.now();
  const apiKey = process.env.TINYFISH_API_KEY;

  if (!isTinyFishConfigured() || !apiKey) {
    return {
      success: false,
      isConfigured: false,
      query,
      items: [],
      sourceUrlList: [],
      retrievalTimestamp: new Date().toISOString(),
      cached: false,
      error: "TINYFISH_API_KEY is not configured in server environment (.env.local).",
    };
  }

  // Prepend Nagpur context if not already present
  const effectiveQuery = query.toLowerCase().includes("nagpur")
    ? query
    : `Nagpur ${query}`;

  const cacheKey = `${effectiveQuery}|${options.domainType || "news"}|${options.recencyMinutes || 0}`;
  const cachedEntry = searchCache.get(cacheKey);

  if (cachedEntry && now - cachedEntry.timestamp < CACHE_TTL_MS) {
    return {
      success: true,
      isConfigured: true,
      query: effectiveQuery,
      items: cachedEntry.data,
      sourceUrlList: cachedEntry.data.map((i) => i.url),
      retrievalTimestamp: new Date(cachedEntry.timestamp).toISOString(),
      cached: true,
    };
  }

  try {
    const url = new URL(TINYFISH_SEARCH_API);
    url.searchParams.set("query", effectiveQuery);
    url.searchParams.set("location", "IN");
    url.searchParams.set("language", "en");

    if (options.domainType) {
      url.searchParams.set("domain_type", options.domainType);
    }
    if (options.recencyMinutes && options.recencyMinutes > 0) {
      url.searchParams.set("recency_minutes", String(options.recencyMinutes));
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "X-API-Key": apiKey,
        Accept: "application/json",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const statusText = res.statusText || String(res.status);
      console.warn(`TinyFish Search API responded with status ${res.status}: ${statusText}`);
      return {
        success: false,
        isConfigured: true,
        query: effectiveQuery,
        items: [],
        sourceUrlList: [],
        retrievalTimestamp: new Date().toISOString(),
        cached: false,
        error: `TinyFish API error: HTTP ${res.status}`,
      };
    }

    const json = await res.json();
    const rawResults: Array<{
      title?: string;
      url?: string;
      snippet?: string;
      published_date?: string;
      source?: string;
    }> = Array.isArray(json.results) ? json.results : [];

    const items: WebResearchItem[] = rawResults.slice(0, 5).map((r, index) => {
      const cleanTitle = sanitizeWebContent(r.title || "Nagpur Safety Report", 180);
      const cleanSnippet = sanitizeWebContent(r.snippet || "Public report regarding Nagpur urban safety.", 400);
      const cleanPublisher = sanitizeWebContent(r.source || "Nagpur Public News Source", 80);
      const rawUrl = r.url && (r.url.startsWith("http://") || r.url.startsWith("https://"))
        ? r.url
        : "https://nagpurpolice.gov.in";

      return {
        id: `tinyfish-item-${now}-${index}`,
        title: cleanTitle,
        url: rawUrl,
        snippet: cleanSnippet,
        publisher: cleanPublisher,
        publishedAt: r.published_date || undefined,
        retrievedAt: new Date().toISOString(),
        extractedFacts: extractFactsFromText(cleanTitle, cleanSnippet),
        uncertaintyOrLimitations: "Live public web report; verify official police records for legal proceedings.",
        isLiveWeb: true,
      };
    });

    // Cache successful results
    searchCache.set(cacheKey, { data: items, timestamp: now });

    return {
      success: true,
      isConfigured: true,
      query: effectiveQuery,
      items,
      sourceUrlList: items.map((i) => i.url),
      retrievalTimestamp: new Date().toISOString(),
      cached: false,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Unknown network error";
    console.warn("TinyFish Search fetch failed:", errorMsg);
    return {
      success: false,
      isConfigured: true,
      query: effectiveQuery,
      items: [],
      sourceUrlList: [],
      retrievalTimestamp: new Date().toISOString(),
      cached: false,
      error: `Network request to TinyFish failed: ${errorMsg}`,
    };
  }
}

export interface TinyFishFetchResultItem {
  url: string;
  title: string;
  content: string;
  status: number;
  isLiveFetch: boolean;
  retrievedAt: string;
}

/**
 * Fetches page content via TinyFish Fetch API (https://api.fetch.tinyfish.ai)
 * If TinyFish API key is unconfigured or returns an error, provides a graceful
 * server-side reader fallback for verified public web sources.
 */
export async function fetchTinyFishUrls(
  urls: string[],
  options: { purpose?: string; format?: "markdown" | "html" | "json" } = {}
): Promise<TinyFishFetchResultItem[]> {
  const apiKey = process.env.TINYFISH_API_KEY;
  const validUrls = urls
    .filter((u) => typeof u === "string" && (u.startsWith("http://") || u.startsWith("https://")))
    .slice(0, 3);

  if (validUrls.length === 0) {
    return [];
  }

  // 1. Try TinyFish Fetch API if configured
  if (isTinyFishConfigured() && apiKey) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

      const res = await fetch(TINYFISH_FETCH_API, {
        method: "POST",
        headers: {
          "X-API-Key": apiKey,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          urls: validUrls,
          format: options.format || "markdown",
          purpose: options.purpose || "Nagpur urban safety article extraction and verification",
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.results) && data.results.length > 0) {
          return data.results.map(
            (r: {
              url: string;
              title?: string;
              text?: string;
              content?: string;
              status?: number;
            }) => ({
              url: r.url,
              title: sanitizeWebContent(r.title || "Web Safety Article", 180),
              content: sanitizeWebContent(r.text || r.content || "", 3000),
              status: r.status || 200,
              isLiveFetch: true,
              retrievedAt: new Date().toISOString(),
            })
          );
        }
      } else {
        console.warn(`TinyFish Fetch API responded with HTTP ${res.status}`);
      }
    } catch (err) {
      console.warn("TinyFish Fetch API error, attempting direct reader fallback:", err);
    }
  }

  // 2. Direct reader fallback for public web articles when TinyFish is unconfigured or fails
  const fallbackResults: TinyFishFetchResultItem[] = [];
  for (const targetUrl of validUrls) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(targetUrl, {
        signal: controller.signal,
        headers: {
          "User-Agent": "N-SHIELD-SafetyAssistant/1.0 (Public Safety Verification)",
          Accept: "text/html,application/xhtml+xml,text/plain",
        },
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const rawText = await res.text();
        const titleMatch = rawText.match(/<title[^>]*>([^<]+)<\/title>/i);
        const title = titleMatch ? titleMatch[1].trim() : "Public Web Document";
        const cleanBody = sanitizeWebContent(rawText, 3000);

        fallbackResults.push({
          url: targetUrl,
          title: sanitizeWebContent(title, 180),
          content: cleanBody,
          status: res.status,
          isLiveFetch: false,
          retrievedAt: new Date().toISOString(),
        });
      }
    } catch {
      // Continue to next URL
    }
  }

  return fallbackResults;
}

/**
 * Executes a multi-step browser automation goal via TinyFish Agent API
 * Use only when browser interaction is explicitly necessary.
 */
export async function runTinyFishAgent(
  targetUrl: string,
  goal: string
): Promise<{ success: boolean; result?: string; error?: string }> {
  const apiKey = process.env.TINYFISH_API_KEY;
  if (!isTinyFishConfigured() || !apiKey) {
    return {
      success: false,
      error: "TINYFISH_API_KEY is not configured.",
    };
  }

  try {
    const controller = new AbortController();
    // Agent workflow allows up to 25s execution
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    const res = await fetch(TINYFISH_AGENT_API, {
      method: "POST",
      headers: {
        "X-API-Key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: targetUrl,
        goal: sanitizeWebContent(goal, 200),
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      return {
        success: false,
        error: `TinyFish Agent API returned HTTP ${res.status}`,
      };
    }

    const data = await res.json();
    return {
      success: true,
      result: sanitizeWebContent(data.result || data.summary || "Agent completed successfully.", 800),
    };
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : "Agent execution error";
    return {
      success: false,
      error: errMsg,
    };
  }
}
