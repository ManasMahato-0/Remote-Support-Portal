"use client";
import { lazy, Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Clock, ArrowRight } from "lucide-react";
import { ProgressSteps } from "@/components/ProgressSteps";
import { TabHeader } from "@/components/TabHeader";
import { formatTime, useDeadlineCountdown } from "@/components/Timer";
import { useJobState } from "@/hooks/useJobState";
import { EQUIPMENT_LABEL, SEVERITY_LABEL, type TabKey } from "@/lib/jobState";
import { saveProgress, finalizeJob } from "@/app/actions";

const ScopingTab = lazy(() => import("@/components/tabs/ScopingTab"));
const DocumentationTab = lazy(() => import("@/components/tabs/DocumentationTab"));
const QATab = lazy(() => import("@/components/tabs/QATab"));

const NEXT_TAB: Record<TabKey, TabKey | null> = {
  scoping: "documentation",
  documentation: "qa",
  qa: null,
};

function TabSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr] min-h-[560px]">
      <div className="rounded-lg border border-border bg-card/60 animate-pulse aspect-video" />
      <div className="rounded-lg border border-border bg-card/60 animate-pulse min-h-[400px]" />
    </div>
  );
}

export default function ActivityPage() {
  const { state, update, hydrated } = useJobState();
  const router = useRouter();

  useEffect(() => {
    if (!hydrated) return;
    if (!state.equipment || !state.severity) { router.replace("/"); return; }
    if (!state.prepDone) router.replace("/prep");
  }, [hydrated, state.equipment, state.severity, state.prepDone, router]);

  const finishJob = async () => {
    update((s) => ({
      ...s,
      completedTabs: Array.from(new Set([...s.completedTabs, "qa" as TabKey])),
      finishedAt: Date.now(),
    }));
    if (state.equipment && state.severity) {
      await finalizeJob({
        equipment: state.equipment,
        severity: state.severity,
        completedTabs: [...state.completedTabs, "qa"],
        finishedAt: Date.now(),
      });
    }
    router.push("/analysis");
  };

  const remaining = useDeadlineCountdown(hydrated ? state.activityDeadline : null, finishJob);

  const completeCurrent = async () => {
    const next = NEXT_TAB[state.activeTab];
    if (!next) { finishJob(); return; }
    const newCompleted = Array.from(new Set([...state.completedTabs, state.activeTab]));
    update((s) => ({ ...s, completedTabs: newCompleted, activeTab: next }));
    await saveProgress({ tab: next, completedTabs: newCompleted, timestamp: Date.now() });
  };

  const setTab = (k: TabKey) => {
    if (state.completedTabs.includes(k) || k === state.activeTab) update({ activeTab: k });
  };

  if (!hydrated || !state.equipment || !state.severity || !state.prepDone) {
    return (
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
        <div className="grid min-h-[40vh] place-items-center text-sm text-muted-foreground">Loading workspace…</div>
      </main>
    );
  }

  const timerTone = remaining <= 60 ? "text-destructive" : remaining <= 180 ? "text-primary" : "text-foreground";

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
      <div className="mb-6"><ProgressSteps current="execute" /></div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-4 panel-surface p-4">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Active job</div>
          <div className="mt-1 text-base font-semibold">
            {EQUIPMENT_LABEL[state.equipment]}
            <span className="mx-2 text-muted-foreground">·</span>
            <span className={state.severity === "critical" ? "text-destructive" : "text-primary"}>
              {SEVERITY_LABEL[state.severity]}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-md border border-border bg-background/40 px-4 py-2">
          <Clock className={`h-4 w-4 ${timerTone}`} />
          <div className="leading-tight">
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Session countdown</div>
            <div className={`font-mono text-xl font-semibold tabular-nums ${timerTone}`}>{formatTime(remaining)}</div>
          </div>
        </div>
      </div>

      <TabHeader active={state.activeTab} completed={state.completedTabs} onSelect={setTab} />

      <div className="mt-6">
        <Suspense fallback={<TabSkeleton />}>
          {state.activeTab === "scoping" && <ScopingTab state={state} update={update} />}
          {state.activeTab === "documentation" && <DocumentationTab />}
          {state.activeTab === "qa" && <QATab state={state} update={update} onFinish={finishJob} />}
        </Suspense>
      </div>

      {state.activeTab !== "qa" && (
        <div className="mt-6 flex justify-end">
          <button type="button" onClick={completeCurrent}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90">
            Completed · Next Tab <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </main>
  );
}
