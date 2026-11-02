import { describe, expect, it } from 'vitest'
import type { LineItem } from '../types'
import { calculateLineTotals, calculateQuotationTotals } from './calc'

function item(overrides: Partial<LineItem> = {}): LineItem {
  return {
    id: 'item-1',
    name: 'Item',
    qty: 1,
    unit: 'Piece',
    price: 100,
    gstRate: 18,
    ...overrides,
  }
}

describe('calculateLineTotals', () => {
  it('calculates taxable value, GST, and line total', () => {
    expect(calculateLineTotals({ qty: 10, price: 1250, gstRate: 18 })).toEqual({
      taxable: 12500,
      gstAmount: 2250,
      total: 14750,
    })
  })

  it('rounds fractional quantities and prices to paise', () => {
    expect(calculateLineTotals({ qty: 1.5, price: 99.99, gstRate: 12 })).toEqual({
      taxable: 149.99,
      gstAmount: 18,
      total: 167.99,
    })
  })

  it('supports a zero GST rate', () => {
    expect(calculateLineTotals({ qty: 5, price: 100, gstRate: 0 })).toEqual({
      taxable: 500,
      gstAmount: 0,
      total: 500,
    })
  })

  it('avoids floating-point drift on small values', () => {
    expect(calculateLineTotals({ qty: 3, price: 0.1, gstRate: 18 })).toEqual({
      taxable: 0.3,
      gstAmount: 0.05,
      total: 0.35,
    })
  })

  it('treats non-finite inputs as zero', () => {
    expect(
      calculateLineTotals({ qty: Number.NaN, price: 100, gstRate: 18 }),
    ).toEqual({ taxable: 0, gstAmount: 0, total: 0 })
  })
})

describe('calculateQuotationTotals', () => {
  it('returns zeros for an empty quotation', () => {
    expect(calculateQuotationTotals([])).toEqual({
      lines: [],
      subtotal: 0,
      totalGst: 0,
      roundOff: 0,
      grandTotal: 0,
      gstByRate: [],
    })
  })

  it('sums multiple lines and groups GST by rate', () => {
    const totals = calculateQuotationTotals([
      item({ id: 'a', qty: 10, price: 100, gstRate: 18 }),
      item({ id: 'b', qty: 5, price: 200, gstRate: 18 }),
      item({ id: 'c', qty: 2, price: 50, gstRate: 12 }),
    ])

    expect(totals.lines).toHaveLength(3)
    expect(totals.subtotal).toBe(2100)
    expect(totals.totalGst).toBe(372)
    expect(totals.grandTotal).toBe(2472)
    expect(totals.roundOff).toBe(0)
    expect(totals.gstByRate).toEqual([
      { rate: 12, taxable: 100, gstAmount: 12 },
      { rate: 18, taxable: 2000, gstAmount: 360 },
    ])
  })

  it('rounds the grand total down and reports negative round off', () => {
    const totals = calculateQuotationTotals([
      item({ qty: 1, price: 100.4, gstRate: 0 }),
    ])

    expect(totals.subtotal).toBe(100.4)
    expect(totals.grandTotal).toBe(100)
    expect(totals.roundOff).toBe(-0.4)
  })

  it('rounds the grand total up and reports positive round off', () => {
    const totals = calculateQuotationTotals([
      item({ qty: 1, price: 100.5, gstRate: 0 }),
    ])

    expect(totals.grandTotal).toBe(101)
    expect(totals.roundOff).toBe(0.5)
  })

  it('keeps the line totals available alongside the summary', () => {
    const totals = calculateQuotationTotals([
      item({ id: 'line-1', qty: 2, price: 250, gstRate: 18 }),
    ])

    expect(totals.lines[0]).toMatchObject({
      id: 'line-1',
      taxable: 500,
      gstAmount: 90,
      total: 590,
    })
  })
})
