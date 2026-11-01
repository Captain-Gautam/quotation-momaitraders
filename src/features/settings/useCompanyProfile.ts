import { useLiveQuery } from 'dexie-react-hooks'
import { db, type CompanyProfileRecord } from '../../lib/db'
import { DEFAULT_PROFILE } from '../../lib/defaults'

export function useCompanyProfile(): CompanyProfileRecord | undefined {
  return useLiveQuery(async () => {
    const stored = await db.settings.get('company')
    return stored ?? { id: 'company', ...DEFAULT_PROFILE }
  }, [])
}
