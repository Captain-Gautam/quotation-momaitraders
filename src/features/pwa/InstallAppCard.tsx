import { CheckCircle2, Download, Smartphone } from 'lucide-react'
import Button from '../../components/ui/Button'
import { useInstallPrompt } from './useInstallPrompt'

export default function InstallAppCard() {
  const { canInstall, installed, promptInstall } = useInstallPrompt()
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)

  return (
    <section className="card space-y-3">
      <div>
        <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
          <Smartphone className="size-4 text-teal-700" />
          Install on this device
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">
          Install the app for a full-screen, offline-ready experience with its
          own home screen icon.
        </p>
      </div>

      {installed ? (
        <p className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800">
          <CheckCircle2 className="size-4" />
          Installed on this device
        </p>
      ) : canInstall ? (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => void promptInstall()}
        >
          <Download className="size-3.5" />
          Install app
        </Button>
      ) : (
        <p className="text-xs leading-relaxed text-slate-500">
          Use your browser menu and choose “Install app” or “Add to Home
          Screen”.
          {isIOS
            ? ' On iPhone or iPad, tap Share, then Add to Home Screen.'
            : ''}
        </p>
      )}
    </section>
  )
}
