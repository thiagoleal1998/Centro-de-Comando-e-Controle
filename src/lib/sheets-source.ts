import { fetchSheetTables, type SheetTable } from "./google-sheets"

export type SheetGroupResult =
  | { ok: true; tables: Record<string, SheetTable> }
  | { ok: false; error: string }

/**
 * Busca um grupo de abas de uma planilha configurada por variável de
 * ambiente, já tratando "variável não configurada" e erros de rede/auth
 * como um resultado (não uma exceção) — cada seção da UI decide como
 * mostrar isso sem derrubar a página inteira.
 */
export async function loadSheetGroup(
  envVar: string,
  sheetNames: string[]
): Promise<SheetGroupResult> {
  const spreadsheetId = process.env[envVar]
  if (!spreadsheetId) {
    return { ok: false, error: `Variável de ambiente ${envVar} não configurada.` }
  }

  try {
    const tables = await fetchSheetTables(spreadsheetId, sheetNames)
    return { ok: true, tables }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido." }
  }
}
