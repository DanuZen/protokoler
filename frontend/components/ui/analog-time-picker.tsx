"use client";
import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export function AnalogTimePicker({
  value,
  onChange,
  onComplete,
}: {
  value: string;
  onChange: (v: string) => void;
  onComplete?: () => void;
}) {
  const [view, setView] = useState<"hour" | "minute">("hour");

  let initialH = 12;
  let initialM = 0;
  let initialAmPm = "AM";

  if (value) {
    const [h, m] = value.split(":").map(Number);
    initialH = h % 12 || 12;
    initialM = m || 0;
    initialAmPm = h >= 12 ? "PM" : "AM";
  }

  const [hour, setHour] = useState(initialH);
  const [minute, setMinute] = useState(initialM);
  const [ampm, setAmpm] = useState(initialAmPm);

  useEffect(() => {
    if (value) {
      const [h, m] = value.split(":").map(Number);
      setHour(h % 12 || 12);
      setMinute(m || 0);
      setAmpm(h >= 12 ? "PM" : "AM");
    }
  }, [value]);

  const handleUpdate = (h: number, m: number, ap: string) => {
    let finalH = h;
    if (ap === "PM" && finalH < 12) finalH += 12;
    if (ap === "AM" && finalH === 12) finalH = 0;
    const hh = finalH.toString().padStart(2, "0");
    const mm = m.toString().padStart(2, "0");
    onChange(`${hh}:${mm}`);
  };

  const setH = (h: number) => {
    setHour(h);
    handleUpdate(h, minute, ampm);
    setTimeout(() => setView("minute"), 300);
  };

  const setM = (m: number) => {
    setMinute(m);
    handleUpdate(hour, m, ampm);
    if (onComplete) {
      setTimeout(() => onComplete(), 300);
    }
  };

  const setAP = (ap: string) => {
    setAmpm(ap);
    handleUpdate(hour, minute, ap);
  };

  const radius = 90;
  const center = 100;

  const renderClockFace = () => {
    const items =
      view === "hour"
        ? [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
        : [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
    const currentVal = view === "hour" ? hour : minute;

    return (
      <div className="relative w-[200px] h-[200px] rounded-full bg-slate-50 mx-auto select-none shadow-inner border border-slate-100/50">
        {/* Center dot */}
        <div className="absolute w-2 h-2 rounded-full bg-[#6B0000] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10" />

        {/* Hand */}
        {(() => {
          let angle = 0;
          if (view === "hour") {
            angle = currentVal * 30 - 90;
          } else {
            angle = currentVal * 6 - 90;
          }
          return (
            <div
              className="absolute top-1/2 left-1/2 h-[2px] bg-[#6B0000] origin-left transition-transform duration-200 ease-out z-0"
              style={{ width: radius - 20, transform: `rotate(${angle}deg)` }}
            >
              <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#6B0000]" />
            </div>
          );
        })()}

        {/* Numbers */}
        {items.map((val, i) => {
          const angle = i * 30 - 90;
          const rad = (angle * Math.PI) / 180;
          const x = center + (radius - 20) * Math.cos(rad);
          const y = center + (radius - 20) * Math.sin(rad);

          const isActive =
            view === "hour"
              ? hour === val || (val === 12 && hour === 12)
              : minute === val;

          return (
            <button
              key={val}
              type="button"
              className={cn(
                "absolute w-8 h-8 -ml-4 -mt-4 rounded-full flex items-center justify-center text-sm transition-colors z-10",
                isActive
                  ? "bg-[#6B0000] text-white font-bold"
                  : "text-slate-600 hover:bg-slate-200"
              )}
              style={{ left: x, top: y }}
              onClick={() => (view === "hour" ? setH(val) : setM(val))}
            >
              {view === "minute" && val === 0 ? "00" : val}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center p-5 bg-white w-full">
      {/* Header */}
      <div className="flex items-end gap-2 mb-6">
        <button
          type="button"
          className={cn(
            "text-4xl font-light hover:bg-slate-50 px-2 rounded-lg transition-colors",
            view === "hour" ? "text-slate-900 font-medium" : "text-slate-400"
          )}
          onClick={() => setView("hour")}
        >
          {hour.toString().padStart(2, "0")}
        </button>
        <span className="text-3xl text-slate-300 mb-1">:</span>
        <button
          type="button"
          className={cn(
            "text-4xl font-light hover:bg-slate-50 px-2 rounded-lg transition-colors",
            view === "minute" ? "text-slate-900 font-medium" : "text-slate-400"
          )}
          onClick={() => setView("minute")}
        >
          {minute.toString().padStart(2, "0")}
        </button>
        <div className="flex flex-col ml-3 gap-1">
          <button
            type="button"
            className={cn(
              "text-xs font-bold px-2.5 py-1.5 rounded-lg transition-colors",
              ampm === "AM"
                ? "bg-red-50 text-[#6B0000]"
                : "text-slate-400 hover:bg-slate-100"
            )}
            onClick={() => setAP("AM")}
          >
            AM
          </button>
          <button
            type="button"
            className={cn(
              "text-xs font-bold px-2.5 py-1.5 rounded-lg transition-colors",
              ampm === "PM"
                ? "bg-red-50 text-[#6B0000]"
                : "text-slate-400 hover:bg-slate-100"
            )}
            onClick={() => setAP("PM")}
          >
            PM
          </button>
        </div>
      </div>

      {/* Clock */}
      {renderClockFace()}
    </div>
  );
}
