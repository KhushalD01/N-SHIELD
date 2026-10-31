/**
 * N-SHIELD Emergency Circle & Live Location Sharing Type Definitions
 */

export type ContactRelationship = "Family" | "Friend" | "Other";
export type VerificationStatus = "verified" | "pending";
export type SessionStatus = "active" | "stopped" | "expired";

export interface TrustedContact {
  id: string;
  userId: string; // Owner user ID
  name: string;
  countryCode: string; // e.g. "+91"
  phoneNumber: string; // e.g. "9876543210"
  normalizedPhone: string; // e.g. "+919876543210"
  relationship: ContactRelationship;
  verificationStatus: VerificationStatus;
  verificationCode?: string;
  verificationCodeExpiresAt?: number;
  verificationAttempts?: number;
  createdAt: string;
  updatedAt: string;
}

export interface LocationCoordinate {
  latitude: number;
  longitude: number;
  accuracy?: number; // In meters
  altitude?: number | null;
  speed?: number | null;
  heading?: number | null;
  timestamp: string; // ISO string
}

export interface ContactNotificationStatus {
  contactId: string;
  contactName: string;
  phone: string;
  status: "queued" | "sent" | "delivered" | "failed";
  messageId?: string;
  channel: "sms" | "system" | "mock_sms";
  sentAt?: string;
  error?: string;
}

export interface EmergencySharingSession {
  id: string;
  token: string; // High-entropy secure public link token (32-byte hex)
  userId: string;
  userName: string;
  userPhone?: string;
  status: SessionStatus;
  startedAt: string;
  expiresAt: string;
  stoppedAt?: string | null;
  currentLocation: LocationCoordinate;
  locationHistory?: LocationCoordinate[];
  contactsNotified: ContactNotificationStatus[];
  alertMessage: string;
  shareUrl: string;
  lastUpdatedAt: string;
}

export interface PublicSharedLocationView {
  token: string;
  userName: string;
  status: SessionStatus;
  startedAt: string;
  expiresAt: string;
  lastUpdatedAt: string;
  currentLocation: LocationCoordinate;
  isStale: boolean;
}

