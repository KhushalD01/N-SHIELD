# USAI - AI-Powered Urban Safety Intelligence & Command Center (Nagpur City)
## Complete Project Technical & Operational Documentation

---

## 1. Executive Summary & Project Vision

**USAI (Urban Safety AI)** is a futuristic, AI-driven Urban Safety Intelligence Platform and 3D Command Center built specifically for Nagpur City, Maharashtra, India. Designed for hackathons, municipal command centers, emergency responders (Police 112, Ambulance 108, Fire 101), and citizens, USAI integrates real-time spatial analytics, predictive machine learning models, explainable artificial intelligence (XAI), CCTV coverage gap detection, and safe night-time navigation into a single, unified digital twin.

### Core Value Propositions
1. **Real-time Crime & Safety Monitoring**: Live tracking of incidents categorized by severity (Low, Medium, High, Critical) and type across 6 key sectors of Nagpur.
2. **Algorithmic Risk Heatmapping**: Dynamic calculation of zone risk scores (0 to 100) based on incident load, crime velocity trends, time-of-day vulnerability, street lighting indices, and CCTV coverage gaps.
3. **CCTV Blind Spot Intelligence**: Spatial detection of unmonitored high-risk corridors to optimize municipal surveillance camera installation.
4. **AI Police Force Deployment Simulator**: Automated patrol resource allocation matching police PCR vans, Quick Response Bikes, and Interceptor vehicles to zone-specific risk demands.
5. **Predictive Event Impact Engine**: Predictive modeling of mass gathering events (e.g., Cricket matches at VCA Stadium, Ganesh Visarjan processions, political rallies) to simulate safety impact and proactively auto-deploy police units.
6. **Explainable AI (XAI) Transparency**: Granular breakdown showing officers *why* a zone is flagged as high-risk with actionable tactical recommendations.
7. **Citizen Safety & Emergency SOS**: One-click Emergency SOS system with multi-department dispatch, GPS tracking, and a Safe Night Route finder avoiding unlit and unsafe corridors.

---

## 2. System Architecture & Tech Stack

The platform is engineered using modern web technologies to ensure sub-second rendering speeds, high interactive frame rates (60 FPS map panning), and seamless dark-mode command center aesthetics.

### Tech Stack Breakdown
* **Core Framework**: Next.js 16 (App Router)
* **UI Library & Logic**: React 19 + TypeScript (Strict Mode)
* **Styling & Aesthetics**: Tailwind CSS v4 + Vanilla CSS Custom Properties (Cyan/Emerald Futuristic Glow Theme)
* **Iconography**: Lucide React
* **Data Visualization & Analytics**: Recharts (Trend lines, radar charts, distribution bars) & Framer Motion
* **Geospatial Mapping Engines**:
  * **Google Maps API** (`@vis.gl/react-google-maps`): Production-grade interactive map with custom marker clustering, dark styled vector tiles, night lighting overlays, and service pin interactions.
  * **Mapbox GL JS** (`mapbox-gl` + `react-map-gl`): 3D Digital Twin with extruded polygon building layers, pitch/bearing tilt controls, and `dark-v11` command center basemap.
  * **Deck.gl** (`@deck.gl/core`, `@deck.gl/layers`, `@deck.gl/aggregation-layers`): Hardware-accelerated GPU heatmap layers and sensor node pulsing overlays.
* **Audio Intelligence**: Custom Synthesized Web Audio API Alarm System (`useAlarmSound.ts`) providing acoustic warnings during active Night Safety mode or high-priority threats.

---

## 3. Detailed Sector & Infrastructure Mapping (Nagpur City)

USAI covers 6 strategic administrative sectors of Nagpur with pre-configured geofences, population metrics, active police stations, and surveillance coverage profiles:

| Sector ID | Sector Name | Code | Center Coordinates | Radius (km) | Officer in Charge | Population Est. | Key Risk Profile |
|-----------|-------------|------|--------------------|-------------|-------------------|------------------|------------------|
| `zone-1` | Sitabuldi | Z-SIT | 21.1458° N, 79.0882° E | 2.5 km | Insp. Rajesh Sharma | ~120,000 | Commercial transit hub, high footfall, pickpocketing, evening traffic congestion |
| `zone-2` | Dharampeth | Z-DHA | 21.1412° N, 79.0610° E | 3.0 km | Insp. Anita Deshmukh | ~180,000 | Commercial & residential, high vehicle movement, vehicle theft risk |
| `zone-3` | Sadar | Z-SAD | 21.1610° N, 79.0815° E | 2.8 km | Insp. Amit Varma | ~140,000 | Mixed residential/market zone, evening footfall surge, chain-snatching |
| `zone-4` | Itwari | Z-ITW | 21.1520° N, 79.1120° E | 2.2 km | Insp. Vijay Patil | ~210,000 | Dense historic commercial market, narrow alleys, high burglary & theft risk |
| `zone-5` | Sakkardara | Z-SAK | 21.1210° N, 79.1050° E | 3.2 km | Insp. Sunita Kulkarni | ~195,000 | South Nagpur residential hub, night-time lighting deficits in outer rings |
| `zone-6` | Automotive Sq / Kamptee Rd | Z-AUT | 21.1920° N, 79.0910° E | 4.0 km | Insp. Manoj Shinde | ~110,000 | Northern highway corridor, heavy transport movement, accident & night vulnerability |

---

## 4. Mathematical Models & Algorithmic Engines

### 4.1 Zone Crime Risk Engine (`src/lib/riskEngine.ts`)
The risk score $R_{zone} \in [0, 100]$ evaluates 4 weighted vulnerability dimensions:

$$R_{zone} = \min\left(100, \text{Round}\Big(\big(L_{incident} \cdot 0.38 + F_{time} \cdot 0.27 + D_{cctv} \cdot 0.22 + D_{lighting} \cdot 0.13\big) \cdot 100\Big)\right)$$

Where:
* **Incident Load ($L_{incident}$)**:
  $$L_{incident} = \min\left(1.0, \ N_{recent} \cdot 0.08 + N_{high} \cdot 0.12 + I_{severity} \cdot 0.35\right)$$
  Where $N_{recent}$ is recent incident count, $N_{high}$ is high/critical count, and $I_{severity} \in [0, 1]$ is the weighted severity index (Low = 0.25, Medium = 0.50, High = 0.78, Critical = 1.00).
* **Time-of-Day Risk Multiplier ($F_{time}$)**:
  * 08:00 – 17:00 (Daylight): $F_{time} = 0.18$
  * 18:00 – 20:00 (Dusk): $F_{time} = 0.45$
  * 21:00 – 02:00 (Peak Night Threat): $F_{time} \in [0.72, 1.00]$ (peaks at 22:00)
  * 03:00 – 05:00 (Late Night): $F_{time} = 0.62$
* **CCTV Coverage Deficit ($D_{cctv}$)**:
  $$D_{cctv} = \frac{100 - \text{Coverage}\%}{100}$$
* **Street Lighting Deficit ($D_{lighting}$)**:
  Derived from simulated time of day. Daylight hours maintain $85-95\%$ lighting, dropping to $8-22\%$ between 22:00 and 04:00 AM.

### 4.2 CCTV Blind Spot & Night Vulnerability Analysis (`src/lib/blindSpotIntelligence.ts`)
* **Spatial Coverage Ratio**:
  $$\text{Coverage}\% = \left( \frac{\text{Operational CCTV Cameras}}{\text{Total Installed CCTV Cameras}} \right) \times 100$$
* **Critical Blind Spot Condition**:
  A spatial grid location is classified as a **Critical Blind Spot** if:
  $$\text{Incident Density} > \text{Threshold} \quad \text{AND} \quad \text{CCTV Coverage}\% < 45\%$$
* **Emerging Hotspot Velocity**:
  $$\Delta_{\text{crime}} = \left( \frac{N_{\text{current}} - N_{\text{previous}}}{N_{\text{previous}}} \right) \times 100\%$$
  If $\Delta_{\text{crime}} \ge 15\%$, the sector is flagged as an **EMERGING HOTSPOT**.

### 4.3 Police Force Deployment Matrix (`src/lib/deploymentEngine.ts`)
Calculates required active patrol units per zone based on baseline demand, population density, and risk score:

$$\text{Required Patrols} = \max\left(2, \ \text{Round}\left( \frac{\text{Population}}{50,000} + \frac{R_{zone}}{15} + \frac{\Delta_{\text{crime}}}{20} \right)\right)$$

* **Deficit Analysis**: $\text{Deficit} = \text{Required Patrols} - \text{Active Patrols}$.
* **Reallocation Strategy**: Reallocates PCR Vans, Quick Response (QR) Bikes, and Interceptors from low-risk sectors ($R_{zone} < 35$) to critical deficit sectors ($R_{zone} \ge 70$).

### 4.4 Explainable AI (XAI) Model (`src/lib/explainableAI.ts`)
Deconstructs complex risk scores into 3 explainable bar factors:
1. **Historical Incident Load Contribution**
2. **CCTV Coverage Vulnerability**
3. **Night Activity Risk Factor**

Generates targeted natural language directives such as:
* *"CRITICAL DIRECTIVE: Deploy immediate quick-response interceptor unit and establish mobile CCTV surveillance tower during 8 PM – 12 AM."*

---

## 5. Domain Data Models & TypeScript Schemas

Located in `src/lib/types.ts`:

```typescript
export type CrimeType =
  | "Theft" | "Robbery" | "Assault" | "Vehicle Theft"
  | "Burglary" | "Murder" | "Chain-snatching" | "Accident"
  | "Smuggling" | "Cybercrime" | "Harassment" | "Other";

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
```

---

## 6. REST API Specifications

The Next.js App Router exposes 4 JSON API endpoints for system integration:

### 1. `GET /api/incidents`
* **Query Parameters**: `zoneId` (string), `severity` (string), `type` (string), `status` (string)
* **Response**:
  ```json
  {
    "data": [
      {
        "id": "inc-101",
        "type": "Chain-snatching",
        "lat": 21.1458,
        "lng": 79.0882,
        "timestamp": "2026-09-09T08:30:00Z",
        "severity": "high",
        "zoneId": "zone-1",
        "description": "Chain snatching reported near Sitabuldi Metro Station",
        "status": "investigating"
      }
    ],
    "meta": { "total": 1, "generatedAt": "2026-09-09T09:50:00Z", "source": "mock" }
  }
  ```

### 2. `GET /api/cctv`
* **Query Parameters**: `zoneId` (string), `operational` (boolean)
* **Response**: CCTV camera network status with total operational vs non-operational metrics.

### 3. `GET /api/zones`
* **Response**: Complete sector details, coordinates, active patrols, officer in charge, and population estimates.

### 4. `GET /api/news`
* **Query Parameters**: `category` (string), `sortBy` (string)
* **Response**: Aggregated real-time Nagpur crime and safety news feed.

---

## 7. Frontend User Interface Components

| Component File | Role & Key Features |
|----------------|---------------------|
| `CommandCenterLayout.tsx` | Master dashboard container managing state for tabs, active zones, night mode toggle, time slider, SOS, and modals. |
| `GoogleNagpurMap.tsx` | Core Google Maps visualizer rendering zones, risk heatmaps, CCTV nodes, blind spots, police patrol icons, and nearest hospitals/police stations. |
| `NagpurMap3D.tsx` | Mapbox GL 3D Digital Twin rendering extruded building geometry and Deck.gl layer overlays. |
| `Header.tsx` | Top bar with live IST digital clock, pulse status, global search bar trigger, night safety mode button, notification bell with dropdown. |
| `Sidebar.tsx` | Collapsible futuristic sidebar with quick access to 5 main view modes. |
| `PoliceDeploymentSimulator.tsx` | Force reallocation dashboard with sliders, deficit meters, and 1-click auto-deploy recommendations. |
| `ExplainableAIPanel.tsx` | XAI panel rendering risk breakdown bar charts, severity indices, and AI tactical directives. |
| `EventPredictorPanel.tsx` | Mass public gathering simulator (e.g. VCA Stadium match, VIP movement) predicting safety impact. |
| `EmergencySOSModal.tsx` | One-click SOS modal triggering multi-department emergency alerts with live GPS tracking. |
| `SafeRouteModal.tsx` | Safe Night Navigation tool calculating low-risk routes equipped with active lighting and CCTV. |
| `RealNewsSection.tsx` | Live news ticker fetching verified safety news from RSS/news API for Nagpur. |
| `GlobalSearchBar.tsx` | Unified search bar supporting instant lookup for zones, incidents, CCTV cameras, patrol units, and emergency services. |

---

## 8. Installation, Setup & Environment Guide

### 8.1 Prerequisites
* Node.js v18.0.0 or higher
* npm or yarn package manager

### 8.2 Environment Configuration (`.env.local`)
Create a `.env.local` file in the root directory:

```env
# Mapbox Public Key (for 3D Digital Twin)
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.your_mapbox_token_here

# Google Maps API Key (for Google Maps view)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### 8.3 Development Execution Commands
```bash
# Install dependencies
npm install

# Start local dev server (http://localhost:3000)
npm run dev

# Run linting check
npm run lint

# Build production bundle
npm run build

# Start production server
npm run start
```

---

## 9. Future Roadmap & Hackathon Extension Capabilities

1. **IoT Sensor Integration**: Live ingestion of smart streetlight telemetry (LoRaWAN / NB-IoT) and acoustic gunshot detection sensors.
2. **ANPR Integration**: Automatic Number Plate Recognition feeds to track stolen vehicles across Nagpur check posts.
3. **Citizen Mobile App Integration**: React Native mobile app enabling real-time SOS broadcasting with automatic camera recording and location sharing.
4. **Predictive AI Time-Series Forecasting**: LSTM / Graph Neural Network (GNN) model training on 5 years of Nagpur Police FIR datasets to forecast crime 48 hours in advance.

---
*Documentation compiled and generated automatically for USAI Nagpur Command Center.*
