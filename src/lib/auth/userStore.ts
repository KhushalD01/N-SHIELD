/**
 * N-SHIELD Citizen & Personnel Account Store
 * 
 * Persistent file-backed storage for user records, credential hashes, and security metadata.
 * Seeded with verified safety officer and citizen test accounts.
 */

import fs from "fs";
import path from "path";
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

const DATA_DIR = path.join(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");

// In-memory cache for ultra-fast access
let memoryUsers: UserRecord[] | null = null;
let isInitialized = false;

async function ensureDataFileExists(): Promise<void> {
  if (isInitialized && memoryUsers) return;

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(USERS_FILE)) {
      // Seed default accounts
      const officerHash = await hashPassword("NagpurSafe@2026");
      const citizenHash = await hashPassword("CitizenSafe@2026");
      const adminHash = await hashPassword("AdminControl@2026");

      const seedUsers: UserRecord[] = [
        {
          id: "usr-officer-01",
          name: "Inspector A. Sharma",
          email: "officer@nshield.nagpur.gov.in",
          passwordHash: officerHash,
          role: "officer",
          badgeNumber: "NGP-PD-4091",
          emailVerified: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          phone: "0712-2561222",
        },
        {
          id: "usr-citizen-01",
          name: "Rahul Deshmukh",
          email: "citizen@nshield.nagpur.gov.in",
          passwordHash: citizenHash,
          role: "citizen",
          emailVerified: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          phone: "+91 98220 12345",
        },
        {
          id: "usr-admin-01",
          name: "N-SHIELD Central Admin",
          email: "admin@nshield.nagpur.gov.in",
          passwordHash: adminHash,
          role: "admin",
          emailVerified: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      fs.writeFileSync(USERS_FILE, JSON.stringify(seedUsers, null, 2), "utf8");
      memoryUsers = seedUsers;
    } else {
      const raw = fs.readFileSync(USERS_FILE, "utf8");
      memoryUsers = JSON.parse(raw);
    }
  } catch (err) {
    console.error("Failed to read/write users data file:", err);
    if (!memoryUsers) memoryUsers = [];
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
    console.error("Failed to persist users to disk:", err);
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
