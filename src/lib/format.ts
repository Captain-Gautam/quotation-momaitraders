const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const numberFormatter = new Intl.NumberFormat('en-IN', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

export function formatINR(value: number): string {
  return inrFormatter.format(Number.isFinite(value) ? value : 0)
}

const plainAmountFormatter = new Intl.NumberFormat('en-IN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatINRText(value: number): string {
  return `Rs. ${plainAmountFormatter.format(Number.isFinite(value) ? value : 0)}`
}

export function formatNumber(value: number): string {
  return numberFormatter.format(Number.isFinite(value) ? value : 0)
}

export function formatDate(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00`)

  if (Number.isNaN(date.getTime())) {
    return isoDate
  }

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}
