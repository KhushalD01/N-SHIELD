"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  Bell,
  Camera,
  Check,
  CheckCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  MapPin,
  Newspaper,
  Shield,
  ShieldAlert,
  Siren,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";

export interface SafetyNotification {
  id: string;
  type: "urgent" | "patrol" | "cctv" | "news" | "civic";
  title: string;
  message: string;
  time: string;
  zoneName?: string;
  zoneId?: string;
  isRead: boolean;
}

const DEFAULT_NOTIFICATIONS: SafetyNotification[] = [
  {
    id: "notif-1",
    type: "urgent",
    title: "Night Safety Advisory — Wardha Road",
    message: "Elevated risk index detected after 10:00 PM near flyover descent. Stick to well-lit WHC corridor.",
    time: "10m ago",
    zoneName: "Wardha Road",
    zoneId: "zone-10",
    isRead: false,
  },
  {
    id: "notif-2",
    type: "patrol",
    title: "Damini Safety Squad Active in Dharampeth",
    message: "Special women safety mobile patrol unit deployed along Zenda Chowk & WHC Road.",
    time: "25m ago",
    zoneName: "Dharampeth",
    zoneId: "zone-2",
    isRead: false,
  },
  {
    id: "notif-3",
    type: "cctv",
    title: "CCTV Blind Spot Detected in Mahal",
    message: "2 traffic surveillance cameras undergoing maintenance near Badkas Square.",
    time: "1h ago",
    zoneName: "Mahal",
    zoneId: "zone-5",
    isRead: false,
  },
  {
    id: "notif-4",
    type: "news",
    title: "Verified News: Traffic Diversion on Central Avenue",
    message: "Nagpur Traffic Police issued advisory for Telephone Exchange Square corridor.",
    time: "2h ago",
    zoneName: "Lakadganj",
    zoneId: "zone-16",
    isRead: true,
  },
  {
    id: "notif-5",
    type: "civic",
    title: "Streetlight Repair Completed on Sitabuldi",
    message: "NMC maintenance team restored illumination on Variety Square alleyway.",
    time: "4h ago",
    zoneName: "Sitabuldi",
    zoneId: "zone-1",
    isRead: true,
  },
];

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectZone?: (zoneId: string) => void;
}

export function NotificationDropdown({
  isOpen,
  onClose,
  onSelectZone,
}: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<SafetyNotification[]>(DEFAULT_NOTIFICATIONS);
  const [filter, setFilter] = useState<"all" | "urgent" | "patrol" | "cctv">("all");

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const filtered = notifications.filter((n) => {
    if (filter === "all") return true;
    return n.type === filter;
  });

  const getTypeIcon = (type: SafetyNotification["type"]) => {
    switch (type) {
      case "urgent":
        return <ShieldAlert className="h-4 w-4 text-rose-600" />;
      case "patrol":
        return <Siren className="h-4 w-4 text-indigo-600" />;
      case "cctv":
        return <Camera className="h-4 w-4 text-amber-600" />;
      case "news":
        return <Newspaper className="h-4 w-4 text-blue-600" />;
      default:
        return <Shield className="h-4 w-4 text-emerald-600" />;
    }
  };

  return (
    <>
      {/* Backdrop for click outside */}
      <div
        className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-xs"
        onClick={onClose}
      />

      {/* Notification Container (Responsive Dropdown on Desktop, Bottom Sheet on Mobile) */}
      <div className="fixed inset-x-3 top-16 sm:top-20 sm:right-6 sm:left-auto sm:w-96 z-50 rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[80vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600">
              <Bell className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <span>Safety Alerts</span>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-rose-500 text-white px-2 py-0.2 text-[10px] font-extrabold">
                    {unreadCount} new
                  </span>
                )}
              </h3>
              <p className="text-[10px] text-slate-400 font-medium">
                Live Nagpur City Safety Broadcasts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition"
                title="Mark all as read"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Read all</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 px-4 py-2 border-b border-slate-100 dark:border-slate-800 overflow-x-auto text-[11px] font-bold">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`rounded-xl px-2.5 py-1 transition ${
              filter === "all"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("urgent")}
            className={`rounded-xl px-2.5 py-1 transition ${
              filter === "urgent"
                ? "bg-rose-600 text-white shadow-xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
            }`}
          >
            🚨 Urgent
          </button>
          <button
            type="button"
            onClick={() => setFilter("patrol")}
            className={`rounded-xl px-2.5 py-1 transition ${
              filter === "patrol"
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
            }`}
          >
            🚓 Patrols
          </button>
          <button
            type="button"
            onClick={() => setFilter("cctv")}
            className={`rounded-xl px-2.5 py-1 transition ${
              filter === "cctv"
                ? "bg-amber-600 text-white shadow-xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
            }`}
          >
            📹 CCTV
          </button>
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 space-y-1">
              <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500/80 mb-2" />
              <p className="font-bold text-slate-700 dark:text-slate-300">All clear!</p>
              <p>No active safety notifications in this category.</p>
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => markAsRead(item.id)}
                className={`group relative rounded-2xl border p-3 transition-all cursor-pointer ${
                  item.isRead
                    ? "border-slate-200/60 dark:border-slate-800/60 bg-slate-50/40 dark:bg-slate-800/20 opacity-80"
                    : "border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/30 dark:bg-indigo-950/20 shadow-xs"
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-slate-800 shadow-2xs">
                    {getTypeIcon(item.type)}
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug truncate">
                        {item.title}
                      </h4>
                      <span className="flex items-center gap-1 text-[10px] text-slate-400 shrink-0 font-medium">
                        <Clock className="h-3 w-3" />
                        {item.time}
                      </span>
                    </div>

                    <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                      {item.message}
                    </p>

                    {item.zoneName && (
                      <div className="mt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-2">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500">
                          <MapPin className="h-3 w-3 text-indigo-500" />
                          <span>📍 {item.zoneName}</span>
                        </span>

                        {onSelectZone && item.zoneId && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectZone(item.zoneId!);
                              onClose();
                            }}
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                          >
                            <span>View on Map</span>
                            <ExternalLink className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="border-t border-slate-100 dark:border-slate-800 p-3 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">
              {notifications.length} safety alert{notifications.length > 1 ? "s" : ""}
            </span>
            <button
              type="button"
              onClick={clearAll}
              className="inline-flex items-center gap-1 font-semibold text-slate-500 hover:text-rose-600 transition"
            >
              <Trash2 className="h-3 w-3" />
              <span>Clear list</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
}
