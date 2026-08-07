/** Skeleton / shimmer enquanto a rota do admin carrega. */
export default function AdminLoading() {
  return (
    <div className="animate-pulse space-y-6" aria-busy="true" aria-label="Carregando">
      <div className="space-y-2">
        <div className="h-9 w-48 rounded-xl bg-sand-deep/70" />
        <div className="h-4 w-72 max-w-full rounded-lg bg-sand-deep/50" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="h-36 rounded-2xl border border-line bg-white/80" />
        <div className="h-36 rounded-2xl border border-line bg-white/80" />
        <div className="hidden h-36 rounded-2xl border border-line bg-white/80 lg:block" />
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-white">
        <div className="border-b border-line bg-sand/40 px-4 py-3">
          <div className="h-3 w-40 rounded bg-sand-deep/60" />
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b border-line px-4 py-4 last:border-0"
          >
            <div className="h-4 flex-1 rounded bg-sand-deep/40" />
            <div className="hidden h-4 w-20 rounded bg-sand-deep/30 sm:block" />
            <div className="h-4 w-16 rounded bg-sand-deep/30" />
            <div className="h-4 w-14 rounded bg-sand-deep/30" />
          </div>
        ))}
      </div>
    </div>
  );
}
