import { getGoogleSheetsAccessToken } from "./google-sheets-tokens"

export type SheetTable = {
  headers: string[]
  rows: Record<string, string>[]
  /** Linhas brutas (incluindo a que vira "header") — para abas que não são
   * uma tabela tradicional, ex. um resumo em formato chave/valor. */
  raw: string[][]
}

function rangeToTable(values: string[][] | undefined): SheetTable {
  if (!values || values.length === 0) {
    return { headers: [], rows: [], raw: [] }
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

  return { headers, rows, raw: values }
}

/**
 * Busca várias abas de uma só vez (uma chamada à API) de uma planilha
 * específica, já parseadas como {headers, rows, raw}. Sempre busca ao
 * vivo — a planilha é a fonte da verdade, não mantemos cópia local.
 */
export async function fetchSheetTables(
  spreadsheetId: string,
  sheetNames: string[]
): Promise<Record<string, SheetTable>> {
  if (!spreadsheetId) {
    throw new Error("ID da planilha não configurado.")
  }

  const token = await getGoogleSheetsAccessToken()

  // Nomes de aba com espaço (ou outros caracteres especiais) precisam vir
  // entre aspas simples no range, senão a API do Sheets interpreta errado.
  const ranges = sheetNames.map((name) => `'${name.replace(/'/g, "''")}'!A1:ZZ2000`)
  const url = new URL(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchGet`
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
