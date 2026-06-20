import * as pdfjsLib from 'pdfjs-dist'
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { guessCategory } from './csv'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl

// Safari doesn't implement the ReadableStream async-iterator protocol, which
// pdfjs-dist relies on internally (`for await (const value of readableStream)`
// in Page.getTextContent). Without this, every PDF import fails on Safari with
// a cryptic "undefined is not a function (near '...value of readableStream...')".
if (typeof ReadableStream !== 'undefined' && !ReadableStream.prototype[Symbol.asyncIterator]) {
  ReadableStream.prototype[Symbol.asyncIterator] = async function* () {
    const reader = this.getReader()
    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) return
        yield value
      }
    } finally {
      reader.releaseLock()
    }
  }
}

// Amex (and similar) statements usually put the whole transaction on one
// line, including a bare foreign-currency figure for overseas purchases, with
// the category tag and currency name following on their own line(s) after:
//   12/18/25 AplPay THE COFFEE CLUB ARRIVAL BADUNG - BALI 340,999.00 $20.41 *
//   Indonesian Rupiahs
//   RESTAURANT
// Occasionally a statement instead wraps the amount onto a following line.
// We anchor on lines that start with a date, then scan forward a few lines
// for the first literal "$" amount (requiring the $ avoids mistaking the
// bare foreign-currency number for the transaction amount), then strip
// everything from that amount onward (plus any leftover foreign-currency
// figure right before it) to get a clean merchant description.
const DATE_LINE_RE = /^(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)\s*\*?\s+(.*)$/
const AMOUNT_RE = /(-)?\$\s?([\d,]+\.\d{2})\s*(CR)?/i
const SKIP_RE = /autopay|payment.*thank you|electronic payment|statement credit/i
const BLOCK_LOOKAHEAD = 6
const MAX_DAYS_FROM_CLOSING = 100

const toISODate = (raw, refYear, refMonth) => {
  const [month, day, yearPart] = raw.split('/').map((p) => parseInt(p, 10))
  let year = yearPart
  if (!year) {
    year = refYear
    if (refMonth && month - refMonth > 6) year -= 1
  } else if (year < 100) {
    year += 2000
  }
  return { iso: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`, year, month, day }
}

// Groups text items into visual lines by y-position. PDF generators don't
// always emit identical y-coordinates for items on the same row (font
// baseline jitter), so nearby y-values are clustered together.
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

  const closingMatch = fullText.match(/closing date[:\s]*(\d{1,2})\/(\d{1,2})\/(\d{2,4})/i)
  const anyDateMatch = fullText.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/)
  const refMatch = closingMatch || anyDateMatch
  let refYear = refMatch ? parseInt(refMatch[3], 10) : new Date().getFullYear()
  if (refYear < 100) refYear += 2000
  const refMonth = refMatch ? parseInt(refMatch[1], 10) : null
  const refDay = refMatch ? parseInt(refMatch[2], 10) : null
  const closingDate = refMonth ? new Date(refYear, refMonth - 1, refDay) : null

  const rows = []
  for (let i = 0; i < lines.length; i++) {
    const dateMatch = lines[i].match(DATE_LINE_RE)
    if (!dateMatch) continue
    const [, dateRaw, firstRest] = dateMatch

    let amountMatch = null
    let amountIndexInFirst = null
    const descParts = [firstRest]
    for (let j = i; j < Math.min(i + BLOCK_LOOKAHEAD, lines.length); j++) {
      const text = j === i ? firstRest : lines[j]
      if (j > i && DATE_LINE_RE.test(lines[j])) break
      const m = text.match(AMOUNT_RE)
      if (m) {
        amountMatch = m
        if (j === i) amountIndexInFirst = m.index
        break
      }
      if (j > i && descParts.length < 2) descParts.push(text)
    }
    if (!amountMatch) continue

    // When the $ amount sits on the same line as the merchant (the common
    // case), drop everything from the amount onward, including any leftover
    // foreign-currency figure that preceded it (e.g. "340,999.00 $20.41 ⧫").
    if (amountIndexInFirst !== null) descParts[0] = firstRest.slice(0, amountIndexInFirst)

    const description = descParts
      .join(' ')
      .replace(/[\d,]+\.\d{2}\s*$/, '')
      .replace(/\s+/g, ' ')
      .trim()
    const isCredit = Boolean(amountMatch[1]) || Boolean(amountMatch[3])
    if (!description || SKIP_RE.test(description) || isCredit) continue

    const amount = Math.abs(parseFloat(amountMatch[2].replace(/,/g, '')))
    if (!amount) continue

    const { iso, year, month, day } = toISODate(dateRaw, refYear, refMonth)
    if (closingDate) {
      const daysDiff = Math.abs((new Date(year, month - 1, day) - closingDate) / 86400000)
      if (daysDiff > MAX_DAYS_FROM_CLOSING) continue
    }

    rows.push({
      id: `import-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 8)}`,
      date: iso,
      merchant: description,
      amount,
      category: guessCategory(description),
      card: cardId || 'imported',
    })
  }

  if (rows.length === 0) {
    console.warn(`[parseTransactionsPDF] "${file.name}": extracted ${lines.length} text lines, matched 0 transactions.`, lines)
  }

  onComplete(rows)
}
