import type { LineItem, Quotation } from '../../types'
import { db, ensureDefaultProfile } from '../../lib/db'
import { getFinancialYear, todayISO } from '../../lib/date'
import { quotationInputSchema, type QuotationInput } from '../../lib/validation'

function newId(): string {
  return crypto.randomUUID()
}

function toLineItems(items: QuotationInput['items']): LineItem[] {
  return items.map((item) => ({
    id: item.id ?? newId(),
    name: item.name.trim(),
    qty: item.qty,
    unit: item.unit,
    price: item.price,
    gstRate: item.gstRate,
  }))
}

export async function nextQuotationNumber(
  date: string,
  prefix?: string,
): Promise<string> {
  const resolvedPrefix =
    (prefix ?? (await ensureDefaultProfile()).quotePrefix).trim() || 'QTN'
  const base = `${resolvedPrefix}/${getFinancialYear(date)}/`
  const existing = await db.quotations
    .where('number')
    .startsWith(base)
    .toArray()

  const highest = existing.reduce((max, quotation) => {
    const sequence = Number.parseInt(quotation.number.slice(base.length), 10)
    return Number.isFinite(sequence) ? Math.max(max, sequence) : max
  }, 0)

  return `${base}${String(highest + 1).padStart(4, '0')}`
}

export async function listQuotations(): Promise<Quotation[]> {
  return db.quotations.orderBy('updatedAt').reverse().toArray()
}

export async function getQuotation(id: string): Promise<Quotation | undefined> {
  return db.quotations.get(id)
}

export async function createQuotation(
  input: QuotationInput,
): Promise<Quotation> {
  const data = quotationInputSchema.parse(input)

  return db.transaction('rw', db.quotations, db.settings, async () => {
    const now = new Date().toISOString()
    const quotation: Quotation = {
      id: newId(),
      number: await nextQuotationNumber(data.date),
      date: data.date,
      customerName: data.customerName,
      items: toLineItems(data.items),
      createdAt: now,
      updatedAt: now,
    }

    await db.quotations.add(quotation)
    return quotation
  })
}

export async function updateQuotation(
  id: string,
  input: QuotationInput,
): Promise<Quotation> {
  const data = quotationInputSchema.parse(input)

  return db.transaction('rw', db.quotations, async () => {
    const existing = await db.quotations.get(id)

    if (!existing) {
      throw new Error('Quotation not found')
    }

    const updated: Quotation = {
      ...existing,
      customerName: data.customerName,
      date: data.date,
      items: toLineItems(data.items),
      updatedAt: new Date().toISOString(),
    }

    await db.quotations.put(updated)
    return updated
  })
}

export async function deleteQuotation(id: string): Promise<void> {
  await db.quotations.delete(id)
}

export async function duplicateQuotation(id: string): Promise<Quotation> {
  return db.transaction('rw', db.quotations, db.settings, async () => {
    const original = await db.quotations.get(id)

    if (!original) {
      throw new Error('Quotation not found')
    }

    const now = new Date().toISOString()
    const date = todayISO()
    const clone: Quotation = {
      ...original,
      id: newId(),
      number: await nextQuotationNumber(date),
      date,
      items: original.items.map((item) => ({ ...item, id: newId() })),
      createdAt: now,
      updatedAt: now,
    }

    await db.quotations.add(clone)
    return clone
  })
}
