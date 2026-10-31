import sys
import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

def build_presentation():
    prs = Presentation()
    # 16:9 widescreen (13.333 x 7.5 inches)
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6] # blank layout

    # Color Palette
    BG_COLOR = RGBColor(11, 19, 38)        # Deep Navy / Charcoal
    CARD_BG = RGBColor(19, 31, 58)         # Elevated Slate Card
    ACCENT_CYAN = RGBColor(6, 182, 212)    # Electric Cyan
    ACCENT_GREEN = RGBColor(16, 185, 129)  # Safety Emerald
    ACCENT_RED = RGBColor(239, 68, 68)     # Alert Red
    TEXT_WHITE = RGBColor(248, 250, 252)   # Pure text
    TEXT_MUTED = RGBColor(148, 163, 184)   # Slate gray
    BORDER_CYAN = RGBColor(14, 116, 144)

    def set_slide_background(slide):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
        bg.fill.solid()
        bg.fill.fore_color.rgb = BG_COLOR
        bg.line.fill.background()
        return bg

    def add_header(slide, title_text, category="N-SHIELD // URBAN SAFETY INTELLIGENCE"):
        # Category / Kicker
        kicker_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.45), Inches(11.5), Inches(0.35))
        tf_k = kicker_box.text_frame
        tf_k.word_wrap = True
        p_k = tf_k.paragraphs[0]
        p_k.text = category.upper()
        p_k.font.size = Pt(11)
        p_k.font.bold = True
        p_k.font.color.rgb = ACCENT_CYAN
        p_k.font.name = "Segoe UI"

        # Main Title
        title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.75), Inches(11.5), Inches(0.7))
        tf_t = title_box.text_frame
        tf_t.word_wrap = True
        p_t = tf_t.paragraphs[0]
        p_t.text = title_text
        p_t.font.size = Pt(24)
        p_t.font.bold = True
        p_t.font.color.rgb = TEXT_WHITE
        p_t.font.name = "Segoe UI"

    def add_footer(slide, slide_num):
        # Footer text
        footer_box = slide.shapes.add_textbox(Inches(0.8), Inches(7.0), Inches(11.7), Inches(0.3))
        tf = footer_box.text_frame
        p = tf.paragraphs[0]
        p.text = f"N-SHIELD: AI-Driven Urban Safety Platform • Nagpur, Maharashtra                     Slide {slide_num}"
        p.font.size = Pt(9)
        p.font.color.rgb = TEXT_MUTED
        p.font.name = "Segoe UI"

    def add_card(slide, left, top, width, height, title, items, border_color=None, title_color=ACCENT_CYAN):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        if border_color:
            card.line.color.rgb = border_color
            card.line.width = Pt(1.5)
        else:
            card.line.fill.background()

        # Text inside card
        tb = slide.shapes.add_textbox(left + Inches(0.2), top + Inches(0.15), width - Inches(0.4), height - Inches(0.3))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.vertical_anchor = MSO_ANCHOR.TOP

        if title:
            p0 = tf.paragraphs[0]
            p0.text = title
            p0.font.size = Pt(15)
            p0.font.bold = True
            p0.font.color.rgb = title_color
            p0.font.name = "Segoe UI"
            p0.space_after = Pt(8)

        for idx, item in enumerate(items):
            p = tf.add_paragraph() if (title or idx > 0) else tf.paragraphs[0]
            p.text = f"•  {item}"
            p.font.size = Pt(11)
            p.font.color.rgb = TEXT_WHITE
            p.font.name = "Segoe UI"
            p.space_after = Pt(6)

    def set_speaker_notes(slide, notes):
        notes_slide = slide.notes_slide
        tf = notes_slide.notes_text_frame
        tf.text = notes

    # -------------------------------------------------------------
    # SLIDE 1: TITLE SLIDE
    # -------------------------------------------------------------
    s1 = prs.slides.add_slide(blank_layout)
    set_slide_background(s1)

    # Accent decorative top bar
    bar = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), prs.slide_width, Inches(0.1))
    bar.fill.solid()
    bar.fill.fore_color.rgb = ACCENT_CYAN
    bar.line.fill.background()

    # Title box
    tbox = s1.shapes.add_textbox(Inches(1.0), Inches(1.8), Inches(11.3), Inches(2.2))
    tf1 = tbox.text_frame
    tf1.word_wrap = True
    p1 = tf1.paragraphs[0]
    p1.text = "N-SHIELD"
    p1.font.size = Pt(48)
    p1.font.bold = True
    p1.font.color.rgb = ACCENT_CYAN
    p1.font.name = "Segoe UI"

    p2 = tf1.add_paragraph()
    p2.text = "AI-Driven Urban Safety Intelligence Model"
    p2.font.size = Pt(28)
    p2.font.bold = True
    p2.font.color.rgb = TEXT_WHITE
    p2.font.name = "Segoe UI"
    p2.space_before = Pt(8)

    p3 = tf1.add_paragraph()
    p3.text = "Real-Time Crime Analytics, Predictive Safe Routing, Verified Healthcare Directory & One-Tap Emergency Telemetry"
    p3.font.size = Pt(14)
    p3.font.color.rgb = TEXT_MUTED
    p3.font.name = "Segoe UI"
    p3.space_before = Pt(10)

    # Info card at bottom
    add_card(s1, Inches(1.0), Inches(4.5), Inches(11.3), Inches(1.8), "", [
        "Geographic Focus: Nagpur Metropolitan Area, Maharashtra, India",
        "Target Domain: Smart City Urban Security, Women & Night-Traveler Safety, Rapid Golden-Hour Trauma Response",
        "Stack: Next.js 16 (App Router) • React 19 • Google Maps Platform • Gemini 2.5 Flash • Serverless Edge Architecture",
        "Repository: https://github.com/KhushalD01/N-SHIELD"
    ], border_color=BORDER_CYAN)

    set_speaker_notes(s1, "Welcome respected jury members and evaluators. Today we present N-SHIELD, an AI-driven urban safety intelligence platform designed specifically for Nagpur, Maharashtra. N-SHIELD combines predictive crime risk analytics, lighting-aware safe routing, a 100+ verified emergency hospital directory, and one-tap live telemetry for family and guardians.")

    # -------------------------------------------------------------
    # SLIDE 2: THE PROBLEM STATEMENT & URBAN CHALLENGES
    # -------------------------------------------------------------
    s2 = prs.slides.add_slide(blank_layout)
    set_slide_background(s2)
    add_header(s2, "The Problem: Urban Blind Spots & Fragmented Emergency Response")
    add_footer(s2, 2)

    col_w = Inches(3.64)
    h = Inches(5.1)
    top_pos = Inches(1.6)

    add_card(s2, Inches(0.8), top_pos, col_w, h, "1. Reactive Crime Mitigation", [
        "Traditional crime tracking relies on post-incident FIR logs.",
        "Citizens lack predictive awareness when traveling through unfamiliar zones late at night.",
        "High-risk corridors (Outer Ring Rd, Pardi, Kalamna) lack real-time risk indicators.",
        "No dynamic time-of-day risk escalation modeling."
    ], border_color=ACCENT_RED, title_color=ACCENT_RED)

    add_card(s2, Inches(4.84), top_pos, col_w, h, "2. Critical Golden-Hour Delays", [
        "During trauma or cardiac emergencies, minutes dictate survival.",
        "Generic map apps display outdated hours, wrong entrance pins, or closed clinics.",
        "Lack of instant filtering for 24/7 Casualty vs private outpatient clinics.",
        "No verified specialty mapping (Trauma, Maternity, Pediatric ICU)."
    ], border_color=ACCENT_CYAN, title_color=ACCENT_CYAN)

    add_card(s2, Inches(8.88), top_pos, col_w, h, "3. Disconnected Distress Alerts", [
        "Distressed citizens cannot comfortably make phone calls in dangerous situations.",
        "Third-party tracking tools require all contacts to install heavy proprietary apps.",
        "No live broadcast of battery level, movement speed, or heading.",
        "Delayed police & medical dispatch due to vague location descriptions."
    ], border_color=ACCENT_GREEN, title_color=ACCENT_GREEN)

    set_speaker_notes(s2, "When a citizen faces danger in an unfamiliar street in Nagpur at 11 PM, current systems fail them. Traditional crime mapping is historical, navigation apps route solely on shortest travel time through dark alleys, and emergency hospital pins frequently land in the middle of roads or point to closed clinics. N-SHIELD was built to overcome these three critical bottlenecks.")

    # -------------------------------------------------------------
    # SLIDE 3: PROJECT OBJECTIVES & KEY PILLARS
    # -------------------------------------------------------------
    s3 = prs.slides.add_slide(blank_layout)
    set_slide_background(s3)
    add_header(s3, "Project Objectives: A Multi-Tiered Safety Intelligence Shield")
    add_footer(s3, 3)

    add_card(s3, Inches(0.8), top_pos, Inches(5.6), Inches(2.4), "Predictive Risk Modeling & Heatmaps", [
        "Calculate dynamic risk scores across all municipal zones in Nagpur.",
        "Incorporate lighting index, time-of-day multipliers, and CCTV density.",
        "Micro-polygon boundaries for Sitabuldi, Dharampeth, Mahal, Sadar, and Wardha Rd."
    ], border_color=BORDER_CYAN)

    add_card(s3, Inches(6.8), top_pos, Inches(5.6), Inches(2.4), "Dynamic Safe Route Reconstruction", [
        "Evaluate safe passage along candidate polylines with 750m incident buffer.",
        "Reroute commuters through illuminated, police-patrolled arterial roads.",
        "Deliver transparent, explainable safety advice on route selection."
    ], border_color=BORDER_CYAN)

    add_card(s3, Inches(0.8), top_pos + Inches(2.6), Inches(5.6), Inches(2.4), "Verified Nagpur Hospital Directory", [
        "100+ verified medical facilities audited down to casualty entrance coordinates.",
        "Instant filtering: 24/7 Emergency, Government, Cardiac, Maternity, Pediatric.",
        "Zero pin overlap and accurate straight-line + road distance calculation."
    ], border_color=BORDER_CYAN)

    add_card(s3, Inches(6.8), top_pos + Inches(2.6), Inches(5.6), Inches(2.4), "Emergency Circle & Live Telemetry", [
        "One-tap SOS broadcast to trusted family and guardian contacts.",
        "Zero-install live tracking web link with real-time GPS coordinates.",
        "Continuous battery %, movement speed, and audio-visual distress beacons."
    ], border_color=BORDER_CYAN)

    set_speaker_notes(s3, "Our objectives form four concrete pillars: 1. Algorithmic predictive risk scoring; 2. Lighting-aware safe route reconstruction; 3. A precision-verified directory of Nagpur hospitals; and 4. Emergency Circle one-tap live location telemetry with zero-install access for guardians.")

    # -------------------------------------------------------------
    # SLIDE 4: SYSTEM ARCHITECTURE
    # -------------------------------------------------------------
    s4 = prs.slides.add_slide(blank_layout)
    set_slide_background(s4)
    add_header(s4, "System Architecture: End-to-End Modular Engineering")
    add_footer(s4, 4)

    card_h = Inches(5.1)
    add_card(s4, Inches(0.8), top_pos, Inches(3.64), card_h, "Client & Presentation Layer", [
        "Next.js 16 (App Router) & React 19.",
        "Google Maps JavaScript API v3 with custom overlays, heatmaps, and SVG markers.",
        "Tailwind CSS v4 with glassmorphism UI & responsive mobile layouts.",
        "Web Geolocation API with continuous high-accuracy watchPosition stream.",
        "Explainable AI drawer & Real-time Live News Feed panel."
    ], border_color=BORDER_CYAN)

    add_card(s4, Inches(4.84), top_pos, Inches(3.64), card_h, "Edge & Serverless API Tier", [
        "Edge Middleware: Token validation & seamless /api/* routing.",
        "Serverless Microservices on Vercel:",
        " • /api/safety: 750m corridor risk evaluation",
        " • /api/places: Haversine distance & deduplication",
        " • /api/emergency-circle: Session telemetry coordinator",
        " • /api/assistant: Gemini 2.5 Flash RAG pipeline",
        "Ephemeral storage via os.tmpdir() with in-memory persistence fallback."
    ], border_color=BORDER_CYAN)

    add_card(s4, Inches(8.88), top_pos, Inches(3.64), card_h, "Data & Intelligence Engine", [
        "Nagpur Geospatial Intelligence Core:",
        " • Micro-zoned boundary polygons for city wards",
        " • 100+ verified healthcare & police records",
        " • Smart City CCTV camera coordinates & FOV cones",
        " • PCR patrol unit tracking coordinates",
        "Gemini 2.5 Flash LLM + TinyFish Web Grounding for real-time local intelligence."
    ], border_color=BORDER_CYAN)

    set_speaker_notes(s4, "N-SHIELD uses a 3-tier architecture. On the client, Next.js 16 and Google Maps render interactive heatmaps and telemetry. The edge tier runs serverless functions on Vercel handling risk scoring, place discovery, and live session updates. The data engine integrates verified Nagpur geospatial records, CCTV locations, and Google Gemini AI.")

    # -------------------------------------------------------------
    # SLIDE 5: DYNAMIC RISK SCORING ALGORITHM
    # -------------------------------------------------------------
    s5 = prs.slides.add_slide(blank_layout)
    set_slide_background(s5)
    add_header(s5, "Dynamic Risk Engine: Mathematical Modeling & Explainability")
    add_footer(s5, 5)

    add_card(s5, Inches(0.8), top_pos, Inches(11.7), Inches(2.2), "The Multi-Factor Risk Formulation", [
        "Formula: Risk = [ w1 * CrimeRate + w2 * (1 - LightingIndex) + w3 * TimeMultiplier + w4 * (1 - SurveillanceRatio) ] * 100",
        "Crime Weight (w1 = 0.35): Historical frequency of violent incidents, theft, and harassment per km².",
        "Lighting Weight (w2 = 0.25): Illumination coverage based on municipal street-light sensor metrics.",
        "Time Multiplier (w3 = 0.25): Non-linear escalation between 22:00 IST and 04:00 IST (peak night vulnerability).",
        "Surveillance Weight (w4 = 0.15): Proximity to active Smart City CCTV feeds and verified Police PCR routes."
    ], border_color=ACCENT_CYAN)

    add_card(s5, Inches(0.8), top_pos + Inches(2.5), Inches(5.6), Inches(2.5), "Nagpur Zone Calibration", [
        "Sitabuldi Interchange: Moderate Day Risk (42), Elevated Night Risk (74) due to transit footfall.",
        "Mahal Town Hall: High Density (68), narrow alleyways, moderate lighting (45%).",
        "Dharampeth / WHC Road: Low Risk (28), excellent lighting (88%), high police patrol frequency.",
        "Wardha Road Corridor: Variable (35-65), high-speed traffic with unlit pockets past Airport."
    ], border_color=BORDER_CYAN)

    add_card(s5, Inches(6.8), top_pos + Inches(2.5), Inches(5.6), Inches(2.5), "Explainable AI (XAI) Output", [
        "No black-box answers: Every zone provides a human-readable factor breakdown.",
        "Visual progress bars detailing Crime History, Street Illumination, and CCTV Density.",
        "Actionable citizen advisories: 'Prefer arterial West High Court Road over internal lanes after 10 PM'."
    ], border_color=BORDER_CYAN)

    set_speaker_notes(s5, "Our composite risk score uses a 4-factor formula balancing crime history, lighting, time of day, and camera surveillance. We have calibrated this across Nagpur's distinct commercial and residential zones, and every score is accompanied by an Explainable AI breakdown so citizens know why an area is deemed cautious.")

    # -------------------------------------------------------------
    # SLIDE 6: SAFE ROUTE RECONSTRUCTION
    # -------------------------------------------------------------
    s6 = prs.slides.add_slide(blank_layout)
    set_slide_background(s6)
    add_header(s6, "Safe Route Engine: Lighting-Aware Corridor Pathfinding")
    add_footer(s6, 6)

    add_card(s6, Inches(0.8), top_pos, Inches(5.6), card_h, "Shortest vs. Safest Path Comparison", [
        "The Shortest Route Dilemma:",
        " • Generic GPS navigators minimize travel time by 1-2 minutes by cutting through unlit alleys or desolate service roads.",
        " • Increases vulnerability to snatching, harassment, or vehicle breakdown without help.",
        "",
        "The N-SHIELD Safe Route Alternative:",
        " • Analyzes a 750-meter safety envelope along the candidate polyline.",
        " • Scores lighting percentage, active CCTV visibility, and police patrol frequency.",
        " • Recommends well-illuminated main thoroughfares even if marginally longer."
    ], border_color=BORDER_CYAN)

    add_card(s6, Inches(6.8), top_pos, Inches(5.6), card_h, "Dynamic Incident Re-Routing in Action", [
        "Live Incident Interception:",
        " • Evaluates real-time road disruptions, protests, waterlogging, or recent crime alerts.",
        " • Automatically triggers route recalculation to bypass impacted road segments.",
        "",
        "User Interface Features:",
        " • Color-coded route corridors (Green: Safe, Yellow: Caution, Red: High Risk).",
        " • Side-by-side comparison of Distance, Duration, Safety Score, and Lighting %.",
        " • 1-Tap navigation export to Google Maps Turn-by-Turn."
    ], border_color=BORDER_CYAN)

    set_speaker_notes(s6, "Traditional navigation algorithms prioritize only distance and time. N-SHIELD introduces safety-weighted pathfinding. If an unlit or high-incident road segment is detected along the path, our engine reconstructs the route through active commercial avenues with active police presence and reliable lighting.")

    # -------------------------------------------------------------
    # SLIDE 7: VERIFIED NAGPUR HOSPITAL DIRECTORY
    # -------------------------------------------------------------
    s7 = prs.slides.add_slide(blank_layout)
    set_slide_background(s7)
    add_header(s7, "Nagpur Healthcare Directory: Precision Emergency Locator")
    add_footer(s7, 7)

    add_card(s7, Inches(0.8), top_pos, Inches(3.64), card_h, "100+ Verified Facilities", [
        "Government Tertiary Hubs:",
        " • GMCH (Medical Square) - 1,400 beds, Level-1 Trauma",
        " • IGGMCH Mayo Hospital (Central Ave)",
        " • AIIMS Nagpur (MIHAN SEZ)",
        "",
        "Premier Multispecialties:",
        " • Kingsway Hospital (Station Rd)",
        " • Alexis / Max Super Speciality (Mankapur)",
        " • Wockhardt Super Speciality (Shankar Nagar)",
        " • Care Hospital & Orange City Hospital",
        "",
        "Centers of Excellence:",
        " • National Cancer Institute (Jamtha)",
        " • Sengupta Maternity Hospital (Ravnagar)"
    ], border_color=BORDER_CYAN)

    add_card(s7, Inches(4.84), top_pos, Inches(3.64), card_h, "Zero Marker Overlap & Accuracy", [
        "Geospatial Precision Engineering:",
        " • Every single hospital coordinates hand-audited to the physical Emergency Casualty Gate.",
        " • Completely eliminates marker clustering on road centers or shared locality centroids.",
        " • Dual Distance Calculation:",
        "    - True Haversine straight-line distance",
        "    - 1.25x road travel distance with estimated transit time at current city traffic."
    ], border_color=ACCENT_GREEN, title_color=ACCENT_GREEN)

    add_card(s7, Inches(8.88), top_pos, Inches(3.64), card_h, "Smart Emergency Filters", [
        "One-Tap Instant Triage Filters:",
        " • 24/7 Verified Casualty Units",
        " • Government vs. Private Institutions",
        " • Cardiac Emergencies & Cath Labs",
        " • Pediatrics & Neonatal ICUs",
        " • Maternity & Obstetric Care",
        " • 24/7 Operating Pharmacies & Blood Banks",
        "",
        "Instant Actions:",
        " • Direct tel: dialer link for ambulance dispatch",
        " • One-tap Google Maps emergency directions"
    ], border_color=BORDER_CYAN)

    set_speaker_notes(s7, "In medical trauma, the golden hour decides everything. We curated and verified over 100 healthcare facilities across Nagpur. Every pin points to the exact casualty entrance, avoiding road-center errors. Users can filter by government hospitals, 24/7 casualty, maternity, or cardiac care, and trigger emergency dialing with one tap.")

    # -------------------------------------------------------------
    # SLIDE 8: EMERGENCY CIRCLE & LIVE TELEMETRY
    # -------------------------------------------------------------
    s8 = prs.slides.add_slide(blank_layout)
    set_slide_background(s8)
    add_header(s8, "Emergency Circle: One-Tap SOS & Live Location Telemetry")
    add_footer(s8, 8)

    add_card(s8, Inches(0.8), top_pos, Inches(5.6), card_h, "One-Tap SOS & Alert Broadcasting", [
        "Trusted Circle Configuration:",
        " • Add parents, siblings, partners, and colleagues.",
        " • Phone verification ensuring authentic contact delivery.",
        "",
        "Instant SOS Activation:",
        " • 1-Tap SOS button instantly generates an encrypted session token.",
        " • Dispatches SMS / WhatsApp alert text with a secure tracking link.",
        " • Automatically triggers emergency dialer for Central Police (112) or Ambulance (108).",
        " • Starts high-frequency GPS coordinate broadcasting (every 3-5 seconds)."
    ], border_color=ACCENT_RED, title_color=ACCENT_RED)

    add_card(s8, Inches(6.8), top_pos, Inches(5.6), card_h, "Zero-Install Guardian View (/live-share/[token])", [
        "Frictionless Experience for Loved Ones:",
        " • Family members DO NOT need an app or account.",
        " • Opens immediately on any mobile browser (iOS / Android).",
        "",
        "Live Telemetry Stream:",
        " • Real-time moving GPS marker with accuracy radius circle.",
        " • Current device battery percentage indicator.",
        " • Movement speed (km/h) and compass heading.",
        " • Pulsing audio-visual distress beacon.",
        " • Direct 1-tap call to the distressed user or local police dispatch."
    ], border_color=ACCENT_CYAN, title_color=ACCENT_CYAN)

    set_speaker_notes(s8, "The Emergency Circle is our flagship safety innovation. When a commuter feels unsafe, tapping SOS creates an encrypted session and notifies their emergency circle. Crucially, guardians don't need to install any app: they open a secure web link that streams real-time moving coordinates, speed, and device battery level.")

    # -------------------------------------------------------------
    # SLIDE 9: AI SAFETY ASSISTANT & RAG PIPELINE
    # -------------------------------------------------------------
    s9 = prs.slides.add_slide(blank_layout)
    set_slide_background(s9)
    add_header(s9, "AI Safety Assistant: Grounded RAG with Gemini 2.5 Flash")
    add_footer(s9, 9)

    add_card(s9, Inches(0.8), top_pos, Inches(5.6), card_h, "Context-Aware Local RAG Engine", [
        "Retrieval-Augmented Architecture:",
        " • Ingests verified Nagpur incident logs, ward lighting metrics, police station contacts, and hospital directories.",
        " • Synthesizes a structured situational context payload for every user prompt.",
        "",
        "Conversational Capabilities:",
        " • Natural language safety queries: 'Is Sitabuldi safe for solo women after 11 PM?'",
        " • Emergency triage: 'Where can I find an open pediatric ICU near Ramdaspeth right now?'",
        " • Dynamic travel advisories: 'Suggest a safe route from VNIT to Nagpur Airport'."
    ], border_color=BORDER_CYAN)

    add_card(s9, Inches(6.8), top_pos, Inches(5.6), card_h, "Real-Time Grounding & Guardrails", [
        "Gemini 2.5 Flash Integration:",
        " • Fast, cost-effective inference (<800ms response time).",
        " • Grounded in real local datasets to eliminate hallucinated contacts.",
        "",
        "Live Web Grounding via TinyFish API:",
        " • Fetches real-time local news on road closures, VIP movements, and flash protests.",
        "",
        "Strict Safety Guardrails:",
        " • Mandatory emergency helpline disclaimers (112, 108, 1091).",
        " • Never provides advice that bypasses official law enforcement channels."
    ], border_color=BORDER_CYAN)

    set_speaker_notes(s9, "The AI Safety Assistant is powered by Google Gemini 2.5 Flash using a Retrieval-Augmented Generation approach. It reads our verified Nagpur geospatial records and live local news feeds to answer questions accurately without hallucinating emergency phone numbers or clinic operating hours.")

    # -------------------------------------------------------------
    # SLIDE 10: CCTV COVERAGE & BLIND SPOT DETECTION
    # -------------------------------------------------------------
    s10 = prs.slides.add_slide(blank_layout)
    set_slide_background(s10)
    add_header(s10, "CCTV Surveillance & Blind Spot Discovery")
    add_footer(s10, 10)

    add_card(s10, Inches(0.8), top_pos, Inches(5.6), card_h, "Smart City Camera Layer", [
        "Comprehensive Surveillance Mapping:",
        " • Over 50+ mapped municipal and traffic surveillance cameras across major intersections.",
        " • Visual coverage cones indicating field-of-view and zoom radius.",
        " • High-density coverage at Variety Square, Zero Mile, RBI Chowk, and Rahate Colony.",
        "",
        "Patrol Unit Coordination:",
        " • Real-time tracking of active Nagpur Police PCR vans.",
        " • Estimated response time calculation based on patrol proximity."
    ], border_color=BORDER_CYAN)

    add_card(s10, Inches(6.8), top_pos, Inches(5.6), card_h, "Automated Blind Spot Identification", [
        "Algorithmic Surveillance Gap Analysis:",
        " • Spatial intersection of historical night-time crime clusters with camera coverage dead-zones.",
        " • Highlights unmonitored transit corridors for law enforcement and municipal planning.",
        "",
        "Actionable Recommendations for Authorities:",
        " • Identifies priority locations for installing new Smart City CCTV nodes.",
        " • Proposes optimized patrol routes to close surveillance gaps during peak risk hours (22:00-04:00)."
    ], border_color=BORDER_CYAN)

    set_speaker_notes(s10, "For urban planners and police authorities, N-SHIELD visualizes Smart City camera coverage cones alongside crime clusters. By calculating the difference, the system automatically detects surveillance blind spots, enabling proactive patrol dispatch and strategic placement of new CCTV installations.")

    # -------------------------------------------------------------
    # SLIDE 11: SECURITY, PRIVACY & SERVERLESS DEPLOYMENT
    # -------------------------------------------------------------
    s11 = prs.slides.add_slide(blank_layout)
    set_slide_background(s11)
    add_header(s11, "Cloud Architecture: Security, Privacy & Vercel Resilience")
    add_footer(s11, 11)

    add_card(s11, Inches(0.8), top_pos, Inches(5.6), card_h, "Privacy-First Telemetry Architecture", [
        "Ephemeral Location Tokens:",
        " • Random 32-byte cryptographic session tokens (crypto.randomBytes).",
        " • No persistent storage of personal movement histories or tracking logs.",
        " • Auto-expiring sessions (15, 30, or 60 min) with manual immediate kill-switch.",
        "",
        "Enterprise-Grade Authentication:",
        " • Secure PBKDF2/SHA-256 password hashing with unique per-user salts.",
        " • HttpOnly, SameSite secure session cookies protecting command center routes.",
        " • In-memory rate limiting preventing API abuse and denial of service."
    ], border_color=BORDER_CYAN)

    add_card(s11, Inches(6.8), top_pos, Inches(5.6), card_h, "Serverless Vercel Edge Engineering", [
        "Zero-Downtime Serverless Resiliency:",
        " • Ephemeral filesystem handling: Writes to os.tmpdir() avoiding EROFS read-only crashes.",
        " • Pre-populated in-memory seed stores ensuring 100% auth & emergency circle availability.",
        "",
        "Edge Routing Optimization:",
        " • Next.js Edge Middleware guarantees instant /api/* passthrough without HTML redirects.",
        " • Force-dynamic route handlers preventing stale cached geolocation queries.",
        " • Production verified with Next.js 16 Turbopack compiler."
    ], border_color=ACCENT_GREEN, title_color=ACCENT_GREEN)

    set_speaker_notes(s11, "Security and privacy are engineered into every layer. Location tokens are cryptographically randomized and auto-expire to protect citizen privacy. On the cloud side, our serverless functions on Vercel utilize resilient edge middleware and failover storage, guaranteeing high availability even under extreme traffic.")

    # -------------------------------------------------------------
    # SLIDE 12: REAL-WORLD IMPACT & SOCIETAL VALUE
    # -------------------------------------------------------------
    s12 = prs.slides.add_slide(blank_layout)
    set_slide_background(s12)
    add_header(s12, "Impact: Transforming Urban Safety in Nagpur")
    add_footer(s12, 12)

    col_w2 = Inches(3.64)
    add_card(s12, Inches(0.8), top_pos, col_w2, card_h, "Citizen Empowerment", [
        "Dramatically increases night-travel confidence for female commuters, students, and workers.",
        "Eliminates fear of entering unfamiliar corridors with transparent lighting & risk data.",
        "Single-tap emergency broadcast connects users to family and official helplines simultaneously."
    ], border_color=ACCENT_CYAN, title_color=ACCENT_CYAN)

    add_card(s12, Inches(4.84), top_pos, col_w2, card_h, "Rapid Golden-Hour Healthcare", [
        "Cuts emergency search time from 15 minutes down to 30 seconds.",
        "Accurate casualty gate routing prevents ambulances and patients from arriving at closed clinic doors.",
        "Immediate clarity on specialized care (ICU, Trauma, Cardiac, Pediatric, Maternity)."
    ], border_color=ACCENT_GREEN, title_color=ACCENT_GREEN)

    add_card(s12, Inches(8.88), top_pos, col_w2, card_h, "Smart City Law Enforcement", [
        "Provides Nagpur Police with data-backed patrol optimization.",
        "Empowers Nagpur Municipal Corporation (NMC) to prioritize dark-spot street lighting upgrades.",
        "Scalable blueprint ready for replication across other Indian Smart Cities."
    ], border_color=BORDER_CYAN, title_color=BORDER_CYAN)

    set_speaker_notes(s12, "The societal impact of N-SHIELD is tangible. It empowers women and late-night workers with real-time safety confidence, slashes critical golden-hour medical search delays, and equips municipal authorities and police with data to deploy lighting and patrol units where they are needed most.")

    # -------------------------------------------------------------
    # SLIDE 13: CONCLUSION & FUTURE SCOPE
    # -------------------------------------------------------------
    s13 = prs.slides.add_slide(blank_layout)
    set_slide_background(s13)
    add_header(s13, "Roadmap: Future Scope & Conclusion")
    add_footer(s13, 13)

    add_card(s13, Inches(0.8), top_pos, Inches(5.6), card_h, "Future Scope: N-SHIELD 2.0", [
        "Nagpur Smart City ICCC Integration:",
        " • Direct API link to the Municipal Command and Control Centre for automated dispatch.",
        "",
        "Acoustic Scream & Impact Detection:",
        " • On-device machine learning to trigger SOS on sudden collision or high-decibel distress cries.",
        "",
        "Crowdsourced Hazard Verification:",
        " • Citizen reporting of broken streetlights, waterlogging, and road hazards with photo verification.",
        "",
        "Multi-City Expansion:",
        " • Scaling the architecture to Pune, Mumbai, Nashik, and Tier-2 urban hubs."
    ], border_color=BORDER_CYAN)

    add_card(s13, Inches(6.8), top_pos, Inches(5.6), card_h, "Summary & Key Takeaways", [
        "Comprehensive Urban Safety Solution:",
        " • N-SHIELD transitions urban security from reactive reporting to predictive intelligence.",
        "",
        "Engineering Excellence:",
        " • Modern Next.js 16 + React 19 stack with Google Maps Platform and Google Gemini AI.",
        "",
        "Live & Production Ready:",
        " • Fully functioning deployment with audited Nagpur geospatial records.",
        "",
        "GitHub Repository:",
        " • https://github.com/KhushalD01/N-SHIELD",
        "",
        "Thank you! We welcome questions from the jury."
    ], border_color=ACCENT_CYAN, title_color=ACCENT_CYAN)

    set_speaker_notes(s13, "To conclude, N-SHIELD demonstrates how predictive geospatial intelligence and modern cloud technologies can make our cities substantially safer. We thank the jury for their time and are now open for questions and a live demonstration.")

    # Save presentation
    output_path = os.path.join(os.getcwd(), "N_SHIELD_Presentation.pptx")
    prs.save(output_path)
    print(f"Presentation successfully created at: {output_path}")

if __name__ == "__main__":
    build_presentation()
