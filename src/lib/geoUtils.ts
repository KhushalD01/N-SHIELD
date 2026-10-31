import type { EssentialService, ServiceCategory } from "./nearbyServicesData";

export interface UserLocation {
  lat: number;
  lng: number;
  accuracy?: number;
  label?: string;
  isUserSet?: boolean;
  source?: "gps" | "manual" | "default";
}

// Default Fallback: Sitabuldi Center, Nagpur
export const DEFAULT_NAGPUR_USER_LOCATION: UserLocation = {
  lat: 21.1458,
  lng: 79.0882,
  label: "Nagpur Center (Sitabuldi)",
  isUserSet: false,
  source: "default",
};

/**
 * Common Quick Locations across Nagpur for manual citizen switching & locator origins
 */
export const POPULAR_NAGPUR_LOCATIONS: { name: string; lat: number; lng: number; locality: string }[] = [
  { name: "Wainganga College (WCEM), Dongargaon", lat: 20.995, lng: 79.02889, locality: "Dongargaon" },
  { name: "Jamtha (VCA Stadium / NCI)", lat: 21.02773, lng: 79.03298, locality: "Jamtha" },
  { name: "MIHAN (AIIMS Nagpur)", lat: 21.03861, lng: 79.02389, locality: "MIHAN" },
  { name: "Nandanvan (SevenStar / Jagnade Sq)", lat: 21.13962, lng: 79.11991, locality: "Nandanvan" },
  { name: "Nandanvan Extension (Gurunanak)", lat: 21.13254, lng: 79.12782, locality: "Nandanvan" },
  { name: "Sakkardara Square", lat: 21.125, lng: 79.11, locality: "Sakkardara" },
  { name: "Reshimbagh Ground / Square", lat: 21.13152, lng: 79.10966, locality: "Reshimbagh" },
  { name: "Besa (Besa Square)", lat: 21.087, lng: 79.102, locality: "Besa" },
  { name: "Beltarodi Main Road", lat: 21.08542, lng: 79.08812, locality: "Beltarodi" },
  { name: "Manewada Ring Road Chowk", lat: 21.10421, lng: 79.09915, locality: "Manewada" },
  { name: "Narendra Nagar Square", lat: 21.10825, lng: 79.08218, locality: "Narendra Nagar" },
  { name: "Medical Square (GMCH)", lat: 21.12635, lng: 79.0971, locality: "Medical Square" },
  { name: "Sitabuldi Metro Interchange", lat: 21.1489, lng: 79.0876, locality: "Sitabuldi" },
  { name: "Dharampeth (WHC Road)", lat: 21.1415, lng: 79.0535, locality: "Dharampeth" },
  { name: "Ramdaspeth Central", lat: 21.13426, lng: 79.07486, locality: "Ramdaspeth" },
  { name: "Sadar Residency Road", lat: 21.1612, lng: 79.0788, locality: "Sadar" },
  { name: "Wardhaman Nagar (Central Ave)", lat: 21.14821, lng: 79.12815, locality: "Wardhaman Nagar" },
  { name: "Mankapur (Koradi Road / Alexis)", lat: 21.18567, lng: 79.07951, locality: "Mankapur" },
  { name: "Jaripatka Main Road", lat: 21.18521, lng: 79.09214, locality: "Jaripatka" },
  { name: "IT Park Gayatri Nagar", lat: 21.1235, lng: 79.052, locality: "Parsodi" },
  { name: "Mahal Town Hall", lat: 21.14386, lng: 79.10762, locality: "Mahal" },
  { name: "Pardi Bhandara Road", lat: 21.14915, lng: 79.14521, locality: "Pardi" },
  { name: "Hingna (Digdoh Hills)", lat: 21.10127, lng: 79.00243, locality: "Hingna" },
];

/**
 * Compute Haversine straight-line distance in meters between two coordinates
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (
    typeof lat1 !== "number" ||
    typeof lon1 !== "number" ||
    typeof lat2 !== "number" ||
    typeof lon2 !== "number" ||
    isNaN(lat1) ||
    isNaN(lon1) ||
    isNaN(lat2) ||
    isNaN(lon2)
  ) {
    return Infinity;
  }

  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Format distance in user-friendly format (e.g. "450 m away", "1.8 km away")
 */
export function formatDistance(meters: number): string {
  if (!isFinite(meters) || meters < 0) return "Distance unknown";
  if (meters < 1000) {
    return `${meters} m away`;
  }
  const km = (meters / 1000).toFixed(1);
  return `${km} km away`;
}

/**
 * Structured intent extracted from citizen search query
 */
export interface SearchIntent {
  matchedCategory: ServiceCategory | null;
  isSuperlative: boolean;
  isExplicitAll: boolean;
  requestedLimit: number | null;
  detectedLocality: { name: string; lat: number; lng: number } | null;
  requiresLocation: boolean;
  isGovernmentOnly?: boolean;
  is24x7Only?: boolean;
  requestedSpecialty?: string | null;
  requestedRadiusMeters?: number | null;
}

/**
 * Parses user search query for superlatives ("nearest", "closest"),
 * explicit limits ("3 hospitals", "show all"), categories, and localities.
 */
export function parseSearchIntent(query: string, userLocation: UserLocation): SearchIntent {
  const q = query.trim().toLowerCase();

  let matchedCategory: ServiceCategory | null = null;
  if (
    q.includes("hospital") ||
    q.includes("hosptal") ||
    q.includes("clinic") ||
    q.includes("doctor") ||
    q.includes("trauma") ||
    q.includes("medical care") ||
    q.includes("casualty") ||
    q.includes("nursing home") ||
    q.includes("maternity") ||
    q.includes("cardiac") ||
    q.includes("cancer") ||
    q.includes("orthopaedic")
  ) {
    matchedCategory = "hospital";
  } else if (
    q.includes("police") ||
    q.includes("thana") ||
    q.includes("cop") ||
    q.includes("chowki") ||
    q.includes("station")
  ) {
    matchedCategory = "police";
  } else if (
    q.includes("pharmacy") ||
    q.includes("pharmacies") ||
    q.includes("chemist") ||
    q.includes("medicine") ||
    q.includes("druggist") ||
    q.includes("medical store")
  ) {
    matchedCategory = "pharmacy";
  } else if (q.includes("ambulance") || q.includes("ems") || q.includes("108") || q.includes("102")) {
    matchedCategory = "ambulance";
  } else if (q.includes("fire") || q.includes("brigade") || q.includes("101")) {
    matchedCategory = "fire_station";
  }

  // Detect government hospital intent
  const isGovernmentOnly =
    q.includes("government") ||
    q.includes("govt") ||
    q.includes("sarkari") ||
    q.includes("civil") ||
    q.includes("gmch") ||
    q.includes("mayo") ||
    q.includes("aiims");

  // Detect 24/7 or emergency intent
  const is24x7Only =
    q.includes("24") ||
    q.includes("24/7") ||
    q.includes("24x7") ||
    q.includes("emergency") ||
    q.includes("casualty") ||
    q.includes("round the clock") ||
    q.includes("open now");

  // Detect specialties
  let requestedSpecialty: string | null = null;
  if (q.includes("cardiac") || q.includes("heart") || q.includes("angioplasty")) {
    requestedSpecialty = "cardiac";
  } else if (q.includes("cancer") || q.includes("oncology") || q.includes("tumor")) {
    requestedSpecialty = "cancer";
  } else if (q.includes("child") || q.includes("pediatric") || q.includes("baby") || q.includes("nicu") || q.includes("picu")) {
    requestedSpecialty = "children";
  } else if (q.includes("eye") || q.includes("netra") || q.includes("ophthalmology") || q.includes("cataract")) {
    requestedSpecialty = "eye";
  } else if (q.includes("ortho") || q.includes("bone") || q.includes("fracture") || q.includes("joint") || q.includes("spine")) {
    requestedSpecialty = "orthopaedic";
  } else if (q.includes("maternity") || q.includes("delivery") || q.includes("pregnancy") || q.includes("gynec")) {
    requestedSpecialty = "maternity";
  }

  // Detect radius like "within 5 km", "in 3km", "10 km radius"
  let requestedRadiusMeters: number | null = null;
  const radiusMatch = q.match(/(?:within|in|radius\s+of)?\s*(\d+)\s*(?:km|kilometres?|kilometers?)/i);
  if (radiusMatch && radiusMatch[1]) {
    requestedRadiusMeters = parseInt(radiusMatch[1], 10) * 1000;
  }

  // Detect recognized Nagpur locality in query
  let detectedLocality: { name: string; lat: number; lng: number } | null = null;

  // Custom alias checks first
  if (q.includes("wcem") || q.includes("wainganga") || q.includes("dongargaon")) {
    detectedLocality = { name: "Wainganga College (WCEM), Dongargaon", lat: 20.9855, lng: 79.0305 };
  } else if (q.includes("nci") || q.includes("jamtha")) {
    detectedLocality = { name: "Jamtha (VCA Stadium / NCI)", lat: 21.0028, lng: 79.0435 };
  } else if (q.includes("aiims") || q.includes("mihan")) {
    detectedLocality = { name: "MIHAN (AIIMS Nagpur)", lat: 21.0375, lng: 79.0282 };
  } else if (q.includes("nandanvan")) {
    detectedLocality = { name: "Nandanvan (Jagnade Square)", lat: 21.1392, lng: 79.1124 };
  } else if (q.includes("jagnade")) {
    detectedLocality = { name: "Nandanvan (Jagnade Square)", lat: 21.1392, lng: 79.1124 };
  } else if (q.includes("sakkardara")) {
    detectedLocality = { name: "Sakkardara Square", lat: 21.125, lng: 79.11 };
  } else if (q.includes("reshimbagh")) {
    detectedLocality = { name: "Reshimbagh Ground / Square", lat: 21.127, lng: 79.109 };
  } else if (q.includes("besa")) {
    detectedLocality = { name: "Besa (Besa Square)", lat: 21.087, lng: 79.102 };
  } else if (q.includes("beltarodi")) {
    detectedLocality = { name: "Beltarodi Main Road", lat: 21.085, lng: 79.088 };
  } else if (q.includes("manewada")) {
    detectedLocality = { name: "Manewada Ring Road Chowk", lat: 21.104, lng: 79.099 };
  } else if (q.includes("parsodi")) {
    detectedLocality = { name: "IT Park Gayatri Nagar", lat: 21.1235, lng: 79.052 };
  } else {
    for (const loc of POPULAR_NAGPUR_LOCATIONS) {
      const coreName = loc.locality.toLowerCase();
      const locRegex = new RegExp(`\\b${coreName}\\b`, "i");
      if (locRegex.test(q) || q.includes(loc.name.toLowerCase())) {
        detectedLocality = loc;
        break;
      }
    }
  }

  const isExplicitAll = /\b(?:all|every|list|show\s+all|full\s+list)\b/i.test(q);

  const isSuperlative =
    /\b(?:the\s+)?(?:nearest|closest|single|best|nearest\s+one|closest\s+one)\b/i.test(q) ||
    /\bwhere\s+is\s+the\s+(?:nearest|closest)\b/i.test(q) ||
    /\bwhich\s+(?:hospital|police|pharmacy|service)\s+is\s+(?:nearest|closest)\b/i.test(q);

  // Parse explicit numbers like "3 nearest", "5 hospitals"
  let requestedLimit: number | null = null;
  const numMatch = q.match(
    /\b(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s+(?:nearest|closest|nearby)?\s*(?:hospitals?|police|pharmacies?|services?|facilities?|stations?|stores?)/i
  );
  if (numMatch && numMatch[1]) {
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
    requestedLimit = parseInt(numMatch[1], 10) || wordMap[numMatch[1].toLowerCase()] || null;
  }

  // Singular superlative queries default to exactly 1 result unless explicit all or explicit number
  if (isSuperlative && !requestedLimit && !isExplicitAll) {
    requestedLimit = 1;
  }

  // Personal nearest requires a valid location reference (either explicit user GPS/selection or a detected locality)
  const hasValidLocation = Boolean(detectedLocality || userLocation.isUserSet);
  const requiresLocation = Boolean(
    matchedCategory &&
      (isSuperlative || q.includes("near me") || q.includes("nearby") || q.includes("around me")) &&
      !hasValidLocation
  );

  return {
    matchedCategory,
    isSuperlative,
    isExplicitAll,
    requestedLimit,
    detectedLocality,
    requiresLocation,
    isGovernmentOnly,
    is24x7Only,
    requestedSpecialty,
    requestedRadiusMeters,
  };
}

/**
 * Service with calculated distance attached
 */
export interface ServiceWithDistance extends EssentialService {
  distanceMeters: number;
  formattedDistance: string;
}

/**
 * Attach straight-line distance from citizen location, filter strictly by radius (if provided),
 * and sort in ascending distance order.
 */
export function getSortedNearbyServices(
  services: EssentialService[],
  userLocation: UserLocation,
  categoriesFilter?: ServiceCategory[],
  limit?: number,
  customOrigin?: { lat: number; lng: number },
  radiusMeters?: number,
  filterPredicate?: (service: EssentialService) => boolean
): ServiceWithDistance[] {
  let filtered = services.filter((s) => {
    // Coordinates must be valid finite numbers
    if (typeof s.lat !== "number" || typeof s.lng !== "number" || isNaN(s.lat) || isNaN(s.lng)) {
      return false;
    }
    if (s.lat < -90 || s.lat > 90 || s.lng < -180 || s.lng > 180) {
      return false;
    }
    return true;
  });

  if (categoriesFilter && categoriesFilter.length > 0) {
    const activeSet = new Set(categoriesFilter);
    filtered = filtered.filter((s) => activeSet.has(s.category));
  }

  if (filterPredicate) {
    filtered = filtered.filter(filterPredicate);
  }

  const originLat = customOrigin ? customOrigin.lat : userLocation.lat;
  const originLng = customOrigin ? customOrigin.lng : userLocation.lng;

  const withDistances: ServiceWithDistance[] = filtered.map((service) => {
    const dist = calculateDistanceMeters(
      originLat,
      originLng,
      service.lat,
      service.lng
    );
    return {
      ...service,
      distanceMeters: dist,
      formattedDistance: formatDistance(dist),
    };
  });

  // Strict radius filtering when radius is provided
  let withinRadius = withDistances;
  if (typeof radiusMeters === "number" && radiusMeters > 0) {
    withinRadius = withDistances.filter((s) => s.distanceMeters <= radiusMeters);
  }

  // Pure ascending distance sorting
  const sorted = withinRadius.sort((a, b) => a.distanceMeters - b.distanceMeters);

  if (typeof limit === "number" && limit > 0) {
    return sorted.slice(0, limit);
  }

  return sorted;
}

/**
 * Get nearest service for each selected category
 */
export function getNearestPerCategory(
  services: EssentialService[],
  userLocation: UserLocation
): Record<ServiceCategory, ServiceWithDistance | null> {
  const sorted = getSortedNearbyServices(services, userLocation);
  const result: Record<ServiceCategory, ServiceWithDistance | null> = {
    police: null,
    hospital: null,
    pharmacy: null,
    ambulance: null,
    fire_station: null,
    emergency_other: null,
  };

  for (const service of sorted) {
    if (!result[service.category]) {
      result[service.category] = service;
    }
  }

  return result;
}

/**
 * Build Google Maps Navigation URL from user location to service
 */
export function getGoogleMapsDirectionsUrl(
  userLocation: UserLocation,
  service: { lat: number; lng: number; name: string }
): string {
  const origin = `${userLocation.lat},${userLocation.lng}`;
  const destination = `${service.lat},${service.lng}`;
  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&travelmode=driving`;
}

/**
 * Build a mobile phone call dialer link (e.g. "tel:+917122561245" or "tel:112")
 */
export function getPhoneDialerUrl(phoneNumber: string | null): string | null {
  if (!phoneNumber) return null;
  const cleaned = phoneNumber.replace(/[\s\-()]/g, "");
  return `tel:${cleaned}`;
}
