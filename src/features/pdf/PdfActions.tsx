import { useState } from 'react'
import { Download, Share2 } from 'lucide-react'
import Button from '../../components/ui/Button'
import { getErrorMessage } from '../../lib/errors'
import type { CompanyProfile, Quotation } from '../../types'
import { quotationFileName } from './fileName'

interface PdfActionsProps {
  profile: CompanyProfile
  quotation: Quotation
}

export default function PdfActions({ profile, quotation }: PdfActionsProps) {
  const [busy, setBusy] = useState<'download' | 'share' | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function buildFile(): Promise<File> {
    const [{ pdf }, { default: QuoteDocument }] = await Promise.all([
      import('@react-pdf/renderer'),
      import('./QuoteDocument'),
    ])

    const blob = await pdf(
      <QuoteDocument profile={profile} quotation={quotation} />,
    ).toBlob()

    return new File(
      [blob],
      quotationFileName(quotation.number, quotation.customerName),
      { type: 'application/pdf' },
    )
  }

  async function handleDownload() {
    setBusy('download')
    setError(null)

    try {
      const file = await buildFile()
      const url = URL.createObjectURL(file)
      const link = document.createElement('a')
      link.href = url
      link.download = file.name
      document.body.appendChild(link)
      link.click()
      link.remove()
      setTimeout(() => URL.revokeObjectURL(url), 0)
    } catch (caught) {
      setError(getErrorMessage(caught, 'Could not create the PDF.'))
    } finally {
      setBusy(null)
    }
  }

  async function handleShare() {
    setBusy('share')
    setError(null)

    try {
      const file = await buildFile()
      const canShareFiles =
        typeof navigator.share === 'function' &&
        (typeof navigator.canShare !== 'function' ||
          navigator.canShare({ files: [file] }))

      if (!canShareFiles) {
        setError(
          'Sharing files is not supported on this device. Download the PDF instead.',
        )
        return
      }

      await navigator.share({
        files: [file],
        title: `Quotation ${quotation.number}`,
        text: `Quotation for ${quotation.customerName}`,
      })
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === 'AbortError') {
        return
      }

      setError(getErrorMessage(caught, 'Could not share the PDF.'))
    } finally {
      setBusy(null)
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => void handleDownload()} disabled={busy !== null}>
          <Download className="size-4" />
          {busy === 'download' ? 'Preparing…' : 'Download PDF'}
        </Button>
        <Button
          variant="secondary"
          onClick={() => void handleShare()}
          disabled={busy !== null}
        >
          <Share2 className="size-4" />
          {busy === 'share' ? 'Preparing…' : 'Share'}
        </Button>
      </div>

      {error ? (
        <p
          role="alert"
          className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800"
        >
          {error}
        </p>
      ) : null}
    </div>
  )
}
