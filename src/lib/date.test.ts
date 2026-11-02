import { describe, expect, it } from 'vitest'
import { getFinancialYear, todayISO } from './date'

describe('getFinancialYear', () => {
  it('starts a new financial year in April', () => {
    expect(getFinancialYear('2026-04-01')).toBe('2026-27')
  })

  it('keeps January to March in the previous financial year', () => {
    expect(getFinancialYear('2026-03-31')).toBe('2025-26')
  })

  it('handles the century rollover', () => {
    expect(getFinancialYear('2099-04-01')).toBe('2099-00')
  })

  it('rejects invalid dates', () => {
    expect(() => getFinancialYear('2026-13-01')).toThrow('Invalid date')
  })
})

describe('todayISO', () => {
  it('returns a local YYYY-MM-DD date', () => {
    expect(todayISO()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})
