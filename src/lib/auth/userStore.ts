/**
 * N-SHIELD Citizen & Personnel Account Store
 * 
 * Persistent file-backed storage for user records, credential hashes, and security metadata.
 * Seeded with verified safety officer and citizen test accounts.
 */

import fs from "fs";
import path from "path";
import os from "os";
import { hashPassword, verifyPassword } from "./passwords";
import type { SessionUser } from "./token";

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: "citizen" | "officer" | "admin";
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  phone?: string;
  locality?: string;
  badgeNumber?: string; // For safety officers
  resetToken?: string;
  resetTokenExpiry?: number;
}

// Pre-seeded evaluation accounts with valid PBKDF2-SHA512 hashes
const DEFAULT_SEED_USERS: UserRecord[] = [
  {
    id: "usr-officer-01",
    name: "Inspector A. Sharma",
    email: "officer@nshield.nagpur.gov.in",
    passwordHash: "pbkdf2:100000:c08097714ca95807549bc4168b1ca946:cdb799debd766da39281c9113d85b9d8a59121d1e971c42cf6dbe1fb3993904885b252cda8d36836913f644e37a412bd5a41892afe8fa0d4fe67db05f1d81b7d",
    role: "officer",
    badgeNumber: "NGP-PD-4091",
    emailVerified: true,
    createdAt: "2026-10-28T19:52:45.449Z",
    updatedAt: "2026-10-28T19:52:45.449Z",
    phone: "0712-2561222",
  },
  {
    id: "usr-citizen-01",
    name: "Rahul Deshmukh",
    email: "citizen@nshield.nagpur.gov.in",
    passwordHash: "pbkdf2:100000:f31deed3624b621c1479215b870e63f3:394b9131b9ccba609a9766ce933a665197d7eab8d8c31ad400f1322329bd826a9c8e1670bd7954c1b2f401c789d3318ee28fe07f08f8adc9fe95f96ffc5497f7",
    role: "citizen",
    emailVerified: true,
    createdAt: "2026-10-28T19:52:45.449Z",
    updatedAt: "2026-10-28T19:52:45.449Z",
    phone: "+91 98220 12345",
  },
  {
    id: "usr-admin-01",
    name: "N-SHIELD Central Admin",
    email: "admin@nshield.nagpur.gov.in",
    passwordHash: "pbkdf2:100000:020d2d251874e61f69f60bcf7f7f69c1:75309ab6b21e50ddf0825775364af18c22ea941b6782105a48fc7f0490e78b911115f88b644ae6c358d54e60a093aab33fbe8ffdbbb7b60f2acf24ef0ca70c19",
    role: "admin",
    emailVerified: true,
    createdAt: "2026-10-28T19:52:45.449Z",
    updatedAt: "2026-10-28T19:52:45.449Z",
  },
];

// Determine writable data directory across local dev & Vercel serverless
const DATA_DIR = process.env.VERCEL
  ? path.join(os.tmpdir(), "nshield-data")
  : path.join(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");

// In-memory cache: initialized with default seed accounts so authentication never fails
let memoryUsers: UserRecord[] = [...DEFAULT_SEED_USERS];
let isInitialized = false;

async function ensureDataFileExists(): Promise<void> {
  if (isInitialized) return;

  try {
    // 1. First attempt to load bundled static users file if present
    const projectUsersFile = path.join(process.cwd(), "data", "users.json");
    if (fs.existsSync(projectUsersFile)) {
      const raw = fs.readFileSync(projectUsersFile, "utf8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryUsers = parsed;
      }
    } else if (fs.existsSync(USERS_FILE)) {
      const raw = fs.readFileSync(USERS_FILE, "utf8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryUsers = parsed;
      }
    }
  } catch (err) {
    console.warn("Notice: Using in-memory seed accounts (filesystem read-only or not initialized):", err);
  }

  isInitialized = true;
}

function persistUsers(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(USERS_FILE, JSON.stringify(memoryUsers, null, 2), "utf8");
  } catch (err) {
    // Graceful catch for read-only environments (Vercel serverless functions)
    console.warn("Storage persistence notice: operating in high-speed in-memory mode.");
  }
}

/**
 * Normalizes email address for consistent lookup
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Sanitizes user record into safe session user without sensitive hashes
 */
export function sanitizeUser(user: UserRecord): SessionUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt,
    locality: user.locality,
    phone: user.phone,
  };
}

export async function findUserByEmail(email: string): Promise<UserRecord | null> {
  await ensureDataFileExists();
  const normalized = normalizeEmail(email);
  return memoryUsers?.find((u) => normalizeEmail(u.email) === normalized) || null;
}

export async function findUserById(id: string): Promise<UserRecord | null> {
  await ensureDataFileExists();
  return memoryUsers?.find((u) => u.id === id) || null;
}

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  role?: "citizen" | "officer";
  phone?: string;
}): Promise<UserRecord> {
  await ensureDataFileExists();
  const normalized = normalizeEmail(data.email);

  const existing = await findUserByEmail(normalized);
  if (existing) {
    throw new Error("An account with this email address already exists.");
  }

  const passwordHash = await hashPassword(data.password);
  const now = new Date().toISOString();

  const newUser: UserRecord = {
    id: `usr-${crypto.randomUUID()}`,
    name: data.name.trim(),
    email: normalized,
    passwordHash,
    role: data.role || "citizen",
    emailVerified: true, // Auto-verified for seamless local registration
    createdAt: now,
    updatedAt: now,
    phone: data.phone,
  };

  memoryUsers = memoryUsers || [];
  memoryUsers.push(newUser);
  persistUsers();

  return newUser;
}

export async function setResetToken(userId: string, token: string, expiry: number): Promise<boolean> {
  await ensureDataFileExists();
  const user = await findUserById(userId);
  if (!user) return false;

  user.resetToken = token;
  user.resetTokenExpiry = expiry;
  persistUsers();
  return true;
}

export async function updateUserPassword(userId: string, newPassword: string): Promise<boolean> {
  await ensureDataFileExists();
  const user = await findUserById(userId);
  if (!user) return false;

  user.passwordHash = await hashPassword(newPassword);
  user.updatedAt = new Date().toISOString();
  user.resetToken = undefined;
  user.resetTokenExpiry = undefined;

  persistUsers();
  return true;
}

export async function verifyUserEmail(userId: string): Promise<boolean> {
  await ensureDataFileExists();
  const user = await findUserById(userId);
  if (!user) return false;

  user.emailVerified = true;
  user.updatedAt = new Date().toISOString();
  persistUsers();
  return true;
}

export async function recordUserLogin(userId: string): Promise<void> {
  await ensureDataFileExists();
  const user = await findUserById(userId);
  if (!user) return;

  user.lastLoginAt = new Date().toISOString();
  persistUsers();
}
