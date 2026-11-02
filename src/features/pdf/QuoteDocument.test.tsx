import { renderToBuffer } from '@react-pdf/renderer'
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'
import { describe, expect, it } from 'vitest'
import { SAMPLE_PROFILE, SAMPLE_QUOTATION } from '../../lib/sample'
import type { Quotation } from '../../types'
import QuoteDocument from './QuoteDocument'

async function extractPages(buffer: Uint8Array): Promise<string[]> {
  const loadingTask = getDocument({
    data: Uint8Array.from(buffer),
    useSystemFonts: true,
  })
  const pdf = await loadingTask.promise

  const pages: string[] = []

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber)
    const content = await page.getTextContent()
    const text = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ')

    pages.push(text.replace(/\s+/g, ' ').trim())
  }

  await loadingTask.destroy()

  return pages
}

function compact(text: string): string {
  return text.replace(/\s+/g, '').toUpperCase()
}

async function renderPages(quotation: Quotation): Promise<string[]> {
  const buffer = await renderToBuffer(
    <QuoteDocument profile={SAMPLE_PROFILE} quotation={quotation} />,
  )

  expect(buffer.length).toBeGreaterThan(1000)
  expect(buffer.subarray(0, 5).toString('utf8')).toBe('%PDF-')

  return extractPages(buffer)
}

describe('QuoteDocument', () => {
  it('renders the letterhead quotation as a valid PDF', async () => {
    const pages = await renderPages(SAMPLE_QUOTATION)

    expect(pages).toHaveLength(1)

    const text = pages[0] ?? ''

    expect(text).toContain('QTN/2026-27/0001')
    expect(text).toContain('Rs. 1,250.00')
    expect(text).toContain('8471')
    expect(compact(text)).toContain('ITEMHSNQTYUNITRATEGSTAMOUNT')
    expect(compact(text)).toContain('TERMS&CONDITIONS')
    expect(compact(text)).toContain('VALIDFOR3DAYS')
    expect(compact(text)).toContain('PAYMENTMUSTBEMADEINADVANCE')
    expect(compact(text)).toContain('AMOUNTINWORDS')
    expect(text).toContain('A. Sharma')
    expect(text).toContain('Authorised Signatory')
    expect(text).toContain('Page 1 of 1')
    expect(text).not.toContain('₹')

    const noteIndex = text.indexOf('This is a computer-generated quotation')
    expect(noteIndex).toBeGreaterThan(text.indexOf('Authorised Signatory'))
    expect(noteIndex).toBeLessThan(text.indexOf('Page 1 of 1'))
  })

  it('repeats the table header and numbers each page', async () => {
    const quotation: Quotation = {
      ...SAMPLE_QUOTATION,
      items: Array.from({ length: 40 }, (_, index) => ({
        id: `item-${index + 1}`,
        name: `Test item ${index + 1}`,
        qty: 1,
        unit: 'Piece' as const,
        price: 100,
        gstRate: 18,
      })),
    }

    const pages = await renderPages(quotation)

    expect(pages).toHaveLength(2)
    expect(compact(pages[0] ?? '')).toContain('ITEMQTYUNITRATEGSTAMOUNT')
    expect(compact(pages[0] ?? '')).not.toContain('ITEMHSN')
    expect(pages[0]).toContain('Page 1 of 2')
    expect(compact(pages[1] ?? '')).toContain('ITEMQTYUNITRATEGSTAMOUNT')
    expect(pages[1]).toContain('Page 2 of 2')
  })
})
