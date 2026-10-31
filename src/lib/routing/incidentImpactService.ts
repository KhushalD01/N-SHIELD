/**
 * Geospatial Incident Impact Service
 * Computes point-to-segment perpendicular distances along road network polylines
 * N-SHIELD: AI-Driven Urban Safety Intelligence Model
 */

import { calculateDistanceMeters } from "@/lib/geoUtils";
import type {
  DisruptionIncident,
  IncidentImpactOnRoute,
  RouteImpactReport,
} from "./types";

/**
 * Calculates perpendicular distance from a point P to a line segment AB in meters.
 * Uses equirectangular projection approximation for fast local Euclidean projection,
 * followed by accurate Haversine calculation to the projected nearest point.
 */
export function pointToSegmentDistanceMeters(
  pLat: number,
  pLng: number,
  aLat: number,
  aLng: number,
  bLat: number,
  bLng: number
): { distanceMeters: number; nearestLat: number; nearestLng: number } {
  // Convert lat/lng differences to local planar meters
  const midLat = ((aLat + bLat) / 2) * (Math.PI / 180);
  const metersPerDegLat = 111132.92;
  const metersPerDegLng = 111412.84 * Math.cos(midLat);

  const dx = (bLng - aLng) * metersPerDegLng;
  const dy = (bLat - aLat) * metersPerDegLat;
  const segLenSq = dx * dx + dy * dy;

  if (segLenSq < 1e-6) {
    // A and B are essentially the same point
    const d = calculateDistanceMeters(pLat, pLng, aLat, aLng);
    return { distanceMeters: d, nearestLat: aLat, nearestLng: aLng };
  }

  // Vector from A to P
  const apx = (pLng - aLng) * metersPerDegLng;
  const apy = (pLat - aLat) * metersPerDegLat;

  // Projection parameter t clamped to [0, 1]
  const t = Math.max(0, Math.min(1, (apx * dx + apy * dy) / segLenSq));

  const nearestLat = aLat + t * (bLat - aLat);
  const nearestLng = aLng + t * (bLng - aLng);

  const distanceMeters = calculateDistanceMeters(pLat, pLng, nearestLat, nearestLng);
  return { distanceMeters, nearestLat, nearestLng };
}

/**
 * Finds the minimum distance from an incident point to an entire route polyline
 */
export function distanceToRoutePolyline(
  lat: number,
  lng: number,
  geometry: [number, number][]
): { minDistanceMeters: number; nearestSegmentIndex: number } {
  if (!geometry || geometry.length < 2) {
    if (geometry && geometry.length === 1) {
      return {
        minDistanceMeters: calculateDistanceMeters(lat, lng, geometry[0][0], geometry[0][1]),
        nearestSegmentIndex: 0,
      };
    }
    return { minDistanceMeters: Infinity, nearestSegmentIndex: -1 };
  }

  let minDistanceMeters = Infinity;
  let nearestSegmentIndex = 0;

  for (let i = 0; i < geometry.length - 1; i++) {
    const a = geometry[i];
    const b = geometry[i + 1];

    const { distanceMeters } = pointToSegmentDistanceMeters(
      lat,
      lng,
      a[0],
      a[1],
      b[0],
      b[1]
    );

    if (distanceMeters < minDistanceMeters) {
      minDistanceMeters = distanceMeters;
      nearestSegmentIndex = i;
    }
  }

  return { minDistanceMeters, nearestSegmentIndex };
}

/**
 * Assesses the impact of all active incidents on a given candidate route
 */
export function assessRouteIncidentImpact(params: {
  routeId: string;
  routeName: string;
  geometry: [number, number][];
  distanceMeters: number;
  durationSeconds: number;
  incidents: DisruptionIncident[];
  directThresholdMeters?: number; // default 140m
  proximityThresholdMeters?: number; // default 500m
}): RouteImpactReport {
  const {
    routeId,
    routeName,
    geometry,
    distanceMeters,
    durationSeconds,
    incidents,
    directThresholdMeters = 140,
    proximityThresholdMeters = 500,
  } = params;

  const blockingIncidents: IncidentImpactOnRoute[] = [];
  const nearbyIncidents: IncidentImpactOnRoute[] = [];
  let closureCount = 0;
  let totalIncidentScore = 0;

  for (const inc of incidents) {
    // 1. Skip if no location coordinates
    if (!inc.location || typeof inc.location.lat !== "number" || typeof inc.location.lng !== "number") {
      continue;
    }

    // 2. Skip resolved or expired incidents
    if (inc.status === "resolved") {
      continue;
    }

    const { minDistanceMeters, nearestSegmentIndex } = distanceToRoutePolyline(
      inc.location.lat,
      inc.location.lng,
      geometry
    );

    // Apply incident-specific impact radius multiplier
    const effectiveDirectThreshold = Math.max(
      directThresholdMeters,
      inc.isClosure ? 180 : inc.category === "protest" ? 220 : directThresholdMeters
    );

    const isDirect = minDistanceMeters <= effectiveDirectThreshold;
    const isNearby = !isDirect && minDistanceMeters <= proximityThresholdMeters;

    if (!isDirect && !isNearby) {
      continue; // Outside route impact envelope
    }

    // Calculate impact severity score based on severity, confidence, and freshness
    const severityMultiplier =
      inc.severity === "critical" ? 4.0 : inc.severity === "high" ? 2.5 : inc.severity === "medium" ? 1.4 : 0.8;
    const confidenceWeight = inc.confidence || 0.7;
    const freshnessWeight = inc.status === "stale" ? 0.4 : 1.0;
    const directMultiplier = isDirect ? 2.2 : 0.7;

    const impactSeverityScore = Math.round(
      severityMultiplier * confidenceWeight * freshnessWeight * directMultiplier * 10
    );

    const impactItem: IncidentImpactOnRoute = {
      incident: inc,
      distanceToRouteMeters: Math.round(minDistanceMeters),
      nearestSegmentIndex,
      isDirectObstruction: isDirect,
      isNearbyAdvisory: isNearby,
      impactSeverityScore,
    };

    if (isDirect) {
      blockingIncidents.push(impactItem);
      if (inc.isClosure) {
        closureCount++;
      }
    } else {
      nearbyIncidents.push(impactItem);
    }

    totalIncidentScore += impactSeverityScore;
  }

  const hasConfirmedClosure = closureCount > 0;
  const isMateriallyAffected = hasConfirmedClosure || blockingIncidents.length > 0;
  const passable = !hasConfirmedClosure;

  let summaryReason = "Route clear; no material disruptions or closures detected.";
  if (hasConfirmedClosure) {
    summaryReason = `Route obstructed by ${closureCount} confirmed road closure(s). Diversion required.`;
  } else if (blockingIncidents.length > 0) {
    const top = blockingIncidents[0].incident;
    summaryReason = `Route materially affected by active ${top.category.replace("_", " ")} near ${top.location?.name || "corridor"}.`;
  } else if (nearbyIncidents.length > 0) {
    summaryReason = `${nearbyIncidents.length} advisory incident(s) near corridor, but road remains passable.`;
  }

  return {
    routeId,
    routeName,
    totalDistanceMeters: distanceMeters,
    durationSeconds,
    isMateriallyAffected,
    hasConfirmedClosure,
    closureCount,
    blockingIncidents,
    nearbyIncidents,
    totalIncidentScore,
    passable,
    summaryReason,
  };
}
