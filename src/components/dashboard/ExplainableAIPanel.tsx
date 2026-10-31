"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Brain, Lightbulb, ShieldAlert, X } from "lucide-react";
import type { ExplainableAnalysis } from "@/lib/explainableAI";

type ExplainableAIPanelProps = {
  analysis: ExplainableAnalysis | null;
  open: boolean;
  onClose: () => void;
};

function FactorBar({
  factor,
  animate,
  delay,
}: {
  factor: ExplainableAnalysis["factors"][0];
  animate: boolean;
  delay: number;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-slate-700">{factor.label}</span>
        <span
          className={`text-xs font-bold ${
            factor.severity === "high"
              ? "text-rose-600"
              : factor.severity === "medium"
                ? "text-amber-600"
                : "text-emerald-600"
          }`}
        >
          {factor.displayValue}
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
        <motion.div
          className={`h-full rounded-full ${
            factor.severity === "high"
              ? "bg-rose-500"
              : factor.severity === "medium"
                ? "bg-amber-500"
                : "bg-emerald-500"
          }`}
          initial={{ width: 0 }}
          animate={{ width: animate ? `${factor.value}%` : 0 }}
          transition={{ duration: 0.85, delay, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}

export function ExplainableAIPanel({ analysis, open, onClose }: ExplainableAIPanelProps) {
  const [barsReady, setBarsReady] = useState(false);

  useEffect(() => {
    if (open && analysis) {
      setBarsReady(false);
      const timer = window.setTimeout(() => setBarsReady(true), 120);
      return () => window.clearTimeout(timer);
    }
    setBarsReady(false);
  }, [open, analysis?.zoneId]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && analysis && (
        <>
          <motion.button
            type="button"
            aria-label="Close explainable AI panel"
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.aside
            className="fixed right-0 top-0 bottom-0 z-50 flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white/95 shadow-2xl backdrop-blur-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
          >
            {/* Panel Header */}
            <div className="border-b border-slate-100 bg-slate-50/80 px-6 py-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-indigo-600">
                    <Brain className="h-4 w-4" />
                    <p className="text-[11px] font-bold uppercase tracking-wider">
                      Explainable AI Engine
                    </p>
                  </div>
                  <h2 className="mt-2 text-xl font-bold text-slate-900">
                    Why is this area dangerous?
                  </h2>
                  <p className="mt-1 text-xs font-medium text-slate-500">
                    Zone Analysis: <span className="font-semibold text-slate-700">{analysis.zoneName}</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-slate-200 bg-white p-2 text-slate-400 shadow-2xs transition hover:bg-slate-50 hover:text-slate-700"
                  aria-label="Close panel"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 flex items-baseline gap-2">
                <span
                  className={`font-mono text-3xl font-extrabold ${
                    analysis.riskLevel === "high"
                      ? "text-rose-600"
                      : analysis.riskLevel === "medium"
                        ? "text-amber-600"
                        : "text-emerald-600"
                  }`}
                >
                  {analysis.riskScore}
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  / 100 Risk Score
                </span>
              </div>
            </div>

            {/* Panel Body */}
            <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
              {/* Risk Factors */}
              <div>
                <div className="mb-4 flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-rose-600" />
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Risk Factors Breakdown
                  </p>
                </div>
                <div className="space-y-4">
                  {analysis.factors.map((factor, index) => (
                    <FactorBar
                      key={factor.id}
                      factor={factor}
                      animate={barsReady}
                      delay={index * 0.12}
                    />
                  ))}
                </div>
              </div>

              {/* Actionable AI Recommendations */}
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4.5">
                <div className="mb-3 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-indigo-600" />
                  <p className="text-xs font-bold uppercase tracking-wider text-indigo-900">
                    Actionable AI Recommendations
                  </p>
                </div>
                <ul className="space-y-2.5">
                  {analysis.recommendations.map((item, index) => (
                    <motion.li
                      key={item}
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.45 + index * 0.08 }}
                      className="flex items-start gap-2.5 text-xs font-medium leading-relaxed text-slate-700"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-600" />
                      {item}
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
