export type CrimeType =
  | "Theft"
  | "Robbery"
  | "Assault"
  | "Vehicle Theft"
  | "Burglary"
  | "Murder"
  | "Chain-snatching"
  | "Accident"
  | "Smuggling"
  | "Cybercrime"
  | "Harassment"
  | "Other";

export type CrimeCategoryFilter =
  | "All Crime"
  | "Theft"
  | "Robbery"
  | "Assault"
  | "Vehicle Theft"
  | "Burglary"
  | "Other";

export type TimeFilterPeriod =
  | "Today"
  | "Last 7 Days"
  | "Last 30 Days"
  | "Last 6 Months"
  | "All Time";

export type Severity = "low" | "medium" | "high" | "critical";

export type IncidentStatus = "open" | "investigating" | "resolved";

export interface Zone {
  id: string;
  name: string;
  code: string;
  lat: number;
  lng: number;
  radiusKm: number;
  officerInCharge: string;
  activePatrols: number;
  populationEstimate: number;
}

export interface Incident {
  id: string;
  type: CrimeType;
  lat: number;
  lng: number;
  timestamp: string;
  severity: Severity;
  zoneId: string;
  description: string;
  status: IncidentStatus;
}

export interface CCTVCamera {
  id: string;
  name: string;
  lat: number;
  lng: number;
  isOperational: boolean;
  zoneId: string;
  installDate: string;
  lastMaintenance: string | null;
  coverageRadiusM: number;
}

export interface BlindSpot {
  id: string;
  lat: number;
  lng: number;
  riskScore: number;
  zoneId: string;
  reason: string;
}

export interface PolicePatrolUnit {
  id: string;
  unitCode: string;
  zoneId: string;
  lat: number;
  lng: number;
  status: "patrolling" | "responding" | "standby";
  officerCount: number;
  vehicleType: "PCR Van" | "Quick Response Bike" | "Interceptor";
  lastPing: string;
}

export interface ZoneCrimeRiskAnalytics {
  zoneId: string;
  zoneName: string;
  code: string;
  lat: number;
  lng: number;
  riskScore: number; // 0 - 100
  riskLevel: "HIGH" | "MEDIUM" | "LOW";
  recentIncidentsCount: number;
  historicalIncidentsCount: number;
  crimeTrendPercentage: number; // e.g. +23 or -12
  cctvCoverageStatus: "Good" | "Moderate" | "Poor";
  cctvCoveragePercent: number;
  nightRiskLevel: "High" | "Medium" | "Low";
  status: "CRITICAL PRIORITY" | "EMERGING HOTSPOT" | "HIGH PRIORITY" | "MODERATE" | "SAFE & STABLE";
  isEmergingHotspot: boolean;
  isCriticalPriority: boolean; // High Crime + Low CCTV
  highRiskReasons: string[];
  aiRecommendation: string;
  circleRadiusMeters: number;
  circleColorHex: string;
  circleFillOpacity: number;
}

export interface ApiMeta {
  total: number;
  generatedAt: string;
  source: "mock";
}

export interface ZonesResponse {
  data: Zone[];
  meta: ApiMeta;
}

export interface IncidentsResponse {
  data: Incident[];
  meta: ApiMeta & {
    filters?: {
      zoneId?: string;
      severity?: Severity;
      type?: CrimeType;
      status?: IncidentStatus;
    };
  };
}

export interface CCTVResponse {
  data: CCTVCamera[];
  meta: ApiMeta & {
    operational: number;
    nonOperational: number;
    filters?: {
      operational?: boolean;
      zoneId?: string;
    };
  };
}

export interface BlindSpotsResponse {
  data: BlindSpot[];
  meta: ApiMeta & {
    page: number;
    pageSize: number;
    totalPages: number;
    filters?: {
      zoneId?: string;
      minRiskScore?: number;
    };
  };
}

export interface CrimePolygonRegion {
  id: string;
  zoneId: string;
  name: string;
  code: string;
  wardName: string;
  boundaryCoordinates: [number, number][]; // Array of [lat, lng] forming a closed polygon
  center: { lat: number; lng: number };
  areaKm2: number;
  populationEstimate: number;
  officerInCharge: string;
  contactNumber: string;
  keyVulnerabilities: string[];
}

export interface PolygonRiskAnalytics {
  polygonId: string;
  zoneId: string;
  name: string;
  code: string;
  wardName: string;
  boundaryCoordinates: [number, number][];
  center: { lat: number; lng: number };
  riskScore: number;
  riskLevel: "HIGH" | "MEDIUM" | "LOW";
  status:
    | "CRITICAL PRIORITY"
    | "EMERGING HOTSPOT"
    | "HIGH PRIORITY"
    | "MODERATE"
    | "SAFE & STABLE"
    | "INSUFFICIENT DATA";
  colorHex: string;
  fillOpacity: number;
  strokeColorHex: string;
  strokeWeight: number;
  recentIncidentsCount: number;
  historicalIncidentsCount: number;
  categoryBreakdown: Record<string, number>;
  crimeTrendPercentage: number;
  cctvCount: number;
  cctvOperationalCount: number;
  cctvCoveragePercent: number;
  cctvCoverageStatus: "Good" | "Moderate" | "Poor";
  lightingIndex: number;
  nightRiskLevel: "High" | "Medium" | "Low";
  isEmergingHotspot: boolean;
  isCriticalPriority: boolean;
  highRiskReasons: string[];
  aiRecommendation: string;
  dataConfidence: "High" | "Moderate" | "Low" | "Insufficient";
  dataLimitations?: string;
  officerInCharge: string;
  contactNumber: string;
  populationEstimate: number;
  areaKm2: number;
}
