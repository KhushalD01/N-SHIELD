const PptxGenJS = require("pptxgenjs");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

console.log("Starting presentation generation...");

// --- PPTX GENERATION ---
async function buildPptx() {
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_16x9"; // 13.33 x 7.5 inches
  pptx.title = "N-SHIELD: AI-Driven Urban Safety Intelligence & Command Center";
  pptx.subject = "Smart City & Urban Safety Competition Presentation";
  pptx.author = "N-SHIELD Team";

  // Color Palette Constants
  const BG_DARK = "0B0F19";
  const CARD_BG = "151C2C";
  const CARD_BORDER = "1E293B";
  const TEXT_WHITE = "FFFFFF";
  const TEXT_MUTED = "94A3B8";
  const ACCENT_CYAN = "00F0FF";
  const ACCENT_EMERALD = "10B981";
  const ACCENT_AMBER = "F59E0B";
  const ACCENT_RED = "EF4444";
  const BLUE_TEXT = "38BDF8";

  // Helper function to add slide background and standard header
  function createBaseSlide(titleText, categoryText) {
    const slide = pptx.addSlide();
    slide.background = { color: BG_DARK };

    // Top Category & Header
    if (categoryText) {
      slide.addText(categoryText.toUpperCase(), {
        x: 0.8,
        y: 0.4,
        w: 11.5,
        h: 0.3,
        fontSize: 10,
        bold: true,
        color: ACCENT_CYAN,
        fontFace: "Arial",
      });
    }

    slide.addText(titleText, {
      x: 0.8,
      y: 0.7,
      w: 11.5,
      h: 0.6,
      fontSize: 22,
      bold: true,
      color: TEXT_WHITE,
      fontFace: "Arial",
    });

    // Subheader Line / Divider
    slide.addShape("line", {
      x: 0.8,
      y: 1.35,
      w: 11.7,
      h: 0,
      line: { color: "1E293B", width: 1 },
    });

    // Footer
    slide.addText("N-SHIELD | AI-Driven Urban Safety Intelligence & Command Center (Nagpur Pilot)", {
      x: 0.8,
      y: 7.0,
      w: 8.0,
      h: 0.3,
      fontSize: 9,
      color: TEXT_MUTED,
      fontFace: "Arial",
    });

    return slide;
  }

  // ==========================================
  // SLIDE 1: TITLE & HERO
  // ==========================================
  const slide1 = pptx.addSlide();
  slide1.background = { color: BG_DARK };

  // Decorative Top Accent Bar
  slide1.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 13.33,
    h: 0.15,
    fill: { color: ACCENT_CYAN },
  });

  // Hero Card Container
  slide1.addShape(pptx.ShapeType.roundRect, {
    x: 1.0,
    y: 1.0,
    w: 11.33,
    h: 5.5,
    rectRadius: 0.2,
    fill: { color: CARD_BG },
    line: { color: CARD_BORDER, width: 1.5 },
  });

  // Badge Tag
  slide1.addShape(pptx.ShapeType.roundRect, {
    x: 1.5,
    y: 1.5,
    w: 3.2,
    h: 0.4,
    rectRadius: 0.1,
    fill: { color: "0F2942" },
    line: { color: ACCENT_CYAN, width: 1 },
  });
  slide1.addText("SYSTEM STATUS: ACTIVE | PILOT DEMO", {
    x: 1.5,
    y: 1.5,
    w: 3.2,
    h: 0.4,
    fontSize: 9,
    bold: true,
    color: ACCENT_CYAN,
    align: "center",
  });

  // Main Title & Subtitle
  slide1.addText("N-SHIELD", {
    x: 1.5,
    y: 2.1,
    w: 10.3,
    h: 1.1,
    fontSize: 54,
    bold: true,
    color: TEXT_WHITE,
    fontFace: "Arial",
  });

  slide1.addText("AI-Driven Urban Safety Intelligence & Command Center", {
    x: 1.5,
    y: 3.2,
    w: 10.3,
    h: 0.6,
    fontSize: 22,
    bold: true,
    color: BLUE_TEXT,
    fontFace: "Arial",
  });

  slide1.addText("Turning fragmented city safety data into real-time actionable intelligence.", {
    x: 1.5,
    y: 3.8,
    w: 9.5,
    h: 0.5,
    fontSize: 14,
    color: TEXT_MUTED,
    fontFace: "Arial",
  });

  // Key Information Grid (3 mini cards)
  const infoCards = [
    { label: "PILOT GEOGRAPHY", val: "Nagpur, Maharashtra (6 Sectors)", color: ACCENT_CYAN },
    { label: "CORE TECH", val: "Next.js 16 + Mapbox 3D + Deck.gl", color: ACCENT_EMERALD },
    { label: "TARGET USERS", val: "Police 112, Municipalities & Citizens", color: ACCENT_AMBER },
  ];

  infoCards.forEach((c, idx) => {
    const xPos = 1.5 + idx * 3.6;
    slide1.addShape(pptx.ShapeType.roundRect, {
      x: xPos,
      y: 4.6,
      w: 3.3,
      h: 1.3,
      rectRadius: 0.1,
      fill: { color: "0B0F19" },
      line: { color: CARD_BORDER, width: 1 },
    });
    slide1.addText(c.label, {
      x: xPos + 0.2,
      y: 4.8,
      w: 2.9,
      h: 0.3,
      fontSize: 9,
      bold: true,
      color: c.color,
    });
    slide1.addText(c.val, {
      x: xPos + 0.2,
      y: 5.15,
      w: 2.9,
      h: 0.6,
      fontSize: 11,
      bold: true,
      color: TEXT_WHITE,
    });
  });

  // ==========================================
  // SLIDE 2: THE PROBLEM
  // ==========================================
  const slide2 = createBaseSlide("Fragmented Safety Infrastructure & Delayed Emergency Response", "THE PROBLEM");

  // Problem Cards Grid (2x2 Layout)
  const problems = [
    {
      title: "Disconnected Data Silos",
      desc: "Police FIR records, municipal CCTV camera feeds, citizen emergency calls (112), and streetlight lighting indices operate in complete isolation without a unified view.",
      stat: "4+ Siloed Systems",
      color: ACCENT_RED,
    },
    {
      title: "Reactive Patrol Allocation",
      desc: "Police PCR vans and patrol units are assigned statically based on traditional beat boundaries rather than real-time dynamic spatial crime threat density.",
      stat: "Static Deployment",
      color: ACCENT_AMBER,
    },
    {
      title: "Unmonitored Surveillance Blind Spots",
      desc: "Authorities lack spatial visibility into CCTV coverage gaps across high-risk corridors, leading to inefficient camera installation decisions based on guesswork.",
      stat: "~40% Unmonitored",
      color: ACCENT_RED,
    },
    {
      title: "Uninformed Citizen Navigation",
      desc: "Conventional GPS navigation applications optimize purely for distance and travel time, routing pedestrians and commuters through unlit and unsafe nighttime alleys.",
      stat: "Zero Safety Factors",
      color: ACCENT_AMBER,
    },
  ];

  problems.forEach((p, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const xPos = 0.8 + col * 5.95;
    const yPos = 1.6 + row * 2.6;

    slide2.addShape(pptx.ShapeType.roundRect, {
      x: xPos,
      y: yPos,
      w: 5.75,
      h: 2.4,
      rectRadius: 0.15,
      fill: { color: CARD_BG },
      line: { color: CARD_BORDER, width: 1 },
    });

    slide2.addShape(pptx.ShapeType.rect, {
      x: xPos,
      y: yPos,
      w: 0.1,
      h: 2.4,
      fill: { color: p.color },
    });

    slide2.addText(p.title, {
      x: xPos + 0.3,
      y: yPos + 0.2,
      w: 3.5,
      h: 0.4,
      fontSize: 16,
      bold: true,
      color: TEXT_WHITE,
    });

    slide2.addShape(pptx.ShapeType.roundRect, {
      x: xPos + 3.8,
      y: yPos + 0.2,
      w: 1.7,
      h: 0.35,
      rectRadius: 0.08,
      fill: { color: "0F172A" },
      line: { color: p.color, width: 1 },
    });

    slide2.addText(p.stat, {
      x: xPos + 3.8,
      y: yPos + 0.2,
      w: 1.7,
      h: 0.35,
      fontSize: 9,
      bold: true,
      color: p.color,
      align: "center",
    });

    slide2.addText(p.desc, {
      x: xPos + 0.3,
      y: yPos + 0.7,
      w: 5.2,
      h: 1.5,
      fontSize: 11,
      color: TEXT_MUTED,
    });
  });

  // ==========================================
  // SLIDE 3: THE CORE IDEA
  // ==========================================
  const slide3 = createBaseSlide("A Unified Intelligence Layer Over City Infrastructure", "THE CORE IDEA");

  // Central Architecture Card
  slide3.addShape(pptx.ShapeType.roundRect, {
    x: 0.8,
    y: 1.6,
    w: 11.7,
    h: 5.1,
    rectRadius: 0.15,
    fill: { color: CARD_BG },
    line: { color: CARD_BORDER, width: 1 },
  });

  // Left Section: Input Sources
  slide3.addText("INCOMING CITY DATA FEEDS", {
    x: 1.1,
    y: 1.9,
    w: 3.3,
    h: 0.3,
    fontSize: 11,
    bold: true,
    color: ACCENT_CYAN,
  });

  const inputs = [
    "Crime Incident Reports (Categorized & Severity Weighted)",
    "Municipal CCTV Camera Nodes & Operational Status",
    "Police Patrol Unit GPS Telemetry (PCR Vans, Bikes)",
    "Streetlight Lighting Indices & Time-of-Day Factors",
    "Mass Gathering & Public Event Metadata",
  ];

  inputs.forEach((inp, idx) => {
    slide3.addShape(pptx.ShapeType.roundRect, {
      x: 1.1,
      y: 2.3 + idx * 0.8,
      w: 3.4,
      h: 0.65,
      rectRadius: 0.08,
      fill: { color: "0B0F19" },
      line: { color: CARD_BORDER, width: 1 },
    });
    slide3.addText(`• ${inp}`, {
      x: 1.2,
      y: 2.3 + idx * 0.8,
      w: 3.2,
      h: 0.65,
      fontSize: 9.5,
      color: TEXT_WHITE,
    });
  });

  // Center Arrow
  slide3.addText("➔", {
    x: 4.6,
    y: 3.8,
    w: 0.6,
    h: 0.6,
    fontSize: 28,
    color: ACCENT_CYAN,
    align: "center",
  });

  // Middle Section: N-SHIELD Engine
  slide3.addShape(pptx.ShapeType.roundRect, {
    x: 5.2,
    y: 1.9,
    w: 3.4,
    h: 4.4,
    rectRadius: 0.12,
    fill: { color: "0F2942" },
    line: { color: ACCENT_CYAN, width: 1.5 },
  });

  slide3.addText("N-SHIELD INTELLIGENCE ENGINE", {
    x: 5.3,
    y: 2.1,
    w: 3.2,
    h: 0.4,
    fontSize: 12,
    bold: true,
    color: ACCENT_CYAN,
    align: "center",
  });

  const engines = [
    "Algorithmic Risk Heatmapping (0-100 Score)",
    "Explainable AI (XAI) Tactical Directives",
    "CCTV Coverage Gap & Blind Spot Analytics",
    "Police Force Deficit & Reallocation Engine",
    "Predictive Event Impact Simulator",
    "AI Safe Night Route Evaluator",
  ];

  engines.forEach((eng, idx) => {
    slide3.addText(`[ ${eng} ]`, {
      x: 5.4,
      y: 2.6 + idx * 0.58,
      w: 3.0,
      h: 0.45,
      fontSize: 9.5,
      bold: true,
      color: TEXT_WHITE,
      align: "center",
    });
  });

  // Right Arrow
  slide3.addText("➔", {
    x: 8.7,
    y: 3.8,
    w: 0.6,
    h: 0.6,
    fontSize: 28,
    color: ACCENT_EMERALD,
    align: "center",
  });

  // Right Section: Output Actionable Interfaces
  slide3.addText("ACTIONABLE COMMAND OUTPUTS", {
    x: 9.3,
    y: 1.9,
    w: 3.0,
    h: 0.3,
    fontSize: 11,
    bold: true,
    color: ACCENT_EMERALD,
  });

  const outputs = [
    "3D Digital Twin Command Dashboard for Authorities",
    "1-Click Force Reallocation & Patrol Directives",
    "Citizen Safe Route Navigation & Night Safety Mode",
    "1-Tap Multi-Department SOS Emergency Dispatch",
  ];

  outputs.forEach((out, idx) => {
    slide3.addShape(pptx.ShapeType.roundRect, {
      x: 9.3,
      y: 2.3 + idx * 1.0,
      w: 2.9,
      h: 0.85,
      rectRadius: 0.08,
      fill: { color: "0B0F19" },
      line: { color: ACCENT_EMERALD, width: 1 },
    });
    slide3.addText(out, {
      x: 9.4,
      y: 2.4 + idx * 1.0,
      w: 2.7,
      h: 0.65,
      fontSize: 10,
      bold: true,
      color: TEXT_WHITE,
    });
  });

  // ==========================================
  // SLIDE 4: SYSTEM WORKFLOW & PIPELINE
  // ==========================================
  const slide4 = createBaseSlide("End-to-End Operational System Workflow", "SYSTEM WORKFLOW");

  const workflowSteps = [
    {
      num: "01",
      title: "Data Ingestion",
      desc: "Ingests spatial incidents, CCTV status, patrol locations, lighting indices, and mass event data across Nagpur's 6 administrative sectors.",
      status: "ACTIVE",
    },
    {
      num: "02",
      title: "AI & Risk Computation",
      desc: "Executes weighted multi-factor risk engine (R_zone), CCTV blind-spot clustering, and XAI directive generation.",
      status: "COMPUTING",
    },
    {
      num: "03",
      title: "Command Center GIS",
      desc: "Visualizes GPU-accelerated risk heatmaps, interactive markers, force deficit meters, and event simulation scenarios.",
      status: "VISUALIZING",
    },
    {
      num: "04",
      title: "Targeted Dispatch & Action",
      desc: "Outputs 1-click patrol reallocation to police, targeted CCTV expansion plans, and citizen safe route recommendations.",
      status: "DISPATCHING",
    },
  ];

  workflowSteps.forEach((s, idx) => {
    const xPos = 0.8 + idx * 2.95;
    slide4.addShape(pptx.ShapeType.roundRect, {
      x: xPos,
      y: 1.8,
      w: 2.8,
      h: 4.8,
      rectRadius: 0.12,
      fill: { color: CARD_BG },
      line: { color: CARD_BORDER, width: 1 },
    });

    slide4.addText(s.num, {
      x: xPos + 0.2,
      y: 2.0,
      w: 2.4,
      h: 0.6,
      fontSize: 32,
      bold: true,
      color: ACCENT_CYAN,
    });

    slide4.addText(s.title, {
      x: xPos + 0.2,
      y: 2.7,
      w: 2.4,
      h: 0.5,
      fontSize: 14,
      bold: true,
      color: TEXT_WHITE,
    });

    slide4.addShape(pptx.ShapeType.line, {
      x: xPos + 0.2,
      y: 3.3,
      w: 2.4,
      h: 0,
      line: { color: CARD_BORDER, width: 1 },
    });

    slide4.addText(s.desc, {
      x: xPos + 0.2,
      y: 3.5,
      w: 2.4,
      h: 2.2,
      fontSize: 10.5,
      color: TEXT_MUTED,
    });

    slide4.addShape(pptx.ShapeType.roundRect, {
      x: xPos + 0.2,
      y: 5.9,
      w: 2.4,
      h: 0.4,
      rectRadius: 0.08,
      fill: { color: "0F2942" },
      line: { color: ACCENT_CYAN, width: 1 },
    });

    slide4.addText(`STAGE STATUS: ${s.status}`, {
      x: xPos + 0.2,
      y: 5.9,
      w: 2.4,
      h: 0.4,
      fontSize: 8.5,
      bold: true,
      color: ACCENT_CYAN,
      align: "center",
    });
  });

  // ==========================================
  // SLIDE 5: LIVE GIS COMMAND MAP
  // ==========================================
  const slide5 = createBaseSlide("Interactive Command Map & 3D Digital Twin (Nagpur Pilot)", "LIVE GIS COMMAND MAP");

  // Main Simulated Map Visualizer Frame
  slide5.addShape(pptx.ShapeType.roundRect, {
    x: 0.8,
    y: 1.6,
    w: 7.5,
    h: 5.1,
    rectRadius: 0.15,
    fill: { color: "060A12" },
    line: { color: ACCENT_CYAN, width: 1.5 },
  });

  // Map Top Bar
  slide5.addShape(pptx.ShapeType.rect, {
    x: 0.8,
    y: 1.6,
    w: 7.5,
    h: 0.5,
    fill: { color: "0B132B" },
  });
  slide5.addText("NAGPUR COMMAND MAP | 21.1458° N, 79.0882° E | DUAL-ENGINE: GOOGLE MAPS + MAPBOX 3D", {
    x: 1.0,
    y: 1.7,
    w: 7.1,
    h: 0.3,
    fontSize: 9,
    bold: true,
    color: ACCENT_CYAN,
  });

  // Simulated Sector Nodes on Map
  const mapNodes = [
    { zone: "Sitabuldi (Z-SIT)", score: "Risk: 82", color: ACCENT_RED, x: 1.5, y: 2.5 },
    { zone: "Dharampeth (Z-DHA)", score: "Risk: 48", color: ACCENT_AMBER, x: 4.2, y: 2.8 },
    { zone: "Sadar (Z-SAD)", score: "Risk: 65", color: ACCENT_AMBER, x: 2.2, y: 4.2 },
    { zone: "Itwari (Z-ITW)", score: "Risk: 74", color: ACCENT_RED, x: 5.5, y: 4.5 },
    { zone: "Sakkardara (Z-SAK)", score: "Risk: 38", color: ACCENT_EMERALD, x: 3.5, y: 5.5 },
  ];

  mapNodes.forEach((n) => {
    slide5.addShape(pptx.ShapeType.ellipse, {
      x: n.x,
      y: n.y,
      w: 1.6,
      h: 0.8,
      fill: { color: "0F172A" },
      line: { color: n.color, width: 2 },
    });
    slide5.addText(`${n.zone}\n${n.score}`, {
      x: n.x,
      y: n.y + 0.1,
      w: 1.6,
      h: 0.6,
      fontSize: 8.5,
      bold: true,
      color: TEXT_WHITE,
      align: "center",
    });
  });

  // Right Side Features Detail Card
  slide5.addShape(pptx.ShapeType.roundRect, {
    x: 8.5,
    y: 1.6,
    w: 4.0,
    h: 5.1,
    rectRadius: 0.15,
    fill: { color: CARD_BG },
    line: { color: CARD_BORDER, width: 1 },
  });

  slide5.addText("IMPLEMENTED GIS CAPABILITIES", {
    x: 8.7,
    y: 1.9,
    w: 3.6,
    h: 0.3,
    fontSize: 12,
    bold: true,
    color: ACCENT_CYAN,
  });

  const gisFeatures = [
    { title: "Dual Mapping Engine", desc: "Google Maps API for vector navigation + Mapbox GL JS for 3D building extrusions." },
    { title: "Deck.gl GPU Heatmaps", desc: "Hardware-accelerated heatmaps visualizing real-time crime concentration." },
    { title: "Interactive Spatial Filters", desc: "Filter by crime categories (Theft, Robbery, Assault), time period, and severity." },
    { title: "Infrastructure Overlays", desc: "Real-time toggleable pins for CCTV nodes, PCR patrol vans, hospitals, and police stations." },
  ];

  gisFeatures.forEach((f, idx) => {
    slide5.addText(`• ${f.title}`, {
      x: 8.7,
      y: 2.3 + idx * 1.05,
      w: 3.6,
      h: 0.3,
      fontSize: 11,
      bold: true,
      color: TEXT_WHITE,
    });
    slide5.addText(f.desc, {
      x: 8.7,
      y: 2.6 + idx * 1.05,
      w: 3.6,
      h: 0.65,
      fontSize: 9.5,
      color: TEXT_MUTED,
    });
  });

  // Implementation Tag
  slide5.addShape(pptx.ShapeType.roundRect, {
    x: 8.7,
    y: 6.1,
    w: 3.6,
    h: 0.4,
    rectRadius: 0.08,
    fill: { color: "0F2942" },
    line: { color: ACCENT_CYAN, width: 1 },
  });
  slide5.addText("STATUS: FULLY IMPLEMENTED IN REPOSITORY", {
    x: 8.7,
    y: 6.1,
    w: 3.6,
    h: 0.4,
    fontSize: 8.5,
    bold: true,
    color: ACCENT_CYAN,
    align: "center",
  });

  // ==========================================
  // SLIDE 6: ALGORITHMIC RISK ENGINE & XAI
  // ==========================================
  const slide6 = createBaseSlide("Algorithmic Risk Scoring (R_zone) & Explainable AI (XAI)", "AI RISK INTELLIGENCE");

  // Mathematical Model Container (Left)
  slide6.addShape(pptx.ShapeType.roundRect, {
    x: 0.8,
    y: 1.6,
    w: 5.75,
    h: 5.1,
    rectRadius: 0.15,
    fill: { color: CARD_BG },
    line: { color: CARD_BORDER, width: 1 },
  });

  slide6.addText("IMPLEMENTED RISK SCORING FORMULA", {
    x: 1.0,
    y: 1.8,
    w: 5.35,
    h: 0.3,
    fontSize: 12,
    bold: true,
    color: ACCENT_CYAN,
  });

  slide6.addShape(pptx.ShapeType.roundRect, {
    x: 1.0,
    y: 2.2,
    w: 5.35,
    h: 0.9,
    rectRadius: 0.1,
    fill: { color: "060A12" },
    line: { color: ACCENT_CYAN, width: 1 },
  });

  slide6.addText("R_zone = Min(100, Round(( L_incident * 0.38 + F_time * 0.27 +\n                D_cctv * 0.22 + D_lighting * 0.13 ) * 100 ))", {
    x: 1.1,
    y: 2.35,
    w: 5.15,
    h: 0.6,
    fontSize: 11,
    bold: true,
    color: ACCENT_CYAN,
    fontFace: "Courier New",
    align: "center",
  });

  const factors = [
    { name: "Incident Load (L_incident - 38%)", desc: "Weighted by incident count & severity (Low:0.25, High:0.78, Critical:1.0)." },
    { name: "Time-of-Day Factor (F_time - 27%)", desc: "Vulnerability multiplier peaking at 22:00-02:00 AM (F_time = 0.72 - 1.0)." },
    { name: "CCTV Deficit (D_cctv - 22%)", desc: "Derived directly from spatial unmonitored camera percentage (100 - Coverage%)." },
    { name: "Lighting Deficit (D_lighting - 13%)", desc: "Streetlight operational index dropping to 8-22% during night hours." },
  ];

  factors.forEach((f, idx) => {
    slide6.addText(`• ${f.name}`, {
      x: 1.0,
      y: 3.25 + idx * 0.85,
      w: 5.35,
      h: 0.25,
      fontSize: 10.5,
      bold: true,
      color: TEXT_WHITE,
    });
    slide6.addText(f.desc, {
      x: 1.0,
      y: 3.5 + idx * 0.85,
      w: 5.35,
      h: 0.55,
      fontSize: 9.5,
      color: TEXT_MUTED,
    });
  });

  // XAI Panel Container (Right)
  slide6.addShape(pptx.ShapeType.roundRect, {
    x: 6.75,
    y: 1.6,
    w: 5.75,
    h: 5.1,
    rectRadius: 0.15,
    fill: { color: CARD_BG },
    line: { color: CARD_BORDER, width: 1 },
  });

  slide6.addText("EXPLAINABLE AI (XAI) TRANSPARENCY", {
    x: 6.95,
    y: 1.8,
    w: 5.35,
    h: 0.3,
    fontSize: 12,
    bold: true,
    color: ACCENT_EMERALD,
  });

  slide6.addText("Deconstructs complex risk scores into 3 explainable factors with actionable tactical directives for officers.", {
    x: 6.95,
    y: 2.2,
    w: 5.35,
    h: 0.6,
    fontSize: 10.5,
    color: TEXT_MUTED,
  });

  // Simulated XAI Visual Card
  slide6.addShape(pptx.ShapeType.roundRect, {
    x: 6.95,
    y: 2.9,
    w: 5.35,
    h: 3.6,
    rectRadius: 0.1,
    fill: { color: "0B0F19" },
    line: { color: CARD_BORDER, width: 1 },
  });

  slide6.addText("SECTOR: Sitabuldi (Z-SIT) | RISK SCORE: 82/100 (CRITICAL)", {
    x: 7.15,
    y: 3.1,
    w: 4.95,
    h: 0.3,
    fontSize: 10,
    bold: true,
    color: ACCENT_RED,
  });

  const xaiBars = [
    { label: "Historical Incident Load", pct: "85%", color: ACCENT_RED },
    { label: "CCTV Coverage Deficit", pct: "70%", color: ACCENT_AMBER },
    { label: "Night Vulnerability Index", pct: "90%", color: ACCENT_RED },
  ];

  xaiBars.forEach((b, idx) => {
    slide6.addText(b.label, {
      x: 7.15,
      y: 3.5 + idx * 0.65,
      w: 3.0,
      h: 0.25,
      fontSize: 9,
      color: TEXT_WHITE,
    });
    slide6.addShape(pptx.ShapeType.roundRect, {
      x: 7.15,
      y: 3.75 + idx * 0.65,
      w: 4.95,
      h: 0.15,
      rectRadius: 0.05,
      fill: { color: "1E293B" },
    });
    slide6.addShape(pptx.ShapeType.roundRect, {
      x: 7.15,
      y: 3.75 + idx * 0.65,
      w: 4.95 * (parseFloat(b.pct) / 100),
      h: 0.15,
      rectRadius: 0.05,
      fill: { color: b.color },
    });
  });

  slide6.addText("AI TACTICAL DIRECTIVE:", {
    x: 7.15,
    y: 5.4,
    w: 4.95,
    h: 0.25,
    fontSize: 9,
    bold: true,
    color: ACCENT_CYAN,
  });

  slide6.addText("\"CRITICAL DIRECTIVE: Deploy 2 Quick Response Bikes and establish temporary mobile CCTV unit at Sitabuldi station exit during 20:00 - 01:00 AM.\"", {
    x: 7.15,
    y: 5.65,
    w: 4.95,
    h: 0.75,
    fontSize: 9.5,
    color: TEXT_WHITE,
    fontFace: "Arial",
  });

  // ==========================================
  // SLIDE 7: CCTV COVERAGE & BLIND SPOT INTELLIGENCE
  // ==========================================
  const slide7 = createBaseSlide("Surveillance Gap Analytics & Critical Blind Spot Detection", "CCTV INTELLIGENCE");

  // Left Section: Analytics Logic
  slide7.addShape(pptx.ShapeType.roundRect, {
    x: 0.8,
    y: 1.6,
    w: 5.75,
    h: 5.1,
    rectRadius: 0.15,
    fill: { color: CARD_BG },
    line: { color: CARD_BORDER, width: 1 },
  });

  slide7.addText("SPATIAL COVERAGE & BLIND SPOT ALGORITHMS", {
    x: 1.0,
    y: 1.8,
    w: 5.35,
    h: 0.3,
    fontSize: 12,
    bold: true,
    color: ACCENT_CYAN,
  });

  const cctvLogic = [
    {
      title: "Spatial Coverage Ratio",
      desc: "Coverage % = (Operational Cameras / Total Installed Cameras) * 100",
    },
    {
      title: "Critical Blind Spot Condition",
      desc: "Flagged if: Incident Density > Threshold AND Spatial CCTV Coverage < 45%",
    },
    {
      title: "Hotspot Crime Velocity (Δ_crime)",
      desc: "Δ_crime = ((Current Incidents - Previous Incidents) / Previous Incidents) * 100. If Δ_crime >= 15%, sector flagged as EMERGING HOTSPOT.",
    },
    {
      title: "Data-Driven CCTV Planning",
      desc: "Replaces random camera placement with algorithmically prioritized municipal installation recommendations.",
    },
  ];

  cctvLogic.forEach((l, idx) => {
    slide7.addText(`• ${l.title}`, {
      x: 1.0,
      y: 2.25 + idx * 1.1,
      w: 5.35,
      h: 0.3,
      fontSize: 11,
      bold: true,
      color: TEXT_WHITE,
    });
    slide7.addText(l.desc, {
      x: 1.0,
      y: 2.55 + idx * 1.1,
      w: 5.35,
      h: 0.7,
      fontSize: 9.5,
      color: TEXT_MUTED,
    });
  });

  // Right Section: Sector Surveillance Breakdown Table
  slide7.addShape(pptx.ShapeType.roundRect, {
    x: 6.75,
    y: 1.6,
    w: 5.75,
    h: 5.1,
    rectRadius: 0.15,
    fill: { color: CARD_BG },
    line: { color: CARD_BORDER, width: 1 },
  });

  slide7.addText("NAGPUR SECTOR SURVEILLANCE STATUS", {
    x: 6.95,
    y: 1.8,
    w: 5.35,
    h: 0.3,
    fontSize: 12,
    bold: true,
    color: ACCENT_EMERALD,
  });

  // Table Data
  const cctvTableData = [
    [
      { text: "Sector", options: { bold: true, color: ACCENT_CYAN, fill: "0B0F19" } },
      { text: "Cameras", options: { bold: true, color: ACCENT_CYAN, fill: "0B0F19" } },
      { text: "Coverage", options: { bold: true, color: ACCENT_CYAN, fill: "0B0F19" } },
      { text: "Blind Spot Status", options: { bold: true, color: ACCENT_CYAN, fill: "0B0F19" } },
    ],
    [{ text: "Sitabuldi (Z-SIT)" }, { text: "42 / 60" }, { text: "70%" }, { text: "Moderate Gap", options: { color: ACCENT_AMBER } }],
    [{ text: "Dharampeth (Z-DHA)" }, { text: "55 / 65" }, { text: "84%" }, { text: "Optimal", options: { color: ACCENT_EMERALD } }],
    [{ text: "Sadar (Z-SAD)" }, { text: "30 / 50" }, { text: "60%" }, { text: "Moderate Gap", options: { color: ACCENT_AMBER } }],
    [{ text: "Itwari (Z-ITW)" }, { text: "18 / 50" }, { text: "36%" }, { text: "CRITICAL BLIND SPOT", options: { bold: true, color: ACCENT_RED } }],
    [{ text: "Sakkardara (Z-SAK)" }, { text: "22 / 45" }, { text: "48%" }, { text: "High Gap", options: { color: ACCENT_AMBER } }],
    [{ text: "Automotive Sq (Z-AUT)" }, { text: "12 / 40" }, { text: "30%" }, { text: "CRITICAL BLIND SPOT", options: { bold: true, color: ACCENT_RED } }],
  ];

  slide7.addTable(cctvTableData, {
    x: 6.95,
    y: 2.3,
    w: 5.35,
    h: 4.1,
    colW: [1.6, 1.0, 1.0, 1.75],
    border: { pt: 1, color: CARD_BORDER },
    color: TEXT_WHITE,
    fontSize: 9,
    fontFace: "Arial",
  });

  // ==========================================
  // SLIDE 8: POLICE PATROL ALLOCATION & SOS
  // ==========================================
  const slide8 = createBaseSlide("Algorithmic Patrol Force Allocation & Emergency SOS", "RESOURCE & EMERGENCY");

  // Left Section: Deployment Matrix
  slide8.addShape(pptx.ShapeType.roundRect, {
    x: 0.8,
    y: 1.6,
    w: 5.75,
    h: 5.1,
    rectRadius: 0.15,
    fill: { color: CARD_BG },
    line: { color: CARD_BORDER, width: 1 },
  });

  slide8.addText("POLICE PATROL DEPLOYMENT ENGINE", {
    x: 1.0,
    y: 1.8,
    w: 5.35,
    h: 0.3,
    fontSize: 12,
    bold: true,
    color: ACCENT_CYAN,
  });

  slide8.addShape(pptx.ShapeType.roundRect, {
    x: 1.0,
    y: 2.2,
    w: 5.35,
    h: 0.7,
    rectRadius: 0.08,
    fill: { color: "060A12" },
    line: { color: ACCENT_CYAN, width: 1 },
  });

  slide8.addText("Required Patrols = Max( 2, Round( Population / 50K +\n                                R_zone / 15 + Δ_crime / 20 ) )", {
    x: 1.1,
    y: 2.25,
    w: 5.15,
    h: 0.6,
    fontSize: 10,
    bold: true,
    color: ACCENT_CYAN,
    fontFace: "Courier New",
    align: "center",
  });

  const patrolFeatures = [
    { title: "Deficit Analysis", desc: "Deficit = Required Patrols - Active Patrols per sector." },
    { title: "1-Click Reallocation Strategy", desc: "Reallocates PCR Vans, QR Bikes, and Interceptors from low-risk sectors (R_zone < 35) to critical deficit sectors." },
    { title: "Vehicle Types Managed", desc: "PCR Vans (heavy response), Quick Response Bikes (narrow alleys), Interceptor Vehicles (highways)." },
  ];

  patrolFeatures.forEach((pf, idx) => {
    slide8.addText(`• ${pf.title}`, {
      x: 1.0,
      y: 3.1 + idx * 1.1,
      w: 5.35,
      h: 0.3,
      fontSize: 11,
      bold: true,
      color: TEXT_WHITE,
    });
    slide8.addText(pf.desc, {
      x: 1.0,
      y: 3.4 + idx * 1.1,
      w: 5.35,
      h: 0.7,
      fontSize: 9.5,
      color: TEXT_MUTED,
    });
  });

  // Right Section: 1-Tap Emergency SOS
  slide8.addShape(pptx.ShapeType.roundRect, {
    x: 6.75,
    y: 1.6,
    w: 5.75,
    h: 5.1,
    rectRadius: 0.15,
    fill: { color: CARD_BG },
    line: { color: CARD_BORDER, width: 1 },
  });

  slide8.addText("CITIZEN EMERGENCY SOS SYSTEM", {
    x: 6.95,
    y: 1.8,
    w: 5.35,
    h: 0.3,
    fontSize: 12,
    bold: true,
    color: ACCENT_RED,
  });

  const sosServices = [
    { dept: "Police Emergency (112)", desc: "Instant GPS broadcast to nearest PCR Van.", color: ACCENT_CYAN },
    { dept: "Medical Ambulance (108)", desc: "Direct route guidance to trauma hospitals.", color: ACCENT_EMERALD },
    { dept: "Fire & Rescue (101)", desc: "Hazard alert & station dispatch.", color: ACCENT_AMBER },
    { dept: "Women Safety Helpline (1091)", desc: "Priority interceptor unit tracking.", color: ACCENT_RED },
  ];

  sosServices.forEach((s, idx) => {
    slide8.addShape(pptx.ShapeType.roundRect, {
      x: 6.95,
      y: 2.3 + idx * 1.05,
      w: 5.35,
      h: 0.9,
      rectRadius: 0.1,
      fill: { color: "0B0F19" },
      line: { color: CARD_BORDER, width: 1 },
    });
    slide8.addText(s.dept, {
      x: 7.15,
      y: 2.45 + idx * 1.05,
      w: 4.95,
      h: 0.3,
      fontSize: 11,
      bold: true,
      color: s.color,
    });
    slide8.addText(s.desc, {
      x: 7.15,
      y: 2.75 + idx * 1.05,
      w: 4.95,
      h: 0.4,
      fontSize: 9.5,
      color: TEXT_MUTED,
    });
  });

  // Implementation distinction note
  slide8.addText("STATUS: Deployment Engine IMPLEMENTED | SOS Dispatch SIMULATED", {
    x: 6.95,
    y: 6.35,
    w: 5.35,
    h: 0.3,
    fontSize: 8.5,
    color: TEXT_MUTED,
    align: "center",
  });

  // ==========================================
  // SLIDE 9: AI SAFE ROUTE NAVIGATION ENGINE
  // ==========================================
  const slide9 = createBaseSlide("Risk-Aware Safe Night Navigation Engine", "AI SAFE NAVIGATION");

  // Comparison Container: Fastest Route vs Safe Route
  const routes = [
    {
      title: "ROUTE A — STANDARD FASTEST",
      time: "12 Mins",
      dist: "4.2 km",
      risk: "CRITICAL RISK (Index: 78/100)",
      light: "20% Lighting Coverage (Dark Alleys)",
      cctv: "Low CCTV Coverage (15%)",
      verdict: "NOT RECOMMENDED AT NIGHT",
      color: ACCENT_RED,
    },
    {
      title: "ROUTE B — N-SHIELD SAFE ROUTE",
      time: "15 Mins (+3 min)",
      dist: "4.8 km",
      risk: "LOW RISK (Index: 22/100)",
      light: "90% Lighting Coverage (Main Arterials)",
      cctv: "High CCTV & PCR Patrol Presence",
      verdict: "RECOMMENDED SAFE ROUTE",
      color: ACCENT_EMERALD,
    },
  ];

  routes.forEach((r, idx) => {
    const xPos = 0.8 + idx * 5.95;
    slide9.addShape(pptx.ShapeType.roundRect, {
      x: xPos,
      y: 1.6,
      w: 5.75,
      h: 5.1,
      rectRadius: 0.15,
      fill: { color: CARD_BG },
      line: { color: r.color, width: 1.5 },
    });

    slide9.addText(r.title, {
      x: xPos + 0.3,
      y: 1.8,
      w: 5.15,
      h: 0.4,
      fontSize: 14,
      bold: true,
      color: r.color,
    });

    const metrics = [
      `• Estimated Travel Time: ${r.time}`,
      `• Distance: ${r.dist}`,
      `• Risk Score: ${r.risk}`,
      `• Street Lighting: ${r.light}`,
      `• Surveillance & Patrols: ${r.cctv}`,
    ];

    metrics.forEach((m, mIdx) => {
      slide9.addText(m, {
        x: xPos + 0.3,
        y: 2.4 + mIdx * 0.65,
        w: 5.15,
        h: 0.45,
        fontSize: 11,
        bold: true,
        color: TEXT_WHITE,
      });
    });

    slide9.addShape(pptx.ShapeType.roundRect, {
      x: xPos + 0.3,
      y: 5.8,
      w: 5.15,
      h: 0.6,
      rectRadius: 0.1,
      fill: { color: "0B0F19" },
      line: { color: r.color, width: 1 },
    });

    slide9.addText(r.verdict, {
      x: xPos + 0.3,
      y: 5.8,
      w: 5.15,
      h: 0.6,
      fontSize: 12,
      bold: true,
      color: r.color,
      align: "center",
    });
  });

  // ==========================================
  // SLIDE 10: NIGHT SAFETY INTELLIGENCE
  // ==========================================
  const slide10 = createBaseSlide("Dark-Spot Heatmapping & Web Audio Acoustic Alarms", "NIGHT SAFETY INTELLIGENCE");

  // Left Section: Night Safety Features
  slide10.addShape(pptx.ShapeType.roundRect, {
    x: 0.8,
    y: 1.6,
    w: 5.75,
    h: 5.1,
    rectRadius: 0.15,
    fill: { color: CARD_BG },
    line: { color: CARD_BORDER, width: 1 },
  });

  slide10.addText("NIGHT-TIME THREAT MONITORING", {
    x: 1.0,
    y: 1.8,
    w: 5.35,
    h: 0.3,
    fontSize: 12,
    bold: true,
    color: ACCENT_CYAN,
  });

  const nightFeatures = [
    { title: "Dynamic Night Lighting Deficit Engine", desc: "Streetlight efficiency drops automatically in calculations during peak threat hours (21:00 - 04:00 AM)." },
    { title: "Dark Spot Heatmapping", desc: "Maps unlit streets, isolated bus stops, and low-footfall nighttime corridors across Nagpur." },
    { title: "Synthesized Web Audio Acoustic Alarm", desc: "Uses browser Web Audio API (audioService.ts) to sound synthesized acoustic warning alarms when night safety mode is triggered." },
    { title: "Crowdsourced Citizen Reporting", desc: "Allows citizens to report unlit streets directly to municipal electrical boards." },
  ];

  nightFeatures.forEach((nf, idx) => {
    slide10.addText(`• ${nf.title}`, {
      x: 1.0,
      y: 2.25 + idx * 1.1,
      w: 5.35,
      h: 0.3,
      fontSize: 11,
      bold: true,
      color: TEXT_WHITE,
    });
    slide10.addText(nf.desc, {
      x: 1.0,
      y: 2.55 + idx * 1.1,
      w: 5.35,
      h: 0.7,
      fontSize: 9.5,
      color: TEXT_MUTED,
    });
  });

  // Right Section: Audio & UI Visual Card
  slide10.addShape(pptx.ShapeType.roundRect, {
    x: 6.75,
    y: 1.6,
    w: 5.75,
    h: 5.1,
    rectRadius: 0.15,
    fill: { color: "060A12" },
    line: { color: ACCENT_CYAN, width: 1.5 },
  });

  slide10.addText("LIVE NIGHT SAFETY MODE CONTROL", {
    x: 6.95,
    y: 1.8,
    w: 5.35,
    h: 0.3,
    fontSize: 12,
    bold: true,
    color: ACCENT_CYAN,
    align: "center",
  });

  slide10.addShape(pptx.ShapeType.roundRect, {
    x: 7.5,
    y: 2.4,
    w: 4.25,
    h: 1.0,
    rectRadius: 0.15,
    fill: { color: "0F2942" },
    line: { color: ACCENT_CYAN, width: 1 },
  });
  slide10.addText("MODE: NIGHT SAFETY ACTIVE\nACOUSTIC ALARM: ENABLED (Web Audio API)", {
    x: 7.5,
    y: 2.55,
    w: 4.25,
    h: 0.7,
    fontSize: 11,
    bold: true,
    color: ACCENT_CYAN,
    align: "center",
  });

  slide10.addText("UNLIT CORRIDOR ALERT: AUTOMOTIVE SQ (Z-AUT)\nLIGHTING INDEX: 12% | NIGHT THREAT SCORE: 88/100", {
    x: 6.95,
    y: 3.8,
    w: 5.35,
    h: 0.8,
    fontSize: 10.5,
    bold: true,
    color: ACCENT_RED,
    align: "center",
  });

  slide10.addShape(pptx.ShapeType.roundRect, {
    x: 6.95,
    y: 6.1,
    w: 5.35,
    h: 0.4,
    rectRadius: 0.08,
    fill: { color: "0F172A" },
    line: { color: CARD_BORDER, width: 1 },
  });
  slide10.addText("STATUS: FULLY IMPLEMENTED IN REPOSITORY", {
    x: 6.95,
    y: 6.1,
    w: 5.35,
    h: 0.4,
    fontSize: 8.5,
    bold: true,
    color: ACCENT_EMERALD,
    align: "center",
  });

  // ==========================================
  // SLIDE 11: EVENT IMPACT SIMULATOR
  // ==========================================
  const slide11 = createBaseSlide("Mass Gathering & Public Event Risk Modeling Engine", "EVENT SIMULATOR");

  // Left Section: Event Simulator Logic
  slide11.addShape(pptx.ShapeType.roundRect, {
    x: 0.8,
    y: 1.6,
    w: 5.75,
    h: 5.1,
    rectRadius: 0.15,
    fill: { color: CARD_BG },
    line: { color: CARD_BORDER, width: 1 },
  });

  slide11.addText("PREDICTIVE EVENT IMPACT ENGINE", {
    x: 1.0,
    y: 1.8,
    w: 5.35,
    h: 0.3,
    fontSize: 12,
    bold: true,
    color: ACCENT_CYAN,
  });

  const eventSteps = [
    { title: "Select Event Scenario", desc: "VCA Stadium Cricket Match, Ganesh Visarjan Procession, Political Rally, or VIP Movement." },
    { title: "Dynamic Variable Adjustments", desc: "Injects crowd surge density, traffic congestion factors, and perimeter risk multipliers." },
    { title: "Sector Risk Recalculation", desc: "Recalculates target sector risk score (e.g. Zone-2 Dharampeth risk spikes from 48 -> 85)." },
    { title: "Automated Force Shift Generation", desc: "Calculates additional police PCR vans and QR bikes required for pre-event staging." },
  ];

  eventSteps.forEach((es, idx) => {
    slide11.addText(`• ${es.title}`, {
      x: 1.0,
      y: 2.25 + idx * 1.1,
      w: 5.35,
      h: 0.3,
      fontSize: 11,
      bold: true,
      color: TEXT_WHITE,
    });
    slide11.addText(es.desc, {
      x: 1.0,
      y: 2.55 + idx * 1.1,
      w: 5.35,
      h: 0.7,
      fontSize: 9.5,
      color: TEXT_MUTED,
    });
  });

  // Right Section: Event Simulation Case Card
  slide11.addShape(pptx.ShapeType.roundRect, {
    x: 6.75,
    y: 1.6,
    w: 5.75,
    h: 5.1,
    rectRadius: 0.15,
    fill: { color: CARD_BG },
    line: { color: CARD_BORDER, width: 1 },
  });

  slide11.addText("SIMULATION CASE STUDY: VCA STADIUM MATCH", {
    x: 6.95,
    y: 1.8,
    w: 5.35,
    h: 0.3,
    fontSize: 11,
    bold: true,
    color: ACCENT_AMBER,
  });

  const simComparison = [
    { label: "Baseline Sector Risk", val: "48 / 100 (Medium)", color: ACCENT_EMERALD },
    { label: "Estimated Footfall Surge", val: "+45,000 Spectators", color: ACCENT_AMBER },
    { label: "Simulated Post-Event Risk", val: "86 / 100 (Critical)", color: ACCENT_RED },
    { label: "Auto-Recommended Reinforcements", val: "+4 PCR Vans, +6 QR Bikes", color: ACCENT_CYAN },
  ];

  simComparison.forEach((sc, idx) => {
    slide11.addShape(pptx.ShapeType.roundRect, {
      x: 6.95,
      y: 2.3 + idx * 1.0,
      w: 5.35,
      h: 0.85,
      rectRadius: 0.1,
      fill: { color: "0B0F19" },
      line: { color: CARD_BORDER, width: 1 },
    });
    slide11.addText(sc.label, {
      x: 7.15,
      y: 2.4 + idx * 1.0,
      w: 4.95,
      h: 0.25,
      fontSize: 9.5,
      color: TEXT_MUTED,
    });
    slide11.addText(sc.val, {
      x: 7.15,
      y: 2.65 + idx * 1.0,
      w: 4.95,
      h: 0.4,
      fontSize: 12,
      bold: true,
      color: sc.color,
    });
  });

  slide11.addText("STATUS: FULLY IMPLEMENTED (Rule-Based Simulation Engine)", {
    x: 6.95,
    y: 6.35,
    w: 5.35,
    h: 0.3,
    fontSize: 8.5,
    color: TEXT_MUTED,
    align: "center",
  });

  // ==========================================
  // SLIDE 12: DIFFERENTIATION MATRIX
  // ==========================================
  const slide12 = createBaseSlide("Traditional Fragmented Systems vs. N-SHIELD Unified Command", "DIFFERENTIATION MATRIX");

  const compTableData = [
    [
      { text: "Safety Dimension", options: { bold: true, color: ACCENT_CYAN, fill: "0B0F19" } },
      { text: "Traditional Approach", options: { bold: true, color: ACCENT_RED, fill: "0B0F19" } },
      { text: "N-SHIELD Platform", options: { bold: true, color: ACCENT_EMERALD, fill: "0B0F19" } },
    ],
    [
      { text: "Data Visibility", options: { bold: true } },
      { text: "Disconnected paper FIRs & isolated digital files" },
      { text: "Unified 3D Digital Twin Command Dashboard", options: { color: ACCENT_EMERALD, bold: true } },
    ],
    [
      { text: "Risk Assessment", options: { bold: true } },
      { text: "Static historical annual crime statistics" },
      { text: "Dynamic multi-factor risk engine (R_zone)", options: { color: ACCENT_EMERALD, bold: true } },
    ],
    [
      { text: "CCTV Infrastructure", options: { bold: true } },
      { text: "Cameras monitored individually without spatial context" },
      { text: "Coverage gap & critical blind spot analytics", options: { color: ACCENT_EMERALD, bold: true } },
    ],
    [
      { text: "Citizen Navigation", options: { bold: true } },
      { text: "Optimized purely for distance & travel time" },
      { text: "Multi-variable safety & lighting aware routing", options: { color: ACCENT_EMERALD, bold: true } },
    ],
    [
      { text: "Patrol Allocation", options: { bold: true } },
      { text: "Static beat patrols based on traditional boundaries" },
      { text: "Algorithmic deficit-based auto-reallocation", options: { color: ACCENT_EMERALD, bold: true } },
    ],
    [
      { text: "Event Management", options: { bold: true } },
      { text: "Manual security planning & reactive deployment" },
      { text: "Real-time predictive event impact simulation", options: { color: ACCENT_EMERALD, bold: true } },
    ],
  ];

  slide12.addTable(compTableData, {
    x: 0.8,
    y: 1.6,
    w: 11.7,
    h: 5.1,
    colW: [2.5, 4.6, 4.6],
    border: { pt: 1, color: CARD_BORDER },
    color: TEXT_WHITE,
    fontSize: 9.5,
    fontFace: "Arial",
  });

  // ==========================================
  // SLIDE 13: TECH STACK & ARCHITECTURE
  // ==========================================
  const slide13 = createBaseSlide("Production Enterprise Technology Stack & Architecture", "SYSTEM ARCHITECTURE");

  // Left Section: Tech Stack Badges
  slide13.addShape(pptx.ShapeType.roundRect, {
    x: 0.8,
    y: 1.6,
    w: 5.75,
    h: 5.1,
    rectRadius: 0.15,
    fill: { color: CARD_BG },
    line: { color: CARD_BORDER, width: 1 },
  });

  slide13.addText("IMPLEMENTED TECH STACK", {
    x: 1.0,
    y: 1.8,
    w: 5.35,
    h: 0.3,
    fontSize: 12,
    bold: true,
    color: ACCENT_CYAN,
  });

  const techStack = [
    { cat: "Core Web Framework", tech: "Next.js 16 (App Router), React 19, TypeScript (Strict)" },
    { cat: "Styling & UI", tech: "Tailwind CSS v4, Lucide React Icons, Recharts, Framer Motion" },
    { cat: "GIS & Digital Twin", tech: "Google Maps API (@vis.gl), Mapbox GL JS, Deck.gl GPU Layers" },
    { cat: "Audio Engine", tech: "Synthesized Web Audio API Alarm System (audioService.ts)" },
    { cat: "REST API Endpoints", tech: "Next.js APIs: /api/incidents, /api/cctv, /api/zones, /api/news" },
  ];

  techStack.forEach((t, idx) => {
    slide13.addText(`• ${t.cat}`, {
      x: 1.0,
      y: 2.25 + idx * 0.9,
      w: 5.35,
      h: 0.25,
      fontSize: 10.5,
      bold: true,
      color: ACCENT_CYAN,
    });
    slide13.addText(t.tech, {
      x: 1.0,
      y: 2.5 + idx * 0.9,
      w: 5.35,
      h: 0.5,
      fontSize: 9.5,
      color: TEXT_WHITE,
    });
  });

  // Right Section: Architecture Flow
  slide13.addShape(pptx.ShapeType.roundRect, {
    x: 6.75,
    y: 1.6,
    w: 5.75,
    h: 5.1,
    rectRadius: 0.15,
    fill: { color: CARD_BG },
    line: { color: CARD_BORDER, width: 1 },
  });

  slide13.addText("DATA & ENGINE ARCHITECTURE", {
    x: 6.95,
    y: 1.8,
    w: 5.35,
    h: 0.3,
    fontSize: 12,
    bold: true,
    color: ACCENT_EMERALD,
  });

  const archLayers = [
    { layer: "Presentation Layer", detail: "Next.js 16 React Client + Google Maps / Mapbox 3D Canvas" },
    { layer: "API & Data Gateway", detail: "REST APIs (/api/*) + Real-time RSS News Feed Service" },
    { layer: "Intelligence Engine Layer", detail: "RiskEngine + BlindSpotIntelligence + DeploymentEngine" },
    { layer: "Municipal & City Data", detail: "Nagpur Sector Coordinates, CCTV Nodes & Incident Schema" },
  ];

  archLayers.forEach((a, idx) => {
    slide13.addShape(pptx.ShapeType.roundRect, {
      x: 6.95,
      y: 2.3 + idx * 1.1,
      w: 5.35,
      h: 0.9,
      rectRadius: 0.1,
      fill: { color: "0B0F19" },
      line: { color: CARD_BORDER, width: 1 },
    });
    slide13.addText(a.layer, {
      x: 7.15,
      y: 2.4 + idx * 1.1,
      w: 4.95,
      h: 0.3,
      fontSize: 11,
      bold: true,
      color: ACCENT_EMERALD,
    });
    slide13.addText(a.detail, {
      x: 7.15,
      y: 2.7 + idx * 1.1,
      w: 4.95,
      h: 0.4,
      fontSize: 9.5,
      color: TEXT_MUTED,
    });
  });

  // ==========================================
  // SLIDE 14: REAL-WORLD IMPACT & STAKEHOLDERS
  // ==========================================
  const slide14 = createBaseSlide("Multi-Stakeholder Value & City-Wide Expansion Path", "REAL-WORLD IMPACT");

  const stakeholders = [
    {
      title: "Law Enforcement / Police 112",
      benefits: ["Real-time 3D GIS situational awareness", "Deficit-based force reallocation", "XAI transparent tactical directives"],
      color: ACCENT_CYAN,
    },
    {
      title: "Smart City Authorities",
      benefits: ["Data-driven CCTV installation planning", "Streetlight maintenance prioritization", "Mass event safety risk management"],
      color: ACCENT_EMERALD,
    },
    {
      title: "Citizens & Tourists",
      benefits: ["Risk-aware safe night navigation", "1-Tap multi-department SOS dispatch", "Crowdsourced dark-spot reporting"],
      color: ACCENT_AMBER,
    },
    {
      title: "Emergency Medical & Fire",
      benefits: ["Sub-second location identification", "Direct trauma route guidance", "Multi-agency coordination"],
      color: ACCENT_RED,
    },
  ];

  stakeholders.forEach((sh, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const xPos = 0.8 + col * 5.95;
    const yPos = 1.6 + row * 2.6;

    slide14.addShape(pptx.ShapeType.roundRect, {
      x: xPos,
      y: yPos,
      w: 5.75,
      h: 2.4,
      rectRadius: 0.15,
      fill: { color: CARD_BG },
      line: { color: CARD_BORDER, width: 1 },
    });

    slide14.addText(sh.title, {
      x: xPos + 0.3,
      y: yPos + 0.2,
      w: 5.15,
      h: 0.4,
      fontSize: 14,
      bold: true,
      color: sh.color,
    });

    sh.benefits.forEach((b, bIdx) => {
      slide14.addText(`• ${b}`, {
        x: xPos + 0.3,
        y: yPos + 0.7 + bIdx * 0.5,
        w: 5.15,
        h: 0.45,
        fontSize: 10.5,
        color: TEXT_WHITE,
      });
    });
  });

  // ==========================================
  // SLIDE 15: ROADMAP & CLOSING VISION
  // ==========================================
  const slide15 = createBaseSlide("Phased Implementation Roadmap & Strategic Vision", "ROADMAP & VISION");

  const phases = [
    { phase: "PHASE 1 (CURRENT)", title: "Interactive Prototype & 6-Sector Command Center", color: ACCENT_CYAN },
    { phase: "PHASE 2 (MONTHS 1-3)", title: "Integration with Nagpur Police CCTNS FIR Database", color: ACCENT_EMERALD },
    { phase: "PHASE 3 (MONTHS 3-6)", title: "IoT Smart Streetlight & Acoustic Sensor Ingestion", color: ACCENT_AMBER },
    { phase: "PHASE 4 (MONTHS 6-12)", title: "Spatio-Temporal GNN Crime Forecasting Models", color: ACCENT_RED },
  ];

  phases.forEach((ph, idx) => {
    const xPos = 0.8 + idx * 2.95;
    slide15.addShape(pptx.ShapeType.roundRect, {
      x: xPos,
      y: 1.6,
      w: 2.8,
      h: 3.2,
      rectRadius: 0.12,
      fill: { color: CARD_BG },
      line: { color: CARD_BORDER, width: 1 },
    });

    slide15.addText(ph.phase, {
      x: xPos + 0.2,
      y: 1.8,
      w: 2.4,
      h: 0.3,
      fontSize: 9,
      bold: true,
      color: ph.color,
    });

    slide15.addText(ph.title, {
      x: xPos + 0.2,
      y: 2.2,
      w: 2.4,
      h: 2.4,
      fontSize: 11,
      bold: true,
      color: TEXT_WHITE,
    });
  });

  // Closing Strategic Vision Banner
  slide15.addShape(pptx.ShapeType.roundRect, {
    x: 0.8,
    y: 5.0,
    w: 11.7,
    h: 1.7,
    rectRadius: 0.15,
    fill: { color: "0F2942" },
    line: { color: ACCENT_CYAN, width: 1.5 },
  });

  slide15.addText("STRATEGIC CLOSING VISION", {
    x: 1.0,
    y: 5.15,
    w: 11.3,
    h: 0.3,
    fontSize: 11,
    bold: true,
    color: ACCENT_CYAN,
    align: "center",
  });

  slide15.addText(
    "\"N-SHIELD does not replace law enforcement; it empowers city decision-makers with a unified intelligence layer to transform urban safety from reactive incident management into proactive, data-driven protection.\"",
    {
      x: 1.2,
      y: 5.5,
      w: 10.9,
      h: 1.0,
      fontSize: 13,
      bold: true,
      color: TEXT_WHITE,
      align: "center",
      fontFace: "Arial",
    }
  );

  // Save PPTX
  const pptxPath = path.join(__dirname, "N_SHIELD_Competition_Presentation.pptx");
  await pptx.writeFile({ fileName: pptxPath });
  console.log(`PPTX file generated successfully: ${pptxPath}`);
}

// --- PDF GENERATION ---
function buildPdf() {
  const doc = new PDFDocument({
    size: [960, 540], // 16:9 Aspect Ratio (landscape presentation)
    margin: 30,
    bufferPages: true,
  });

  const pdfPath = path.join(__dirname, "N_SHIELD_Competition_Presentation.pdf");
  const writeStream = fs.createWriteStream(pdfPath);
  doc.pipe(writeStream);

  const BG_DARK = "#0B0F19";
  const CARD_BG = "#151C2C";
  const CARD_BORDER = "#1E293B";
  const TEXT_WHITE = "#FFFFFF";
  const TEXT_MUTED = "#94A3B8";
  const ACCENT_CYAN = "#00F0FF";
  const ACCENT_EMERALD = "#10B981";
  const ACCENT_AMBER = "#F59E0B";
  const ACCENT_RED = "#EF4444";

  function drawBasePage(doc, titleText, catText) {
    // Dark Background
    doc.rect(0, 0, 960, 540).fill(BG_DARK);

    // Top Category
    if (catText) {
      doc.fillColor(ACCENT_CYAN).fontSize(10).font("Helvetica-Bold").text(catText.toUpperCase(), 40, 25);
    }

    // Title
    doc.fillColor(TEXT_WHITE).fontSize(20).font("Helvetica-Bold").text(titleText, 40, 42);

    // Divider Line
    doc.strokeColor(CARD_BORDER).lineWidth(1).moveTo(40, 72).lineTo(920, 72).stroke();

    // Footer
    doc.fillColor(TEXT_MUTED).fontSize(9).font("Helvetica").text("N-SHIELD | AI-Driven Urban Safety Intelligence & Command Center (Nagpur Pilot)", 40, 515);
  }

  // --- Slide 1 ---
  doc.rect(0, 0, 960, 540).fill(BG_DARK);
  doc.rect(0, 0, 960, 10).fill(ACCENT_CYAN);
  doc.roundedRect(60, 60, 840, 420, 10).fill(CARD_BG);
  doc.roundedRect(60, 60, 840, 420, 10).strokeColor(CARD_BORDER).lineWidth(1.5).stroke();

  doc.fillColor(ACCENT_CYAN).fontSize(10).font("Helvetica-Bold").text("SYSTEM STATUS: ACTIVE | PILOT DEMO", 100, 100);
  doc.fillColor(TEXT_WHITE).fontSize(48).font("Helvetica-Bold").text("N-SHIELD", 100, 130);
  doc.fillColor(ACCENT_CYAN).fontSize(20).font("Helvetica-Bold").text("AI-Driven Urban Safety Intelligence & Command Center", 100, 195);
  doc.fillColor(TEXT_MUTED).fontSize(13).font("Helvetica").text("Turning fragmented city safety data into real-time actionable intelligence.", 100, 235);

  const miniCards = [
    { label: "PILOT GEOGRAPHY", val: "Nagpur, Maharashtra (6 Sectors)", color: ACCENT_CYAN },
    { label: "CORE TECH STACK", val: "Next.js 16 + Mapbox 3D + Deck.gl", color: ACCENT_EMERALD },
    { label: "TARGET STAKEHOLDERS", val: "Police 112, Municipalities & Citizens", color: ACCENT_AMBER },
  ];

  miniCards.forEach((c, idx) => {
    const xPos = 100 + idx * 260;
    doc.roundedRect(xPos, 300, 240, 120, 8).fill("#0B0F19");
    doc.roundedRect(xPos, 300, 240, 120, 8).strokeColor(CARD_BORDER).lineWidth(1).stroke();
    doc.fillColor(c.color).fontSize(10).font("Helvetica-Bold").text(c.label, xPos + 15, 315);
    doc.fillColor(TEXT_WHITE).fontSize(12).font("Helvetica-Bold").text(c.val, xPos + 15, 345, { width: 210 });
  });

  // --- Slide 2 ---
  doc.addPage();
  drawBasePage(doc, "Fragmented Safety Infrastructure & Delayed Emergency Response", "THE PROBLEM");

  const pItems = [
    { title: "Disconnected Data Silos", desc: "Police FIR records, municipal CCTV feeds, citizen emergency calls (112), and streetlight lighting indices operate in isolation.", stat: "4+ Siloed Systems", color: ACCENT_RED },
    { title: "Reactive Patrol Allocation", desc: "Police PCR vans and patrol units are assigned statically based on traditional beat boundaries rather than real-time dynamic crime density.", stat: "Static Deployment", color: ACCENT_AMBER },
    { title: "Unmonitored Surveillance Blind Spots", desc: "Authorities lack spatial visibility into CCTV coverage gaps across high-risk corridors, leading to guesswork in camera placement.", stat: "~40% Unmonitored", color: ACCENT_RED },
    { title: "Uninformed Citizen Navigation", desc: "Conventional GPS navigation applications optimize purely for distance and travel time, routing pedestrians through unlit and unsafe alleys.", stat: "Zero Safety Factors", color: ACCENT_AMBER },
  ];

  pItems.forEach((p, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const xPos = 40 + col * 445;
    const yPos = 90 + row * 200;

    doc.roundedRect(xPos, yPos, 430, 180, 8).fill(CARD_BG);
    doc.rect(xPos, yPos, 8, 180).fill(p.color);
    doc.fillColor(TEXT_WHITE).fontSize(14).font("Helvetica-Bold").text(p.title, xPos + 25, yPos + 20);
    doc.fillColor(p.color).fontSize(10).font("Helvetica-Bold").text(p.stat, xPos + 290, yPos + 22);
    doc.fillColor(TEXT_MUTED).fontSize(10).font("Helvetica").text(p.desc, xPos + 25, yPos + 55, { width: 380 });
  });

  // --- Slide 3 ---
  doc.addPage();
  drawBasePage(doc, "A Unified Intelligence Layer Over City Infrastructure", "THE CORE IDEA");

  doc.roundedRect(40, 90, 880, 400, 10).fill(CARD_BG);
  doc.fillColor(ACCENT_CYAN).fontSize(12).font("Helvetica-Bold").text("INCOMING CITY DATA FEEDS", 60, 110);
  doc.fillColor(ACCENT_CYAN).fontSize(12).font("Helvetica-Bold").text("N-SHIELD INTELLIGENCE ENGINE", 330, 110);
  doc.fillColor(ACCENT_EMERALD).fontSize(12).font("Helvetica-Bold").text("ACTIONABLE COMMAND OUTPUTS", 620, 110);

  const inFeeds = ["Crime Incident Reports", "CCTV Camera Nodes & Status", "Police Patrol GPS Telemetry", "Streetlight Lighting Indices", "Mass Gathering Metadata"];
  inFeeds.forEach((inf, idx) => {
    doc.roundedRect(60, 140 + idx * 65, 230, 50, 6).fill("#0B0F19");
    doc.fillColor(TEXT_WHITE).fontSize(9.5).font("Helvetica").text(`• ${inf}`, 70, 155 + idx * 65, { width: 210 });
  });

  doc.roundedRect(320, 140, 270, 320, 8).fill("#0F2942");
  doc.roundedRect(320, 140, 270, 320, 8).strokeColor(ACCENT_CYAN).lineWidth(1.5).stroke();
  const engList = [
    "Algorithmic Risk Heatmapping (0-100)",
    "Explainable AI (XAI) Directives",
    "CCTV Gap & Blind Spot Analytics",
    "Patrol Force Reallocation Engine",
    "Predictive Event Impact Simulator",
    "AI Safe Night Route Evaluator",
  ];
  engList.forEach((e, idx) => {
    doc.fillColor(TEXT_WHITE).fontSize(10).font("Helvetica-Bold").text(`[ ${e} ]`, 330, 165 + idx * 48, { width: 250, align: "center" });
  });

  const outList = ["3D Command Center Dashboard", "1-Click Patrol Reallocation Directives", "Citizen Safe Route & Night Mode", "1-Tap Multi-Department SOS Dispatch"];
  outList.forEach((out, idx) => {
    doc.roundedRect(620, 140 + idx * 80, 280, 65, 6).fill("#0B0F19");
    doc.roundedRect(620, 140 + idx * 80, 280, 65, 6).strokeColor(ACCENT_EMERALD).lineWidth(1).stroke();
    doc.fillColor(TEXT_WHITE).fontSize(10).font("Helvetica-Bold").text(out, 635, 158 + idx * 80, { width: 250 });
  });

  // --- Slide 4 ---
  doc.addPage();
  drawBasePage(doc, "End-to-End Operational System Workflow", "SYSTEM WORKFLOW");

  const wf = [
    { num: "01", title: "Data Ingestion", desc: "Ingests spatial incidents, CCTV status, patrol locations, lighting indices, and mass event data across Nagpur.", status: "ACTIVE" },
    { num: "02", title: "AI & Risk Computation", desc: "Executes multi-factor risk engine (R_zone), CCTV blind-spot clustering, and XAI directive generation.", status: "COMPUTING" },
    { num: "03", title: "Command Center GIS", desc: "Visualizes GPU-accelerated risk heatmaps, interactive markers, force deficit meters, and event scenarios.", status: "VISUALIZING" },
    { num: "04", title: "Targeted Dispatch", desc: "Outputs 1-click patrol reallocation to police, targeted CCTV expansion plans, and citizen route guidance.", status: "DISPATCHING" },
  ];

  wf.forEach((w, idx) => {
    const xPos = 40 + idx * 220;
    doc.roundedRect(xPos, 90, 210, 400, 10).fill(CARD_BG);
    doc.fillColor(ACCENT_CYAN).fontSize(28).font("Helvetica-Bold").text(w.num, xPos + 15, 110);
    doc.fillColor(TEXT_WHITE).fontSize(13).font("Helvetica-Bold").text(w.title, xPos + 15, 155);
    doc.fillColor(TEXT_MUTED).fontSize(9.5).font("Helvetica").text(w.desc, xPos + 15, 195, { width: 180 });
    doc.roundedRect(xPos + 15, 430, 180, 35, 6).fill("#0F2942");
    doc.fillColor(ACCENT_CYAN).fontSize(9).font("Helvetica-Bold").text(`STATUS: ${w.status}`, xPos + 15, 442, { width: 180, align: "center" });
  });

  // --- Slide 5 ---
  doc.addPage();
  drawBasePage(doc, "Interactive Command Map & 3D Digital Twin (Nagpur Pilot)", "LIVE GIS COMMAND MAP");

  doc.roundedRect(40, 90, 560, 400, 10).fill("#060A12");
  doc.roundedRect(40, 90, 560, 400, 10).strokeColor(ACCENT_CYAN).lineWidth(1.5).stroke();
  doc.fillColor(ACCENT_CYAN).fontSize(10).font("Helvetica-Bold").text("NAGPUR COMMAND MAP | 21.1458° N, 79.0882° E | DUAL-ENGINE", 55, 110);

  const nodes = [
    { name: "Sitabuldi (Z-SIT)", score: "Risk: 82", color: ACCENT_RED, x: 80, y: 160 },
    { name: "Dharampeth (Z-DHA)", score: "Risk: 48", color: ACCENT_AMBER, x: 320, y: 180 },
    { name: "Sadar (Z-SAD)", score: "Risk: 65", color: ACCENT_AMBER, x: 160, y: 280 },
    { name: "Itwari (Z-ITW)", score: "Risk: 74", color: ACCENT_RED, x: 380, y: 320 },
    { name: "Sakkardara (Z-SAK)", score: "Risk: 38", color: ACCENT_EMERALD, x: 220, y: 390 },
  ];

  nodes.forEach((n) => {
    doc.roundedRect(n.x, n.y, 140, 55, 8).fill("#0F172A");
    doc.roundedRect(n.x, n.y, 140, 55, 8).strokeColor(n.color).lineWidth(1.5).stroke();
    doc.fillColor(TEXT_WHITE).fontSize(9.5).font("Helvetica-Bold").text(`${n.name}\n${n.score}`, n.x + 5, n.y + 12, { width: 130, align: "center" });
  });

  doc.roundedRect(620, 90, 300, 400, 10).fill(CARD_BG);
  doc.fillColor(ACCENT_CYAN).fontSize(12).font("Helvetica-Bold").text("IMPLEMENTED GIS CAPABILITIES", 640, 110);
  const gisCaps = [
    { title: "Dual Mapping Engine", desc: "Google Maps vector API + Mapbox 3D extruded building basemap." },
    { title: "Deck.gl GPU Heatmaps", desc: "Hardware-accelerated real-time crime concentration layers." },
    { title: "Spatial Filter System", desc: "Category, severity, time period, and status incident filters." },
    { title: "Infrastructure Overlays", desc: "Toggle pins for CCTV, PCR vans, hospitals, and police stations." },
  ];
  gisCaps.forEach((g, idx) => {
    doc.fillColor(TEXT_WHITE).fontSize(10.5).font("Helvetica-Bold").text(`• ${g.title}`, 640, 145 + idx * 80);
    doc.fillColor(TEXT_MUTED).fontSize(9).font("Helvetica").text(g.desc, 640, 163 + idx * 80, { width: 260 });
  });
  doc.roundedRect(640, 440, 260, 35, 6).fill("#0F2942");
  doc.fillColor(ACCENT_CYAN).fontSize(8.5).font("Helvetica-Bold").text("STATUS: FULLY IMPLEMENTED IN REPOSITORY", 640, 452, { width: 260, align: "center" });

  // --- Slide 6 ---
  doc.addPage();
  drawBasePage(doc, "Algorithmic Risk Scoring (R_zone) & Explainable AI (XAI)", "AI RISK INTELLIGENCE");

  doc.roundedRect(40, 90, 430, 400, 10).fill(CARD_BG);
  doc.fillColor(ACCENT_CYAN).fontSize(12).font("Helvetica-Bold").text("IMPLEMENTED RISK SCORING FORMULA", 60, 110);
  doc.roundedRect(60, 135, 390, 65, 6).fill("#060A12");
  doc.fillColor(ACCENT_CYAN).fontSize(10).font("Courier-Bold").text("R_zone = Min(100, Round(( L_incident * 0.38 +\n F_time * 0.27 + D_cctv * 0.22 + D_lighting * 0.13 ) * 100 ))", 70, 148, { align: "center" });

  const rFactors = [
    "Incident Load (L_incident - 38%): Weighted by severity",
    "Time-of-Day Factor (F_time - 27%): Peak at 22:00-02:00 AM",
    "CCTV Deficit (D_cctv - 22%): Spatial unmonitored %",
    "Lighting Deficit (D_lighting - 13%): Night operational index",
  ];
  rFactors.forEach((rf, idx) => {
    doc.fillColor(TEXT_WHITE).fontSize(9.5).font("Helvetica").text(`• ${rf}`, 60, 220 + idx * 60, { width: 390 });
  });

  doc.roundedRect(490, 90, 430, 400, 10).fill(CARD_BG);
  doc.fillColor(ACCENT_EMERALD).fontSize(12).font("Helvetica-Bold").text("EXPLAINABLE AI (XAI) TRANSPARENCY", 510, 110);
  doc.fillColor(TEXT_MUTED).fontSize(9.5).font("Helvetica").text("Deconstructs risk scores into transparent factor bars & tactical directives.", 510, 135, { width: 390 });

  doc.roundedRect(510, 175, 390, 290, 8).fill("#0B0F19");
  doc.fillColor(ACCENT_RED).fontSize(10).font("Helvetica-Bold").text("SECTOR: Sitabuldi (Z-SIT) | RISK SCORE: 82/100 (CRITICAL)", 525, 195);
  doc.fillColor(TEXT_WHITE).fontSize(9).font("Helvetica").text("Historical Incident Load Contribution: 85%", 525, 230);
  doc.fillColor(TEXT_WHITE).fontSize(9).font("Helvetica").text("CCTV Coverage Deficit Contribution: 70%", 525, 270);
  doc.fillColor(TEXT_WHITE).fontSize(9).font("Helvetica").text("Night Vulnerability Index Contribution: 90%", 525, 310);
  doc.fillColor(ACCENT_CYAN).fontSize(9.5).font("Helvetica-Bold").text("AI TACTICAL DIRECTIVE:", 525, 360);
  doc.fillColor(TEXT_WHITE).fontSize(9.5).font("Helvetica").text("\"Deploy 2 Quick Response Bikes and establish temporary mobile CCTV unit at Sitabuldi station exit during 20:00 - 01:00 AM.\"", 525, 380, { width: 360 });

  // --- Slide 7 ---
  doc.addPage();
  drawBasePage(doc, "Surveillance Gap Analytics & Critical Blind Spot Detection", "CCTV INTELLIGENCE");

  doc.roundedRect(40, 90, 430, 400, 10).fill(CARD_BG);
  doc.fillColor(ACCENT_CYAN).fontSize(12).font("Helvetica-Bold").text("SPATIAL COVERAGE & BLIND SPOT ALGORITHMS", 60, 110);
  const cctvAlg = [
    "Spatial Coverage Ratio = (Operational CCTV / Total Installed) * 100",
    "Critical Blind Spot: Incident Density > Threshold AND CCTV Coverage < 45%",
    "Hotspot Velocity (Δ_crime): ((N_current - N_prev) / N_prev) * 100 >= 15%",
    "Data-Driven Planning: Prioritizes municipal CCTV expansion algorithmically.",
  ];
  cctvAlg.forEach((ca, idx) => {
    doc.fillColor(TEXT_WHITE).fontSize(9.5).font("Helvetica").text(`• ${ca}`, 60, 150 + idx * 80, { width: 390 });
  });

  doc.roundedRect(490, 90, 430, 400, 10).fill(CARD_BG);
  doc.fillColor(ACCENT_EMERALD).fontSize(12).font("Helvetica-Bold").text("NAGPUR SECTOR SURVEILLANCE STATUS", 510, 110);

  const cctvRows = [
    { sec: "Sitabuldi (Z-SIT)", cam: "42/60 (70%)", stat: "Moderate Gap", color: ACCENT_AMBER },
    { sec: "Dharampeth (Z-DHA)", cam: "55/65 (84%)", stat: "Optimal", color: ACCENT_EMERALD },
    { sec: "Sadar (Z-SAD)", cam: "30/50 (60%)", stat: "Moderate Gap", color: ACCENT_AMBER },
    { sec: "Itwari (Z-ITW)", cam: "18/50 (36%)", stat: "CRITICAL BLIND SPOT", color: ACCENT_RED },
    { sec: "Sakkardara (Z-SAK)", cam: "22/45 (48%)", stat: "High Gap", color: ACCENT_AMBER },
    { sec: "Automotive Sq (Z-AUT)", cam: "12/40 (30%)", stat: "CRITICAL BLIND SPOT", color: ACCENT_RED },
  ];
  cctvRows.forEach((r, idx) => {
    doc.roundedRect(510, 145 + idx * 55, 390, 45, 6).fill("#0B0F19");
    doc.fillColor(TEXT_WHITE).fontSize(9.5).font("Helvetica-Bold").text(r.sec, 520, 160 + idx * 55);
    doc.fillColor(TEXT_MUTED).fontSize(9).font("Helvetica").text(r.cam, 660, 160 + idx * 55);
    doc.fillColor(r.color).fontSize(9).font("Helvetica-Bold").text(r.stat, 760, 160 + idx * 55);
  });

  // --- Slide 8 ---
  doc.addPage();
  drawBasePage(doc, "Algorithmic Patrol Force Allocation & Emergency SOS", "RESOURCE & EMERGENCY");

  doc.roundedRect(40, 90, 430, 400, 10).fill(CARD_BG);
  doc.fillColor(ACCENT_CYAN).fontSize(12).font("Helvetica-Bold").text("POLICE PATROL DEPLOYMENT ENGINE", 60, 110);
  doc.roundedRect(60, 135, 390, 50, 6).fill("#060A12");
  doc.fillColor(ACCENT_CYAN).fontSize(9.5).font("Courier-Bold").text("Req Patrols = Max(2, Round(Pop/50K + R_zone/15 + Δ_crime/20))", 70, 152, { align: "center" });

  const pFeat = [
    "Deficit Analysis: Required Patrols - Active Patrols per sector.",
    "1-Click Reallocation: Shifts units from low-risk (R < 35) to deficit sectors.",
    "Managed Units: PCR Vans, Quick Response Bikes, Interceptor Vehicles.",
  ];
  pFeat.forEach((pf, idx) => {
    doc.fillColor(TEXT_WHITE).fontSize(9.5).font("Helvetica").text(`• ${pf}`, 60, 205 + idx * 75, { width: 390 });
  });

  doc.roundedRect(490, 90, 430, 400, 10).fill(CARD_BG);
  doc.fillColor(ACCENT_RED).fontSize(12).font("Helvetica-Bold").text("CITIZEN EMERGENCY SOS DISPATCH SYSTEM", 510, 110);
  const sosList = [
    { dept: "Police Emergency (112)", desc: "Instant GPS broadcast to nearest PCR Van.", color: ACCENT_CYAN },
    { dept: "Medical Ambulance (108)", desc: "Direct route guidance to trauma hospitals.", color: ACCENT_EMERALD },
    { dept: "Fire & Rescue (101)", desc: "Hazard alert & station dispatch.", color: ACCENT_AMBER },
    { dept: "Women Safety Helpline (1091)", desc: "Priority interceptor unit tracking.", color: ACCENT_RED },
  ];
  sosList.forEach((s, idx) => {
    doc.roundedRect(510, 145 + idx * 80, 390, 68, 6).fill("#0B0F19");
    doc.fillColor(s.color).fontSize(11).font("Helvetica-Bold").text(s.dept, 525, 160 + idx * 80);
    doc.fillColor(TEXT_MUTED).fontSize(9.5).font("Helvetica").text(s.desc, 525, 182 + idx * 80);
  });

  // --- Slide 9 ---
  doc.addPage();
  drawBasePage(doc, "Risk-Aware Safe Night Navigation Engine", "AI SAFE NAVIGATION");

  const rComp = [
    { title: "ROUTE A — STANDARD FASTEST", time: "12 Mins", dist: "4.2 km", risk: "CRITICAL RISK (78/100)", light: "20% Lighting (Dark Alleys)", cctv: "Low CCTV Coverage (15%)", verdict: "NOT RECOMMENDED AT NIGHT", color: ACCENT_RED, x: 40 },
    { title: "ROUTE B — N-SHIELD SAFE ROUTE", time: "15 Mins (+3 min)", dist: "4.8 km", risk: "LOW RISK (22/100)", light: "90% Lighting (Main Arterials)", cctv: "High CCTV & PCR Presence", verdict: "RECOMMENDED SAFE ROUTE", color: ACCENT_EMERALD, x: 490 },
  ];

  rComp.forEach((rc) => {
    doc.roundedRect(rc.x, 90, 430, 400, 10).fill(CARD_BG);
    doc.roundedRect(rc.x, 90, 430, 400, 10).strokeColor(rc.color).lineWidth(1.5).stroke();
    doc.fillColor(rc.color).fontSize(14).font("Helvetica-Bold").text(rc.title, rc.x + 20, 115);
    doc.fillColor(TEXT_WHITE).fontSize(11).font("Helvetica-Bold").text(`• Estimated Travel Time: ${rc.time}`, rc.x + 20, 165);
    doc.fillColor(TEXT_WHITE).fontSize(11).font("Helvetica-Bold").text(`• Distance: ${rc.dist}`, rc.x + 20, 205);
    doc.fillColor(TEXT_WHITE).fontSize(11).font("Helvetica-Bold").text(`• Risk Score: ${rc.risk}`, rc.x + 20, 245);
    doc.fillColor(TEXT_WHITE).fontSize(11).font("Helvetica-Bold").text(`• Street Lighting: ${rc.light}`, rc.x + 20, 285);
    doc.fillColor(TEXT_WHITE).fontSize(11).font("Helvetica-Bold").text(`• Surveillance & Patrols: ${rc.cctv}`, rc.x + 20, 325);

    doc.roundedRect(rc.x + 20, 410, 390, 50, 8).fill("#0B0F19");
    doc.fillColor(rc.color).fontSize(12).font("Helvetica-Bold").text(rc.verdict, rc.x + 20, 428, { width: 390, align: "center" });
  });

  // --- Slide 10 ---
  doc.addPage();
  drawBasePage(doc, "Dark-Spot Heatmapping & Web Audio Acoustic Alarms", "NIGHT SAFETY INTELLIGENCE");

  doc.roundedRect(40, 90, 430, 400, 10).fill(CARD_BG);
  doc.fillColor(ACCENT_CYAN).fontSize(12).font("Helvetica-Bold").text("NIGHT-TIME THREAT MONITORING", 60, 110);
  const nFeat = [
    "Dynamic Night Lighting Deficit: Streetlight efficiency drops in calculations at 21:00 - 04:00 AM.",
    "Dark Spot Heatmapping: Maps unlit streets & nighttime threat zones across Nagpur.",
    "Synthesized Web Audio Alarm: Uses Web Audio API (audioService.ts) to sound acoustic warnings.",
    "Crowdsourced Citizen Reporting: Citizens report unlit streets to municipal electrical boards.",
  ];
  nFeat.forEach((nf, idx) => {
    doc.fillColor(TEXT_WHITE).fontSize(9.5).font("Helvetica").text(`• ${nf}`, 60, 150 + idx * 80, { width: 390 });
  });

  doc.roundedRect(490, 90, 430, 400, 10).fill("#060A12");
  doc.roundedRect(490, 90, 430, 400, 10).strokeColor(ACCENT_CYAN).lineWidth(1.5).stroke();
  doc.fillColor(ACCENT_CYAN).fontSize(12).font("Helvetica-Bold").text("LIVE NIGHT SAFETY MODE CONTROL", 510, 110, { width: 390, align: "center" });

  doc.roundedRect(530, 160, 350, 80, 8).fill("#0F2942");
  doc.fillColor(ACCENT_CYAN).fontSize(11).font("Helvetica-Bold").text("MODE: NIGHT SAFETY ACTIVE\nACOUSTIC ALARM: ENABLED (Web Audio API)", 540, 185, { width: 330, align: "center" });

  doc.fillColor(ACCENT_RED).fontSize(11).font("Helvetica-Bold").text("UNLIT CORRIDOR ALERT: AUTOMOTIVE SQ (Z-AUT)\nLIGHTING INDEX: 12% | NIGHT THREAT SCORE: 88/100", 510, 280, { width: 390, align: "center" });

  doc.roundedRect(530, 430, 350, 35, 6).fill("#0F172A");
  doc.fillColor(ACCENT_EMERALD).fontSize(8.5).font("Helvetica-Bold").text("STATUS: FULLY IMPLEMENTED IN REPOSITORY", 530, 442, { width: 350, align: "center" });

  // --- Slide 11 ---
  doc.addPage();
  drawBasePage(doc, "Mass Gathering & Public Event Risk Modeling Engine", "EVENT SIMULATOR");

  doc.roundedRect(40, 90, 430, 400, 10).fill(CARD_BG);
  doc.fillColor(ACCENT_CYAN).fontSize(12).font("Helvetica-Bold").text("PREDICTIVE EVENT IMPACT ENGINE", 60, 110);
  const evSteps = [
    "Select Event Scenario: VCA Stadium Cricket Match, Ganesh Visarjan Procession, Political Rally.",
    "Dynamic Variable Adjustments: Injects crowd surge density & traffic congestion multipliers.",
    "Sector Risk Recalculation: Recalculates target sector risk score (e.g. Dharampeth risk 48 -> 85).",
    "Automated Force Shift Generation: Calculates additional police PCR vans required for pre-event staging.",
  ];
  evSteps.forEach((es, idx) => {
    doc.fillColor(TEXT_WHITE).fontSize(9.5).font("Helvetica").text(`• ${es}`, 60, 150 + idx * 80, { width: 390 });
  });

  doc.roundedRect(490, 90, 430, 400, 10).fill(CARD_BG);
  doc.fillColor(ACCENT_AMBER).fontSize(12).font("Helvetica-Bold").text("SIMULATION CASE STUDY: VCA STADIUM MATCH", 510, 110);
  const simCases = [
    { label: "Baseline Sector Risk", val: "48 / 100 (Medium)", color: ACCENT_EMERALD },
    { label: "Estimated Footfall Surge", val: "+45,000 Spectators", color: ACCENT_AMBER },
    { label: "Simulated Post-Event Risk", val: "86 / 100 (Critical)", color: ACCENT_RED },
    { label: "Auto-Recommended Reinforcements", val: "+4 PCR Vans, +6 QR Bikes", color: ACCENT_CYAN },
  ];
  simCases.forEach((sc, idx) => {
    doc.roundedRect(510, 145 + idx * 75, 390, 65, 6).fill("#0B0F19");
    doc.fillColor(TEXT_MUTED).fontSize(9).font("Helvetica").text(sc.label, 525, 158 + idx * 75);
    doc.fillColor(sc.color).fontSize(12).font("Helvetica-Bold").text(sc.val, 525, 178 + idx * 75);
  });

  // --- Slide 12 ---
  doc.addPage();
  drawBasePage(doc, "Traditional Fragmented Systems vs. N-SHIELD Unified Command", "DIFFERENTIATION MATRIX");

  const matrixRows = [
    { cat: "Data Visibility", trad: "Disconnected paper FIRs & isolated digital files", nsh: "Unified 3D Digital Twin Command Dashboard" },
    { cat: "Risk Assessment", trad: "Static historical annual crime statistics", nsh: "Dynamic multi-factor risk engine (R_zone)" },
    { cat: "CCTV Infrastructure", trad: "Monitored individually without spatial context", nsh: "Coverage gap & critical blind spot analytics" },
    { cat: "Citizen Navigation", trad: "Optimized purely for distance & travel time", nsh: "Multi-variable safety & lighting aware routing" },
    { cat: "Patrol Allocation", trad: "Static beat patrols based on traditional boundaries", nsh: "Algorithmic deficit-based auto-reallocation" },
    { cat: "Event Management", trad: "Manual security planning & reactive deployment", nsh: "Real-time predictive event impact simulation" },
  ];

  doc.roundedRect(40, 90, 880, 400, 10).fill(CARD_BG);
  doc.fillColor(ACCENT_CYAN).fontSize(10).font("Helvetica-Bold").text("SAFETY DIMENSION", 60, 110);
  doc.fillColor(ACCENT_RED).fontSize(10).font("Helvetica-Bold").text("TRADITIONAL APPROACH", 280, 110);
  doc.fillColor(ACCENT_EMERALD).fontSize(10).font("Helvetica-Bold").text("N-SHIELD PLATFORM", 600, 110);

  matrixRows.forEach((mr, idx) => {
    doc.roundedRect(60, 135 + idx * 58, 840, 48, 6).fill("#0B0F19");
    doc.fillColor(TEXT_WHITE).fontSize(9.5).font("Helvetica-Bold").text(mr.cat, 70, 152 + idx * 58);
    doc.fillColor(TEXT_MUTED).fontSize(9).font("Helvetica").text(mr.trad, 280, 152 + idx * 58, { width: 300 });
    doc.fillColor(ACCENT_EMERALD).fontSize(9).font("Helvetica-Bold").text(mr.nsh, 600, 152 + idx * 58, { width: 290 });
  });

  // --- Slide 13 ---
  doc.addPage();
  drawBasePage(doc, "Production Enterprise Technology Stack & Architecture", "SYSTEM ARCHITECTURE");

  doc.roundedRect(40, 90, 430, 400, 10).fill(CARD_BG);
  doc.fillColor(ACCENT_CYAN).fontSize(12).font("Helvetica-Bold").text("IMPLEMENTED TECH STACK", 60, 110);
  const tStack = [
    { cat: "Core Web Framework", tech: "Next.js 16 (App Router), React 19, TypeScript" },
    { cat: "Styling & UI", tech: "Tailwind CSS v4, Lucide Icons, Recharts, Framer Motion" },
    { cat: "GIS & Digital Twin", tech: "Google Maps API (@vis.gl), Mapbox GL JS, Deck.gl" },
    { cat: "Audio Engine", tech: "Synthesized Web Audio API Alarm (audioService.ts)" },
    { cat: "REST API Endpoints", tech: "Next.js APIs: /api/incidents, /api/cctv, /api/zones" },
  ];
  tStack.forEach((t, idx) => {
    doc.fillColor(ACCENT_CYAN).fontSize(10).font("Helvetica-Bold").text(`• ${t.cat}`, 60, 145 + idx * 68);
    doc.fillColor(TEXT_WHITE).fontSize(9.5).font("Helvetica").text(t.tech, 60, 163 + idx * 68);
  });

  doc.roundedRect(490, 90, 430, 400, 10).fill(CARD_BG);
  doc.fillColor(ACCENT_EMERALD).fontSize(12).font("Helvetica-Bold").text("DATA & ENGINE ARCHITECTURE", 510, 110);
  const aLayers = [
    { layer: "Presentation Layer", detail: "Next.js 16 React Client + Google Maps / Mapbox Canvas" },
    { layer: "API Gateway", detail: "REST APIs (/api/*) + Real-time RSS News Feed Service" },
    { layer: "Intelligence Layer", detail: "RiskEngine + BlindSpotIntelligence + DeploymentEngine" },
    { layer: "City Data Infrastructure", detail: "Nagpur Sector Coordinates, CCTV Nodes & Incident Schema" },
  ];
  aLayers.forEach((a, idx) => {
    doc.roundedRect(510, 145 + idx * 80, 390, 68, 6).fill("#0B0F19");
    doc.fillColor(ACCENT_EMERALD).fontSize(10.5).font("Helvetica-Bold").text(a.layer, 525, 160 + idx * 80);
    doc.fillColor(TEXT_MUTED).fontSize(9).font("Helvetica").text(a.detail, 525, 182 + idx * 80);
  });

  // --- Slide 14 ---
  doc.addPage();
  drawBasePage(doc, "Multi-Stakeholder Value & City-Wide Expansion Path", "REAL-WORLD IMPACT");

  const sHolders = [
    { title: "Law Enforcement / Police 112", benefits: ["Real-time 3D GIS situational awareness", "Deficit-based force reallocation", "XAI transparent tactical directives"], color: ACCENT_CYAN },
    { title: "Smart City Authorities", benefits: ["Data-driven CCTV installation planning", "Streetlight maintenance prioritization", "Mass event safety risk management"], color: ACCENT_EMERALD },
    { title: "Citizens & Tourists", benefits: ["Risk-aware safe night navigation", "1-Tap multi-department SOS dispatch", "Crowdsourced dark-spot reporting"], color: ACCENT_AMBER },
    { title: "Emergency Medical & Fire", benefits: ["Sub-second location identification", "Direct trauma route guidance", "Multi-agency coordination"], color: ACCENT_RED },
  ];

  sHolders.forEach((sh, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const xPos = 40 + col * 445;
    const yPos = 90 + row * 200;

    doc.roundedRect(xPos, yPos, 430, 180, 8).fill(CARD_BG);
    doc.fillColor(sh.color).fontSize(14).font("Helvetica-Bold").text(sh.title, xPos + 20, yPos + 20);
    sh.benefits.forEach((b, bIdx) => {
      doc.fillColor(TEXT_WHITE).fontSize(10).font("Helvetica").text(`• ${b}`, xPos + 20, yPos + 60 + bIdx * 35);
    });
  });

  // --- Slide 15 ---
  doc.addPage();
  drawBasePage(doc, "Phased Implementation Roadmap & Strategic Vision", "ROADMAP & VISION");

  const pList = [
    { phase: "PHASE 1 (CURRENT)", title: "Interactive Prototype & 6-Sector Command Center Model", color: ACCENT_CYAN },
    { phase: "PHASE 2 (MONTHS 1-3)", title: "Integration with Nagpur Police CCTNS FIR Database", color: ACCENT_EMERALD },
    { phase: "PHASE 3 (MONTHS 3-6)", title: "IoT Smart Streetlight & Acoustic Sensor Ingestion", color: ACCENT_AMBER },
    { phase: "PHASE 4 (MONTHS 6-12)", title: "Spatio-Temporal GNN Crime Forecasting Models", color: ACCENT_RED },
  ];

  pList.forEach((ph, idx) => {
    const xPos = 40 + idx * 220;
    doc.roundedRect(xPos, 90, 210, 240, 10).fill(CARD_BG);
    doc.fillColor(ph.color).fontSize(9).font("Helvetica-Bold").text(ph.phase, xPos + 15, 110);
    doc.fillColor(TEXT_WHITE).fontSize(11).font("Helvetica-Bold").text(ph.title, xPos + 15, 140, { width: 180 });
  });

  doc.roundedRect(40, 350, 880, 140, 10).fill("#0F2942");
  doc.roundedRect(40, 350, 880, 140, 10).strokeColor(ACCENT_CYAN).lineWidth(1.5).stroke();
  doc.fillColor(ACCENT_CYAN).fontSize(11).font("Helvetica-Bold").text("STRATEGIC CLOSING VISION", 60, 368, { width: 840, align: "center" });
  doc.fillColor(TEXT_WHITE).fontSize(13).font("Helvetica-Bold").text(
    "\"N-SHIELD does not replace law enforcement; it empowers city decision-makers with a unified intelligence layer to transform urban safety from reactive incident management into proactive, data-driven protection.\"",
    60,
    400,
    { width: 840, align: "center" }
  );

  doc.end();
  console.log(`PDF file generated successfully: ${pdfPath}`);
}

async function run() {
  try {
    await buildPptx();
    buildPdf();
  } catch (err) {
    console.error("Error generating presentation files:", err);
  }
}

run();
