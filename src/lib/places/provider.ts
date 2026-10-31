import {
  NAGPUR_ESSENTIAL_SERVICES,
  type ServiceCategory,
} from "@/lib/nearbyServicesData";
import { calculateDistanceMeters, formatDistance } from "@/lib/geoUtils";
import { formatDuration } from "@/lib/routing/provider";
import type { ServicePlace, ServiceType } from "@/lib/validation/assistantSchemas";

const CATEGORY_MAP: Record<ServiceType, ServiceCategory> = {
  hospital: "hospital",
  police_station: "police",
  pharmacy: "pharmacy",
};

/**
 * Evaluates whether a facility is currently open using verified schedule data (IST timezone)
 */
export function evaluateOpenStatus(timing: string | undefined, is24x7: boolean): {
  isOpenNow: boolean | null;
  statusText: string;
} {
  if (is24x7) {
    return {
      isOpenNow: true,
      statusText: "24/7 Verified Emergency Service (Open Round-the-Clock)",
    };
  }

  if (!timing || timing.trim() === "") {
    return {
      isOpenNow: null,
      statusText: "Operating hours unverified — please call ahead before arrival",
    };
  }

  const timingLower = timing.toLowerCase();
  if (
    timingLower.includes("24/7") ||
    timingLower.includes("24 hours") ||
    timingLower.includes("round the clock") ||
    timingLower.includes("open 24")
  ) {
    return {
      isOpenNow: true,
      statusText: "Open 24 Hours (Verified)",
    };
  }

  // Parse standard time windows like "8:00 AM - 10:00 PM" or "9:00 AM - 9:00 PM"
  const timeRegex = /(\d{1,2})(?::(\d{2}))?\s*(am|pm)\s*[-–to]+\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i;
  const match = timing.match(timeRegex);

  if (match) {
    try {
      let startHour = parseInt(match[1], 10);
      const startMin = match[2] ? parseInt(match[2], 10) : 0;
      const startPeriod = match[3].toLowerCase();

      let endHour = parseInt(match[4], 10);
      const endMin = match[5] ? parseInt(match[5], 10) : 0;
      const endPeriod = match[6].toLowerCase();

      if (startPeriod === "pm" && startHour !== 12) startHour += 12;
      if (startPeriod === "am" && startHour === 12) startHour = 0;
      if (endPeriod === "pm" && endHour !== 12) endHour += 12;
      if (endPeriod === "am" && endHour === 12) endHour = 0;

      const startTotalMins = startHour * 60 + startMin;
      const endTotalMins = endHour * 60 + endMin;

      // Current Indian Standard Time (IST is UTC + 5:30)
      const now = new Date();
      const utcMins = now.getUTCHours() * 60 + now.getUTCMinutes();
      const istMins = (utcMins + 330) % 1440; // 5 hours 30 mins

      const isOpen =
        startTotalMins <= endTotalMins
          ? istMins >= startTotalMins && istMins <= endTotalMins
          : istMins >= startTotalMins || istMins <= endTotalMins; // overnight window

      return {
        isOpenNow: isOpen,
        statusText: isOpen
          ? `Currently Open (${timing})`
          : `Currently Closed (${timing})`,
      };
    } catch {
      // Fallback if parsing fails
    }
  }

  return {
    isOpenNow: null,
    statusText: `Hours: ${timing} (Real-time status unverified; call to confirm)`,
  };
}

/**
 * Normalizes place name for safe fuzzy deduplication matching
 */
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .replace(/(hospital|centre|center|clinic|nursinghome|research|institute|pvt|ltd|trust)/g, "");
}

/**
 * Optional Google Places API Discovery (Server-side fetch)
 * Seamlessly discovers live places and merges them with curated directory.
 */
async function fetchGooglePlacesNearby(params: {
  lat: number;
  lng: number;
  type: ServiceType;
  radiusMeters: number;
  keyword?: string;
}): Promise<ServicePlace[]> {
  const apiKey = process.env.GOOGLE_MAPS_SERVER_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) return [];

  const googleTypeMap: Record<ServiceType, string> = {
    hospital: "hospital",
    police_station: "police",
    pharmacy: "pharmacy",
  };

  try {
    const url = new URL("https://maps.googleapis.com/maps/api/place/nearbysearch/json");
    url.searchParams.set("location", `${params.lat},${params.lng}`);
    url.searchParams.set("radius", String(Math.min(params.radiusMeters, 25000)));
    url.searchParams.set("type", googleTypeMap[params.type]);
    if (params.keyword) {
      url.searchParams.set("keyword", params.keyword);
    }
    url.searchParams.set("key", apiKey);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(url.toString(), { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) return [];

    const data = await res.json();
    if (!data.results || !Array.isArray(data.results)) return [];

    return data.results.map((p: any) => {
      const pLat = p.geometry?.location?.lat;
      const pLng = p.geometry?.location?.lng;
      const dist = calculateDistanceMeters(params.lat, params.lng, pLat, pLng);
      const roadDist = Math.round(dist * 1.25);
      const durationSeconds = Math.max(60, Math.round(roadDist / (30000 / 3600)));
      const isOpen = p.opening_hours?.open_now ?? null;

      return {
        id: `gplace-${p.place_id || p.id}`,
        name: p.name || "Healthcare Facility",
        type: params.type,
        address: p.vicinity || "Nagpur, Maharashtra",
        location: { lat: pLat, lng: pLng },
        phone: null,
        openingHours: isOpen ? "Open Now (Google Places)" : undefined,
        isOpenNow: isOpen,
        is24x7: false, // Default false unless explicitly verified
        emergencyServices: "Local facility discovered via Google Places",
        source: "Google Places Discovery",
        retrievedAt: new Date().toISOString(),
        distanceMeters: dist,
        formattedDistance: formatDistance(dist),
        roadDistanceMeters: roadDist,
        formattedRoadDistance: `${formatDistance(roadDist)} (approx. road travel)`,
        estimatedDurationSeconds: durationSeconds,
        formattedDuration: formatDuration(durationSeconds),
      };
    });
  } catch {
    // If Places API fails (offline, rate limited, no billing), fallback cleanly
    return [];
  }
}

/**
 * Searches and ranks authentic Nagpur services (Hospitals, Police Stations, Pharmacies)
 * strictly by ascending distance from origin.
 * Combines curated verified local directory with live Google Places discovery.
 */
export async function findNearbyPlaces(params: {
  lat: number;
  lng: number;
  type: ServiceType;
  radiusMeters?: number;
  limit?: number;
  offset?: number;
  require24x7?: boolean;
  requireGovt?: boolean;
  subCategory?: string;
  query?: string;
}): Promise<ServicePlace[]> {
  const {
    lat,
    lng,
    type,
    radiusMeters = 15000,
    limit = 10,
    offset = 0,
    require24x7 = false,
    requireGovt = false,
    subCategory = "",
    query = "",
  } = params;

  const targetCategory = CATEGORY_MAP[type];
  const qLower = query.toLowerCase().trim();
  const subCatLower = subCategory.toLowerCase().trim();

  // 1. Filter curated authentic Nagpur dataset
  const filteredCurated = NAGPUR_ESSENTIAL_SERVICES.filter((item) => {
    if (item.category !== targetCategory) return false;
    if (require24x7 && !item.is24x7) return false;

    // Government filter
    if (requireGovt) {
      const isGov =
        item.hospitalDetails?.isGovernment ||
        item.name.toLowerCase().includes("govt") ||
        item.name.toLowerCase().includes("government") ||
        item.name.toLowerCase().includes("gmch") ||
        item.name.toLowerCase().includes("mayo") ||
        item.name.toLowerCase().includes("aiims") ||
        item.name.toLowerCase().includes("nmc");
      if (!isGov) return false;
    }

    // Subcategory or specialty filter (e.g. cardiac, cancer, children, eye, orthopaedic, maternity)
    if (subCatLower) {
      const specText = (item.specialties || "").toLowerCase();
      const catText = (item.hospitalDetails?.category || "").toLowerCase();
      const nameText = item.name.toLowerCase();
      const matchesSubCat =
        specText.includes(subCatLower) ||
        catText.includes(subCatLower) ||
        nameText.includes(subCatLower);
      if (!matchesSubCat) return false;
    }

    if (qLower) {
      const matchName = item.name.toLowerCase().includes(qLower);
      const matchAddr = item.address.toLowerCase().includes(qLower);
      const matchLandmark = item.landmark?.toLowerCase().includes(qLower);
      const matchSpec = item.specialties?.toLowerCase().includes(qLower);
      const matchLocality = item.hospitalDetails?.locality?.toLowerCase().includes(qLower);
      if (!matchName && !matchAddr && !matchLandmark && !matchSpec && !matchLocality) {
        return false;
      }
    }

    return true;
  });

  // Calculate straight-line and estimated road travel distances
  const curatedMapped: ServicePlace[] = filteredCurated.map((item) => {
    const distStraightLine = calculateDistanceMeters(lat, lng, item.lat, item.lng);
    const roadDistMeters = Math.round(distStraightLine * 1.25);
    const durationSeconds = Math.max(60, Math.round(roadDistMeters / (30000 / 3600)));
    const { isOpenNow, statusText } = evaluateOpenStatus(item.timing, item.is24x7);

    return {
      id: item.id,
      name: item.name,
      type,
      address: item.address,
      location: {
        lat: item.lat,
        lng: item.lng,
      },
      phone: item.phone,
      openingHours: item.timing || (item.is24x7 ? "24/7 Emergency Service" : undefined),
      isOpenNow,
      is24x7: item.is24x7,
      isNearest: false,
      emergencyServices:
        item.hospitalDetails?.emergencyServices ||
        item.specialties ||
        (item.category === "hospital" && item.is24x7
          ? "24/7 Emergency Casualty & Trauma Care"
          : undefined),
      source: item.hospitalDetails?.sourceUrl
        ? "Verified Nagpur Hospital Directory"
        : "Nagpur Municipal Corporation & City Health Directory",
      verifiedAt: item.verified ? "2026-03-25T00:00:00.000Z" : undefined,
      retrievedAt: new Date().toISOString(),
      distanceMeters: distStraightLine,
      formattedDistance: formatDistance(distStraightLine),
      roadDistanceMeters: roadDistMeters,
      formattedRoadDistance: `${formatDistance(roadDistMeters)} (approx. road travel)`,
      estimatedDurationSeconds: durationSeconds,
      formattedDuration: formatDuration(durationSeconds),
    };
  });

  // 2. Discover live places from Google Places (if available) and merge safely
  let livePlaces: ServicePlace[] = [];
  try {
    livePlaces = await fetchGooglePlacesNearby({
      lat,
      lng,
      type,
      radiusMeters,
      keyword: qLower || subCatLower || undefined,
    });
  } catch {
    livePlaces = [];
  }

  // 3. Deduplicate: Never duplicate curated records with live listings
  const combined: ServicePlace[] = [...curatedMapped];

  for (const live of livePlaces) {
    const normLive = normalizeName(live.name);
    const isDuplicate = curatedMapped.some((cur) => {
      const normCur = normalizeName(cur.name);
      const distBetween = calculateDistanceMeters(
        cur.location.lat,
        cur.location.lng,
        live.location.lat,
        live.location.lng
      );
      // Duplicate if within 150m or name match
      return distBetween < 150 || normCur.includes(normLive) || normLive.includes(normCur);
    });

    if (!isDuplicate) {
      combined.push(live);
    }
  }

  // 4. Strict radius filter: Never report a facility outside the selected radius
  const candidateList =
    typeof radiusMeters === "number" && radiusMeters > 0
      ? combined.filter((item) => (item.distanceMeters ?? 0) <= radiusMeters)
      : combined;

  // 5. Genuine ascending distance sort
  candidateList.sort((a, b) => (a.distanceMeters ?? 0) - (b.distanceMeters ?? 0));

  // Mark the closest facility explicitly as nearest
  if (candidateList.length > 0 && offset === 0) {
    candidateList[0].isNearest = true;
  }

  return candidateList.slice(offset, offset + limit);
}
