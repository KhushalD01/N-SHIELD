const fs = require('fs');
const path = require('path');

const markdownContent = `# USAI - AI-Powered Urban Safety Intelligence & Command Center (Nagpur City)
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
  * **Google Maps API** (\`@vis.gl/react-google-maps\`): Production-grade interactive map with custom marker clustering, dark styled vector tiles, night lighting overlays, and service pin interactions.
  * **Mapbox GL JS** (\`mapbox-gl\` + \`react-map-gl\`): 3D Digital Twin with extruded polygon building layers, pitch/bearing tilt controls, and \`dark-v11\` command center basemap.
  * **Deck.gl** (\`@deck.gl/core\`, \`@deck.gl/layers\`, \`@deck.gl/aggregation-layers\`): Hardware-accelerated GPU heatmap layers and sensor node pulsing overlays.
* **Audio Intelligence**: Custom Synthesized Web Audio API Alarm System (\`useAlarmSound.ts\`) providing acoustic warnings during active Night Safety mode or high-priority threats.

---

## 3. Detailed Sector & Infrastructure Mapping (Nagpur City)

USAI covers 6 strategic administrative sectors of Nagpur with pre-configured geofences, population metrics, active police stations, and surveillance coverage profiles:

| Sector ID | Sector Name | Code | Center Coordinates | Radius (km) | Officer in Charge | Population Est. | Key Risk Profile |
|-----------|-------------|------|--------------------|-------------|-------------------|------------------|------------------|
| \`zone-1\` | Sitabuldi | Z-SIT | 21.1458° N, 79.0882° E | 2.5 km | Insp. Rajesh Sharma | ~120,000 | Commercial transit hub, high footfall, pickpocketing, evening traffic congestion |
| \`zone-2\` | Dharampeth | Z-DHA | 21.1412° N, 79.0610° E | 3.0 km | Insp. Anita Deshmukh | ~180,000 | Commercial & residential, high vehicle movement, vehicle theft risk |
| \`zone-3\` | Sadar | Z-SAD | 21.1610° N, 79.0815° E | 2.8 km | Insp. Amit Varma | ~140,000 | Mixed residential/market zone, evening footfall surge, chain-snatching |
| \`zone-4\` | Itwari | Z-ITW | 21.1520° N, 79.1120° E | 2.2 km | Insp. Vijay Patil | ~210,000 | Dense historic commercial market, narrow alleys, high burglary & theft risk |
| \`zone-5\` | Sakkardara | Z-SAK | 21.1210° N, 79.1050° E | 3.2 km | Insp. Sunita Kulkarni | ~195,000 | South Nagpur residential hub, night-time lighting deficits in outer rings |
| \`zone-6\` | Automotive Sq / Kamptee Rd | Z-AUT | 21.1920° N, 79.0910° E | 4.0 km | Insp. Manoj Shinde | ~110,000 | Northern highway corridor, heavy transport movement, accident & night vulnerability |

---

## 4. Mathematical Models & Algorithmic Engines

### 4.1 Zone Crime Risk Engine (\`src/lib/riskEngine.ts\`)
The risk score $R_{zone} \\in [0, 100]$ evaluates 4 weighted vulnerability dimensions:

$$R_{zone} = \\min\\left(100, \\text{Round}\\Big(\\big(L_{incident} \\cdot 0.38 + F_{time} \\cdot 0.27 + D_{cctv} \\cdot 0.22 + D_{lighting} \\cdot 0.13\\big) \\cdot 100\\Big)\\right)$$

Where:
* **Incident Load ($L_{incident}$)**:
  $$L_{incident} = \\min\\left(1.0, \\ N_{recent} \\cdot 0.08 + N_{high} \\cdot 0.12 + I_{severity} \\cdot 0.35\\right)$$
  Where $N_{recent}$ is recent incident count, $N_{high}$ is high/critical count, and $I_{severity} \\in [0, 1]$ is the weighted severity index (Low = 0.25, Medium = 0.50, High = 0.78, Critical = 1.00).
* **Time-of-Day Risk Multiplier ($F_{time}$)**:
  * 08:00 – 17:00 (Daylight): $F_{time} = 0.18$
  * 18:00 – 20:00 (Dusk): $F_{time} = 0.45$
  * 21:00 – 02:00 (Peak Night Threat): $F_{time} \\in [0.72, 1.00]$ (peaks at 22:00)
  * 03:00 – 05:00 (Late Night): $F_{time} = 0.62$
* **CCTV Coverage Deficit ($D_{cctv}$)**:
  $$D_{cctv} = \\frac{100 - \\text{Coverage}\\%}{100}$$
* **Street Lighting Deficit ($D_{lighting}$)**:
  Derived from simulated time of day. Daylight hours maintain $85-95\\%$ lighting, dropping to $8-22\\%$ between 22:00 and 04:00 AM.

### 4.2 CCTV Blind Spot & Night Vulnerability Analysis (\`src/lib/blindSpotIntelligence.ts\`)
* **Spatial Coverage Ratio**:
  $$\\text{Coverage}\\% = \\left( \\frac{\\text{Operational CCTV Cameras}}{\\text{Total Installed CCTV Cameras}} \\right) \\times 100$$
* **Critical Blind Spot Condition**:
  A spatial grid location is classified as a **Critical Blind Spot** if:
  $$\\text{Incident Density} > \\text{Threshold} \\quad \\text{AND} \\quad \\text{CCTV Coverage}\\% < 45\\%$$
* **Emerging Hotspot Velocity**:
  $$\\Delta_{\\text{crime}} = \\left( \\frac{N_{\\text{current}} - N_{\\text{previous}}}{N_{\\text{previous}}} \\right) \\times 100\\%$$
  If $\\Delta_{\\text{crime}} \\ge 15\\%$, the sector is flagged as an **EMERGING HOTSPOT**.

### 4.3 Police Force Deployment Matrix (\`src/lib/deploymentEngine.ts\`)
Calculates required active patrol units per zone based on baseline demand, population density, and risk score:

$$\\text{Required Patrols} = \\max\\left(2, \\ \\text{Round}\\left( \\frac{\\text{Population}}{50,000} + \\frac{R_{zone}}{15} + \\frac{\\Delta_{\\text{crime}}}{20} \\right)\\right)$$

* **Deficit Analysis**: $\\text{Deficit} = \\text{Required Patrols} - \\text{Active Patrols}$.
* **Reallocation Strategy**: Reallocates PCR Vans, Quick Response (QR) Bikes, and Interceptors from low-risk sectors ($R_{zone} < 35$) to critical deficit sectors ($R_{zone} \\ge 70$).

### 4.4 Explainable AI (XAI) Model (\`src/lib/explainableAI.ts\`)
Deconstructs complex risk scores into 3 explainable bar factors:
1. **Historical Incident Load Contribution**
2. **CCTV Coverage Vulnerability**
3. **Night Activity Risk Factor**

Generates targeted natural language directives such as:
* *"CRITICAL DIRECTIVE: Deploy immediate quick-response interceptor unit and establish mobile CCTV surveillance tower during 8 PM – 12 AM."*

---

## 5. Domain Data Models & TypeScript Schemas

Located in \`src/lib/types.ts\`:

\`\`\`typescript
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
\`\`\`

---

## 6. REST API Specifications

The Next.js App Router exposes 4 JSON API endpoints for system integration:

### 1. \`GET /api/incidents\`
* **Query Parameters**: \`zoneId\` (string), \`severity\` (string), \`type\` (string), \`status\` (string)
* **Response**:
  \`\`\`json
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
  \`\`\`

### 2. \`GET /api/cctv\`
* **Query Parameters**: \`zoneId\` (string), \`operational\` (boolean)
* **Response**: CCTV camera network status with total operational vs non-operational metrics.

### 3. \`GET /api/zones\`
* **Response**: Complete sector details, coordinates, active patrols, officer in charge, and population estimates.

### 4. \`GET /api/news\`
* **Query Parameters**: \`category\` (string), \`sortBy\` (string)
* **Response**: Aggregated real-time Nagpur crime and safety news feed.

---

## 7. Frontend User Interface Components

| Component File | Role & Key Features |
|----------------|---------------------|
| \`CommandCenterLayout.tsx\` | Master dashboard container managing state for tabs, active zones, night mode toggle, time slider, SOS, and modals. |
| \`GoogleNagpurMap.tsx\` | Core Google Maps visualizer rendering zones, risk heatmaps, CCTV nodes, blind spots, police patrol icons, and nearest hospitals/police stations. |
| \`NagpurMap3D.tsx\` | Mapbox GL 3D Digital Twin rendering extruded building geometry and Deck.gl layer overlays. |
| \`Header.tsx\` | Top bar with live IST digital clock, pulse status, global search bar trigger, night safety mode button, notification bell with dropdown. |
| \`Sidebar.tsx\` | Collapsible futuristic sidebar with quick access to 5 main view modes. |
| \`PoliceDeploymentSimulator.tsx\` | Force reallocation dashboard with sliders, deficit meters, and 1-click auto-deploy recommendations. |
| \`ExplainableAIPanel.tsx\` | XAI panel rendering risk breakdown bar charts, severity indices, and AI tactical directives. |
| \`EventPredictorPanel.tsx\` | Mass public gathering simulator (e.g. VCA Stadium match, VIP movement) predicting safety impact. |
| \`EmergencySOSModal.tsx\` | One-click SOS modal triggering multi-department emergency alerts with live GPS tracking. |
| \`SafeRouteModal.tsx\` | Safe Night Navigation tool calculating low-risk routes equipped with active lighting and CCTV. |
| \`RealNewsSection.tsx\` | Live news ticker fetching verified safety news from RSS/news API for Nagpur. |
| \`GlobalSearchBar.tsx\` | Unified search bar supporting instant lookup for zones, incidents, CCTV cameras, patrol units, and emergency services. |

---

## 8. Installation, Setup & Environment Guide

### 8.1 Prerequisites
* Node.js v18.0.0 or higher
* npm or yarn package manager

### 8.2 Environment Configuration (\`.env.local\`)
Create a \`.env.local\` file in the root directory:

\`\`\`env
# Mapbox Public Key (for 3D Digital Twin)
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.your_mapbox_token_here

# Google Maps API Key (for Google Maps view)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
\`\`\`

### 8.3 Development Execution Commands
\`\`\`bash
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
\`\`\`

---

## 9. Future Roadmap & Hackathon Extension Capabilities

1. **IoT Sensor Integration**: Live ingestion of smart streetlight telemetry (LoRaWAN / NB-IoT) and acoustic gunshot detection sensors.
2. **ANPR Integration**: Automatic Number Plate Recognition feeds to track stolen vehicles across Nagpur check posts.
3. **Citizen Mobile App Integration**: React Native mobile app enabling real-time SOS broadcasting with automatic camera recording and location sharing.
4. **Predictive AI Time-Series Forecasting**: LSTM / Graph Neural Network (GNN) model training on 5 years of Nagpur Police FIR datasets to forecast crime 48 hours in advance.

---
*Documentation compiled and generated automatically for USAI Nagpur Command Center.*
`;

// 1. Write Markdown file
fs.writeFileSync(path.join(__dirname, 'PROJECT_DOCUMENTATION.md'), markdownContent, 'utf8');

// 2. Generate HTML File (Printable & Styled)
const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>USAI - Nagpur Command Center Complete Documentation</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');
    
    :root {
      --bg-main: #0B0F17;
      --card-bg: #131B2A;
      --accent-cyan: #06B6D4;
      --accent-emerald: #10B981;
      --accent-amber: #F59E0B;
      --accent-red: #EF4444;
      --text-main: #F1F5F9;
      --text-muted: #94A3B8;
      --border-color: #1E293B;
    }

    @media print {
      body {
        background-color: #ffffff !important;
        color: #000000 !important;
      }
      .card, table, pre {
        border: 1px solid #ccc !important;
        background: #fafafa !important;
        color: #000000 !important;
      }
      .no-print {
        display: none !important;
      }
      h1, h2, h3 {
        color: #000000 !important;
      }
    }

    body {
      font-family: 'Inter', sans-serif;
      background-color: var(--bg-main);
      color: var(--text-main);
      margin: 0;
      padding: 40px;
      line-height: 1.6;
    }

    .container {
      max-width: 1100px;
      margin: 0 auto;
    }

    .print-btn {
      position: fixed;
      top: 20px;
      right: 20px;
      background: var(--accent-cyan);
      color: #000;
      font-weight: 700;
      padding: 12px 24px;
      border-radius: 8px;
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(6, 182, 212, 0.4);
    }

    h1 {
      font-size: 2.4rem;
      font-weight: 800;
      color: var(--accent-cyan);
      border-bottom: 2px solid var(--accent-cyan);
      padding-bottom: 12px;
      margin-bottom: 24px;
    }

    h2 {
      font-size: 1.6rem;
      font-weight: 700;
      color: var(--accent-emerald);
      margin-top: 40px;
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 8px;
    }

    h3 {
      font-size: 1.2rem;
      color: #38BDF8;
      margin-top: 24px;
    }

    p, li {
      color: var(--text-muted);
      font-size: 1rem;
    }

    strong {
      color: var(--text-main);
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
      background: var(--card-bg);
      border-radius: 8px;
      overflow: hidden;
    }

    th, td {
      padding: 12px 16px;
      text-align: left;
      border-bottom: 1px solid var(--border-color);
      font-size: 0.92rem;
    }

    th {
      background-color: #1E293B;
      color: var(--accent-cyan);
      font-weight: 600;
    }

    pre, code {
      font-family: 'JetBrains Mono', monospace;
      background: #0F172A;
      color: #38BDF8;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.88rem;
    }

    pre {
      padding: 16px;
      overflow-x: auto;
      border: 1px solid var(--border-color);
      border-radius: 8px;
    }

    .badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
    }
    .badge-cyan { background: rgba(6, 182, 212, 0.2); color: var(--accent-cyan); }
    .badge-emerald { background: rgba(16, 185, 129, 0.2); color: var(--accent-emerald); }
  </style>
</head>
<body>
  <button class="print-btn no-print" onclick="window.print()">🖨️ Save as PDF / Print</button>
  <div class="container">
    <h1>USAI - Nagpur City Command Center</h1>
    <p><span class="badge badge-cyan">AI-Powered Urban Safety Intelligence</span> <span class="badge badge-emerald">Nagpur City Digital Twin</span></p>

    <h2>1. Executive Summary & Vision</h2>
    <p>USAI is an advanced Urban Safety Intelligence & 3D Command Center platform built for Nagpur City. It merges spatial risk modeling, CCTV blind spot detection, AI police force deployment, public event impact forecasting, and Explainable AI (XAI) into an interactive digital twin.</p>

    <h2>2. System Architecture & Tech Stack</h2>
    <ul>
      <li><strong>Next.js 16</strong> (App Router) + <strong>React 19</strong> + <strong>TypeScript</strong></li>
      <li><strong>Tailwind CSS v4</strong> (Futuristic Dark UI Theme)</li>
      <li><strong>Google Maps JavaScript API</strong> + <strong>Mapbox GL 3D Digital Twin</strong></li>
      <li><strong>Deck.gl</strong> GPU Heatmaps & Sensor Overlay Layers</li>
      <li><strong>Web Audio API</strong> Synthesized Alarm Engine</li>
    </ul>

    <h2>3. Nagpur City Sectors & Infrastructure</h2>
    <table>
      <thead>
        <tr>
          <th>Sector Code</th>
          <th>Name</th>
          <th>Coordinates</th>
          <th>Radius</th>
          <th>Officer in Charge</th>
          <th>Population</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>Z-SIT</td><td>Sitabuldi</td><td>21.1458° N, 79.0882° E</td><td>2.5 km</td><td>Insp. Rajesh Sharma</td><td>120,000</td></tr>
        <tr><td>Z-DHA</td><td>Dharampeth</td><td>21.1412° N, 79.0610° E</td><td>3.0 km</td><td>Insp. Anita Deshmukh</td><td>180,000</td></tr>
        <tr><td>Z-SAD</td><td>Sadar</td><td>21.1610° N, 79.0815° E</td><td>2.8 km</td><td>Insp. Amit Varma</td><td>140,000</td></tr>
        <tr><td>Z-ITW</td><td>Itwari</td><td>21.1520° N, 79.1120° E</td><td>2.2 km</td><td>Insp. Vijay Patil</td><td>210,000</td></tr>
        <tr><td>Z-SAK</td><td>Sakkardara</td><td>21.1210° N, 79.1050° E</td><td>3.2 km</td><td>Insp. Sunita Kulkarni</td><td>195,000</td></tr>
        <tr><td>Z-AUT</td><td>Automotive Sq</td><td>21.1920° N, 79.0910° E</td><td>4.0 km</td><td>Insp. Manoj Shinde</td><td>110,000</td></tr>
      </tbody>
    </table>

    <h2>4. Algorithmic Risk & Deployment Engines</h2>
    <p>Risk Score Calculation Formula:</p>
    <pre>RiskScore = min(100, Round((IncidentLoad * 0.38 + TimeFactor * 0.27 + CCTVDeficit * 0.22 + LightingDeficit * 0.13) * 100))</pre>
    <p>Required Patrol Allocation Formula:</p>
    <pre>RequiredPatrols = max(2, Round((Population / 50000) + (RiskScore / 15) + (CrimeVelocity / 20)))</pre>

    <h2>5. REST API Endpoints</h2>
    <ul>
      <li><code>GET /api/incidents</code> - Query incidents filtered by zone, severity, or type.</li>
      <li><code>GET /api/cctv</code> - CCTV surveillance network status and coverage analysis.</li>
      <li><code>GET /api/zones</code> - Complete sector metadata and coordinates.</li>
      <li><code>GET /api/news</code> - Live real-time Nagpur crime and urban safety news feed.</li>
    </ul>

    <h2>6. Setup & Execution</h2>
    <pre>
# Install dependencies
npm install

# Run dev server
npm run dev

# Build production bundle
npm run build
    </pre>
  </div>
</body>
</html>
`;

fs.writeFileSync(path.join(__dirname, 'PROJECT_DOCUMENTATION.html'), htmlContent, 'utf8');

// 3. Generate Word Document (.doc format - MS Word XML HTML wrapper)
const docContent = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8">
  <title>USAI - Project Documentation</title>
  <style>
    body { font-family: Calibri, sans-serif; font-size: 11pt; line-height: 1.5; color: #1a1a1a; }
    h1 { font-size: 22pt; color: #0056b3; border-bottom: 2pt solid #0056b3; margin-bottom: 12pt; }
    h2 { font-size: 16pt; color: #28a745; margin-top: 18pt; border-bottom: 1pt solid #ddd; }
    h3 { font-size: 13pt; color: #17a2b8; }
    table { width: 100%; border-collapse: collapse; margin-top: 10pt; margin-bottom: 10pt; }
    th { background-color: #0056b3; color: #ffffff; padding: 6pt; border: 1pt solid #ccc; text-align: left; }
    td { padding: 6pt; border: 1pt solid #ccc; font-size: 10pt; }
    code, pre { font-family: Consolas, monospace; background-color: #f4f4f4; padding: 4pt; border: 1pt solid #ddd; }
  </style>
</head>
<body>
  <h1>USAI - AI-Powered Urban Safety Intelligence & Command Center (Nagpur)</h1>
  <p><strong>Complete Operational & Technical Specification Document</strong></p>

  <h2>1. Executive Summary & Vision</h2>
  <p>USAI (Urban Safety AI) is an integrated 3D Command Center and safety intelligence platform built specifically for Nagpur City, India. It combines spatial risk heatmaps, CCTV blind spot detection, AI police force deployment, public event impact forecasting, explainable AI (XAI), and emergency citizen SOS into a unified platform.</p>

  <h2>2. Technology Stack</h2>
  <ul>
    <li><strong>Frontend:</strong> Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4</li>
    <li><strong>Mapping & 3D Twin:</strong> Google Maps JS API, Mapbox GL JS (3D Buildings), Deck.gl</li>
    <li><strong>Visualizations:</strong> Recharts & Framer Motion</li>
    <li><strong>Audio Intelligence:</strong> Web Audio API Alarm Sound System</li>
  </ul>

  <h2>3. Administrative Sectors (Nagpur City)</h2>
  <table>
    <thead>
      <tr>
        <th>Sector Code</th>
        <th>Sector Name</th>
        <th>Coordinates</th>
        <th>Radius</th>
        <th>Officer in Charge</th>
        <th>Population</th>
      </tr>
    </thead>
    <tbody>
      <tr><td>Z-SIT</td><td>Sitabuldi</td><td>21.1458° N, 79.0882° E</td><td>2.5 km</td><td>Insp. Rajesh Sharma</td><td>120,000</td></tr>
      <tr><td>Z-DHA</td><td>Dharampeth</td><td>21.1412° N, 79.0610° E</td><td>3.0 km</td><td>Insp. Anita Deshmukh</td><td>180,000</td></tr>
      <tr><td>Z-SAD</td><td>Sadar</td><td>21.1610° N, 79.0815° E</td><td>2.8 km</td><td>Insp. Amit Varma</td><td>140,000</td></tr>
      <tr><td>Z-ITW</td><td>Itwari</td><td>21.1520° N, 79.1120° E</td><td>2.2 km</td><td>Insp. Vijay Patil</td><td>210,000</td></tr>
      <tr><td>Z-SAK</td><td>Sakkardara</td><td>21.1210° N, 79.1050° E</td><td>3.2 km</td><td>Insp. Sunita Kulkarni</td><td>195,000</td></tr>
      <tr><td>Z-AUT</td><td>Automotive Sq</td><td>21.1920° N, 79.0910° E</td><td>4.0 km</td><td>Insp. Manoj Shinde</td><td>110,000</td></tr>
    </tbody>
  </table>

  <h2>4. Key Mathematical Formulas & Core Logic</h2>
  <p><strong>Zone Risk Score Formula:</strong></p>
  <code>RiskScore = min(100, Round((IncidentLoad * 0.38 + TimeFactor * 0.27 + CCTVDeficit * 0.22 + LightingDeficit * 0.13) * 100))</code>
  <br/><br/>
  <p><strong>Police Allocation Formula:</strong></p>
  <code>RequiredPatrols = max(2, Round((Population / 50000) + (RiskScore / 15) + (CrimeVelocity / 20)))</code>

  <h2>5. REST API Architecture</h2>
  <ul>
    <li><code>GET /api/incidents</code> - Query incidents filtered by zone, severity, status</li>
    <li><code>GET /api/cctv</code> - Surveillance network status and coverage ratios</li>
    <li><code>GET /api/zones</code> - Sector spatial metadata and officer details</li>
    <li><code>GET /api/news</code> - Real-time Nagpur crime and safety news feed</li>
  </ul>

  <h2>6. Quick Start & Execution</h2>
  <pre>
npm install
npm run dev
  </pre>
</body>
</html>
`;

fs.writeFileSync(path.join(__dirname, 'PROJECT_DOCUMENTATION.doc'), docContent, 'utf8');

console.log('Successfully generated PROJECT_DOCUMENTATION.md, PROJECT_DOCUMENTATION.html, and PROJECT_DOCUMENTATION.doc!');
