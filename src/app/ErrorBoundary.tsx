import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RotateCw } from 'lucide-react'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  error: Error | null
}

export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled UI error', error, info)
  }

  render() {
    const { error } = this.state

    if (!error) {
      return this.props.children
    }

    return (
      <div className="flex min-h-dvh items-center justify-center bg-slate-100 p-4">
        <div className="card w-full max-w-md text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <AlertTriangle className="size-6" />
          </div>
          <h1 className="mt-4 text-lg font-semibold text-slate-900">
            Something went wrong
          </h1>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">
            The app hit an unexpected error. Your saved quotations are still on
            this device.
          </p>
          <p className="mt-3 break-words rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-500">
            {error.message}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-800"
          >
            <RotateCw className="size-4" />
            Reload app
          </button>
        </div>
      </div>
    )
  }
}
