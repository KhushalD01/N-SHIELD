"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Edit2,
  KeyRound,
  Loader2,
  MapPin,
  Plus,
  Radio,
  Share2,
  Shield,
  ShieldAlert,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";
import type {
  EmergencySharingSession,
  LocationCoordinate,
  TrustedContact,
} from "@/lib/emergency-circle/types";
import { AddContactModal } from "./AddContactModal";
import { OtpVerifyModal } from "./OtpVerifyModal";
import { AlertSentModal } from "./AlertSentModal";
import { LiveSharingSessionView } from "./LiveSharingSessionView";
import { useAuth } from "@/context/AuthContext";

export function EmergencyCircleView() {
  const { user, isAuthenticated } = useAuth();

  const [contacts, setContacts] = useState<TrustedContact[]>([]);
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);
  const [activeSession, setActiveSession] = useState<EmergencySharingSession | null>(null);

  const [isLoadingContacts, setIsLoadingContacts] = useState(true);
  const [isStartingSession, setIsStartingSession] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [verifyTargetContact, setVerifyTargetContact] = useState<TrustedContact | null>(null);
  const [alertSentModalOpen, setAlertSentModalOpen] = useState(false);

  // 1. Fetch Contacts
  const fetchContacts = useCallback(async () => {
    try {
      const res = await fetch("/api/emergency-circle/contacts");
      if (res.ok) {
        const data = await res.json();
        if (data.contacts) {
          setContacts(data.contacts);
          // By default, select all verified contacts
          const verified = data.contacts.filter((c: TrustedContact) => c.verificationStatus === "verified");
          setSelectedContactIds(verified.map((c: TrustedContact) => c.id));
        }
      }
    } catch (err) {
      console.error("Failed to load contacts:", err);
    } finally {
      setIsLoadingContacts(false);
    }
  }, []);

  // 2. Fetch Active Session
  const fetchActiveSession = useCallback(async () => {
    try {
      const res = await fetch("/api/emergency-circle/session");
      if (res.ok) {
        const data = await res.json();
        if (data.session) {
          setActiveSession(data.session);
        }
      }
    } catch (err) {
      console.error("Failed to load active emergency session:", err);
    }
  }, []);

  useEffect(() => {
    fetchContacts();
    fetchActiveSession();
  }, [fetchContacts, fetchActiveSession]);

  // Handle contact deletion
  const handleDeleteContact = async (contactId: string) => {
    if (!confirm("Are you sure you want to remove this contact from your Emergency Circle?")) return;

    try {
      const res = await fetch(`/api/emergency-circle/contacts/${contactId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setContacts((prev) => prev.filter((c) => c.id !== contactId));
        setSelectedContactIds((prev) => prev.filter((id) => id !== contactId));
      }
    } catch (err) {
      console.error("Failed to delete contact:", err);
    }
  };

  // Toggle selection
  const handleToggleSelect = (contactId: string) => {
    setSelectedContactIds((prev) =>
      prev.includes(contactId) ? prev.filter((id) => id !== contactId) : [...prev, contactId]
    );
  };

  const handleSelectAll = () => {
    const verified = contacts.filter((c) => c.verificationStatus === "verified");
    if (selectedContactIds.length === verified.length) {
      setSelectedContactIds([]);
    } else {
      setSelectedContactIds(verified.map((c) => c.id));
    }
  };

  // One-Tap Emergency Location Sharing Initiation
  const handleShareLocation = async () => {
    setErrorMessage(null);

    if (selectedContactIds.length === 0) {
      setErrorMessage("Please select at least one verified contact to receive your emergency alert.");
      return;
    }

    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setErrorMessage("Geolocation is not supported by your browser. Please enable GPS.");
      return;
    }

    setIsStartingSession(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords: LocationCoordinate = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          speed: pos.coords.speed,
          heading: pos.coords.heading,
          timestamp: new Date().toISOString(),
        };

        try {
          const res = await fetch("/api/emergency-circle/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contactIds: selectedContactIds,
              location: coords,
            }),
          });

          const data = await res.json();
          if (!res.ok || !data.success) {
            setErrorMessage(data.error || "Failed to start emergency location sharing.");
            setIsStartingSession(false);
            return;
          }

          setActiveSession(data.session);
          setIsStartingSession(false);
          setAlertSentModalOpen(true);
        } catch (err: any) {
          setErrorMessage("Failed to initiate emergency broadcast. Check your connection.");
          setIsStartingSession(false);
        }
      },
      (geoError) => {
        setIsStartingSession(false);
        if (geoError.code === geoError.PERMISSION_DENIED) {
          setErrorMessage("Location permission denied. Please allow location access in your browser settings to share your live position.");
        } else if (geoError.code === geoError.POSITION_UNAVAILABLE) {
          setErrorMessage("GPS position is currently unavailable. Try moving outdoors or checking device location settings.");
        } else {
          setErrorMessage("Timed out while retrieving GPS coordinates. Please try again.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 10000,
      }
    );
  };

  const verifiedContacts = contacts.filter((c) => c.verificationStatus === "verified");
  const pendingContacts = contacts.filter((c) => c.verificationStatus === "pending");

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 sm:p-6 text-slate-100">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-rose-600 to-indigo-600 text-white shadow-lg shadow-rose-600/20">
            <Radio className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Emergency Circle</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                Live Sharing
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Your trusted contacts · One-tap live GPS location dispatch
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/30 transition"
        >
          <UserPlus className="h-4 w-4" />
          <span>Add Trusted Contact</span>
        </button>
      </div>

      {/* Active Session Display (If currently running) */}
      {activeSession && activeSession.status === "active" && (
        <LiveSharingSessionView
          session={activeSession}
          onSessionUpdated={(updated) => setActiveSession(updated)}
          onSessionStopped={() => setActiveSession(null)}
        />
      )}

      {/* Emergency Guidance & Explanation Banner */}
      <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/60 to-[#0a1228] p-4 text-xs text-indigo-200">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-white">How Emergency Location Sharing Works</h4>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              When you feel unsafe or encounter an emergency, tap <strong>Share Emergency Location</strong>. A high-entropy, private tracking link will be instantly dispatched to all selected verified contacts via SMS. Recipient devices can view your real-time moving coordinates on a map without needing an app install.
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="flex items-start gap-2.5 rounded-xl border border-rose-500/40 bg-rose-950/50 p-3 text-xs text-rose-300 animate-in fade-in">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Primary One-Tap Emergency Action Bar */}
      <div className="rounded-2xl border border-rose-500/50 bg-gradient-to-r from-rose-950/80 via-slate-900 to-[#0c1226] p-5 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 text-[10px] uppercase font-black tracking-wider text-rose-400">
              <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
              <span>Instant Alert Ready</span>
            </span>
            <h2 className="text-base sm:text-lg font-black text-white">
              Send Alert to Selected Contacts
            </h2>
            <p className="text-xs text-slate-300">
              {selectedContactIds.length} of {verifiedContacts.length} verified contacts currently selected to receive your live location.
            </p>
          </div>

          <button
            type="button"
            onClick={handleShareLocation}
            disabled={isStartingSession || verifiedContacts.length === 0}
            className="group relative inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-rose-600 via-rose-500 to-rose-600 px-7 py-4 text-sm font-black text-white shadow-xl shadow-rose-600/40 hover:from-rose-500 hover:to-rose-500 active:scale-95 transition disabled:opacity-50 cursor-pointer"
          >
            {isStartingSession ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Acquiring GPS & Dispatching...</span>
              </>
            ) : (
              <>
                <Radio className="h-5 w-5 animate-pulse text-white group-hover:scale-110 transition-transform" />
                <span>Share Emergency Location</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Trusted Contacts Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">
              Trusted Contacts List ({contacts.length}/10)
            </h3>
          </div>

          {verifiedContacts.length > 0 && (
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition"
            >
              {selectedContactIds.length === verifiedContacts.length
                ? "Deselect All"
                : "Select All Verified"}
            </button>
          )}
        </div>

        {isLoadingContacts ? (
          <div className="flex items-center justify-center p-8 bg-slate-900/60 rounded-2xl border border-slate-800">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
          </div>
        ) : contacts.length === 0 ? (
          <div className="text-center p-8 rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 space-y-3">
            <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-2xl bg-slate-800 text-slate-400">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">No trusted contacts added yet</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Add your family members, siblings, or close friends so they can monitor your safety.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-xs font-bold text-white shadow-md transition"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add First Contact</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {contacts.map((contact) => {
              const isVerified = contact.verificationStatus === "verified";
              const isSelected = selectedContactIds.includes(contact.id);
              const maskedPhone = contact.normalizedPhone.replace(
                /(\+\d{2})(\d{2})(\d{4})(\d{4})/,
                "$1 $2*** **$4"
              );

              return (
                <div
                  key={contact.id}
                  className={`relative flex items-center justify-between p-4 rounded-2xl border transition ${
                    isSelected
                      ? "border-rose-500/50 bg-gradient-to-r from-rose-950/20 to-slate-900/90 shadow-md"
                      : "border-slate-800 bg-slate-900/60"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Checkbox for Verified Contacts */}
                    {isVerified ? (
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(contact.id)}
                        className="h-4 w-4 rounded accent-rose-600 cursor-pointer shrink-0"
                        title="Include in Emergency Location Share"
                      />
                    ) : (
                      <div
                        className="h-4 w-4 rounded border border-slate-700 bg-slate-800/80 shrink-0"
                        title="Verify phone number before selecting"
                      />
                    )}

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-white truncate">{contact.name}</p>
                        <span className="rounded-md bg-slate-800 border border-slate-700 px-1.5 py-0.2 text-[9px] font-semibold text-slate-300">
                          {contact.relationship}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {maskedPhone}
                      </p>

                      <div className="mt-1 flex items-center gap-2">
                        {isVerified ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Verified</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setVerifyTargetContact(contact)}
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 hover:text-amber-300 transition"
                          >
                            <KeyRound className="h-3 w-3" />
                            <span>Verify OTP Now</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    <button
                      type="button"
                      onClick={() => handleDeleteContact(contact.id)}
                      className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition"
                      title="Remove contact"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Contact Modal */}
      <AddContactModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onContactCreated={(newContact) => {
          setIsAddModalOpen(false);
          setContacts((prev) => [newContact, ...prev]);
          setVerifyTargetContact(newContact);
        }}
      />

      {/* OTP Verification Modal */}
      <OtpVerifyModal
        contact={verifyTargetContact}
        isOpen={Boolean(verifyTargetContact)}
        onClose={() => setVerifyTargetContact(null)}
        onVerified={(verifiedId) => {
          setContacts((prev) =>
            prev.map((c) => (c.id === verifiedId ? { ...c, verificationStatus: "verified" } : c))
          );
          setSelectedContactIds((prev) => [...prev, verifiedId]);
        }}
      />

      {/* Alert Sent Confirmation Modal */}
      <AlertSentModal
        session={activeSession}
        isOpen={alertSentModalOpen}
        onClose={() => setAlertSentModalOpen(false)}
        onViewSession={() => setAlertSentModalOpen(false)}
        onStopSharing={async () => {
          if (activeSession) {
            await fetch("/api/emergency-circle/session/stop", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ sessionId: activeSession.id }),
            });
            setActiveSession(null);
          }
        }}
      />
    </div>
  );
}

