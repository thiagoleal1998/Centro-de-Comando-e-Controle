import { getGoogleSheetsAccessToken } from "./google-sheets-tokens"

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID

export type SheetTable = {
  headers: string[]
  rows: Record<string, string>[]
}

function rangeToTable(values: string[][] | undefined): SheetTable {
  if (!values || values.length === 0) {
    return { headers: [], rows: [] }
  }

  const [headerRow, ...dataRows] = values
  const headers = headerRow.map((h) => h.trim())

  const rows = dataRows
    .filter((row) => row.some((cell) => cell?.trim()))
    .map((row) => {
      const record: Record<string, string> = {}
      headers.forEach((header, i) => {
        record[header] = row[i] ?? ""
      })
      return record
    })

  return { headers, rows }
}

/**
 * Busca várias abas de uma vez (uma chamada à API) e retorna cada uma já
 * parseada como {headers, rows}. Sempre busca ao vivo — a planilha é a
 * fonte da verdade, não mantemos cópia local.
 */
export async function fetchSheetTables(
  sheetNames: string[]
): Promise<Record<string, SheetTable>> {
  if (!SPREADSHEET_ID) {
    throw new Error("GOOGLE_SHEETS_SPREADSHEET_ID não configurado.")
  }

  const token = await getGoogleSheetsAccessToken()

  const ranges = sheetNames.map((name) => `${name}!A1:ZZ2000`)
  const url = new URL(
    `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values:batchGet`
  )
  ranges.forEach((r) => url.searchParams.append("ranges", r))
  url.searchParams.set("valueRenderOption", "FORMATTED_VALUE")

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Falha ao buscar a planilha (${res.status}): ${body}`)
  }

  const data = (await res.json()) as {
    valueRanges: { range: string; values?: string[][] }[]
  }

  const result: Record<string, SheetTable> = {}
  sheetNames.forEach((name, i) => {
    result[name] = rangeToTable(data.valueRanges[i]?.values)
  })

  return result
}
