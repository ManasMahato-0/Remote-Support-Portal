"use client";
import { useRouter } from "next/navigation";
import { AirVent, AlertOctagon, Printer, Server, Wrench, ArrowRight } from "lucide-react";
import { ConfigCard } from "@/components/ConfigCard";
import { ProgressSteps } from "@/components/ProgressSteps";
import { useJobState } from "@/hooks/useJobState";
import { markPrepDone } from "@/app/actions";
import type { EquipmentType, Severity } from "@/lib/jobState";
import { initialState } from "@/lib/jobState";

export default function HomePage() {
  const { state, update, hydrated } = useJobState();
  const router = useRouter();
  const ready = !!state.equipment && !!state.severity;

  const start = async () => {
    update({ ...initialState, equipment: state.equipment, severity: state.severity });
    await markPrepDone();
    router.push("/prep");
  };

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
      <div className="mb-6">
        <ProgressSteps current="configure" />
      </div>
      <div className="mb-8">
        <div className="text-[10px] font-mono uppercase tracking-widest text-primary">Step 01 · Mission configuration</div>
        <h1 className="mt-1.5 text-2xl sm:text-3xl font-semibold tracking-tight">Configure your job</h1>
        <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
          Select the asset you're servicing and the severity of the call-out. The Remote Expert AI will prepare a briefing tailored to these parameters.
        </p>
      </div>

      <section className="mb-8">
        <div className="flex items-baseline justify-between border-b border-border pb-2">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-xs text-primary">01</span>
            <h2 className="text-lg font-semibold">Equipment Type</h2>
          </div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Select one</span>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <ConfigCard icon={AirVent} title="HVAC System" description="Rooftop or split units, chillers, and air handlers."
            selected={state.equipment === "hvac"} onClick={() => update({ equipment: "hvac" as EquipmentType })} />
          <ConfigCard icon={Server} title="Server Rack" description="Datacenter racks, PDUs, switches, storage arrays."
            selected={state.equipment === "server_rack"} onClick={() => update({ equipment: "server_rack" as EquipmentType })} />
          <ConfigCard icon={Printer} title="Industrial Printer" description="Wide-format, label, or additive manufacturing lines."
            selected={state.equipment === "printer"} onClick={() => update({ equipment: "printer" as EquipmentType })} />
        </div>
      </section>

      <section>
        <div className="flex items-baseline justify-between border-b border-border pb-2">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-xs text-primary">02</span>
            <h2 className="text-lg font-semibold">Severity Level</h2>
          </div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Select one</span>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <ConfigCard icon={Wrench} title="Routine Maintenance" description="Scheduled service. Standard SOP applies."
            selected={state.severity === "routine"} onClick={() => update({ severity: "routine" as Severity })} />
          <ConfigCard icon={AlertOctagon} title="Critical Fault" description="Asset offline or degraded. Escalated protocol."
            selected={state.severity === "critical"} onClick={() => update({ severity: "critical" as Severity })} tone="destructive" />
        </div>
      </section>

      <div className="mt-10 flex flex-col items-start gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs text-muted-foreground">
          {hydrated && ready ? "Configuration complete. Advance to the pre-deployment briefing." : "Select an equipment type and severity to continue."}
        </div>
        <button type="button" onClick={start} disabled={!ready}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40">
          Start Mission <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </main>
  );
}
