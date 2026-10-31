"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { KpiCardsRow } from "./KpiCardsRow";
import { LiveIncidentFeed } from "./LiveIncidentFeed";
import { EventPredictorPanel } from "./EventPredictorPanel";
import { EventSimulatorModal } from "./EventSimulatorModal";
import { ExplainableAIPanel } from "./ExplainableAIPanel";
import { NightSafetyPanel } from "./NightSafetyPanel";
import { NightSafetyToggle } from "./NightSafetyToggle";
import { OverviewPanel } from "./OverviewPanel";
import { PoliceDeploymentSimulator } from "./PoliceDeploymentSimulator";
import { QuickHelpBar } from "./QuickHelpBar";
import { NearestServicesBar } from "./NearestServicesBar";
import { RealNewsSection } from "./RealNewsSection";
import { ReportIncidentModal } from "./ReportIncidentModal";
import { SafetyTipsSection } from "./SafetyTipsSection";
import { MobileBottomNav } from "./MobileBottomNav";
import { MobileNavDrawer } from "./MobileNavDrawer";
import { EmergencySOSModal } from "./EmergencySOSModal";
import { EmergencyDirectoryModal } from "./EmergencyDirectoryModal";
import { SafeRouteModal } from "./SafeRouteModal";
import { GlobalSearchBar } from "./GlobalSearchBar";
import { SafetyAssistant } from "@/components/assistant/SafetyAssistant";
import { AssistantLauncher } from "@/components/assistant/AssistantLauncher";
import { EmergencyCircleView } from "@/components/emergency-circle/EmergencyCircleView";
import type { RouteOption, ServicePlace } from "@/lib/validation/assistantSchemas";
import type { DisruptionIncident } from "@/lib/routing/types";
import { NAV_ITEMS } from "@/lib/constants";
import {
  detectCriticalBlindSpots,
  filterNightSafetyVulnerabilities,
} from "@/lib/blindSpotIntelligence";
import { buildExplainableAnalysis } from "@/lib/explainableAI";
import {
  simulatePublicEventImpact,
  type PublicEventSimulation,
} from "@/lib/eventImpactEngine";
import { useAlarmSound } from "@/hooks/useAlarmSound";
import { useIntelligenceData } from "@/hooks/useIntelligenceData";
import { useRealNews } from "@/hooks/useRealNews";
import { CalendarPlus, Crosshair, MapPin, Navigation, Sparkles } from "lucide-react";
import { blindSpots as staticBlindSpots, policePatrolUnits } from "@/lib/mockData";
import {
  NAGPUR_ESSENTIAL_SERVICES,
  type EssentialService,
  type ServiceCategory,
} from "@/lib/nearbyServicesData";
import {
  DEFAULT_NAGPUR_USER_LOCATION,
  getSortedNearbyServices,
  type UserLocation,
} from "@/lib/geoUtils";
import type { RealNewsArticle } from "@/lib/newsTypes";
import { NAGPUR_CRIME_POLYGONS } from "@/lib/nagpurPolygons";

const GoogleNagpurMap = dynamic(() => import("./GoogleNagpurMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[420px] items-center justify-center bg-slate-900">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
        <p className="text-xs font-semibold text-slate-400">
          Loading Google Maps Safety Intelligence…
        </p>
      </div>
    </div>
  ),
});

export function CommandCenterLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeNav, setActiveNav] = useState("live-map");
  const [nightSafetyMode, setNightSafetyMode] = useState(false);
  const [simulatedHour, setSimulatedHour] = useState(() => new Date().getHours());
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [explainableOpen, setExplainableOpen] = useState(false);
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [activeEvent, setActiveEvent] = useState<PublicEventSimulation | null>(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [safeRouteModalOpen, setSafeRouteModalOpen] = useState(false);
  const [emergencySOSModalOpen, setEmergencySOSModalOpen] = useState(false);
  const [directoryModalOpen, setDirectoryModalOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);

  // User reference location
  const [userLocation, setUserLocation] = useState<UserLocation>(DEFAULT_NAGPUR_USER_LOCATION);

  // Active selected emergency service for detail card
  const [selectedService, setSelectedService] = useState<EssentialService | null>(null);
  const [activeServiceCategoryFilter, setActiveServiceCategoryFilter] = useState<ServiceCategory | null>(null);

  // Active selected real news article for map preview
  const [selectedNewsArticle, setSelectedNewsArticle] = useState<RealNewsArticle | null>(null);
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [isPickingLocationOnMap, setIsPickingLocationOnMap] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Dynamic Safe Route Reconstruction State
  const [activeRoute, setActiveRoute] = useState<RouteOption | null>(null);
  const [alternativeRoutes, setAlternativeRoutes] = useState<RouteOption[]>([]);
  const [routeDisruptions, setRouteDisruptions] = useState<DisruptionIncident[]>([]);

  const { incidents, zones, cameras, loading, error } = useIntelligenceData();
  const {
    articles: realNewsArticles,
    allArticles: allRealNewsArticles,
    categoryCounts: newsCategoryCounts,
    citizenReports,
    loading: newsLoading,
    isRefreshing: newsRefreshing,
    error: newsError,
    selectedCategory: selectedNewsCategory,
    setSelectedCategory: setSelectedNewsCategory,
    sortBy: newsSortBy,
    setSortBy: setNewsSortBy,
    lastUpdated: newsLastUpdated,
    refreshNews,
    submitCitizenReport,
  } = useRealNews();

  useAlarmSound(nightSafetyMode);

  useEffect(() => {
    if (nightSafetyMode) setSimulatedHour(22);
  }, [nightSafetyMode]);

  const detectionHour =
    nightSafetyMode || activeNav === "cctv-blind-spots" ? 22 : simulatedHour;

  const allBlindSpots = useMemo(() => {
    if (incidents.length === 0 || zones.length === 0) return staticBlindSpots;
    const detected = detectCriticalBlindSpots(incidents, zones, cameras, {
      timeOfDay: detectionHour,
      riskThreshold: 70,
    });
    return detected.length > 0 ? detected : staticBlindSpots;
  }, [incidents, zones, cameras, detectionHour]);

  const explainableAnalysis = useMemo(() => {
    if (!selectedZoneId || zones.length === 0) return null;
    let targetZoneId = selectedZoneId;
    if (selectedZoneId.startsWith("poly-")) {
      const poly = NAGPUR_CRIME_POLYGONS.find((p) => p.id === selectedZoneId);
      if (poly) targetZoneId = poly.zoneId;
    }
    const zone = zones.find((z) => z.id === targetZoneId);
    if (!zone) return null;
    return buildExplainableAnalysis(zone, incidents, cameras, detectionHour);
  }, [selectedZoneId, zones, incidents, cameras, detectionHour]);

  const handleZoneSelect = useCallback((zoneId: string | null) => {
    setSelectedZoneId(zoneId);
    if (!zoneId) {
      setExplainableOpen(false);
      return;
    }
    setSelectedService(null);
    setSelectedNewsArticle(null);
    setExplainableOpen(true);
  }, []);

  const handleEventSimulate = useCallback(
    async (input: {
      eventName: string;
      zoneId: string;
      location: string;
      expectedCrowd: number;
      durationHours: number;
    }) => {
      const simulated = await simulatePublicEventImpact(input, zones, 50);
      return simulated;
    },
    [zones]
  );

  const handleEventComplete = useCallback((result: PublicEventSimulation) => {
    setActiveEvent(result);
    setEventModalOpen(false);
  }, []);

  const handleDetectGps = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }
    setIsDetectingGps(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          label: "My GPS Location",
          isUserSet: true,
          source: "gps",
        });
        setIsDetectingGps(false);
        setLocationError(null);
      },
      (err) => {
        console.warn("GPS error:", err);
        setIsDetectingGps(false);
        if (err.code === 1) {
          setLocationError("Location permission was denied. Please select an area from the dropdown or click 'Pick on Map'.");
        } else if (err.code === 2) {
          setLocationError("Location unavailable. Please select an area from the dropdown or click 'Pick on Map'.");
        } else if (err.code === 3) {
          setLocationError("GPS location request timed out. Please try again or select an area.");
        } else {
          setLocationError("Could not determine your location. Please choose an area from the dropdown.");
        }
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const handleQuickCategoryClick = (category: ServiceCategory) => {
    setActiveServiceCategoryFilter(category);
    const sorted = getSortedNearbyServices(NAGPUR_ESSENTIAL_SERVICES, userLocation, [category]);
    if (sorted.length > 0) {
      setSelectedService(sorted[0]);
      setSelectedNewsArticle(null);
    }
    const mapSection = document.getElementById("safety-map-section");
    if (mapSection) {
      mapSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleSelectNewsArticleLocation = (article: RealNewsArticle) => {
    setSelectedNewsArticle(article);
    setSelectedService(null);
    const mapSection = document.getElementById("safety-map-section");
    if (mapSection) {
      mapSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleNavigate = (id: string) => {
    if (id === "ai-assistant") {
      setAssistantOpen(true);
      return;
    }
    setActiveNav(id);
  };

  const handleSelectAssistantPlace = useCallback((place: ServicePlace) => {
    const matchingService = NAGPUR_ESSENTIAL_SERVICES.find((s) => s.id === place.id);
    if (matchingService) {
      setSelectedService(matchingService);
    } else {
      setSelectedService({
        id: place.id,
        name: place.name,
        category:
          place.type === "police_station"
            ? "police"
            : place.type === "pharmacy"
            ? "pharmacy"
            : "hospital",
        lat: place.location.lat,
        lng: place.location.lng,
        phone: place.phone || null,
        address: place.address,
        timing: place.openingHours || "Standard Hours",
        is24x7: !!place.is24x7,
        verified: true,
      });
    }
    setSelectedNewsArticle(null);
    setActiveNav("live-map");
    const mapSection = document.getElementById("safety-map-section");
    if (mapSection) {
      mapSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const showDeploymentSimulator = activeNav === "police-deployment" || activeNav === "deploy-forces";
  const showEmergencyCircle = activeNav === "emergency-circle";

  return (
    <div className="flex h-screen h-[100dvh] max-h-[100dvh] w-full max-w-full overflow-hidden bg-slate-100 dark:bg-slate-950">
      
      {/* Desktop Sidebar (Hidden on mobile & tablet) */}
      <div className="hidden lg:flex h-full">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((c) => !c)}
          activeId={activeNav}
          onNavigate={handleNavigate}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0 w-full max-w-full">
        <Header
          onOpenMobileNav={() => setMobileNavOpen(true)}
          onOpenEmergencySOS={() => setEmergencySOSModalOpen(true)}
          onOpenAssistant={() => setAssistantOpen(true)}
          onSelectZone={handleZoneSelect}
          userLocation={userLocation}
          zones={zones}
          services={NAGPUR_ESSENTIAL_SERVICES}
          newsArticles={realNewsArticles}
          onSelectService={(srv) => {
            setSelectedService(srv);
            setSelectedNewsArticle(null);
            setActiveNav("live-map");
          }}
          onSelectNewsArticle={(art) => {
            setSelectedNewsArticle(art);
            setSelectedService(null);
            setActiveNav("live-map");
          }}
        />

        <main className="relative flex flex-1 flex-col gap-4 overflow-y-auto p-3 sm:p-5 pb-24 lg:pb-6 min-w-0 w-full">
          
          {/* Mobile & Tablet Hero & Area Safety Search Bar */}
          <div className="block lg:hidden relative z-10 rounded-3xl bg-gradient-to-br from-indigo-600 to-indigo-900 p-4 text-white shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="rounded-md bg-white/20 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider">
                  Nagpur Citizen Safety
                </span>
                <h2 className="text-lg font-black tracking-tight mt-1">
                  How safe is your area right now?
                </h2>
              </div>
            </div>

            {/* Mobile Search Bar */}
            <div className="pt-1">
              <GlobalSearchBar
                userLocation={userLocation}
                zones={zones}
                services={NAGPUR_ESSENTIAL_SERVICES}
                newsArticles={realNewsArticles}
                placeholder="Search hospitals, police, Sitabuldi, Dharampeth..."
                onSelectZone={handleZoneSelect}
                onSelectService={(srv) => {
                  setSelectedService(srv);
                  setSelectedNewsArticle(null);
                  setActiveNav("live-map");
                }}
                onSelectNewsArticle={(art) => {
                  setSelectedNewsArticle(art);
                  setSelectedService(null);
                  setActiveNav("live-map");
                }}
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleDetectGps}
                disabled={isDetectingGps}
                className="flex-1 min-h-[44px] flex items-center justify-center gap-2 rounded-xl bg-white text-indigo-900 px-3 py-2 text-xs font-bold shadow-sm active:scale-95 transition"
              >
                <Crosshair className={`h-4 w-4 text-indigo-600 ${isDetectingGps ? "animate-spin" : ""}`} />
                <span>{isDetectingGps ? "Locating..." : "📍 Locate Around Me"}</span>
              </button>

              <button
                type="button"
                onClick={() => setSafeRouteModalOpen(true)}
                className="min-h-[44px] flex items-center justify-center gap-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white px-3.5 py-2 text-xs font-bold active:scale-95 transition"
                title="Safe Route Planner"
              >
                <Navigation className="h-4 w-4" />
                <span>Safe Route</span>
              </button>
            </div>
          </div>

          {/* Quick "Need Help?" Bar */}
          {!showDeploymentSimulator && !showEmergencyCircle && (
            <QuickHelpBar
              onQuickCategoryClick={handleQuickCategoryClick}
              onCallEmergency112={() => setEmergencySOSModalOpen(true)}
              onOpenDirectory={() => setDirectoryModalOpen(true)}
              onOpenSafeRoute={() => setSafeRouteModalOpen(true)}
            />
          )}

          {/* KPI Cards Row */}
          {!showDeploymentSimulator && !showEmergencyCircle && activeNav !== "live-map" && (
            <KpiCardsRow
              activePatrols={policePatrolUnits.length}
              blindSpotsCount={allBlindSpots.length}
              resolvedIncidentsCount={
                incidents.filter((i) => i.status === "resolved").length || 38
              }
            />
          )}

          {/* Main Content Workspace */}
          {showDeploymentSimulator ? (
            <div className="flex-1 overflow-hidden min-h-[600px]">
              <PoliceDeploymentSimulator
                incidents={incidents}
                zones={zones}
                cameras={cameras}
                simulatedHour={simulatedHour}
                loading={loading}
              />
            </div>
          ) : showEmergencyCircle ? (
            <div className="flex-1 overflow-y-auto min-h-[600px] rounded-3xl border border-slate-200/80 bg-white p-4 sm:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <EmergencyCircleView />
            </div>
          ) : (
            <div className="flex flex-col flex-1 gap-4">
              <div className="flex flex-col lg:flex-row flex-1 min-h-[420px] sm:min-h-[500px] lg:min-h-[560px] gap-4">
                
                {/* Left Side (Map): Responsive Height & Nearly Full Width on Mobile */}
                <div
                  id="safety-map-section"
                  className="relative flex w-full lg:w-[60%] flex-col min-w-0 z-20"
                >
                  <div className="relative flex-1 rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] h-[440px] sm:h-[500px] lg:h-full min-h-[420px] sm:min-h-[500px]">
                    
                    {/* Main Google Maps Component */}
                    <GoogleNagpurMap
                      className="h-full w-full"
                      incidents={incidents}
                      zones={zones}
                      cameras={cameras}
                      blindSpots={allBlindSpots}
                      patrolUnits={policePatrolUnits}
                      essentialServices={NAGPUR_ESSENTIAL_SERVICES}
                      realNewsArticles={realNewsArticles}
                      selectedNewsArticle={selectedNewsArticle}
                      onSelectNewsArticle={setSelectedNewsArticle}
                      loading={loading}
                      error={error}
                      nightSafetyMode={nightSafetyMode}
                      onToggleNightSafety={setNightSafetyMode}
                      onSimulateEvent={() => setEventModalOpen(true)}
                      showSimulateEvent={activeNav === "live-map" || activeNav === "event-predictor"}
                      simulatedHour={simulatedHour}
                      onZoneSelect={handleZoneSelect}
                      selectedZoneId={selectedZoneId}
                      userLocation={userLocation}
                      onUpdateUserLocation={setUserLocation}
                      selectedService={selectedService}
                      onSelectService={setSelectedService}
                      activeServiceCategoryFilter={activeServiceCategoryFilter}
                      activeRoute={activeRoute}
                      alternativeRoutes={alternativeRoutes}
                      routeDisruptions={routeDisruptions}
                      onSelectRoute={setActiveRoute}
                      isPickingLocationOnMap={isPickingLocationOnMap}
                      onFinishPickingLocationOnMap={() => setIsPickingLocationOnMap(false)}
                    />
                  </div>
                </div>

                {/* Right Side: Collapsible Intelligence Feeds (Desktop & Tablet) */}
                <div className="flex w-full lg:w-[40%] flex-col gap-4 min-w-0">
                  {activeNav === "overview" && (
                    <OverviewPanel
                      incidents={incidents}
                      zones={zones}
                      cameras={cameras}
                      simulatedHour={simulatedHour}
                    />
                  )}

                  {activeNav === "cctv-blind-spots" && (
                    <div className="flex-1 overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                      <NightSafetyPanel
                        blindSpots={allBlindSpots as any}
                        nightSafetyMode={nightSafetyMode}
                      />
                    </div>
                  )}

                  {activeNav === "event-predictor" && (
                    <div className="flex-1 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                      <EventPredictorPanel
                        incidents={incidents}
                        zones={zones}
                        cameras={cameras}
                        simulatedHour={simulatedHour}
                        onSimulateEvent={() => setEventModalOpen(true)}
                        activeEvent={activeEvent}
                      />
                    </div>
                  )}

                  {(activeNav === "live-map" || activeNav === "overview") && (
                    <div className="flex-1 overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 max-h-[560px]">
                      <LiveIncidentFeed
                        articles={allRealNewsArticles.length > 0 ? allRealNewsArticles : realNewsArticles}
                        loading={newsLoading}
                        isRefreshing={newsRefreshing}
                        onRefresh={refreshNews}
                        onSelectArticleLocation={handleSelectNewsArticleLocation}
                        onSelectZone={(zoneId: string) => {
                          setSelectedZoneId(zoneId);
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Nearest Emergency Services Section */}
              <NearestServicesBar
                services={NAGPUR_ESSENTIAL_SERVICES}
                userLocation={userLocation}
                onSelectService={(srv) => {
                  setSelectedService(srv);
                  setSelectedNewsArticle(null);
                  setActiveNav("live-map");
                  const mapSection = document.getElementById("safety-map-section");
                  if (mapSection) {
                    mapSection.scrollIntoView({ behavior: "smooth", block: "start" });
                  }
                }}
                onUpdateLocation={setUserLocation}
                onDetectLocation={handleDetectGps}
                isDetectingLocation={isDetectingGps}
                locationError={locationError}
                onClearLocationError={() => setLocationError(null)}
                onStartPickLocationOnMap={() => {
                  setIsPickingLocationOnMap((prev) => !prev);
                  const mapSection = document.getElementById("safety-map-section");
                  if (mapSection) {
                    mapSection.scrollIntoView({ behavior: "smooth", block: "start" });
                  }
                }}
                isPickingLocationOnMap={isPickingLocationOnMap}
              />

              {/* Real Incident & News Intelligence Section */}
              <RealNewsSection
                articles={realNewsArticles}
                categoryCounts={newsCategoryCounts}
                citizenReports={citizenReports}
                loading={newsLoading}
                isRefreshing={newsRefreshing}
                error={newsError}
                selectedCategory={selectedNewsCategory}
                onSelectCategory={setSelectedNewsCategory}
                sortBy={newsSortBy}
                onSelectSortBy={setNewsSortBy}
                lastUpdated={newsLastUpdated}
                onRefresh={refreshNews}
                onSelectArticleLocation={handleSelectNewsArticleLocation}
                onOpenReportModal={() => setReportModalOpen(true)}
              />

              {/* Safety Tips & Guidelines Section */}
              <SafetyTipsSection />
            </div>
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation (Visible only on mobile) */}
      <MobileBottomNav
        activeNav={activeNav}
        onNavigate={handleNavigate}
        onOpenReportModal={() => setReportModalOpen(true)}
        onOpenSafeRouteModal={() => setSafeRouteModalOpen(true)}
        onOpenEmergencySOS={() => setEmergencySOSModalOpen(true)}
      />

      {/* Mobile Slide-Over Navigation Drawer */}
      <MobileNavDrawer
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        activeId={activeNav}
        onNavigate={handleNavigate}
        nightSafetyMode={nightSafetyMode}
        onToggleNightSafety={setNightSafetyMode}
        onOpenReportModal={() => setReportModalOpen(true)}
        onOpenSafeRouteModal={() => setSafeRouteModalOpen(true)}
        onOpenEmergencySOS={() => setEmergencySOSModalOpen(true)}
      />

      {/* Emergency SOS Modal (Accident prevention confirmation) */}
      <EmergencySOSModal
        isOpen={emergencySOSModalOpen}
        onClose={() => setEmergencySOSModalOpen(false)}
      />

      {/* Complete Nagpur Emergency Directory Modal */}
      <EmergencyDirectoryModal
        isOpen={directoryModalOpen}
        onClose={() => setDirectoryModalOpen(false)}
        onSelectServiceOnMap={(service) => {
          setSelectedService(service);
          setSelectedZoneId(null);
        }}
      />

      {/* Safe Route Modal */}
      <SafeRouteModal
        isOpen={safeRouteModalOpen}
        onClose={() => setSafeRouteModalOpen(false)}
        userLocation={userLocation}
        onActiveRouteChange={setActiveRoute}
        onAlternativesChange={setAlternativeRoutes}
        onDisruptionsChange={setRouteDisruptions}
      />

      {/* Explainable AI Drawer */}
      <ExplainableAIPanel
        open={explainableOpen}
        onClose={() => setExplainableOpen(false)}
        analysis={explainableAnalysis}
      />

      {/* Public Event Simulator Modal */}
      <EventSimulatorModal
        open={eventModalOpen}
        onClose={() => setEventModalOpen(false)}
        zones={zones}
        onSimulate={handleEventSimulate}
        onComplete={handleEventComplete}
      />

      {/* Citizen Report Incident Modal */}
      <ReportIncidentModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        onSubmit={submitCitizenReport}
      />

      {/* AI Safety Assistant Launcher & Modal Panel */}
      <AssistantLauncher
        isOpen={assistantOpen}
        onToggle={() => setAssistantOpen(true)}
      />

      <SafetyAssistant
        isOpen={assistantOpen}
        onClose={() => setAssistantOpen(false)}
        userLocation={userLocation}
        onUpdateUserLocation={setUserLocation}
        onSelectPlaceOnMap={handleSelectAssistantPlace}
        onOpenSOSModal={() => setEmergencySOSModalOpen(true)}
      />
    </div>
  );
}
