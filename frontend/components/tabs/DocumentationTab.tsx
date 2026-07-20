"use client";
import { useCallback, useState } from "react";
import { WebcamPreview } from "@/components/WebcamPreview";
import { RecorderControls } from "@/components/RecorderControls";

export default function DocumentationTab() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const onStream = useCallback((s: MediaStream | null) => setStream(s), []);

  return (
    <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr] min-h-[560px]">
      <div className="flex flex-col gap-3">
        <WebcamPreview label="Repair capture" audio onStream={onStream} />
        <div className="panel-surface p-4">
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Procedure</div>
          <ol className="mt-2 space-y-2 text-sm text-muted-foreground list-decimal list-inside">
            <li>Frame the affected assembly in the camera view.</li>
            <li>Narrate each step aloud as you execute the repair.</li>
            <li>Stop recording and verify playback before advancing.</li>
          </ol>
        </div>
      </div>
      <div className="panel-surface p-4 flex flex-col gap-4">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Documentation capture</div>
          <h3 className="mt-1 text-base font-semibold">Record the repair</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Audio + video recorded locally with MediaRecorder API. Play back before advancing.
          </p>
        </div>
        <RecorderControls stream={stream} />
      </div>
    </div>
  );
}
