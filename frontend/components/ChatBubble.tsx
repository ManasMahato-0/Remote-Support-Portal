import type { ChatMessage } from "@/lib/jobState";
import { Bot, User } from "lucide-react";

export function ChatBubble({ msg }: { msg: ChatMessage }) {
  const isExpert = msg.role === "expert";
  return (
    <div className={`flex gap-2.5 ${isExpert ? "" : "flex-row-reverse"}`}>
      <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${isExpert ? "bg-accent text-accent-foreground" : "bg-primary text-primary-foreground"}`}>
        {isExpert ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
      </div>
      <div className={`max-w-[85%] ${isExpert ? "" : "items-end"} flex flex-col gap-1`}>
        <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
          <span>{isExpert ? "Remote Expert" : "You"}</span>
          <span>·</span>
          <span>{new Date(msg.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
        </div>
        <div className={`rounded-lg px-3.5 py-2.5 text-sm leading-relaxed ${isExpert ? "bg-muted text-foreground rounded-tl-sm" : "bg-primary text-primary-foreground rounded-tr-sm"}`}>
          {msg.text}
        </div>
      </div>
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div className="flex gap-2.5">
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground">
        <Bot className="h-4 w-4" />
      </div>
      <div className="flex items-center gap-1.5 rounded-lg rounded-tl-sm bg-muted px-4 py-3">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-muted-foreground"
            style={{ animation: "typing-bounce 1.4s infinite", animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}
