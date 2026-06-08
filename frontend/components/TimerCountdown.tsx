"use client";

import { useEffect, useState } from "react";
import { Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type TimerCountdownProps = {
  targetDate: Date | string;
  onExpire?: () => void;
  className?: string;
};

export function TimerCountdown({ targetDate, onExpire, className }: TimerCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number; isExpired: boolean }>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    const target = new Date(targetDate).getTime();

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isExpired: true });
        if (onExpire) onExpire();
        return;
      }

      setTimeLeft({
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        isExpired: false,
      });
    };

    calculateTimeLeft(); // Initial call
    const timerId = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timerId);
  }, [targetDate, onExpire]);

  if (timeLeft.isExpired) {
    return (
      <div className={cn("flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-none", className)}>
        <AlertTriangle className="h-4 w-4" />
        <span className="font-bold text-sm">Waktu Habis</span>
      </div>
    );
  }

  const isWarning = timeLeft.hours < 2; // Kurang dari 2 jam

  return (
    <div
      className={cn(
        "flex items-center gap-2 border px-3 py-2 rounded-none font-mono font-bold tracking-tight transition-colors",
        isWarning
          ? "bg-orange-50 border-orange-200 text-orange-600 animate-pulse"
          : "bg-slate-50 border-slate-200 text-slate-700",
        className
      )}
    >
      <Clock className={cn("h-4 w-4", isWarning ? "animate-bounce" : "")} />
      <span>
        {String(timeLeft.hours).padStart(2, "0")}:
        {String(timeLeft.minutes).padStart(2, "0")}:
        {String(timeLeft.seconds).padStart(2, "0")}
      </span>
    </div>
  );
}
