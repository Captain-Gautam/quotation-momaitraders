import type { LineItem } from '../types'

export interface LineTotals {
  taxable: number
  gstAmount: number
  total: number
}

export interface CalculatedLine extends LineItem, LineTotals {}

export interface GstRateSummary {
  rate: number
  taxable: number
  gstAmount: number
}

export interface QuotationTotals {
  lines: CalculatedLine[]
  subtotal: number
  totalGst: number
  roundOff: number
  grandTotal: number
  gstByRate: GstRateSummary[]
}

function toPaise(value: number): number {
  return Number.isFinite(value) ? Math.round(value * 100) : 0
}

function fromPaise(paise: number): number {
  return paise / 100
}

export function calculateLineTotals(
  item: Pick<LineItem, 'qty' | 'price' | 'gstRate'>,
): LineTotals {
  const qty = Number.isFinite(item.qty) ? item.qty : 0
  const price = Number.isFinite(item.price) ? item.price : 0
  const gstRate = Number.isFinite(item.gstRate) ? item.gstRate : 0

  const taxablePaise = Math.round(qty * Math.round(price * 100))
  const gstPaise = Math.round((taxablePaise * gstRate) / 100)

  return {
    taxable: fromPaise(taxablePaise),
    gstAmount: fromPaise(gstPaise),
    total: fromPaise(taxablePaise + gstPaise),
  }
}

export function calculateQuotationTotals(items: LineItem[]): QuotationTotals {
  const lines: CalculatedLine[] = items.map((item) => ({
    ...item,
    ...calculateLineTotals(item),
  }))

  let subtotalPaise = 0
  let totalGstPaise = 0
  const groups = new Map<number, { taxablePaise: number; gstPaise: number }>()

  for (const line of lines) {
    const taxablePaise = toPaise(line.taxable)
    const gstPaise = toPaise(line.gstAmount)

    subtotalPaise += taxablePaise
    totalGstPaise += gstPaise

    const group = groups.get(line.gstRate) ?? { taxablePaise: 0, gstPaise: 0 }
    group.taxablePaise += taxablePaise
    group.gstPaise += gstPaise
    groups.set(line.gstRate, group)
  }

  const rawTotalPaise = subtotalPaise + totalGstPaise
  const grandTotalPaise = Math.round(rawTotalPaise / 100) * 100
  const roundOffPaise = grandTotalPaise - rawTotalPaise

  return {
    lines,
    subtotal: fromPaise(subtotalPaise),
    totalGst: fromPaise(totalGstPaise),
    roundOff: fromPaise(roundOffPaise),
    grandTotal: fromPaise(grandTotalPaise),
    gstByRate: [...groups.entries()]
      .sort(([rateA], [rateB]) => rateA - rateB)
      .map(([rate, group]) => ({
        rate,
        taxable: fromPaise(group.taxablePaise),
        gstAmount: fromPaise(group.gstPaise),
      })),
  }
}
