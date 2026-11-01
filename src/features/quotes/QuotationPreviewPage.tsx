import { useState } from 'react'
import { PDFViewer } from '@react-pdf/renderer'
import { Copy, FileQuestion, Pencil, Trash2 } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Button from '../../components/ui/Button'
import { buttonStyles } from '../../components/ui/buttonStyles'
import EmptyState from '../../components/ui/EmptyState'
import PageHeader from '../../components/ui/PageHeader'
import PageLoader from '../../components/ui/PageLoader'
import { calculateQuotationTotals } from '../../lib/calc'
import { getErrorMessage } from '../../lib/errors'
import { formatDate, formatINR } from '../../lib/format'
import { deleteQuotation, duplicateQuotation } from '../quotes/repository'
import { useQuotation } from '../quotes/useQuotation'
import { useCompanyProfile } from '../settings/useCompanyProfile'
import PdfActions from '../pdf/PdfActions'
import QuoteDocument from '../pdf/QuoteDocument'

export default function QuotationPreviewPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const quotation = useQuotation(id)
  const profile = useCompanyProfile()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (quotation === undefined || !profile) {
    return <PageLoader />
  }

  if (quotation === null) {
    return (
      <EmptyState
        icon={<FileQuestion className="size-5" />}
        title="Quotation not found"
        description="This quotation may have been deleted or the link is invalid."
        action={
          <Link to="/" className={buttonStyles('primary', 'md')}>
            Back to quotations
          </Link>
        }
      />
    )
  }

  const totals = calculateQuotationTotals(quotation.items)

  async function handleDuplicate() {
    if (!quotation) {
      return
    }

    setBusy(true)
    setError(null)

    try {
      const clone = await duplicateQuotation(quotation.id)
      navigate(`/quotes/${clone.id}`)
    } catch (caught) {
      setError(getErrorMessage(caught, 'Could not duplicate the quotation.'))
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete() {
    if (!quotation) {
      return
    }

    if (
      !window.confirm(
        `Delete quotation ${quotation.number}? This cannot be undone.`,
      )
    ) {
      return
    }

    setBusy(true)
    setError(null)

    try {
      await deleteQuotation(quotation.id)
      navigate('/')
    } catch (caught) {
      setError(getErrorMessage(caught, 'Could not delete the quotation.'))
      setBusy(false)
    }
  }

  return (
    <div>
      <PageHeader
        title={quotation.customerName}
        subtitle={quotation.number}
        backTo="/"
        action={
          <Link
            to={`/quotes/${quotation.id}/edit`}
            className={buttonStyles('secondary', 'sm')}
          >
            <Pencil className="size-3.5" />
            Edit
          </Link>
        }
      />

      <section className="card mb-4">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Date
            </p>
            <p className="mt-1 text-sm font-medium text-slate-900">
              {formatDate(quotation.date)}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Items
            </p>
            <p className="mt-1 text-sm font-medium text-slate-900">
              {quotation.items.length}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Total
            </p>
            <p className="mt-1 text-sm font-semibold text-teal-700">
              {formatINR(totals.grandTotal)}
            </p>
          </div>
        </div>
      </section>

      <section className="card mb-4 space-y-3">
        <PdfActions profile={profile} quotation={quotation} />

        <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-3">
          <Button
            variant="secondary"
            size="sm"
            disabled={busy}
            onClick={() => void handleDuplicate()}
          >
            <Copy className="size-3.5" />
            Duplicate
          </Button>
          <Button
            variant="dangerGhost"
            size="sm"
            disabled={busy}
            onClick={() => void handleDelete()}
          >
            <Trash2 className="size-3.5" />
            Delete
          </Button>
        </div>

        {error ? (
          <p
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700"
          >
            {error}
          </p>
        ) : null}
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm">
        <PDFViewer
          className="h-[65vh] min-h-[420px] w-full"
          showToolbar={false}
        >
          <QuoteDocument profile={profile} quotation={quotation} />
        </PDFViewer>
      </section>

      <p className="mt-3 text-center text-xs text-slate-400">
        Preview uses the same template as the downloaded PDF.
      </p>
    </div>
  )
}
