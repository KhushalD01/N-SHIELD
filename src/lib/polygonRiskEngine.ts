/**
 * N-SHIELD Polygon Crime Risk Engine
 *
 * Computes granular, polygon-level crime risk analytics, dynamic color thresholds,
 * CCTV coverage, and explainable AI insights across Nagpur's 16 municipal sectors.
 *
 * Integrates with existing crime category filters, time periods, and simulated hour.
 */

import type {
  CCTVCamera,
  CrimeCategoryFilter,
  Incident,
  PolygonRiskAnalytics,
  TimeFilterPeriod,
} from "./types";
import {
  NAGPUR_CRIME_POLYGONS,
  assignIncidentToPolygon,
  isPointInPolygon,
} from "./nagpurPolygons";
import {
  filterIncidentsByCategory,
  filterIncidentsByTime,
  getZoneLighting,
  severityToWeight,
} from "./riskEngine";

/**
 * Computes risk analytics for all 16 polygon sectors in Nagpur
 */
export function computeAllPolygonsRisk(
  allIncidents: Incident[],
  allCameras: CCTVCamera[],
  timeFilter: TimeFilterPeriod,
  categoryFilter: CrimeCategoryFilter,
  simulatedHour: number = 22,
  selectedPolygonId: string | null = null
): PolygonRiskAnalytics[] {
  // 1. Spatially index incidents into polygons
  const incidentsByPolygon = new Map<string, Incident[]>();
  for (const poly of NAGPUR_CRIME_POLYGONS) {
    incidentsByPolygon.set(poly.id, []);
  }

  for (const incident of allIncidents) {
    // Spatial assignment via ray casting with nearest fallback
    const matchedPoly = assignIncidentToPolygon(
      { lat: incident.lat, lng: incident.lng },
      NAGPUR_CRIME_POLYGONS
    );
    if (matchedPoly) {
      incidentsByPolygon.get(matchedPoly.id)?.push(incident);
    }
  }

  // 2. Spatially index cameras into polygons
  const camerasByPolygon = new Map<string, CCTVCamera[]>();
  for (const poly of NAGPUR_CRIME_POLYGONS) {
    camerasByPolygon.set(poly.id, []);
  }

  for (const cam of allCameras) {
    let assigned = false;
    for (const poly of NAGPUR_CRIME_POLYGONS) {
      if (isPointInPolygon(cam.lat, cam.lng, poly.boundaryCoordinates)) {
        camerasByPolygon.get(poly.id)?.push(cam);
        assigned = true;
        break;
      }
    }
    // Fallback: match by parent zoneId if coordinates were outside polygon boundary
    if (!assigned) {
      const matchByZone = NAGPUR_CRIME_POLYGONS.find((p) => p.zoneId === cam.zoneId);
      if (matchByZone) {
        camerasByPolygon.get(matchByZone.id)?.push(cam);
      }
    }
  }

  // 3. Compute metrics for each polygon
  const isNightTime = simulatedHour >= 20 || simulatedHour <= 4;
  const lightingIndex = Math.round(getZoneLighting(simulatedHour));

  return NAGPUR_CRIME_POLYGONS.map((polygon) => {
    const polygonIncidents = incidentsByPolygon.get(polygon.id) || [];
    const historicalCount = polygonIncidents.length;

    // Filter by time period
    const { current: timeFiltered, previous: prevPeriod } = filterIncidentsByTime(
      polygonIncidents,
      timeFilter
    );

    // Filter by crime category
    const currentCategoryIncidents = filterIncidentsByCategory(timeFiltered, categoryFilter);
    const prevCategoryIncidents = filterIncidentsByCategory(prevPeriod, categoryFilter);

    const recentCount = currentCategoryIncidents.length;
    const prevCount = prevCategoryIncidents.length;

    // Crime trend velocity
    let crimeTrendPercentage = 0;
    if (prevCount > 0) {
      crimeTrendPercentage = Math.round(((recentCount - prevCount) / prevCount) * 100);
    } else if (recentCount > 0) {
      crimeTrendPercentage = recentCount * 20;
    }

    // Category breakdown
    const categoryBreakdown: Record<string, number> = {
      Theft: 0,
      Robbery: 0,
      Assault: 0,
      "Vehicle Theft": 0,
      Burglary: 0,
      Other: 0,
    };
    for (const inc of currentCategoryIncidents) {
      if (inc.type === "Theft" || inc.type === "Chain-snatching") {
        categoryBreakdown.Theft = (categoryBreakdown.Theft || 0) + 1;
      } else if (inc.type === "Robbery") {
        categoryBreakdown.Robbery = (categoryBreakdown.Robbery || 0) + 1;
      } else if (inc.type === "Assault" || inc.type === "Murder") {
        categoryBreakdown.Assault = (categoryBreakdown.Assault || 0) + 1;
      } else if (inc.type === "Vehicle Theft") {
        categoryBreakdown["Vehicle Theft"] = (categoryBreakdown["Vehicle Theft"] || 0) + 1;
      } else if (inc.type === "Burglary") {
        categoryBreakdown.Burglary = (categoryBreakdown.Burglary || 0) + 1;
      } else {
        categoryBreakdown.Other = (categoryBreakdown.Other || 0) + 1;
      }
    }

    // CCTV coverage analysis
    const polyCameras = camerasByPolygon.get(polygon.id) || [];
    const totalCctv = polyCameras.length;
    const operationalCount = polyCameras.filter((c) => c.isOperational).length;
    const cctvCoveragePercent =
      totalCctv > 0 ? Math.round((operationalCount / totalCctv) * 100) : 40;

    let cctvCoverageStatus: "Good" | "Moderate" | "Poor" = "Moderate";
    if (cctvCoveragePercent >= 75) cctvCoverageStatus = "Good";
    else if (cctvCoveragePercent < 45 || totalCctv <= 1) cctvCoverageStatus = "Poor";

    // Night risk determination
    let nightRiskLevel: "High" | "Medium" | "Low" = "Low";
    if (isNightTime && (recentCount >= 3 || cctvCoverageStatus === "Poor" || lightingIndex < 25)) {
      nightRiskLevel = "High";
    } else if (isNightTime || recentCount >= 2) {
      nightRiskLevel = "Medium";
    }

    // Data confidence assessment
    let dataConfidence: "High" | "Moderate" | "Low" | "Insufficient" = "High";
    let dataLimitations: string | undefined;

    if (historicalCount === 0 && totalCctv === 0) {
      dataConfidence = "Insufficient";
      dataLimitations = "Sparse incident telemetry. Score calibrated using municipal baseline.";
    } else if (historicalCount < 3) {
      dataConfidence = "Moderate";
      dataLimitations = "Limited recent FIR reports in this timeframe. Supplemental patrol feeds active.";
    }

    // Risk score computation using weighted dimensions
    let baseScore = 20;
    const incidentScore = Math.min(45, recentCount * 8.5);
    const trendScore = crimeTrendPercentage > 0 ? Math.min(20, crimeTrendPercentage * 0.4) : 0;
    const cctvPenalty =
      cctvCoverageStatus === "Poor" ? 18 : cctvCoverageStatus === "Moderate" ? 8 : 0;
    const nightPenalty =
      nightRiskLevel === "High" ? 16 : nightRiskLevel === "Medium" ? 8 : 0;

    let calculatedScore = Math.round(
      baseScore + incidentScore + trendScore + cctvPenalty + nightPenalty
    );
    calculatedScore = Math.max(10, Math.min(96, calculatedScore));

    // Risk Level & Styling
    let riskLevel: "HIGH" | "MEDIUM" | "LOW" = "LOW";
    let colorHex = "#10B981"; // Emerald green
    let strokeColorHex = "#059669";
    let fillOpacity = 0.42;
    let strokeWeight = 1.8;

    if (calculatedScore >= 70) {
      riskLevel = "HIGH";
      colorHex = "#EF4444"; // Red
      strokeColorHex = "#B91C1C";
      fillOpacity = 0.52;
      strokeWeight = 2.4;
    } else if (calculatedScore >= 40) {
      riskLevel = "MEDIUM";
      colorHex = "#F59E0B"; // Amber orange
      strokeColorHex = "#D97706";
      fillOpacity = 0.45;
      strokeWeight = 2.0;
    }

    // Insufficient data neutral visual style
    if (dataConfidence === "Insufficient") {
      colorHex = "#94A3B8";
      strokeColorHex = "#64748B";
      fillOpacity = 0.30;
    }

    // Boost opacity if selected
    const isSelected = selectedPolygonId === polygon.id;
    if (isSelected) {
      fillOpacity = Math.min(0.75, fillOpacity + 0.22);
      strokeWeight = 3.6;
      strokeColorHex = "#FFFFFF";
    }

    // Status classification
    const isEmergingHotspot = crimeTrendPercentage >= 15 && recentCount >= 2;
    const isCriticalPriority = riskLevel === "HIGH" && cctvCoverageStatus === "Poor";

    let status: PolygonRiskAnalytics["status"] = "SAFE & STABLE";
    if (dataConfidence === "Insufficient") {
      status = "INSUFFICIENT DATA";
    } else if (isCriticalPriority) {
      status = "CRITICAL PRIORITY";
    } else if (isEmergingHotspot) {
      status = "EMERGING HOTSPOT";
    } else if (riskLevel === "HIGH") {
      status = "HIGH PRIORITY";
    } else if (riskLevel === "MEDIUM") {
      status = "MODERATE";
    }

    // High risk reasons
    const highRiskReasons: string[] = [];
    if (recentCount >= 2) {
      highRiskReasons.push(
        `${recentCount} ${categoryFilter === "All Crime" ? "incidents" : categoryFilter + " cases"} recorded in selected period`
      );
    }
    if (crimeTrendPercentage > 0) {
      highRiskReasons.push(`Crime velocity surging (+${crimeTrendPercentage}% vs previous timeframe)`);
    }
    if (cctvCoverageStatus === "Poor") {
      highRiskReasons.push(
        `Surveillance blind spots detected (${cctvCoveragePercent}% camera operational status)`
      );
    }
    if (nightRiskLevel === "High") {
      highRiskReasons.push(
        `Severe night-time vulnerability (Street lighting index at ${lightingIndex}%)`
      );
    }
    polygon.keyVulnerabilities.slice(0, 2).forEach((vuln) => highRiskReasons.push(vuln));

    if (highRiskReasons.length === 0) {
      highRiskReasons.push(
        "Low incident frequency in this sector",
        "Adequate CCTV coverage and municipal lighting levels"
      );
    }

    // AI Tactical Recommendation
    let aiRecommendation = "Maintain standard patrol shift cycles across designated sector boundaries.";
    if (isCriticalPriority) {
      aiRecommendation = `CRITICAL DIRECTIVE for ${polygon.name}: Dispatch immediate PCR Interceptor unit and establish mobile CCTV surveillance tower during peak hours (8 PM – 2 AM).`;
    } else if (isEmergingHotspot) {
      aiRecommendation = `EMERGING SURGE: Crime velocity up +${crimeTrendPercentage}%. Deploy 2 Quick Response motorcycle patrols and set up barricade vehicle frisking at sector boundary nodes.`;
    } else if (riskLevel === "HIGH") {
      aiRecommendation = `HIGH PRIORITY: Intensify foot patrols in commercial transit corridors and coordinate with ${polygon.officerInCharge} for enhanced evening surveillance.`;
    } else if (riskLevel === "MEDIUM") {
      aiRecommendation = `MODERATE RISK: Schedule elevated motorcycle patrol presence between 7 PM and 11 PM to prevent opportunist street crime.`;
    }

    return {
      polygonId: polygon.id,
      zoneId: polygon.zoneId,
      name: polygon.name,
      code: polygon.code,
      wardName: polygon.wardName,
      boundaryCoordinates: polygon.boundaryCoordinates,
      center: polygon.center,
      riskScore: calculatedScore,
      riskLevel,
      status,
      colorHex,
      fillOpacity,
      strokeColorHex,
      strokeWeight,
      recentIncidentsCount: recentCount,
      historicalIncidentsCount: historicalCount,
      categoryBreakdown,
      crimeTrendPercentage,
      cctvCount: totalCctv,
      cctvOperationalCount: operationalCount,
      cctvCoveragePercent,
      cctvCoverageStatus,
      lightingIndex,
      nightRiskLevel,
      isEmergingHotspot,
      isCriticalPriority,
      highRiskReasons,
      aiRecommendation,
      dataConfidence,
      dataLimitations,
      officerInCharge: polygon.officerInCharge,
      contactNumber: polygon.contactNumber,
      populationEstimate: polygon.populationEstimate,
      areaKm2: polygon.areaKm2,
    };
  });
}
