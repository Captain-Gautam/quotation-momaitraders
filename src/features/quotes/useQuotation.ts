import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../lib/db'
import type { Quotation } from '../../types'

export function useQuotation(
  id: string | undefined,
): Quotation | null | undefined {
  return useLiveQuery(async () => {
    if (!id) {
      return null
    }

    return (await db.quotations.get(id)) ?? null
  }, [id])
}
