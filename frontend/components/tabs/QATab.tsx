"use client";
import { useEffect, useRef } from "react";
import { CheckCircle2 } from "lucide-react";
import { ChatPanel } from "@/components/ChatPanel";
import { WebcamPreview } from "@/components/WebcamPreview";
import { useExpertConnection } from "@/hooks/useExpertConnection";
import type { JobState } from "@/lib/jobState";
import { QA_EXPERT_QUESTIONS, QA_USER_SCRIPT, uid } from "@/hooks/useMockExpertConnection";

export default function QATab({ state, update, onFinish }: {
  state: JobState;
  update: (patch: Partial<JobState> | ((s: JobState) => JobState)) => void;
  onFinish: () => void;
}) {
  const opened = useRef(false);

  const fallbackReply = () => {
    const nextQ = QA_EXPERT_QUESTIONS[state.qaScriptIndex];
    if (nextQ) {
      update((s) => ({ ...s, qaScriptIndex: s.qaScriptIndex + 1 }));
      return nextQ;
    }
    return "Quality check confirmed. All parameters within tolerance. You're clear to close the job.";
  };

  const { typing, connected, openWith, sendUserTurn } = useExpertConnection({
    phase: "qa",
    equipment: state.equipment,
    severity: state.severity,
    onExpertMessage: (m) => update((s) => ({ ...s, chats: { ...s.chats, qa: [...s.chats.qa, m] } })),
    fallbackReply,
  });

  useEffect(() => {
    if (opened.current) return;
    opened.current = true;
    if (state.chats.qa.length === 0) {
      openWith(QA_EXPERT_QUESTIONS[0]);
      update((s) => ({ ...s, qaScriptIndex: 1 }));
    }
  }, []);

  const sendUser = (text: string) => {
    update((s) => ({ ...s, chats: { ...s.chats, qa: [...s.chats.qa, { id: uid(), role: "tech" as const, text, ts: Date.now() }] } }));
    sendUserTurn(text);
  };

  const simulate = () => {
    const idx = state.chats.qa.filter((m) => m.role === "tech").length;
    sendUser(QA_USER_SCRIPT[idx] ?? QA_USER_SCRIPT[QA_USER_SCRIPT.length - 1]);
  };

  const canFinish = state.chats.qa.filter((m) => m.role === "tech").length >= QA_EXPERT_QUESTIONS.length && !typing;

  return (
    <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr] min-h-[560px]">
      <div className="flex flex-col gap-3">
        <WebcamPreview label="Verification cam" audio />
        <div className="panel-surface p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Closeout</div>
            <div className="text-sm font-semibold">Confirm quality check and close the job.</div>
          </div>
          <button type="button" onClick={onFinish} disabled={!canFinish}
            className="inline-flex items-center gap-2 rounded-md bg-success px-4 py-2 text-sm font-semibold text-success-foreground transition hover:bg-success/90 disabled:cursor-not-allowed disabled:opacity-50">
            <CheckCircle2 className="h-4 w-4" /> Finish Job
          </button>
        </div>
      </div>
      <ChatPanel
        title="Remote Expert · Q&A"
        subtitle={connected ? "Live channel · connected" : "Verification channel · mock"}
        messages={state.chats.qa} typing={typing}
        onSend={sendUser} onSimulate={simulate} simulateDisabled={typing}
      />
    </div>
  );
}
