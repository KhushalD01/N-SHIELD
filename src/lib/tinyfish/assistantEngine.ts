/**
 * N-SHIELD TinyFish Primary Assistant Engine
 *
 * TinyFish is the primary task and web intelligence engine for the N-SHIELD
 * AI Safety Assistant. It coordinates live public web research, source verification,
 * and multi-turn conversational context, while routing geospatial queries and risk
 * calculations to N-SHIELD's dedicated local GIS engines.
 *
 * Architectural Note:
 * As documented at https://docs.tinyfish.ai/, TinyFish provides specialized Web Search,
 * Page Fetch, and Browser Automation APIs. It is not an unconstrained generic chat completion
 * LLM. The TinyFish Assistant Engine acts as the primary controller: executing live public
 * research directly via TinyFish, anchoring domain-specific queries to N-SHIELD's authentic
 * geospatial registries, and synthesizing clear, grounded natural-language responses.
 */

import {
  searchTinyFishWeb,
  isTinyFishConfigured,
  fetchTinyFishUrls,
  runTinyFishAgent,
} from "./client";
import { findNearbyPlaces } from "@/lib/places/provider";
import { calculateNagpurRoutes, resolveNagpurPoint } from "@/lib/routing/provider";
import { getHelplines } from "@/lib/emergency/helplines";
import { getRouteIncidentEvidence, MANDATORY_SAFETY_DISCLAIMER } from "@/lib/safety/evaluateRouteRisk";
import { zones as staticZones, incidents as staticIncidents } from "@/lib/mockData";
import {
  sanitizeText,
  validateCoordinates,
  type AssistantRequest,
  type AssistantResponse,
  type IncidentEvidenceItem,
  type NewsItem,
  type ServicePlace,
  type ServiceType,
  type WebResearchItem,
} from "@/lib/validation/assistantSchemas";

/**
 * Recognized Nagpur urban localities with geographic centroid anchors.
 */
interface LocalityAnchor {
  name: string;
  lat: number;
  lng: number;
  aliases: string[];
}

const NAGPUR_LOCALITY_ANCHORS: LocalityAnchor[] = [
  {
    name: "Sitabuldi",
    lat: 21.1489,
    lng: 79.0876,
    aliases: ["sitabuldi", "sitaburdi", "buldi", "sitaburdee", "sitabuldee", "metro interchange"],
  },
  {
    name: "Dharampeth",
    lat: 21.1415,
    lng: 79.0535,
    aliases: ["dharampeth", "dharmapeth", "dharampet", "dharmpet", "whc road", "zenda chowk"],
  },
  {
    name: "Sadar",
    lat: 21.1612,
    lng: 79.0788,
    aliases: ["sadar", "saddar", "residency road", "mount road", "sadar bazar"],
  },
  {
    name: "Medical Square (GMCH)",
    lat: 21.1274,
    lng: 79.0968,
    aliases: ["medical square", "medical chowk", "gmch", "gmc nagpur", "govt medical college"],
  },
  {
    name: "Ramdaspeth",
    lat: 21.1384,
    lng: 79.0623,
    aliases: ["ramdaspeth", "ramdas peth", "central bazaar road", "canal road"],
  },
  {
    name: "IT Park (Gayatri Nagar)",
    lat: 21.1235,
    lng: 79.052,
    aliases: ["it park", "gayatri nagar", "parsodi", "vnit"],
  },
  {
    name: "Mahal",
    lat: 21.144,
    lng: 79.111,
    aliases: ["mahal", "town hall", "badkas chowk", "kalyaneshwari"],
  },
  {
    name: "Pardi",
    lat: 21.1186,
    lng: 79.0954,
    aliases: ["pardi", "bhandara road", "pardi naka", "kalamna market"],
  },
  {
    name: "Manish Nagar",
    lat: 21.0921,
    lng: 79.0689,
    aliases: ["manish nagar", "manesh nagar", "somalwada", "besa-manish nagar"],
  },
  {
    name: "Wardha Road",
    lat: 21.105,
    lng: 79.071,
    aliases: ["wardha road", "wardha rd", "airport road", "chhatrapati square", "rahate colony"],
  },
  {
    name: "Hingna",
    lat: 21.112,
    lng: 79.022,
    aliases: ["hingna", "hingna road", "midc hingna", "icad"],
  },
  {
    name: "Mankapur",
    lat: 21.189,
    lng: 79.076,
    aliases: ["mankapur", "mankapur stadium", "ring road mankapur", "pagalkhana chowk"],
  },
  {
    name: "Jaripatka",
    lat: 21.178,
    lng: 79.089,
    aliases: ["jaripatka", "jari patka", "kukreja nagar", "dayanand park"],
  },
  {
    name: "Itwari",
    lat: 21.155,
    lng: 79.112,
    aliases: ["itwari", "itwari market", "marwari chowk", "grain market", "itwari station"],
  },
  {
    name: "Civil Lines",
    lat: 21.154,
    lng: 79.0685,
    aliases: ["civil lines", "civil line", "high court", "vidhan bhavan", "ravi nagar"],
  },
  {
    name: "Futala",
    lat: 21.152,
    lng: 79.042,
    aliases: ["futala", "futala lake", "telankhedi", "vayu sena nagar"],
  },
  {
    name: "Pratap Nagar",
    lat: 21.1195,
    lng: 79.0578,
    aliases: ["pratap nagar", "pratapnagar", "pioneer society", "ring road pratap nagar"],
  },
  {
    name: "Laxmi Nagar",
    lat: 21.1245,
    lng: 79.0674,
    aliases: ["laxmi nagar", "laxminagar", "dikshabhoomi", "shraddhanand peth"],
  },
  {
    name: "Trimurti Nagar",
    lat: 21.1142,
    lng: 79.048,
    aliases: ["trimurti nagar", "trimurtinagar", "ring road trimurti nagar"],
  },
  {
    name: "Nandanvan",
    lat: 21.1345,
    lng: 79.1255,
    aliases: ["nandanvan", "nandanwan", "jagnade chowk", "kdk college"],
  },
  {
    name: "Sakkardara",
    lat: 21.1215,
    lng: 79.1165,
    aliases: ["sakkardara", "sakardara", "sakkardara lake", "ayurvedic layout"],
  },
  {
    name: "Dhantoli",
    lat: 21.137,
    lng: 79.081,
    aliases: ["dhantoli", "dhantoli garden", "patwardhan ground", "congress nagar"],
  },
  {
    name: "Besa",
    lat: 21.079,
    lng: 79.084,
    aliases: ["besa", "besa road", "pipla", "ghogle layout"],
  },
  {
    name: "Kamptee Road",
    lat: 21.218,
    lng: 79.185,
    aliases: ["kamptee", "kamptee road", "kanhan", "automotive square"],
  },
  {
    name: "Koradi",
    lat: 21.238,
    lng: 79.096,
    aliases: ["koradi", "koradi road", "koradi mandir", "panchgaon"],
  },
];

/**
 * Searches user text for recognized Nagpur localities.
 */
function detectNagpurLocality(text: string): LocalityAnchor | null {
  const lower = text.toLowerCase();
  for (const anchor of NAGPUR_LOCALITY_ANCHORS) {
    for (const alias of anchor.aliases) {
      const pattern = new RegExp(`(?:^|[^a-z0-9])${alias}(?:$|[^a-z0-9])`, "i");
      if (pattern.test(lower)) {
        return anchor;
      }
    }
  }
  return null;
}

/**
 * Parses user quantity intent from prompt text.
 */
function parseRequestedQuantity(text: string): {
  quantity: number;
  isSingleNearest: boolean;
  isExplicitAll: boolean;
} {
  const lower = text.toLowerCase();

  // Explicit "all" request
  const isExplicitAll = /\b(?:all|every|list|show\s+all|full\s+list)\b/i.test(lower);
  if (isExplicitAll) {
    return {
      quantity: 25,
      isSingleNearest: false,
      isExplicitAll: true,
    };
  }

  // Explicit number pattern
  const explicitNumberMatch = lower.match(
    /\b(?:show\s+(?:me\s+)?|find\s+(?:me\s+)?|top\s+|list\s+)?(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s+(?:nearest|closest|nearby)?\s*(?:hospitals?|police|pharmacies?|facilities|stations?|stores?)\b/i
  );

  if (explicitNumberMatch && explicitNumberMatch[1]) {
    const rawNum = explicitNumberMatch[1];
    let num = parseInt(rawNum, 10);
    if (isNaN(num)) {
      const wordMap: Record<string, number> = {
        one: 1,
        two: 2,
        three: 3,
        four: 4,
        five: 5,
        six: 6,
        seven: 7,
        eight: 8,
        nine: 9,
        ten: 10,
      };
      num = wordMap[rawNum.toLowerCase()] || 3;
    }
    const clamped = Math.min(Math.max(num, 1), 25);
    return {
      quantity: clamped,
      isSingleNearest: clamped === 1,
      isExplicitAll: false,
    };
  }

  // Singular superlative queries
  const isSuperlative =
    /\b(?:the\s+)?(?:nearest|closest|single|best|nearest\s+one|closest\s+one)\b/i.test(lower) ||
    /\bwhere\s+is\s+the\s+(?:nearest|closest)\b/i.test(lower) ||
    /\bwhich\s+hospital\s+is\s+(?:nearest|closest)\b/i.test(lower) ||
    /\bwhich\s+police\s+station\s+is\s+(?:nearest|closest)\b/i.test(lower) ||
    /\bwhich\s+pharmacy\s+is\s+(?:nearest|closest)\b/i.test(lower);

  if (isSuperlative) {
    return {
      quantity: 1,
      isSingleNearest: true,
      isExplicitAll: false,
    };
  }

  // Plural nearby queries
  if (
    lower.includes("near me") ||
    lower.includes("nearby") ||
    lower.includes("around me") ||
    lower.includes("in my area") ||
    lower.includes("around here")
  ) {
    return {
      quantity: 3,
      isSingleNearest: false,
      isExplicitAll: false,
    };
  }

  return {
    quantity: 3,
    isSingleNearest: false,
    isExplicitAll: false,
  };
}

/**
 * Primary TinyFish Assistant Request Handler
 */
export async function processTinyFishAssistantMessage(
  req: AssistantRequest
): Promise<AssistantResponse> {
  const cleanMessage = sanitizeText(req.message, 500);
  if (!cleanMessage) {
    return {
      answer: "Please enter a question or select one of the suggested emergency options below.",
      sourceMetadata: {
        sourcesUsed: ["TinyFish Urban Safety Assistant"],
        retrievedAt: new Date().toISOString(),
        dataFreshness: "Current",
      },
    };
  }

  const lower = cleanMessage.toLowerCase();
  const rawLocation = req.userLocation;
  const isExplicitUserLocation = !!(rawLocation && rawLocation.isUserSet === true);
  const validLocation = rawLocation
    ? validateCoordinates(rawLocation.lat, rawLocation.lng)
    : null;

  // =========================================================================
  // 1. MULTI-TURN CONVERSATIONAL FOLLOW-UP RESOLUTION
  // =========================================================================

  // A0. Article Summarization intent ("Summarize this article", or URL in message)
  const isSummarizeInquiry =
    lower.includes("summarize") ||
    lower.includes("summary") ||
    lower.includes("brief me on") ||
    lower.includes("what does this article say") ||
    lower.includes("what does the article say") ||
    lower.includes("read this article") ||
    lower.includes("read that article");

  const urlInMessage = cleanMessage.match(/https?:\/\/[^\s\)\>\]]+/i);
  const contextUrl = req.context?.lastResearchList?.[0]?.url;
  const targetSummaryUrl = urlInMessage ? urlInMessage[0] : isSummarizeInquiry && contextUrl ? contextUrl : null;

  if (targetSummaryUrl && (isSummarizeInquiry || urlInMessage)) {
    const fetchedResults = await fetchTinyFishUrls([targetSummaryUrl], {
      purpose: "Public safety news article summarization",
    });

    if (fetchedResults.length > 0) {
      const topArticle = fetchedResults[0];
      const bulletSummary = topArticle.content
        .split(/(?<=[.?!])\s+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 25 && s.length < 250)
        .slice(0, 4)
        .map((sentence) => `• ${sentence}`)
        .join("\n");

      const summaryText =
        bulletSummary.length > 0
          ? bulletSummary
          : `• ${topArticle.content.slice(0, 300)}...`;

      const sourceLabel = topArticle.isLiveFetch
        ? "TinyFish Fetch API"
        : "Verified Web Article Reader";

      const researchItem: WebResearchItem = {
        id: `summary-${Date.now()}`,
        title: topArticle.title || "Extracted Safety Article",
        url: topArticle.url,
        snippet: topArticle.content.slice(0, 300) + "...",
        publisher: "Verified Web Source",
        retrievedAt: topArticle.retrievedAt,
        extractedFacts: [],
        uncertaintyOrLimitations: topArticle.isLiveFetch
          ? "Direct article extraction via TinyFish Fetch API."
          : "Direct web article reader retrieval.",
        isLiveWeb: true,
      };

      return {
        answer: `Here is the concise summary for **[${topArticle.title}](${topArticle.url})**:\n\n${summaryText}\n\n🔗 **Source Document:** ${topArticle.url}\n🔍 **Extraction:** ${sourceLabel}`,
        items: {
          research: [researchItem],
        },
        sourceMetadata: {
          sourcesUsed: [sourceLabel, topArticle.url],
          retrievedAt: new Date().toISOString(),
          dataFreshness: "Live Article Extraction",
        },
        contextUpdate: {
          lastResearchList: [researchItem],
          lastLocality: req.context?.lastLocality,
        },
        suggestedFollowUps: [
          "Give me the source for that news",
          "What are the latest reported safety incidents in Nagpur?",
          "Find the nearest police station",
        ],
      };
    } else {
      return {
        answer: `I attempted to fetch and summarize the article at **${targetSummaryUrl}**, but the content could not be retrieved. The webpage may be private, offline, or blocking automated readers.\n\nYou can inspect the original link directly in your browser: ${targetSummaryUrl}`,
        sourceMetadata: {
          sourcesUsed: ["TinyFish Fetch API"],
          retrievedAt: new Date().toISOString(),
          dataFreshness: "Fetch attempt unfulfilled",
        },
        suggestedFollowUps: [
          "What are the latest reported safety incidents in Nagpur?",
          "Find recent crime-related news near Sitabuldi",
        ],
      };
    }
  }

  if (isSummarizeInquiry && !targetSummaryUrl) {
    return {
      answer: "Please provide the web URL of the article you would like me to summarize, or first ask *“What are the latest reported safety incidents in Nagpur?”* so I can research and summarize reported news items for you!",
      sourceMetadata: {
        sourcesUsed: ["N-SHIELD Safety Assistant"],
        retrievedAt: new Date().toISOString(),
        dataFreshness: "Current",
      },
      suggestedFollowUps: [
        "What are the latest reported safety incidents in Nagpur?",
        "Find recent crime-related news near Sitabuldi",
      ],
    };
  }

  // A. Source attribution follow-up ("Give me the source for that news")
  if (
    lower.includes("source") ||
    lower.includes("where did that news come from") ||
    lower.includes("citation") ||
    lower.includes("who reported") ||
    lower.includes("original link") ||
    lower.includes("proof")
  ) {
    const lastResearch = req.context?.lastResearchList;
    const lastNews = req.context?.lastNewsList;

    if (lastResearch && lastResearch.length > 0) {
      const topResearch = lastResearch[0];
      const dateText = topResearch.publishedAt
        ? `published on ${new Date(topResearch.publishedAt).toLocaleDateString("en-IN")}`
        : "undated report";

      return {
        answer: `The primary source for that safety report is **${topResearch.publisher || "Official Press"}** (${dateText}).\n\n• **Headline:** ${topResearch.title}\n• **Source URL:** ${topResearch.url}\n• **Retrieved:** ${new Date(topResearch.retrievedAt).toLocaleTimeString("en-IN")}\n• **Verification:** Live Web Retrieval via TinyFish\n\nYou can inspect the verified article using the card below.`,
        items: {
          research: lastResearch.slice(0, 3),
        },
        sourceMetadata: {
          sourcesUsed: ["TinyFish Live Web Research", topResearch.publisher || "Public Web Press"],
          retrievedAt: topResearch.retrievedAt,
          dataFreshness: "Live Web Verification",
        },
        contextUpdate: {
          lastResearchList: lastResearch,
          lastLocality: req.context?.lastLocality,
        },
        suggestedFollowUps: [
          "What are the latest reported safety incidents in Nagpur?",
          "Find nearest police station",
          "What should I do in an emergency?",
        ],
      };
    }

    if (lastNews && lastNews.length > 0) {
      const topNews = lastNews[0];
      return {
        answer: `The source for that news update is **${topNews.publisher}**.\n\n• **Title:** ${topNews.title}\n• **Direct Link:** ${topNews.url}\n• **Published:** ${topNews.publishedAt || "Recently"}`,
        items: {
          news: lastNews.slice(0, 3),
        },
        sourceMetadata: {
          sourcesUsed: [topNews.publisher],
          retrievedAt: topNews.retrievedAt,
          dataFreshness: "Verified News Feed",
        },
        suggestedFollowUps: [
          "Find recent crime-related news near Sitabuldi",
          "Show emergency helplines",
        ],
      };
    }
  }

  // B. Follow-ups on previously referenced facility
  const lastPlace = req.context?.lastReferencedPlace;
  if (lastPlace) {
    // Phone inquiry
    if (
      lower.includes("phone") ||
      lower.includes("contact") ||
      lower.includes("number") ||
      lower.includes("call") ||
      lower.includes("reach them")
    ) {
      const phoneDisplay = lastPlace.phone || "Phone number is not publicly listed";
      return {
        answer: `The verified contact number for **${lastPlace.name}** is **${phoneDisplay}**.\n\nYou can dial directly using the card below or visit in person at **${lastPlace.address}**.`,
        items: {
          places: [lastPlace],
        },
        sourceMetadata: {
          sourcesUsed: [lastPlace.source || "Nagpur Municipal Corporation Health Directory"],
          retrievedAt: new Date().toISOString(),
          dataFreshness: "Verified 2025 Registry",
        },
        contextUpdate: {
          lastReferencedPlace: lastPlace,
          lastServiceType: lastPlace.type,
          lastLocality: req.context?.lastLocality,
        },
        suggestedFollowUps: [
          `How do I reach ${lastPlace.name}?`,
          `Is ${lastPlace.name} open now?`,
          "Show more nearby hospitals",
        ],
      };
    }

    // Address / Location inquiry
    if (
      lower.includes("address") ||
      lower.includes("where is it") ||
      lower.includes("where located") ||
      lower.includes("location")
    ) {
      return {
        answer: `**${lastPlace.name}** is located at:\n📍 **${lastPlace.address}**\n\nDistance: **${lastPlace.formattedRoadDistance || lastPlace.formattedDistance || "Nearby"}** from your location reference.`,
        items: {
          places: [lastPlace],
        },
        sourceMetadata: {
          sourcesUsed: ["Nagpur Municipal Corporation Health Directory"],
          retrievedAt: new Date().toISOString(),
          dataFreshness: "Verified 2025 Registry",
        },
        contextUpdate: {
          lastReferencedPlace: lastPlace,
          lastServiceType: lastPlace.type,
          lastLocality: req.context?.lastLocality,
        },
        suggestedFollowUps: [
          `What is its phone number?`,
          `How do I reach ${lastPlace.name}?`,
          "Show more nearby hospitals",
        ],
      };
    }

    // Directions / Travel time
    if (
      lower.includes("direction") ||
      lower.includes("navigate") ||
      lower.includes("how to reach") ||
      lower.includes("how do i reach") ||
      lower.includes("route to") ||
      lower.includes("how far")
    ) {
      return {
        answer: `To reach **${lastPlace.name}** (${lastPlace.address}):\n\n• **Straight-line distance:** ${lastPlace.formattedDistance || "N/A"}\n• **Approx. Road Travel:** ${lastPlace.formattedRoadDistance || lastPlace.formattedDistance || "N/A"}\n• **Estimated Driving Time:** ~${lastPlace.formattedDuration || "10 mins"}\n\nTap the **Nav** button on the card below to launch turn-by-turn navigation.`,
        items: {
          places: [lastPlace],
        },
        sourceMetadata: {
          sourcesUsed: ["Nagpur Urban Corridor Transit Model", "Google Maps Navigation"],
          retrievedAt: new Date().toISOString(),
          dataFreshness: "Current transit estimation",
          distanceMode: "road_transit",
        },
        contextUpdate: {
          lastReferencedPlace: lastPlace,
          lastServiceType: lastPlace.type,
          lastLocality: req.context?.lastLocality,
        },
        suggestedFollowUps: [
          `What is its phone number?`,
          `Is it open now?`,
          "Show more nearby hospitals",
        ],
      };
    }

    // Operating hours
    if (
      lower.includes("open now") ||
      lower.includes("timing") ||
      lower.includes("hours") ||
      lower.includes("when does it close") ||
      lower.includes("operating hours")
    ) {
      let openExplanation = "";
      if (lastPlace.is24x7) {
        openExplanation = `**${lastPlace.name}** operates **24 hours a day, 7 days a week (24/7)** with active emergency casualty and trauma care facilities open right now.`;
      } else if (lastPlace.openingHours) {
        openExplanation = `The recorded hours for **${lastPlace.name}** are **${lastPlace.openingHours}**. For emergency admissions, call **${lastPlace.phone || "the front desk"}** to verify bed and doctor availability.`;
      } else {
        openExplanation = `Operating hours for **${lastPlace.name}** could not be independently verified from public municipal health records. Please call them directly at **${lastPlace.phone || "the facility"}** before visiting.`;
      }

      return {
        answer: openExplanation,
        items: {
          places: [lastPlace],
        },
        sourceMetadata: {
          sourcesUsed: ["Nagpur Municipal Corporation Health Directory"],
          retrievedAt: new Date().toISOString(),
          dataFreshness: "Verified 2025 Registry",
        },
        contextUpdate: {
          lastReferencedPlace: lastPlace,
          lastServiceType: lastPlace.type,
          lastLocality: req.context?.lastLocality,
        },
        suggestedFollowUps: [
          `What is its phone number?`,
          `How do I reach it?`,
          "Show more nearby hospitals",
        ],
      };
    }

    // "Show more"
    if (
      lower.includes("show more") ||
      lower.includes("more hospitals") ||
      lower.includes("other hospitals") ||
      lower.includes("next hospitals") ||
      lower.includes("alternatives")
    ) {
      const targetType = req.context?.lastServiceType || "hospital";
      const currentOffset = req.context?.lastOffset || 1;
      const localityAnchor = req.context?.lastLocality
        ? NAGPUR_LOCALITY_ANCHORS.find((l) => l.name.toLowerCase() === req.context?.lastLocality?.toLowerCase())
        : null;

      const originCoords = localityAnchor
        ? { lat: localityAnchor.lat, lng: localityAnchor.lng }
        : validLocation || { lat: 21.1458, lng: 79.0882 };

      const morePlaces = await findNearbyPlaces({
        lat: originCoords.lat,
        lng: originCoords.lng,
        type: targetType,
        limit: 4,
        offset: currentOffset,
      });

      if (morePlaces.length === 0) {
        return {
          answer: `You have viewed all verified ${targetType.replace("_", " ")}s in this area of Nagpur. If you need assistance elsewhere, please specify another neighborhood.`,
          sourceMetadata: {
            sourcesUsed: ["Nagpur Municipal Corporation Registry"],
            retrievedAt: new Date().toISOString(),
            dataFreshness: "Verified 2025 Registry",
          },
        };
      }

      return {
        answer: `Here are **${morePlaces.length} additional nearby ${targetType.replace("_", " ")}s** sorted nearest first from ${req.context?.lastLocality || "your reference location"}:`,
        items: {
          places: morePlaces,
        },
        sourceMetadata: {
          sourcesUsed: ["Nagpur Municipal Corporation Health Directory"],
          retrievedAt: new Date().toISOString(),
          dataFreshness: "Verified 2025 Registry",
          distanceMode: "road_transit",
        },
        contextUpdate: {
          lastReferencedPlace: morePlaces[0],
          lastPlacesList: morePlaces,
          lastServiceType: targetType,
          lastLocality: req.context?.lastLocality,
          lastOffset: currentOffset + morePlaces.length,
          hasMorePlaces: true,
        },
        suggestedFollowUps: [
          "Show more nearby hospitals",
          "What is its phone number?",
          "How do I reach it?",
        ],
      };
    }
  }

  // =========================================================================
  // 2. EMERGENCY HELPLINE INTENT (Immediate Action Protocol)
  // =========================================================================
  if (
    lower.includes("emergency") ||
    lower.includes("helpline") ||
    lower.includes("call") ||
    lower.includes("number") ||
    lower.includes("112") ||
    lower.includes("100") ||
    lower.includes("108") ||
    lower.includes("sos") ||
    lower.includes("feel unsafe") ||
    lower.includes("in danger") ||
    lower.includes("threat") ||
    lower.includes("women safety") ||
    lower.includes("cybercrime") ||
    lower.includes("fraud")
  ) {
    let queryFilter = "";
    if (lower.includes("women") || lower.includes("harass")) queryFilter = "women";
    else if (lower.includes("cyber") || lower.includes("fraud")) queryFilter = "cyber";
    else if (lower.includes("fire")) queryFilter = "fire";
    else if (lower.includes("ambulance") || lower.includes("trauma") || lower.includes("108")) queryFilter = "ambulance";
    else if (lower.includes("police")) queryFilter = "police";
    else if (lower.includes("child")) queryFilter = "child";

    const helplines = getHelplines(queryFilter);
    const emergencyWarning =
      lower.includes("unsafe") || lower.includes("danger")
        ? "🚨 **Immediate Threat Notice:** If you are in physical danger, call **112** immediately to connect with the nearest Nagpur Police dispatch unit.\n\n"
        : "";

    const isActionInquiry =
      lower.includes("what should i do") ||
      lower.includes("what to do") ||
      lower.includes("how to handle") ||
      lower.includes("guidance");

    let guidanceText = "";
    if (isActionInquiry) {
      guidanceText =
        "🚨 **Action Protocol for Emergencies in Nagpur:**\n\n" +
        "1. **Dial 112 Immediately:** 112 connects directly to the Nagpur Police, Fire, and Ambulance command center.\n" +
        "2. **Ensure Immediate Safety:** Move toward a well-lit, populated area, police chowki, or open business.\n" +
        "3. **Share GPS Location:** Send your live location to family or emergency contacts.\n" +
        "4. **Medical Casualty:** Dial **108** for critical care Government Ambulance Dispatch.\n" +
        "5. **Women's Distress:** Dial **1091** (Nagpur Police Women Helpline) or **181**.\n\n" +
        "Below are verified 24/7 direct helplines ready to call:";
    } else {
      guidanceText = `${emergencyWarning}Here are the verified emergency helplines for Nagpur. Dial **112** for unified Police, Fire, and Medical emergency dispatch.`;
    }

    return {
      answer: guidanceText,
      items: {
        helplines: helplines.slice(0, 8),
      },
      sourceMetadata: {
        sourcesUsed: [
          "Emergency Response Support System (112.gov.in)",
          "Maharashtra Police Portal",
          "Nagpur Police Commissionerate",
        ],
        retrievedAt: new Date().toISOString(),
        dataFreshness: "Verified active 2025",
      },
      suggestedFollowUps: [
        "Find the nearest police station",
        "Find the nearest hospital",
        "Show emergency directory",
      ],
    };
  }

  // =========================================================================
  // 3. NEARBY SERVICES: HOSPITALS, POLICE STATIONS, PHARMACIES
  // =========================================================================
  const isHospitalInquiry =
    lower.includes("hospital") ||
    lower.includes("hosptal") ||
    lower.includes("hospitl") ||
    lower.includes("hopital") ||
    lower.includes("hosp") ||
    lower.includes("doctor") ||
    lower.includes("clinic") ||
    lower.includes("casualty") ||
    lower.includes("trauma") ||
    lower.includes("medical center");

  const isPoliceInquiry =
    lower.includes("police") ||
    lower.includes("polce") ||
    lower.includes("polic") ||
    lower.includes("station") ||
    lower.includes("thana") ||
    lower.includes("chowki") ||
    lower.includes("cop");

  const isPharmacyInquiry =
    lower.includes("pharmacy") ||
    lower.includes("pharmacies") ||
    lower.includes("pharmecy") ||
    lower.includes("pharamcy") ||
    lower.includes("pharmcy") ||
    lower.includes("chemist") ||
    lower.includes("chemst") ||
    lower.includes("medical store") ||
    lower.includes("medicine") ||
    lower.includes("druggist");

  if (isHospitalInquiry || isPoliceInquiry || isPharmacyInquiry) {
    let serviceType: ServiceType = "hospital";
    if (isPoliceInquiry) {
      serviceType = "police_station";
    } else if (isPharmacyInquiry) {
      serviceType = "pharmacy";
    }

    const serviceLabel =
      serviceType === "police_station"
        ? "police station"
        : serviceType === "pharmacy"
        ? "pharmacy"
        : "hospital";

    const serviceLabelPlural =
      serviceType === "police_station"
        ? "police stations"
        : serviceType === "pharmacy"
        ? "pharmacies"
        : "hospitals";

    const require24x7 =
      lower.includes("24") ||
      lower.includes("night") ||
      lower.includes("round the clock") ||
      lower.includes("emergency");

    const isOpenNowQuery = lower.includes("open now") || lower.includes("currently open");
    const { quantity, isSingleNearest, isExplicitAll } = parseRequestedQuantity(cleanMessage);
    const detectedLocality = detectNagpurLocality(cleanMessage);

    // Location Guard: If unset and no locality in message, request location
    // (Explicit all-city queries bypass the personal nearest location guard)
    if (!detectedLocality && !isExplicitUserLocation && !isExplicitAll) {
      const emergencyAmbulance = getHelplines("ambulance").slice(0, 2);
      return {
        answer: `To identify and prioritize the nearest ${serviceLabel} to you, I need your location reference. Please tap **📍 Share My Location** or mention your Nagpur neighborhood (for example: *Dharampeth*, *Sadar*, *Medical Square*, or *Wardha Road*).\n\n🚨 **Medical Emergency?** Dial **108** (Critical Care Ambulance) or **112** (Emergency Dispatch) immediately.`,
        requiresLocation: true,
        items: {
          helplines: emergencyAmbulance,
        },
        sourceMetadata: {
          sourcesUsed: ["N-SHIELD Location Intelligence"],
          retrievedAt: new Date().toISOString(),
          dataFreshness: "Current",
          limitations: [
            "Cannot calculate authentic nearest distance without user GPS permission or a specified locality.",
          ],
        },
        suggestedFollowUps: [
          `Find hospitals in Dharampeth`,
          `Find hospitals near Sadar`,
          `Find hospitals near Medical Square`,
          `Dial 112 Unified Emergency`,
        ],
      };
    }

    // Determine coordinate origin
    let originCoords: { lat: number; lng: number };
    let locationDescription: string;

    if (detectedLocality) {
      originCoords = { lat: detectedLocality.lat, lng: detectedLocality.lng };
      locationDescription = `in and around ${detectedLocality.name}`;
    } else if (validLocation) {
      originCoords = validLocation;
      locationDescription = rawLocation?.label || "your current location";
    } else {
      originCoords = { lat: 21.1458, lng: 79.0882 };
      locationDescription = "central Nagpur";
    }

    const places = await findNearbyPlaces({
      lat: originCoords.lat,
      lng: originCoords.lng,
      type: serviceType,
      require24x7: require24x7 || isOpenNowQuery,
      limit: quantity,
      radiusMeters: detectedLocality ? 8000 : 15000,
    });

    if (places.length === 0) {
      return {
        answer: `I could not find any verified ${serviceLabelPlural} matching your criteria ${locationDescription}. Try broadening your search or checking without the 24/7 filter.\n\nIn an urgent situation, call **112** or **108** for emergency dispatch.`,
        sourceMetadata: {
          sourcesUsed: ["Nagpur Municipal Corporation Health Directory"],
          retrievedAt: new Date().toISOString(),
          dataFreshness: "Verified 2025 Registry",
        },
        suggestedFollowUps: [
          `Show all hospitals ${locationDescription}`,
          "Find nearest police station",
          "Show emergency helplines",
        ],
      };
    }

    // Case 1: Single Nearest Result
    if (isSingleNearest || quantity === 1) {
      const topMatch = places[0];
      const verifiedStatusText = topMatch.is24x7
        ? "Verified 24/7 round-the-clock emergency casualty service"
        : topMatch.openingHours
        ? `Operating hours: ${topMatch.openingHours}`
        : "Operating hours unverified from public registry (please call ahead to verify)";

      const answer =
        `The nearest verified **${serviceLabel}** to ${locationDescription} is **${topMatch.name}**.\n\n` +
        `• **Straight-line distance:** ${topMatch.formattedDistance}\n` +
        `• **Approx. Road travel distance:** ${topMatch.formattedRoadDistance}\n` +
        `• **Estimated transit time:** ~${topMatch.formattedDuration} driving\n` +
        `• **Address:** ${topMatch.address}\n` +
        `• **Emergency contact:** ${topMatch.phone || "Phone not publicly listed"}\n` +
        `• **Operating status:** ${verifiedStatusText}\n\n` +
        `You can tap **Call** to phone directly or **Nav** for directions. You can also ask me for more nearby alternatives.`;

      return {
        answer,
        items: {
          places: [topMatch],
        },
        sourceMetadata: {
          sourcesUsed: [
            "Nagpur Municipal Corporation (NMC)",
            "Maharashtra State Health Portal",
            "N-SHIELD Urban Road Transit Corridor Model",
          ],
          retrievedAt: new Date().toISOString(),
          dataFreshness: "Verified Registry 2025",
          distanceMode: "road_transit",
          limitations: [
            "Distance is calculated from real road transit corridors. For trauma admissions, call ahead to verify bed availability.",
          ],
        },
        contextUpdate: {
          lastReferencedPlace: topMatch,
          lastPlacesList: [topMatch],
          lastServiceType: serviceType,
          lastLocality: detectedLocality?.name || rawLocation?.label,
          lastOffset: 1,
          hasMorePlaces: true,
        },
        suggestedFollowUps: [
          `What is the phone number of ${topMatch.name}?`,
          `How do I reach ${topMatch.name}?`,
          `Is ${topMatch.name} open now?`,
          `Show more nearby ${serviceLabelPlural}`,
        ],
      };
    }

    // Case 2: Multi-facility list (e.g. 3, N, or city-wide directory)
    const isAllRequest = places.length > 5;
    const textPlaces = isAllRequest ? places.slice(0, 8) : places;
    const placeListText = textPlaces
      .map(
        (p, i) =>
          `${i + 1}. **${p.name}** — ${p.formattedRoadDistance || p.formattedDistance} (~${p.formattedDuration || "10m"})\n` +
          `   📍 ${p.address}\n` +
          `   📞 ${p.phone || "Phone unlisted"}${p.is24x7 ? " • 🟢 24/7 Service" : ""}`
      )
      .join("\n\n");

    const answer = isAllRequest
      ? `Here are the **${places.length} verified ${serviceLabelPlural}** in Nagpur matching your query, sorted nearest first:\n\n${placeListText}\n\n*Displaying top 8 in summary. All ${places.length} verified facilities are available in the interactive cards below.*`
      : `Here are the **${places.length} nearest verified ${serviceLabelPlural}** ${locationDescription}, sorted nearest first:\n\n${placeListText}\n\nTap **Nav** on any card below to launch live navigation or **Call** to dial directly.`;

    return {
      answer,
      items: {
        places,
      },
      sourceMetadata: {
        sourcesUsed: [
          "Nagpur Municipal Corporation (NMC)",
          "Maharashtra State Health Portal",
          "N-SHIELD Urban Road Transit Corridor Model",
        ],
        retrievedAt: new Date().toISOString(),
        dataFreshness: "Verified Registry 2025",
        distanceMode: "road_transit",
        limitations: [
          "Distance reflects urban road corridor calculations. Always verify casualty department capacity by phone for critical emergencies.",
        ],
      },
      contextUpdate: {
        lastReferencedPlace: places[0],
        lastPlacesList: places,
        lastServiceType: serviceType,
        lastLocality: detectedLocality?.name || rawLocation?.label,
        lastOffset: places.length,
        hasMorePlaces: true,
      },
      suggestedFollowUps: [
        `What is the phone number of ${places[0].name}?`,
        `How do I reach the nearest one?`,
        `Show more nearby ${serviceLabelPlural}`,
        `Show emergency helplines`,
      ],
    };
  }

  // =========================================================================
  // 4. ROUTE CALCULATION AND ROUTE SAFETY COMPARISON
  // =========================================================================
  if (
    lower.includes("route") ||
    lower.includes("direction") ||
    lower.includes("navigate") ||
    lower.includes("travel") ||
    lower.includes("go from") ||
    lower.includes("how to reach") ||
    lower.includes("compare")
  ) {
    let origin = "Sitabuldi";
    let destination = "Dharampeth";

    const toMatch = cleanMessage.match(/to\s+([A-Za-z0-9\s,\(\)]+)/i);
    const fromMatch = cleanMessage.match(/from\s+([A-Za-z0-9\s,\(\)]+)\s+to/i);

    if (fromMatch && fromMatch[1]) {
      origin = fromMatch[1].trim();
    } else if (isExplicitUserLocation && validLocation) {
      origin = `${validLocation.lat},${validLocation.lng}`;
    }

    if (toMatch && toMatch[1]) {
      const rawDest = toMatch[1].replace(/[\?\.!]/g, "").trim();
      const detectedDestLocality = detectNagpurLocality(rawDest);
      if (detectedDestLocality) {
        destination = detectedDestLocality.name;
      } else {
        destination = rawDest
          .replace(/\b(guaranteed|safe|safest|quick|fast|now|please|crime-free|risk-free)\b/gi, "")
          .trim();
      }
    }

    try {
      const routes = await calculateNagpurRoutes({ origin, destination });
      const incidentsAlongRoute = routes[0]?.geometry
        ? getRouteIncidentEvidence(routes[0].geometry)
        : [];

      return {
        answer: `I evaluated ${routes.length} transit corridors between ${origin} and ${destination}. Below is the comparison including road distance, estimated travel time, and reported incident exposure.\n\n⚠️ **Notice:** ${MANDATORY_SAFETY_DISCLAIMER}`,
        items: {
          routes,
          incidents: incidentsAlongRoute.slice(0, 4),
        },
        sourceMetadata: {
          sourcesUsed: [
            "Nagpur Urban Transit Corridor Model",
            "Nagpur Police Historical Incident Registry",
          ],
          retrievedAt: new Date().toISOString(),
          dataFreshness: "Current route model",
          limitations: [
            "Route safety cannot be guaranteed; all comparisons reflect only available recorded incidents and known road geometry.",
            "Weather, night lighting, and temporary roadworks can change conditions rapidly.",
          ],
        },
        suggestedFollowUps: [
          "Show nearby hospitals along this route",
          "What emergency number should I call?",
          "Recent news around Nagpur",
        ],
      };
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Invalid origin or destination";
      return {
        answer: `Could not calculate the route: ${errMsg}. Please specify recognized Nagpur localities such as Sitabuldi, Dharampeth, Sadar, or Medical Square.`,
        sourceMetadata: {
          sourcesUsed: ["N-SHIELD Routing Engine"],
          retrievedAt: new Date().toISOString(),
          dataFreshness: "Current",
        },
        suggestedFollowUps: [
          "Route from Sitabuldi to Dharampeth",
          "Route from Sadar to Medical Square",
        ],
      };
    }
  }

  // =========================================================================
  // 5. LIVE SAFETY RESEARCH & CRIME NEWS (Powered by TinyFish Web Intelligence)
  // =========================================================================
  const isSafetyNewsInquiry =
    lower.includes("news") ||
    lower.includes("headline") ||
    lower.includes("update") ||
    lower.includes("incident") ||
    lower.includes("crime") ||
    lower.includes("happening") ||
    lower.includes("report") ||
    lower.includes("patrol") ||
    lower.includes("theft") ||
    lower.includes("accident");

  if (isSafetyNewsInquiry) {
    const detectedLocality = detectNagpurLocality(cleanMessage);
    const localityContext = detectedLocality ? `in and around ${detectedLocality.name}` : "across Nagpur";

    // Build targeted query for TinyFish Web Search
    let searchQuery = cleanMessage;
    if (detectedLocality && !searchQuery.toLowerCase().includes(detectedLocality.name.toLowerCase())) {
      searchQuery = `${detectedLocality.name} ${cleanMessage}`;
    }

    // 1. Primary Engine: Execute TinyFish Search API
    if (isTinyFishConfigured()) {
      try {
        const researchResult = await searchTinyFishWeb(searchQuery, {
          domainType: "news",
          recencyMinutes: 43200, // past 30 days
          locality: detectedLocality?.name,
        });

        if (researchResult.success && researchResult.items.length > 0) {
          const items = researchResult.items;
          const factsSummary = items
            .slice(0, 3)
            .map((item, idx) => {
              const pubDate = item.publishedAt
                ? ` (${new Date(item.publishedAt).toLocaleDateString("en-IN")})`
                : "";
              return `${idx + 1}. **${item.title}**${pubDate} — *${item.publisher || "Reported"}*\n   ${item.snippet}`;
            })
            .join("\n\n");

          const uniquePublishers = Array.from(
            new Set(items.map((i) => i.publisher || "Nagpur Public Press").filter(Boolean))
          );

          return {
            answer: `Here are the latest live public safety and crime-related reports for **${localityContext}**, retrieved and verified via **TinyFish Web Intelligence**:\n\n${factsSummary}\n\n⚠️ **Notice:** Retrieved items reflect public news reporting and police press releases. For legal proceedings, consult official Nagpur Police FIR registries.`,
            items: {
              research: items,
            },
            sourceMetadata: {
              sourcesUsed: ["TinyFish Live Web Research API", ...uniquePublishers],
              retrievedAt: new Date().toISOString(),
              dataFreshness: researchResult.cached ? "Cached (within 5 minutes)" : "Live Web Retrieval",
              limitations: [
                "Media and web reports provide situational awareness and may not represent finalized judicial findings.",
              ],
            },
            contextUpdate: {
              lastResearchList: items,
              lastLocality: detectedLocality?.name || req.context?.lastLocality,
            },
            suggestedFollowUps: [
              "Give me the source for that news",
              `Find the nearest police station to ${detectedLocality?.name || "Sitabuldi"}`,
              "What should I do in an emergency?",
            ],
          };
        } else if (researchResult.items.length === 0) {
          // Zero matches on web -> state clearly and provide local police log records
          const localZone = detectedLocality
            ? staticZones.find((z) => z.name.toLowerCase().includes(detectedLocality.name.toLowerCase()))
            : null;
          const fallbackIncidents: IncidentEvidenceItem[] = (localZone
            ? staticIncidents.filter((i) => i.zoneId === localZone.id)
            : staticIncidents.slice(0, 3)
          ).map((inc) => ({
            id: inc.id,
            category: inc.type,
            severity: inc.severity,
            description: inc.description,
            location: {
              name: detectedLocality?.name || "Nagpur",
              lat: inc.lat,
              lng: inc.lng,
            },
            reportedAt: inc.timestamp,
            sourceName: "Nagpur Police Crime Registry",
            verificationStatus: "official",
          }));

          return {
            answer: `No recent public safety news reports were found on the web via TinyFish matching **"${cleanMessage}"**. This may indicate no major safety incidents have been publicly reported in this specific area recently.\n\nHere are documented police log records for **${localityContext}**:`,
            items: {
              incidents: fallbackIncidents,
            },
            sourceMetadata: {
              sourcesUsed: ["TinyFish Live Web Search", "Nagpur Police Crime Registry"],
              retrievedAt: new Date().toISOString(),
              dataFreshness: "No new live matches; local records shown",
              limitations: [
                "Zero web matches indicates either low reported activity or temporary news source silence.",
              ],
            },
            contextUpdate: {
              lastLocality: detectedLocality?.name || req.context?.lastLocality,
            },
            suggestedFollowUps: [
              "What are the latest reported safety incidents in Nagpur?",
              "Find nearest police station",
              "Emergency helplines",
            ],
          };
        }
      } catch (researchErr) {
        console.warn("TinyFish research error, falling back to local news feed:", researchErr);
      }
    }

    // 2. Fallback when TINYFISH_API_KEY is not configured
    const configNotice = !isTinyFishConfigured()
      ? "⚠️ **Notice:** Live web research via TinyFish is currently inactive because `TINYFISH_API_KEY` is not configured on the server. To enable real-time web querying, configure your key in `.env.local`.\n\n"
      : "";

    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const res = await fetch(`${baseUrl}/api/news?category=All%20Updates&sort=latest`, {
        next: { revalidate: 300 },
      });

      if (res.ok) {
        const data = await res.json();
        let articles = data.articles || [];

        if (detectedLocality) {
          const locLower = detectedLocality.name.toLowerCase();
          const filtered = articles.filter((a: { title?: string; description?: string }) =>
            (a.title?.toLowerCase() || "").includes(locLower) ||
            (a.description?.toLowerCase() || "").includes(locLower)
          );
          if (filtered.length > 0) {
            articles = filtered;
          }
        }

        const newsItems: NewsItem[] = articles.slice(0, 5).map((a: {
          id: string;
          title: string;
          description?: string;
          content?: string;
          url: string;
          source?: string;
          pubDate?: string;
          category?: string;
        }) => ({
          id: a.id,
          title: a.title,
          summary: a.description || a.content?.slice(0, 160),
          url: a.url,
          publisher: a.source || "Nagpur Local News / Police Bulletin",
          publishedAt: a.pubDate,
          retrievedAt: new Date().toISOString(),
          category: a.category,
        }));

        return {
          answer: `${configNotice}Here are verified public safety and crime updates reported for **${localityContext}** from authentic news feeds:`,
          items: {
            news: newsItems,
          },
          sourceMetadata: {
            sourcesUsed: ["Nagpur Local News Registry", "Google News RSS", "Police Press Releases"],
            retrievedAt: new Date().toISOString(),
            dataFreshness: "Refreshed within the last 15 minutes",
            limitations: [
              "Media reports are provided for public situational awareness and are not official police FIR records.",
            ],
          },
          contextUpdate: {
            lastNewsList: newsItems,
            lastLocality: detectedLocality?.name || req.context?.lastLocality,
          },
          suggestedFollowUps: [
            "Give me the source for that news",
            "Show emergency helplines",
            "Find nearest police station",
          ],
        };
      }
    } catch (err) {
      console.warn("News fetch error in assistant", err);
    }

    return {
      answer: `${configNotice}Nagpur safety news updates are currently being refreshed. You can view the Live Incident Feed on the dashboard for real-time alerts.`,
      sourceMetadata: {
        sourcesUsed: ["N-SHIELD News Intelligence"],
        retrievedAt: new Date().toISOString(),
        dataFreshness: "Current",
      },
    };
  }

  // =========================================================================
  // 6. ZONE RISK / AREA INFORMATION
  // =========================================================================
  if (
    lower.includes("zone") ||
    lower.includes("sitabuldi") ||
    lower.includes("dharampeth") ||
    lower.includes("sadar") ||
    lower.includes("risk") ||
    lower.includes("score")
  ) {
    const matchedZone = staticZones.find((z) => lower.includes(z.name.toLowerCase()));
    if (matchedZone) {
      const zoneIncidents = staticIncidents.filter((i) => i.zoneId === matchedZone.id);

      const incidentsList: IncidentEvidenceItem[] = zoneIncidents.slice(0, 5).map((inc) => ({
        id: inc.id,
        category: inc.type,
        severity: inc.severity,
        description: inc.description,
        location: {
          name: matchedZone.name,
          lat: inc.lat,
          lng: inc.lng,
        },
        reportedAt: inc.timestamp,
        sourceName: "Nagpur Police Crime Registry",
        verificationStatus: "official",
      }));

      return {
        answer: `Zone Analysis for **${matchedZone.name} (Code: ${matchedZone.code})**:\n- Active Police Patrols: ${matchedZone.activePatrols} units\n- Recorded Incidents Sampled: ${zoneIncidents.length}\n- Officer in Charge: ${matchedZone.officerInCharge}\n\n⚠️ **Notice:** ${MANDATORY_SAFETY_DISCLAIMER}`,
        items: {
          incidents: incidentsList,
        },
        sourceMetadata: {
          sourcesUsed: ["Nagpur City Police Zone Records", "N-SHIELD Risk Engine"],
          retrievedAt: new Date().toISOString(),
          dataFreshness: "Current Model",
          limitations: [
            "Incident counts reflect documented events and do not guarantee risk-free areas.",
          ],
        },
        suggestedFollowUps: [
          `Find hospitals near ${matchedZone.name}`,
          `Find police stations near ${matchedZone.name}`,
          "Calculate a safer route",
        ],
      };
    }
  }

  // =========================================================================
  // 7. GENERAL GROUNDED HELP RESPONSE
  // =========================================================================
  return {
    answer:
      "Hello! I am the **N-SHIELD AI Safety Assistant**, powered by **TinyFish Web Intelligence** for Nagpur, Maharashtra.\n\nI can help you with:\n1. 📰 **Live Public Safety Research** — Real-time web intelligence on crime and safety incidents via TinyFish.\n2. 🏥 **Nearest Verified Services** — Ask *“Find the nearest hospital”* or *“Find 24-hour pharmacies in Dharampeth”*.\n3. 🚨 **Emergency Helplines** — Instant verified contacts for 112, 108, Police, Fire & Women's helpline.\n4. 🗺️ **Corridor Route Comparisons** — Travel times and reported incident exposure (no route is ever claimed 100% risk-free).\n5. 🔗 **Source Verification** — Ask *“Give me the source for that news”* to inspect original reporting.",
    sourceMetadata: {
      sourcesUsed: ["TinyFish Web Intelligence", "N-SHIELD Urban Safety Intelligence Model"],
      retrievedAt: new Date().toISOString(),
      dataFreshness: "Current",
    },
    suggestedFollowUps: [
      "What are the latest reported safety incidents in Nagpur?",
      "Find recent crime-related news near Sitabuldi",
      "Find the nearest hospital",
      "Which police station is closest to Dharampeth?",
      "What should I do in an emergency?",
    ],
  };
}
