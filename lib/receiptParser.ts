import type { ParsedReceipt } from '@/types'

const SKIP_PATTERNS = [
  /^(sub)?total/i,
  /^tax/i,
  /^tip/i,
  /^gratuity/i,
  /^balance/i,
  /^amount due/i,
  /^change/i,
  /^cash/i,
  /^credit/i,
  /^debit/i,
  /^visa/i,
  /^mastercard/i,
  /^thank/i,
  /^welcome/i,
  /^guest/i,
  /^table/i,
  /^server/i,
  /^check #/i,
  /^receipt/i,
  /^order/i,
  /^qty/i,
  /^quantity/i,
  /^item/i,
  /^description/i,
  /^price/i,
]

const TAX_PATTERNS = [/tax/i, /vat/i, /hst/i, /gst/i, /pst/i]
const TIP_PATTERNS = [/tip/i, /gratuity/i, /service charge/i]

function parseMoney(s: string): number | null {
  const cleaned = s.replace(/[$,]/g, '').trim()
  const val = parseFloat(cleaned)
  return isNaN(val) || val <= 0 ? null : val
}

export function parseReceiptText(text: string): ParsedReceipt {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  const items: { name: string; price: number }[] = []
  let tax = 0
  let tip = 0

  // Pattern 1: "Item Name   12.99" or "Item Name ... $12.99"
  const inlinePattern = /^(.+?)\s{2,}[\.\s]*\$?(\d+\.\d{2})\s*$/
  // Pattern 2: price on same line at the end after whitespace
  const endPricePattern = /^(.*\S)\s+\$?(\d+\.\d{2})\s*$/

  for (const line of lines) {
    if (line.length < 2) continue

    // Check for tax
    if (TAX_PATTERNS.some(p => p.test(line))) {
      const match = line.match(/\$?(\d+\.\d{2})/)
      if (match) tax = parseFloat(match[1])
      continue
    }

    // Check for tip
    if (TIP_PATTERNS.some(p => p.test(line))) {
      const match = line.match(/\$?(\d+\.\d{2})/)
      if (match) tip = parseFloat(match[1])
      continue
    }

    // Skip non-item lines
    if (SKIP_PATTERNS.some(p => p.test(line))) continue

    const match = inlinePattern.exec(line) || endPricePattern.exec(line)
    if (!match) continue

    const name = match[1].replace(/^[\d\s\.]+/, '').trim()
    const price = parseMoney(match[2])

    if (!price || price > 500 || name.length < 2) continue
    if (SKIP_PATTERNS.some(p => p.test(name))) continue

    items.push({ name, price })
  }

  return { items, tax, tip }
}
