import os
import subprocess

html_content = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>N-SHIELD: AI-Powered Urban Safety Intelligence - Complete Project Documentation</title>
<style>
  @page {
    size: A4 portrait;
    margin: 16mm 14mm 16mm 14mm;
  }
  
  * {
    box-sizing: border-box;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  body {
    font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    color: #0f172a;
    background-color: #ffffff;
    line-height: 1.55;
    font-size: 10pt;
    margin: 0;
    padding: 0;
  }

  .page-break {
    page-break-before: always;
  }

  .avoid-break {
    page-break-inside: avoid;
  }

  /* Colors */
  :root {
    --primary: #0f172a;
    --navy: #1e3a8a;
    --blue: #2563eb;
    --accent: #f97316;
    --accent-dark: #ea580c;
    --bg-light: #f8fafc;
    --border: #cbd5e1;
    --text-muted: #475569;
  }

  /* Cover Page */
  .cover-container {
    height: 96vh;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 40px 20px;
    background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 60%, #0284c7 100%);
    color: #ffffff;
    border-radius: 12px;
    position: relative;
    overflow: hidden;
  }

  .cover-header {
    border-bottom: 2px solid rgba(249, 115, 22, 0.6);
    padding-bottom: 20px;
  }

  .badge-tag {
    background: #f97316;
    color: #ffffff;
    padding: 6px 14px;
    font-weight: 700;
    font-size: 10pt;
    letter-spacing: 1px;
    border-radius: 20px;
    display: inline-block;
    margin-bottom: 12px;
    text-transform: uppercase;
  }

  .cover-title {
    font-size: 42pt;
    font-weight: 900;
    margin: 10px 0 5px 0;
    letter-spacing: 2px;
    color: #ffffff;
  }

  .cover-tagline {
    font-size: 18pt;
    font-weight: 600;
    color: #fdba74;
    margin: 0 0 10px 0;
  }

  .cover-subtitle {
    font-size: 13pt;
    color: #e2e8f0;
    max-width: 600px;
    line-height: 1.4;
  }

  .cover-visual {
    margin: 30px 0;
    text-align: center;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 16px;
    padding: 30px;
    backdrop-filter: blur(5px);
  }

  .cover-footer {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
    padding-top: 20px;
  }

  .meta-box h4 {
    margin: 0 0 4px 0;
    font-size: 9pt;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .meta-box p {
    margin: 0;
    font-size: 11pt;
    font-weight: 600;
    color: #ffffff;
  }

  /* Typography & Sections */
  .section-header {
    display: flex;
    align-items: center;
    border-bottom: 2.5px solid #2563eb;
    padding-bottom: 8px;
    margin-top: 24px;
    margin-bottom: 16px;
  }

  .section-number {
    background: #2563eb;
    color: #ffffff;
    font-weight: 800;
    font-size: 12pt;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 12px;
    flex-shrink: 0;
  }

  .section-title {
    font-size: 16pt;
    font-weight: 800;
    color: #0f172a;
    margin: 0;
    letter-spacing: -0.2px;
  }

  .subsection-title {
    font-size: 12pt;
    font-weight: 700;
    color: #1e3a8a;
    margin-top: 16px;
    margin-bottom: 8px;
    border-left: 4px solid #f97316;
    padding-left: 8px;
  }

  p {
    margin-top: 0;
    margin-bottom: 10px;
    text-align: justify;
  }

  /* Card containers */
  .card {
    background-color: #f8fafc;
    border: 1px solid #e2e8f0;
    border-left: 4px solid #2563eb;
    padding: 12px 16px;
    border-radius: 6px;
    margin-bottom: 14px;
  }

  .card-warning {
    background-color: #fff7ed;
    border: 1px solid #fed7aa;
    border-left: 4px solid #ea580c;
    padding: 12px 16px;
    border-radius: 6px;
    margin-bottom: 14px;
  }

  .card-info {
    background-color: #eff6ff;
    border: 1px solid #bfdbfe;
    border-left: 4px solid #2563eb;
    padding: 12px 16px;
    border-radius: 6px;
    margin-bottom: 14px;
  }

  /* Tables */
  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 10px;
    margin-bottom: 16px;
    font-size: 9.5pt;
  }

  th {
    background-color: #0f172a;
    color: #ffffff;
    font-weight: 700;
    text-align: left;
    padding: 8px 10px;
    border: 1px solid #0f172a;
  }

  td {
    padding: 8px 10px;
    border: 1px solid #cbd5e1;
    vertical-align: top;
  }

  tr:nth-child(even) {
    background-color: #f8fafc;
  }

  /* Code & API blocks */
  pre {
    background-color: #0f172a;
    color: #f8fafc;
    padding: 12px;
    border-radius: 6px;
    font-family: 'Consolas', 'Courier New', monospace;
    font-size: 8.5pt;
    overflow-x: auto;
    white-space: pre-wrap;
    word-wrap: break-word;
    margin-top: 6px;
    margin-bottom: 12px;
  }

  .code-inline {
    background-color: #f1f5f9;
    color: #0f172a;
    padding: 2px 6px;
    border-radius: 4px;
    font-family: monospace;
    font-size: 9pt;
    border: 1px solid #cbd5e1;
  }

  /* List Styling */
  ul, ol {
    margin-top: 0;
    margin-bottom: 10px;
    padding-left: 20px;
  }

  li {
    margin-bottom: 4px;
  }

  /* Badges */
  .badge {
    display: inline-block;
    padding: 2px 8px;
    font-size: 8pt;
    font-weight: 700;
    border-radius: 4px;
    text-transform: uppercase;
  }
  .badge-red { background: #fee2e2; color: #991b1b; border: 1px solid #f87171; }
  .badge-orange { background: #ffedd5; color: #9a3412; border: 1px solid #fb923c; }
  .badge-green { background: #dcfce7; color: #166534; border: 1px solid #4ade80; }
  .badge-blue { background: #dbeafe; color: #1e40af; border: 1px solid #60a5fa; }

  /* Diagram SVG containers */
  .diagram-container {
    background: #ffffff;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    padding: 15px;
    text-align: center;
    margin-top: 10px;
    margin-bottom: 16px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  }

  .diagram-title {
    font-size: 9.5pt;
    font-weight: 700;
    color: #475569;
    margin-top: 8px;
  }

  /* UI Screen Mockup Frames */
  .mockup-window {
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 18px;
    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
    background: #ffffff;
  }

  .mockup-header {
    background: #0f172a;
    color: #ffffff;
    padding: 6px 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 8.5pt;
  }

  .mockup-dots {
    display: flex;
    gap: 5px;
  }
  .mockup-dot { width: 8px; height: 8px; border-radius: 50%; }
  .dot-red { background: #ef4444; }
  .dot-yellow { background: #f59e0b; }
  .dot-green { background: #10b981; }

  .mockup-body {
    padding: 12px;
    background: #f8fafc;
    min-height: 180px;
  }

  /* Footer / Page Headers */
  .header-banner {
    display: flex;
    justify-content: space-between;
    font-size: 8pt;
    color: #64748b;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 4px;
    margin-bottom: 15px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
</style>
</head>
<body>

<!-- PAGE 1: COVER PAGE -->
<div class="cover-container">
  <div class="cover-header">
    <div class="badge-tag">Community &amp; Living • Smart City Innovation</div>
    <div class="cover-title">N-SHIELD</div>
    <div class="cover-tagline">AI-Powered Urban Safety Intelligence</div>
    <div class="cover-subtitle">A Citizen-Centric Smart Safety Platform for Nagpur, Maharashtra</div>
  </div>

  <div class="cover-visual">
    <svg width="460" height="230" viewBox="0 0 460 230" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Grid background -->
      <path d="M0 20H460 M0 60H460 M0 100H460 M0 140H460 M0 180H460 M0 220H460" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
      <path d="M40 0V230 M100 0V230 M160 0V230 M220 0V230 M280 0V230 M340 0V230 M400 0V230" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
      
      <!-- Shield outline -->
      <path d="M230 20 L320 50 V110 C320 160 230 200 230 200 C230 200 140 160 140 110 V50 L230 20 Z" fill="rgba(37, 99, 235, 0.25)" stroke="#f97316" stroke-width="3.5" stroke-linejoin="round"/>
      
      <!-- Inner Pulse Rings -->
      <circle cx="230" cy="105" r="55" fill="none" stroke="rgba(59, 130, 246, 0.4)" stroke-width="1.5" stroke-dasharray="4 4"/>
      <circle cx="230" cy="105" r="35" fill="none" stroke="rgba(249, 115, 22, 0.6)" stroke-width="2"/>
      
      <!-- Nagpur City Nodes -->
      <circle cx="230" cy="105" r="8" fill="#f97316"/> <!-- Zero Mile Center -->
      <circle cx="180" cy="80" r="5" fill="#10b981"/> <!-- Dharampeth -->
      <circle cx="280" cy="85" r="5" fill="#3b82f6"/> <!-- Sadar -->
      <circle cx="270" cy="135" r="5" fill="#ef4444"/> <!-- Itwari / Mahal -->
      <circle cx="175" cy="130" r="5" fill="#10b981"/> <!-- Hingna / IT Park -->
      
      <!-- Connecting lines -->
      <line x1="230" y1="105" x2="180" y2="80" stroke="#60a5fa" stroke-width="1.5"/>
      <line x1="230" y1="105" x2="280" y2="85" stroke="#60a5fa" stroke-width="1.5"/>
      <line x1="230" y1="105" x2="270" y2="135" stroke="#f97316" stroke-width="1.5"/>
      <line x1="230" y1="105" x2="175" y2="130" stroke="#10b981" stroke-width="1.5"/>

      <!-- AI Spark Icons -->
      <path d="M230 65 L233 73 L241 76 L233 79 L230 87 L227 79 L219 76 L227 73 Z" fill="#fdba74"/>
      
      <!-- Text label inside shield -->
      <text x="230" y="165" font-family="'Segoe UI', sans-serif" font-size="12" font-weight="bold" fill="#ffffff" text-anchor="middle" letter-spacing="1">NAGPUR SAFETY MAP</text>
    </svg>
  </div>

  <div class="cover-footer">
    <div class="meta-box">
      <h4>Project Lead &amp; Developer</h4>
      <p>Khushal Deogade</p>
    </div>
    <div class="meta-box">
      <h4>Target City</h4>
      <p>Nagpur, Maharashtra, India</p>
    </div>
    <div class="meta-box">
      <h4>Submission Target</h4>
      <p>Academic &amp; Hackathon / Fund My Crazy</p>
    </div>
    <div class="meta-box" style="text-align: right;">
      <h4>Document Version</h4>
      <p>v1.0 Complete Specification</p>
    </div>
  </div>
</div>

<div class="page-break"></div>

<!-- PAGE 2: ABSTRACT & PROJECT SUMMARY -->
<div class="header-banner">
  <span>N-SHIELD • Project Documentation</span>
  <span>Section 2: Abstract &amp; Executive Summary</span>
</div>

<div class="section-header">
  <div class="section-number">2</div>
  <h2 class="section-title">Abstract / Project Summary</h2>
</div>

<p>
  <strong>N-SHIELD (AI-Powered Urban Safety Intelligence)</strong> is a comprehensive, citizen-focused smart city safety platform specifically architected for Nagpur, Maharashtra. The system synthesizes spatial map visuals, verified public-safety updates, emergency services directory data, and artificial intelligence into a single unified interactive dashboard. By consolidating fragmented safety data into intuitive visual indicators and plain-language insights, N-SHIELD empowers citizens to evaluate neighborhood risk profiles before traveling, choosing commute routes, visiting unfamiliar areas, or responding to emergency situations.
</p>

<div class="card-info">
  <strong>Core Value Proposition:</strong> Transforming fragmented, scattered public safety signals into proactive, actionable spatial intelligence for everyday citizens without creating panic or spreading unverified rumors.
</div>

<p>
  In rapidly growing tier-1 and tier-2 smart cities across India such as Nagpur, urban expansion has outpaced the delivery of localized, accessible safety context. While navigation platforms excel at providing shortest-path routing based on traffic congestion, they remain completely blind to safety variables such as lighting conditions, localized crime trends, nearby emergency support density, and active police patrol zones. N-SHIELD bridges this critical gap.
</p>

<div class="subsection-title">Key Core Pillars of N-SHIELD</div>
<ul>
  <li><strong>Spatial Risk Map:</strong> Color-coded visual overlay (Green, Orange, Red) representing relative safety levels across major commercial, residential, and transit zones in Nagpur.</li>
  <li><strong>Emergency Support Directory:</strong> One-tap access to nearby Police Stations, Hospitals, 24/7 Medical Stores, and Women's Helpline contacts filtered by current GPS location.</li>
  <li><strong>Verified Safety News Feed:</strong> Real-time aggregation of local news, municipal alerts, and police advisories verified to prevent misinformation.</li>
  <li><strong>Responsible AI Analytics:</strong> Powered by Gemini API to generate plain-language safety summaries and practical situational advice for commuters.</li>
  <li><strong>Scalable Architecture:</strong> Built on modern full-stack web standards (Next.js, TypeScript, Google Maps API, MongoDB/PostgreSQL) designed for seamless expansion across Maharashtra and India.</li>
</ul>

<!-- PAGE 3: PROBLEM STATEMENT -->
<div class="section-header" style="margin-top: 30px;">
  <div class="section-number">3</div>
  <h2 class="section-title">Problem Statement</h2>
</div>

<p>
  Urban safety in Indian cities presents a complex challenge characterized by fragmented information access, lack of spatial safety context, and emergency response friction. Citizens navigating Nagpur daily face five distinct structural pain points:
</p>

<table class="avoid-break">
  <thead>
    <tr>
      <th style="width: 25%;">Problem Area</th>
      <th style="width: 40%;">Current Reality in Nagpur</th>
      <th style="width: 35%;">Impact on Citizens</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>1. Fragmented Safety Data</strong></td>
      <td>Crime updates, emergency helplines, police station locations, and hospital contacts are scattered across disparate websites, PDF documents, news portals, and social media feeds.</td>
      <td>Citizens lose vital minutes during emergencies searching for phone numbers or verified locations.</td>
    </tr>
    <tr>
      <td><strong>2. Blind Spot Navigation</strong></td>
      <td>Standard navigation maps optimize solely for travel distance and traffic time. They provide zero visibility into low-lit stretches, isolated streets, or high-incident junctions.</td>
      <td>Commuters (especially women and night-shift workers) unknowingly take risky or poorly patrolled routes.</td>
    </tr>
    <tr>
      <td><strong>3. Lack of Contextual Awareness</strong></td>
      <td>Citizens traveling to unfamiliar neighborhoods (e.g., late-night arrivals at Nagpur Railway Station or Mihan IT Hub) have no quick way to assess area safety.</td>
      <td>Increased vulnerability to petty crime, theft, harassment, or delayed assistance.</td>
    </tr>
    <tr>
      <td><strong>4. Rumors &amp; Misinformation</strong></td>
      <td>Unverified social media posts often cause unnecessary panic regarding local safety incidents or road closures.</td>
      <td>Public anxiety increases while genuine safety warnings get lost in digital noise.</td>
    </tr>
    <tr>
      <td><strong>5. High Bar to Data Utilization</strong></td>
      <td>Raw crime statistics published by official crime bureaus are technical, tabular, and difficult for non-technical citizens to interpret in daily life.</td>
      <td>Valuable safety statistics remain unused by the very citizens who need actionable advice.</td>
    </tr>
  </tbody>
</table>

<div class="page-break"></div>

<!-- PAGE 4: PROPOSED SOLUTION & DISCLAIMER -->
<div class="header-banner">
  <span>N-SHIELD • Project Documentation</span>
  <span>Section 4: Proposed Solution &amp; Governance</span>
</div>

<div class="section-header">
  <div class="section-number">4</div>
  <h2 class="section-title">Proposed Solution</h2>
</div>

<p>
  N-SHIELD solves these systemic challenges by introducing a unified, intelligent urban safety web platform engineered with citizen usability at its core. Rather than presenting intimidating statistical tables, N-SHIELD transforms safety data into intuitive visual layers and actionable AI summaries.
</p>

<div class="diagram-container avoid-break">
  <svg width="600" height="150" viewBox="0 0 600 150" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Box 1 -->
    <rect x="10" y="25" width="120" height="100" rx="8" fill="#eff6ff" stroke="#2563eb" stroke-width="2"/>
    <text x="70" y="55" font-size="10" font-weight="bold" fill="#1e3a8a" text-anchor="middle">SCATTERED DATA</text>
    <text x="70" y="75" font-size="8" fill="#475569" text-anchor="middle">• Police PDF Reports</text>
    <text x="70" y="90" font-size="8" fill="#475569" text-anchor="middle">• Local News Feeds</text>
    <text x="70" y="105" font-size="8" fill="#475569" text-anchor="middle">• Emergency Contacts</text>

    <!-- Arrow 1 -->
    <path d="M135 75 L165 75" stroke="#f97316" stroke-width="2"/>

    <!-- Box 2 -->
    <rect x="170" y="25" width="120" height="100" rx="8" fill="#fff7ed" stroke="#f97316" stroke-width="2"/>
    <text x="230" y="55" font-size="10" font-weight="bold" fill="#9a3412" text-anchor="middle">N-SHIELD ENGINE</text>
    <text x="230" y="75" font-size="8" fill="#475569" text-anchor="middle">• Geocoding &amp; Mapping</text>
    <text x="230" y="90" font-size="8" fill="#475569" text-anchor="middle">• Category Filter</text>
    <text x="230" y="105" font-size="8" fill="#475569" text-anchor="middle">• Gemini AI Summaries</text>

    <!-- Arrow 2 -->
    <path d="M295 75 L325 75" stroke="#f97316" stroke-width="2"/>

    <!-- Box 3 -->
    <rect x="330" y="25" width="120" height="100" rx="8" fill="#f0fdf4" stroke="#16a34a" stroke-width="2"/>
    <text x="390" y="55" font-size="10" font-weight="bold" fill="#166534" text-anchor="middle">SMART DASHBOARD</text>
    <text x="390" y="75" font-size="8" fill="#475569" text-anchor="middle">• Color-Coded Zones</text>
    <text x="390" y="90" font-size="8" fill="#475569" text-anchor="middle">• Insight Cards</text>
    <text x="390" y="105" font-size="8" fill="#475569" text-anchor="middle">• Verified Updates</text>

    <!-- Arrow 3 -->
    <path d="M455 75 L485 75" stroke="#f97316" stroke-width="2"/>

    <!-- Box 4 -->
    <rect x="490" y="25" width="100" height="100" rx="8" fill="#0f172a" stroke="#0f172a" stroke-width="2"/>
    <text x="540" y="55" font-size="10" font-weight="bold" fill="#ffffff" text-anchor="middle">CITIZEN IMPACT</text>
    <text x="540" y="75" font-size="8" fill="#cbd5e1" text-anchor="middle">• Safer Travel</text>
    <text x="540" y="90" font-size="8" fill="#cbd5e1" text-anchor="middle">• Rapid SOS</text>
    <text x="540" y="105" font-size="8" fill="#cbd5e1" text-anchor="middle">• Peace of Mind</text>
  </svg>
  <div class="diagram-title">Figure 4.1: N-SHIELD Core Transformation Pipeline</div>
</div>

<div class="subsection-title">Core Solution Components</div>
<ul>
  <li><strong>Interactive Nagpur Safety Map:</strong> Embedded Google Maps interface with dynamic risk overlay polygons and location marker clustering for Nagpur landmarks (Sitabuldi, Dharampeth, Sadar, Wardhaman Nagar, Hinna Road, Mahal, Mihan, Nagpur Station).</li>
  <li><strong>Color-Coded Risk Zones:</strong>
    <ul>
      <li><span class="badge badge-green">Green Zone (Low Risk)</span> Well-lit, highly patrolled commercial/residential areas with active public presence.</li>
      <li><span class="badge badge-orange">Orange Zone (Medium Risk)</span> Areas requiring standard caution, high-density traffic junctions, or moderate past incidents.</li>
      <li><span class="badge badge-red">Red Zone (High Risk / Caution)</span> Isolated stretches, unlit roads, or areas with frequent recent reported incidents.</li>
    </ul>
  </li>
  <li><strong>Multi-Category Filters:</strong> User-controlled filters to isolate specific safety parameters (Theft, Robbery, Harassment, Traffic Accidents, Unlit Stretches).</li>
  <li><strong>Nearby Essential Services Finder:</strong> Instant spatial search for nearby Police Stations, Hospitals, and 24/7 Pharmacies with direct click-to-call links and navigation routes.</li>
  <li><strong>AI-Powered Safety Insight Card:</strong> Gemini AI summarizes public safety signals into concise, non-alarmist bullet points and safety tips.</li>
</ul>

<div class="card-warning avoid-break">
  <h4 style="margin: 0 0 6px 0; color: #9a3412; font-size: 11pt; text-transform: uppercase;">IMPORTANT SAFETY GUIDANCE &amp; ETHICAL DISCLAIMER</h4>
  <p style="margin: 0; font-size: 9.5pt;">
    <strong>N-SHIELD is designed exclusively to provide general safety awareness and public information guidance.</strong> It does <em>NOT</em> claim to predict individual crime events, guarantee absolute safety, or replace official law enforcement and emergency services. In cases of immediate danger or threat to life, citizens must immediately call national emergency services (112 / 100). All risk indicators represent historical and aggregated spatial public patterns, not individual profiling.
  </p>
</div>

<!-- PAGE 5: OBJECTIVES -->
<div class="section-header" style="margin-top: 30px;">
  <div class="section-number">5</div>
  <h2 class="section-title">Objectives</h2>
</div>

<div class="subsection-title">Primary &amp; Secondary Goals</div>
<ol>
  <li><strong>Enhance Citizen Safety Awareness:</strong> Equip residents and visitors of Nagpur with real-time, neighborhood-specific safety data before they travel.</li>
  <li><strong>Frictionless Emergency Access:</strong> Reduce emergency response connection time by providing one-click dialing to nearest police stations and medical centers.</li>
  <li><strong>Centralize Fragmented Data:</strong> Combine maps, news alerts, municipal data, and hospital directories into one seamless, responsive web application.</li>
  <li><strong>Promote Responsible AI Usage:</strong> Demonstrate how AI models can summarize complex public incident reports without hallucinating, biased profiling, or sensationalism.</li>
  <li><strong>Enable Data-Driven Decisions:</strong> Assist commuters, night workers, and travelers in choosing safer travel times and better lit transit corridors.</li>
  <li><strong>Build a Scalable Smart City Template:</strong> Establish a modular technology architecture that can be cloned and deployed across other smart cities in India (e.g., Pune, Nashik, Mumbai, Thane).</li>
</ol>

<div class="page-break"></div>

<!-- PAGE 6: TARGET USERS -->
<div class="header-banner">
  <span>N-SHIELD • Project Documentation</span>
  <span>Section 6: Target Users &amp; Stakeholder Matrix</span>
</div>

<div class="section-header">
  <div class="section-number">6</div>
  <h2 class="section-title">Target Users &amp; Stakeholder Analysis</h2>
</div>

<p>
  N-SHIELD is architected to support a diverse spectrum of urban citizens, visitors, and municipal stakeholders in Nagpur. The matrix below outlines how specific user groups interact with and benefit from the platform:
</p>

<table class="avoid-break">
  <thead>
    <tr>
      <th style="width: 20%;">User Segment</th>
      <th style="width: 35%;">Primary Pain Points / Needs</th>
      <th style="width: 45%;">How N-SHIELD Helps</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Students</strong><br><em>(RKNEC, VNIT, HISLOP, Nagpur Univ.)</em></td>
      <td>Late evening coaching classes, late library hours, traveling alone on two-wheelers, unfamiliar hostel surroundings.</td>
      <td>Provides clear risk zone guidance, nearby police station finder, and instant emergency call buttons for peace of mind while commuting.</td>
    </tr>
    <tr>
      <td><strong>Women Commuters</strong><br><em>(IT Professionals, Retail Staff)</em></td>
      <td>Night-shift travel from MIHAN IT Park, poorly lit bus stops, unpatrolled suburban routes, feeling unsafe at isolated auto stands.</td>
      <td>Delivers real-time location insights, safety tips for specific areas, verified news alerts, and safe route guidance.</td>
    </tr>
    <tr>
      <td><strong>Working Professionals</strong><br><em>(Late Shift Workers, Delivery Drivers)</em></td>
      <td>Navigating unfamiliar routes during late night hours, finding open 24/7 medical stores or urgent care facilities.</td>
      <td>Quick location search with hospital &amp; pharmacy locator, real-time risk status, and direct Google Maps navigation integration.</td>
    </tr>
    <tr>
      <td><strong>Senior Citizens</strong></td>
      <td>Difficulty navigating complex apps, finding verified emergency helpline numbers, assessing neighborhood safety for evening walks.</td>
      <td>Simplified high-contrast user interface, large click-to-call emergency buttons, plain-language AI safety summaries.</td>
    </tr>
    <tr>
      <td><strong>Tourists &amp; Visitors</strong><br><em>(Nagpur Railway / Airport Arrivals)</em></td>
      <td>No prior knowledge of Nagpur geography, safe areas, or local police station boundaries.</td>
      <td>Interactive safety map highlighting major hubs (Sitabuldi, Sadar) with immediate clarity on safe commercial zones vs caution areas.</td>
    </tr>
    <tr>
      <td><strong>Families</strong></td>
      <td>Concern for children returning home late, selecting safe residential neighborhoods for home buying or renting.</td>
      <td>Aggregated neighborhood safety trends, verified community safety news, and downloadable area safety insights.</td>
    </tr>
    <tr>
      <td><strong>Police &amp; Municipal Authorities</strong><br><em>(Future Version Scope)</em></td>
      <td>Need for aggregated community feedback on unlit streetlights, dead spots, and citizen safety perception patterns.</td>
      <td>Provides anonymous crowdsourced safety feedback metrics to optimize police patrolling routes and civic lighting infrastructure.</td>
    </tr>
  </tbody>
</table>

<!-- PAGE 7: KEY FEATURES -->
<div class="section-header" style="margin-top: 30px;">
  <div class="section-number">7</div>
  <h2 class="section-title">Key Features Deep-Dive</h2>
</div>

<div class="subsection-title">Detailed Feature Breakdown</div>

<div class="card">
  <strong style="color: #2563eb;">1. Interactive Google Maps Safety Layer:</strong> Custom Google Maps JS integration displaying Nagpur color-coded safety overlays, heatmaps, and custom markers. Smooth zoom, pan, and tilt controls tailored for both desktop and mobile screens.
</div>

<div class="card">
  <strong style="color: #2563eb;">2. Intelligent Location Search &amp; Geocoding:</strong> Integrated Google Places Autocomplete search bar enabling instant location lookup across all major Nagpur localities (e.g., Dharampeth, Sadar, Itwari, Wardha Road, Hingna).
</div>

<div class="card">
  <strong style="color: #2563eb;">3. Dynamic Risk-Zone Visualization:</strong> Real-time rendering of spatial boundaries categorized into Green (Low Risk), Orange (Medium Risk), and Red (Caution/High Risk) based on historical incident density and lighting conditions.
</div>

<div class="card">
  <strong style="color: #2563eb;">4. Safety Category Filters:</strong> Toggle switches allowing users to filter map layers by specific concern types: Theft &amp; Robbery, Harassment, Traffic Hazards, Unlit Stretches, and Low Patrol Zones.
</div>

<div class="card">
  <strong style="color: #2563eb;">5. Location-Based Safety Insight Card:</strong> Dynamic sidebar/bottom-sheet panel updating automatically when a location is clicked. Displays overall risk score (1-100), primary risk factors, and recommended safety precautions.
</div>

<div class="card">
  <strong style="color: #2563eb;">6. Nearby Police Station Finder:</strong> Spatial database query identifying nearest police stations relative to the user's current GPS location or selected map pin, displaying official contact numbers, address, and distance.
</div>

<div class="card">
  <strong style="color: #2563eb;">7. Nearby Hospitals &amp; 24/7 Pharmacy Finder:</strong> Live locator for emergency trauma centers, multi-specialty hospitals, and late-night medical stores with direct call buttons and driving directions.
</div>

<div class="page-break"></div>

<!-- PAGE 8: KEY FEATURES CONTINUED -->
<div class="header-banner">
  <span>N-SHIELD • Project Documentation</span>
  <span>Section 7: Key Features (Continued)</span>
</div>

<div class="card">
  <strong style="color: #2563eb;">8. One-Tap Emergency SOS Call Suite:</strong> Prominent floating emergency toolbar providing immediate click-to-call access to National Emergency (112), Police Hotline (100), Women's Helpline (1091), Ambulance (102), and Fire (101).
</div>

<div class="card">
  <strong style="color: #2563eb;">9. Verified Local Safety News &amp; Alert Feed:</strong> Curated feed of verified municipal advisories, traffic diversions, weather warnings, and local safety updates sourced from verified news feeds and police handles.
</div>

<div class="card">
  <strong style="color: #2563eb;">10. Gemini AI Safety Summarizer:</strong> Advanced LLM prompt pipeline that converts raw news articles and multi-point incident data into concise 3-bullet plain-language summaries without hype or sensationalism.
</div>

<div class="card">
  <strong style="color: #2563eb;">11. Location-Specific AI Safety Tips:</strong> Context-aware advisory engine delivering tailored safety recommendations based on time of day (e.g., "Avoid unlit bypass road after 10 PM; stick to main Wardha Road corridor").
</div>

<div class="card">
  <strong style="color: #2563eb;">12. Turn-by-Turn Navigation Launchers:</strong> One-click deep-linking into Google Maps native application for instant navigation to selected safe locations or emergency centers.
</div>

<div class="card">
  <strong style="color: #2563eb;">13. Responsive Cross-Platform PWA Layout:</strong> Fluid, modern mobile-first user interface built with Next.js and Tailwind CSS, fully optimized for Android devices, iPhones, tablets, and desktop browsers.
</div>

<div class="card">
  <strong style="color: #2563eb;">14. Safer Route Comparison (Future Scope Ready):</strong> Architectural hooks for evaluating alternative origin-to-destination routes by overlaying risk zone polygons onto Google Directions API paths.
</div>

<!-- PAGE 9: COMPLETE USER WORKFLOW -->
<div class="section-header" style="margin-top: 30px;">
  <div class="section-number">8</div>
  <h2 class="section-title">Complete User Workflow</h2>
</div>

<p>
  The end-to-end user workflow is engineered to deliver critical safety context within 3 clicks of opening the application. Below is the visual workflow architecture:
</p>

<div class="diagram-container avoid-break">
  <svg width="620" height="260" viewBox="0 0 620 260" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Flow Nodes -->
    <!-- Row 1 -->
    <rect x="20" y="20" width="160" height="50" rx="8" fill="#0f172a" stroke="#2563eb" stroke-width="2"/>
    <text x="100" y="42" font-size="9" font-weight="bold" fill="#ffffff" text-anchor="middle">1. OPEN N-SHIELD</text>
    <text x="100" y="55" font-size="8" fill="#fdba74" text-anchor="middle">Detect GPS / Nagpur View</text>

    <path d="M180 45 L220 45" stroke="#f97316" stroke-width="2"/>

    <rect x="220" y="20" width="170" height="50" rx="8" fill="#eff6ff" stroke="#2563eb" stroke-width="2"/>
    <text x="305" y="42" font-size="9" font-weight="bold" fill="#1e3a8a" text-anchor="middle">2. EXPLORE SAFETY MAP</text>
    <text x="305" y="55" font-size="8" fill="#475569" text-anchor="middle">View Color-Coded Zones</text>

    <path d="M390 45 L430 45" stroke="#f97316" stroke-width="2"/>

    <rect x="430" y="20" width="170" height="50" rx="8" fill="#eff6ff" stroke="#2563eb" stroke-width="2"/>
    <text x="515" y="42" font-size="9" font-weight="bold" fill="#1e3a8a" text-anchor="middle">3. SEARCH LOCATION</text>
    <text x="515" y="55" font-size="8" fill="#475569" text-anchor="middle">Google Places Search</text>

    <!-- Down arrow -->
    <path d="M515 70 L515 100" stroke="#f97316" stroke-width="2"/>

    <!-- Row 2 -->
    <rect x="430" y="100" width="170" height="50" rx="8" fill="#fff7ed" stroke="#f97316" stroke-width="2"/>
    <text x="515" y="122" font-size="9" font-weight="bold" fill="#9a3412" text-anchor="middle">4. REVIEW RISK CARD</text>
    <text x="515" y="135" font-size="8" fill="#475569" text-anchor="middle">Risk Score &amp; Category Filters</text>

    <path d="M430 125 L390 125" stroke="#f97316" stroke-width="2"/>

    <rect x="220" y="100" width="170" height="50" rx="8" fill="#fff7ed" stroke="#f97316" stroke-width="2"/>
    <text x="305" y="122" font-size="9" font-weight="bold" fill="#9a3412" text-anchor="middle">5. READ AI INSIGHTS</text>
    <text x="305" y="135" font-size="8" fill="#475569" text-anchor="middle">Gemini AI Summary &amp; Tips</text>

    <path d="M220 125 L180 125" stroke="#f97316" stroke-width="2"/>

    <rect x="20" y="100" width="160" height="50" rx="8" fill="#f0fdf4" stroke="#16a34a" stroke-width="2"/>
    <text x="100" y="122" font-size="9" font-weight="bold" fill="#166534" text-anchor="middle">6. CHECK NEARBY SERVICES</text>
    <text x="100" y="135" font-size="8" fill="#475569" text-anchor="middle">Police / Hospital Locator</text>

    <!-- Down arrow -->
    <path d="M100 150 L100 180" stroke="#f97316" stroke-width="2"/>

    <!-- Row 3 -->
    <rect x="20" y="180" width="260" height="50" rx="8" fill="#eff6ff" stroke="#2563eb" stroke-width="2"/>
    <text x="150" y="202" font-size="9" font-weight="bold" fill="#1e3a8a" text-anchor="middle">7. DECIDE ROUTE / CALL SOS</text>
    <text x="150" y="215" font-size="8" fill="#475569" text-anchor="middle">Choose Safer Path or Dial Emergency 112</text>

    <path d="M280 205 L340 205" stroke="#f97316" stroke-width="2"/>

    <rect x="340" y="180" width="260" height="50" rx="8" fill="#0f172a" stroke="#2563eb" stroke-width="2"/>
    <text x="470" y="202" font-size="9" font-weight="bold" fill="#ffffff" text-anchor="middle">8. LAUNCH GOOGLE MAPS NAV</text>
    <text x="470" y="215" font-size="8" fill="#fdba74" text-anchor="middle">Safe Turn-by-Turn Arrival at Destination</text>
  </svg>
  <div class="diagram-title">Figure 8.1: Complete End-to-End User Interaction Flow</div>
</div>

<div class="page-break"></div>

<!-- PAGE 10: TECHNOLOGY STACK -->
<div class="header-banner">
  <span>N-SHIELD • Project Documentation</span>
  <span>Section 9: Technology Stack</span>
</div>

<div class="section-header">
  <div class="section-number">9</div>
  <h2 class="section-title">Technology Stack</h2>
</div>

<p>
  N-SHIELD is built using modern, production-grade open-source web frameworks, cloud mapping services, scalable database models, and generative AI APIs. Below is the detailed technical breakdown:
</p>

<table class="avoid-break">
  <thead>
    <tr>
      <th style="width: 20%;">Component</th>
      <th style="width: 25%;">Technology Chosen</th>
      <th style="width: 20%;">Version / Spec</th>
      <th style="width: 35%;">Engineering Rationale &amp; Benefits</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Frontend Framework</strong></td>
      <td>Next.js (React)</td>
      <td>v14+ (App Router)</td>
      <td>Server-Side Rendering (SSR) for fast initial load, optimized image loading, built-in API routing, and excellent SEO capabilities.</td>
    </tr>
    <tr>
      <td><strong>Programming Language</strong></td>
      <td>TypeScript</td>
      <td>v5.0+</td>
      <td>Strict static typing eliminates runtime reference errors, improves IDE autocompletion, and enforces robust data contracts.</td>
    </tr>
    <tr>
      <td><strong>UI Styling &amp; Theme</strong></td>
      <td>Tailwind CSS + Vanilla CSS</td>
      <td>v3.4+</td>
      <td>Utility-first CSS framework enabling rapid, highly customizable responsive UI components with clean dark/light modern themes.</td>
    </tr>
    <tr>
      <td><strong>Mapping Engine</strong></td>
      <td>Google Maps JS API</td>
      <td>v3.55+</td>
      <td>Industry-standard mapping solution offering high-precision spatial rendering, custom overlay polygons, geocoding, and smooth interaction.</td>
    </tr>
    <tr>
      <td><strong>Directions Engine</strong></td>
      <td>Google Directions API</td>
      <td>v1 REST API</td>
      <td>Calculates precise distance, duration, and turn-by-turn navigation paths for future safer-route comparisons.</td>
    </tr>
    <tr>
      <td><strong>Backend API Layer</strong></td>
      <td>Next.js API Routes / Node.js</td>
      <td>ES2023 / Node 20</td>
      <td>Lightweight serverless API functions co-located with frontend code, ensuring low latency and frictionless Vercel deployment.</td>
    </tr>
    <tr>
      <td><strong>Alternative Backend</strong></td>
      <td>FastAPI (Python) / Spring Boot</td>
      <td>Python 3.11+</td>
      <td>Modular Python API option for heavy data analysis, spatial geospatial calculations (GeoPandas), and ML model hosting.</td>
    </tr>
    <tr>
      <td><strong>Primary Database</strong></td>
      <td>MongoDB / PostgreSQL</td>
      <td>Mongo v7 / Postgres 16</td>
      <td>MongoDB for flexible document storage of news &amp; incidents; PostgreSQL + PostGIS extension for high-performance spatial queries.</td>
    </tr>
    <tr>
      <td><strong>AI Summarization Engine</strong></td>
      <td>Google Gemini API</td>
      <td>Gemini 1.5 Flash</td>
      <td>Ultra-fast, low-cost generative AI model ideal for real-time text summarization, safety advice synthesis, and structured JSON parsing.</td>
    </tr>
    <tr>
      <td><strong>News &amp; Public Feeds</strong></td>
      <td>RSS Feeds / Custom Scrapers</td>
      <td>JSON / XML APIs</td>
      <td>Fetches verified public safety advisories, municipal announcements, and local RSS news channels.</td>
    </tr>
    <tr>
      <td><strong>Deployment &amp; Hosting</strong></td>
      <td>Vercel Cloud Platform</td>
      <td>Edge Network</td>
      <td>Global CDN edge network providing automated CI/CD builds from GitHub, SSL certificates, zero downtime, and instant scaling.</td>
    </tr>
    <tr>
      <td><strong>Version Control</strong></td>
      <td>Git &amp; GitHub</td>
      <td>Git 2.40+</td>
      <td>Distributed version control, branch management, issue tracking, and automated deployment triggers.</td>
    </tr>
  </tbody>
</table>

<!-- PAGE 11: SYSTEM ARCHITECTURE -->
<div class="section-header" style="margin-top: 30px;">
  <div class="section-number">10</div>
  <h2 class="section-title">System Architecture</h2>
</div>

<p>
  N-SHIELD adopts a multi-tier, decoupled architecture separating client presentation, spatial mapping, backend services, database persistence, and external AI processing.
</p>

<div class="diagram-container avoid-break">
  <svg width="620" height="280" viewBox="0 0 620 280" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Outer Layers -->
    <!-- Client Layer -->
    <rect x="10" y="10" width="600" height="45" rx="6" fill="#0f172a" stroke="#2563eb" stroke-width="2"/>
    <text x="310" y="30" font-size="10" font-weight="bold" fill="#ffffff" text-anchor="middle">CLIENT PRESENTATION LAYER (Next.js React PWA / Mobile / Desktop)</text>
    <text x="310" y="44" font-size="8" fill="#93c5fd" text-anchor="middle">Interactive Map Component • Search Bar • Emergency SOS Toolbar • News Feed Card</text>

    <!-- Down Connector -->
    <line x1="310" y1="55" x2="310" y2="80" stroke="#f97316" stroke-width="2"/>

    <!-- API & Server Layer -->
    <rect x="10" y="80" width="600" height="50" rx="6" fill="#eff6ff" stroke="#2563eb" stroke-width="2"/>
    <text x="310" y="100" font-size="10" font-weight="bold" fill="#1e3a8a" text-anchor="middle">API &amp; ROUTING LAYER (Next.js API Routes / Node.js Serverless)</text>
    <text x="310" y="116" font-size="8" fill="#475569" text-anchor="middle">/api/risk-zones • /api/location-safety • /api/news • /api/emergency-services • /api/feedback</text>

    <!-- Connectors to Sub-services -->
    <line x1="110" y1="130" x2="110" y2="160" stroke="#2563eb" stroke-width="2"/>
    <line x1="260" y1="130" x2="260" y2="160" stroke="#2563eb" stroke-width="2"/>
    <line x1="410" y1="130" x2="410" y2="160" stroke="#2563eb" stroke-width="2"/>
    <line x1="530" y1="130" x2="530" y2="160" stroke="#2563eb" stroke-width="2"/>

    <!-- Database Box -->
    <rect x="30" y="160" width="150" height="90" rx="6" fill="#f0fdf4" stroke="#16a34a" stroke-width="2"/>
    <text x="105" y="180" font-size="9" font-weight="bold" fill="#166534" text-anchor="middle">DATABASE LAYER</text>
    <text x="105" y="198" font-size="8" fill="#475569" text-anchor="middle">MongoDB / PostgreSQL</text>
    <text x="105" y="212" font-size="7.5" fill="#475569" text-anchor="middle">• Risk Zones GeoJSON</text>
    <text x="105" y="224" font-size="7.5" fill="#475569" text-anchor="middle">• Police &amp; Hospital DB</text>
    <text x="105" y="236" font-size="7.5" fill="#475569" text-anchor="middle">• Incident History Logs</text>

    <!-- External Maps API -->
    <rect x="200" y="160" width="130" height="90" rx="6" fill="#fff7ed" stroke="#ea580c" stroke-width="2"/>
    <text x="265" y="180" font-size="9" font-weight="bold" fill="#9a3412" text-anchor="middle">GOOGLE MAPS API</text>
    <text x="265" y="198" font-size="8" fill="#475569" text-anchor="middle">Map Layers</text>
    <text x="265" y="212" font-size="7.5" fill="#475569" text-anchor="middle">• Places Autocomplete</text>
    <text x="265" y="224" font-size="7.5" fill="#475569" text-anchor="middle">• Geocoding Engine</text>
    <text x="265" y="236" font-size="7.5" fill="#475569" text-anchor="middle">• Directions API</text>

    <!-- AI Module -->
    <rect x="350" y="160" width="130" height="90" rx="6" fill="#faf5ff" stroke="#9333ea" stroke-width="2"/>
    <text x="415" y="180" font-size="9" font-weight="bold" fill="#6b21a8" text-anchor="middle">AI ENGINE LAYER</text>
    <text x="415" y="198" font-size="8" fill="#475569" text-anchor="middle">Google Gemini API</text>
    <text x="415" y="212" font-size="7.5" fill="#475569" text-anchor="middle">• News Summarization</text>
    <text x="415" y="224" font-size="7.5" fill="#475569" text-anchor="middle">• Risk Explanations</text>
    <text x="415" y="236" font-size="7.5" fill="#475569" text-anchor="middle">• Contextual Tips</text>

    <!-- External News APIs -->
    <rect x="490" y="160" width="110" height="90" rx="6" fill="#f8fafc" stroke="#64748b" stroke-width="2"/>
    <text x="545" y="180" font-size="9" font-weight="bold" fill="#334155" text-anchor="middle">PUBLIC DATA</text>
    <text x="545" y="198" font-size="8" fill="#475569" text-anchor="middle">External Sources</text>
    <text x="545" y="212" font-size="7.5" fill="#475569" text-anchor="middle">• Verified News RSS</text>
    <text x="545" y="224" font-size="7.5" fill="#475569" text-anchor="middle">• Police Portals</text>
    <text x="545" y="236" font-size="7.5" fill="#475569" text-anchor="middle">• Municipal Feeds</text>
  </svg>
  <div class="diagram-title">Figure 10.1: Multi-Tier N-SHIELD System Architecture</div>
</div>

<div class="page-break"></div>

<!-- PAGE 12: DATA FLOW & PRIVACY -->
<div class="header-banner">
  <span>N-SHIELD • Project Documentation</span>
  <span>Section 11: Data Flow &amp; Privacy Protections</span>
</div>

<div class="section-header">
  <div class="section-number">11</div>
  <h2 class="section-title">Data Flow &amp; Privacy Framework</h2>
</div>

<div class="subsection-title">Step-by-Step Data Execution Sequence</div>
<ol>
  <li><strong>User Location Selection:</strong> User grants browser GPS permission or types a specific location into the search bar (e.g., "Sitabuldi, Nagpur").</li>
  <li><strong>Client Request Generation:</strong> Next.js frontend dispatches asynchronous HTTPS requests to `/api/location-safety?lat=21.1458&amp;lng=79.0882`.</li>
  <li><strong>Backend Spatial Query:</strong> API layer queries PostgreSQL/MongoDB spatial indexes to extract overlapping risk polygons, recent incident records within a 2 km radius, and nearest emergency service nodes.</li>
  <li><strong>AI Processing Pipeline:</strong> Extracted incident text and news headlines are passed to Google Gemini API with a structured prompt requesting a 3-bullet plain-language summary and safety advice.</li>
  <li><strong>Client Rendering:</strong> API returns compiled JSON payload; frontend updates map overlays, risk score gauge, emergency service lists, and AI summary card in real-time.</li>
</ol>

<div class="card-info avoid-break">
  <h4 style="margin: 0 0 6px 0; color: #1e3a8a; font-size: 11pt; text-transform: uppercase;">STRICT CITIZEN PRIVACY &amp; DATA PROTECTION RULES</h4>
  <ul style="margin: 0; padding-left: 18px; font-size: 9.5pt;">
    <li><strong>Zero Personally Identifiable Information (PII) Storage:</strong> N-SHIELD does not require user registration or log individual tracking histories.</li>
    <li><strong>Transient Location Processing:</strong> GPS coordinates received from user devices are evaluated in-memory solely to query nearby services and are never stored in databases or server logs.</li>
    <li><strong>No Commercial Data Tracking:</strong> Zero third-party ad pixels, user fingerprinting, or data sales monetization models.</li>
    <li><strong>HTTPS Encrypted Payload Transport:</strong> All client-to-server and server-to-API communication is strictly encrypted using TLS 1.3 standards.</li>
  </ul>
</div>

<!-- PAGE 13: AI COMPONENT & RESPONSIBLE AI -->
<div class="section-header" style="margin-top: 30px;">
  <div class="section-number">12</div>
  <h2 class="section-title">AI Component &amp; Responsible AI Framework</h2>
</div>

<p>
  N-SHIELD leverages Google's Gemini 1.5 Flash API to translate complex, multi-source spatial safety data into clear, accessible guidance.
</p>

<div class="subsection-title">AI Functional Architecture</div>
<ul>
  <li><strong>News &amp; Advisory Summarization:</strong> Distills lengthy news articles or municipal safety bulletins into 2-3 sentence summaries focusing strictly on practical safety implications.</li>
  <li><strong>Contextual Safety Tip Generation:</strong> Dynamically formulates recommendations based on situational parameters (e.g., area risk level, current time of day, lighting availability).</li>
  <li><strong>Non-Technical Explanations:</strong> Replaces intimidating crime statistics with plain-language context (e.g., instead of "Incident Rate Index 4.2", displaying "Moderate evening traffic; well-patrolled near main market").</li>
</ul>

<div class="card-warning avoid-break">
  <h4 style="margin: 0 0 8px 0; color: #9a3412; font-size: 11pt; text-transform: uppercase;">RESPONSIBLE AI GOVERNANCE RULES</h4>
  <table style="margin: 0; background: #ffffff;">
    <thead>
      <tr>
        <th style="width: 30%;">Governance Rule</th>
        <th style="width: 70%;">Enforcement &amp; Technical Constraint</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>1. Zero Facial Recognition</strong></td>
        <td>Strictly prohibited. System processes zero biometrics, photos, or video streams.</td>
      </tr>
      <tr>
        <td><strong>2. No Individual Surveillance</strong></td>
        <td>No tracking of individual citizens, vehicles, or personal movement profiles.</td>
      </tr>
      <tr>
        <td><strong>3. No Personal Crime Prediction</strong></td>
        <td>System does not predict whether a specific individual will commit or be a victim of crime.</td>
      </tr>
      <tr>
        <td><strong>4. Anti-Bias Guardrails</strong></td>
        <td>Algorithms are strictly forbidden from utilizing demographic, religious, caste, gender, or income attributes in risk calculations.</td>
      </tr>
      <tr>
        <td><strong>5. Verified Source Requirement</strong></td>
        <td>AI models summarize only verified public news feeds, municipal portals, and police press releases.</td>
      </tr>
      <tr>
        <td><strong>6. Source Transparency</strong></td>
        <td>Every AI-generated insight clearly displays its verification status and underlying news source timestamp.</td>
      </tr>
    </tbody>
  </table>
</div>

<div class="page-break"></div>

<!-- PAGE 14: UI PAGES / SCREENS MOCKUPS (PAGE 1) -->
<div class="header-banner">
  <span>N-SHIELD • Project Documentation</span>
  <span>Section 13: UI Screens &amp; Mockup Specifications</span>
</div>

<div class="section-header">
  <div class="section-number">13</div>
  <h2 class="section-title">UI Pages &amp; Screen Mockups (1 of 3)</h2>
</div>

<p>
  Below are pixel-accurate layout blueprints representing key screens within the N-SHIELD application:
</p>

<!-- Screen 1: Home Dashboard & Safety Map -->
<div class="mockup-window avoid-break">
  <div class="mockup-header">
    <div class="mockup-dots">
      <div class="mockup-dot dot-red"></div>
      <div class="mockup-dot dot-yellow"></div>
      <div class="mockup-dot dot-green"></div>
    </div>
    <div>N-SHIELD Nagpur — Interactive Safety Dashboard (Home Screen)</div>
    <div>https://nshield-nagpur.vercel.app</div>
  </div>
  <div class="mockup-body" style="display: flex; gap: 12px; height: 260px;">
    <!-- Map Canvas Left -->
    <div style="flex: 2; background: #e2e8f0; border-radius: 6px; position: relative; border: 1px solid #cbd5e1; overflow: hidden; padding: 10px;">
      <div style="background: rgba(15, 23, 42, 0.85); color: #fff; padding: 6px 12px; border-radius: 20px; font-size: 8pt; display: inline-block;">
        🔍 Search: Sitabuldi Main Market, Nagpur
      </div>
      <!-- Mock Map Features -->
      <div style="position: absolute; top: 70px; left: 40px; background: rgba(34, 197, 94, 0.35); border: 2px stroke #16a34a; padding: 15px; border-radius: 50%; font-size: 7.5pt; font-weight: bold; color: #14532d;">
        Dharampeth (Green Zone)
      </div>
      <div style="position: absolute; top: 120px; left: 180px; background: rgba(249, 115, 22, 0.35); border: 2px stroke #ea580c; padding: 20px; border-radius: 50%; font-size: 7.5pt; font-weight: bold; color: #7c2d12;">
        Sitabuldi (Orange Zone)
      </div>
      <div style="position: absolute; top: 40px; left: 240px; background: rgba(239, 68, 68, 0.35); border: 2px stroke #dc2626; padding: 12px; border-radius: 50%; font-size: 7.5pt; font-weight: bold; color: #7f1d1d;">
        Itwari Outer (Red Zone)
      </div>
      <div style="position: absolute; bottom: 10px; right: 10px; background: #fff; padding: 4px 8px; border-radius: 4px; font-size: 7.5pt; border: 1px solid #cbd5e1;">
        Legend: 🟢 Safe | 🟠 Caution | 🔴 High Risk
      </div>
    </div>
    
    <!-- Sidebar Right -->
    <div style="flex: 1; background: #ffffff; border-radius: 6px; border: 1px solid #cbd5e1; padding: 10px; display: flex; flex-direction: column; justify-content: space-between;">
      <div>
        <div style="font-size: 9pt; font-weight: bold; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">
          📍 Location Safety Insight
        </div>
        <div style="margin-top: 8px; font-size: 8pt;">
          <strong>Selected:</strong> Sitabuldi Market<br>
          <strong>Status:</strong> <span class="badge badge-orange">Medium Risk (Caution)</span><br>
          <strong>Safety Index:</strong> 68 / 100
        </div>
        <div style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 6px; border-radius: 4px; margin-top: 8px; font-size: 7.5pt; color: #1e40af;">
          <strong>Gemini AI Summary:</strong><br>
          High evening footfall. Exercise standard caution in crowded alleyways after 9 PM.
        </div>
      </div>
      <div style="display: flex; gap: 4px; margin-top: 8px;">
        <button style="flex: 1; background: #2563eb; color: white; border: none; padding: 6px; border-radius: 4px; font-size: 7.5pt; font-weight: bold;">Police (0.4 km)</button>
        <button style="flex: 1; background: #f97316; color: white; border: none; padding: 6px; border-radius: 4px; font-size: 7.5pt; font-weight: bold;">Hospital (0.8 km)</button>
      </div>
    </div>
  </div>
</div>

<!-- Screen 2: Location Details & Safety Insights -->
<div class="mockup-window avoid-break">
  <div class="mockup-header">
    <div class="mockup-dots">
      <div class="mockup-dot dot-red"></div>
      <div class="mockup-dot dot-yellow"></div>
      <div class="mockup-dot dot-green"></div>
    </div>
    <div>N-SHIELD — Detailed Location Insight Panel</div>
    <div>https://nshield-nagpur.vercel.app/location/sitabuldi</div>
  </div>
  <div class="mockup-body" style="padding: 14px; background: #ffffff;">
    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #2563eb; padding-bottom: 6px;">
      <div>
        <h3 style="margin: 0; font-size: 11pt; color: #0f172a;">Sitabuldi Interchange &amp; Market Zone</h3>
        <span style="font-size: 8pt; color: #64748b;">Central Nagpur District • Lat: 21.1458, Lng: 79.0882</span>
      </div>
      <span class="badge badge-orange" style="font-size: 9pt; padding: 4px 10px;">Caution Zone</span>
    </div>
    <div style="display: flex; gap: 12px; margin-top: 10px;">
      <div style="flex: 1; background: #f8fafc; padding: 10px; border-radius: 6px; border: 1px solid #cbd5e1;">
        <h4 style="margin: 0 0 4px 0; font-size: 8.5pt; color: #1e3a8a;">Safety Metrics</h4>
        <div style="font-size: 8pt;">• Lighting Index: 85% (Well Lit)</div>
        <div style="font-size: 8pt;">• Police Patrol Density: High</div>
        <div style="font-size: 8pt;">• Emergency Response: &lt; 7 mins</div>
      </div>
      <div style="flex: 1.5; background: #fff7ed; padding: 10px; border-radius: 6px; border: 1px solid #fed7aa;">
        <h4 style="margin: 0 0 4px 0; font-size: 8.5pt; color: #9a3412;">AI Situational Advice</h4>
        <p style="margin: 0; font-size: 7.5pt; color: #475569;">
          "Area is generally safe during metro operational hours (6 AM - 10 PM). Commuters advised to use main station road exit rather than unlit rear alleyways late at night."
        </p>
      </div>
    </div>
  </div>
</div>

<div class="page-break"></div>

<!-- PAGE 15: UI PAGES / SCREENS MOCKUPS (PAGE 2) -->
<div class="header-banner">
  <span>N-SHIELD • Project Documentation</span>
  <span>Section 13: UI Screens &amp; Mockup Specifications (Continued)</span>
</div>

<div class="section-header">
  <div class="section-number">13</div>
  <h2 class="section-title">UI Pages &amp; Screen Mockups (2 of 3)</h2>
</div>

<!-- Screen 3: Category Filter View -->
<div class="mockup-window avoid-break">
  <div class="mockup-header">
    <div class="mockup-dots"><div class="mockup-dot dot-red"></div><div class="mockup-dot dot-yellow"></div><div class="mockup-dot dot-green"></div></div>
    <div>N-SHIELD — Multi-Category Filter Interface</div>
  </div>
  <div class="mockup-body" style="background: #ffffff; padding: 12px;">
    <div style="font-size: 9pt; font-weight: bold; margin-bottom: 8px;">Filter Map Layers by Concern Category:</div>
    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
      <span class="badge badge-blue" style="padding: 6px 12px; cursor: pointer;">✓ All Categories</span>
      <span class="badge badge-red" style="padding: 6px 12px; cursor: pointer;"> Theft &amp; Robbery</span>
      <span class="badge badge-orange" style="padding: 6px 12px; cursor: pointer;"> Unlit Stretches</span>
      <span class="badge badge-blue" style="padding: 6px 12px; cursor: pointer;"> Harassment Hotspots</span>
      <span class="badge badge-green" style="padding: 6px 12px; cursor: pointer;"> Police Patrol Zones</span>
    </div>
    <div style="margin-top: 12px; background: #f8fafc; border: 1px dashed #cbd5e1; padding: 12px; text-anchor: center; font-size: 8pt; color: #64748b; text-align: center;">
      [ Active Map Layer: Displaying 14 verified incident points and 3 patrol routes matching selected criteria ]
    </div>
  </div>
</div>

<!-- Screen 4: Verified News & Safety Feed -->
<div class="mockup-window avoid-break">
  <div class="mockup-header">
    <div class="mockup-dots"><div class="mockup-dot dot-red"></div><div class="mockup-dot dot-yellow"></div><div class="mockup-dot dot-green"></div></div>
    <div>N-SHIELD — Verified Local News &amp; Safety Advisories</div>
  </div>
  <div class="mockup-body" style="background: #f8fafc; padding: 12px;">
    <div style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px; margin-bottom: 8px;">
      <div style="display: flex; justify-content: space-between; font-size: 8pt;">
        <span style="font-weight: bold; color: #2563eb;">Nagpur City Police Advisory</span>
        <span style="color: #64748b;">Today, 14:20 PM • Verified ✓</span>
      </div>
      <div style="font-size: 8.5pt; font-weight: bold; margin: 4px 0;">Special Security Patrols Deployed Near Sitabuldi Metro Station</div>
      <div style="font-size: 7.5pt; color: #475569;">Additional police personnel stationed to assist night commuters during festive season.</div>
    </div>
    <div style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px;">
      <div style="display: flex; justify-content: space-between; font-size: 8pt;">
        <span style="font-weight: bold; color: #ea580c;">Municipal Corporation Alert</span>
        <span style="color: #64748b;">Yesterday, 19:45 PM • Verified ✓</span>
      </div>
      <div style="font-size: 8.5pt; font-weight: bold; margin: 4px 0;">Streetlight Maintenance Work Completed on Wardha Road Stretch</div>
      <div style="font-size: 7.5pt; color: #475569;">Illumination restored along 3.2 km stretch near Chhatrapati Square flyover.</div>
    </div>
  </div>
</div>

<!-- Screen 5: Nearby Emergency Services Finder -->
<div class="mockup-window avoid-break">
  <div class="mockup-header">
    <div class="mockup-dots"><div class="mockup-dot dot-red"></div><div class="mockup-dot dot-yellow"></div><div class="mockup-dot dot-green"></div></div>
    <div>N-SHIELD — Nearby Police &amp; Hospital Emergency Finder</div>
  </div>
  <div class="mockup-body" style="background: #ffffff; padding: 12px;">
    <div style="display: flex; gap: 10px;">
      <div style="flex: 1; border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px; background: #eff6ff;">
        <div style="font-size: 8.5pt; font-weight: bold; color: #1e3a8a;">👮 Sitabuldi Police Station</div>
        <div style="font-size: 7.5pt; color: #475569; margin: 4px 0;">Distance: 0.4 km • Open 24 Hours</div>
        <button style="background: #2563eb; color: white; border: none; padding: 4px 8px; border-radius: 4px; font-size: 7.5pt;">Call: 0712-2522222</button>
      </div>
      <div style="flex: 1; border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px; background: #f0fdf4;">
        <div style="font-size: 8.5pt; font-weight: bold; color: #166534;">🏥 GMC Hospital &amp; Trauma</div>
        <div style="font-size: 7.5pt; color: #475569; margin: 4px 0;">Distance: 1.2 km • ICU Available</div>
        <button style="background: #16a34a; color: white; border: none; padding: 4px 8px; border-radius: 4px; font-size: 7.5pt;">Call: 0712-2744444</button>
      </div>
    </div>
  </div>
</div>

<div class="page-break"></div>

<!-- PAGE 16: UI PAGES / SCREENS MOCKUPS (PAGE 3) -->
<div class="header-banner">
  <span>N-SHIELD • Project Documentation</span>
  <span>Section 13: UI Screens &amp; Mockup Specifications (Continued)</span>
</div>

<div class="section-header">
  <div class="section-number">13</div>
  <h2 class="section-title">UI Pages &amp; Screen Mockups (3 of 3)</h2>
</div>

<!-- Screen 6: One-Tap Emergency SOS Bar -->
<div class="mockup-window avoid-break">
  <div class="mockup-header">
    <div class="mockup-dots"><div class="mockup-dot dot-red"></div><div class="mockup-dot dot-yellow"></div><div class="mockup-dot dot-green"></div></div>
    <div>N-SHIELD — One-Tap Emergency SOS Call Suite</div>
  </div>
  <div class="mockup-body" style="background: #0f172a; padding: 14px; color: white;">
    <div style="text-align: center; font-size: 9pt; font-weight: bold; color: #f97316; margin-bottom: 10px;">
      🚨 DIRECT EMERGENCY CLICK-TO-CALL HOTLINES
    </div>
    <div style="display: flex; gap: 8px; justify-content: center;">
      <button style="background: #ef4444; color: white; border: none; padding: 10px 14px; border-radius: 6px; font-weight: bold; font-size: 8.5pt;">
        📞 112 National
      </button>
      <button style="background: #2563eb; color: white; border: none; padding: 10px 14px; border-radius: 6px; font-weight: bold; font-size: 8.5pt;">
        👮 100 Police
      </button>
      <button style="background: #ec4899; color: white; border: none; padding: 10px 14px; border-radius: 6px; font-weight: bold; font-size: 8.5pt;">
        👩 1091 Women
      </button>
      <button style="background: #10b981; color: white; border: none; padding: 10px 14px; border-radius: 6px; font-weight: bold; font-size: 8.5pt;">
        🚑 102 Ambulance
      </button>
    </div>
  </div>
</div>

<!-- Screen 7: Safer Route Comparison (Future Scope) -->
<div class="mockup-window avoid-break">
  <div class="mockup-header">
    <div class="mockup-dots"><div class="mockup-dot dot-red"></div><div class="mockup-dot dot-yellow"></div><div class="mockup-dot dot-green"></div></div>
    <div>N-SHIELD — Safer Route Recommendation Engine (Future Scope Preview)</div>
  </div>
  <div class="mockup-body" style="background: #ffffff; padding: 12px;">
    <div style="font-size: 8.5pt; font-weight: bold; margin-bottom: 6px;">Origin: VNIT Campus ➔ Destination: Nagpur Railway Station</div>
    <div style="display: flex; gap: 10px;">
      <div style="flex: 1; border: 2px solid #16a34a; border-radius: 6px; padding: 8px; background: #f0fdf4;">
        <span class="badge badge-green">Recommended Safe Route</span>
        <div style="font-weight: bold; font-size: 8.5pt; margin-top: 4px;">Via Wardha Road Main Arterial</div>
        <div style="font-size: 7.5pt; color: #475569;">12.4 km • 24 mins • 95% Illumination</div>
        <div style="font-size: 7pt; color: #15803d; margin-top: 2px;">✓ Continuous Police Patrols &amp; CCTV</div>
      </div>
      <div style="flex: 1; border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px; background: #f8fafc;">
        <span class="badge badge-orange">Shortest Route (Use Caution)</span>
        <div style="font-weight: bold; font-size: 8.5pt; margin-top: 4px;">Via Sub-Arterial Bypass</div>
        <div style="font-size: 7.5pt; color: #475569;">10.8 km • 21 mins • 40% Illumination</div>
        <div style="font-size: 7pt; color: #b45309; margin-top: 2px;">⚠ Unlit Stretches reported after 9 PM</div>
      </div>
    </div>
  </div>
</div>

<!-- Screen 8 & 9: Admin Dashboard & Feedback -->
<div class="mockup-window avoid-break">
  <div class="mockup-header">
    <div class="mockup-dots"><div class="mockup-dot dot-red"></div><div class="mockup-dot dot-yellow"></div><div class="mockup-dot dot-green"></div></div>
    <div>N-SHIELD — Admin Moderation &amp; Crowdsourced Safety Feedback Portal</div>
  </div>
  <div class="mockup-body" style="background: #f8fafc; padding: 12px; font-size: 8pt;">
    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
      <span><strong>Pending Feedback Reports:</strong> 12 Reports</span>
      <span><strong>News Verification Status:</strong> 4 Feeds Active</span>
      <span><strong>System Status:</strong> <span class="badge badge-green">Operational</span></span>
    </div>
    <table style="margin: 0; background: #fff;">
      <thead>
        <tr><th>Report ID</th><th>Location</th><th>Category</th><th>Details</th><th>Action</th></tr>
      </thead>
      <tbody>
        <tr><td>#FB-902</td><td>Hingna T-Point</td><td>Broken Streetlight</td><td>Entire flyover stretch dark</td><td><button style="font-size: 7pt;">Verify &amp; Update Map</button></td></tr>
      </tbody>
    </table>
  </div>
</div>

<div class="page-break"></div>

<!-- PAGE 17: DATABASE DESIGN -->
<div class="header-banner">
  <span>N-SHIELD • Project Documentation</span>
  <span>Section 14: Database Design &amp; Schemas</span>
</div>

<div class="section-header">
  <div class="section-number">14</div>
  <h2 class="section-title">Database Design &amp; Schema Specifications</h2>
</div>

<p>
  N-SHIELD utilizes a hybrid spatial document and relational data structure (MongoDB / PostgreSQL with PostGIS). Below are the core schemas defining the system entities:
</p>

<div class="subsection-title">1. Risk Zones Table / Collection (`risk_zones`)</div>
<table>
  <thead>
    <tr>
      <th style="width: 20%;">Field Name</th>
      <th style="width: 15%;">Data Type</th>
      <th style="width: 20%;">Constraints</th>
      <th style="width: 45%;">Description &amp; Business Rules</th>
    </tr>
  </thead>
  <tbody>
    <tr><td><span class="code-inline">_id / id</span></td><td>ObjectId / UUID</td><td>PRIMARY KEY</td><td>Unique identifier for the risk zone polygon.</td></tr>
    <tr><td><span class="code-inline">zone_name</span></td><td>String</td><td>NOT NULL</td><td>Name of locality (e.g., "Sitabuldi Market Zone").</td></tr>
    <tr><td><span class="code-inline">city</span></td><td>String</td><td>DEFAULT 'Nagpur'</td><td>City jurisdiction for scaling across India.</td></tr>
    <tr><td><span class="code-inline">risk_level</span></td><td>Enum</td><td>'GREEN'|'ORANGE'|'RED'</td><td>Calculated safety rating tier.</td></tr>
    <tr><td><span class="code-inline">risk_score</span></td><td>Integer</td><td>1 TO 100</td><td>Quantitative safety index score.</td></tr>
    <tr><td><span class="code-inline">boundary_geojson</span></td><td>GeoJSON Polygon</td><td>SPATIAL INDEX</td><td>Coordinate polygon defining spatial area boundary.</td></tr>
    <tr><td><span class="code-inline">primary_factors</span></td><td>Array[String]</td><td>NULLABLE</td><td>Key risk factors (e.g., ["unlit_roads", "high_crowd"]).</td></tr>
    <tr><td><span class="code-inline">updated_at</span></td><td>Timestamp</td><td>NOT NULL</td><td>Timestamp of last automated calculation.</td></tr>
  </tbody>
</table>

<div class="subsection-title">2. Locations Master Table (`locations`)</div>
<table>
  <thead>
    <tr>
      <th>Field Name</th>
      <th>Data Type</th>
      <th>Constraints</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr><td><span class="code-inline">location_id</span></td><td>UUID</td><td>PRIMARY KEY</td><td>Unique location ID.</td></tr>
    <tr><td><span class="code-inline">name</span></td><td>String</td><td>NOT NULL</td><td>Locality name (e.g., "Dharampeth").</td></tr>
    <tr><td><span class="code-inline">latitude</span></td><td>Float / Decimal</td><td>-90.0 TO 90.0</td><td>Geographic latitude coordinate.</td></tr>
    <tr><td><span class="code-inline">longitude</span></td><td>Float / Decimal</td><td>-180.0 TO 180.0</td><td>Geographic longitude coordinate.</td></tr>
    <tr><td><span class="code-inline">police_station_id</span></td><td>UUID</td><td>FOREIGN KEY</td><td>Assigned police station jurisdiction.</td></tr>
    <tr><td><span class="code-inline">created_at</span></td><td>Timestamp</td><td>DEFAULT NOW()</td><td>Record creation timestamp.</td></tr>
  </tbody>
</table>

<div class="subsection-title">3. Police Stations Directory Table (`police_stations`)</div>
<table>
  <thead>
    <tr>
      <th>Field Name</th>
      <th>Data Type</th>
      <th>Constraints</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr><td><span class="code-inline">station_id</span></td><td>UUID</td><td>PRIMARY KEY</td><td>Unique police station ID.</td></tr>
    <tr><td><span class="code-inline">station_name</span></td><td>String</td><td>NOT NULL</td><td>Official station name (e.g., "Sadar Police Station").</td></tr>
    <tr><td><span class="code-inline">phone_number</span></td><td>String</td><td>NOT NULL</td><td>Official contact hotline number.</td></tr>
    <tr><td><span class="code-inline">address</span></td><td>Text</td><td>NOT NULL</td><td>Physical street address in Nagpur.</td></tr>
    <tr><td><span class="code-inline">coordinates</span></td><td>GeoJSON Point</td><td>SPATIAL INDEX</td><td>Exact latitude and longitude point location.</td></tr>
    <tr><td><span class="code-inline">is_24x7</span></td><td>Boolean</td><td>DEFAULT TRUE</td><td>Flag indicating round-the-clock operation.</td></tr>
  </tbody>
</table>

<div class="page-break"></div>

<!-- PAGE 18: DATABASE DESIGN CONTINUED -->
<div class="header-banner">
  <span>N-SHIELD • Project Documentation</span>
  <span>Section 14: Database Schemas (Continued)</span>
</div>

<div class="subsection-title">4. Hospitals &amp; Emergency Medical Table (`hospitals`)</div>
<table>
  <thead>
    <tr>
      <th style="width: 20%;">Field Name</th>
      <th style="width: 15%;">Data Type</th>
      <th style="width: 20%;">Constraints</th>
      <th style="width: 45%;">Description</th>
    </tr>
  </thead>
  <tbody>
    <tr><td><span class="code-inline">hospital_id</span></td><td>UUID</td><td>PRIMARY KEY</td><td>Unique hospital record ID.</td></tr>
    <tr><td><span class="code-inline">hospital_name</span></td><td>String</td><td>NOT NULL</td><td>Name of facility (e.g., "GMC Nagpur Trauma Center").</td></tr>
    <tr><td><span class="code-inline">facility_type</span></td><td>Enum</td><td>'HOSPITAL'|'PHARMACY'</td><td>Medical service type.</td></tr>
    <tr><td><span class="code-inline">emergency_contact</span></td><td>String</td><td>NOT NULL</td><td>Direct emergency desk phone number.</td></tr>
    <tr><td><span class="code-inline">coordinates</span></td><td>GeoJSON Point</td><td>SPATIAL INDEX</td><td>Lat/Lng position for proximity queries.</td></tr>
    <tr><td><span class="code-inline">has_trauma_unit</span></td><td>Boolean</td><td>DEFAULT FALSE</td><td>Availability of dedicated emergency trauma care.</td></tr>
  </tbody>
</table>

<div class="subsection-title">5. Verified News &amp; Safety Updates Table (`news_updates`)</div>
<table>
  <thead>
    <tr>
      <th>Field Name</th>
      <th>Data Type</th>
      <th>Constraints</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr><td><span class="code-inline">news_id</span></td><td>UUID</td><td>PRIMARY KEY</td><td>Unique news record identifier.</td></tr>
    <tr><td><span class="code-inline">headline</span></td><td>String</td><td>NOT NULL</td><td>Article title or advisory headline.</td></tr>
    <tr><td><span class="code-inline">ai_summary</span></td><td>Text</td><td>NULLABLE</td><td>Gemini AI-generated 2-bullet summary.</td></tr>
    <tr><td><span class="code-inline">source_name</span></td><td>String</td><td>NOT NULL</td><td>Publisher name (e.g., "Nagpur Police Advisory").</td></tr>
    <tr><td><span class="code-inline">verification_status</span></td><td>Enum</td><td>'VERIFIED'|'PENDING'</td><td>Strict verification flag.</td></tr>
    <tr><td><span class="code-inline">published_at</span></td><td>Timestamp</td><td>NOT NULL</td><td>Publication timestamp.</td></tr>
  </tbody>
</table>

<div class="subsection-title">6. User Feedback &amp; Safety Reports (`user_feedback`)</div>
<table>
  <thead>
    <tr>
      <th>Field Name</th>
      <th>Data Type</th>
      <th>Constraints</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr><td><span class="code-inline">report_id</span></td><td>UUID</td><td>PRIMARY KEY</td><td>Unique crowdsourced feedback ID.</td></tr>
    <tr><td><span class="code-inline">category</span></td><td>Enum</td><td>'UNLIT'|'HAZARD'|'OTHER'</td><td>Category of community report.</td></tr>
    <tr><td><span class="code-inline">coordinates</span></td><td>GeoJSON Point</td><td>NOT NULL</td><td>Reported location coordinates.</td></tr>
    <tr><td><span class="code-inline">description</span></td><td>Text</td><td>NOT NULL</td><td>Anonymous issue description.</td></tr>
    <tr><td><span class="code-inline">status</span></td><td>Enum</td><td>'SUBMITTED'|'VERIFIED'</td><td>Admin review status.</td></tr>
  </tbody>
</table>

<!-- PAGE 19: API DESIGN -->
<div class="section-header" style="margin-top: 30px;">
  <div class="section-number">15</div>
  <h2 class="section-title">API Design &amp; REST Endpoint Specifications</h2>
</div>

<p>
  N-SHIELD exposes clean, RESTful JSON API endpoints for integration across web clients, mobile apps, and municipal data sinks:
</p>

<div class="subsection-title">Endpoint 1: GET /api/risk-zones</div>
<p><strong>Purpose:</strong> Fetches GeoJSON polygon array of all defined safety risk zones in Nagpur.</p>
<pre>{
  "success": true,
  "count": 3,
  "zones": [
    {
      "id": "zone-ngp-001",
      "zone_name": "Sitabuldi Market Zone",
      "risk_level": "ORANGE",
      "risk_score": 68,
      "coordinates": [[[79.082, 21.142], [79.091, 21.142], [79.091, 21.149], [79.082, 21.149]]]
    }
  ]
}</pre>

<div class="page-break"></div>

<!-- PAGE 20: API DESIGN CONTINUED -->
<div class="header-banner">
  <span>N-SHIELD • Project Documentation</span>
  <span>Section 15: REST API Specifications (Continued)</span>
</div>

<div class="subsection-title">Endpoint 2: GET /api/location-safety</div>
<p><strong>Purpose:</strong> Query safety insights, Gemini AI summaries, and nearby services for a latitude/longitude point.</p>
<p><strong>Parameters:</strong> <span class="code-inline">lat=21.1458&amp;lng=79.0882</span></p>
<pre>{
  "success": true,
  "location": "Sitabuldi Main Market",
  "risk_assessment": {
    "level": "ORANGE",
    "score": 68,
    "primary_factors": ["High Evening Density", "Moderate Patrols"]
  },
  "ai_summary": {
    "summary_bullets": [
      "High commercial activity during peak metro operating hours.",
      "Commuters recommended to stick to lit main station corridors late at night."
    ],
    "generated_at": "2026-09-09T14:30:00Z"
  }
}</pre>

<div class="subsection-title">Endpoint 3: GET /api/police-stations</div>
<p><strong>Purpose:</strong> Fetch nearest police station details based on proximity.</p>
<pre>{
  "success": true,
  "police_stations": [
    {
      "station_name": "Sitabuldi Police Station",
      "distance_km": 0.4,
      "phone": "0712-2522222",
      "address": "Near Station Road, Sitabuldi, Nagpur"
    }
  ]
}</pre>

<div class="subsection-title">Endpoint 4: GET /api/hospitals</div>
<p><strong>Purpose:</strong> Fetch nearby trauma centers and emergency pharmacies.</p>
<pre>{
  "success": true,
  "hospitals": [
    {
      "name": "Government Medical College & Hospital (GMC)",
      "facility_type": "HOSPITAL",
      "distance_km": 1.2,
      "emergency_phone": "0712-2744444",
      "trauma_available": true
    }
  ]
}</pre>

<div class="subsection-title">Endpoint 5: POST /api/feedback</div>
<p><strong>Purpose:</strong> Submit anonymous crowdsourced community safety reports.</p>
<pre>// Request Payload:
{
  "category": "UNLIT_STREET",
  "latitude": 21.1350,
  "longitude": 79.0620,
  "description": "Streetlights non-functional on 200m stretch near flyover pillar 14."
}

// Response:
{
  "success": true,
  "message": "Report logged successfully. Thank you for contributing to Nagpur safety.",
  "report_id": "FB-90234"
}</pre>

<!-- PAGE 21: INNOVATION & UNIQUENESS -->
<div class="section-header" style="margin-top: 30px;">
  <div class="section-number">16</div>
  <h2 class="section-title">Innovation &amp; Uniqueness</h2>
</div>

<p>
  N-SHIELD stands apart from standard navigation apps and static government portals through six structural innovations:
</p>

<table class="avoid-break">
  <thead>
    <tr>
      <th style="width: 25%;">Innovation Pillar</th>
      <th style="width: 35%;">Standard Existing Tools</th>
      <th style="width: 40%;">N-SHIELD Differentiation</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>1. Context Beyond Traffic</strong></td>
      <td>Optimize purely for travel distance and traffic delays.</td>
      <td>Evaluates spatial lighting, emergency density, and safety incidents along corridors.</td>
    </tr>
    <tr>
      <td><strong>2. Plain-Language AI Summarization</strong></td>
      <td>Publish raw PDF tables of annual crime statistics.</td>
      <td>Generates instant, easy-to-understand 2-bullet AI situation summaries for citizens.</td>
    </tr>
    <tr>
      <td><strong>3. Citizen-First Dashboard</strong></td>
      <td>Official portals built for administrative personnel.</td>
      <td>Clean, modern mobile PWA designed for everyday commuters, students, and families.</td>
    </tr>
    <tr>
      <td><strong>4. Unified Emergency Directory</strong></td>
      <td>Contacts hidden across multiple non-responsive websites.</td>
      <td>One-tap direct SOS calling for police, medical, fire, and helpline hotlines.</td>
    </tr>
    <tr>
      <td><strong>5. Responsible AI Governance</strong></td>
      <td>Aggressive algorithmic profiling or sensationalized news headlines.</td>
      <td>Strict non-predictive, privacy-safe, transparent, anti-bias AI framework.</td>
    </tr>
    <tr>
      <td><strong>6. Localized Smart City Scalability</strong></td>
      <td>Generic global tools lacking hyper-local city focus.</td>
      <td>Tailored specifically for Nagpur initially, built on a modular template ready for pan-India expansion.</td>
    </tr>
  </tbody>
</table>

<div class="page-break"></div>

<!-- PAGE 22: FUND MY CRAZY CATEGORY EXPLANATION -->
<div class="header-banner">
  <span>N-SHIELD • Project Documentation</span>
  <span>Section 17: Fund My Crazy Innovation Rationale</span>
</div>

<div class="section-header">
  <div class="section-number">17</div>
  <h2 class="section-title">Fund My Crazy Category Explanation</h2>
</div>

<div class="card-info avoid-break">
  <h3 style="margin: 0 0 6px 0; color: #1e3a8a; font-size: 12pt;">SELECTED CATEGORY: COMMUNITY &amp; LIVING</h3>
  <p style="margin: 0; font-size: 10pt;">
    N-SHIELD directly addresses the fundamental human need for safety, security, and peace of mind within urban living environments.
  </p>
</div>

<div class="subsection-title">Why Community &amp; Living?</div>
<p>
  Urban safety is not an abstract statistical concept—it is a daily lived reality. Every single day, thousands of students, late-shift IT workers, healthcare personnel, and families in Nagpur make decisions about when to travel, which road to take, and where to walk. By providing transparent, accessible safety intelligence, N-SHIELD directly elevates the quality of community living, fosters public trust, and promotes urban mobility.
</p>

<div class="subsection-title">Why Now? The Convergence of Tech &amp; Urban Growth</div>
<ul>
  <li><strong>Rapid Smart City Growth:</strong> Nagpur is undergoing rapid infrastructure expansion (Metro Rail, MIHAN IT Hub, Ring Road developments). Citizens urgently require smart safety tools matching this growth.</li>
  <li><strong>Ubiquitous Smartphone &amp; 5G Access:</strong> High mobile data penetration in tier-2 Indian cities enables instant delivery of location-based mapping tools to citizens on the go.</li>
  <li><strong>Breakthroughs in Generative AI:</strong> AI models like Google Gemini can now summarize scattered public news feeds accurately in real-time, making automated synthesis viable for the first time.</li>
  <li><strong>Demand for Transparent Civic Data:</strong> Modern Indian citizens expect smart city initiatives to deliver practical, direct-to-citizen digital services.</li>
</ul>

<!-- PAGE 23: FUTURE SCOPE -->
<div class="section-header" style="margin-top: 30px;">
  <div class="section-number">18</div>
  <h2 class="section-title">Future Scope &amp; Roadmap</h2>
</div>

<div class="subsection-title">Planned Technological Innovations</div>
<ol>
  <li><strong>Safer Route Navigation Engine:</strong> Full integration of risk polygons with Google Directions API to automatically calculate and highlight the safest alternative travel path.</li>
  <li><strong>Real-Time Police &amp; Municipal Portal Integration:</strong> Official API data hooks with Nagpur Municipal Corporation (NMC) and Police Control Rooms for live verified advisories.</li>
  <li><strong>Multi-Language Accessibility Support:</strong> Native localization in <strong>English, Hindi (हिंदी), and Marathi (मराठी)</strong> to serve all demographic segments in Nagpur.</li>
  <li><strong>Moderated Crowdsourced Reporting:</strong> Citizen reporting portal for unlit streetlights, road hazards, or low-patrol zones with automated spam filtering and admin moderation.</li>
  <li><strong>Native Mobile Applications (Android &amp; iOS):</strong> Packaging PWA codebase into Flutter/React Native builds with background push notification support for urgent area alerts.</li>
  <li><strong>Smartwatch Emergency SOS Companion App:</strong> One-touch SOS trigger for Wear OS and Apple Watch devices transmitting real-time GPS coordinates to emergency contacts.</li>
  <li><strong>Expanded City Coverage:</strong> Cloning N-SHIELD framework to deploy for Pune, Nashik, Chhatrapati Sambhajinagar, Thane, and Mumbai metro regions.</li>
  <li><strong>Advanced Time-Series Incident Analysis:</strong> Long-term trend analysis models identifying seasonal or hourly safety patterns to assist civic planning.</li>
  <li><strong>Off-Grid SMS Emergency Trigger:</strong> SMS fallback integration allowing citizens to fetch nearest police station contacts even without active internet connectivity.</li>
</ol>

<div class="page-break"></div>

<!-- PAGE 24: LIMITATIONS -->
<div class="header-banner">
  <span>N-SHIELD • Project Documentation</span>
  <span>Section 19: Limitations &amp; Technical Constraints</span>
</div>

<div class="section-header">
  <div class="section-number">19</div>
  <h2 class="section-title">Limitations &amp; Technical Constraints</h2>
</div>

<p>
  In the interest of academic integrity and engineering rigor, the current version of N-SHIELD operates within the following defined constraints:
</p>

<table class="avoid-break">
  <thead>
    <tr>
      <th style="width: 30%;">Limitation Area</th>
      <th style="width: 70%;">Technical &amp; Operational Reality</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>1. Public Data Dependency</strong></td>
      <td>Accuracy of risk zones depends directly on the availability, timeliness, and granularity of public incident reports and news feeds.</td>
    </tr>
    <tr>
      <td><strong>2. Non-Predictive Boundary</strong></td>
      <td>System provides spatial risk guidance based on historical and aggregated data; it cannot predict isolated, random individual crimes.</td>
    </tr>
    <tr>
      <td><strong>3. Official Response Reliance</strong></td>
      <td>N-SHIELD facilitates rapid dialing to emergency services but does not control official emergency dispatch response times.</td>
    </tr>
    <tr>
      <td><strong>4. News Verification Overhead</strong></td>
      <td>To prevent misinformation, news updates require automated or admin verification before map publishing, introducing a minor ingestion lag.</td>
    </tr>
    <tr>
      <td><strong>5. GPS Connectivity Requirement</strong></td>
      <td>Interactive mapping and location-based proximity queries require active client GPS and internet connection.</td>
    </tr>
  </tbody>
</table>

<!-- PAGE 25: CONCLUSION -->
<div class="section-header" style="margin-top: 30px;">
  <div class="section-number">20</div>
  <h2 class="section-title">Conclusion</h2>
</div>

<p>
  <strong>N-SHIELD (AI-Powered Urban Safety Intelligence)</strong> represents a transformative approach to smart city safety management for Nagpur. By bridging the gap between scattered public safety data, spatial mapping technologies, and responsible generative AI summarization, N-SHIELD places actionable safety intelligence directly into the hands of everyday citizens.
</p>

<p>
  Whether assisting a student commuting late from university, a woman professional navigating evening transit from MIHAN IT Park, or a visitor arriving at Nagpur Railway Station, N-SHIELD delivers rapid clarity, essential service access, and peace of mind. Built upon modern web standards (Next.js, TypeScript, Google Maps API, Gemini AI) and guided by strict privacy and anti-bias principles, N-SHIELD serves as a powerful, scalable blueprint for urban safety across Nagpur, Maharashtra, and India.
</p>

<div class="card-info avoid-break" style="margin-top: 20px; text-align: center;">
  <strong style="font-size: 11pt; color: #1e3a8a;">N-SHIELD: Empowering Nagpur Citizens Through Intelligent Safety Science</strong>
</div>

<div class="page-break"></div>

<!-- PAGE 26: GLOSSARY & REFERENCES -->
<div class="header-banner">
  <span>N-SHIELD • Project Documentation</span>
  <span>Glossary &amp; References</span>
</div>

<div class="section-header">
  <div class="section-number">A</div>
  <h2 class="section-title">Glossary of Technical &amp; Domain Terms</h2>
</div>

<ul>
  <li><strong>GeoJSON:</strong> An open standard format for encoding a variety of geographic data structures using JavaScript Object Notation.</li>
  <li><strong>Spatial Indexing:</strong> Database optimization techniques (e.g., PostGIS R-Tree) that allow high-speed spatial queries like "find points within polygon".</li>
  <li><strong>Gemini 1.5 Flash:</strong> Lightweight, low-latency multimodal LLM developed by Google optimized for fast text summarization.</li>
  <li><strong>PWA (Progressive Web App):</strong> Web applications built using modern web APIs to deliver app-like experiences on desktop and mobile.</li>
  <li><strong>SSR (Server-Side Rendering):</strong> Technique where HTML pages are generated on the server for each request, delivering faster initial page loads.</li>
  <li><strong>Click-to-Call (tel:):</strong> URI scheme enabling mobile browsers to initiate cellular phone calls directly from webpage buttons.</li>
  <li><strong>Risk Zone Polygon:</strong> A series of connected GPS coordinate points forming a bounded geographic area on a map representing a specific risk level.</li>
</ul>

<div class="section-header" style="margin-top: 30px;">
  <div class="section-number">B</div>
  <h2 class="section-title">References &amp; Developer Resources</h2>
</div>

<ol>
  <li><strong>Google Maps JavaScript API Documentation:</strong> <span class="code-inline">https://developers.google.com/maps/documentation/javascript</span></li>
  <li><strong>Next.js Framework &amp; App Router Architecture:</strong> <span class="code-inline">https://nextjs.org/docs</span></li>
  <li><strong>Google Gemini API Documentation:</strong> <span class="code-inline">https://ai.google.dev/docs</span></li>
  <li><strong>MongoDB Spatial &amp; Geospatial Queries:</strong> <span class="code-inline">https://www.mongodb.com/docs/manual/geospatial-queries/</span></li>
  <li><strong>PostgreSQL + PostGIS Spatial Database Extension:</strong> <span class="code-inline">https://postgis.net/documentation/</span></li>
  <li><strong>Nagpur Municipal Corporation (NMC) Official Portal:</strong> <span class="code-inline">https://www.nmcnagpur.gov.in/</span></li>
  <li><strong>Nagpur City Police Portal &amp; Advisories:</strong> <span class="code-inline">https://nagpurpolice.gov.in/</span></li>
  <li><strong>Tailwind CSS Documentation:</strong> <span class="code-inline">https://tailwindcss.com/docs</span></li>
</ol>

<div class="page-break"></div>

<!-- PAGE 27: PROJECT AT A GLANCE (ONE-PAGER) -->
<div class="header-banner">
  <span>N-SHIELD • Executive One-Pager</span>
  <span>Project at a Glance Summary Sheet</span>
</div>

<div style="border: 2px solid #0f172a; border-radius: 10px; padding: 20px; background: #ffffff;">
  <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #f97316; padding-bottom: 10px;">
    <div>
      <h1 style="margin: 0; font-size: 24pt; color: #0f172a; font-weight: 900;">N-SHIELD</h1>
      <div style="font-size: 11pt; color: #2563eb; font-weight: bold;">AI-Powered Urban Safety Intelligence</div>
    </div>
    <div style="text-align: right;">
      <span class="badge badge-orange" style="font-size: 9pt; padding: 6px 12px;">Nagpur, Maharashtra</span>
      <div style="font-size: 8.5pt; color: #64748b; margin-top: 4px;">Prepared by: Khushal Deogade</div>
    </div>
  </div>

  <div style="display: flex; gap: 15px; margin-top: 15px;">
    <div style="flex: 1; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 12px;">
      <h3 style="margin: 0 0 6px 0; font-size: 10pt; color: #1e3a8a; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px;">THE PROBLEM</h3>
      <p style="margin: 0; font-size: 8.5pt; color: #475569;">
        Fragmented safety data across Nagpur makes it difficult for citizens to understand neighborhood safety before traveling. Navigation apps ignore safety factors like lighting and emergency access.
      </p>
    </div>
    <div style="flex: 1; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 12px;">
      <h3 style="margin: 0 0 6px 0; font-size: 10pt; color: #1e3a8a; border-bottom: 1px solid #bfdbfe; padding-bottom: 4px;">THE SOLUTION</h3>
      <p style="margin: 0; font-size: 8.5pt; color: #1e40af;">
        An interactive smart city safety dashboard combining Google Maps spatial risk layers (Green/Orange/Red), one-tap emergency services finder, verified news feeds, and Gemini AI safety summaries.
      </p>
    </div>
  </div>

  <div style="margin-top: 15px;">
    <h3 style="margin: 0 0 8px 0; font-size: 10.5pt; color: #0f172a; border-left: 4px solid #f97316; padding-left: 8px;">KEY HIGHLIGHTS &amp; ARCHITECTURE</h3>
    <table style="margin: 0; font-size: 8.5pt;">
      <tr>
        <td style="width: 25%; font-weight: bold; background: #f1f5f9;">Tech Stack</td>
        <td>Next.js, TypeScript, Tailwind CSS, Google Maps API, Gemini AI, MongoDB/Postgres, Vercel</td>
      </tr>
      <tr>
        <td style="font-weight: bold; background: #f1f5f9;">Target Users</td>
        <td>Students, Women Commuters, Night Shift Professionals, Senior Citizens, Tourists, Families</td>
      </tr>
      <tr>
        <td style="font-weight: bold; background: #f1f5f9;">Core Features</td>
        <td>Risk Map, Category Filters, Emergency Locator (Police/Hospitals), One-Tap SOS, AI Summaries</td>
      </tr>
      <tr>
        <td style="font-weight: bold; background: #f1f5f9;">Responsible AI</td>
        <td>Strictly non-predictive, privacy-safe (zero PII storage), anti-bias, transparent source tracking</td>
      </tr>
    </table>
  </div>

  <div style="margin-top: 15px; background: #fff7ed; border: 1px solid #fed7aa; border-radius: 6px; padding: 12px;">
    <h3 style="margin: 0 0 4px 0; font-size: 10pt; color: #9a3412;">FUND MY CRAZY COMPETITION IMPACT STATEMENT</h3>
    <p style="margin: 0; font-size: 8.5pt; color: #9a3412;">
      Selected Category: <strong>Community &amp; Living</strong>. N-SHIELD converts complex, scattered public safety signals into intuitive daily spatial intelligence, fostering civic trust, safe mobility, and community resilience in Nagpur with immediate scalability across India.
    </p>
  </div>
</div>

</body>
</html>
"""

with open("n_shield_doc.html", "w", encoding="utf-8") as f:
    f.write(html_content)

print("n_shield_doc.html generated successfully.")

# Run Edge Headless PDF export
edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
html_abs_path = os.path.abspath("n_shield_doc.html").replace("\\", "/")
pdf_output_path = os.path.abspath("N_SHIELD_Complete_Project_Documentation.pdf")

cmd = [
    edge_path,
    "--headless",
    "--no-pdf-header-footer",
    f"--print-to-pdf={pdf_output_path}",
    f"file:///{html_abs_path}"
]

print("Launching Edge to convert HTML to PDF...")
result = subprocess.run(cmd, capture_output=True, text=True)

if os.path.exists(pdf_output_path):
    print(f"SUCCESS: Generated PDF at {pdf_output_path}")
    print(f"File size: {os.path.getsize(pdf_output_path)} bytes")
else:
    print("PDF generation failed.")
    print("Stderr:", result.stderr)
