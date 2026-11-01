import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '../../lib/db'
import { DEFAULT_PROFILE } from '../../lib/defaults'
import type { QuotationInput } from '../../lib/validation'
import {
  createQuotation,
  deleteQuotation,
  duplicateQuotation,
  getQuotation,
  listQuotations,
  nextQuotationNumber,
  updateQuotation,
} from './repository'

function input(overrides: Partial<QuotationInput> = {}): QuotationInput {
  return {
    customerName: 'Acme Traders',
    date: '2026-04-01',
    items: [
      {
        name: 'Premium Widget',
        qty: 10,
        unit: 'Box',
        price: 1250,
        gstRate: 18,
      },
    ],
    ...overrides,
  }
}

beforeEach(async () => {
  await db.quotations.clear()
  await db.settings.clear()
})

describe('createQuotation', () => {
  it('creates a quotation with an id, item ids, and a generated number', async () => {
    const quotation = await createQuotation(input())

    expect(quotation.id).toBeTruthy()
    expect(quotation.number).toBe('QTN/2026-27/0001')
    expect(quotation.items[0]?.id).toBeTruthy()
    expect(quotation.createdAt).toBeTruthy()
    expect(await db.quotations.count()).toBe(1)
  })

  it('increments the sequence within the same financial year', async () => {
    const first = await createQuotation(input())
    const second = await createQuotation(input())

    expect(first.number).toBe('QTN/2026-27/0001')
    expect(second.number).toBe('QTN/2026-27/0002')
  })

  it('restarts numbering for a different financial year', async () => {
    await createQuotation(input({ date: '2026-04-01' }))
    const march = await createQuotation(input({ date: '2026-03-31' }))

    expect(march.number).toBe('QTN/2025-26/0001')
  })

  it('uses the prefix from company settings', async () => {
    await db.settings.put({
      id: 'company',
      ...DEFAULT_PROFILE,
      quotePrefix: 'EST',
    })

    const quotation = await createQuotation(input())

    expect(quotation.number).toBe('EST/2026-27/0001')
  })

  it('trims customer and item names', async () => {
    const quotation = await createQuotation(
      input({
        customerName: '  Acme Traders  ',
        items: [
          {
            name: '  Premium Widget  ',
            qty: 1,
            unit: 'Piece',
            price: 100,
            gstRate: 18,
          },
        ],
      }),
    )

    expect(quotation.customerName).toBe('Acme Traders')
    expect(quotation.items[0]?.name).toBe('Premium Widget')
  })

  it('rejects invalid quotations', async () => {
    await expect(createQuotation(input({ customerName: '   ' }))).rejects.toThrow(
      'Customer name is required',
    )
    await expect(createQuotation(input({ items: [] }))).rejects.toThrow(
      'Add at least one item',
    )
    await expect(
      createQuotation(
        input({
          items: [
            {
              name: 'Widget',
              qty: 0,
              unit: 'Piece',
              price: 100,
              gstRate: 18,
            },
          ],
        }),
      ),
    ).rejects.toThrow('Quantity must be greater than zero')
    await expect(createQuotation(input({ date: '2026-02-31' }))).rejects.toThrow(
      'Invalid date',
    )
    expect(await db.quotations.count()).toBe(0)
  })
})

describe('nextQuotationNumber', () => {
  it('accepts an explicit prefix and ignores malformed numbers', async () => {
    const quotation = await createQuotation(input())
    await db.quotations.put({ ...quotation, number: 'EST/2026-27/0007' })
    await db.quotations.put({
      ...quotation,
      id: 'broken',
      number: 'EST/2026-27/not-a-number',
    })

    expect(await nextQuotationNumber('2026-04-01', 'EST')).toBe(
      'EST/2026-27/0008',
    )
  })
})

describe('listQuotations', () => {
  it('returns quotations with the most recently updated first', async () => {
    const first = await createQuotation(input({ customerName: 'First' }))
    await new Promise((resolve) => setTimeout(resolve, 5))
    const second = await createQuotation(input({ customerName: 'Second' }))

    const quotations = await listQuotations()

    expect(quotations.map((quotation) => quotation.customerName)).toEqual([
      second.customerName,
      first.customerName,
    ])
  })
})

describe('getQuotation', () => {
  it('returns saved quotations and undefined for unknown ids', async () => {
    const created = await createQuotation(input())

    expect(await getQuotation(created.id)).toMatchObject({ id: created.id })
    expect(await getQuotation('missing')).toBeUndefined()
  })
})

describe('updateQuotation', () => {
  it('updates the fields while keeping the id and number', async () => {
    const created = await createQuotation(input())
    const updated = await updateQuotation(created.id, {
      customerName: 'New Customer',
      date: '2026-05-15',
      items: [
        {
          id: created.items[0]?.id,
          name: 'Updated Widget',
          qty: 2,
          unit: 'Set',
          price: 500,
          gstRate: 12,
        },
      ],
    })

    expect(updated.id).toBe(created.id)
    expect(updated.number).toBe(created.number)
    expect(updated.customerName).toBe('New Customer')
    expect(updated.items[0]).toMatchObject({
      id: created.items[0]?.id,
      name: 'Updated Widget',
      qty: 2,
      unit: 'Set',
      price: 500,
      gstRate: 12,
    })
  })

  it('throws when the quotation does not exist', async () => {
    await expect(updateQuotation('missing', input())).rejects.toThrow(
      'Quotation not found',
    )
  })
})

describe('duplicateQuotation', () => {
  it('creates a fresh copy with a new id, number, and item ids', async () => {
    const original = await createQuotation(input())
    const clone = await duplicateQuotation(original.id)

    expect(clone.id).not.toBe(original.id)
    expect(clone.number).not.toBe(original.number)
    expect(clone.number).toBe('QTN/2026-27/0002')
    expect(clone.customerName).toBe(original.customerName)
    expect(clone.items[0]?.id).not.toBe(original.items[0]?.id)
    expect(clone.items[0]?.name).toBe(original.items[0]?.name)
    expect(await db.quotations.count()).toBe(2)
  })
})

describe('deleteQuotation', () => {
  it('removes the quotation', async () => {
    const created = await createQuotation(input())

    await deleteQuotation(created.id)

    expect(await getQuotation(created.id)).toBeUndefined()
    expect(await db.quotations.count()).toBe(0)
  })
})
