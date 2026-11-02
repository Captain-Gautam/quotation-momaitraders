export const UNITS = ['Box', 'Piece', 'Kg', 'Litre', 'Set', 'Dozen'] as const

export type Unit = (typeof UNITS)[number]

export interface CompanyProfile {
  name: string
  logoDataUrl?: string
  signatureDataUrl?: string
  signatureName?: string
  address: string
  phone: string
  email: string
  gstin: string
  accentColor: string
  defaultGstRate: number
  quotePrefix: string
  defaultTerms?: string
}

export interface LineItem {
  id: string
  name: string
  hsn?: string
  qty: number
  unit: Unit
  price: number
  gstRate: number
}

export interface Quotation {
  id: string
  number: string
  date: string
  customerName: string
  items: LineItem[]
  terms?: string
  createdAt: string
  updatedAt: string
}
