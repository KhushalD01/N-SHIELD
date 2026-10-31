"use client";

import React from "react";
import { ExternalLink, Globe, Calendar, ShieldCheck, Info } from "lucide-react";
import type { WebResearchItem } from "@/lib/validation/assistantSchemas";

interface WebResearchCardProps {
  item: WebResearchItem;
}

export function WebResearchCard({ item }: WebResearchCardProps) {
  return (
    <div className="rounded-2xl border border-indigo-200/80 dark:border-indigo-900/60 bg-white/95 dark:bg-slate-900/95 p-3.5 shadow-xs space-y-2.5 transition hover:shadow-md hover:border-indigo-400 dark:hover:border-indigo-700">
      {/* Top Header: Source, Live Badge, and Date */}
      <div className="flex items-center justify-between text-[11px] gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <Globe className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <span className="font-bold text-indigo-700 dark:text-indigo-300 truncate">
            {item.publisher || "Live Web Source"}
          </span>
          {item.isLiveWeb && (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 px-1.5 py-0.2 text-[9px] font-bold text-emerald-700 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              LIVE
            </span>
          )}
        </div>

        {item.publishedAt && (
          <div className="flex items-center gap-1 text-[10px] text-slate-500 shrink-0">
            <Calendar className="h-3 w-3" />
            <span>
              {new Date(item.publishedAt).toLocaleDateString("en-IN", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        )}
      </div>

      {/* Title */}
      <h4 className="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-slate-100 leading-snug">
        {item.title}
      </h4>

      {/* Snippet */}
      {item.snippet && (
        <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
          {item.snippet}
        </p>
      )}

      {/* Extracted Facts */}
      {item.extractedFacts && item.extractedFacts.length > 0 && (
        <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-2 space-y-1 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-700 dark:text-slate-300">
            <ShieldCheck className="h-3 w-3 text-indigo-500" />
            <span>Extracted Key Points:</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5 text-[10px] text-slate-600 dark:text-slate-400">
            {item.extractedFacts.map((fact, idx) => (
              <li key={idx} className="line-clamp-2">
                {fact}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Bottom Footer: External Link & Disclaimer */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-[10px]">
        {item.url ? (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 hover:underline"
          >
            <span>View Source Article</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        ) : (
          <span className="text-slate-400">Source: Direct Query</span>
        )}

        {item.uncertaintyOrLimitations && (
          <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500 text-[9px] max-w-[50%] truncate" title={item.uncertaintyOrLimitations}>
            <Info className="h-2.5 w-2.5 shrink-0" />
            <span className="truncate">{item.uncertaintyOrLimitations}</span>
          </div>
        )}
      </div>
    </div>
  );
}
