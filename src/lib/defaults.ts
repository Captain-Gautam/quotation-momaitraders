import type { CompanyProfile } from '../types'

export const DEFAULT_TERMS =
  '1. This quotation is valid for 3 days from the date of issue.\n2. Payment must be made in advance.'

export const DEFAULT_PROFILE: CompanyProfile = {
  name: 'Your Company',
  address: 'Company address, City, State, PIN',
  phone: '+91 00000 00000',
  email: 'sales@example.com',
  gstin: '',
  signatureName: '',
  accentColor: '#0f766e',
  defaultGstRate: 18,
  quotePrefix: 'QTN',
  defaultTerms: DEFAULT_TERMS,
}
