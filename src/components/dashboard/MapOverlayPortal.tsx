"use client";

import React, { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";

export interface MapOverlayPortalProps {
  children: React.ReactNode;
  mapContainerRef: React.RefObject<HTMLDivElement | null>;
  clickLocation?: {
    lat: number;
    lng: number;
    screenX?: number;
    screenY?: number;
  } | null;
  targetWidth?: number;
  topOffset?: number;
  align?: "auto" | "left" | "right";
  onClose?: () => void;
  className?: string;
  id?: string;
}

/**
 * MapOverlayPortal renders floating cards, popups, and panels outside the map container
 * using React Portals directly into document.body.
 *
 * This completely prevents parent containers (overflow: hidden, fixed height, etc.)
 * from clipping bottom content, while intelligently positioning the overlay near the
 * clicked location or within comfortable viewport bounds.
 */
export function MapOverlayPortal({
  children,
  mapContainerRef,
  clickLocation,
  targetWidth = 380,
  topOffset = 70,
  align = "auto",
  onClose,
  className = "",
  id = "map-overlay-portal",
}: MapOverlayPortalProps) {
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState<{
    top: number;
    left: number;
    width: number;
    maxHeight: number;
  }>({
    top: 80,
    left: 24,
    width: 380,
    maxHeight: 650,
  });

  const updatePosition = useCallback(() => {
    if (typeof window === "undefined") return;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const mapRect = mapContainerRef.current?.getBoundingClientRect() || null;

    // Small Mobile Viewports (< 640px)
    if (vw < 640) {
      const width = Math.min(vw - 20, 420);
      const left = Math.max(10, Math.round((vw - width) / 2));
      const top = mapRect ? Math.max(68, Math.min(Math.round(mapRect.top + 8), vh - 380)) : 72;
      const maxHeight = Math.max(320, vh - top - 12);

      setPosition({ top, left, width, maxHeight });
      return;
    }

    // Tablet & Desktop Viewports (>= 640px)
    const width = Math.min(targetWidth, vw - 32);

    let left = mapRect ? Math.max(16, Math.round(mapRect.left + 20)) : 24;
    let top = mapRect ? Math.max(76, Math.round(mapRect.top + topOffset)) : 80;

    if (align === "right") {
      left = mapRect ? Math.max(16, Math.round(mapRect.right - width - 16)) : Math.round(vw - width - 24);
    } else if (align === "left") {
      left = mapRect ? Math.max(16, Math.round(mapRect.left + 20)) : 24;
    } else if (clickLocation?.screenX && clickLocation?.screenY) {
      const clickX = clickLocation.screenX;
      const clickY = clickLocation.screenY;

      // Smart horizontal placement relative to click location
      const spaceOnRight = vw - (clickX + 24);
      const spaceOnLeft = clickX - 24;

      if (spaceOnRight >= width) {
        left = Math.round(clickX + 16);
      } else if (spaceOnLeft >= width) {
        left = Math.round(clickX - width - 16);
      } else if (mapRect) {
        left = Math.max(16, Math.round(mapRect.right - width - 16));
      } else {
        left = Math.max(16, Math.min(24, vw - width - 16));
      }

      // If placed on the left side of the map where the filter panel lives,
      // prefer moving it to the right side of the map if space permits,
      // so it never covers the filter controls!
      if (mapRect && left < mapRect.left + 420 && mapRect.right - width - 16 > mapRect.left + 420) {
        left = Math.round(mapRect.right - width - 16);
      }

      // Smart vertical placement relative to click location
      const desiredTop = clickY - 40;
      top = Math.max(76, Math.min(desiredTop, vh - 450));
      if (mapRect && mapRect.top > 0) {
        top = Math.max(Math.round(mapRect.top + 10), top);
      }
    } else if (mapRect) {
      // Default auto placement: anchor to the right side of the map
      // so top-left filters remain completely unobstructed
      if (mapRect.width >= width + 200) {
        left = Math.round(mapRect.right - width - 16);
      } else {
        left = Math.max(16, Math.round(mapRect.left + 20));
      }
    }

    // Viewport bounds clamping
    if (left + width > vw - 16) {
      left = Math.max(16, vw - width - 16);
    }
    if (left < 16) {
      left = 16;
    }

    if (top < 68) {
      top = 68;
    }

    const maxHeight = Math.max(340, vh - top - 16);

    setPosition({ top, left, width, maxHeight });
  }, [mapContainerRef, clickLocation, targetWidth, topOffset, align]);

  useEffect(() => {
    setMounted(true);
    updatePosition();
  }, [updatePosition]);

  // Recalculate position on scroll (including inner main scroll) and window resize
  useEffect(() => {
    if (!mounted) return;

    window.addEventListener("resize", updatePosition, { passive: true });
    // Capture scroll events on any ancestor scroll containers (like <main>)
    document.addEventListener("scroll", updatePosition, { capture: true, passive: true });

    const timer = setTimeout(updatePosition, 100);

    return () => {
      window.removeEventListener("resize", updatePosition);
      document.removeEventListener("scroll", updatePosition, { capture: true });
      clearTimeout(timer);
    };
  }, [mounted, updatePosition]);

  // Escape key closes overlay
  useEffect(() => {
    if (!onClose) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!mounted || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      id={id}
      style={{
        position: "fixed",
        top: `${position.top}px`,
        left: `${position.left}px`,
        width: `${position.width}px`,
        maxHeight: `${position.maxHeight}px`,
        zIndex: 9999,
      }}
      className={`pointer-events-auto transition-all duration-200 animate-in fade-in zoom-in-98 flex flex-col ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>,
    document.body
  );
}
