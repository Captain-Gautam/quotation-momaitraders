import { useMemo, useState, type Ref } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  ArrowDown,
  ArrowUp,
  FileQuestion,
  Plus,
  Save,
  Trash2,
} from 'lucide-react'
import {
  Controller,
  useFieldArray,
  useForm,
  useWatch,
} from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Button from '../../components/ui/Button'
import { buttonStyles } from '../../components/ui/buttonStyles'
import EmptyState from '../../components/ui/EmptyState'
import PageHeader from '../../components/ui/PageHeader'
import PageLoader from '../../components/ui/PageLoader'
import { calculateQuotationTotals } from '../../lib/calc'
import { todayISO } from '../../lib/date'
import { getErrorMessage } from '../../lib/errors'
import { formatINR } from '../../lib/format'
import { quotationInputSchema, type QuotationInput } from '../../lib/validation'
import { UNITS, type Quotation } from '../../types'
import { useCompanyProfile } from '../settings/useCompanyProfile'
import { createQuotation, updateQuotation } from './repository'
import { useQuotation } from './useQuotation'

const DEFAULT_GST_RATES = [0, 5, 12, 18, 28]

function buildDefaults(
  quotation: Quotation | undefined,
  defaultGstRate: number,
  defaultTerms: string,
): QuotationInput {
  if (quotation) {
    return {
      customerName: quotation.customerName,
      date: quotation.date,
      terms: quotation.terms ?? defaultTerms,
      items: quotation.items.map(
        ({ id, name, hsn, qty, unit, price, gstRate }) => ({
          id,
          name,
          hsn,
          qty,
          unit,
          price,
          gstRate,
        }),
      ),
    }
  }

  return {
    customerName: '',
    date: todayISO(),
    terms: defaultTerms,
    items: [
      {
        name: '',
        hsn: '',
        qty: 1,
        unit: 'Piece',
        price: 0,
        gstRate: defaultGstRate,
      },
    ],
  }
}

interface RateInputProps {
  id: string
  name: string
  value: number
  inputRef: Ref<HTMLInputElement>
  onChange: (value: number) => void
  onBlur: () => void
}

function RateInput({
  id,
  name,
  value,
  inputRef,
  onChange,
  onBlur,
}: RateInputProps) {
  const [text, setText] = useState(() => (value === 0 ? '' : String(value)))

  return (
    <input
      id={id}
      ref={inputRef}
      name={name}
      type="text"
      inputMode="decimal"
      className="field-input"
      placeholder="0.00"
      value={text}
      onChange={(event) => {
        const next = event.target.value
        setText(next)

        if (next.trim() === '') {
          onChange(0)
          return
        }

        const parsed = Number(next)

        if (Number.isFinite(parsed)) {
          onChange(parsed)
        }
      }}
      onBlur={() => {
        onBlur()
        setText(value === 0 ? '' : String(value))
      }}
    />
  )
}

export default function QuotationEditorPage() {
  const { id } = useParams<{ id: string }>()
  const quotation = useQuotation(id)
  const profile = useCompanyProfile()

  if (id && quotation === undefined) {
    return <PageLoader />
  }

  if (id && quotation === null) {
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

  if (!profile) {
    return <PageLoader />
  }

  return (
    <QuotationForm
      key={quotation?.id ?? 'new'}
      quotation={quotation ?? undefined}
      defaultGstRate={profile.defaultGstRate}
      defaultTerms={profile.defaultTerms ?? ''}
    />
  )
}

interface QuotationFormProps {
  quotation?: Quotation
  defaultGstRate: number
  defaultTerms: string
}

function QuotationForm({
  quotation,
  defaultGstRate,
  defaultTerms,
}: QuotationFormProps) {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<QuotationInput>({
    resolver: zodResolver(quotationInputSchema),
    defaultValues: buildDefaults(quotation, defaultGstRate, defaultTerms),
  })

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'items',
  })

  const watchedItems = useWatch({ control, name: 'items' }) ?? []
  const totals = calculateQuotationTotals(
    watchedItems.map((item, index) => ({
      id: item.id ?? `draft-${index}`,
      name: item.name,
      qty: item.qty,
      unit: item.unit,
      price: item.price,
      gstRate: item.gstRate,
    })),
  )

  const gstRates = useMemo(
    () =>
      Array.from(
        new Set([
          ...DEFAULT_GST_RATES,
          defaultGstRate,
          ...(quotation?.items.map((item) => item.gstRate) ?? []),
        ]),
      ).sort((a, b) => a - b),
    [defaultGstRate, quotation],
  )

  const cancelTo = quotation ? `/quotes/${quotation.id}` : '/'

  async function onSubmit(values: QuotationInput) {
    setSaving(true)
    setSubmitError(null)

    try {
      const saved = quotation
        ? await updateQuotation(quotation.id, values)
        : await createQuotation(values)

      navigate(`/quotes/${saved.id}`, {
        replace: true,
        state: { justSaved: true },
      })
    } catch (caught) {
      setSubmitError(
        getErrorMessage(caught, 'Could not save the quotation. Please try again.'),
      )
    } finally {
      setSaving(false)
    }
  }

  function addItem() {
    append({
      name: '',
      hsn: '',
      qty: 1,
      unit: 'Piece',
      price: 0,
      gstRate: defaultGstRate,
    })
  }

  return (
    <div>
      <PageHeader
        title={quotation ? 'Edit quotation' : 'New quotation'}
        subtitle={
          quotation ? quotation.number : 'Number assigned automatically on save'
        }
        backTo={cancelTo}
      />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
        noValidate
      >
        <section className="card space-y-4">
          <div>
            <label htmlFor="customerName" className="field-label">
              Customer name
            </label>
            <input
              id="customerName"
              className="field-input"
              placeholder="e.g. Acme Traders"
              autoComplete="off"
              {...register('customerName')}
            />
            {errors.customerName ? (
              <p className="field-error">{errors.customerName.message}</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="quotationDate" className="field-label">
              Quotation date
            </label>
            <input
              id="quotationDate"
              type="date"
              className="field-input"
              {...register('date')}
            />
            {errors.date ? (
              <p className="field-error">{errors.date.message}</p>
            ) : null}
          </div>
        </section>

        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Items
          </h2>
          <span className="text-xs text-slate-400">
            {fields.length} {fields.length === 1 ? 'line' : 'lines'}
          </span>
        </div>

        <datalist id="gst-rate-options">
          {gstRates.map((rate) => (
            <option key={rate} value={rate}>
              {rate}%
            </option>
          ))}
        </datalist>

        <div className="space-y-3">
          {fields.map((field, index) => (
            <section key={field.id} className="card space-y-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Item {index + 1}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    aria-label="Move item up"
                    disabled={index === 0}
                    onClick={() => move(index, index - 1)}
                    className="flex size-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 disabled:pointer-events-none disabled:opacity-30"
                  >
                    <ArrowUp className="size-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Move item down"
                    disabled={index === fields.length - 1}
                    onClick={() => move(index, index + 1)}
                    className="flex size-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 disabled:pointer-events-none disabled:opacity-30"
                  >
                    <ArrowDown className="size-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Remove item"
                    disabled={fields.length === 1}
                    onClick={() => remove(index)}
                    className="flex size-8 items-center justify-center rounded-lg text-red-600 transition-colors hover:bg-red-50 disabled:pointer-events-none disabled:opacity-30"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor={`item-${index}-name`}
                  className="field-label"
                >
                  Item name
                </label>
                <input
                  id={`item-${index}-name`}
                  className="field-input"
                  placeholder="Product or service"
                  autoComplete="off"
                  {...register(`items.${index}.name`)}
                />
                {errors.items?.[index]?.name ? (
                  <p className="field-error">
                    {errors.items[index]?.name?.message}
                  </p>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor={`item-${index}-hsn`}
                  className="field-label"
                >
                  HSN code (optional)
                </label>
                <input
                  id={`item-${index}-hsn`}
                  className="field-input"
                  placeholder="e.g. 8471"
                  maxLength={20}
                  {...register(`items.${index}.hsn`)}
                />
                {errors.items?.[index]?.hsn ? (
                  <p className="field-error">
                    {errors.items[index]?.hsn?.message}
                  </p>
                ) : null}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor={`item-${index}-qty`}
                    className="field-label"
                  >
                    Quantity
                  </label>
                  <input
                    id={`item-${index}-qty`}
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step="any"
                    className="field-input"
                    {...register(`items.${index}.qty`, {
                      valueAsNumber: true,
                    })}
                  />
                  {errors.items?.[index]?.qty ? (
                    <p className="field-error">
                      {errors.items[index]?.qty?.message}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label
                    htmlFor={`item-${index}-unit`}
                    className="field-label"
                  >
                    Unit
                  </label>
                  <select
                    id={`item-${index}-unit`}
                    className="field-input"
                    {...register(`items.${index}.unit`)}
                  >
                    {UNITS.map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor={`item-${index}-price`}
                    className="field-label"
                  >
                    Rate (₹)
                  </label>
                  <Controller
                    control={control}
                    name={`items.${index}.price`}
                    render={({ field }) => (
                      <RateInput
                        id={`item-${index}-price`}
                        name={field.name}
                        value={field.value}
                        inputRef={field.ref}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                      />
                    )}
                  />
                  {errors.items?.[index]?.price ? (
                    <p className="field-error">
                      {errors.items[index]?.price?.message}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label
                    htmlFor={`item-${index}-gst`}
                    className="field-label"
                  >
                    GST (%)
                  </label>
                  <input
                    id={`item-${index}-gst`}
                    type="number"
                    inputMode="decimal"
                    min={0}
                    max={100}
                    step="0.01"
                    list="gst-rate-options"
                    className="field-input"
                    {...register(`items.${index}.gstRate`, {
                      valueAsNumber: true,
                    })}
                  />
                  {errors.items?.[index]?.gstRate ? (
                    <p className="field-error">
                      {errors.items[index]?.gstRate?.message}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                <span className="text-xs font-medium text-slate-500">
                  Line total
                </span>
                <span className="text-sm font-semibold text-slate-900">
                  {formatINR(totals.lines[index]?.total ?? 0)}
                </span>
              </div>
            </section>
          ))}
        </div>

        <Button variant="secondary" className="w-full" onClick={addItem}>
          <Plus className="size-4" />
          Add item
        </Button>

        {errors.items?.root?.message ? (
          <p className="field-error">{errors.items.root.message}</p>
        ) : null}

        <section className="card space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Taxable value</span>
            <span className="font-medium text-slate-900">
              {formatINR(totals.subtotal)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">GST</span>
            <span className="font-medium text-slate-900">
              {formatINR(totals.totalGst)}
            </span>
          </div>
          {totals.roundOff !== 0 ? (
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Round off</span>
              <span className="font-medium text-slate-900">
                {formatINR(totals.roundOff)}
              </span>
            </div>
          ) : null}
          <div className="flex items-center justify-between border-t border-slate-100 pt-2">
            <span className="text-sm font-semibold text-slate-900">
              Grand total
            </span>
            <span className="text-lg font-semibold text-teal-700">
              {formatINR(totals.grandTotal)}
            </span>
          </div>
        </section>

        <section className="card space-y-2">
          <label htmlFor="terms" className="field-label">
            Terms &amp; conditions
          </label>
          <textarea
            id="terms"
            rows={4}
            className="field-input resize-y"
            placeholder="Enter terms shown on the PDF."
            maxLength={2000}
            {...register('terms')}
          />
          {errors.terms ? (
            <p className="field-error">{errors.terms.message}</p>
          ) : null}
          <p className="text-xs text-slate-500">
            Shown on the PDF. Leave blank to hide this section.
          </p>
        </section>

        {submitError ? (
          <p
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700"
          >
            {submitError}
          </p>
        ) : null}

        <div className="flex gap-2">
          <Link
            to={cancelTo}
            className={buttonStyles('secondary', 'md', 'flex-1')}
          >
            Cancel
          </Link>
          <Button type="submit" className="flex-1" disabled={saving}>
            <Save className="size-4" />
            {saving ? 'Saving…' : 'Save quotation'}
          </Button>
        </div>
      </form>
    </div>
  )
}
