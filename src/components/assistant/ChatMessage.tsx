"use client";

import React from "react";
import { Bot, Crosshair, User } from "lucide-react";
import type {
  AssistantResponse,
  RouteOption,
  ServicePlace,
} from "@/lib/validation/assistantSchemas";
import { EmergencyHelplineCard } from "./EmergencyHelplineCard";
import { ServiceResultCard } from "./ServiceResultCard";
import { RouteComparisonCard } from "./RouteComparisonCard";
import { NewsResultCard } from "./NewsResultCard";
import { IncidentEvidenceCard } from "./IncidentEvidenceCard";
import { WebResearchCard } from "./WebResearchCard";

export interface ChatMessageItem {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  response?: AssistantResponse;
}

interface ChatMessageProps {
  message: ChatMessageItem;
  onSelectPlaceOnMap?: (place: ServicePlace) => void;
  onSelectRouteOnMap?: (route: RouteOption) => void;
  onRequestLocation?: () => void;
  onSelectFollowUp?: (question: string) => void;
}

export function ChatMessage({
  message,
  onSelectPlaceOnMap,
  onSelectRouteOnMap,
  onRequestLocation,
  onSelectFollowUp,
}: ChatMessageProps) {
  const isUser = message.sender === "user";
  const items = message.response?.items;
  const metadata = message.response?.sourceMetadata;
  const requiresLocation = message.response?.requiresLocation;
  const followUps = message.response?.suggestedFollowUps;

  return (
    <div
      className={`flex gap-2.5 sm:gap-3 ${
        isUser ? "flex-row-reverse" : "flex-row"
      } animate-in fade-in duration-200`}
    >
      {/* Avatar Icon */}
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl shadow-xs ${
          isUser
            ? "bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900"
            : "bg-indigo-600 text-white"
        }`}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      {/* Message Content Container */}
      <div
        className={`flex flex-col gap-2 max-w-[88%] sm:max-w-[85%] ${
          isUser ? "items-end" : "items-start"
        }`}
      >
        {/* Main Text Bubble */}
        <div
          className={`rounded-2xl px-3.5 py-2.5 text-xs sm:text-[13px] leading-relaxed shadow-xs ${
            isUser
              ? "bg-indigo-600 text-white rounded-tr-none font-medium"
              : "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-800 rounded-tl-none whitespace-pre-wrap"
          }`}
        >
          {message.text}
        </div>

        {/* Explicit Location Action Button */}
        {!isUser && requiresLocation && onRequestLocation && (
          <div className="pt-1">
            <button
              type="button"
              onClick={onRequestLocation}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 text-xs font-bold shadow-md shadow-indigo-200 dark:shadow-none active:scale-95 transition"
            >
              <Crosshair className="h-4 w-4 animate-pulse" />
              <span>📍 Share My Location / Select Neighborhood</span>
            </button>
          </div>
        )}

        {/* Structured Results (Only for Assistant messages) */}
        {!isUser && items && (
          <div className="w-full space-y-3 pt-1">
            {/* 1. Helplines */}
            {items.helplines && items.helplines.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                {items.helplines.map((h) => (
                  <EmergencyHelplineCard key={h.id} helpline={h} />
                ))}
              </div>
            )}

            {/* 2. Places (Hospitals, Police, Pharmacies) */}
            {items.places && items.places.length > 0 && (
              <div className="grid grid-cols-1 gap-2.5 w-full">
                {items.places.map((place) => (
                  <ServiceResultCard
                    key={place.id}
                    place={place}
                    onSelectOnMap={onSelectPlaceOnMap}
                  />
                ))}
              </div>
            )}

            {/* 3. Routes & Safe Route Comparisons */}
            {items.routes && items.routes.length > 0 && (
              <div className="w-full">
                <RouteComparisonCard
                  routes={items.routes}
                  onSelectRouteOnMap={onSelectRouteOnMap}
                />
              </div>
            )}

            {/* 4. Incidents Evidence */}
            {items.incidents && items.incidents.length > 0 && (
              <div className="w-full">
                <IncidentEvidenceCard incidents={items.incidents} />
              </div>
            )}

            {/* 5. News Items */}
            {items.news && items.news.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                {items.news.map((n) => (
                  <NewsResultCard key={n.id} item={n} />
                ))}
              </div>
            )}

            {/* 6. Live Web Research (TinyFish) */}
            {items.research && items.research.length > 0 && (
              <div className="grid grid-cols-1 gap-2.5 w-full">
                {items.research.map((r) => (
                  <WebResearchCard key={r.id} item={r} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Suggested Quick Follow-Up Chips */}
        {!isUser && followUps && followUps.length > 0 && onSelectFollowUp && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {followUps.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectFollowUp(q)}
                className="rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/70 dark:bg-indigo-950/40 hover:bg-indigo-100 hover:border-indigo-400 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-[11px] font-semibold px-2.5 py-1 active:scale-95 transition text-left"
              >
                💡 {q}
              </button>
            ))}
          </div>
        )}

        {/* Source Metadata & Verification Stamp */}
        {!isUser && metadata && metadata.sourcesUsed && metadata.sourcesUsed.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500 pt-0.5">
            <span className="font-semibold text-slate-500 dark:text-slate-400">
              {metadata.dataFreshness === "Conversational" ? "Response via:" : "Verified by:"}
            </span>
            <span>{metadata.sourcesUsed.join(", ")}</span>
            {metadata.dataFreshness && metadata.dataFreshness !== "Conversational" && (
              <>
                <span>•</span>
                <span>{metadata.dataFreshness}</span>
              </>
            )}
          </div>
        )}

        {/* Timestamp */}
        <span className="text-[10px] text-slate-400 px-1">
          {new Date(message.timestamp).toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  );
}
