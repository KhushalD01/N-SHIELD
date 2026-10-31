"use client";

import React from "react";
import { DynamicRoutePlanner } from "./DynamicRoutePlanner";
import type { UserLocation } from "@/lib/geoUtils";
import type { RouteOption } from "@/lib/validation/assistantSchemas";
import type { DisruptionIncident } from "@/lib/routing/types";

interface SafeRouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  userLocation: UserLocation;
  onActiveRouteChange?: (route: RouteOption | null) => void;
  onAlternativesChange?: (routes: RouteOption[]) => void;
  onDisruptionsChange?: (disruptions: DisruptionIncident[]) => void;
}

export function SafeRouteModal({
  isOpen,
  onClose,
  userLocation,
  onActiveRouteChange = () => {},
  onAlternativesChange = () => {},
  onDisruptionsChange = () => {},
}: SafeRouteModalProps) {
  return (
    <DynamicRoutePlanner
      isOpen={isOpen}
      onClose={onClose}
      userLocation={userLocation}
      onActiveRouteChange={onActiveRouteChange}
      onAlternativesChange={onAlternativesChange}
      onDisruptionsChange={onDisruptionsChange}
    />
  );
}
