import * as pdfjsLib from 'pdfjs-dist'
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { guessCategory } from './csv'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl

// A line starts with a date, then has a description, then ends with a dollar
// amount (optionally followed by trailing junk like a reference number or a
// running-balance column). We grab the LAST amount-looking token on the line
// rather than anchoring to the end of the string, since real statement PDFs
// often have a stray column or page artifact after the transaction amount.
const DATE_PREFIX_RE = /^(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)\s+(.*)$/
const AMOUNT_RE = /-?\$?\s?[\d,]+\.\d{2}\s*(CR)?/gi
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

// Groups text items into visual lines by y-position. PDF generators don't
// always emit perfectly identical y-coordinates for items on the same row
// (font baseline jitter), so nearby y-values are clustered together rather
// than requiring an exact match.
const groupIntoLines = (items) => {
  const sorted = [...items].sort((a, b) => b.transform[5] - a.transform[5])
  const rows = []
  sorted.forEach((item) => {
    const y = item.transform[5]
    const row = rows.find((r) => Math.abs(r.y - y) < 3)
    if (row) row.items.push(item)
    else rows.push({ y, items: [item] })
  })
  return rows.map((row) =>
    row.items
      .sort((a, b) => a.transform[4] - b.transform[4])
      .map((i) => i.str)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim(),
  )
}

const extractLines = async (pdf) => {
  const lines = []
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p)
    const content = await page.getTextContent()
    groupIntoLines(content.items).forEach((line) => {
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
      const dateMatch = line.match(DATE_PREFIX_RE)
      if (!dateMatch) return null
      const [, dateRaw, rest] = dateMatch

      const amountMatches = [...rest.matchAll(AMOUNT_RE)]
      if (!amountMatches.length) return null
      const lastAmount = amountMatches[amountMatches.length - 1]
      const amountRaw = lastAmount[0]
      const isCredit = Boolean(lastAmount[1]) || amountRaw.trim().startsWith('-')

      const description = rest.slice(0, lastAmount.index).trim()
      if (!description || SKIP_RE.test(description) || isCredit) return null

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

  if (rows.length === 0) {
    console.warn(`[parseTransactionsPDF] "${file.name}": extracted ${lines.length} text lines, matched 0 transactions.`, lines)
  }

  onComplete(rows)
}
