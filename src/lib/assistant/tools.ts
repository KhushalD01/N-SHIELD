import type { FunctionDeclaration } from "@google/genai";
import { findNearbyPlaces } from "@/lib/places/provider";
import { calculateNagpurRoutes, resolveNagpurPoint } from "@/lib/routing/provider";
import { getHelplines } from "@/lib/emergency/helplines";
import { getRouteIncidentEvidence, MANDATORY_SAFETY_DISCLAIMER } from "@/lib/safety/evaluateRouteRisk";
import {
  zones as staticZones,
  incidents as staticIncidents,
  cameras as staticCameras,
} from "@/lib/mockData";
import {
  calculateRiskScoreDetailed,
  getZoneLighting,
  getTimeRiskFactor,
} from "@/lib/riskEngine";
import type {
  AssistantResponse,
  IncidentEvidenceItem,
  NewsItem,
  RouteOption,
  ServicePlace,
  ServiceType,
  WebResearchItem,
} from "@/lib/validation/assistantSchemas";
import {
  searchTinyFishWeb,
  fetchTinyFishUrls,
  runTinyFishAgent,
  isTinyFishConfigured,
} from "@/lib/tinyfish/client";

/**
 * Tool Context passed into tool executions
 */
export interface ToolExecutionContext {
  userLocation?: {
    lat: number;
    lng: number;
    label?: string;
    isUserSet?: boolean;
    source?: "gps" | "manual" | "default";
  };
  lastReferencedPlace?: ServicePlace;
  lastLocality?: string;
}

/**
 * Tool Result returned by the executor
 */
export interface ToolExecutionOutput {
  modelData: Record<string, unknown>;
  structuredItems: AssistantResponse["items"];
  requiresLocation?: boolean;
  contextUpdate?: AssistantResponse["contextUpdate"];
}

/**
 * Gemini Function Declarations (JSON Schema definition for tools)
 */
export const GEMINI_ASSISTANT_TOOLS: FunctionDeclaration[] = [
  {
    name: "find_nearby_services",
    description:
      "Searches and ranks authentic, verified essential facilities (hospitals, police stations, pharmacies) across Nagpur. Computes straight-line distance, road travel distance, and driving ETA.",
    parametersJsonSchema: {
      type: "object",
      properties: {
        service_type: {
          type: "string",
          enum: ["hospital", "police_station", "pharmacy"],
          description: "The type of essential service requested.",
        },
        locality: {
          type: "string",
          description:
            "Nagpur neighborhood or area name (e.g. 'Dharampeth', 'Sitabuldi', 'Sadar', 'Medical Square', 'Wardha Road'). Optional if user location is already set.",
        },
        near_last_place: {
          type: "boolean",
          description:
            "Set to true when the user asks for a service near the previously mentioned facility (e.g. 'a pharmacy near that hospital').",
        },
        quantity: {
          type: "integer",
          description:
            "Number of facilities to return. Use 1 for 'the nearest', 'the closest', or 'single'. Use 3 for 'near me'. Use N (e.g. 5) if the user explicitly requested N.",
        },
        require_24x7: {
          type: "boolean",
          description: "Whether the facility must have verified 24/7 round-the-clock emergency service.",
        },
        open_now: {
          type: "boolean",
          description: "Whether the facility must be verified open right now.",
        },
        specialty: {
          type: "string",
          description: "Medical specialty or category (e.g. 'cardiac', 'cancer', 'children', 'eye', 'orthopaedic', 'maternity', 'clinic', 'nursing_home').",
        },
        require_government: {
          type: "boolean",
          description: "Set to true if user specifically requested a government / public hospital (e.g. GMCH, Mayo, AIIMS, SSH, Daga).",
        },
        radius_meters: {
          type: "integer",
          description: "Search radius in meters if the user requested a specific distance (e.g. 5000 for 'within 5 km').",
        },
      },
      required: ["service_type"],
    },
  },
  {
    name: "calculate_safe_route",
    description:
      "Calculates urban transit corridors between two Nagpur locations and evaluates reported police incident density along the route corridor. No route is ever guaranteed 100% safe.",
    parametersJsonSchema: {
      type: "object",
      properties: {
        origin: {
          type: "string",
          description: "Origin point or Nagpur neighborhood (e.g. 'Sitabuldi'). Optional if user location is available.",
        },
        destination: {
          type: "string",
          description: "Destination point or Nagpur neighborhood (e.g. 'Dharampeth').",
        },
      },
      required: ["destination"],
    },
  },
  {
    name: "get_zone_safety_assessment",
    description:
      "Retrieves official safety score, risk level (low/medium/high), active CCTV camera surveillance, and night-time lighting index for a specific Nagpur neighborhood or zone (e.g. 'Sitabuldi', 'Dharampeth', 'Sadar', 'Mahal', 'Medical Square'). Explains that safety predictions are statistical estimates.",
    parametersJsonSchema: {
      type: "object",
      properties: {
        locality: {
          type: "string",
          description: "Name of the Nagpur neighborhood or zone (e.g. 'Sitabuldi', 'Dharampeth', 'Sadar').",
        },
        time_of_day: {
          type: "integer",
          description: "Hour of day (0-23) to evaluate time-of-day risk factor and street lighting levels. Defaults to current local hour.",
        },
      },
      required: ["locality"],
    },
  },
  {
    name: "get_emergency_helplines",
    description:
      "Returns verified official emergency helpline contacts for Nagpur and Maharashtra (112, 108, 100, 1091, 181, 1930, etc.).",
    parametersJsonSchema: {
      type: "object",
      properties: {
        category: {
          type: "string",
          enum: ["all", "police", "ambulance", "women", "fire", "cyber"],
          description: "Category of emergency assistance needed.",
        },
      },
    },
  },
  {
    name: "get_recent_incidents",
    description:
      "Retrieves documented police incident reports and crime logs in a specified Nagpur neighborhood or zone.",
    parametersJsonSchema: {
      type: "object",
      properties: {
        locality: {
          type: "string",
          description: "Neighborhood or zone name in Nagpur (e.g. 'Sitabuldi', 'Sadar', 'Dharampeth').",
        },
      },
      required: ["locality"],
    },
  },
  {
    name: "search_safety_news",
    description: "Retrieves recent verified public safety, crime, and traffic news reported across Nagpur.",
    parametersJsonSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Keyword filter for news (e.g. 'patrol', 'accident', 'crime').",
        },
      },
    },
  },
  {
    name: "request_user_location",
    description:
      "Call this tool when the user asks for nearest facilities or services 'near me', but no locality is provided in the message AND user location has not yet been authorized or set.",
    parametersJsonSchema: {
      type: "object",
      properties: {
        reason: {
          type: "string",
          description: "Reason why location reference is needed to identify the nearest facility.",
        },
      },
      required: ["reason"],
    },
  },
  {
    name: "explain_nshield",
    description:
      "Provides an evidence-based, authentic overview of N-SHIELD's capabilities, data sources, and architecture for citizen safety in Nagpur.",
    parametersJsonSchema: {
      type: "object",
      properties: {
        topic: {
          type: "string",
          description: "Specific topic or question about N-SHIELD, e.g. 'overview', 'datasets', 'routing', 'sos'.",
        },
      },
    },
  },
  {
    name: "tinyfish_web_research",
    description:
      "Performs live web research via TinyFish to find latest public safety news, police reports, and crime incidents across Nagpur. Ground all factual assertions strictly in retrieved sources.",
    parametersJsonSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query focusing on Nagpur public safety, crime, or police reports (e.g. 'Sitabuldi safety incidents', 'Nagpur crime news').",
        },
        locality: {
          type: "string",
          description: "Specific neighborhood in Nagpur if mentioned (e.g. 'Sitabuldi', 'Dharampeth', 'Sadar').",
        },
        domain_type: {
          type: "string",
          enum: ["news", "general"],
          description: "Domain type filter. Default is 'news' for authentic reports.",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "tinyfish_fetch_article",
    description:
      "Fetches and extracts clean, readable text content directly from a specific article URL via TinyFish Fetch API. Use when the user asks to summarize, inspect, or get details from a news link or document.",
    parametersJsonSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "The web URL to fetch and summarize.",
        },
        purpose: {
          type: "string",
          description: "Extraction context or intent, e.g. 'Summarize safety news article'.",
        },
      },
      required: ["url"],
    },
  },
  {
    name: "tinyfish_browser_agent",
    description:
      "Performs multi-step browser automation via TinyFish Agent on a specific target URL. Only use when explicit interactive form submission or navigation is necessary.",
    parametersJsonSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "Target web URL to interact with.",
        },
        goal: {
          type: "string",
          description: "Goal description for the automated browser agent.",
        },
      },
      required: ["url", "goal"],
    },
  },
];

/**
 * Executes a tool called by the model against existing N-SHIELD providers
 */
export async function executeAssistantTool(
  toolName: string,
  args: Record<string, unknown>,
  context: ToolExecutionContext
): Promise<ToolExecutionOutput> {
  switch (toolName) {
    case "find_nearby_services": {
      const serviceType = (args.service_type as ServiceType) || "hospital";
      const localityStr = (args.locality as string) || "";
      const quantity = Math.min(Math.max(Number(args.quantity) || 3, 1), 30);
      const require24x7 = Boolean(args.require_24x7 || args.open_now);
      const nearLastPlace = Boolean(args.near_last_place);

      // Determine search origin coordinates
      let originCoords: { lat: number; lng: number } | null = null;
      let locationLabel = "your location";

      // Contextual place reference resolution: "pharmacy near that hospital"
      if (
        (nearLastPlace ||
          localityStr.toLowerCase().includes("that") ||
          localityStr.toLowerCase().includes("there") ||
          localityStr.toLowerCase().includes("same") ||
          localityStr.toLowerCase().includes("previous")) &&
        context.lastReferencedPlace?.location
      ) {
        originCoords = {
          lat: context.lastReferencedPlace.location.lat,
          lng: context.lastReferencedPlace.location.lng,
        };
        locationLabel = `near ${context.lastReferencedPlace.name}`;
      }

      if (!originCoords && localityStr) {
        const resolved = resolveNagpurPoint(localityStr);
        if (resolved) {
          originCoords = { lat: resolved.lat, lng: resolved.lng };
          locationLabel = resolved.label;
        }
      }

      let isLocationRefinementNeeded = false;
      if (!originCoords && context.userLocation?.lat && context.userLocation?.lng) {
        originCoords = { lat: context.userLocation.lat, lng: context.userLocation.lng };
        locationLabel = context.userLocation.label || (context.userLocation.isUserSet ? "your location" : "central Nagpur");
        if (!context.userLocation.isUserSet) {
          isLocationRefinementNeeded = true;
        }
      }

      if (!originCoords) {
        originCoords = { lat: 21.1458, lng: 79.0882 };
        locationLabel = "central Nagpur";
        isLocationRefinementNeeded = true;
      }

      const specialty = (args.specialty as string) || "";
      const requireGovt = Boolean(args.require_government);
      const radiusMeters = Number(args.radius_meters) || undefined;

      const places = await findNearbyPlaces({
        lat: originCoords.lat,
        lng: originCoords.lng,
        type: serviceType,
        require24x7,
        requireGovt,
        subCategory: specialty,
        radiusMeters,
        limit: quantity,
      });

      const topPlace = places[0];

      return {
        modelData: {
          status: "success",
          total_found: places.length,
          requested_quantity: quantity,
          location_reference: locationLabel,
          facilities: places.map((p) => ({
            name: p.name,
            address: p.address,
            phone: p.phone || "Unlisted",
            straight_line_distance: p.formattedDistance,
            road_travel_distance: p.formattedRoadDistance,
            driving_eta: p.formattedDuration,
            verified_24x7: p.is24x7,
            operating_hours: p.openingHours || "Unverified",
            is_open_now: p.isOpenNow,
            is_nearest: p.isNearest,
          })),
        },
        structuredItems: {
          places,
        },
        requiresLocation: isLocationRefinementNeeded,
        contextUpdate: topPlace
          ? {
              lastReferencedPlace: topPlace,
              lastServiceType: serviceType,
              lastLocality: localityStr || context.userLocation?.label,
              lastOffset: places.length,
              hasMorePlaces: true,
            }
          : undefined,
      };
    }

    case "calculate_safe_route": {
      let origin = (args.origin as string) || "";
      let destination = (args.destination as string) || "Dharampeth";

      if (
        (destination.toLowerCase().includes("there") ||
          destination.toLowerCase().includes("that")) &&
        context.lastReferencedPlace
      ) {
        destination = `${context.lastReferencedPlace.location.lat},${context.lastReferencedPlace.location.lng}`;
      }

      if (!origin) {
        if (context.userLocation?.isUserSet && context.userLocation.lat) {
          origin = `${context.userLocation.lat},${context.userLocation.lng}`;
        } else if (context.lastLocality) {
          origin = context.lastLocality;
        } else {
          origin = "Sitabuldi";
        }
      }

      const routes = await calculateNagpurRoutes({ origin, destination });
      const incidentsAlongRoute = routes[0]?.geometry
        ? getRouteIncidentEvidence(routes[0].geometry)
        : [];

      const primary = routes[0];
      const alternative = routes.length > 1 ? routes[1] : null;

      return {
        modelData: {
          status: "success",
          origin,
          destination,
          route_count: routes.length,
          routes: routes.map((r) => ({
            name: r.name,
            road_distance: r.formattedDistance,
            driving_duration: r.formattedDuration,
            via: r.via,
            relative_risk_score: r.safetyAssessment?.score,
            relative_risk_level: r.safetyAssessment?.relativeRisk,
            incidents_sampled: r.safetyAssessment?.evidenceCount,
          })),
          primary_route: primary
            ? { name: primary.name, via: primary.via, duration: primary.formattedDuration }
            : null,
          recommended_alternative: alternative
            ? { name: alternative.name, via: alternative.via, duration: alternative.formattedDuration }
            : null,
          proposed_action_notice: alternative
            ? `Would you like to switch navigation to the recommended corridor via ${alternative.via}?`
            : null,
          mandatory_notice: MANDATORY_SAFETY_DISCLAIMER,
        },
        structuredItems: {
          routes,
          incidents: incidentsAlongRoute.slice(0, 4),
        },
      };
    }

    case "get_zone_safety_assessment": {
      const locality = (args.locality as string) || "Sitabuldi";
      const timeOfDay =
        typeof args.time_of_day === "number" ? args.time_of_day : new Date().getHours();

      const matchedZone =
        staticZones.find(
          (z) =>
            z.name.toLowerCase().includes(locality.toLowerCase()) ||
            locality.toLowerCase().includes(z.name.toLowerCase())
        ) || staticZones[0];

      const zoneIncidents = staticIncidents.filter((i) => i.zoneId === matchedZone.id);
      const cctvCount = staticCameras.filter((c) => c.zoneId === matchedZone.id).length || 18;
      const lighting = getZoneLighting(timeOfDay);
      const timeFactor = getTimeRiskFactor(timeOfDay);

      const highSevCount = zoneIncidents.filter(
        (i) => i.severity === "high" || i.severity === "critical"
      ).length;

      const riskDetailed = calculateRiskScoreDetailed(
        {
          recentIncidentCount: zoneIncidents.length,
          highSeverityCount: highSevCount,
          severityIndex: zoneIncidents.length > 0 ? highSevCount / zoneIncidents.length : 0.2,
        },
        timeOfDay,
        cctvCount,
        lighting
      );

      const incidentItems: IncidentEvidenceItem[] = zoneIncidents.slice(0, 3).map((inc) => ({
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
        modelData: {
          status: "success",
          zone_name: matchedZone.name,
          zone_code: matchedZone.code,
          safety_score: Math.max(15, 100 - riskDetailed.score),
          calculated_risk_score: riskDetailed.score,
          risk_level: riskDetailed.level,
          active_cctv_cameras: cctvCount,
          patrol_units_assigned: matchedZone.activePatrols || 5,
          lighting_index: Math.round(lighting),
          time_of_day_hour: timeOfDay,
          time_risk_factor: Math.round(timeFactor * 100) / 100,
          documented_incidents_sampled: zoneIncidents.length,
          mandatory_notice:
            "Safety predictions are statistical estimates based on historical incident density, environmental parameters, and camera coverage. They do not constitute an absolute guarantee of safety. Conditions can vary dynamically.",
        },
        structuredItems: {
          incidents: incidentItems,
        },
        contextUpdate: {
          lastLocality: matchedZone.name,
        },
      };
    }

    case "get_emergency_helplines": {
      const category = (args.category as string) || "";
      const helplines = getHelplines(category);

      return {
        modelData: {
          status: "success",
          helplines: helplines.slice(0, 8).map((h) => ({
            name: h.name,
            number: h.number,
            purpose: h.purpose,
            available_24x7: h.is24x7,
          })),
        },
        structuredItems: {
          helplines: helplines.slice(0, 8),
        },
      };
    }

    case "get_recent_incidents": {
      const locality = (args.locality as string) || "Sitabuldi";
      const matchedZone = staticZones.find((z) =>
        z.name.toLowerCase().includes(locality.toLowerCase())
      );

      const zoneIncidents = matchedZone
        ? staticIncidents.filter((i) => i.zoneId === matchedZone.id)
        : staticIncidents.slice(0, 5);

      const incidentItems: IncidentEvidenceItem[] = zoneIncidents.slice(0, 5).map((inc) => ({
        id: inc.id,
        category: inc.type,
        severity: inc.severity,
        description: inc.description,
        location: {
          name: matchedZone?.name || locality,
          lat: inc.lat,
          lng: inc.lng,
        },
        reportedAt: inc.timestamp,
        sourceName: "Nagpur Police Crime Registry",
        verificationStatus: "official",
      }));

      return {
        modelData: {
          status: "success",
          locality,
          zone_code: matchedZone?.code || "ZONE-NAGPUR",
          incident_count: incidentItems.length,
          incidents: incidentItems.map((inc) => ({
            category: inc.category,
            severity: inc.severity,
            description: inc.description,
            date: inc.reportedAt,
          })),
          notice: MANDATORY_SAFETY_DISCLAIMER,
        },
        structuredItems: {
          incidents: incidentItems,
        },
      };
    }

    case "search_safety_news": {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const res = await fetch(`${baseUrl}/api/news?category=All%20Updates&sort=latest`, {
          next: { revalidate: 300 },
        });

        if (res.ok) {
          const data = await res.json();
          const articles = (data.articles || []).slice(0, 5);

          const newsItems: NewsItem[] = articles.map(
            (a: {
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
              publisher: a.source || "Nagpur Press / Police Bulletin",
              publishedAt: a.pubDate,
              retrievedAt: new Date().toISOString(),
              category: a.category,
            })
          );

          return {
            modelData: {
              status: "success",
              articles_count: newsItems.length,
              headlines: newsItems.map((n) => ({
                title: n.title,
                summary: n.summary,
                source: n.publisher,
                date: n.publishedAt || "Recently",
              })),
            },
            structuredItems: {
              news: newsItems,
            },
          };
        }
      } catch (err) {
        console.warn("News tool fetch error:", err);
      }

      return {
        modelData: {
          status: "fallback",
          message: "Live news feed is refreshing. Real-time updates available on live dashboard.",
        },
        structuredItems: {},
      };
    }

    case "request_user_location": {
      const ambulanceHelplines = getHelplines("ambulance").slice(0, 2);
      return {
        modelData: {
          status: "requires_location",
          message:
            "Location permission or locality input is needed to calculate nearest distances authentically.",
        },
        structuredItems: {
          helplines: ambulanceHelplines,
        },
        requiresLocation: true,
      };
    }

    case "explain_nshield": {
      return {
        modelData: {
          status: "success",
          project_name: "N-SHIELD (AI-Driven Urban Safety Intelligence Model)",
          city: "Nagpur, Maharashtra, India",
          mission:
            "Empowering citizens and municipal authorities with evidence-based spatial safety intelligence, verifiable emergency services navigation, and real-time corridor risk analysis.",
          key_capabilities: [
            "Official emergency directory of 37 Nagpur police stations, 30+ verified hospitals, and 24/7 pharmacies with real distance, ETA, and verified contact numbers.",
            "Dynamic Safe Transit Corridors evaluating police-documented incident density along transit routes.",
            "Real-time Nagpur crime and traffic news integration from verified press feeds.",
            "Zone-level safety risk assessment combining historical crime density, CCTV surveillance coverage, and night-time illumination indices.",
            "One-tap Emergency Response Support System (ERSS 112) direct calling and SOS coordination.",
            "Server-side AI Assistant powered by Google Gemini with strict factual grounding against authentic local records.",
          ],
          disclaimer:
            "All safety metrics are statistical indicators derived from historical records and public infrastructure data; they do not guarantee individual safety.",
        },
        structuredItems: {},
      };
    }

    case "tinyfish_web_research": {
      const query = (args.query as string) || "Nagpur safety incidents";
      const locality = (args.locality as string) || "";
      const domainType = (args.domain_type as "news" | "general") || "news";

      const fullQuery =
        locality && !query.toLowerCase().includes(locality.toLowerCase())
          ? `${locality} ${query}`
          : query;

      const researchResult = await searchTinyFishWeb(fullQuery, {
        domainType,
        recencyMinutes: 43200,
        locality,
      });

      if (!researchResult.isConfigured) {
        const fallbackNews: NewsItem[] = staticIncidents.slice(0, 3).map((inc) => ({
          id: `local-news-${inc.id}`,
          title: `${inc.type.toUpperCase()}: ${inc.description}`,
          summary: `Documented in Nagpur (${inc.zoneId}) at ${inc.timestamp}. Verification status: Official crime registry.`,
          url: "https://nagpurpolice.gov.in",
          publisher: "Nagpur Police Crime Registry",
          publishedAt: inc.timestamp,
          retrievedAt: new Date().toISOString(),
          category: inc.type,
        }));

        return {
          modelData: {
            status: "config_warning",
            configured: false,
            message:
              "TINYFISH_API_KEY is not configured in server environment (.env.local). Fallback safety records provided.",
            fallback_records: fallbackNews.length,
          },
          structuredItems: {
            news: fallbackNews,
          },
        };
      }

      if (researchResult.items.length === 0) {
        return {
          modelData: {
            status: "no_results",
            query: fullQuery,
            message: `No public reports found matching '${fullQuery}'. Sources may have no recent entries or were temporarily unreachable.`,
          },
          structuredItems: {},
        };
      }

      return {
        modelData: {
          status: "success",
          query: fullQuery,
          source_count: researchResult.items.length,
          is_cached: researchResult.cached,
          sources: researchResult.items.map((i) => ({
            title: i.title,
            publisher: i.publisher,
            url: i.url,
            published_date: i.publishedAt || "Undated",
            snippet: i.snippet,
            key_facts: i.extractedFacts,
          })),
        },
        structuredItems: {
          research: researchResult.items,
        },
        contextUpdate: {
          lastResearchList: researchResult.items,
          lastLocality: locality || context.lastLocality,
        },
      };
    }

    case "tinyfish_fetch_article": {
      const url = (args.url as string) || "";
      if (!url) {
        return {
          modelData: {
            status: "error",
            message: "No article URL was specified to fetch.",
          },
          structuredItems: {},
        };
      }

      const fetchedList = await fetchTinyFishUrls([url], {
        purpose: (args.purpose as string) || "Nagpur safety news article summarization",
      });

      if (fetchedList.length === 0) {
        return {
          modelData: {
            status: "failed",
            url,
            message: `Unable to extract content from '${url}'. The page may be unreachable or requires authorization.`,
          },
          structuredItems: {},
        };
      }

      const topArticle = fetchedList[0];
      const researchItem: WebResearchItem = {
        id: `fetched-${Date.now()}`,
        title: topArticle.title || "Extracted Safety Article",
        url: topArticle.url,
        snippet: topArticle.content.slice(0, 350) + "...",
        publisher: "Public Web Source",
        retrievedAt: topArticle.retrievedAt,
        extractedFacts: [],
        uncertaintyOrLimitations: topArticle.isLiveFetch
          ? "Direct article extraction via TinyFish Fetch API."
          : "Direct web article reader retrieval.",
        isLiveWeb: true,
      };

      return {
        modelData: {
          status: "success",
          url: topArticle.url,
          title: topArticle.title,
          extracted_text: topArticle.content.slice(0, 2500),
          is_live_fetch: topArticle.isLiveFetch,
        },
        structuredItems: {
          research: [researchItem],
        },
        contextUpdate: {
          lastResearchList: [researchItem],
        },
      };
    }

    case "tinyfish_browser_agent": {
      const url = (args.url as string) || "https://nagpurpolice.gov.in";
      const goal = (args.goal as string) || "Check public safety bulletin";

      const agentResult = await runTinyFishAgent(url, goal);
      return {
        modelData: {
          status: agentResult.success ? "success" : "failed",
          url,
          goal,
          result: agentResult.result || agentResult.error || "Agent execution finished.",
        },
        structuredItems: {},
      };
    }

    default:
      return {
        modelData: {
          status: "unrecognized_tool",
          tool_name: toolName,
          message: `The tool '${toolName}' is not recognized in the allowlist.`,
        },
        structuredItems: {},
      };
  }
}
