import { z } from 'zod'
import type { Quotation } from '../../types'
import { db, ensureDefaultProfile } from '../../lib/db'
import {
  companyProfileSchema,
  storedQuotationSchema,
} from '../../lib/validation'
import { listQuotations } from '../quotes/repository'

const backupProfileSchema = companyProfileSchema.extend({
  id: z.literal('company'),
})

export const backupSchema = z.object({
  app: z.literal('quotation-app'),
  version: z.literal(1),
  exportedAt: z.string().min(1),
  profile: backupProfileSchema,
  quotations: z.array(storedQuotationSchema),
})

export type BackupFile = z.infer<typeof backupSchema>

export async function createBackup(): Promise<BackupFile> {
  const profile = await ensureDefaultProfile()
  const quotations = await listQuotations()

  return {
    app: 'quotation-app',
    version: 1,
    exportedAt: new Date().toISOString(),
    profile,
    quotations,
  }
}

export function downloadBackup(backup: BackupFile): void {
  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `Quotation-backup-${backup.exportedAt.slice(0, 10)}.json`
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}

export async function restoreBackup(input: unknown): Promise<BackupFile> {
  const backup = backupSchema.parse(input)

  await db.transaction('rw', db.quotations, db.settings, async () => {
    await db.quotations.clear()
    await db.settings.clear()
    await db.settings.put(backup.profile)
    await db.quotations.bulkPut(backup.quotations as Quotation[])
  })

  return backup
}
