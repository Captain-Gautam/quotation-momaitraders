const ONES = [
  '',
  'One',
  'Two',
  'Three',
  'Four',
  'Five',
  'Six',
  'Seven',
  'Eight',
  'Nine',
  'Ten',
  'Eleven',
  'Twelve',
  'Thirteen',
  'Fourteen',
  'Fifteen',
  'Sixteen',
  'Seventeen',
  'Eighteen',
  'Nineteen',
]

const TENS = [
  '',
  '',
  'Twenty',
  'Thirty',
  'Forty',
  'Fifty',
  'Sixty',
  'Seventy',
  'Eighty',
  'Ninety',
]

function twoDigits(value: number): string {
  if (value < 20) {
    return ONES[value] ?? ''
  }

  const tens = Math.floor(value / 10)
  const ones = value % 10

  return `${TENS[tens] ?? ''}${ones ? ` ${ONES[ones]}` : ''}`
}

function threeDigits(value: number): string {
  const hundreds = Math.floor(value / 100)
  const rest = value % 100
  const parts: string[] = []

  if (hundreds > 0) {
    parts.push(`${ONES[hundreds]} Hundred`)
  }

  if (rest > 0) {
    parts.push(twoDigits(rest))
  }

  return parts.join(' ')
}

export function numberToIndianWords(value: number): string {
  const whole = Math.floor(Math.abs(value))

  if (whole === 0) {
    return 'Zero'
  }

  const crore = Math.floor(whole / 10000000)
  const lakh = Math.floor((whole % 10000000) / 100000)
  const thousand = Math.floor((whole % 100000) / 1000)
  const rest = whole % 1000
  const parts: string[] = []

  if (crore > 0) {
    parts.push(`${numberToIndianWords(crore)} Crore`)
  }

  if (lakh > 0) {
    parts.push(`${twoDigits(lakh)} Lakh`)
  }

  if (thousand > 0) {
    parts.push(`${twoDigits(thousand)} Thousand`)
  }

  if (rest > 0) {
    parts.push(threeDigits(rest))
  }

  return parts.join(' ')
}

export function amountInWords(amount: number): string {
  const safe = Number.isFinite(amount) ? amount : 0
  const rounded = Math.round(Math.abs(safe) * 100)
  const rupees = Math.floor(rounded / 100)
  const paise = rounded % 100
  const isNegative = safe < 0

  if (rupees === 0 && paise === 0) {
    return 'Zero Rupees Only'
  }

  const parts: string[] = [
    `${isNegative ? 'Minus ' : ''}Rupees ${numberToIndianWords(rupees)}`,
  ]

  if (paise > 0) {
    parts.push(`and ${twoDigits(paise)} Paise`)
  }

  return `${parts.join(' ')} Only`
}
