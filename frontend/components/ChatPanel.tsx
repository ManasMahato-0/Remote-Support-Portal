"use client";
import { useEffect, useRef, useState } from "react";
import { Send, Wand2 } from "lucide-react";
import type { ChatMessage } from "@/lib/jobState";
import { ChatBubble, TypingIndicator } from "./ChatBubble";

export function ChatPanel({
  messages,
  typing,
  onSend,
  onSimulate,
  simulateLabel = "Simulate Speech",
  simulateDisabled,
  title = "Remote Expert",
  subtitle = "Live secure channel",
}: {
  messages: ChatMessage[];
  typing: boolean;
  onSend: (text: string) => void;
  onSimulate?: () => void;
  simulateLabel?: string;
  simulateDisabled?: boolean;
  title?: string;
  subtitle?: string;
}) {
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const send = () => {
    const t = draft.trim();
    if (!t) return;
    onSend(t);
    setDraft("");
  };

  return (
    <div className="flex h-full flex-col panel-surface overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="relative grid h-9 w-9 place-items-center rounded-full bg-accent/15 text-accent">
            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-success ring-2 ring-panel"
              style={{ animation: "pulse-dot 2s infinite" }} />
            <span className="text-sm font-semibold">AI</span>
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold">{title}</div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{subtitle}</div>
          </div>
        </div>
        {onSimulate && (
          <button
            type="button"
            onClick={onSimulate}
            disabled={simulateDisabled}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary px-2.5 py-1.5 text-xs font-medium text-secondary-foreground transition hover:bg-secondary/80 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Wand2 className="h-3.5 w-3.5" />
            {simulateLabel}
          </button>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {messages.length === 0 && !typing && (
          <div className="grid h-full place-items-center text-center text-xs text-muted-foreground">
            Waiting for expert to open channel…
          </div>
        )}
        {messages.map((m) => <ChatBubble key={m.id} msg={m} />)}
        {typing && <TypingIndicator />}
      </div>

      <div className="border-t border-border bg-card/50 p-3">
        <div className="flex items-end gap-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            rows={1}
            placeholder="Type an update for the expert…"
            className="min-h-[40px] max-h-32 flex-1 resize-none rounded-md border border-input bg-background/40 px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
          <button
            type="button"
            onClick={send}
            disabled={!draft.trim() || typing}
            className="inline-flex h-10 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
