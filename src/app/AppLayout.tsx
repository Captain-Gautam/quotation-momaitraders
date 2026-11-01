import { Suspense } from 'react'
import { FileText, Plus, Settings } from 'lucide-react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import PageLoader from '../components/ui/PageLoader'
import PwaStatus from '../features/pwa/PwaStatus'
import { cn } from '../lib/cn'

const NAV_ITEMS = [
  { to: '/', label: 'Quotations', icon: FileText, end: true },
  { to: '/quotes/new', label: 'New quote', icon: Plus, end: false },
  { to: '/settings', label: 'Settings', icon: Settings, end: false },
]

function DesktopLink({
  to,
  label,
  end,
}: {
  to: string
  label: string
  end: boolean
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          'rounded-xl px-3 py-2 text-sm font-medium transition-colors',
          isActive
            ? 'bg-teal-50 text-teal-800'
            : 'text-slate-600 hover:bg-slate-100',
        )
      }
    >
      {label}
    </NavLink>
  )
}

export default function AppLayout() {
  return (
    <div className="min-h-dvh">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-teal-700 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-teal-700 text-white shadow-sm">
              <FileText className="size-5" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-slate-900">
                Quotation App
              </span>
              <span className="block truncate text-xs text-slate-500">
                Letterhead quotations
              </span>
            </span>
          </Link>

          <nav className="ml-auto hidden items-center gap-1 md:flex">
            {NAV_ITEMS.map((item) => (
              <DesktopLink
                key={item.to}
                to={item.to}
                label={item.label}
                end={item.end}
              />
            ))}
          </nav>
        </div>
      </header>

      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto w-full max-w-3xl px-4 py-5 pb-24 md:pb-10"
      >
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>

      <PwaStatus />

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-3">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold transition-colors',
                    isActive ? 'text-teal-700' : 'text-slate-500',
                  )
                }
              >
                <Icon className="size-5" />
                {item.label}
              </NavLink>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
