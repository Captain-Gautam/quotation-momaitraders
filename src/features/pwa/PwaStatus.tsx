import { useEffect, useSyncExternalStore } from 'react'
import { CheckCircle2, RefreshCw, WifiOff, X } from 'lucide-react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import Button from '../../components/ui/Button'

function subscribeOnline(onChange: () => void) {
  window.addEventListener('online', onChange)
  window.addEventListener('offline', onChange)

  return () => {
    window.removeEventListener('online', onChange)
    window.removeEventListener('offline', onChange)
  }
}

function getOnlineSnapshot() {
  return navigator.onLine
}

function getServerOnlineSnapshot() {
  return true
}

export default function PwaStatus() {
  const online = useSyncExternalStore(
    subscribeOnline,
    getOnlineSnapshot,
    getServerOnlineSnapshot,
  )
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW({ immediate: true })

  useEffect(() => {
    if (!offlineReady) {
      return
    }

    const timeout = window.setTimeout(() => setOfflineReady(false), 6000)

    return () => window.clearTimeout(timeout)
  }, [offlineReady, setOfflineReady])

  if (!online) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="fixed inset-x-0 bottom-20 z-30 mx-auto flex w-[calc(100%-2rem)] max-w-md items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-3 shadow-lg md:bottom-6"
      >
        <WifiOff className="mt-0.5 size-5 shrink-0 text-amber-700" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-amber-900">You are offline</p>
          <p className="mt-0.5 text-xs leading-relaxed text-amber-800">
            Saved quotations still work. New changes are stored on this device
            and sync when you return online.
          </p>
        </div>
      </div>
    )
  }

  if (needRefresh) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="fixed inset-x-0 bottom-20 z-30 mx-auto flex w-[calc(100%-2rem)] max-w-md items-start gap-3 rounded-2xl border border-teal-200 bg-white p-3 shadow-lg md:bottom-6"
      >
        <RefreshCw className="mt-0.5 size-5 shrink-0 text-teal-700" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900">
            Update available
          </p>
          <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
            Reload to use the latest version of the app.
          </p>
          <div className="mt-2">
            <Button
              size="sm"
              onClick={() => void updateServiceWorker(true)}
            >
              Reload
            </Button>
          </div>
        </div>
        <button
          type="button"
          aria-label="Dismiss update"
          onClick={() => setNeedRefresh(false)}
          className="flex size-7 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100"
        >
          <X className="size-4" />
        </button>
      </div>
    )
  }

  if (offlineReady) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="fixed inset-x-0 bottom-20 z-30 mx-auto flex w-[calc(100%-2rem)] max-w-md items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 shadow-lg md:bottom-6"
      >
        <CheckCircle2 className="size-5 shrink-0 text-emerald-700" />
        <p className="min-w-0 flex-1 text-sm font-medium text-emerald-900">
          Ready to work offline
        </p>
        <button
          type="button"
          aria-label="Dismiss offline message"
          onClick={() => setOfflineReady(false)}
          className="flex size-7 shrink-0 items-center justify-center rounded-lg text-emerald-800 transition-colors hover:bg-emerald-100"
        >
          <X className="size-4" />
        </button>
      </div>
    )
  }

  return null
}
