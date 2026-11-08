const HEADER_SCAN_ROWS = 10

function columnLetter(index: number): string {
  let n = index
  let letters = ""
  do {
    letters = String.fromCharCode(65 + (n % 26)) + letters
    n = Math.floor(n / 26) - 1
  } while (n >= 0)
  return letters
}

export type DetectedTable = {
  headers: string[]
  dataRows: string[][]
  hiddenColumnCount: number
  hiddenRowCount: number
}

/**
 * Detecta a linha de cabeçalho real de uma aba pela que tem mais células
 * preenchidas entre as primeiras ~10 — em vez de assumir que é sempre a
 * linha 1, o que quebra em abas com título solto antes do header de
 * verdade (comum nesta planilha). Também esconde colunas totalmente
 * vazias. Usado por SheetSmartTable e SheetItemCards.
 */
export function detectHeaderAndRows(
  raw: string[][],
  maxColumns = 60,
  maxRows = 300
): DetectedTable {
  if (raw.length === 0) {
    return { headers: [], dataRows: [], hiddenColumnCount: 0, hiddenRowCount: 0 }
  }

  let headerRowIndex = 0
  let bestCount = -1
  for (let i = 0; i < Math.min(HEADER_SCAN_ROWS, raw.length); i++) {
    const count = raw[i].filter((c) => c?.trim()).length
    if (count > bestCount) {
      bestCount = count
      headerRowIndex = i
    }
  }

  const headerRow = raw[headerRowIndex]
  const bodyRows = raw.slice(headerRowIndex + 1)
  const totalCols = raw.reduce((max, row) => Math.max(max, row.length), 0)

  const keptCols: number[] = []
  for (let c = 0; c < totalCols; c++) {
    const hasContent = headerRow[c]?.trim() || bodyRows.some((row) => row[c]?.trim())
    if (hasContent) keptCols.push(c)
  }

  const visibleCols = keptCols.slice(0, maxColumns)
  const headers = visibleCols.map((c) => headerRow[c]?.trim() || `Coluna ${columnLetter(c)}`)

  const nonEmptyBodyRows = bodyRows.filter((row) => visibleCols.some((c) => row[c]?.trim()))
  const dataRows = nonEmptyBodyRows
    .slice(0, maxRows)
    .map((row) => visibleCols.map((c) => row[c] ?? ""))

  return {
    headers,
    dataRows,
    hiddenColumnCount: keptCols.length - visibleCols.length,
    hiddenRowCount: nonEmptyBodyRows.length - dataRows.length,
  }
}
