export function getFinancialYear(isoDate: string): string {
  const year = Number(isoDate.slice(0, 4))
  const month = Number(isoDate.slice(5, 7))

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    month < 1 ||
    month > 12
  ) {
    throw new Error(`Invalid date: ${isoDate}`)
  }

  const startYear = month >= 4 ? year : year - 1
  const endYear = String((startYear + 1) % 100).padStart(2, '0')

  return `${startYear}-${endYear}`
}

export function todayISO(): string {
  const now = new Date()
  const localTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)

  return localTime.toISOString().slice(0, 10)
}
