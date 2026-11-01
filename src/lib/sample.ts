import type { CompanyProfile, Quotation } from '../types'
import { DEFAULT_PROFILE } from './defaults'

export const SAMPLE_PROFILE: CompanyProfile = {
  ...DEFAULT_PROFILE,
  name: 'Your Company Pvt. Ltd.',
  address: '123, Industrial Estate, Pune, Maharashtra 411001',
  phone: '+91 98765 43210',
  email: 'sales@yourcompany.in',
  gstin: '27ABCDE1234F1Z5',
  signatureName: 'A. Sharma',
}

const now = new Date().toISOString()

export const SAMPLE_QUOTATION: Quotation = {
  id: 'sample-quotation',
  number: 'QTN/2026-27/0001',
  date: now.slice(0, 10),
  customerName: 'Sample Customer',
  items: [
    {
      id: 'sample-item-1',
      name: 'Premium Widget',
      qty: 10,
      unit: 'Box',
      price: 1250,
      gstRate: 18,
    },
    {
      id: 'sample-item-2',
      name: 'Standard Widget',
      qty: 24,
      unit: 'Piece',
      price: 320,
      gstRate: 12,
    },
    {
      id: 'sample-item-3',
      name: 'Installation Kit',
      qty: 2,
      unit: 'Set',
      price: 4500,
      gstRate: 18,
    },
  ],
  createdAt: now,
  updatedAt: now,
}
