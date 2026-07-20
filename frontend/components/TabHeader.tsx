import { Check, Lock } from "lucide-react";
import type { TabKey } from "@/lib/jobState";

const TABS: { key: TabKey; label: string; sub: string }[] = [
  { key: "scoping", label: "Initial Assessment", sub: "Scoping" },
  { key: "documentation", label: "Repair Documentation", sub: "Solution" },
  { key: "qa", label: "Quality Assurance", sub: "Q&A" },
];

export function TabHeader({ active, completed, onSelect }: {
  active: TabKey;
  completed: TabKey[];
  onSelect: (k: TabKey) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
      {TABS.map((t, idx) => {
        const isDone = completed.includes(t.key);
        const isActive = active === t.key;
        const isLocked = !isDone && !isActive;
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => !isLocked && onSelect(t.key)}
            aria-current={isActive}
            className={`group relative flex items-center gap-3 rounded-md border px-4 py-3 text-left transition ${
              isActive ? "border-primary bg-primary/10"
                : isDone ? "border-success/50 bg-success/5 hover:bg-success/10"
                : "border-border bg-card/40 cursor-not-allowed opacity-70"
            }`}
          >
            <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-md font-mono text-xs font-semibold ${
              isDone ? "bg-success text-success-foreground"
                : isActive ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}>
              {isDone ? <Check className="h-4 w-4" strokeWidth={3} />
                : isLocked ? <Lock className="h-3.5 w-3.5" />
                : String(idx + 1).padStart(2, "0")}
            </div>
            <div className="min-w-0 leading-tight">
              <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{t.sub}</div>
              <div className={`truncate text-sm font-semibold ${isLocked ? "text-muted-foreground" : "text-foreground"}`}>
                {t.label}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
