"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Crosshair,
  Maximize2,
  Minimize2,
  Send,
  Siren,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { ChatMessage, type ChatMessageItem } from "./ChatMessage";
import { LocationPermissionModal } from "./LocationPermissionModal";
import type {
  AssistantRequest,
  AssistantResponse,
  RouteOption,
  ServicePlace,
} from "@/lib/validation/assistantSchemas";
import type { UserLocation } from "@/lib/geoUtils";

interface SafetyAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  userLocation: UserLocation;
  onUpdateUserLocation: (loc: UserLocation) => void;
  onSelectPlaceOnMap?: (place: ServicePlace) => void;
  onSelectRouteOnMap?: (route: RouteOption) => void;
  onOpenSOSModal?: () => void;
}

const SUGGESTED_QUESTIONS = [
  "💬 Hi, how are you?",
  "✨ I'm bored. Talk to me.",
  "🌿 Can you tell me the safest place near me?",
  "🏥 Find the nearest hospital",
  "💊 24-hour pharmacies near me",
  "🛡️ Is Sitabuldi safe tonight?",
  "🗺️ Can I take a safer route?",
  "💡 Explain something interesting to me",
  "🚨 What should I do in an emergency?",
  "ℹ️ What is N-SHIELD?",
];

const INITIAL_GREETING: ChatMessageItem = {
  id: "msg-welcome",
  sender: "assistant",
  text: "Hello! I am your **N-SHIELD AI Assistant**.\n\nYou can talk with me naturally about anything — from everyday questions, casual conversation, and ideas, to finding nearest hospitals, 24/7 pharmacies, police stations, safe transit routes, and zone safety assessments across Nagpur.\n\nHow can I help you today?",
  timestamp: new Date().toISOString(),
  response: {
    answer: "Welcome to N-SHIELD AI Assistant",
    sourceMetadata: {
      sourcesUsed: ["N-SHIELD AI Assistant", "Google Gemini"],
      retrievedAt: new Date().toISOString(),
      dataFreshness: "Active",
    },
    suggestedFollowUps: [
      "Hi, how are you?",
      "I'm bored. Talk to me.",
      "Can you tell me the safest place near me?",
      "Find the nearest hospital",
      "What is N-SHIELD?",
    ],
  },
};

export function SafetyAssistant({
  isOpen,
  onClose,
  userLocation,
  onUpdateUserLocation,
  onSelectPlaceOnMap,
  onSelectRouteOnMap,
  onOpenSOSModal,
}: SafetyAssistantProps) {
  const [messages, setMessages] = useState<ChatMessageItem[]>([INITIAL_GREETING]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [, setErrorState] = useState<string | null>(null);

  // Conversational Memory / Context
  const [conversationContext, setConversationContext] = useState<
    AssistantRequest["context"]
  >({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll on new message
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isMinimized]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, isMinimized]);

  // Escape key closes modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    setErrorState(null);
    setInputText("");

    const userMessage: ChatMessageItem = {
      id: `user-${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const historyPayload = messages
        .filter((m) => m.id !== "msg-welcome")
        .slice(-20)
        .map((m) => ({
          role: m.sender === "user" ? ("user" as const) : ("assistant" as const),
          text: m.text,
        }));

      const payload: AssistantRequest = {
        message: text,
        userLocation: {
          lat: userLocation.lat,
          lng: userLocation.lng,
          label: userLocation.label,
          isUserSet: userLocation.isUserSet,
          source: userLocation.source,
        },
        context: conversationContext,
        history: historyPayload,
      };

      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Unable to reach safety assistant service.");
      }

      const data: AssistantResponse = await res.json();

      // Update conversational context
      if (data.contextUpdate) {
        setConversationContext((prev) => ({
          ...prev,
          ...data.contextUpdate,
        }));
      }

      const assistantMessage: ChatMessageItem = {
        id: `assistant-${Date.now()}`,
        sender: "assistant",
        text: data.answer,
        timestamp: new Date().toISOString(),
        response: data,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: unknown) {
      console.error("Safety assistant error:", err);
      const errMsg = err instanceof Error ? err.message : "Failed to process request. Please try again.";
      setErrorState(errMsg);

      const fallbackMsg: ChatMessageItem = {
        id: `err-${Date.now()}`,
        sender: "assistant",
        text: `⚠️ **Service Notice:** ${errMsg}\n\nIf this is an emergency, please dial **112** directly or tap the Emergency SOS button.`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([INITIAL_GREETING]);
    setConversationContext({});
    setErrorState(null);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Assistant Side Panel Drawer */}
      <aside
        id="safety-assistant-panel"
        aria-label="AI Safety Assistant"
        className={`fixed z-50 transition-all duration-300 ease-in-out shadow-2xl flex flex-col border border-slate-200/90 dark:border-slate-800 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-md overflow-hidden ${
          isMinimized
            ? "bottom-4 right-4 w-72 h-14 rounded-2xl"
            : "bottom-0 right-0 sm:bottom-4 sm:right-4 w-full h-[100dvh] sm:h-[680px] sm:max-h-[90vh] sm:w-[480px] sm:rounded-3xl"
        }`}
      >
        {/* Header Bar */}
        <div className="flex h-14 sm:h-16 shrink-0 items-center justify-between border-b border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 px-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-xs">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="truncate text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100">
                  AI Safety Assistant
                </h3>
                <span className="flex h-2 w-2 shrink-0 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="truncate text-[10px] text-slate-400 font-medium">
                Powered by Google Gemini & Spatial Intelligence • Nagpur
              </p>
            </div>
          </div>

          {/* Header Action Controls */}
          <div className="flex items-center gap-1">
            {!isMinimized && (
              <button
                type="button"
                onClick={handleClearHistory}
                aria-label="Clear chat history"
                title="Clear chat"
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsMinimized((m) => !m)}
              aria-label={isMinimized ? "Expand assistant" : "Minimize assistant"}
              title={isMinimized ? "Expand" : "Minimize"}
              className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95"
            >
              {isMinimized ? (
                <Maximize2 className="h-4 w-4" />
              ) : (
                <Minimize2 className="h-4 w-4" />
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close assistant"
              title="Close"
              className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content Body (When Not Minimized) */}
        {!isMinimized && (
          <div className="flex flex-1 flex-col overflow-hidden min-h-0">
            {/* Location Reference Banner */}
            <div
              className={`flex items-center justify-between border-b px-3.5 py-2 text-xs transition ${
                userLocation.isUserSet
                  ? "border-emerald-200/60 dark:border-emerald-800/80 bg-emerald-50/60 dark:bg-emerald-950/20"
                  : "border-amber-200/60 dark:border-amber-800/80 bg-amber-50/60 dark:bg-amber-950/20"
              }`}
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <Crosshair
                  className={`h-3.5 w-3.5 shrink-0 ${
                    userLocation.isUserSet
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-amber-600 dark:text-amber-400"
                  }`}
                />
                <span className="truncate text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  {userLocation.isUserSet
                    ? `${userLocation.label || "Custom Location"} (${
                        userLocation.source === "gps" ? "GPS active" : "Locality set"
                      })`
                    : "No location reference set"}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setLocationModalOpen(true)}
                className="shrink-0 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                {userLocation.isUserSet ? "Change Locality" : "📍 Set Locality"}
              </button>
            </div>

            {/* Emergency Priority Banner (Always accessible, independent of AI) */}
            <div className="flex items-center justify-between bg-rose-600 px-3.5 py-1.5 text-white text-[11px] font-bold">
              <div className="flex items-center gap-1.5">
                <Siren className="h-3.5 w-3.5 animate-bounce" />
                <span>Immediate Threat? Emergency Dispatch:</span>
              </div>
              <div className="flex items-center gap-1.5">
                <a
                  href="tel:112"
                  className="rounded-lg bg-white px-2 py-0.5 text-rose-700 font-black shadow-xs hover:bg-rose-50 active:scale-95 transition"
                >
                  📞 Call 112
                </a>
                {onOpenSOSModal && (
                  <button
                    type="button"
                    onClick={onOpenSOSModal}
                    className="rounded-lg bg-rose-800 px-2 py-0.5 text-white font-bold hover:bg-rose-900 active:scale-95 transition"
                  >
                    SOS Mode
                  </button>
                )}
              </div>
            </div>

            {/* Chat Message Scroll Area */}
            <div className="flex-1 overflow-y-auto p-3.5 space-y-4">
              {messages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  message={msg}
                  onSelectPlaceOnMap={onSelectPlaceOnMap}
                  onSelectRouteOnMap={onSelectRouteOnMap}
                  onRequestLocation={() => setLocationModalOpen(true)}
                  onSelectFollowUp={(q) => handleSendMessage(q)}
                />
              ))}

              {/* Loading Indicator Bubble */}
              {isLoading && (
                <div className="flex items-center gap-2.5 text-xs text-slate-500 animate-in fade-in">
                  <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-indigo-600 text-white">
                    <Sparkles className="h-3.5 w-3.5 animate-spin" />
                  </div>
                  <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 shadow-xs flex items-center gap-2">
                    <span className="inline-block h-2 w-2 rounded-full bg-indigo-600 animate-ping" />
                    <span>Thinking...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Question Chips (Horizontally Scrollable) */}
            <div className="shrink-0 border-t border-slate-200/60 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 p-2 overflow-x-auto no-scrollbar">
              <div className="flex gap-1.5 w-max">
                {SUGGESTED_QUESTIONS.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(q)}
                    disabled={isLoading}
                    className="min-h-[32px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-500 hover:text-indigo-600 px-3 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300 transition active:scale-95 whitespace-nowrap disabled:opacity-50"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Message Input Form */}
            <div className="shrink-0 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 sm:p-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <div className="relative flex-1">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Chat with N-SHIELD, ask anything, or find safety services..."
                    maxLength={1000}
                    disabled={isLoading}
                    className="w-full min-h-[44px] rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 text-xs sm:text-[13px] text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950 transition disabled:opacity-60"
                  />
                  {inputText.length > 800 && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">
                      {1000 - inputText.length}
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!inputText.trim() || isLoading}
                  aria-label="Send message"
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 dark:shadow-none transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        )}
      </aside>

      {/* Location Permission & Neighborhood Selector Modal */}
      <LocationPermissionModal
        isOpen={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
        onLocationSelected={(loc) => {
          onUpdateUserLocation(loc);
        }}
        currentLocation={userLocation}
      />
    </>
  );
}
