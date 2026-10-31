import type {
  AreaRisk,
  NewsCategory,
  RealNewsArticle,
  RecognizedLocation,
  SafetyNewsArticle,
  SafetyNewsCategory,
} from "./newsTypes";

/**
 * Recognized Nagpur geographical sectors and landmark coordinates
 */
const NAGPUR_GEO_MAPPINGS: { keywords: string[]; name: string; lat: number; lng: number }[] = [
  { keywords: ["sitabuldi", "munje square", "variety square", "metro interchange"], name: "Sitabuldi", lat: 21.1489, lng: 79.0876 },
  { keywords: ["dharampeth", "zenda chowk", "whc road", "gokulpeth", "shivaji nagar"], name: "Dharampeth", lat: 21.1415, lng: 79.0535 },
  { keywords: ["sadar", "mount road", "residency road", "raj bhavan", "liberty chowk"], name: "Sadar", lat: 21.1612, lng: 79.0788 },
  { keywords: ["manish nagar", "somalwada railway crossing", "manish nagar flyover"], name: "Manish Nagar", lat: 21.0921, lng: 79.0689 },
  { keywords: ["wardha road", "somalwada", "chhatrapati square", "rahate colony", "khamla"], name: "Wardha Road", lat: 21.105, lng: 79.071 },
  { keywords: ["hingna", "midc hingna", "hingna road"], name: "Hingna", lat: 21.112, lng: 79.022 },
  { keywords: ["mankapur", "chhindwara road", "godhani", "mankapur stadium"], name: "Mankapur", lat: 21.189, lng: 79.076 },
  { keywords: ["jaripatka", "indora", "kadbi chowk", "kamal chowk", "pachpaoli"], name: "Jaripatka", lat: 21.178, lng: 79.089 },
  { keywords: ["itwari", "itwari market", "gandhibagh", "badkas square"], name: "Itwari", lat: 21.155, lng: 79.112 },
  { keywords: ["mahal", "tilak putla", "kotwali", "gandhi sagar"], name: "Mahal", lat: 21.144, lng: 79.111 },
  { keywords: ["nandanvan", "kdk college road", "nandanvan colony"], name: "Nandanvan", lat: 21.135, lng: 79.122 },
  { keywords: ["wadi", "amravati road", "datta wadi"], name: "Wadi", lat: 21.151, lng: 79.011 },
  { keywords: ["trimurti nagar", "ring road trimurti"], name: "Trimurti Nagar", lat: 21.121, lng: 79.041 },
  { keywords: ["pratap nagar", "pratap nagar square"], name: "Pratap Nagar", lat: 21.124, lng: 79.051 },
  { keywords: ["medical square", "gmch", "rambagh", "untkhana"], name: "Medical Square", lat: 21.1274, lng: 79.0968 },
  { keywords: ["ajni", "ajni square", "ajni railway station"], name: "Ajni", lat: 21.118, lng: 79.088 },
  { keywords: ["ganeshpeth", "cotton market", "st bus stand", "model mills"], name: "Ganeshpeth", lat: 21.1448, lng: 79.0988 },
  { keywords: ["lakadganj", "central avenue", "telephone exchange square", "garoba maidan"], name: "Lakadganj", lat: 21.1492, lng: 79.1189 },
  { keywords: ["pardi", "bhandara road", "kalamna", "surabardi", "chikhali"], name: "Pardi", lat: 21.1186, lng: 79.0954 },
  { keywords: ["kamptee road", "kamptee", "kanhan"], name: "Kamptee Road", lat: 21.201, lng: 79.115 },
  { keywords: ["civil lines", "high court", "vidhan bhavan", "ravi nagar"], name: "Civil Lines", lat: 21.154, lng: 79.0685 },
  { keywords: ["ramdaspeth", "dhantoli", "lokmat square", "canal road"], name: "Ramdaspeth", lat: 21.1384, lng: 79.0623 },
  { keywords: ["seminary hills", "tv tower", "cpeti"], name: "Seminary Hills", lat: 21.168, lng: 79.055 },
  { keywords: ["futala", "futala lake", "ambazari"], name: "Futala", lat: 21.152, lng: 79.042 },
  { keywords: ["besa", "pipla", "dighori"], name: "Besa", lat: 21.082, lng: 79.081 },
  { keywords: ["beltarodi", "shankarpur"], name: "Beltarodi", lat: 21.075, lng: 79.075 },
];

const NAGPUR_KEYWORDS = ["nagpur", "nagpur city", "nagpur district"];

const CRIME_KEYWORDS = [
  "crime", "criminal", "police", "arrest", "arrested", "accused", "booked", "fir", "seized",
  "theft", "stolen", "robbery", "robbed", "burglary", "housebreaking", "assault", "attacked",
  "murder", "killed", "homicide", "kidnapping", "kidnapped", "abducted", "rape", "molestation",
  "harassment", "chain snatching", "snatching", "fraud", "scam", "cybercrime", "cyber fraud",
  "smuggling", "drugs", "narcotics", "weapon", "firing", "shooting", "stabbing", "missing person",
  "posh case", "pocso", "liquor seized", "spurious liquor", "dacoity", "loot", "extortion", "racket"
];

const POLICE_ACTION_WORDS = [
  "arrested", "arrest", "accused", "booked", "fir", "seized", "stolen", "murder", "assault",
  "fraud", "missing", "raid", "racket", "busted", "crime", "killed", "robbery", "theft",
  "shooting", "firing", "investigating", "probe", "custody", "sleuths", "cop", "intercepts"
];

const EXCLUSION_KEYWORDS = [
  "cricket", "ipl", "tournament", "stadium", "bollywood", "cinema", "box office", "movie",
  "actor", "actress", "sensex", "nifty", "stock market", "election", "bjp", "congress",
  "voter", "campaign", "weather", "monsoon", "rainfall", "lifestyle", "fashion",
  "tech launch", "advertisement", "opinion"
];

/**
 * Validate that an article is strictly Nagpur-related AND Crime-related
 */
export function isValidNagpurCrimeArticle(title: string, description?: string | null, content?: string | null): boolean {
  const searchableText = [title, description, content].filter(Boolean).join(" ").toLowerCase();

  // 1. Must contain a Nagpur reference or recognized locality
  const hasNagpurKeyword = NAGPUR_KEYWORDS.some((kw) => searchableText.includes(kw));
  const hasNagpurLocality = NAGPUR_GEO_MAPPINGS.some((m) => m.keywords.some((kw) => searchableText.includes(kw)));
  if (!hasNagpurKeyword && !hasNagpurLocality) return false;

  // Check exclusion keywords unless strong crime action word exists
  const hasExclusion = EXCLUSION_KEYWORDS.some((kw) => searchableText.includes(kw));
  const hasStrongCrimeWord = [
    "murder", "murdered", "killed", "arrested", "stolen", "theft", "robbery", "robbed", "assault",
    "burglary", "rape", "molestation", "kidnapped", "fraud", "scam", "seized", "firing", "stabbing", "liquor"
  ].some((kw) => searchableText.includes(kw));

  if (hasExclusion && !hasStrongCrimeWord) return false;

  // 2. Must contain an approved crime keyword
  const hasCrimeKeyword = CRIME_KEYWORDS.some((kw) => searchableText.includes(kw));
  if (!hasCrimeKeyword) return false;

  // 3. "police" alone rule: If the only crime keyword is "police", must have a crime action word
  const matchedKeywords = CRIME_KEYWORDS.filter((kw) => searchableText.includes(kw));
  if (matchedKeywords.length === 1 && matchedKeywords[0] === "police") {
    const hasAction = POLICE_ACTION_WORDS.some((word) => searchableText.includes(word));
    if (!hasAction) return false;
  }

  return true;
}

/**
 * Extract specific recognizable Nagpur sector or return null if not reliably found
 */
export function extractNagpurLocation(text: string): RecognizedLocation | null {
  const normalized = text.toLowerCase();

  for (const mapping of NAGPUR_GEO_MAPPINGS) {
    for (const keyword of mapping.keywords) {
      if (normalized.includes(keyword)) {
        return {
          name: mapping.name,
          lat: mapping.lat,
          lng: mapping.lng,
          isSpecificZone: true,
        };
      }
    }
  }

  return null;
}

/**
 * Strict Multi-Layer Crime Category Classifier
 */
export function classifyNewsCategory(
  title: string,
  description?: string | null
): { category: NewsCategory; isCrime: boolean } {
  const content = `${title} ${description || ""}`.toLowerCase();

  // 1. VEHICLE THEFT
  const vehicleTheftPatterns = [
    "vehicle theft", "car theft", "bike theft", "motorcycle theft", "scooter theft",
    "stolen vehicle", "stolen car", "stolen bike", "stolen motorcycle", "stolen scooter",
    "two-wheeler theft", "two wheeler theft", "auto theft", "stole bike", "stole car"
  ];
  if (vehicleTheftPatterns.some((pattern) => content.includes(pattern))) {
    return { category: "Vehicle Theft", isCrime: true };
  }

  // 2. BURGLARY
  const burglaryPatterns = [
    "burglary", "burglar", "break-in", "break in", "broke into", "breaking into",
    "housebreaking", "house breaking", "shop break-in", "locker broken"
  ];
  if (burglaryPatterns.some((pattern) => content.includes(pattern))) {
    return { category: "Burglary", isCrime: true };
  }

  // 3. ROBBERY
  const robberyPatterns = [
    "robbery", "robbed", "robbers", "robber", "armed robbery", "loot", "looted",
    "dacoity", "dacoit", "gunpoint", "knifepoint", "heist"
  ];
  if (robberyPatterns.some((pattern) => content.includes(pattern))) {
    return { category: "Robbery", isCrime: true };
  }

  // 4. MURDER
  const murderPatterns = [
    "murder", "murdered", "killed", "homicide", "slain", "hacked to death", "body found"
  ];
  if (murderPatterns.some((pattern) => content.includes(pattern))) {
    return { category: "Murder", isCrime: true };
  }

  // 5. CRIMES AGAINST WOMEN
  const womenCrimePatterns = [
    "rape", "molestation", "molested", "harassment", "eve teasing", "posh case",
    "pocso", "sexual assault", "assaulted woman", "girl molested"
  ];
  if (womenCrimePatterns.some((pattern) => content.includes(pattern))) {
    return { category: "Crimes Against Women", isCrime: true };
  }

  // 6. KIDNAPPING
  const kidnappingPatterns = [
    "kidnapping", "kidnapped", "abducted", "abduction", "ransom"
  ];
  if (kidnappingPatterns.some((pattern) => content.includes(pattern))) {
    return { category: "Kidnapping", isCrime: true };
  }

  // 7. ASSAULT
  const assaultPatterns = [
    "assault", "assaulted", "attacked", "violent attack", "physical altercation",
    "beaten up", "brutally beaten", "stabbed", "stabbing", "firing", "shooting"
  ];
  if (assaultPatterns.some((pattern) => content.includes(pattern))) {
    return { category: "Assault", isCrime: true };
  }

  // 8. CYBERCRIME
  const cybercrimePatterns = [
    "cybercrime", "cyber crime", "online fraud", "digital fraud", "phishing",
    "cyber scam", "otp fraud", "sim swap"
  ];
  if (cybercrimePatterns.some((pattern) => content.includes(pattern))) {
    return { category: "Cybercrime", isCrime: true };
  }

  // 9. FRAUD
  const fraudPatterns = [
    "fraud", "scam", "cheating", "extortion", "financial fraud", "fake job", "bogus"
  ];
  if (fraudPatterns.some((pattern) => content.includes(pattern))) {
    return { category: "Fraud", isCrime: true };
  }

  // 10. DRUGS AND SMUGGLING
  const drugSmugglingPatterns = [
    "drugs", "narcotics", "smuggling", "contraband", "ganja", "heroin",
    "liquor seized", "spurious liquor", "illicit liquor", "firearms seized"
  ];
  if (drugSmugglingPatterns.some((pattern) => content.includes(pattern))) {
    return { category: "Drugs and Smuggling", isCrime: true };
  }

  // 11. MISSING PERSON
  const missingPersonPatterns = [
    "missing person", "missing child", "missing girl", "missing boy", "missing woman",
    "missing man", "reported missing", "went missing", "disappeared"
  ];
  if (missingPersonPatterns.some((pattern) => content.includes(pattern))) {
    return { category: "Missing Person", isCrime: true };
  }

  // 12. THEFT
  const theftPatterns = [
    "theft", "thieves", "thief", "stolen", "stealing", "stole", "snatching",
    "chain snatching", "chain snatcher", "pickpocket", "cash stolen", "gold stolen"
  ];
  if (theftPatterns.some((pattern) => content.includes(pattern))) {
    return { category: "Theft", isCrime: true };
  }

  // 13. OTHER CRIME
  return {
    category: "Other Crime",
    isCrime: true,
  };
}

/**
 * Checks if a category is part of "All Crimes"
 */
export function isCrimeCategory(cat: NewsCategory): boolean {
  return cat !== "All Updates";
}

/**
 * Deduplicate real news articles by link, ID, or title
 */
export function deduplicateArticles(articles: RealNewsArticle[]): RealNewsArticle[] {
  const seen = new Set<string>();
  const results: RealNewsArticle[] = [];

  for (const article of articles) {
    const key = article.link || article.id || article.title;
    if (!seen.has(key)) {
      seen.add(key);
      results.push(article);
    }
  }

  return results;
}

/**
 * Format relative time (e.g. "2 hours ago", "45 mins ago", "Yesterday")
 */
export function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Recently";

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return "Recently";
  }
}

/**
 * Clean & normalize source name neutrally
 */
export function formatSourceName(sourceId?: string | null, sourceName?: string | null): string {
  if (sourceName && sourceName.trim().length > 0) return sourceName.trim();
  if (sourceId && sourceId.trim().length > 0) {
    return sourceId
      .replace(/[_\-]/g, " ")
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }
  return "News Source";
}

/**
 * Parse raw NewsAPI.org article into standardized RealNewsArticle
 */
export function parseNewsApiArticle(rawItem: any, index: number): RealNewsArticle {
  const title = (rawItem.title || "Nagpur Public Safety Report").trim();
  const description = (rawItem.description || rawItem.content || "").trim();
  const content = (rawItem.content || rawItem.description || "").trim();
  const combinedText = `${title} ${description} ${content}`;

  const { category, isCrime } = classifyNewsCategory(title, description);
  const location = extractNagpurLocation(combinedText);
  const sourceName = formatSourceName(rawItem.source?.id, rawItem.source?.name || rawItem.author);
  const pubDate = rawItem.publishedAt || new Date().toISOString();
  const relativeTime = formatRelativeTime(pubDate);

  const articleUrl = rawItem.url || `https://newsapi.org/article/${index}`;
  const idStr = `${articleUrl}-${title}-${pubDate}`;
  let hash = 0;
  for (let i = 0; i < idStr.length; i++) {
    hash = (hash << 5) - hash + idStr.charCodeAt(i);
    hash |= 0;
  }
  const stableId = `newsapi-${Math.abs(hash).toString(36)}`;

  return {
    id: stableId,
    title,
    description,
    content,
    link: articleUrl,
    source: sourceName,
    sourceName,
    sourceUrl: articleUrl,
    imageUrl: rawItem.urlToImage || null,
    pubDate,
    publishedAt: pubDate,
    relativeTime,
    category,
    isCrime,
    sourceType: "news",
    location,
    latitude: location ? location.lat : null,
    longitude: location ? location.lng : null,
    verificationStatus: "Reported by News Source",
  };
}

/**
 * Parse Google News RSS item into standardized RealNewsArticle
 */
export function parseGoogleNewsItem(
  item: { title: string; link: string; pubDate: string; source: string },
  index: number
): RealNewsArticle {
  const rawTitle = item.title || "Nagpur Urban Safety Report";
  const cleanTitle = rawTitle.replace(/\s*-\s*[^-]+$/, "").trim();
  const description = `${cleanTitle} reported by ${item.source || "News Source"} in Nagpur.`;
  const combinedText = `${cleanTitle} ${description}`;

  const { category, isCrime } = classifyNewsCategory(cleanTitle, description);
  const location = extractNagpurLocation(combinedText);
  const sourceName = formatSourceName(null, item.source);
  const pubDate = item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString();
  const relativeTime = formatRelativeTime(pubDate);

  const idStr = `${item.link}-${cleanTitle}-${pubDate}`;
  let hash = 0;
  for (let i = 0; i < idStr.length; i++) {
    hash = (hash << 5) - hash + idStr.charCodeAt(i);
    hash |= 0;
  }
  const stableId = `rss-${Math.abs(hash).toString(36)}`;

  return {
    id: stableId,
    title: cleanTitle,
    description,
    content: description,
    link: item.link || "https://news.google.com",
    source: sourceName,
    sourceName,
    sourceUrl: item.link || "https://news.google.com",
    imageUrl: null,
    pubDate,
    publishedAt: pubDate,
    relativeTime,
    category,
    isCrime,
    sourceType: "news",
    location,
    latitude: location ? location.lat : null,
    longitude: location ? location.lng : null,
    verificationStatus: "Reported by News Source",
  };
}

/**
 * Parse raw NewsData.io article into standardized RealNewsArticle
 */
export function parseNewsDataArticle(rawItem: any, index: number): RealNewsArticle {
  const title = (rawItem.title || "Nagpur Urban Safety Report").trim();
  const description = (rawItem.description || rawItem.content || "").trim();
  const content = (rawItem.content || rawItem.description || "").trim();
  const combinedText = `${title} ${description}`;

  const { category, isCrime } = classifyNewsCategory(title, description);
  const location = extractNagpurLocation(combinedText);
  const sourceName = formatSourceName(rawItem.source_id, rawItem.source_name || rawItem.creator?.[0]);
  const pubDate = rawItem.pubDate || new Date().toISOString();
  const relativeTime = formatRelativeTime(pubDate);

  const articleUrl = rawItem.link || "https://newsdata.io";
  const idStr = `${articleUrl}-${title}-${pubDate}`;
  let hash = 0;
  for (let i = 0; i < idStr.length; i++) {
    hash = (hash << 5) - hash + idStr.charCodeAt(i);
    hash |= 0;
  }
  const stableId = `newsdata-${Math.abs(hash).toString(36)}`;

  return {
    id: rawItem.article_id || stableId,
    title,
    description,
    content,
    link: articleUrl,
    source: sourceName,
    sourceName,
    sourceUrl: rawItem.source_url || articleUrl,
    imageUrl: rawItem.image_url || null,
    pubDate,
    publishedAt: pubDate,
    relativeTime,
    category,
    isCrime,
    sourceType: "news",
    location,
    latitude: location ? location.lat : null,
    longitude: location ? location.lng : null,
    verificationStatus: "Reported by News Source",
  };
}

/**
 * Aggregate incidents by area and compute AreaRisk values
 */
export function calculateAreaRisks(articles: RealNewsArticle[]): AreaRisk[] {
  const areaMap = new Map<
    string,
    {
      area: string;
      latitude: number;
      longitude: number;
      incidentCount: number;
      recentIncidentCount: number;
      weightedScore: number;
      categories: Record<string, number>;
      latestIncidentAt: string;
    }
  >();

  const nowMs = Date.now();
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;

  for (const article of articles) {
    if (!article.location || article.latitude === null || article.longitude === null) continue;

    const areaName = article.location.name;
    const pubTime = new Date(article.pubDate || article.publishedAt).getTime();
    const ageDays = Math.max(0, (nowMs - pubTime) / ONE_DAY_MS);
    const isRecent = ageDays <= 7;

    let severityWeight = 1.0;
    if (article.category === "Murder" || article.category === "Assault" || article.category === "Robbery") severityWeight = 2.5;
    else if (article.category === "Burglary" || article.category === "Vehicle Theft" || article.category === "Crimes Against Women") severityWeight = 2.0;
    else if (article.category === "Kidnapping" || article.category === "Drugs and Smuggling" || article.category === "Cybercrime") severityWeight = 1.8;
    else severityWeight = 1.5;

    const recencyWeight = ageDays <= 1 ? 2.5 : ageDays <= 7 ? 1.8 : ageDays <= 30 ? 1.2 : 0.8;

    if (!areaMap.has(areaName)) {
      areaMap.set(areaName, {
        area: areaName,
        latitude: article.latitude,
        longitude: article.longitude,
        incidentCount: 0,
        recentIncidentCount: 0,
        weightedScore: 0,
        categories: {},
        latestIncidentAt: article.pubDate || article.publishedAt,
      });
    }

    const item = areaMap.get(areaName)!;
    item.incidentCount += 1;
    if (isRecent) item.recentIncidentCount += 1;
    item.weightedScore += severityWeight * recencyWeight * 12;
    item.categories[article.category] = (item.categories[article.category] || 0) + 1;

    if (new Date(article.pubDate || article.publishedAt).getTime() > new Date(item.latestIncidentAt).getTime()) {
      item.latestIncidentAt = article.pubDate || article.publishedAt;
    }
  }

  return Array.from(areaMap.values()).map((item) => {
    const rawScore = Math.round(item.weightedScore + item.incidentCount * 8);
    const riskScore = Math.min(100, Math.max(0, rawScore));
    let riskLevel: "Low" | "Medium" | "High" = "Low";
    if (riskScore >= 70) riskLevel = "High";
    else if (riskScore >= 40) riskLevel = "Medium";

    return {
      area: item.area,
      latitude: item.latitude,
      longitude: item.longitude,
      incidentCount: item.incidentCount,
      recentIncidentCount: item.recentIncidentCount,
      riskScore,
      riskLevel,
      categories: item.categories,
      latestIncidentAt: item.latestIncidentAt,
    };
  });
}

/**
 * Calculate dynamic counts for each category from fetched articles
 */
export function calculateCategoryCounts(articles: RealNewsArticle[]): Record<NewsCategory, number> {
  const counts: Record<NewsCategory, number> = {
    "All Updates": articles.length,
    "All Crimes": articles.length,
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

  for (const article of articles) {
    if (article.category in counts) {
      counts[article.category]++;
    }
  }

  return counts;
}
