import { useDeferredValue, useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import {
  Copy,
  FileText,
  Pencil,
  Plus,
  Search,
  Trash2,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import { buttonStyles } from '../../components/ui/buttonStyles'
import EmptyState from '../../components/ui/EmptyState'
import PageHeader from '../../components/ui/PageHeader'
import PageLoader from '../../components/ui/PageLoader'
import { calculateQuotationTotals } from '../../lib/calc'
import { getErrorMessage } from '../../lib/errors'
import { formatDate, formatINR } from '../../lib/format'
import {
  deleteQuotation,
  duplicateQuotation,
  listQuotations,
} from './repository'

export default function QuotationsPage() {
  const navigate = useNavigate()
  const quotations = useLiveQuery(() => listQuotations(), [])
  const [search, setSearch] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const deferredSearch = useDeferredValue(search)

  const filtered = useMemo(() => {
    if (!quotations) {
      return undefined
    }

    const query = deferredSearch.trim().toLowerCase()

    if (!query) {
      return quotations
    }

    return quotations.filter(
      (quotation) =>
        quotation.customerName.toLowerCase().includes(query) ||
        quotation.number.toLowerCase().includes(query),
    )
  }, [quotations, deferredSearch])

  const totalValue = useMemo(
    () =>
      (quotations ?? []).reduce(
        (sum, quotation) =>
          sum + calculateQuotationTotals(quotation.items).grandTotal,
        0,
      ),
    [quotations],
  )

  async function handleDuplicate(id: string) {
    setBusyId(id)
    setError(null)

    try {
      const clone = await duplicateQuotation(id)
      navigate(`/quotes/${clone.id}`)
    } catch (caught) {
      setError(getErrorMessage(caught, 'Could not duplicate the quotation.'))
    } finally {
      setBusyId(null)
    }
  }

  async function handleDelete(id: string, label: string) {
    if (!window.confirm(`Delete quotation ${label}? This cannot be undone.`)) {
      return
    }

    setBusyId(id)
    setError(null)

    try {
      await deleteQuotation(id)
    } catch (caught) {
      setError(getErrorMessage(caught, 'Could not delete the quotation.'))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div>
      <PageHeader
        title="Quotations"
        subtitle={
          quotations
            ? `${quotations.length} saved · ${formatINR(totalValue)} total`
            : 'Loading your quotations…'
        }
        action={
          <Link
            to="/quotes/new"
            className={buttonStyles('primary', 'md', 'shadow-sm')}
          >
            <Plus className="size-4" />
            New
          </Link>
        }
      />

      {error ? (
        <p
          role="alert"
          className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700"
        >
          {error}
        </p>
      ) : null}

      {quotations && quotations.length > 0 ? (
        <div className="relative mb-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search customer or quote number"
            aria-label="Search quotations"
            className="field-input pl-9"
          />
        </div>
      ) : null}

      {!filtered ? (
        <PageLoader />
      ) : filtered.length === 0 ? (
        quotations && quotations.length > 0 ? (
          <EmptyState
            icon={<Search className="size-5" />}
            title="No matches"
            description="No quotation matches that customer or quote number."
          />
        ) : (
          <EmptyState
            icon={<FileText className="size-5" />}
            title="No quotations yet"
            description="Create your first quotation. It will be saved on this device and can be downloaded as a letterhead PDF."
            action={
              <Link
                to="/quotes/new"
                className={buttonStyles('primary', 'md', 'shadow-sm')}
              >
                <Plus className="size-4" />
                Create quotation
              </Link>
            }
          />
        )
      ) : (
        <div className="space-y-3">
          {filtered.map((quotation) => {
            const totals = calculateQuotationTotals(quotation.items)
            const isBusy = busyId === quotation.id

            return (
              <article key={quotation.id} className="card">
                <div className="flex items-start justify-between gap-3">
                  <Link
                    to={`/quotes/${quotation.id}`}
                    className="min-w-0 flex-1"
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-teal-700">
                      {quotation.number}
                    </p>
                    <h2 className="mt-1 truncate text-base font-semibold text-slate-900">
                      {quotation.customerName}
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                      {formatDate(quotation.date)} · {quotation.items.length}{' '}
                      {quotation.items.length === 1 ? 'item' : 'items'}
                    </p>
                  </Link>
                  <div className="shrink-0 text-right">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      Total
                    </p>
                    <p className="mt-0.5 text-sm font-semibold text-slate-900">
                      {formatINR(totals.grandTotal)}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-end gap-1 border-t border-slate-100 pt-2">
                  <Link
                    to={`/quotes/${quotation.id}/edit`}
                    className={buttonStyles('ghost', 'sm')}
                  >
                    <Pencil className="size-3.5" />
                    Edit
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isBusy}
                    onClick={() => void handleDuplicate(quotation.id)}
                  >
                    <Copy className="size-3.5" />
                    Duplicate
                  </Button>
                  <Button
                    variant="dangerGhost"
                    size="sm"
                    disabled={isBusy}
                    onClick={() =>
                      void handleDelete(quotation.id, quotation.number)
                    }
                  >
                    <Trash2 className="size-3.5" />
                    Delete
                  </Button>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
