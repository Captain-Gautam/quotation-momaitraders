import {
  useRef,
  useState,
  type ChangeEvent,
} from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Download,
  ImagePlus,
  Save,
  Trash2,
  Upload,
} from 'lucide-react'
import { useForm, useWatch } from 'react-hook-form'
import Button from '../../components/ui/Button'
import PageHeader from '../../components/ui/PageHeader'
import PageLoader from '../../components/ui/PageLoader'
import { db, type CompanyProfileRecord } from '../../lib/db'
import { getErrorMessage } from '../../lib/errors'
import { fileToLogoDataUrl } from '../../lib/image'
import {
  companyProfileSchema,
  type CompanyProfileInput,
} from '../../lib/validation'
import InstallAppCard from '../pwa/InstallAppCard'
import {
  createBackup,
  downloadBackup,
  restoreBackup,
} from './backup'
import { useCompanyProfile } from './useCompanyProfile'

function toFormValues(profile: CompanyProfileRecord): CompanyProfileInput {
  return {
    name: profile.name,
    logoDataUrl: profile.logoDataUrl,
    signatureDataUrl: profile.signatureDataUrl,
    signatureName: profile.signatureName,
    address: profile.address,
    phone: profile.phone,
    email: profile.email,
    gstin: profile.gstin,
    accentColor: profile.accentColor,
    defaultGstRate: profile.defaultGstRate,
    quotePrefix: profile.quotePrefix,
    defaultTerms: profile.defaultTerms,
  }
}

export default function SettingsPage() {
  const profile = useCompanyProfile()

  if (!profile) {
    return <PageLoader />
  }

  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Letterhead, defaults, and data"
      />
      <SettingsForm profile={profile} />
    </div>
  )
}

function SettingsForm({ profile }: { profile: CompanyProfileRecord }) {
  const [saving, setSaving] = useState(false)
  const [logoBusy, setLogoBusy] = useState(false)
  const [signatureBusy, setSignatureBusy] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const signatureInputRef = useRef<HTMLInputElement>(null)
  const importInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<CompanyProfileInput>({
    resolver: zodResolver(companyProfileSchema),
    defaultValues: toFormValues(profile),
  })

  const values = useWatch({ control })
  const logoDataUrl = values.logoDataUrl
  const signatureDataUrl = values.signatureDataUrl
  const signatureName = values.signatureName
  const accentColor = values.accentColor || '#0f766e'
  const companyName = values.name
  const address = values.address

  async function onSubmit(values: CompanyProfileInput) {
    setSaving(true)
    setError(null)
    setNotice(null)

    try {
      await db.settings.put({
        id: 'company',
        ...values,
        logoDataUrl: values.logoDataUrl || undefined,
        signatureDataUrl: values.signatureDataUrl || undefined,
        signatureName: values.signatureName?.trim() || undefined,
        defaultTerms: values.defaultTerms?.trim() ?? '',
      })
      reset(values)
      setNotice('Company profile saved. New PDFs will use these details.')
    } catch (caught) {
      setError(getErrorMessage(caught, 'Could not save the company profile.'))
    } finally {
      setSaving(false)
    }
  }

  async function handleLogoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) {
      return
    }

    setLogoBusy(true)
    setError(null)

    try {
      const dataUrl = await fileToLogoDataUrl(file)
      setValue('logoDataUrl', dataUrl, {
        shouldDirty: true,
        shouldValidate: true,
      })
    } catch (caught) {
      setError(getErrorMessage(caught, 'Could not use that image.'))
    } finally {
      setLogoBusy(false)
    }
  }

  function removeLogo() {
    setValue('logoDataUrl', undefined, {
      shouldDirty: true,
      shouldValidate: true,
    })
  }

  async function handleSignatureChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) {
      return
    }

    setSignatureBusy(true)
    setError(null)

    try {
      const dataUrl = await fileToLogoDataUrl(file)
      setValue('signatureDataUrl', dataUrl, {
        shouldDirty: true,
        shouldValidate: true,
      })
    } catch (caught) {
      setError(getErrorMessage(caught, 'Could not use that image.'))
    } finally {
      setSignatureBusy(false)
    }
  }

  function removeSignature() {
    setValue('signatureDataUrl', undefined, {
      shouldDirty: true,
      shouldValidate: true,
    })
  }

  async function handleExport() {
    setExporting(true)
    setError(null)
    setNotice(null)

    try {
      const backup = await createBackup()
      downloadBackup(backup)
      setNotice(
        `Backup exported with ${backup.quotations.length} quotation(s).`,
      )
    } catch (caught) {
      setError(getErrorMessage(caught, 'Could not export the backup.'))
    } finally {
      setExporting(false)
    }
  }

  async function handleImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) {
      return
    }

    if (
      !window.confirm(
        'Restoring a backup replaces every quotation and company setting on this device. Continue?',
      )
    ) {
      return
    }

    setImporting(true)
    setError(null)
    setNotice(null)

    try {
      const parsed: unknown = JSON.parse(await file.text())
      const restored = await restoreBackup(parsed)
      reset(toFormValues(restored.profile))
      setNotice(
        `Backup restored: ${restored.quotations.length} quotation(s) and company settings.`,
      )
    } catch (caught) {
      setError(getErrorMessage(caught, 'Could not restore that backup file.'))
    } finally {
      setImporting(false)
    }
  }

  const busy = saving || exporting || importing

  return (
    <div className="space-y-4">
      {notice ? (
        <p
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800"
        >
          {notice}
        </p>
      ) : null}
      {error ? (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700"
        >
          {error}
        </p>
      ) : null}

      <div className="card">
        <div
          className="h-1.5 rounded-full"
          style={{ backgroundColor: accentColor }}
        />
        <div className="mt-3 flex items-center gap-3">
          {logoDataUrl ? (
            <img
              src={logoDataUrl}
              alt="Company logo preview"
              className="size-12 shrink-0 rounded-xl object-contain"
            />
          ) : (
            <div
              className="flex size-12 shrink-0 items-center justify-center rounded-xl text-lg font-semibold text-white"
              style={{ backgroundColor: accentColor }}
            >
              {(companyName || 'Y').trim().slice(0, 1).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">
              {companyName || 'Your Company'}
            </p>
            <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">
              {address || 'Company address'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <section className="card space-y-4">
          <div>
            <p className="field-label">Company logo</p>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={logoBusy}
                onClick={() => logoInputRef.current?.click()}
              >
                <ImagePlus className="size-3.5" />
                {logoBusy ? 'Processing…' : logoDataUrl ? 'Replace' : 'Upload'}
              </Button>
              {logoDataUrl ? (
                <Button
                  variant="dangerGhost"
                  size="sm"
                  onClick={removeLogo}
                >
                  <Trash2 className="size-3.5" />
                  Remove
                </Button>
              ) : null}
            <input
              ref={logoInputRef}
              type="file"
              accept="image/png,image/jpeg,image/svg+xml,image/webp"
              aria-label="Company logo image"
              className="hidden"
              onChange={(event) => void handleLogoChange(event)}
            />
            </div>
            <p className="mt-2 text-xs text-slate-500">
              PNG, JPG, or SVG. A transparent PNG works best. Images are resized
              to 512px for the letterhead.
            </p>
          </div>

          <div>
            <label htmlFor="companyName" className="field-label">
              Company name
            </label>
            <input
              id="companyName"
              className="field-input"
              placeholder="Your Company Pvt. Ltd."
              {...register('name')}
            />
            {errors.name ? (
              <p className="field-error">{errors.name.message}</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="companyAddress" className="field-label">
              Address
            </label>
            <textarea
              id="companyAddress"
              rows={3}
              className="field-input resize-y"
              placeholder="Street, City, State, PIN"
              {...register('address')}
            />
            {errors.address ? (
              <p className="field-error">{errors.address.message}</p>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="companyPhone" className="field-label">
                Phone
              </label>
              <input
                id="companyPhone"
                className="field-input"
                placeholder="+91 98765 43210"
                {...register('phone')}
              />
              {errors.phone ? (
                <p className="field-error">{errors.phone.message}</p>
              ) : null}
            </div>

            <div>
              <label htmlFor="companyEmail" className="field-label">
                Email
              </label>
              <input
                id="companyEmail"
                type="email"
                className="field-input"
                placeholder="sales@example.com"
                {...register('email')}
              />
              {errors.email ? (
                <p className="field-error">{errors.email.message}</p>
              ) : null}
            </div>
          </div>

          <div>
            <label htmlFor="companyGstin" className="field-label">
              GSTIN
            </label>
            <input
              id="companyGstin"
              className="field-input uppercase"
              placeholder="27ABCDE1234F1Z5"
              {...register('gstin')}
            />
            {errors.gstin ? (
              <p className="field-error">{errors.gstin.message}</p>
            ) : null}
          </div>
        </section>

        <section className="card space-y-4">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Signature
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">
              Printed above the Authorised Signatory line on every PDF. Upload
              a transparent PNG of your signature, or use the typed fallback.
            </p>
          </div>

          <div className="flex min-h-24 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
            {signatureDataUrl ? (
              <img
                src={signatureDataUrl}
                alt="Signature preview"
                className="max-h-20 max-w-[220px] object-contain"
              />
            ) : signatureName?.trim() ? (
              <p className="font-serif text-2xl italic text-slate-900">
                {signatureName.trim()}
              </p>
            ) : (
              <p className="text-xs font-medium text-slate-400">
                No signature image yet
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={signatureBusy}
              onClick={() => signatureInputRef.current?.click()}
            >
              <ImagePlus className="size-3.5" />
              {signatureBusy
                ? 'Processing…'
                : signatureDataUrl
                  ? 'Replace image'
                  : 'Upload image'}
            </Button>
            {signatureDataUrl ? (
              <Button
                variant="dangerGhost"
                size="sm"
                onClick={removeSignature}
              >
                <Trash2 className="size-3.5" />
                Remove image
              </Button>
            ) : null}
            <input
              ref={signatureInputRef}
              type="file"
              accept="image/png,image/jpeg,image/svg+xml,image/webp"
              aria-label="Signature image"
              className="hidden"
              onChange={(event) => void handleSignatureChange(event)}
            />
          </div>

          <div>
            <label htmlFor="signatureName" className="field-label">
              Signatory name (typed fallback)
            </label>
            <input
              id="signatureName"
              className="field-input"
              placeholder="e.g. A. Sharma"
              maxLength={80}
              {...register('signatureName')}
            />
            {errors.signatureName ? (
              <p className="field-error">{errors.signatureName.message}</p>
            ) : null}
            <p className="mt-1 text-xs text-slate-500">
              Used only when no signature image is uploaded.
            </p>
          </div>

          {errors.signatureDataUrl ? (
            <p className="field-error">{errors.signatureDataUrl.message}</p>
          ) : null}
        </section>

        <section className="card space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Quotation defaults
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="quotePrefix" className="field-label">
                Quote prefix
              </label>
              <input
                id="quotePrefix"
                className="field-input uppercase"
                placeholder="QTN"
                {...register('quotePrefix')}
              />
              {errors.quotePrefix ? (
                <p className="field-error">{errors.quotePrefix.message}</p>
              ) : null}
              <p className="mt-1 text-xs text-slate-500">
                Used as QTN/2026-27/0001.
              </p>
            </div>

            <div>
              <label htmlFor="defaultGstRate" className="field-label">
                Default GST (%)
              </label>
              <input
                id="defaultGstRate"
                type="number"
                inputMode="decimal"
                min={0}
                max={100}
                step="0.01"
                className="field-input"
                {...register('defaultGstRate', { valueAsNumber: true })}
              />
              {errors.defaultGstRate ? (
                <p className="field-error">
                  {errors.defaultGstRate.message}
                </p>
              ) : null}
            </div>
          </div>

          <div>
            <label htmlFor="accentColor" className="field-label">
              Letterhead accent colour
            </label>
            <div className="flex items-center gap-3">
              <input
                id="accentColor"
                type="color"
                className="h-10 w-14 cursor-pointer rounded-lg border border-slate-300 bg-white p-1"
                {...register('accentColor')}
              />
              <span className="text-sm font-medium text-slate-600">
                {accentColor}
              </span>
            </div>
            {errors.accentColor ? (
              <p className="field-error">{errors.accentColor.message}</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="defaultTerms" className="field-label">
              Default terms &amp; conditions
            </label>
            <textarea
              id="defaultTerms"
              rows={4}
              className="field-input resize-y"
              placeholder="Enter terms shown on new quotations."
              {...register('defaultTerms')}
            />
            {errors.defaultTerms ? (
              <p className="field-error">{errors.defaultTerms.message}</p>
            ) : null}
            <p className="mt-1 text-xs text-slate-500">
              Pre-filled on new quotations. You can edit them per quotation.
            </p>
          </div>
        </section>

        <Button type="submit" className="w-full" disabled={busy}>
          <Save className="size-4" />
          {saving ? 'Saving…' : 'Save settings'}
        </Button>
      </form>

      <InstallAppCard />

      <section className="card space-y-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Backup & restore
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">
            Quotations live only on this device. Export a JSON backup regularly
            and restore it here if you change phones or clear browser data.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={busy}
            onClick={() => void handleExport()}
          >
            <Download className="size-3.5" />
            {exporting ? 'Exporting…' : 'Export backup'}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            disabled={busy}
            onClick={() => importInputRef.current?.click()}
          >
            <Upload className="size-3.5" />
            {importing ? 'Restoring…' : 'Restore backup'}
          </Button>
          <input
            ref={importInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(event) => void handleImport(event)}
          />
        </div>
      </section>
    </div>
  )
}
