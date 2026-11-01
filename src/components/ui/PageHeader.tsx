import type { ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

interface PageHeaderProps {
  title: string
  subtitle?: string
  backTo?: string
  action?: ReactNode
}

export default function PageHeader({
  title,
  subtitle,
  backTo,
  action,
}: PageHeaderProps) {
  return (
    <div className="mb-4 flex items-start gap-3">
      {backTo ? (
        <Link
          to={backTo}
          aria-label="Go back"
          className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-50"
        >
          <ArrowLeft className="size-4" />
        </Link>
      ) : null}

      <div className="min-w-0 flex-1">
        <h1 className="text-xl font-semibold leading-tight text-slate-900">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>
        ) : null}
      </div>

      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}
