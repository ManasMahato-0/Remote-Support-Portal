"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, RotateCw, FileText } from "lucide-react";
import { ProgressSteps } from "@/components/ProgressSteps";
import { useJobState } from "@/hooks/useJobState";
import { clearJobState, EQUIPMENT_LABEL, SEVERITY_LABEL } from "@/lib/jobState";

export default function AnalysisPage() {
  const { state, hydrated } = useJobState();
  const router = useRouter();

  const startNew = () => {
    clearJobState();
    router.push("/");
    setTimeout(() => window.location.reload(), 50);
  };

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
      <div className="mb-6"><ProgressSteps current="execute" /></div>
      <div className="mx-auto max-w-3xl">
        <div className="flex flex-col items-center text-center">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-success/15 text-success ring-4 ring-success/10">
            <CheckCircle2 className="h-8 w-8" strokeWidth={2.5} />
          </div>
          <div className="mt-4 text-[10px] font-mono uppercase tracking-widest text-success">Session closed</div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Job Complete</h1>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            All workflow steps completed. Your capture, transcript, and expert transcript have been queued for sync with dispatch.
          </p>
        </div>

        {hydrated && state.equipment && state.severity && (
          <div className="panel-surface mt-8 divide-y divide-border">
            {[
              { label: "Equipment", value: EQUIPMENT_LABEL[state.equipment] },
              { label: "Severity", value: SEVERITY_LABEL[state.severity] },
              { label: "Steps completed", value: `${state.completedTabs.length + (state.finishedAt ? 1 : 0)} of 3` },
              { label: "Scoping exchanges", value: String(state.chats.scoping.length) },
              { label: "Q&A exchanges", value: String(state.chats.qa.length) },
              { label: "Finished", value: state.finishedAt ? new Date(state.finishedAt).toLocaleString() : "Just now" },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between px-5 py-3">
                <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{label}</span>
                <span className="text-sm font-semibold">{value}</span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button type="button" onClick={startNew}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90">
            <RotateCw className="h-4 w-4" /> Start a new job
          </button>
          <button type="button" onClick={() => router.push("/")}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-transparent px-5 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted">
            <FileText className="h-4 w-4" /> Return to dashboard
          </button>
        </div>
      </div>
    </main>
  );
}
