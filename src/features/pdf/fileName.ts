function slug(value: string): string {
  return value
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function quotationFileName(
  number: string,
  customerName: string,
): string {
  const parts = ['Quotation', slug(number), slug(customerName)].filter(Boolean)

  return `${parts.join('-')}.pdf`
}
