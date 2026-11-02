import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import type { CompanyProfile, Quotation } from '../../types'
import { calculateQuotationTotals } from '../../lib/calc'
import { formatDate, formatINRText, formatNumber } from '../../lib/format'
import { amountInWords } from '../../lib/words'

interface QuoteDocumentProps {
  profile: CompanyProfile
  quotation: Quotation
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 32,
    paddingHorizontal: 36,
    paddingBottom: 64,
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: '#334155',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 2,
    paddingBottom: 12,
    marginBottom: 18,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    flexGrow: 1,
    paddingRight: 16,
  },
  logo: {
    width: 54,
    height: 54,
    objectFit: 'contain',
    marginRight: 12,
  },
  logoFallback: {
    width: 54,
    height: 54,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  logoFallbackText: {
    color: '#ffffff',
    fontFamily: 'Helvetica-Bold',
    fontSize: 18,
  },
  companyName: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
    marginBottom: 7,
  },
  companyLine: {
    fontSize: 8,
    color: '#64748b',
    lineHeight: 1.4,
  },
  meta: {
    width: 170,
    alignItems: 'flex-end',
  },
  metaLabel: {
    fontSize: 7,
    letterSpacing: 0.8,
    color: '#94a3b8',
    textTransform: 'uppercase',
  },
  metaValue: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
    marginBottom: 8,
  },
  metaValueSmall: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
  },
  sectionLabel: {
    fontSize: 7,
    letterSpacing: 0.8,
    color: '#94a3b8',
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  customerName: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
    lineHeight: 1.35,
  },
  table: {
    marginTop: 18,
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  tableHeaderText: {
    color: '#ffffff',
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  rowAlt: {
    backgroundColor: '#f8fafc',
  },
  cell: {
    fontSize: 8.5,
    color: '#334155',
    lineHeight: 1.35,
  },
  cellStrong: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
    lineHeight: 1.35,
  },
  colIndex: { width: 22 },
  colName: { flexGrow: 1, paddingRight: 8 },
  colHsn: { width: 50, paddingRight: 6 },
  colQty: { width: 38, textAlign: 'right' },
  colUnit: { width: 46, textAlign: 'right' },
  colRate: { width: 64, textAlign: 'right' },
  colGst: { width: 40, textAlign: 'right' },
  colAmount: { width: 72, textAlign: 'right' },
  totalsWrap: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 14,
  },
  totalsBox: {
    width: 230,
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  totalsLabel: {
    fontSize: 8.5,
    color: '#64748b',
  },
  totalsValue: {
    fontSize: 8.5,
    color: '#0f172a',
  },
  grandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  grandLabel: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
  },
  grandValue: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 36,
    right: 36,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 7,
    color: '#94a3b8',
  },
  pageNumber: {
    position: 'absolute',
    right: 36,
    bottom: 24,
    fontSize: 7,
    color: '#94a3b8',
  },
  note: {
    marginTop: 12,
    padding: 10,
    borderRadius: 4,
    backgroundColor: '#f8fafc',
  },
  noteText: {
    fontSize: 7.5,
    color: '#64748b',
    lineHeight: 1.45,
  },
  terms: {
    marginTop: 10,
    padding: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  termsLabel: {
    fontSize: 7,
    letterSpacing: 0.8,
    color: '#94a3b8',
    textTransform: 'uppercase',
  },
  termsText: {
    marginTop: 3,
    fontSize: 8,
    color: '#334155',
    lineHeight: 1.45,
  },
  wordsBox: {
    marginTop: 14,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
  },
  wordsLabel: {
    fontSize: 7,
    letterSpacing: 0.8,
    color: '#94a3b8',
    textTransform: 'uppercase',
  },
  wordsText: {
    marginTop: 2,
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
    lineHeight: 1.35,
  },
  signature: {
    marginTop: 22,
    alignSelf: 'flex-end',
    width: 180,
    alignItems: 'center',
  },
  signatureFor: {
    fontSize: 8,
    color: '#475569',
  },
  signatureArea: {
    height: 36,
    width: '100%',
    marginTop: 6,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  signatureImage: {
    maxHeight: 36,
    maxWidth: 160,
    objectFit: 'contain',
  },
  signatureTyped: {
    fontFamily: 'Times-Italic',
    fontSize: 17,
    color: '#0f172a',
    lineHeight: 1.1,
  },
  signatureLine: {
    marginTop: 2,
    borderTopWidth: 1,
    borderTopColor: '#94a3b8',
    width: '100%',
  },
  signatureCaption: {
    marginTop: 4,
    fontSize: 7,
    color: '#64748b',
  },
})

export default function QuoteDocument({ profile, quotation }: QuoteDocumentProps) {
  const { lines, subtotal, totalGst, roundOff, grandTotal } =
    calculateQuotationTotals(quotation.items)
  const accent = profile.accentColor || '#0f766e'
  const showHsn = quotation.items.some((item) => Boolean(item.hsn?.trim()))
  const terms =
    quotation.terms?.trim() || profile.defaultTerms?.trim() || ''

  return (
    <Document
      title={`Quotation ${quotation.number}`}
      author={profile.name}
      subject={`Quotation for ${quotation.customerName}`}
      creator="Quotation App"
    >
      <Page size="A4" style={styles.page}>
        <View style={[styles.header, { borderBottomColor: accent }]}>
          <View style={styles.brand}>
            {profile.logoDataUrl ? (
              <Image src={profile.logoDataUrl} style={styles.logo} />
            ) : (
              <View style={[styles.logoFallback, { backgroundColor: accent }]}>
                <Text style={styles.logoFallbackText}>
                  {profile.name.trim().slice(0, 1).toUpperCase() || 'Q'}
                </Text>
              </View>
            )}
            <View>
              <Text style={styles.companyName}>{profile.name}</Text>
              {profile.address ? (
                <Text style={styles.companyLine}>{profile.address}</Text>
              ) : null}
              <Text style={styles.companyLine}>
                {[profile.phone, profile.email].filter(Boolean).join('  ·  ')}
              </Text>
              {profile.gstin ? (
                <Text style={styles.companyLine}>GSTIN: {profile.gstin}</Text>
              ) : null}
            </View>
          </View>

          <View style={styles.meta}>
            <Text style={styles.metaLabel}>Quotation No.</Text>
            <Text style={styles.metaValue}>{quotation.number}</Text>
            <Text style={styles.metaLabel}>Date</Text>
            <Text style={styles.metaValueSmall}>{formatDate(quotation.date)}</Text>
          </View>
        </View>

        <View>
          <Text style={styles.sectionLabel}>Quotation for</Text>
          <Text style={styles.customerName}>{quotation.customerName}</Text>
        </View>

        <View style={styles.table}>
          <View style={[styles.tableHeader, { backgroundColor: accent }]} fixed>
            <Text style={[styles.tableHeaderText, styles.colIndex]}>#</Text>
            <Text style={[styles.tableHeaderText, styles.colName]}>Item</Text>
            {showHsn ? (
              <Text style={[styles.tableHeaderText, styles.colHsn]}>HSN</Text>
            ) : null}
            <Text style={[styles.tableHeaderText, styles.colQty]}>Qty</Text>
            <Text style={[styles.tableHeaderText, styles.colUnit]}>Unit</Text>
            <Text style={[styles.tableHeaderText, styles.colRate]}>Rate</Text>
            <Text style={[styles.tableHeaderText, styles.colGst]}>GST</Text>
            <Text style={[styles.tableHeaderText, styles.colAmount]}>Amount</Text>
          </View>

          {lines.map((line, index) => (
            <View
              key={line.id}
              style={[styles.row, index % 2 === 1 ? styles.rowAlt : {}]}
            >
              <Text style={[styles.cell, styles.colIndex]}>{index + 1}</Text>
              <Text style={[styles.cellStrong, styles.colName]}>{line.name}</Text>
              {showHsn ? (
                <Text style={[styles.cell, styles.colHsn]}>
                  {line.hsn ?? ''}
                </Text>
              ) : null}
              <Text style={[styles.cell, styles.colQty]}>
                {formatNumber(line.qty)}
              </Text>
              <Text style={[styles.cell, styles.colUnit]}>{line.unit}</Text>
              <Text style={[styles.cell, styles.colRate]}>
                {formatINRText(line.price)}
              </Text>
              <Text style={[styles.cell, styles.colGst]}>{line.gstRate}%</Text>
              <Text style={[styles.cellStrong, styles.colAmount]}>
                {formatINRText(line.total)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.totalsWrap}>
          <View style={styles.totalsBox}>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Taxable value</Text>
              <Text style={styles.totalsValue}>{formatINRText(subtotal)}</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>GST</Text>
              <Text style={styles.totalsValue}>{formatINRText(totalGst)}</Text>
            </View>
            {Math.abs(roundOff) >= 0.005 ? (
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Round off</Text>
                <Text style={styles.totalsValue}>{formatINRText(roundOff)}</Text>
              </View>
            ) : null}
            <View style={[styles.grandRow, { backgroundColor: accent }]}>
              <Text style={styles.grandLabel}>Grand Total</Text>
              <Text style={styles.grandValue}>{formatINRText(grandTotal)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.wordsBox}>
          <Text style={styles.wordsLabel}>Amount in words</Text>
          <Text style={styles.wordsText}>{amountInWords(grandTotal)}</Text>
        </View>

        {terms ? (
          <View style={styles.terms}>
            <Text style={styles.termsLabel}>Terms &amp; conditions</Text>
            <Text style={styles.termsText}>{terms}</Text>
          </View>
        ) : null}

        <View style={styles.signature}>
          <Text style={styles.signatureFor}>For {profile.name}</Text>
          <View style={styles.signatureArea}>
            {profile.signatureDataUrl ? (
              <Image
                src={profile.signatureDataUrl}
                style={styles.signatureImage}
              />
            ) : profile.signatureName?.trim() ? (
              <Text style={styles.signatureTyped}>
                {profile.signatureName.trim()}
              </Text>
            ) : null}
          </View>
          <View style={styles.signatureLine} />
          <Text style={styles.signatureCaption}>Authorised Signatory</Text>
        </View>

        <View style={styles.note}>
          <Text style={styles.noteText}>
            This is a computer-generated quotation. Prices are exclusive of GST;
            GST is shown against each line item.
          </Text>
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>{profile.name}</Text>
        </View>
        <Text
          fixed
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) =>
            `Page ${pageNumber} of ${totalPages}`
          }
        />
      </Page>
    </Document>
  )
}
