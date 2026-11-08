// Config da "Planilha de Vendas" — diferente da Análise de Produtos, aqui as
// abas são espalhadas entre páginas distintas do menu (Estratégia,
// Financeira, Vendas) em vez de ficarem juntas numa única página com tabs
// de fonte. Ver GOOGLE_SHEETS_SPREADSHEET_ID_VENDAS em ENVIRONMENT.md.

export const VENDAS_ENV_VAR = "GOOGLE_SHEETS_SPREADSHEET_ID_VENDAS"

export type SalesSheetRender = "smart" | "cards" | "chart"

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

export const VENDAS_SHEETS: SalesSheet[] = [
  { name: "Dados de vendas Brutas", label: "Vendas Brutas", render: "chart" },
  { name: "Abril", label: "Abril" },
  { name: "Maio", label: "Maio" },
  { name: "Junho", label: "Junho" },
  { name: "Julho", label: "Julho" },
]
