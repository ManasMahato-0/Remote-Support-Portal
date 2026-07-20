"use client";
import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Video, VideoOff } from "lucide-react";

export function WebcamPreview({
  active = true,
  audio = true,
  onStream,
  label = "Live feed",
}: {
  active?: boolean;
  audio?: boolean;
  onStream?: (s: MediaStream | null) => void;
  label?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!active) return;
    setError(null);
    setReady(false);
    (async () => {
      try {
        if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia)
          throw new Error("Camera API not available in this browser.");
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio });
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setReady(true);
        onStream?.(stream);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Camera access failed.");
        onStream?.(null);
      }
    })();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      onStream?.(null);
    };
  }, [active, audio, onStream]);

  return (
    <div className="relative overflow-hidden rounded-lg border border-border bg-black aspect-video">
      {!error ? (
        <>
          <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
          <div className="absolute left-3 top-3 flex items-center gap-2 rounded-md bg-black/60 px-2 py-1 text-[10px] font-mono uppercase tracking-widest text-white/90 backdrop-blur">
            <span className={`h-1.5 w-1.5 rounded-full ${ready ? "bg-destructive" : "bg-muted-foreground"}`}
              style={ready ? { animation: "pulse-dot 1.4s infinite" } : undefined} />
            {ready ? "REC · " : ""}{label}
          </div>
          <div className="absolute right-3 top-3 rounded-md bg-black/60 px-2 py-1 text-[10px] font-mono text-white/70 backdrop-blur">
            {ready ? <Video className="h-3.5 w-3.5" /> : <VideoOff className="h-3.5 w-3.5" />}
          </div>
        </>
      ) : (
        <div className="flex h-full items-center justify-center p-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-destructive/15 text-destructive">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="text-sm font-semibold text-foreground">Camera unavailable</div>
            <div className="max-w-xs text-xs text-muted-foreground">{error}</div>
          </div>
        </div>
      )}
    </div>
  );
}
