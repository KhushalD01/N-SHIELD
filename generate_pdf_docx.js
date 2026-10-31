const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const doc = new PDFDocument({ margin: 50 });
const pdfPath = path.join(__dirname, 'PROJECT_DOCUMENTATION.pdf');
const stream = fs.createWriteStream(pdfPath);

doc.pipe(stream);

// Header Title
doc.fillColor('#06B6D4').fontSize(22).text('USAI - Nagpur City Command Center', { align: 'center' });
doc.fillColor('#10B981').fontSize(14).text('AI-Powered Urban Safety Intelligence System', { align: 'center' });
doc.moveDown(1.5);

// Executive Summary
doc.fillColor('#000000').fontSize(16).text('1. Executive Summary & Vision', { underline: true });
doc.moveDown(0.5);
doc.fontSize(10).text(
  'USAI (Urban Safety AI) is an advanced spatial safety intelligence platform and 3D Command Center engineered for Nagpur City, India. Built for municipal command centers, police dispatchers (112), and emergency services, USAI integrates real-time risk heatmapping, CCTV blind spot detection, AI police force deployment, public event forecasting, and Explainable AI (XAI) into a unified digital twin.'
);
doc.moveDown(1.5);

// Tech Stack
doc.fontSize(16).text('2. System Architecture & Tech Stack', { underline: true });
doc.moveDown(0.5);
doc.fontSize(10).text('• Core Framework: Next.js 16 (App Router) + React 19 + TypeScript');
doc.text('• Styling: Tailwind CSS v4 + Cyan/Emerald Futuristic Theme');
doc.text('• Mapping & 3D Twin: Google Maps JS API + Mapbox GL JS 3D Extrusions');
doc.text('• GPU Acceleration: Deck.gl Heatmaps & Sensor Nodes');
doc.text('• Audio System: Web Audio API Alarm Synthesizer');
doc.moveDown(1.5);

// Nagpur Sectors
doc.fontSize(16).text('3. Nagpur Administrative Sectors', { underline: true });
doc.moveDown(0.5);
const sectors = [
  '• Sitabuldi (Z-SIT): 21.1458° N, 79.0882° E | Commercial Transit Hub | Pop: 120k',
  '• Dharampeth (Z-DHA): 21.1412° N, 79.0610° E | Residential & Commercial | Pop: 180k',
  '• Sadar (Z-SAD): 21.1610° N, 79.0815° E | Market & Dining District | Pop: 140k',
  '• Itwari (Z-ITW): 21.1520° N, 79.1120° E | Dense Historic Commerce | Pop: 210k',
  '• Sakkardara (Z-SAK): 21.1210° N, 79.1050° E | South Nagpur Residential | Pop: 195k',
  '• Automotive Sq (Z-AUT): 21.1920° N, 79.0910° E | Highway & Industrial Corridor | Pop: 110k'
];
sectors.forEach(s => doc.fontSize(10).text(s));
doc.moveDown(1.5);

// Core Algorithms
doc.fontSize(16).text('4. Core Mathematics & Algorithmic Engines', { underline: true });
doc.moveDown(0.5);
doc.fontSize(10).text('Risk Score Formula: RiskScore = min(100, Round((IncidentLoad * 0.38 + TimeFactor * 0.27 + CCTVDeficit * 0.22 + LightingDeficit * 0.13) * 100))');
doc.moveDown(0.5);
doc.text('Required Patrol Formula: RequiredPatrols = max(2, Round((Population / 50000) + (RiskScore / 15) + (CrimeVelocity / 20)))');
doc.moveDown(1.5);

// API Specifications
doc.fontSize(16).text('5. REST API Architecture', { underline: true });
doc.moveDown(0.5);
doc.fontSize(10).text('• GET /api/incidents - Query incidents with zone, severity, and status filters.');
doc.text('• GET /api/cctv - Fetch surveillance camera health and operational coverage ratios.');
doc.text('• GET /api/zones - Spatial zone coordinates, officer details, and active patrol counts.');
doc.text('• GET /api/news - Real-time aggregated crime and safety news feed for Nagpur.');
doc.moveDown(1.5);

// Setup
doc.fontSize(16).text('6. Quick Start & Execution', { underline: true });
doc.moveDown(0.5);
doc.fontSize(10).text('1. Run: npm install');
doc.text('2. Configure .env.local with NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN');
doc.text('3. Run dev server: npm run dev');
doc.moveDown(2);

doc.fontSize(8).fillColor('#666666').text('USAI Nagpur Command Center - Automated PDF Documentation', { align: 'center' });

doc.end();

stream.on('finish', () => {
  console.log('Successfully generated PROJECT_DOCUMENTATION.pdf');
});
