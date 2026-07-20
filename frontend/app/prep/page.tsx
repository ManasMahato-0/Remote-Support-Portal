"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle2, Camera, ShieldCheck, ArrowRight } from "lucide-react";
import { ProgressSteps } from "@/components/ProgressSteps";
import { TimerRing, useCountdown } from "@/components/Timer";
import { useJobState } from "@/hooks/useJobState";
import { EQUIPMENT_LABEL, SAFETY_INSTRUCTIONS, SEVERITY_LABEL } from "@/lib/jobState";
import { markActivityStarted } from "@/app/actions";

type MediaStatus = "idle" | "granting" | "granted" | "denied";

export default function PrepPage() {
  const { state, update, hydrated } = useJobState();
  const router = useRouter();
  const [mediaStatus, setMediaStatus] = useState<MediaStatus>("idle");
  const [mediaError, setMediaError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [advancing, setAdvancing] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    if (!state.equipment || !state.severity) router.replace("/");
  }, [hydrated, state.equipment, state.severity, router]);

  const proceed = useCallback(async () => {
    if (advancing) return;
    setAdvancing(true);
    update({ prepDone: true, activityDeadline: Date.now() + 600_000 });
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    await markActivityStarted();
    router.push("/activity");
  }, [advancing, update, router]);

  const remaining = useCountdown(30, { onExpire: proceed, running: hydrated && !advancing });

  const requestMedia = async () => {
    setMediaStatus("granting");
    setMediaError(null);
    try {
      if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia)
        throw new Error("Media capture is not available in this browser.");
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      setMediaStatus("granted");
    } catch (err) {
      const msg = err instanceof Error && err.name === "NotAllowedError"
        ? "Camera and microphone permission was denied."
        : err instanceof Error ? err.message : "Could not access camera and microphone.";
      setMediaError(msg);
      setMediaStatus("denied");
    }
  };

  useEffect(() => {
    return () => { streamRef.current?.getTracks().forEach((t) => t.stop()); };
  }, []);

  if (!hydrated || !state.equipment || !state.severity) {
    return (
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
        <div className="grid min-h-[40vh] place-items-center text-sm text-muted-foreground">Loading briefing…</div>
      </main>
    );
  }

  const safety = SAFETY_INSTRUCTIONS[state.equipment];

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
      <div className="mb-6"><ProgressSteps current="prepare" /></div>
      <div className="mb-6">
        <div className="text-[10px] font-mono uppercase tracking-widest text-primary">Step 02 · Pre-deployment briefing</div>
        <h1 className="mt-1.5 text-2xl sm:text-3xl font-semibold tracking-tight">Prepare for deployment</h1>
        <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
          Review the safety checklist and grant media permissions. The workspace will auto-launch when the countdown reaches zero.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <div className="panel-surface p-5">
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Job parameters</div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {[
                { label: "Equipment", value: EQUIPMENT_LABEL[state.equipment] },
                { label: "Severity", value: SEVERITY_LABEL[state.severity], tone: state.severity === "critical" ? "destructive" : "default" },
                { label: "Technician", value: "M. Reyes · TECH-4471" },
                { label: "Session ID", value: `FL-${Date.now().toString().slice(-6)}`, mono: true },
              ].map(({ label, value, tone, mono }) => (
                <div key={label} className="rounded-md border border-border bg-background/40 px-3 py-2.5">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{label}</div>
                  <div className={`mt-1 text-sm font-semibold ${mono ? "font-mono" : ""} ${tone === "destructive" ? "text-destructive" : "text-foreground"}`}>{value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="panel-surface p-5">
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5" /> Safety instructions
            </div>
            <h3 className="mt-1 text-base font-semibold">Before you touch the asset</h3>
            <ol className="mt-4 space-y-3">
              {safety.map((item, idx) => (
                <li key={idx} className="flex gap-3">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/15 font-mono text-[11px] font-semibold text-primary">{idx + 1}</span>
                  <span className="text-sm leading-relaxed text-foreground">{item}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="panel-surface p-5">
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              <Camera className="h-3.5 w-3.5" /> Media permissions
            </div>
            <h3 className="mt-1 text-base font-semibold">Grant camera & microphone access</h3>
            <p className="mt-1 text-xs text-muted-foreground">The Remote Expert AI needs a live A/V channel to guide the repair.</p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button type="button" onClick={requestMedia}
                disabled={mediaStatus === "granting" || mediaStatus === "granted"}
                className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60">
                <Camera className="h-4 w-4" />
                {mediaStatus === "granted" ? "Permissions granted" : mediaStatus === "granting" ? "Requesting…" : "Grant Media Permissions"}
              </button>
              {mediaStatus === "granted" && (
                <span className="inline-flex items-center gap-1.5 rounded-md bg-success/15 px-2.5 py-1 text-xs font-semibold text-success">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Camera & mic ready
                </span>
              )}
            </div>
            {mediaStatus === "denied" && (
              <div className="mt-4 flex items-start gap-3 rounded-md border border-destructive/40 bg-destructive/10 p-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                <div className="flex-1 text-xs">
                  <div className="font-semibold text-destructive">Camera access failed</div>
                  <div className="mt-0.5 text-destructive/90">{mediaError}</div>
                  <div className="mt-1 text-muted-foreground">Enable permissions in your browser settings, then retry. You can still proceed in text-only mode.</div>
                  <button type="button" onClick={requestMedia}
                    className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-destructive/50 bg-destructive/10 px-2.5 py-1 text-xs font-semibold text-destructive hover:bg-destructive/20">
                    Retry
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <aside className="panel-surface p-5 flex flex-col items-center gap-4 h-fit sticky top-20">
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Auto-launch in</div>
          <TimerRing seconds={remaining} total={30} label="Seconds" tone={remaining <= 10 ? "destructive" : "primary"} />
          <p className="text-center text-xs text-muted-foreground">Workspace opens automatically when countdown ends.</p>
          <button type="button" onClick={proceed} disabled={advancing}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60">
            Acknowledge & Proceed <ArrowRight className="h-4 w-4" />
          </button>
        </aside>
      </div>
    </main>
  );
}
