import type { LucideIcon } from "lucide-react";
import { Check } from "lucide-react";

export function ConfigCard({
  icon: Icon,
  title,
  description,
  selected,
  onClick,
  tone = "default",
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
  tone?: "default" | "destructive";
}) {
  const toneRing = tone === "destructive" ? "ring-destructive/70" : "ring-primary";
  const toneIcon = tone === "destructive" ? "bg-destructive/15 text-destructive" : "bg-accent/15 text-accent";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`group relative flex w-full items-start gap-4 rounded-lg border p-5 text-left transition-all ${
        selected
          ? `border-transparent ring-2 ${toneRing} bg-card`
          : "border-border bg-card/60 hover:bg-card hover:border-border/80"
      }`}
    >
      <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-md ${toneIcon}`}>
        <Icon className="h-5 w-5" strokeWidth={2} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-[15px] font-semibold text-foreground">{title}</h3>
          {selected && (
            <span className="grid h-5 w-5 place-items-center rounded-full bg-primary text-primary-foreground">
              <Check className="h-3 w-3" strokeWidth={3} />
            </span>
          )}
        </div>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
      </div>
    </button>
  );
}
