import Link from "next/link";
import { Radio } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground shadow-sm">
            <Radio className="h-4 w-4" strokeWidth={2.5} />
          </span>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold tracking-tight">FieldLink</span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Support Portal</span>
          </div>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link href="/" className="px-2.5 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-[13px]">Jobs</Link>
          <Link href="/prep" className="px-2.5 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-[13px]">Briefing</Link>
          <Link href="/activity" className="px-2.5 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-[13px]">Workspace</Link>
          <div className="mx-3 h-6 w-px bg-border" />
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex flex-col items-end leading-tight">
              <span className="text-xs font-medium">M. Reyes</span>
              <span className="text-[10px] font-mono text-muted-foreground">TECH-4471</span>
            </div>
            <div className="grid h-8 w-8 place-items-center rounded-full bg-accent text-accent-foreground text-xs font-semibold">MR</div>
          </div>
        </nav>
      </div>
    </header>
  );
}
