export type SheetSourceConfig = {
  label: string
  /** Variável de ambiente com o ID desta planilha. */
  envVar: string
  sheetOrder: string[]
  labels: Record<string, string>
  // Colunas mostradas na tabela (as demais só aparecem no detalhe da linha).
  priorityColumns: Record<string, string[]>
  // Colunas renderizadas como badge colorido em vez de texto puro.
  statusColumns: Record<string, string[]>
  // Coluna usada para o resumo de contagem no topo da aba (quando existe).
  summaryColumn: Record<string, string>
  // Coluna de data usada para marcar a linha como "Novo" (24h a partir dela).
  newBadgeColumn: Record<string, string>
  // Abas cronológicas onde o mais recente deve aparecer primeiro.
  reverseOrder: Set<string>
  // Abas tipo "resumo" (chave/valor em duas colunas, sem header de tabela).
  keyValueSheets: Set<string>
}

export const SHEET_SOURCES: Record<string, SheetSourceConfig> = {
  esteira: {
    label: "Esteira de Mineração",
    envVar: "GOOGLE_SHEETS_SPREADSHEET_ID",
    sheetOrder: [
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
    ],
    labels: {
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
    },
    priorityColumns: {
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
    },
    statusColumns: {
      Radar: ["Status funil"],
      Analises: ["Classe", "Decisao", "Gate primeira pagina", "Gate decisao"],
      Fornecedor: ["Status negociação"],
      Pilotos: ["Decisão recompra"],
    },
    summaryColumn: {
      Radar: "Status funil",
      Analises: "Classe",
      Fornecedor: "Status negociação",
      Pilotos: "Decisão recompra",
    },
    newBadgeColumn: {
      Radar: "Data captura",
    },
    reverseOrder: new Set(["Radar", "Analises", "Pilotos"]),
    keyValueSheets: new Set(),
  },

  shortlist: {
    label: "Shortlist Pronix",
    envVar: "GOOGLE_SHEETS_SPREADSHEET_ID_SHORTLIST",
    sheetOrder: [
      "Produtos",
      "Resumo",
      "Checklist_fornecedores",
      "Retorno_Pronix",
      "Como_decidir",
      "Fluxo_Thiago",
    ],
    labels: {
      Produtos: "Produtos",
      Resumo: "Resumo",
      Checklist_fornecedores: "Fornecedores",
      Retorno_Pronix: "Retorno Pronix",
      Como_decidir: "Como Decidir",
      Fluxo_Thiago: "Fluxo",
    },
    priorityColumns: {
      Produtos: [
        "Prioridade",
        "SKU",
        "Produto",
        "Fornecedor",
        "CM1 %",
        "Status DVP",
        "Direção para Thiago",
      ],
      Checklist_fornecedores: ["Fornecedor", "Produtos", "Bloqueia teste?"],
      Retorno_Pronix: ["Produto", "Status Pronix", "Direção"],
      Como_decidir: ["Etapa", "Critério", "Decisão"],
      Fluxo_Thiago: ["Passo", "Ação do Thiago", "Saída esperada"],
    },
    statusColumns: {
      Produtos: ["Status DVP", "Pronto para nova Pronix?"],
      Retorno_Pronix: ["Status Pronix"],
      Checklist_fornecedores: ["Bloqueia teste?"],
    },
    summaryColumn: {
      Produtos: "Status DVP",
    },
    newBadgeColumn: {},
    reverseOrder: new Set(),
    keyValueSheets: new Set(["Resumo"]),
  },
}
