export const SHEET_NAMES = [
  "Radar",
  "Analises",
  "Concorrentes",
  "Fornecedor",
  "Pilotos",
  "Gates",
  "Metodologia",
  "Config",
  "Score_Financeiro",
  "Score_Operacional",
] as const

export const SHEET_LABELS: Record<string, string> = {
  Radar: "Radar",
  Analises: "Análises",
  Concorrentes: "Concorrentes",
  Fornecedor: "Fornecedores",
  Pilotos: "Pilotos",
  Gates: "Gates",
  Metodologia: "Metodologia",
  Config: "Config",
  Score_Financeiro: "Score Financeiro",
  Score_Operacional: "Score Operacional",
}

// Colunas mostradas na tabela (as demais só aparecem no detalhe da linha,
// já que algumas abas da planilha têm dezenas de colunas).
export const SHEET_PRIORITY_COLUMNS: Record<string, string[]> = {
  Radar: [
    "ID",
    "Data captura",
    "Fornecedor/Grupo",
    "Produto normalizado",
    "Custo unitario",
    "MOQ/lote minimo",
    "Status funil",
    "Proxima acao",
  ],
  Analises: [
    "ID",
    "Produto",
    "Score total",
    "Classe",
    "Decisao",
    "Margem pos-Ads base %",
    "Payback estimado dias",
  ],
  Concorrentes: [
    "Concorrente",
    "Tipo",
    "Preco visivel",
    "Vendas estimadas",
    "Pontos fortes",
    "Pontos fracos",
  ],
  Fornecedor: [
    "Fornecedor",
    "Status negociação",
    "MOQ original",
    "Preço piloto",
    "Nota fornecedor",
    "Próximo passo",
  ],
  Pilotos: ["Produto", "Qtd piloto", "Vendas", "Margem real média", "Decisão recompra"],
  Gates: ["Gate", "Pergunta decisiva", "Status possíveis", "Regra de decisão"],
  Metodologia: ["Fase", "Objetivo", "Saída/Gate"],
  Config: ["Parametro", "Valor", "Observacao"],
  Score_Financeiro: ["Critério", "Peso", "Como pontuar"],
  Score_Operacional: ["Critério", "Peso", "Como pontuar", "Gate associado"],
}

// Colunas renderizadas como badge colorido (em vez de texto puro) na tabela.
export const SHEET_STATUS_COLUMNS: Record<string, string[]> = {
  Radar: ["Status funil"],
  Analises: ["Classe", "Decisao", "Gate primeira pagina", "Gate decisao"],
  Fornecedor: ["Status negociação"],
  Pilotos: ["Decisão recompra"],
}

// Coluna usada para o resumo de contagem no topo da aba (quando existe).
export const SHEET_SUMMARY_COLUMN: Record<string, string> = {
  Radar: "Status funil",
  Analises: "Classe",
  Fornecedor: "Status negociação",
  Pilotos: "Decisão recompra",
}

// Coluna de data usada para marcar a linha como "Novo" (24h a partir dela).
export const SHEET_NEW_BADGE_COLUMN: Record<string, string> = {
  Radar: "Data captura",
}

// Abas cronológicas onde o mais recente deve aparecer primeiro (a planilha
// vem em ordem de inserção — mais antigo primeiro — então invertemos).
export const SHEET_REVERSE_ORDER = new Set(["Radar", "Analises", "Pilotos"])
