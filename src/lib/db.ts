import Dexie, { type EntityTable } from 'dexie'
import type { CompanyProfile, Quotation } from '../types'
import { DEFAULT_PROFILE } from './defaults'

export interface CompanyProfileRecord extends CompanyProfile {
  id: 'company'
}

class QuotationDatabase extends Dexie {
  quotations!: EntityTable<Quotation, 'id'>
  settings!: EntityTable<CompanyProfileRecord, 'id'>

  constructor() {
    super('quotation-app')
    this.version(1).stores({
      quotations: 'id, number, customerName, date, updatedAt',
      settings: 'id',
    })
  }
}

export const db = new QuotationDatabase()

export function withDefaultProfileFields(
  profile: CompanyProfileRecord,
): CompanyProfileRecord {
  if (profile.defaultTerms !== undefined) {
    return profile
  }
  return { ...profile, defaultTerms: DEFAULT_PROFILE.defaultTerms }
}

export async function ensureDefaultProfile(): Promise<CompanyProfileRecord> {
  const existing = await db.settings.get('company')

  if (existing) {
    return withDefaultProfileFields(existing)
  }

  const record: CompanyProfileRecord = { id: 'company', ...DEFAULT_PROFILE }
  await db.settings.put(record)
  return record
}
