import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '../../lib/db'
import { DEFAULT_PROFILE } from '../../lib/defaults'
import { createQuotation } from '../quotes/repository'
import { createBackup, restoreBackup } from './backup'

function input(customerName: string) {
  return {
    customerName,
    date: '2026-04-01',
    items: [
      {
        name: 'Premium Widget',
        qty: 10,
        unit: 'Box' as const,
        price: 1250,
        gstRate: 18,
      },
    ],
  }
}

beforeEach(async () => {
  await db.quotations.clear()
  await db.settings.clear()
})

describe('createBackup', () => {
  it('exports the company profile and every quotation', async () => {
    const quotation = await createQuotation(input('Acme Traders'))

    const backup = await createBackup()

    expect(backup.app).toBe('quotation-app')
    expect(backup.version).toBe(1)
    expect(backup.profile.id).toBe('company')
    expect(backup.quotations).toEqual([quotation])
    expect(backup.exportedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/)
  })

  it('preserves the signature image and typed signatory name', async () => {
    await db.settings.put({
      ...DEFAULT_PROFILE,
      id: 'company',
      signatureDataUrl: 'data:image/png;base64,c2lnbmF0dXJl',
      signatureName: 'A. Sharma',
    })

    const backup = await createBackup()

    expect(backup.profile.signatureDataUrl).toBe(
      'data:image/png;base64,c2lnbmF0dXJl',
    )
    expect(backup.profile.signatureName).toBe('A. Sharma')
  })
})

describe('restoreBackup', () => {
  it('replaces existing data with the backup contents', async () => {
    await createQuotation(input('Original Customer'))
    const backup = await createBackup()

    await db.quotations.clear()
    await db.settings.clear()
    await createQuotation(input('Other Customer'))

    const restored = await restoreBackup(
      JSON.parse(JSON.stringify(backup)) as unknown,
    )

    expect(restored.quotations).toHaveLength(1)
    expect(await db.quotations.count()).toBe(1)
    const [quotation] = await db.quotations.toArray()
    expect(quotation?.customerName).toBe('Original Customer')
    expect(await db.settings.get('company')).toMatchObject({ id: 'company' })
  })

  it('rejects malformed backups without touching existing data', async () => {
    await createQuotation(input('Acme Traders'))

    await expect(restoreBackup({ app: 'other-app' })).rejects.toThrow()
    expect(await db.quotations.count()).toBe(1)
  })
})
