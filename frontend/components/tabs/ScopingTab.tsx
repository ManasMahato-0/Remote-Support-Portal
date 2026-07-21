"use client";
import { useEffect, useRef } from "react";
import { WebcamPreview } from "@/components/WebcamPreview";
import { ChatPanel } from "@/components/ChatPanel";
import { useExpertConnection } from "@/hooks/useExpertConnection";
import type { JobState } from "@/lib/jobState";
import { scopingOpening, SCOPING_EXPERT_REPLIES, SCOPING_USER_SCRIPT, uid } from "@/hooks/useMockExpertConnection";

export default function ScopingTab({ state, update }: {
  state: JobState;
  update: (patch: Partial<JobState> | ((s: JobState) => JobState)) => void;
}) {
  const opened = useRef(false);

  const fallbackReply = () => {
    const reply = SCOPING_EXPERT_REPLIES[state.scopingScriptIndex] ?? SCOPING_EXPERT_REPLIES[SCOPING_EXPERT_REPLIES.length - 1];
    update((s) => ({ ...s, scopingScriptIndex: Math.min(s.scopingScriptIndex + 1, SCOPING_EXPERT_REPLIES.length) }));
    return reply;
  };

  const { typing, connected, openWith, sendUserTurn } = useExpertConnection({
    phase: "scoping",
    equipment: state.equipment,
    severity: state.severity,
    onExpertMessage: (m) => update((s) => ({ ...s, chats: { ...s.chats, scoping: [...s.chats.scoping, m] } })),
    fallbackReply,
  });

  useEffect(() => {
    if (opened.current) return;
    opened.current = true;
    if (state.chats.scoping.length === 0 && state.equipment && state.severity)
      openWith(scopingOpening(state.equipment, state.severity));
  }, []);

  const sendUser = (text: string) => {
    update((s) => ({ ...s, chats: { ...s.chats, scoping: [...s.chats.scoping, { id: uid(), role: "tech" as const, text, ts: Date.now() }] } }));
    sendUserTurn(text);
  };

  const simulate = () => {
    const idx = state.chats.scoping.filter((m) => m.role === "tech").length;
    sendUser(SCOPING_USER_SCRIPT[idx] ?? SCOPING_USER_SCRIPT[SCOPING_USER_SCRIPT.length - 1]);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr] min-h-[560px]">
      <div className="flex flex-col gap-3">
        <WebcamPreview label="Assessment cam" audio />
        <div className="panel-surface p-4">
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Field notes</div>
          <textarea
            placeholder="Log observations, error codes, environmental conditions…"
            className="mt-2 min-h-[120px] w-full resize-none rounded-md border border-input bg-background/40 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
        </div>
      </div>
      <ChatPanel
        title="Remote Expert · Scoping"
        subtitle={connected ? "Live channel · connected" : "Diagnostic channel · mock"}
        messages={state.chats.scoping} typing={typing}
        onSend={sendUser} onSimulate={simulate} simulateDisabled={typing}
      />
    </div>
  );
}
