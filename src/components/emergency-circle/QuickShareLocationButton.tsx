"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Loader2, Radio, ShieldAlert } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { AlertSentModal } from "./AlertSentModal";
import type { EmergencySharingSession, LocationCoordinate } from "@/lib/emergency-circle/types";

interface QuickShareLocationButtonProps {
  variant?: "header" | "mobile" | "banner";
  onSuccess?: (session: EmergencySharingSession) => void;
}

export function QuickShareLocationButton({
  variant = "header",
  onSuccess,
}: QuickShareLocationButtonProps) {
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [session, setSession] = useState<EmergencySharingSession | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleClick = async () => {
    if (!isAuthenticated) {
      window.location.href = "/login?returnUrl=/emergency-circle";
      return;
    }

    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      window.location.href = "/emergency-circle";
      return;
    }

    setIsLoading(true);

    try {
      // 1. Fetch user contacts to verify at least one verified contact exists
      const contactsRes = await fetch("/api/emergency-circle/contacts");
      if (!contactsRes.ok) {
        window.location.href = "/emergency-circle";
        setIsLoading(false);
        return;
      }

      const contactsData = await contactsRes.json();
      const verified = (contactsData.contacts || []).filter(
        (c: any) => c.verificationStatus === "verified"
      );

      if (verified.length === 0) {
        // Guide user to add and verify contacts first
        window.location.href = "/emergency-circle";
        setIsLoading(false);
        return;
      }

      const verifiedIds = verified.map((c: any) => c.id);

      // 2. Obtain current GPS position
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const coords: LocationCoordinate = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            timestamp: new Date().toISOString(),
          };

          const sessionRes = await fetch("/api/emergency-circle/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contactIds: verifiedIds,
              location: coords,
            }),
          });

          const sessionData = await sessionRes.json();
          if (sessionRes.ok && sessionData.success) {
            setSession(sessionData.session);
            setModalOpen(true);
            if (onSuccess) onSuccess(sessionData.session);
          } else {
            window.location.href = "/emergency-circle";
          }
          setIsLoading(false);
        },
        (err) => {
          console.warn("Location error:", err);
          window.location.href = "/emergency-circle";
          setIsLoading(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } catch (err) {
      window.location.href = "/emergency-circle";
      setIsLoading(false);
    }
  };

  if (variant === "mobile") {
    return (
      <>
        <button
          type="button"
          onClick={handleClick}
          disabled={isLoading}
          className="w-full flex items-center justify-between rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 p-3 text-xs font-black text-white shadow-lg shadow-rose-900/40 active:scale-95 transition"
        >
          <span className="flex items-center gap-2">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Radio className="h-4 w-4 animate-pulse text-rose-200" />
            )}
            <span>Share Emergency Location</span>
          </span>
          <span className="rounded bg-white/20 px-2 py-0.5 text-[10px] font-black uppercase">
            Live
          </span>
        </button>

        <AlertSentModal
          session={session}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onViewSession={() => {
            window.location.href = "/emergency-circle";
          }}
          onStopSharing={async () => {
            if (session) {
              await fetch("/api/emergency-circle/session/stop", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sessionId: session.id }),
              });
              setSession(null);
            }
          }}
        />
      </>
    );
  }

  // Header variant
  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={isLoading}
        className="relative group flex items-center gap-1.5 rounded-xl border border-rose-500/50 bg-gradient-to-r from-rose-600 via-rose-500 to-rose-600 px-3 py-1.5 text-xs font-black text-white shadow-md shadow-rose-600/30 hover:shadow-rose-600/50 active:scale-95 transition"
        title="Instantly dispatch your live location to your Emergency Circle"
      >
        {isLoading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Radio className="h-3.5 w-3.5 animate-pulse text-white" />
        )}
        <span className="hidden md:inline">Share Location</span>
        <span className="inline md:hidden">SOS Share</span>
      </button>

      <AlertSentModal
        session={session}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onViewSession={() => {
          window.location.href = "/emergency-circle";
        }}
        onStopSharing={async () => {
          if (session) {
            await fetch("/api/emergency-circle/session/stop", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ sessionId: session.id }),
            });
            setSession(null);
          }
        }}
      />
    </>
  );
}

