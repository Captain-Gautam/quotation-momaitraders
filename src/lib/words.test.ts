import { describe, expect, it } from 'vitest'
import { amountInWords, numberToIndianWords } from './words'

describe('numberToIndianWords', () => {
  it('handles zero and small numbers', () => {
    expect(numberToIndianWords(0)).toBe('Zero')
    expect(numberToIndianWords(7)).toBe('Seven')
    expect(numberToIndianWords(19)).toBe('Nineteen')
    expect(numberToIndianWords(42)).toBe('Forty Two')
  })

  it('handles hundreds, thousands, and lakhs', () => {
    expect(numberToIndianWords(100)).toBe('One Hundred')
    expect(numberToIndianWords(999)).toBe('Nine Hundred Ninety Nine')
    expect(numberToIndianWords(1234)).toBe(
      'One Thousand Two Hundred Thirty Four',
    )
    expect(numberToIndianWords(123456)).toBe(
      'One Lakh Twenty Three Thousand Four Hundred Fifty Six',
    )
  })

  it('handles crores', () => {
    expect(numberToIndianWords(10000000)).toBe('One Crore')
    expect(numberToIndianWords(12345678)).toBe(
      'One Crore Twenty Three Lakh Forty Five Thousand Six Hundred Seventy Eight',
    )
  })
})

describe('amountInWords', () => {
  it('writes whole rupee amounts', () => {
    expect(amountInWords(0)).toBe('Zero Rupees Only')
    expect(amountInWords(1)).toBe('Rupees One Only')
    expect(amountInWords(10000000)).toBe('Rupees One Crore Only')
  })

  it('includes paise when present', () => {
    expect(amountInWords(1234.5)).toBe(
      'Rupees One Thousand Two Hundred Thirty Four and Fifty Paise Only',
    )
    expect(amountInWords(123456.78)).toBe(
      'Rupees One Lakh Twenty Three Thousand Four Hundred Fifty Six and Seventy Eight Paise Only',
    )
  })

  it('rounds paise and handles invalid input', () => {
    expect(amountInWords(0.999)).toBe('Rupees One Only')
    expect(amountInWords(Number.NaN)).toBe('Zero Rupees Only')
  })
})
