"use client";

import React from "react";
import { ExternalLink } from "lucide-react";
import type { NewsItem } from "@/lib/validation/assistantSchemas";

interface NewsResultCardProps {
  item: NewsItem;
}

export function NewsResultCard({ item }: NewsResultCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-xs space-y-1.5 transition hover:shadow-md">
      <div className="flex items-center justify-between text-[10px] text-slate-500">
        <span className="font-bold text-indigo-600 dark:text-indigo-400">
          {item.publisher}
        </span>
        {item.publishedAt && (
          <span>{new Date(item.publishedAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</span>
        )}
      </div>

      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug">
        {item.title}
      </h4>

      {item.summary && (
        <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2">
          {item.summary}
        </p>
      )}

      {item.url && (
        <div className="pt-1">
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            <span>Read verified story</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}
    </div>
  );
}
