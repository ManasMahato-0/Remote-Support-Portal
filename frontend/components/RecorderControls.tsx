"use client";
import { useEffect, useRef, useState } from "react";
import { Circle, Play, Square } from "lucide-react";

type Status = "idle" | "recording" | "stopped";

export function RecorderControls({ stream, onRecorded }: {
  stream: MediaStream | null;
  onRecorded?: () => void;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [seconds, setSeconds] = useState(0);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [upload, setUpload] = useState<"idle" | "uploading" | "done" | "failed">("idle");
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const blobRef = useRef<Blob | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";

  const uploadBlob = async () => {
    if (!blobRef.current) return;
    setUpload("uploading");
    try {
      const fd = new FormData();
      fd.append("video", blobRef.current, "repair.webm");
      const res = await fetch(`${BACKEND}/api/recordings`, { method: "POST", body: fd });
      setUpload(res.ok ? "done" : "failed");
    } catch {
      setUpload("failed");
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (blobUrl) URL.revokeObjectURL(blobUrl);
      recorderRef.current?.stop();
    };
  }, []);

  const start = () => {
    if (!stream) return;
    try {
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mr.mimeType || "video/webm" });
        blobRef.current = blob;
        setBlobUrl(URL.createObjectURL(blob));
        setStatus("stopped");
        setUpload("idle");
        onRecorded?.();
      };
      recorderRef.current = mr;
      mr.start();
      setStatus("recording");
      setSeconds(0);
      intervalRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch (err) { console.error(err); }
  };

  const stop = () => {
    recorderRef.current?.stop();
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const reset = () => {
    if (blobUrl) URL.revokeObjectURL(blobUrl);
    setBlobUrl(null);
    setSeconds(0);
    setStatus("idle");
  };

  const time = `${Math.floor(seconds / 60).toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between rounded-md border border-border bg-card/60 px-4 py-3">
        <div className="flex items-center gap-3">
          <span
            className={`h-2.5 w-2.5 rounded-full ${status === "recording" ? "bg-destructive" : status === "stopped" ? "bg-success" : "bg-muted-foreground"}`}
            style={status === "recording" ? { animation: "pulse-dot 1s infinite" } : undefined}
          />
          <div className="leading-tight">
            <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Recorder</div>
            <div className="text-sm font-semibold">
              {status === "recording" ? "Recording in progress" : status === "stopped" ? "Capture complete" : "Ready to capture"}
            </div>
          </div>
        </div>
        <div className="font-mono text-lg tabular-nums">{time}</div>
      </div>

      <div className="flex flex-wrap gap-2">
        {status !== "recording" ? (
          <button type="button" onClick={start} disabled={!stream}
            className="inline-flex items-center gap-2 rounded-md bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground transition hover:bg-destructive/90 disabled:cursor-not-allowed disabled:opacity-50">
            <Circle className="h-4 w-4 fill-current" /> Start Recording
          </button>
        ) : (
          <button type="button" onClick={stop}
            className="inline-flex items-center gap-2 rounded-md bg-secondary px-4 py-2 text-sm font-semibold text-secondary-foreground transition hover:bg-secondary/80">
            <Square className="h-4 w-4 fill-current" /> Stop
          </button>
        )}
        {status === "stopped" && (
          <button type="button" onClick={reset}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-transparent px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted">
            Re-record
          </button>
        )}
      </div>

      {blobUrl && (
        <div className="rounded-md border border-border bg-black overflow-hidden">
          <div className="flex items-center gap-2 border-b border-border bg-card/60 px-3 py-2 text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
            <Play className="h-3.5 w-3.5" /> Playback · verify before proceeding
          </div>
          <video src={blobUrl} controls className="w-full aspect-video" />
          <div className="flex items-center gap-3 border-t border-border bg-card/60 px-3 py-2">
            <button type="button" onClick={uploadBlob} disabled={upload === "uploading" || upload === "done"}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50">
              {upload === "uploading" ? "Uploading…" : upload === "done" ? "Uploaded ✓" : "Submit to dispatch"}
            </button>
            {upload === "failed" && <span className="text-xs text-destructive">Upload failed — backend offline?</span>}
          </div>
        </div>
      )}

      <div className="rounded-md border border-dashed border-border bg-background/30 p-3">
        <div className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">Auto-transcription</div>
        <div className="mt-1 text-xs text-muted-foreground leading-relaxed">
          {status === "stopped"
            ? "Transcription queued. The Remote Expert AI will parse this capture on server sync."
            : "Recording will be transcribed automatically once you stop capture."}
        </div>
      </div>
    </div>
  );
}
