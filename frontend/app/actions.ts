"use server";
import { cookies } from "next/headers";

export async function markPrepDone() {
  const store = await cookies();
  store.set("rftsp_stage", "prep", { path: "/", httpOnly: true, sameSite: "lax" });
}

export async function markActivityStarted() {
  const store = await cookies();
  store.set("rftsp_stage", "activity", { path: "/", httpOnly: true, sameSite: "lax" });
}

export async function saveProgress(payload: {
  tab: string;
  completedTabs: string[];
  timestamp: number;
}) {
  // In production this would persist to a DB. Here we log server-side
  // and update the stage cookie so middleware can verify progress.
  console.log("[saveProgress]", payload);
  const store = await cookies();
  store.set("rftsp_stage", "activity", { path: "/", httpOnly: true, sameSite: "lax" });
}

export async function finalizeJob(payload: {
  equipment: string;
  severity: string;
  completedTabs: string[];
  finishedAt: number;
}) {
  console.log("[finalizeJob]", payload);
  const store = await cookies();
  store.set("rftsp_stage", "done", { path: "/", httpOnly: true, sameSite: "lax" });
}
