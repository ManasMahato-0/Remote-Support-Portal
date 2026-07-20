"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ChatMessage, EquipmentType, Severity } from "@/lib/jobState";
import { EQUIPMENT_LABEL, SEVERITY_LABEL } from "@/lib/jobState";

function uid() { return Math.random().toString(36).slice(2, 10); }
function delay() { return 1500 + Math.random() * 1500; }

function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1; u.pitch = 1; u.volume = 0.9;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch { /* ignore */ }
}

export function scopingOpening(eq: EquipmentType, sev: Severity): string {
  return `Field team, this is Remote Expert. I have you on a ${SEVERITY_LABEL[sev]} on the ${EQUIPMENT_LABEL[eq]}. Before you touch anything: can you pan the camera across the unit and describe what you're seeing — any indicator lights, unusual sounds, or physical damage?`;
}

export const SCOPING_EXPERT_REPLIES = [
  "Copy that. Now check the primary status panel — read me the error code or any blinking pattern you can see.",
  "Understood. Let's isolate this. Confirm the last known maintenance date and whether power was cycled recently.",
  "Good scoping. I'm marking this as ready to move to documentation. Advance the workflow when you're set.",
];

export const SCOPING_USER_SCRIPT = [
  "Panning across the front panel now. I see a solid red fault light and I can hear an intermittent clicking from the lower assembly.",
  "Status panel reads error E-217. No other codes cycling.",
  "Last service was six weeks ago. Site tech confirmed no manual power cycle in the last 24 hours.",
];

export const QA_EXPERT_QUESTIONS = [
  "Final check — confirm all fasteners are torqued to spec and the access panel is fully seated.",
  "One more: verify the unit ran a clean 60-second self-test after the repair. What was the outcome?",
];

export const QA_USER_SCRIPT = [
  "All fasteners torqued and access panel seated. Verified with the manifest.",
  "Self-test ran clean for the full 60 seconds. No fault codes returned.",
];

export function useMockExpertConnection(opts: {
  onExpertMessage: (m: ChatMessage) => void;
  speakOut?: boolean;
}) {
  const { onExpertMessage, speakOut = true } = opts;
  const [typing, setTyping] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const t = timers.current;
    return () => { t.forEach(clearTimeout); };
  }, []);

  const sendExpert = useCallback((text: string) => {
    setTyping(true);
    const id = setTimeout(() => {
      setTyping(false);
      const msg: ChatMessage = { id: uid(), role: "expert", text, ts: Date.now() };
      onExpertMessage(msg);
      if (speakOut) speak(text);
    }, delay());
    timers.current.push(id);
  }, [onExpertMessage, speakOut]);

  return { typing, sendExpert };
}

export { uid };
