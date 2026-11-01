import { z } from 'zod'
import { UNITS } from '../types'

export const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must use YYYY-MM-DD')
  .refine((value) => {
    const date = new Date(`${value}T00:00:00`)

    if (Number.isNaN(date.getTime())) {
      return false
    }

    const localDate = new Date(
      date.getTime() - date.getTimezoneOffset() * 60000,
    )

    return localDate.toISOString().slice(0, 10) === value
  }, 'Invalid date')

export const lineItemInputSchema = z.object({
  id: z.string().min(1).optional(),
  name: z.string().trim().min(1, 'Item name is required'),
  qty: z.number().positive('Quantity must be greater than zero'),
  unit: z.enum(UNITS),
  price: z.number().min(0, 'Price cannot be negative'),
  gstRate: z
    .number()
    .min(0, 'GST rate cannot be negative')
    .max(100, 'GST rate cannot exceed 100%'),
})

export const quotationInputSchema = z.object({
  customerName: z.string().trim().min(1, 'Customer name is required'),
  date: isoDateSchema,
  items: z.array(lineItemInputSchema).min(1, 'Add at least one item'),
})

export const companyProfileSchema = z.object({
  name: z.string().trim().min(1, 'Company name is required'),
  logoDataUrl: z
    .string()
    .startsWith('data:image/', 'Logo must be an image')
    .optional(),
  signatureDataUrl: z
    .string()
    .startsWith('data:image/', 'Signature must be an image')
    .optional(),
  signatureName: z
    .string()
    .trim()
    .max(80, 'Signature name is too long')
    .optional(),
  address: z.string().trim().max(400, 'Address is too long'),
  phone: z.string().trim().max(40, 'Phone number is too long'),
  email: z
    .string()
    .trim()
    .max(120, 'Email is too long')
    .refine(
      (value) => value === '' || z.email().safeParse(value).success,
      'Enter a valid email address',
    ),
  gstin: z.string().trim().max(20, 'GSTIN is too long'),
  accentColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Use a hex colour like #0f766e'),
  defaultGstRate: z
    .number()
    .min(0, 'GST rate cannot be negative')
    .max(100, 'GST rate cannot exceed 100%'),
  quotePrefix: z
    .string()
    .trim()
    .min(1, 'Quote prefix is required')
    .max(12, 'Quote prefix is too long'),
})

export const storedLineItemSchema = lineItemInputSchema.extend({
  id: z.string().min(1),
})

export const storedQuotationSchema = z.object({
  id: z.string().min(1),
  number: z.string().min(1),
  date: isoDateSchema,
  customerName: z.string().trim().min(1),
  items: z.array(storedLineItemSchema).min(1),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
})

export type LineItemInput = z.infer<typeof lineItemInputSchema>
export type QuotationInput = z.infer<typeof quotationInputSchema>
export type CompanyProfileInput = z.infer<typeof companyProfileSchema>
