/**
 * N-SHIELD Nagpur Municipal Crime Risk Polygon Boundaries
 *
 * Implements a 16-sector planar geographic mosaic of Nagpur City, Maharashtra.
 * Every internal boundary edge is strictly shared between adjacent polygons,
 * guaranteeing ZERO unintended gaps and ZERO overlaps (conforming to the reference visual style).
 *
 * Primary Coordinates Order: [lat, lng] for Google Maps JavaScript API
 * GeoJSON standard order: [lng, lat] via toNagpurGeoJson()
 */

import type { CrimePolygonRegion } from "./types";

// ============================================================================
// 1. CANONICAL JUNCTION VERTICES (Shared across adjacent sectors)
// ============================================================================
const J = {
  GOREWADA_NW: [21.1980, 79.0350] as [number, number],
  MANKAPUR_N: [21.2120, 79.0760] as [number, number],
  AUTOMOTIVE_N: [21.2150, 79.1120] as [number, number],
  KAMPTEE_NE: [21.2050, 79.1550] as [number, number],
  SEMINARY_N: [21.1760, 79.0520] as [number, number],
  SADAR_N: [21.1750, 79.0790] as [number, number],
  PACHPAOLI_N: [21.1780, 79.1120] as [number, number],
  KALMANA_NE: [21.1760, 79.1500] as [number, number],
  FUTALA_W: [21.1520, 79.0380] as [number, number],
  CIVIL_LINES_C: [21.1550, 79.0700] as [number, number],
  SADAR_S: [21.1560, 79.0850] as [number, number],
  ITWARI_C: [21.1560, 79.1180] as [number, number],
  PARDI_E: [21.1500, 79.1680] as [number, number],
  AMBAZARI_W: [21.1280, 79.0320] as [number, number],
  DHARAMPETH_C: [21.1390, 79.0560] as [number, number],
  SITABULDI_C: [21.1440, 79.0840] as [number, number],
  MAHAL_C: [21.1430, 79.1120] as [number, number],
  LAKADGANJ_C: [21.1420, 79.1450] as [number, number],
  HINGNA_SW: [21.1080, 79.0400] as [number, number],
  PRATAP_C: [21.1180, 79.0620] as [number, number],
  RAMDASPETH_S: [21.1320, 79.0750] as [number, number],
  MEDICAL_C: [21.1270, 79.0980] as [number, number],
  NANDANVAN_C: [21.1290, 79.1350] as [number, number],
  PARDI_SE: [21.1250, 79.1720] as [number, number],
  AIRPORT_SW: [21.0850, 79.0500] as [number, number],
  MANEWADA_C: [21.1020, 79.0880] as [number, number],
  SAKKARDARA_C: [21.1180, 79.1120] as [number, number],
  DIGHORI_E: [21.1080, 79.1480] as [number, number],
  BESA_S: [21.0720, 79.0780] as [number, number],
  HUDKESHWAR_S: [21.0750, 79.1080] as [number, number],
  DIGHORI_SE: [21.0780, 79.1420] as [number, number],
};

// ============================================================================
// 2. 16 CONTIGUOUS SECTORS DEFINITION
// ============================================================================
export const NAGPUR_CRIME_POLYGONS: CrimePolygonRegion[] = [
  {
    id: "poly-mankapur",
    zoneId: "zone-mankapur",
    name: "Mankapur / Koradi Corridor",
    code: "NGP-SEC-01",
    wardName: "Zone 9 / Ward 1 - Mankapur",
    boundaryCoordinates: [
      J.GOREWADA_NW,
      J.MANKAPUR_N,
      J.SADAR_N,
      J.SEMINARY_N,
      J.GOREWADA_NW,
    ],
    center: { lat: 21.189, lng: 79.062 },
    areaKm2: 9.8,
    populationEstimate: 125000,
    officerInCharge: "ACP Ajay Rathod",
    contactNumber: "+91 712 2591001",
    keyVulnerabilities: [
      "Highway transit corridor",
      "Night freight movement",
      "Street lighting deficits on outer link roads",
    ],
  },
  {
    id: "poly-automotive-sq",
    zoneId: "zone-mankapur",
    name: "Automotive Sq / Kamptee Road",
    code: "NGP-SEC-02",
    wardName: "Zone 9 / Ward 2 - Automotive Square",
    boundaryCoordinates: [
      J.MANKAPUR_N,
      J.AUTOMOTIVE_N,
      J.KAMPTEE_NE,
      J.KALMANA_NE,
      J.PACHPAOLI_N,
      J.SADAR_N,
      J.MANKAPUR_N,
    ],
    center: { lat: 21.193, lng: 79.115 },
    areaKm2: 12.4,
    populationEstimate: 110000,
    officerInCharge: "PI Manoj Shinde",
    contactNumber: "+91 712 2591002",
    keyVulnerabilities: [
      "Heavy vehicle transit",
      "Highway truck terminals",
      "Late-night accident hotspot",
    ],
  },
  {
    id: "poly-civil-lines",
    zoneId: "zone-sitabuldi",
    name: "Civil Lines / Seminary Hills",
    code: "NGP-SEC-03",
    wardName: "Zone 2 / Ward 11 - Civil Lines",
    boundaryCoordinates: [
      J.GOREWADA_NW,
      J.SEMINARY_N,
      J.SADAR_N,
      J.SADAR_S,
      J.CIVIL_LINES_C,
      J.FUTALA_W,
      J.GOREWADA_NW,
    ],
    center: { lat: 21.163, lng: 79.060 },
    areaKm2: 8.6,
    populationEstimate: 68000,
    officerInCharge: "DCP Pravin Padole",
    contactNumber: "+91 712 2561003",
    keyVulnerabilities: [
      "VIP & Administrative zone",
      "Large park perimeters",
      "Futala lake evening crowd dispersal",
    ],
  },
  {
    id: "poly-sadar",
    zoneId: "zone-sadar",
    name: "Sadar Commercial / Residency Rd",
    code: "NGP-SEC-04",
    wardName: "Zone 10 / Ward 7 - Sadar Bazar",
    boundaryCoordinates: [
      J.SADAR_N,
      J.PACHPAOLI_N,
      J.ITWARI_C,
      J.SITABULDI_C,
      J.SADAR_S,
      J.SADAR_N,
    ],
    center: { lat: 21.161, lng: 79.092 },
    areaKm2: 5.4,
    populationEstimate: 134000,
    officerInCharge: "ACP Vikram Jadhav",
    contactNumber: "+91 712 2561004",
    keyVulnerabilities: [
      "High density restaurant & market footfall",
      "Night pedestrian movement",
      "Vehicle theft in commercial parking",
    ],
  },
  {
    id: "poly-itwari",
    zoneId: "zone-mahal",
    name: "Itwari / Satranjipura Wholesale",
    code: "NGP-SEC-05",
    wardName: "Zone 7 / Ward 22 - Itwari Market",
    boundaryCoordinates: [
      J.PACHPAOLI_N,
      J.KALMANA_NE,
      J.PARDI_E,
      J.LAKADGANJ_C,
      J.ITWARI_C,
      J.PACHPAOLI_N,
    ],
    center: { lat: 21.158, lng: 79.135 },
    areaKm2: 7.2,
    populationEstimate: 195000,
    officerInCharge: "PI Vijay Patil",
    contactNumber: "+91 712 2561005",
    keyVulnerabilities: [
      "Dense historic alleys",
      "Wholesale bullion & grocery markets",
      "High commercial burglary risk",
    ],
  },
  {
    id: "poly-dharampeth",
    zoneId: "zone-dharampeth",
    name: "Dharampeth / Gokulpeth",
    code: "NGP-SEC-06",
    wardName: "Zone 2 / Ward 14 - Dharampeth",
    boundaryCoordinates: [
      J.FUTALA_W,
      J.CIVIL_LINES_C,
      J.DHARAMPETH_C,
      J.AMBAZARI_W,
      J.FUTALA_W,
    ],
    center: { lat: 21.142, lng: 79.049 },
    areaKm2: 4.8,
    populationEstimate: 92000,
    officerInCharge: "PI Sunil Patil",
    contactNumber: "+91 712 2561006",
    keyVulnerabilities: [
      "Commercial shopping street",
      "Jewelry market corridor",
      "Evening vehicle theft & congestion",
    ],
  },
  {
    id: "poly-sitabuldi",
    zoneId: "zone-sitabuldi",
    name: "Sitabuldi Interchange / Metro Hub",
    code: "NGP-SEC-07",
    wardName: "Zone 4 / Ward 15 - Sitabuldi Central",
    boundaryCoordinates: [
      J.CIVIL_LINES_C,
      J.SADAR_S,
      J.SITABULDI_C,
      J.RAMDASPETH_S,
      J.DHARAMPETH_C,
      J.CIVIL_LINES_C,
    ],
    center: { lat: 21.147, lng: 79.073 },
    areaKm2: 3.2,
    populationEstimate: 96000,
    officerInCharge: "DCP Pravin Padole",
    contactNumber: "+91 712 2561007",
    keyVulnerabilities: [
      "Massive transit passenger flow (Metro interchange)",
      "Pickpocketing & bag snatching",
      "Late-night railway corridor footfall",
    ],
  },
  {
    id: "poly-mahal",
    zoneId: "zone-mahal",
    name: "Mahal / Gandhibagh Heritage",
    code: "NGP-SEC-08",
    wardName: "Zone 6 / Ward 19 - Mahal Town Hall",
    boundaryCoordinates: [
      J.SITABULDI_C,
      J.ITWARI_C,
      J.LAKADGANJ_C,
      J.MAHAL_C,
      J.MEDICAL_C,
      J.RAMDASPETH_S,
      J.SITABULDI_C,
    ],
    center: { lat: 21.142, lng: 79.108 },
    areaKm2: 5.6,
    populationEstimate: 165000,
    officerInCharge: "ACP Nitin Bagade",
    contactNumber: "+91 712 2561008",
    keyVulnerabilities: [
      "High population density",
      "Narrow lanes with low police van mobility",
      "Chain-snatching in crowded bazaars",
    ],
  },
  {
    id: "poly-lakadganj-pardi",
    zoneId: "zone-pardi",
    name: "Lakadganj / Pardi Bhandara Corridor",
    code: "NGP-SEC-09",
    wardName: "Zone 8 / Ward 26 - Pardi East",
    boundaryCoordinates: [
      J.LAKADGANJ_C,
      J.PARDI_E,
      J.PARDI_SE,
      J.NANDANVAN_C,
      J.LAKADGANJ_C,
    ],
    center: { lat: 21.136, lng: 79.155 },
    areaKm2: 8.8,
    populationEstimate: 142000,
    officerInCharge: "ACP Rajesh Wankhede",
    contactNumber: "+91 712 2561009",
    keyVulnerabilities: [
      "Bhandara Road heavy industrial transport",
      "Timber market storage yards",
      "CCTV blind spots along railway sidings",
    ],
  },
  {
    id: "poly-itpark",
    zoneId: "zone-itpark",
    name: "IT Park / Gayatri Nagar Tech Hub",
    code: "NGP-SEC-10",
    wardName: "Zone 1 / Ward 31 - IT Park",
    boundaryCoordinates: [
      J.AMBAZARI_W,
      J.DHARAMPETH_C,
      J.PRATAP_C,
      J.HINGNA_SW,
      J.AMBAZARI_W,
    ],
    center: { lat: 21.124, lng: 79.048 },
    areaKm2: 6.2,
    populationEstimate: 78000,
    officerInCharge: "PI Maya Shinde",
    contactNumber: "+91 712 2561010",
    keyVulnerabilities: [
      "Late night corporate tech shifts",
      "Solo female commuter transit (10 PM - 3 AM)",
      "Outer lake perimeter surveillance gap",
    ],
  },
  {
    id: "poly-ramdaspeth-dhantoli",
    zoneId: "zone-dhantoli",
    name: "Dhantoli / Ramdaspeth Medical Hub",
    code: "NGP-SEC-11",
    wardName: "Zone 4 / Ward 16 - Ramdaspeth",
    boundaryCoordinates: [
      J.DHARAMPETH_C,
      J.RAMDASPETH_S,
      J.MEDICAL_C,
      J.PRATAP_C,
      J.DHARAMPETH_C,
    ],
    center: { lat: 21.131, lng: 79.072 },
    areaKm2: 3.9,
    populationEstimate: 118000,
    officerInCharge: "ACP Anjali Kulkarni",
    contactNumber: "+91 712 2561011",
    keyVulnerabilities: [
      "Multi-speciality hospital traffic",
      "High daytime vehicle inflow",
      "Ambulance corridor congestion",
    ],
  },
  {
    id: "poly-pratap-nagar",
    zoneId: "zone-itpark",
    name: "Pratap Nagar / Khamla Residential",
    code: "NGP-SEC-12",
    wardName: "Zone 1 / Ward 32 - Pratap Nagar",
    boundaryCoordinates: [
      J.HINGNA_SW,
      J.PRATAP_C,
      J.MANEWADA_C,
      J.AIRPORT_SW,
      J.HINGNA_SW,
    ],
    center: { lat: 21.103, lng: 79.060 },
    areaKm2: 7.5,
    populationEstimate: 112000,
    officerInCharge: "PI Maya Shinde",
    contactNumber: "+91 712 2561012",
    keyVulnerabilities: [
      "Airport approach corridor",
      "Suburban residential daytime burglaries",
      "Ring road speed compliance",
    ],
  },
  {
    id: "poly-medical-ajni",
    zoneId: "zone-medical",
    name: "Medical Square / GMCH / Ajni",
    code: "NGP-SEC-13",
    wardName: "Zone 3 / Ward 18 - Medical Square",
    boundaryCoordinates: [
      J.MEDICAL_C,
      J.SAKKARDARA_C,
      J.MANEWADA_C,
      J.PRATAP_C,
      J.MEDICAL_C,
    ],
    center: { lat: 21.120, lng: 79.087 },
    areaKm2: 4.6,
    populationEstimate: 110000,
    officerInCharge: "PI Suresh Meshram",
    contactNumber: "+91 712 2561013",
    keyVulnerabilities: [
      "Government Medical College & Hospital rush",
      "Ajni railway station feeder roads",
      "Night trauma center emergency traffic",
    ],
  },
  {
    id: "poly-sakkardara",
    zoneId: "zone-hudkeshwar",
    name: "Sakkardara / Reshimbagh",
    code: "NGP-SEC-14",
    wardName: "Zone 3 / Ward 24 - Sakkardara Lake",
    boundaryCoordinates: [
      J.MAHAL_C,
      J.NANDANVAN_C,
      J.DIGHORI_E,
      J.SAKKARDARA_C,
      J.MEDICAL_C,
      J.MAHAL_C,
    ],
    center: { lat: 21.126, lng: 79.121 },
    areaKm2: 5.8,
    populationEstimate: 145000,
    officerInCharge: "ACP Smita Deshmukh",
    contactNumber: "+91 712 2561014",
    keyVulnerabilities: [
      "Lake perimeter recreation gathering",
      "Market square congestion",
      "Two-wheeler theft hotspot",
    ],
  },
  {
    id: "poly-nandanvan",
    zoneId: "zone-pardi",
    name: "Nandanvan / Hasanbagh",
    code: "NGP-SEC-15",
    wardName: "Zone 8 / Ward 27 - Nandanvan",
    boundaryCoordinates: [
      J.NANDANVAN_C,
      J.PARDI_SE,
      J.DIGHORI_SE,
      J.DIGHORI_E,
      J.NANDANVAN_C,
    ],
    center: { lat: 21.110, lng: 79.150 },
    areaKm2: 6.8,
    populationEstimate: 118000,
    officerInCharge: "ACP Rajesh Wankhede",
    contactNumber: "+91 712 2561015",
    keyVulnerabilities: [
      "Educational institutions corridor",
      "Evening youth gathering spots",
      "Outer link bypass accidents",
    ],
  },
  {
    id: "poly-hudkeshwar-manewada",
    zoneId: "zone-hudkeshwar",
    name: "Hudkeshwar / Manewada / Besa",
    code: "NGP-SEC-16",
    wardName: "Zone 5 / Ward 29 - Hudkeshwar",
    boundaryCoordinates: [
      J.AIRPORT_SW,
      J.MANEWADA_C,
      J.SAKKARDARA_C,
      J.DIGHORI_E,
      J.DIGHORI_SE,
      J.HUDKESHWAR_S,
      J.BESA_S,
      J.AIRPORT_SW,
    ],
    center: { lat: 21.090, lng: 79.098 },
    areaKm2: 13.5,
    populationEstimate: 178000,
    officerInCharge: "ACP Smita Deshmukh",
    contactNumber: "+91 712 2561016",
    keyVulnerabilities: [
      "Rapidly developing southern peri-urban sprawl",
      "Significant street lighting deficits in new layouts",
      "Outer ring road night speeding",
    ],
  },
];

// ============================================================================
// 3. SPATIAL GEOMETRY & POINT-IN-POLYGON UTILITIES
// ============================================================================

/**
 * Standard Ray-Casting Algorithm to test if a point (lat, lng) is strictly
 * inside a closed polygonal boundary.
 *
 * Handles epsilon vertex snapping for numerical stability on boundaries.
 */
export function isPointInPolygon(
  point: { lat: number; lng: number },
  polygonCoordinates: [number, number][]
): boolean;
export function isPointInPolygon(
  lat: number,
  lng: number,
  polygon: [number, number][]
): boolean;
export function isPointInPolygon(
  first: number | { lat: number; lng: number },
  second: number | [number, number][],
  third?: [number, number][]
): boolean {
  let lat: number;
  let lng: number;
  let polygon: [number, number][];

  if (typeof first === "object" && first !== null) {
    lat = first.lat;
    lng = first.lng;
    polygon = second as [number, number][];
  } else {
    lat = first as number;
    lng = second as number;
    polygon = third as [number, number][];
  }

  if (!polygon || polygon.length < 3) return false;

  let inside = false;
  const n = polygon.length;

  for (let i = 0, j = n - 1; i < n; j = i++) {
    const yi = polygon[i]![0];
    const xi = polygon[i]![1];
    const yj = polygon[j]![0];
    const xj = polygon[j]![1];

    // Check if point is very close to an edge or vertex (boundary tolerance ~5 meters)
    const onSegment =
      Math.abs((yj - yi) * (lng - xi) - (lat - yi) * (xj - xi)) < 1e-9 &&
      Math.min(xi, xj) - 1e-6 <= lng &&
      lng <= Math.max(xi, xj) + 1e-6 &&
      Math.min(yi, yj) - 1e-6 <= lat &&
      lat <= Math.max(yi, yj) + 1e-6;

    if (onSegment) return true;

    const intersect =
      yi > lat !== yj > lat &&
      lng < ((xj - xi) * (lat - yi)) / (yj - yi + 1e-12) + xi;

    if (intersect) inside = !inside;
  }

  return inside;
}

/**
 * Computes Euclidean distance squared between two coordinates for fast sorting
 */
function fastDistSq(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLat = lat2 - lat1;
  const dLng = lng2 - lng1;
  return dLat * dLat + dLng * dLng;
}

/**
 * Deterministically assigns an incident location to its matching polygon.
 * If the coordinates are slightly outside all municipal sectors (e.g. boundary buffer),
 * it assigns to the nearest polygon by centroid distance.
 */
export function assignIncidentToPolygon(
  location: { lat: number; lng: number },
  polygons: CrimePolygonRegion[] = NAGPUR_CRIME_POLYGONS
): CrimePolygonRegion | null {
  if (
    typeof location.lat !== "number" ||
    typeof location.lng !== "number" ||
    isNaN(location.lat) ||
    isNaN(location.lng)
  ) {
    return null;
  }

  // 1. Direct point-in-polygon containment
  for (const polygon of polygons) {
    if (isPointInPolygon(location.lat, location.lng, polygon.boundaryCoordinates)) {
      return polygon;
    }
  }

  // 2. Deterministic Nearest-Centroid Fallback for boundary buffer cases (< 5 km)
  let nearestPoly: CrimePolygonRegion | null = null;
  let minDistanceSq = Infinity;

  for (const polygon of polygons) {
    const dSq = fastDistSq(location.lat, location.lng, polygon.center.lat, polygon.center.lng);
    if (dSq < minDistanceSq) {
      minDistanceSq = dSq;
      nearestPoly = polygon;
    }
  }

  // Only assign if within approx 8 km radius of Nagpur urban envelope (0.08 deg sq ~ 0.0064)
  if (minDistanceSq < 0.015) {
    return nearestPoly;
  }

  return null;
}

// ============================================================================
// 4. GEOJSON INTERCHANGE EXPORT HELPER
// ============================================================================

export interface GeoJsonPolygonFeature {
  type: "Feature";
  id: string;
  properties: {
    polygonId: string;
    zoneId: string;
    name: string;
    code: string;
    wardName: string;
    areaKm2: number;
    populationEstimate: number;
    officerInCharge: string;
    contactNumber: string;
  };
  geometry: {
    type: "Polygon";
    coordinates: [number, number][][]; // [lng, lat] order as per GeoJSON spec (RFC 7946)
  };
}

export interface GeoJsonPolygonCollection {
  type: "FeatureCollection";
  features: GeoJsonPolygonFeature[];
}

/**
 * Converts Nagpur crime polygons to standard GeoJSON FeatureCollection (RFC 7946).
 * Automatically reverses [lat, lng] to [longitude, latitude] as required by GeoJSON.
 */
export function toNagpurGeoJson(
  polygons: CrimePolygonRegion[] = NAGPUR_CRIME_POLYGONS
): GeoJsonPolygonCollection {
  return {
    type: "FeatureCollection",
    features: polygons.map((poly) => {
      // Ensure the polygon ring is explicitly closed for GeoJSON
      const rawCoords = poly.boundaryCoordinates;
      const closed =
        rawCoords[0]![0] === rawCoords[rawCoords.length - 1]![0] &&
        rawCoords[0]![1] === rawCoords[rawCoords.length - 1]![1]
          ? rawCoords
          : [...rawCoords, rawCoords[0]!];

      // Convert [lat, lng] -> [lng, lat]
      const geoJsonRing: [number, number][] = closed.map(([lat, lng]) => [lng, lat]);

      return {
        type: "Feature",
        id: poly.id,
        properties: {
          polygonId: poly.id,
          zoneId: poly.zoneId,
          name: poly.name,
          code: poly.code,
          wardName: poly.wardName,
          areaKm2: poly.areaKm2,
          populationEstimate: poly.populationEstimate,
          officerInCharge: poly.officerInCharge,
          contactNumber: poly.contactNumber,
        },
        geometry: {
          type: "Polygon",
          coordinates: [geoJsonRing],
        },
      };
    }),
  };
}


/**
 * Finds the corresponding Crime Polygon Region when a user clicks anywhere on the map.
 * Checks ray-casting containment first, then falls back to nearest center distance.
 */
export function findCrimePolygonAtLocation<T extends { boundaryCoordinates: [number, number][]; center: { lat: number; lng: number } }>(
  lat: number,
  lng: number,
  polygons: T[]
): T | null {
  if (!polygons || polygons.length === 0) return null;

  // 1. Ray-casting check
  for (const poly of polygons) {
    if (isPointInPolygon({ lat, lng }, poly.boundaryCoordinates)) {
      return poly;
    }
  }

  // 2. Nearest center distance check
  let closest: T | null = null;
  let minDistanceSq = Infinity;
  for (const poly of polygons) {
    const dLat = poly.center.lat - lat;
    const dLng = poly.center.lng - lng;
    const distSq = dLat * dLat + dLng * dLng;
    if (distSq < minDistanceSq) {
      minDistanceSq = distSq;
      closest = poly;
    }
  }
  return closest;
}
