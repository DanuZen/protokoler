"use client";

/**
 * ViewportFitGrid
 * ----------------
 * - Non-mobile (>=768px): grid auto-fit kolom dulu, lalu scale-down jika overflow.
 * - Mobile (<768px): scale nonaktif, grid 1 kolom, scroll normal.
 *
 * Props:
 *   minCardWidth  — lebar min card sebelum grid kurangi kolom (default: 240px)
 *   minScale      — batas bawah scale agar card tidak terlalu kecil (default: 0.6)
 *   gap           — jarak antar card dalam px (default: 16)
 *   className     — class tambahan opsional untuk grid
 */

import {
  useEffect,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from "react";

const MOBILE_BREAKPOINT_PX = 768;

interface ViewportFitGridProps {
  children: ReactNode;
  minCardWidth?: number;
  minScale?: number;
  gap?: number;
  className?: string;
  gridTemplateColumns?: string;
  forceScaleOnMobile?: boolean;
}

export function ViewportFitGrid({
  children,
  minCardWidth = 240,
  minScale = 0.6,
  gap = 16,
  className = "",
  gridTemplateColumns,
  forceScaleOnMobile = false,
}: ViewportFitGridProps) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const [shouldScale, setShouldScale] = useState(true);

  const recalculate = useCallback(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;

    const mobile = window.innerWidth < MOBILE_BREAKPOINT_PX;
    setIsMobile(mobile);
    
    const scaleEnabled = !mobile || forceScaleOnMobile;
    setShouldScale(scaleEnabled);

    if (!scaleEnabled) {
      setScale(1);
      return;
    }

    const availableWidth = outer.clientWidth;
    const availableHeight = outer.clientHeight;
    const contentWidth = inner.scrollWidth;
    const contentHeight = inner.scrollHeight;

    if (contentWidth === 0 || contentHeight === 0) return;

    const scaleX = availableWidth / contentWidth;
    const scaleY = availableHeight / contentHeight;
    const nextScale = Math.min(1, scaleX, scaleY);

    setScale(Math.max(minScale, nextScale));
  }, [minScale, forceScaleOnMobile]);

  useEffect(() => {
    recalculate();

    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;

    const ro = new ResizeObserver(() => {
      requestAnimationFrame(recalculate);
    });
    ro.observe(outer);
    ro.observe(inner);

    window.addEventListener("resize", recalculate);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", recalculate);
    };
  }, [recalculate]);

  return (
    <div
      ref={outerRef}
      style={
        !shouldScale
          ? { overflow: "visible", height: "auto", width: "100%" }
          : { overflow: "hidden", height: "100%", width: "100%", position: "relative" }
      }
    >
      <div
        ref={innerRef}
        className={className}
        style={{
          display: "grid",
          ...(gridTemplateColumns !== 'none' ? {
            gridTemplateColumns: isMobile
              ? "1fr"
              : (gridTemplateColumns || `repeat(auto-fit, minmax(${minCardWidth}px, 1fr))`)
          } : {}),
          gap: `${gap}px`,
          transform: !shouldScale ? "none" : `scale(${scale})`,
          transformOrigin: "top left",
          width: !shouldScale ? "100%" : `${100 / scale}%`,
          height: !shouldScale ? "100%" : `${100 / scale}%`,
          transition: "transform 120ms ease-out",
        }}
      >
        {children}
      </div>
    </div>
  );
}
