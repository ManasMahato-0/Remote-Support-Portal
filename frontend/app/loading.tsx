export default function Loading() {
  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
      <div className="mb-6 space-y-2">
        <div className="h-3 w-32 rounded bg-muted animate-pulse" />
        <div className="h-8 w-64 rounded bg-muted animate-pulse" />
        <div className="h-4 w-96 rounded bg-muted animate-pulse" />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 rounded-lg border border-border bg-card/60 animate-pulse" />
        ))}
      </div>
    </main>
  );
}
