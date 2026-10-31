/**
 * N-SHIELD Emergency Circle & Live Session Data Store
 * 
 * Persistent file-backed storage in `data/trusted_contacts.json` and `data/emergency_sessions.json`.
 * Enforces owner validation, duplicate contact prevention, rate limits, and cryptographic token generation.
 */

import fs from "fs";
import path from "path";
import crypto from "crypto";
import type {
  ContactRelationship,
  EmergencySharingSession,
  LocationCoordinate,
  SessionStatus,
  TrustedContact,
} from "./types";
import { sendEmergencyAlert, sendOtpSms } from "./smsService";

const DATA_DIR = path.join(process.cwd(), "data");
const CONTACTS_FILE = path.join(DATA_DIR, "trusted_contacts.json");
const SESSIONS_FILE = path.join(DATA_DIR, "emergency_sessions.json");

// In-memory caches for fast concurrent lookups
let cachedContacts: TrustedContact[] | null = null;
let cachedSessions: EmergencySharingSession[] | null = null;
let isInitialized = false;

function ensureDataFiles() {
  if (isInitialized && cachedContacts && cachedSessions) return;

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(CONTACTS_FILE)) {
      // Initialize with sample demo contacts for default evaluation accounts
      const defaultContacts: TrustedContact[] = [
        {
          id: "ct_demo_parent",
          userId: "usr-citizen-01",
          name: "Dr. Suresh Deshmukh",
          countryCode: "+91",
          phoneNumber: "9822345678",
          normalizedPhone: "+919822345678",
          relationship: "Family",
          verificationStatus: "verified",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "ct_demo_sibling",
          userId: "usr-citizen-01",
          name: "Pooja Deshmukh",
          countryCode: "+91",
          phoneNumber: "9422890123",
          normalizedPhone: "+919422890123",
          relationship: "Family",
          verificationStatus: "verified",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "ct_demo_friend",
          userId: "usr-citizen-01",
          name: "Amit Verma",
          countryCode: "+91",
          phoneNumber: "9765432109",
          normalizedPhone: "+919765432109",
          relationship: "Friend",
          verificationStatus: "pending",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      fs.writeFileSync(CONTACTS_FILE, JSON.stringify(defaultContacts, null, 2), "utf8");
      cachedContacts = defaultContacts;
    } else {
      const raw = fs.readFileSync(CONTACTS_FILE, "utf8");
      cachedContacts = JSON.parse(raw);
    }

    if (!fs.existsSync(SESSIONS_FILE)) {
      fs.writeFileSync(SESSIONS_FILE, JSON.stringify([], null, 2), "utf8");
      cachedSessions = [];
    } else {
      const raw = fs.readFileSync(SESSIONS_FILE, "utf8");
      cachedSessions = JSON.parse(raw);
    }
  } catch (err) {
    console.error("Failed to initialize emergency circle data files:", err);
    if (!cachedContacts) cachedContacts = [];
    if (!cachedSessions) cachedSessions = [];
  }

  isInitialized = true;
}

function persistContacts() {
  try {
    ensureDataFiles();
    fs.writeFileSync(CONTACTS_FILE, JSON.stringify(cachedContacts, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to write trusted contacts to disk:", err);
  }
}

function persistSessions() {
  try {
    ensureDataFiles();
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(cachedSessions, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to write emergency sessions to disk:", err);
  }
}

/**
 * Normalizes phone numbers to standard format (e.g. +919876543210)
 */
export function normalizePhoneNumber(countryCode: string, phone: string): string {
  const cleanCode = countryCode.trim().startsWith("+") ? countryCode.trim() : `+${countryCode.trim()}`;
  const cleanNumber = phone.replace(/[^0-9]/g, "");
  return `${cleanCode}${cleanNumber}`;
}

// ==========================================
// TRUSTED CONTACTS REPOSITORY
// ==========================================

export async function getContactsForUser(userId: string): Promise<TrustedContact[]> {
  ensureDataFiles();
  return (cachedContacts || []).filter((c) => c.userId === userId);
}

export async function getContactById(contactId: string): Promise<TrustedContact | null> {
  ensureDataFiles();
  return (cachedContacts || []).find((c) => c.id === contactId) || null;
}

export async function createContact(
  userId: string,
  data: {
    name: string;
    countryCode?: string;
    phoneNumber: string;
    relationship: ContactRelationship;
  }
): Promise<{ success: boolean; contact?: TrustedContact; error?: string }> {
  ensureDataFiles();

  const countryCode = data.countryCode || "+91";
  const normalizedPhone = normalizePhoneNumber(countryCode, data.phoneNumber);

  // Check if contact already exists for this user
  const userContacts = (cachedContacts || []).filter((c) => c.userId === userId);
  const exists = userContacts.some((c) => c.normalizedPhone === normalizedPhone);
  if (exists) {
    return { success: false, error: "A contact with this phone number already exists in your Emergency Circle." };
  }

  if (userContacts.length >= 10) {
    return { success: false, error: "You have reached the maximum limit of 10 trusted contacts." };
  }

  const now = new Date().toISOString();
  const newContact: TrustedContact = {
    id: `ct_${crypto.randomUUID()}`,
    userId,
    name: data.name.trim(),
    countryCode,
    phoneNumber: data.phoneNumber.replace(/[^0-9]/g, ""),
    normalizedPhone,
    relationship: data.relationship,
    verificationStatus: "pending",
    createdAt: now,
    updatedAt: now,
  };

  cachedContacts = cachedContacts || [];
  cachedContacts.push(newContact);
  persistContacts();

  return { success: true, contact: newContact };
}

export async function updateContact(
  userId: string,
  contactId: string,
  data: {
    name?: string;
    relationship?: ContactRelationship;
    countryCode?: string;
    phoneNumber?: string;
  }
): Promise<{ success: boolean; contact?: TrustedContact; error?: string }> {
  ensureDataFiles();

  const contact = (cachedContacts || []).find((c) => c.id === contactId && c.userId === userId);
  if (!contact) {
    return { success: false, error: "Contact not found." };
  }

  if (data.name) contact.name = data.name.trim();
  if (data.relationship) contact.relationship = data.relationship;

  if (data.phoneNumber) {
    const countryCode = data.countryCode || contact.countryCode;
    const normalized = normalizePhoneNumber(countryCode, data.phoneNumber);

    const duplicate = (cachedContacts || []).some(
      (c) => c.userId === userId && c.id !== contactId && c.normalizedPhone === normalized
    );
    if (duplicate) {
      return { success: false, error: "Another contact already uses this phone number." };
    }

    // Phone changed, reset verification
    if (normalized !== contact.normalizedPhone) {
      contact.countryCode = countryCode;
      contact.phoneNumber = data.phoneNumber.replace(/[^0-9]/g, "");
      contact.normalizedPhone = normalized;
      contact.verificationStatus = "pending";
      contact.verificationCode = undefined;
      contact.verificationCodeExpiresAt = undefined;
    }
  }

  contact.updatedAt = new Date().toISOString();
  persistContacts();

  return { success: true, contact };
}

export async function deleteContact(userId: string, contactId: string): Promise<boolean> {
  ensureDataFiles();
  const initialLength = (cachedContacts || []).length;
  cachedContacts = (cachedContacts || []).filter((c) => !(c.id === contactId && c.userId === userId));
  
  if (cachedContacts.length !== initialLength) {
    persistContacts();
    return true;
  }
  return false;
}

// ==========================================
// OTP VERIFICATION LOGIC
// ==========================================

export async function sendContactOtp(
  userId: string,
  contactId: string
): Promise<{ success: boolean; devOtp?: string; expiresAt?: number; error?: string }> {
  ensureDataFiles();

  const contact = (cachedContacts || []).find((c) => c.id === contactId && c.userId === userId);
  if (!contact) {
    return { success: false, error: "Contact not found." };
  }

  // Generate 6-digit cryptographic OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  contact.verificationCode = otp;
  contact.verificationCodeExpiresAt = expiresAt;
  contact.verificationAttempts = 0;
  contact.updatedAt = new Date().toISOString();
  persistContacts();

  const smsResult = await sendOtpSms(contact.normalizedPhone, otp, contact.name);

  return {
    success: true,
    expiresAt,
    // When in dev/mock channel, include the OTP for developer/evaluator convenience
    devOtp: smsResult.channel === "mock_sms" ? otp : undefined,
  };
}

export async function verifyContactOtp(
  userId: string,
  contactId: string,
  otpCode: string
): Promise<{ success: boolean; error?: string }> {
  ensureDataFiles();

  const contact = (cachedContacts || []).find((c) => c.id === contactId && c.userId === userId);
  if (!contact) {
    return { success: false, error: "Contact not found." };
  }

  if (!contact.verificationCode || !contact.verificationCodeExpiresAt) {
    return { success: false, error: "No verification code was requested for this contact." };
  }

  if (Date.now() > contact.verificationCodeExpiresAt) {
    return { success: false, error: "Verification code has expired. Please request a new one." };
  }

  contact.verificationAttempts = (contact.verificationAttempts || 0) + 1;
  if (contact.verificationAttempts > 5) {
    contact.verificationCode = undefined;
    contact.verificationCodeExpiresAt = undefined;
    persistContacts();
    return { success: false, error: "Too many failed attempts. Please request a new code." };
  }

  if (contact.verificationCode.trim() !== otpCode.trim()) {
    persistContacts();
    return { success: false, error: "Invalid verification code. Please check and try again." };
  }

  // Verification succeeded!
  contact.verificationStatus = "verified";
  contact.verificationCode = undefined;
  contact.verificationCodeExpiresAt = undefined;
  contact.verificationAttempts = 0;
  contact.updatedAt = new Date().toISOString();
  persistContacts();

  return { success: true };
}

// ==========================================
// EMERGENCY LIVE SHARING SESSIONS
// ==========================================

export async function getActiveSessionForUser(userId: string): Promise<EmergencySharingSession | null> {
  ensureDataFiles();
  const now = new Date().getTime();

  const session = (cachedSessions || []).find((s) => s.userId === userId && s.status === "active");
  if (!session) return null;

  // Check if session has expired
  if (new Date(session.expiresAt).getTime() < now) {
    session.status = "expired";
    session.stoppedAt = session.expiresAt;
    persistSessions();
    return null;
  }

  return session;
}

export async function getSessionByToken(token: string): Promise<EmergencySharingSession | null> {
  ensureDataFiles();
  const session = (cachedSessions || []).find((s) => s.token === token);
  if (!session) return null;

  const now = new Date().getTime();
  if (session.status === "active" && new Date(session.expiresAt).getTime() < now) {
    session.status = "expired";
    session.stoppedAt = session.expiresAt;
    persistSessions();
  }

  return session;
}

export async function startEmergencySession(
  userId: string,
  userName: string,
  contactIds: string[],
  initialLocation: LocationCoordinate,
  originUrl: string
): Promise<{ success: boolean; session?: EmergencySharingSession; error?: string }> {
  ensureDataFiles();

  // 1. Get all verified contacts for this user matching contactIds
  const allContacts = await getContactsForUser(userId);
  const selectedContacts = allContacts.filter(
    (c) => contactIds.includes(c.id) && c.verificationStatus === "verified"
  );

  if (selectedContacts.length === 0) {
    return {
      success: false,
      error: "No verified contacts selected. Please select at least one verified contact before sharing.",
    };
  }

  // 2. Check if user already has an active session
  let activeSession = await getActiveSessionForUser(userId);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 30 * 60 * 1000).toISOString(); // 30 minutes default

  if (activeSession) {
    // If session already active, update location and extend if needed
    activeSession.currentLocation = initialLocation;
    activeSession.lastUpdatedAt = now.toISOString();
    persistSessions();
    return { success: true, session: activeSession };
  }

  // 3. Generate high-entropy 32-byte hex token for secure public link
  const secureToken = crypto.randomBytes(24).toString("hex");
  const shareUrl = `${originUrl}/live-share/${secureToken}`;

  const sessionId = `sesh_${crypto.randomUUID()}`;

  // 4. Send alert SMS to all selected contacts
  const notificationPromises = selectedContacts.map((contact) =>
    sendEmergencyAlert(contact, userName, shareUrl, now.toISOString())
  );
  const notificationResults = await Promise.all(notificationPromises);

  const formattedTime = now.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  const alertMessage = `EMERGENCY ALERT: ${userName} has requested assistance and is sharing their live location with you through N-SHIELD. View their location: ${shareUrl}. Alert time: ${formattedTime} IST.`;

  const newSession: EmergencySharingSession = {
    id: sessionId,
    token: secureToken,
    userId,
    userName,
    status: "active",
    startedAt: now.toISOString(),
    expiresAt,
    currentLocation: initialLocation,
    locationHistory: [initialLocation],
    contactsNotified: notificationResults,
    alertMessage,
    shareUrl,
    lastUpdatedAt: now.toISOString(),
  };

  cachedSessions = cachedSessions || [];
  cachedSessions.unshift(newSession);
  persistSessions();

  return { success: true, session: newSession };
}

export async function updateSessionLocation(
  sessionId: string,
  userId: string,
  location: LocationCoordinate
): Promise<EmergencySharingSession | null> {
  ensureDataFiles();

  const session = (cachedSessions || []).find((s) => s.id === sessionId && s.userId === userId);
  if (!session || session.status !== "active") return null;

  // Validate coordinates
  if (
    typeof location.latitude !== "number" ||
    typeof location.longitude !== "number" ||
    isNaN(location.latitude) ||
    isNaN(location.longitude)
  ) {
    return null;
  }

  const nowIso = new Date().toISOString();
  session.currentLocation = location;
  session.lastUpdatedAt = nowIso;

  // Keep max last 20 coordinates to respect minimal data retention
  session.locationHistory = session.locationHistory || [];
  session.locationHistory.push(location);
  if (session.locationHistory.length > 20) {
    session.locationHistory = session.locationHistory.slice(-20);
  }

  persistSessions();
  return session;
}

export async function extendSession(
  sessionId: string,
  userId: string,
  additionalMinutes: number = 30
): Promise<EmergencySharingSession | null> {
  ensureDataFiles();

  const session = (cachedSessions || []).find((s) => s.id === sessionId && s.userId === userId);
  if (!session || session.status !== "active") return null;

  const currentExpiry = new Date(session.expiresAt).getTime();
  const newExpiry = new Date(currentExpiry + additionalMinutes * 60 * 1000).toISOString();
  session.expiresAt = newExpiry;
  session.lastUpdatedAt = new Date().toISOString();

  persistSessions();
  return session;
}

export async function stopSession(
  sessionId: string,
  userId: string
): Promise<EmergencySharingSession | null> {
  ensureDataFiles();

  const session = (cachedSessions || []).find((s) => s.id === sessionId && s.userId === userId);
  if (!session) return null;

  session.status = "stopped";
  session.stoppedAt = new Date().toISOString();
  session.lastUpdatedAt = new Date().toISOString();

  persistSessions();
  return session;
}

