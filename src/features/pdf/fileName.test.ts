import { describe, expect, it } from 'vitest'
import { quotationFileName } from './fileName'

describe('quotationFileName', () => {
  it('builds a safe pdf file name', () => {
    expect(quotationFileName('QTN/2026-27/0001', 'Acme Traders')).toBe(
      'Quotation-QTN-2026-27-0001-Acme-Traders.pdf',
    )
  })

  it('handles empty values', () => {
    expect(quotationFileName('', '')).toBe('Quotation.pdf')
  })
})
