import { Check } from "lucide-react";

export type StepKey = "configure" | "prepare" | "execute";

const STEPS: { key: StepKey; label: string; sub: string }[] = [
  { key: "configure", label: "Configure", sub: "Job parameters" },
  { key: "prepare", label: "Prepare", sub: "Safety briefing" },
  { key: "execute", label: "Execute", sub: "Guided repair" },
];

export function ProgressSteps({ current }: { current: StepKey }) {
  const currentIdx = STEPS.findIndex((s) => s.key === current);
  return (
    <div className="w-full">
      <ol className="flex items-center gap-2 sm:gap-4">
        {STEPS.map((step, idx) => {
          const done = idx < currentIdx;
          const active = idx === currentIdx;
          return (
            <li key={step.key} className="flex flex-1 items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border text-xs font-semibold font-mono transition ${
                  done ? "bg-success text-success-foreground border-success"
                    : active ? "bg-primary text-primary-foreground border-primary"
                    : "bg-transparent text-muted-foreground border-border"
                }`}>
                  {done ? <Check className="h-4 w-4" strokeWidth={3} /> : String(idx + 1).padStart(2, "0")}
                </div>
                <div className="hidden sm:flex flex-col leading-tight min-w-0">
                  <span className={`text-xs font-semibold uppercase tracking-wider ${active ? "text-foreground" : done ? "text-success" : "text-muted-foreground"}`}>
                    {step.label}
                  </span>
                  <span className="text-[10px] text-muted-foreground truncate">{step.sub}</span>
                </div>
              </div>
              {idx < STEPS.length - 1 && (
                <div className={`h-px flex-1 ${idx < currentIdx ? "bg-success" : "bg-border"}`} />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
