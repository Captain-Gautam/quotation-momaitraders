import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it } from 'vitest'
import { db, ensureDefaultProfile } from './db'
import { DEFAULT_PROFILE, DEFAULT_TERMS } from './defaults'

beforeEach(async () => {
  await db.settings.clear()
})

describe('ensureDefaultProfile', () => {
  it('adds default terms to a profile saved before terms existed', async () => {
    const legacy = { ...DEFAULT_PROFILE, id: 'company' as const }
    delete legacy.defaultTerms
    await db.settings.put(legacy)

    const profile = await ensureDefaultProfile()

    expect(profile.defaultTerms).toBe(DEFAULT_TERMS)
  })

  it('keeps terms deliberately cleared by the user', async () => {
    await db.settings.put({
      ...DEFAULT_PROFILE,
      id: 'company',
      defaultTerms: '',
    })

    const profile = await ensureDefaultProfile()

    expect(profile.defaultTerms).toBe('')
  })
})
