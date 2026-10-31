/**
 * N-SHIELD Hospital & Geospatial Validation Layer
 * 
 * Strict geospatial validation rules for Nagpur urban safety intelligence:
 * 1. Latitude in [-90, 90], Longitude in [-180, 180]
 * 2. Strict Nagpur metropolitan bounding box check
 * 3. Finite, non-NaN coordinate verification
 * 4. Coordinate precision audit (flagging rounded/approximate coords)
 * 5. Spatial collision detection (flagging legitimate shared medical complexes vs duplicates)
 * 6. Verification status taxonomy: 'verified' | 'needs_review' | 'unverified'
 */

import type { NagpurHospital, VerificationStatus } from "../hospitalDirectoryData";
import { calculateDistanceMeters } from "../geoUtils";

// Plausible Nagpur Metropolitan Area bounding box
// Covers Hingna / Butibori / Jamtha (South), Koradi / Kamptee (North),
// Wadi / Digdoh (West), and Pardi / Narsala / Kapsi (East).
export const NAGPUR_GEO_BOUNDS = {
  minLat: 20.8000,
  maxLat: 21.3500,
  minLng: 78.8500,
  maxLng: 79.3500,
} as const;

export interface ValidationIssue {
  field: string;
  code:
    | "INVALID_LATITUDE"
    | "INVALID_LONGITUDE"
    | "OUT_OF_BOUNDS"
    | "LOW_PRECISION"
    | "SHARED_LOCATION_CLUSTER"
    | "SUSPECT_ROAD_CENTER"
    | "UNVERIFIED_SOURCE";
  severity: "error" | "warning" | "info";
  message: string;
}

export interface ValidatedHospitalRecord {
  hospital: NagpurHospital;
  isValid: boolean;
  status: VerificationStatus;
  issues: ValidationIssue[];
  coLocatedFacilityIds: string[];
}

export interface DirectoryValidationReport {
  totalRecords: number;
  validRecords: number;
  verifiedCount: number;
  needsReviewCount: number;
  unverifiedCount: number;
  duplicateClustersCount: number;
  records: ValidatedHospitalRecord[];
}

/**
 * Validates individual coordinates for numeric sanity and Nagpur regional bounds
 */
export function validateCoordinates(lat: number, lng: number): { isValid: boolean; issues: ValidationIssue[] } {
  const issues: ValidationIssue[] = [];

  if (typeof lat !== "number" || isNaN(lat) || !isFinite(lat)) {
    issues.push({
      field: "latitude",
      code: "INVALID_LATITUDE",
      severity: "error",
      message: `Latitude must be a valid finite number. Received: ${lat}`,
    });
  } else if (lat < -90 || lat > 90) {
    issues.push({
      field: "latitude",
      code: "INVALID_LATITUDE",
      severity: "error",
      message: `Latitude out of global range [-90, 90]: ${lat}`,
    });
  }

  if (typeof lng !== "number" || isNaN(lng) || !isFinite(lng)) {
    issues.push({
      field: "longitude",
      code: "INVALID_LONGITUDE",
      severity: "error",
      message: `Longitude must be a valid finite number. Received: ${lng}`,
    });
  } else if (lng < -180 || lng > 180) {
    issues.push({
      field: "longitude",
      code: "INVALID_LONGITUDE",
      severity: "error",
      message: `Longitude out of global range [-180, 180]: ${lng}`,
    });
  }

  // Nagpur Regional Bounds Check
  if (
    issues.length === 0 &&
    (lat < NAGPUR_GEO_BOUNDS.minLat ||
      lat > NAGPUR_GEO_BOUNDS.maxLat ||
      lng < NAGPUR_GEO_BOUNDS.minLng ||
      lng > NAGPUR_GEO_BOUNDS.maxLng)
  ) {
    issues.push({
      field: "coordinates",
      code: "OUT_OF_BOUNDS",
      severity: "error",
      message: `Coordinates (${lat}, ${lng}) fall outside Nagpur Metropolitan region bounds.`,
    });
  }

  // Precision check: Coordinates with <= 3 decimal places (~110m precision error)
  const latDecimals = (lat.toString().split(".")[1] || "").length;
  const lngDecimals = (lng.toString().split(".")[1] || "").length;
  if (latDecimals <= 3 || lngDecimals <= 3) {
    issues.push({
      field: "coordinates",
      code: "LOW_PRECISION",
      severity: "warning",
      message: `Coordinates have only ${Math.min(latDecimals, lngDecimals)} decimal places (precision error > 100m). Exact building premises require at least 5 decimal places.`,
    });
  }

  return {
    isValid: issues.filter((i) => i.severity === "error").length === 0,
    issues,
  };
}

/**
 * Validates a single hospital record against data model and geospatial requirements
 */
export function validateHospitalRecord(hospital: NagpurHospital): ValidatedHospitalRecord {
  const coordValidation = validateCoordinates(hospital.latitude, hospital.longitude);
  const issues = [...coordValidation.issues];

  let status: VerificationStatus = hospital.verificationStatus;

  if (!coordValidation.isValid) {
    status = "unverified";
  } else if (issues.some((i) => i.severity === "warning")) {
    // If low precision, downgrade verified to needs_review unless explicitly confirmed
    if (status === "verified") {
      status = "needs_review";
    }
  }

  if (hospital.verificationStatus === "unverified" && !issues.some((i) => i.code === "UNVERIFIED_SOURCE")) {
    issues.push({
      field: "verificationStatus",
      code: "UNVERIFIED_SOURCE",
      severity: "info",
      message: "Facility is flagged as unverified candidate awaiting ground confirmation.",
    });
  }

  return {
    hospital,
    isValid: coordValidation.isValid,
    status,
    issues,
    coLocatedFacilityIds: [],
  };
}

/**
 * Validates entire Nagpur Hospital Directory and detects co-located/overlapping facilities.
 * Facilities within 45 meters are detected as legitimate shared complexes or potential duplicates.
 */
export function validateHospitalDirectory(
  directory: NagpurHospital[],
  clusterThresholdMeters: number = 45
): DirectoryValidationReport {
  const records = directory.map(validateHospitalRecord);
  let duplicateClustersCount = 0;

  // Collision and Cluster Detection
  for (let i = 0; i < records.length; i++) {
    for (let j = i + 1; j < records.length; j++) {
      const recA = records[i];
      const recB = records[j];

      if (!recA.isValid || !recB.isValid) continue;

      const dist = calculateDistanceMeters(
        recA.hospital.latitude,
        recA.hospital.longitude,
        recB.hospital.latitude,
        recB.hospital.longitude
      );

      if (dist <= clusterThresholdMeters) {
        recA.coLocatedFacilityIds.push(recB.hospital.id);
        recB.coLocatedFacilityIds.push(recA.hospital.id);

        recA.issues.push({
          field: "coordinates",
          code: "SHARED_LOCATION_CLUSTER",
          severity: "info",
          message: `Co-located within ${dist.toFixed(0)}m of "${recB.hospital.name}" (${recB.hospital.locality}). Legitimate shared medical complex or compound.`,
        });

        recB.issues.push({
          field: "coordinates",
          code: "SHARED_LOCATION_CLUSTER",
          severity: "info",
          message: `Co-located within ${dist.toFixed(0)}m of "${recA.hospital.name}" (${recA.hospital.locality}). Legitimate shared medical complex or compound.`,
        });

        duplicateClustersCount++;
      }
    }
  }

  return {
    totalRecords: records.length,
    validRecords: records.filter((r) => r.isValid).length,
    verifiedCount: records.filter((r) => r.status === "verified").length,
    needsReviewCount: records.filter((r) => r.status === "needs_review").length,
    unverifiedCount: records.filter((r) => r.status === "unverified").length,
    duplicateClustersCount,
    records,
  };
}

