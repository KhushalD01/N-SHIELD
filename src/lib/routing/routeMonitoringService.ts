/**
 * Route Monitoring Service
 * Manages active route monitoring, change detection, and alert deduplication
 * N-SHIELD: AI-Driven Urban Safety Intelligence Model
 */

import type { RouteReconstructionAlert } from "./types";

export interface RouteMonitoringCheckResult {
  hasNewMaterialChange: boolean;
  alert: RouteReconstructionAlert | null;
  newIncidentIds: string[];
  lastCheckedAt: string;
}

/**
 * Determines whether a newly calculated reconstruction alert represents a new, unacknowledged disruption
 */
export function evaluateMonitoringChange(
  alert: RouteReconstructionAlert,
  acknowledgedIncidentIds: string[] = []
): RouteMonitoringCheckResult {
  const currentIncidentIds = alert.affectedIncidents.map((i) => i.id);

  // Check for any newly appeared incident IDs not in acknowledged list
  const newIncidentIds = currentIncidentIds.filter(
    (id) => !acknowledgedIncidentIds.includes(id)
  );

  const hasNewMaterialChange = alert.hasDisruption && newIncidentIds.length > 0;

  return {
    hasNewMaterialChange,
    alert,
    newIncidentIds,
    lastCheckedAt: new Date().toISOString(),
  };
}
