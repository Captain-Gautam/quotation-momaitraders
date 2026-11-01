import type { CompanyProfile } from '../types'

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
}
