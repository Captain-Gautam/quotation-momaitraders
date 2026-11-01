import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description: string
  action?: ReactNode
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="card flex flex-col items-center py-10 text-center">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
        {icon}
      </div>
      <h2 className="mt-4 text-base font-semibold text-slate-900">{title}</h2>
      <p className="mt-1 max-w-xs text-sm leading-relaxed text-slate-500">
        {description}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}
