"use client";

import React, { useState } from "react";
import { AlertCircle, Check, Loader2, Phone, User, Users, X } from "lucide-react";
import type { ContactRelationship, TrustedContact } from "@/lib/emergency-circle/types";

interface AddContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContactCreated: (contact: TrustedContact) => void;
}

export function AddContactModal({ isOpen, onClose, onContactCreated }: AddContactModalProps) {
  const [name, setName] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [relationship, setRelationship] = useState<ContactRelationship>("Family");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || name.trim().length < 2) {
      setError("Please enter the contact's full name (at least 2 characters).");
      return;
    }

    const cleanNumber = phoneNumber.replace(/[^0-9]/g, "");
    if (cleanNumber.length !== 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/emergency-circle/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          countryCode,
          phoneNumber: cleanNumber,
          relationship,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Failed to add contact.");
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      onContactCreated(data.contact);
    } catch (err: any) {
      setError("A network error occurred. Please check your connection.");
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-700/80 bg-[#0b1329] p-6 shadow-2xl text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Add Trusted Contact</h3>
              <p className="text-xs text-slate-400">Step 1 of 2: Contact Details</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-rose-500/30 bg-rose-950/40 p-3 text-xs text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Contact's Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Dr. Suresh Deshmukh"
                className="w-full rounded-xl border border-slate-700/80 bg-slate-900/90 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Relationship Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Relationship
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["Family", "Friend", "Other"] as ContactRelationship[]).map((rel) => (
                <button
                  key={rel}
                  type="button"
                  onClick={() => setRelationship(rel)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition ${
                    relationship === rel
                      ? "border-indigo-500 bg-indigo-600/30 text-white"
                      : "border-slate-800 bg-slate-900/60 text-slate-400 hover:bg-slate-800"
                  }`}
                >
                  {rel}
                </button>
              ))}
            </div>
          </div>

          {/* Phone Number with Country Code */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Mobile Phone Number
            </label>
            <div className="flex gap-2">
              <div className="w-24 shrink-0">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-900/90 px-2.5 py-2.5 text-xs text-white font-medium focus:border-indigo-500 focus:outline-none"
                >
                  <option value="+91">🇮🇳 +91</option>
                  <option value="+1">🇺🇸 +1</option>
                  <option value="+44">🇬🇧 +44</option>
                  <option value="+971">🇦🇪 +971</option>
                  <option value="+61">🇦🇺 +61</option>
                </select>
              </div>
              <div className="relative flex-1">
                <Phone className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="98223 45678"
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-900/90 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              A 6-digit OTP will be dispatched to verify and activate this emergency contact.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/30 transition disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving Contact...</span>
                </>
              ) : (
                <span>Next: Verify Phone</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

