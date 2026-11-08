// Config da "Planilha de Vendas" — diferente da Análise de Produtos, aqui as
// abas são espalhadas entre páginas distintas do menu (Estratégia,
// Financeira, Vendas) em vez de ficarem juntas numa única página com tabs
// de fonte. Ver GOOGLE_SHEETS_SPREADSHEET_ID_VENDAS em ENVIRONMENT.md.

export const VENDAS_ENV_VAR = "GOOGLE_SHEETS_SPREADSHEET_ID_VENDAS"

export type SalesSheetRender = "smart" | "cards" | "chart" | "month-dashboard"

export type SalesSheet = {
  name: string
  label: string
  /** Como renderizar esta aba — "smart" (tabela com header auto-detectado,
   * padrão) cobre a maioria; "cards"/"chart" são usados pontualmente onde
   * a estrutura da aba permite algo mais visual. */
  render?: SalesSheetRender
}

export const ESTRATEGIA_SHEETS: SalesSheet[] = [
  { name: "Projeção", label: "Projeção", render: "cards" },
  { name: "Meta", label: "Meta" },
]

export const FINANCEIRO_VENDAS_SHEETS: SalesSheet[] = [
  { name: "Despesas", label: "Despesas" },
  { name: "Compras", label: "Compras" },
]

export const VENDAS_BRUTAS_SHEET: SalesSheet = {
  name: "Dados de vendas Brutas",
  label: "Vendas Brutas",
  render: "chart",
}

// Abas mensais agrupadas por ano — a UI mostra o ano como uma aba e os
// meses como sub-abas dentro dele, em vez de uma lista plana.
export const VENDAS_MONTHS_BY_YEAR: Record<string, SalesSheet[]> = {
  "2026": [
    { name: "Abril", label: "Abril", render: "month-dashboard" },
    { name: "Maio", label: "Maio", render: "month-dashboard" },
    { name: "Junho", label: "Junho", render: "month-dashboard" },
    { name: "Julho", label: "Julho", render: "month-dashboard" },
  ],
}

// Lista achatada de todas as abas da página Vendas — usada só para buscar
// os dados de uma vez (loadSheetGroup precisa dos nomes, não da hierarquia).
export const VENDAS_SHEETS: SalesSheet[] = [
  VENDAS_BRUTAS_SHEET,
  ...Object.values(VENDAS_MONTHS_BY_YEAR).flat(),
]
