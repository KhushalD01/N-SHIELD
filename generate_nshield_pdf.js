const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const brainDir = 'C:\\Users\\Khushal\\.gemini\\antigravity-ide\\brain\\4b6e15fc-0544-40eb-a8f6-e5ef98dd5cb6';
const outputPath = path.join(__dirname, 'N_SHIELD_All_Project_Images.pdf');
const downloadsPath = 'C:\\Users\\Khushal\\Downloads\\N_SHIELD_All_Project_Images.pdf';

const items = [
  {
    title: '1. N-SHIELD Cover / Hero Screen',
    img: path.join(brainDir, 'nshield_cover_hero_1788964563327.jpg'),
    desc: 'Hero presentation screen introducing N-SHIELD with an interactive futuristic Nagpur safety map grid, primary branding, and quick action buttons to explore safety maps or initiate emergency support.'
  },
  {
    title: '2. Main Citizen Dashboard - Desktop',
    img: path.join(brainDir, 'nshield_main_dashboard_1788964584906.jpg'),
    desc: 'Comprehensive desktop dashboard featuring sidebar navigation, top location search bar, central Google Maps zone map with Low/Medium/High safety overlays, and quick access cards for local police, hospitals, and emergency contacts.'
  },
  {
    title: '3. Interactive Safety Map Screen',
    img: path.join(brainDir, 'nshield_interactive_map_1788964641283.jpg'),
    desc: 'Detailed interactive map interface of Nagpur featuring color-coded risk zones (Green, Orange, Red), category filter pills, map pin markers for essential services, and a right-hand location insight panel.'
  },
  {
    title: '4. Location Details Screen',
    img: path.join(brainDir, 'nshield_location_details_1788964663630.jpg'),
    desc: 'Focused spatial analysis page for specific Nagpur neighborhoods (e.g., Sitabuldi) displaying a visual safety score meter, verified incident updates, nearby service distances, and quick direction buttons.'
  },
  {
    title: '5. Crime Category Filter Screen',
    img: path.join(brainDir, 'nshield_category_filter_1788964687295.jpg'),
    desc: 'Dynamic incident filter interface enabling users to filter safety data by category (Theft, Robbery, Assault, Burglary), date ranges, and risk levels, with real-time map marker updates and incident counters.'
  },
  {
    title: '6. Verified Safety Updates and News',
    img: path.join(brainDir, 'nshield_verified_news_1788964704831.jpg'),
    desc: 'Trusted news feed displaying AI-summarized daily safety highlights, verified incident cards with official source tags, location metadata, and transparent public safety news references.'
  },
  {
    title: '7. Nearby Emergency Services',
    img: path.join(brainDir, 'nshield_nearby_emergency_1788964731204.jpg'),
    desc: 'High-contrast emergency service interface featuring prominent 1-tap call buttons for Police (112) and Ambulance (108), interactive hospital locator map, and 24/7 service availability listings.'
  },
  {
    title: '8. Emergency SOS Mobile Screen',
    img: path.join(brainDir, 'nshield_emergency_sos_mobile_1788964745121.jpg'),
    desc: 'Mobile-first, calm panic screen providing instant access to emergency hotlines (Police, Ambulance, Fire, Trusted Contacts), live GPS location display, and one-touch location sharing.'
  },
  {
    title: '9. Safer Route Comparison',
    img: path.join(brainDir, 'nshield_safer_route_1788964771458.jpg'),
    desc: 'Predictive travel safety tool comparing multiple routes from Nagpur Station to Dharampeth based on lighting quality, police presence, and aggregated risk index, highlighting the Recommended Safer Route.'
  },
  {
    title: '10. AI Safety Assistant',
    img: path.join(brainDir, 'nshield_ai_assistant_1788964786777.jpg'),
    desc: 'Conversational AI chat assistant inside N-SHIELD answering citizen queries regarding neighborhood safety, late-night travel advisories, and providing instant links to maps and emergency help.'
  },
  {
    title: '11. Safety Tips Screen',
    img: path.join(brainDir, 'nshield_safety_tips_1788964813122.jpg'),
    desc: 'Card-based safety guide providing citizens with practical travel advice, emergency preparation checklists, live location sharing best practices, and well-lit route recommendations.'
  },
  {
    title: '12. Authorized Admin Dashboard',
    img: path.join(brainDir, 'nshield_admin_dashboard_1788964832702.jpg'),
    desc: 'Command center dashboard for municipal authorities and police partners showcasing citywide incident analytics, zone activity trends, verification queues, and broadcast emergency alert management.'
  },
  {
    title: '13. Mobile Home Dashboard',
    img: path.join(brainDir, 'nshield_mobile_dashboard_1788964874406.jpg'),
    desc: 'Compact smartphone home screen featuring a live mini safety map, current area risk badge, quick emergency shortcuts, recent area alerts, and bottom navigation bar.'
  },
  {
    title: '14. System Architecture Infographic',
    isVector: true,
    type: 'architecture',
    desc: 'Technical architecture diagram illustrating the end-to-end data flow from Next.js citizen clients through Express REST APIs, AI Risk Engine, GIS Mapbox/Deck.gl layers, to Emergency SOS dispatch systems.'
  },
  {
    title: '15. Complete User Journey Infographic',
    isVector: true,
    type: 'user_journey',
    desc: 'Visual step-by-step citizen workflow detailing how users launch N-SHIELD, search locations, evaluate risk scores, view nearby emergency services, select safer routes, and make informed travel decisions.'
  }
];

const totalPages = 17; // Cover (1) + TOC (1) + 15 Pages = 17

const doc = new PDFDocument({
  size: 'A4',
  margin: 40,
  bufferPages: true
});

const writeStream = fs.createWriteStream(outputPath);
doc.pipe(writeStream);

// --- Colors ---
const NAVY = '#0B132B';
const NAVY_CARD = '#1C2541';
const ORANGE = '#FF6B35';
const WHITE = '#FFFFFF';
const LIGHT_BG = '#F4F6F9';
const DARK_TEXT = '#1E293B';
const MUTED_TEXT = '#64748B';
const BORDER_BLUE = '#3A506B';

// ==========================================
// PAGE 1: COVER PAGE
// ==========================================
doc.rect(0, 0, 595.28, 841.89).fill(NAVY);

// Outer Border Line
doc.save();
doc.strokeColor(ORANGE).lineWidth(2.5).opacity(0.8);
doc.rect(35, 35, 525.28, 771.89).stroke();
doc.restore();

// Cover Header Content
doc.fillColor(WHITE).fontSize(38).font('Helvetica-Bold').text('N-SHIELD', 60, 200, { align: 'center' });
doc.fillColor(ORANGE).fontSize(18).font('Helvetica-Bold').text('AI-POWERED URBAN SAFETY INTELLIGENCE', 60, 250, { align: 'center' });

doc.fillColor('#E2E8F0').fontSize(14).font('Helvetica').text('Smart City Safety Platform for Nagpur, Maharashtra', 60, 290, { align: 'center' });

// Decorative Line
doc.moveTo(180, 330).lineTo(415, 330).strokeColor(ORANGE).lineWidth(2).stroke();

// Description Block
doc.fillColor('#94A3B8').fontSize(10.5).font('Helvetica')
  .text('Complete UI Screens, Digital Twin Dashboards, Spatial Safety Analytics, System Architecture & User Journey Documentation', 80, 365, { align: 'center', width: 435, lineGap: 4 });

// Author Box Card
doc.roundedRect(80, 520, 435, 170, 10).fill(NAVY_CARD).strokeColor(BORDER_BLUE).lineWidth(1.5).stroke();

doc.fillColor(ORANGE).fontSize(12).font('Helvetica-Bold').text('OFFICIAL PROJECT COMPILATION REPORT', 100, 545, { align: 'center', width: 395 });
doc.fillColor(WHITE).fontSize(18).font('Helvetica-Bold').text('Prepared by: Khushal Deogade', 100, 575, { align: 'center', width: 395 });
doc.fillColor('#94A3B8').fontSize(11).font('Helvetica').text('Target Location: Nagpur City, Maharashtra, India', 100, 610, { align: 'center', width: 395 });
doc.fillColor('#64748B').fontSize(10).font('Helvetica').text('Use Case: College Project Report / Hackathon / Fund My Crazy Submission', 100, 638, { align: 'center', width: 395 });
doc.fillColor(ORANGE).fontSize(9.5).font('Helvetica-Bold').text('Status: Fictional / Demo Safety Data Only', 100, 660, { align: 'center', width: 395 });


// ==========================================
// PAGE 2: TABLE OF CONTENTS
// ==========================================
doc.addPage();
renderPageHeader(doc, 'TABLE OF CONTENTS', 'N-SHIELD UI Screens & Architecture Index');

doc.fillColor(DARK_TEXT).fontSize(14).font('Helvetica-Bold').text('Document Structure & Screen Index', 50, 95);
doc.moveTo(50, 115).lineTo(545, 115).strokeColor(ORANGE).lineWidth(1.5).stroke();

let yPos = 135;

items.forEach((item, index) => {
  const pageNum = index + 3;
  
  // Row card background
  doc.rect(50, yPos - 4, 495, 32).fill(index % 2 === 0 ? '#F8FAFC' : WHITE);
  doc.rect(50, yPos - 4, 3, 32).fill(ORANGE);
  
  doc.fillColor(DARK_TEXT).fontSize(10.5).font('Helvetica-Bold').text(item.title, 62, yPos + 5);
  
  // Dotted leader line
  doc.fillColor('#CBD5E1').fontSize(10).font('Helvetica').text('. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .', 240, yPos + 5, { width: 240 });
  
  doc.fillColor(NAVY).fontSize(10.5).font('Helvetica-Bold').text(`Page ${pageNum}`, 485, yPos + 5, { align: 'right', width: 50 });
  
  yPos += 40;
});

renderPageFooter(doc, 2);

// ==========================================
// PAGES 3 to 17: SCREEN DISPLAY PAGES
// ==========================================
items.forEach((item, index) => {
  doc.addPage();
  const pageNum = index + 3;
  
  renderPageHeader(doc, item.title.toUpperCase(), 'N-SHIELD Nagpur Urban Safety Platform');
  
  // Title Header on Page
  doc.fillColor(NAVY).fontSize(15).font('Helvetica-Bold').text(item.title, 50, 88);
  doc.moveTo(50, 110).lineTo(545, 110).strokeColor(ORANGE).lineWidth(2).stroke();
  
  const imgY = 120;
  const maxImgWidth = 495;
  const maxImgHeight = 450;
  
  if (item.isVector) {
    if (item.type === 'architecture') {
      renderArchitectureVector(doc, 50, imgY, maxImgWidth, maxImgHeight);
    } else if (item.type === 'user_journey') {
      renderUserJourneyVector(doc, 50, imgY, maxImgWidth, maxImgHeight);
    }
  } else {
    try {
      doc.image(item.img, 50, imgY, {
        fit: [maxImgWidth, maxImgHeight],
        align: 'center',
        valign: 'center'
      });
    } catch (err) {
      console.error(`Error embedding image ${item.img}:`, err);
    }
  }
  
  // Description Card below image
  const descY = 590;
  doc.roundedRect(50, descY, 495, 175, 8).fill('#F8FAFC').strokeColor('#E2E8F0').lineWidth(1).stroke();
  doc.rect(50, descY, 5, 175).fill(ORANGE);
  
  doc.fillColor(NAVY).fontSize(12).font('Helvetica-Bold').text('Screen Overview & Technical Purpose:', 68, descY + 16);
  doc.fillColor(DARK_TEXT).fontSize(10.5).font('Helvetica').text(item.desc, 68, descY + 38, { width: 460, lineGap: 4 });
  
  doc.fillColor(MUTED_TEXT).fontSize(9).font('Helvetica-Oblique').text('Platform Scope: Nagpur Smart City Digital Twin | Data Source: Verified Public & Municipal Data Streams', 68, descY + 140);
  
  renderPageFooter(doc, pageNum);
});

// ==========================================
// VECTOR DIAGRAM RENDERERS FOR 14 & 15
// ==========================================
function renderArchitectureVector(pdf, x, y, width, height) {
  pdf.roundedRect(x, y, width, height, 10).fill(NAVY).strokeColor(BORDER_BLUE).lineWidth(1.5).stroke();
  
  // Title inside diagram card
  pdf.fillColor(WHITE).fontSize(16).font('Helvetica-Bold').text('N-SHIELD SYSTEM ARCHITECTURE', x + 20, y + 20, { align: 'center', width: width - 40 });
  pdf.fillColor(ORANGE).fontSize(10).font('Helvetica-Bold').text('End-to-End Data Pipeline & Services Infrastructure', x + 20, y + 42, { align: 'center', width: width - 40 });
  
  // 5 Pipeline Nodes
  const nodes = [
    { title: 'Citizen Clients', desc: 'Next.js 16 Web App\nReact Mobile PWA', icon: '📱' },
    { title: 'API Gateway', desc: 'Express REST API\nAuth & Rate Limiting', icon: '⚡' },
    { title: 'AI Risk Engine', desc: 'Mathematical Scoring\nXAI Analytics Module', icon: '🧠' },
    { title: 'GIS & Mapping', desc: 'Google Maps JS API\nMapbox 3D Extrusions', icon: '🗺️' },
    { title: 'Emergency SOS', desc: 'Police 112 Dispatch\nHospital Locator', icon: '🚨' }
  ];
  
  const nodeW = 82;
  const nodeH = 180;
  const gap = 14;
  let startX = x + 15;
  const startY = y + 80;
  
  nodes.forEach((node, i) => {
    // Node Box
    pdf.roundedRect(startX, startY, nodeW, nodeH, 8).fill(NAVY_CARD).strokeColor(BORDER_BLUE).lineWidth(1.2).stroke();
    
    // Header accent
    pdf.roundedRect(startX, startY, nodeW, 30, 8).fill(BORDER_BLUE);
    pdf.fillColor(ORANGE).fontSize(10).font('Helvetica-Bold').text(`STEP ${i + 1}`, startX + 5, startY + 10, { align: 'center', width: nodeW - 10 });
    
    // Title & Subtitle
    pdf.fillColor(WHITE).fontSize(10).font('Helvetica-Bold').text(node.title, startX + 4, startY + 42, { align: 'center', width: nodeW - 8 });
    
    pdf.moveTo(startX + 10, startY + 80).lineTo(startX + nodeW - 10, startY + 80).strokeColor(ORANGE).lineWidth(1).stroke();
    
    pdf.fillColor('#A0AEC0').fontSize(8.5).font('Helvetica').text(node.desc, startX + 4, startY + 95, { align: 'center', width: nodeW - 8, lineGap: 3 });
    
    // Connector arrow if not last node
    if (i < nodes.length - 1) {
      const arrowX = startX + nodeW;
      pdf.moveTo(arrowX, startY + 90).lineTo(arrowX + gap, startY + 90).strokeColor(ORANGE).lineWidth(2).stroke();
    }
    
    startX += nodeW + gap;
  });
  
  // Footer Tech Badges inside diagram
  const badgeY = y + 300;
  pdf.roundedRect(x + 20, badgeY, width - 40, 120, 8).fill(NAVY_CARD).strokeColor(BORDER_BLUE).lineWidth(1).stroke();
  
  pdf.fillColor(WHITE).fontSize(11).font('Helvetica-Bold').text('Core Infrastructure Technologies:', x + 35, badgeY + 15);
  
  const techList = [
    '• Frontend: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4',
    '• Geospatial Engine: Google Maps JavaScript API, Deck.gl GPU Aggregation Layers',
    '• Safety Analytics: Mathematical Risk Scoring Engine (Incident Load + CCTV Deficit)',
    '• Emergency Integrations: Nagpur 112 Police Dispatcher & 108 Emergency Ambulance Feed'
  ];
  
  techList.forEach((tech, idx) => {
    pdf.fillColor('#CBD5E1').fontSize(9.5).font('Helvetica').text(tech, x + 35, badgeY + 38 + (idx * 18));
  });
}

function renderUserJourneyVector(pdf, x, y, width, height) {
  pdf.roundedRect(x, y, width, height, 10).fill(NAVY).strokeColor(BORDER_BLUE).lineWidth(1.5).stroke();
  
  // Title inside diagram card
  pdf.fillColor(WHITE).fontSize(16).font('Helvetica-Bold').text('N-SHIELD CITIZEN USER JOURNEY', x + 20, y + 20, { align: 'center', width: width - 40 });
  pdf.fillColor(ORANGE).fontSize(10).font('Helvetica-Bold').text('Proactive Safety Decision Workflow for Nagpur Residents', x + 20, y + 42, { align: 'center', width: width - 40 });
  
  // 6 Steps Grid (2 rows of 3)
  const steps = [
    { num: '1', title: 'Open N-SHIELD App', desc: 'Citizen launches N-SHIELD web or mobile app on device.' },
    { num: '2', title: 'Search Location', desc: 'Inputs location or route in Nagpur (e.g. Sitabuldi).' },
    { num: '3', title: 'Evaluate Safety Risk', desc: 'Checks live Low/Medium/High safety zone overlay & verified alerts.' },
    { num: '4', title: 'View Emergency Help', desc: 'Locates nearby police stations, hospitals & emergency contacts.' },
    { num: '5', title: 'Choose Safer Route', desc: 'Compares route lighting scores & selects lower-risk path.' },
    { num: '6', title: 'Travel Confidently', desc: 'Reaches destination safely with real-time awareness.' }
  ];
  
  const cardW = 145;
  const cardH = 150;
  
  steps.forEach((step, idx) => {
    const col = idx % 3;
    const row = Math.floor(idx / 3);
    
    const cardX = x + 20 + col * (cardW + 18);
    const cardY = y + 80 + row * (cardH + 20);
    
    pdf.roundedRect(cardX, cardY, cardW, cardH, 8).fill(NAVY_CARD).strokeColor(BORDER_BLUE).lineWidth(1.2).stroke();
    
    // Number badge
    pdf.circle(cardX + 25, cardY + 25, 14).fill(ORANGE);
    pdf.fillColor(WHITE).fontSize(11).font('Helvetica-Bold').text(step.num, cardX + 11, cardY + 20, { align: 'center', width: 28 });
    
    // Step Title
    pdf.fillColor(WHITE).fontSize(11).font('Helvetica-Bold').text(step.title, cardX + 45, cardY + 18, { width: cardW - 52 });
    
    pdf.moveTo(cardX + 15, cardY + 52).lineTo(cardX + cardW - 15, cardY + 52).strokeColor(BORDER_BLUE).lineWidth(1).stroke();
    
    // Step Description
    pdf.fillColor('#A0AEC0').fontSize(9.5).font('Helvetica').text(step.desc, cardX + 12, cardY + 62, { width: cardW - 24, lineGap: 3 });
  });
  
  // Footer banner inside user journey
  const footerY = y + 380;
  pdf.roundedRect(x + 20, footerY, width - 40, 50, 8).fill(NAVY_CARD).strokeColor(ORANGE).lineWidth(1).stroke();
  pdf.fillColor(ORANGE).fontSize(11).font('Helvetica-Bold').text('KEY IMPACT:', x + 35, footerY + 17);
  pdf.fillColor(WHITE).fontSize(10).font('Helvetica').text('Reduces urban risk exposure through actionable spatial intelligence & instant emergency response.', x + 115, footerY + 17);
}

// ==========================================
// HELPER FUNCTIONS FOR HEADER & FOOTER
// ==========================================
function renderPageHeader(pdf, titleText, subtitleText) {
  pdf.rect(0, 0, 595.28, 65).fill(NAVY);
  pdf.rect(0, 62, 595.28, 3).fill(ORANGE);
  
  pdf.fillColor(WHITE).fontSize(12).font('Helvetica-Bold').text('N-SHIELD', 40, 22);
  pdf.fillColor(ORANGE).fontSize(10).font('Helvetica-Bold').text('URBAN SAFETY INTELLIGENCE', 115, 23);
  
  pdf.fillColor('#E2E8F0').fontSize(10).font('Helvetica').text(titleText, 250, 23, { align: 'right', width: 305 });
}

function renderPageFooter(pdf, currentPage) {
  pdf.rect(0, 800, 595.28, 41.89).fill('#F1F5F9');
  pdf.moveTo(0, 800).lineTo(595.28, 800).strokeColor('#CBD5E1').lineWidth(1).stroke();
  
  pdf.fillColor(MUTED_TEXT).fontSize(9).font('Helvetica')
    .text('N-SHIELD • AI-Powered Urban Safety Platform for Nagpur', 40, 814);
    
  pdf.fillColor(NAVY).fontSize(9).font('Helvetica-Bold')
    .text(`Page ${currentPage} of ${totalPages}`, 450, 814, { align: 'right', width: 105 });
}

doc.end();

writeStream.on('finish', () => {
  console.log('PDF compilation completed successfully!');
  try {
    fs.copyFileSync(outputPath, downloadsPath);
    console.log('Successfully copied N_SHIELD_All_Project_Images.pdf to Downloads!');
  } catch (e) {
    console.error('Error copying to downloads:', e);
  }
});
