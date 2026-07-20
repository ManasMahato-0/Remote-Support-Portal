"use client";
import { useEffect, useState } from "react";

export function useCountdown(seconds: number, opts: { onExpire?: () => void; running?: boolean } = {}) {
  const { onExpire, running = true } = opts;
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => { setRemaining(seconds); }, [seconds]);

  useEffect(() => {
    if (!running || remaining <= 0) { if (remaining <= 0) onExpire?.(); return; }
    const id = setInterval(() => setRemaining((r) => (r > 0 ? r - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [running, remaining <= 0]);

  useEffect(() => { if (remaining === 0 && running) onExpire?.(); }, [remaining]);

  return remaining;
}

export function formatTime(total: number) {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function useDeadlineCountdown(deadline: number | null, onExpire?: () => void) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    if (!deadline) return;
    if (now >= deadline) onExpire?.();
  }, [deadline, now >= (deadline ?? Infinity)]);
  return deadline ? Math.max(0, Math.ceil((deadline - now) / 1000)) : 0;
}

export function TimerRing({ seconds, total, label, tone = "primary" }: {
  seconds: number; total: number; label?: string; tone?: "primary" | "destructive";
}) {
  const pct = total > 0 ? seconds / total : 0;
  const circumference = 2 * Math.PI * 42;
  const dashOffset = circumference * (1 - pct);
  const toneColor = tone === "destructive" ? "stroke-destructive" : "stroke-primary";
  return (
    <div className="relative grid h-32 w-32 place-items-center">
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="42" className="fill-none stroke-border" strokeWidth="6" />
        <circle cx="50" cy="50" r="42"
          className={`fill-none ${toneColor} transition-[stroke-dashoffset] duration-1000 ease-linear`}
          strokeWidth="6" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={dashOffset} />
      </svg>
      <div className="flex flex-col items-center leading-none">
        <span className="font-mono text-2xl font-semibold tabular-nums">{formatTime(seconds)}</span>
        {label && <span className="mt-1 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{label}</span>}
      </div>
    </div>
  );
}
