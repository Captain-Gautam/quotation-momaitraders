export default function PageLoader() {
  return (
    <div className="space-y-4" aria-label="Loading" role="status">
      <div className="h-7 w-40 animate-pulse rounded-lg bg-slate-200" />
      <div className="h-4 w-60 animate-pulse rounded bg-slate-200" />
      <div className="card h-28 animate-pulse bg-slate-200" />
      <div className="card h-28 animate-pulse bg-slate-200" />
    </div>
  )
}
