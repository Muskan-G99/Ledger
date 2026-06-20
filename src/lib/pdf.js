import * as pdfjsLib from 'pdfjs-dist'
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { guessCategory } from './csv'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl

// Matches a single-amount-column statement line: "06/15/24  AMAZON.COM  45.67"
// optionally trailed by "CR" for credits/payments. Statements with a running
// balance column (most bank checking PDFs) put a second number at the end of
// the line and won't reliably match this pattern - those should be imported
// via CSV instead.
const LINE_RE = /^(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)\s+(.+?)\s+(-?\$?\s?[\d,]+\.\d{2})\s*(CR)?$/i
const SKIP_RE = /autopay|payment.*thank you|electronic payment|statement credit/i

const toISODate = (raw, refYear, refMonth) => {
  const [month, day, yearPart] = raw.split('/').map((p) => parseInt(p, 10))
  let year = yearPart
  if (!year) {
    year = refYear
    if (refMonth && month - refMonth > 6) year -= 1
  } else if (year < 100) {
    year += 2000
  }
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

const extractLines = async (pdf) => {
  const lines = []
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p)
    const content = await page.getTextContent()
    const rows = new Map()
    content.items.forEach((item) => {
      const y = Math.round(item.transform[5])
      if (!rows.has(y)) rows.set(y, [])
      rows.get(y).push(item)
    })
    const sortedY = [...rows.keys()].sort((a, b) => b - a)
    sortedY.forEach((y) => {
      const line = rows
        .get(y)
        .sort((a, b) => a.transform[4] - b.transform[4])
        .map((i) => i.str)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim()
      if (line) lines.push(line)
    })
  }
  return lines
}

export const parseTransactionsPDF = async (file, cardId, onComplete) => {
  const buffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise
  const lines = await extractLines(pdf)
  const fullText = lines.join('\n')

  const closingMatch = fullText.match(/closing date[:\s]*(\d{1,2})\/(\d{1,2})\/(\d{4})/i)
  const anyDateMatch = fullText.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  const refMatch = closingMatch || anyDateMatch
  const refYear = refMatch ? parseInt(refMatch[3], 10) : new Date().getFullYear()
  const refMonth = refMatch ? parseInt(refMatch[1], 10) : null

  const rows = lines
    .map((line, i) => {
      const m = line.match(LINE_RE)
      if (!m) return null
      const [, dateRaw, descriptionRaw, amountRaw, creditFlag] = m
      const description = descriptionRaw.trim()
      if (SKIP_RE.test(description) || creditFlag || amountRaw.trim().startsWith('-')) return null
      const amount = Math.abs(parseFloat(amountRaw.replace(/[^0-9.-]/g, '')))
      if (!amount) return null
      return {
        id: `import-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 8)}`,
        date: toISODate(dateRaw, refYear, refMonth),
        merchant: description,
        amount,
        category: guessCategory(description),
        card: cardId || 'imported',
      }
    })
    .filter(Boolean)

  onComplete(rows)
}
