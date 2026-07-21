"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ChatMessage } from "@/lib/jobState";
import { uid } from "./useMockExpertConnection";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:3001";

function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1; u.pitch = 1; u.volume = 0.9;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch { /* ignore */ }
}

/**
 * Real-time expert channel. Connects to the Express WebSocket backend.
 * If the socket is unreachable, transparently falls back to a scripted
 * mock delay so the workflow never blocks.
 */
export function useExpertConnection(opts: {
  phase: "scoping" | "qa";
  equipment: string | null;
  severity: string | null;
  onExpertMessage: (m: ChatMessage) => void;
  fallbackReply: (userText: string) => string;
  speakOut?: boolean;
}) {
  const { phase, equipment, severity, onExpertMessage, fallbackReply, speakOut = true } = opts;
  const [typing, setTyping] = useState(false);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const replyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cbRef = useRef(onExpertMessage);
  cbRef.current = onExpertMessage;

  useEffect(() => {
    let ws: WebSocket | null = null;
    try {
      ws = new WebSocket(WS_URL);
      wsRef.current = ws;
      ws.onopen = () => setConnected(true);
      ws.onclose = () => setConnected(false);
      ws.onerror = () => setConnected(false);
      ws.onmessage = (ev) => {
        try {
          const data = JSON.parse(ev.data);
          if (data.type === "expert_message") {
            if (replyTimeoutRef.current) { clearTimeout(replyTimeoutRef.current); replyTimeoutRef.current = null; }
            setTyping(false);
            const msg: ChatMessage = { id: uid(), role: "expert", text: data.text, ts: data.ts ?? Date.now() };
            cbRef.current(msg);
            if (speakOut) speak(data.text);
          }
        } catch { /* ignore */ }
      };
    } catch { setConnected(false); }

    const localTimers = timers.current;
    return () => {
      localTimers.forEach(clearTimeout);
      if (replyTimeoutRef.current) clearTimeout(replyTimeoutRef.current);
      ws?.close();
    };
  }, [speakOut]);

  const emitExpert = useCallback((text: string) => {
    setTyping(true);
    const id = setTimeout(() => {
      setTyping(false);
      const msg: ChatMessage = { id: uid(), role: "expert", text, ts: Date.now() };
      cbRef.current(msg);
      if (speakOut) speak(text);
    }, 1500 + Math.random() * 1500);
    timers.current.push(id);
  }, [speakOut]);

  // Send the opening expert line (no user turn yet).
  const openWith = useCallback((text: string) => {
    emitExpert(text);
  }, [emitExpert]);

  // Handle a user message: prefer live WS, fall back to scripted reply.
  // If the socket accepts the send but no reply arrives in 12s (backend died
  // mid-flight), clear typing and emit the scripted fallback so the chat
  // never deadlocks.
  const sendUserTurn = useCallback((userText: string) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      setTyping(true);
      ws.send(JSON.stringify({ type: "user_message", phase, text: userText, equipment, severity }));
      if (replyTimeoutRef.current) clearTimeout(replyTimeoutRef.current);
      replyTimeoutRef.current = setTimeout(() => {
        replyTimeoutRef.current = null;
        setTyping(false);
        emitExpert(fallbackReply(userText));
      }, 12_000);
    } else {
      emitExpert(fallbackReply(userText));
    }
  }, [phase, equipment, severity, emitExpert, fallbackReply]);

  return { typing, connected, openWith, sendUserTurn };
}
