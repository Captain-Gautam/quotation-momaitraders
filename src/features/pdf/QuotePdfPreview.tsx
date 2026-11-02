import { useState } from 'react'
import { Eye, Loader2, FileText } from 'lucide-react'
import Button from '../../components/ui/Button'
import { getErrorMessage } from '../../lib/errors'
import type { CompanyProfile, Quotation } from '../../types'

interface QuotePdfPreviewProps {
  profile: CompanyProfile
  quotation: Quotation
}

interface PdfModules {
  PDFViewer: (typeof import('@react-pdf/renderer'))['PDFViewer']
  QuoteDocument: (typeof import('./QuoteDocument'))['default']
}

export default function QuotePdfPreview({
  profile,
  quotation,
}: QuotePdfPreviewProps) {
  const [modules, setModules] = useState<PdfModules | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function loadPreview() {
    if (loading || modules) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const [renderer, documentModule] = await Promise.all([
        import('@react-pdf/renderer'),
        import('./QuoteDocument'),
      ])

      setModules({
        PDFViewer: renderer.PDFViewer,
        QuoteDocument: documentModule.default,
      })
    } catch (caught) {
      setError(
        getErrorMessage(caught, 'Could not load the PDF preview.'),
      )
    } finally {
      setLoading(false)
    }
  }

  if (modules) {
    const { PDFViewer, QuoteDocument } = modules

    return (
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm">
        <PDFViewer
          className="h-[65vh] min-h-[420px] w-full"
          showToolbar={false}
        >
          <QuoteDocument profile={profile} quotation={quotation} />
        </PDFViewer>
      </section>
    )
  }

  return (
    <section className="card space-y-3 text-center" aria-live="polite">
      <div className="mx-auto flex size-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
        {loading ? (
          <Loader2 className="size-5 animate-spin" />
        ) : (
          <FileText className="size-5" />
        )}
      </div>
      <div>
        <h2 className="text-base font-semibold text-slate-900">PDF preview</h2>
        <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-slate-600">
          Load the letterhead preview when you need it. This keeps saving and
          opening quotations fast.
        </p>
      </div>
      <Button
        variant="secondary"
        onClick={() => void loadPreview()}
        disabled={loading}
      >
        <Eye className="size-4" />
        {loading ? 'Loading preview…' : 'Preview PDF'}
      </Button>
      {error ? (
        <p role="alert" className="text-sm font-medium text-red-600">
          {error}
        </p>
      ) : null}
    </section>
  )
}
