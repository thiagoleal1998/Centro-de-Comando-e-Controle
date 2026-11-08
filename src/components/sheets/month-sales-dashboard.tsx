import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { formatBrl, parseBrNumber } from "@/lib/format"
import { ProductDayGrid } from "@/components/sheets/product-day-grid"
import type { SheetTable } from "@/lib/google-sheets"

const KPI_LABEL_RE = /meta|realizado|proje[çc][ãa]o|margem|rentabilidade|resultado/i
const STRUCTURAL_ROW_RE =
  /^(di[áa]rio|agregado|parcial\/dia bruto|unidades vendidas)$/i
const CURRENCY_RE = /^-?R\$\s?-?[\d.,]+$/
const PERCENT_RE = /^-?[\d.,]+\s?%$/

function isCurrency(v: string | undefined): boolean {
  return !!v && CURRENCY_RE.test(v.trim())
}

function isValueish(v: string | undefined): boolean {
  if (!v) return false
  const t = v.trim()
  return CURRENCY_RE.test(t) || PERCENT_RE.test(t)
}

type Kpi = { label: string; value: string }

/**
 * Esta aba tem um "dashboard" solto no meio da grade: células de rótulo
 * (ex.: "META FAT. / MÊS") seguidas, na célula ao lado, do valor. Varre a
 * grade inteira procurando esse padrão em vez de depender de posições
 * fixas — os rótulos exatos variam um pouco entre os meses.
 */
function extractKpis(raw: string[][]): Kpi[] {
  const seen = new Set<string>()
  const kpis: Kpi[] = []

  for (const row of raw) {
    row.forEach((cell, col) => {
      const label = cell?.trim()
      if (!label || label.length > 40 || !KPI_LABEL_RE.test(label)) return
      const value = row[col + 1]?.trim()
      if (!isValueish(value)) return
      const key = label.toLowerCase()
      if (seen.has(key)) return
      seen.add(key)
      kpis.push({ label, value: value! })
    })
  }

  return kpis
}

type ProductTotal = { product: string; total: number }

/**
 * Cada linha de produto tem um valor de receita por dia espalhado em
 * dezenas de colunas (um bloco de 3 colunas por dia do mês). Em vez de
 * tentar mapear cada coluna a um dia exato, soma todas as células com
 * cara de valor monetário na linha — dá o total do mês por produto sem
 * depender da estrutura exata dos blocos.
 */
function extractProductTotals(raw: string[][]): ProductTotal[] {
  const seen = new Set<string>()
  const results: ProductTotal[] = []

  for (const row of raw) {
    // Prioriza a coluna "Produto" (C) sobre "Tipo de Produto" (B) — senão
    // linhas com o tipo preenchido ficariam rotuladas pela categoria em vez
    // do produto, agrupando (e descartando por dedupe) produtos diferentes.
    const nameCell = [row[2], row[1], row[3]].find(
      (c) => c?.trim() && !isValueish(c) && !/^\d+$/.test(c.trim())
    )
    const name = nameCell?.trim()
    if (!name || name.length > 60) continue
    if (STRUCTURAL_ROW_RE.test(name) || KPI_LABEL_RE.test(name)) continue

    const total = row.reduce((sum, cell) => {
      const t = cell?.trim()
      return isCurrency(t) ? sum + parseBrNumber(t) : sum
    }, 0)

    const key = name.toLowerCase()
    if (total > 0 && !seen.has(key)) {
      seen.add(key)
      results.push({ product: name, total })
    }
  }

  return results.sort((a, b) => b.total - a.total)
}

export function MonthSalesDashboard({ table }: { table: SheetTable }) {
  const kpis = extractKpis(table.raw)
  const products = extractProductTotals(table.raw)
  const maxProduct = Math.max(1, ...products.map((p) => p.total))

  if (kpis.length === 0 && products.length === 0) {
    return (
      <p className="text-muted-foreground p-6 text-sm">
        Nenhum dado encontrado nesta aba.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      {kpis.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {kpis.map((kpi) => (
            <Card key={kpi.label}>
              <CardContent className="flex flex-col gap-1 py-4">
                <p className="text-muted-foreground text-xs leading-tight">{kpi.label}</p>
                <p
                  className={cn(
                    "text-lg font-semibold tabular-nums",
                    /resultado/i.test(kpi.label) &&
                      kpi.value.trim().startsWith("-") &&
                      "text-destructive"
                  )}
                >
                  {kpi.value}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      {products.length > 0 ? (
        <Card>
          <CardContent className="flex flex-col gap-3 py-5">
            <p className="text-sm font-semibold">Faturamento por produto</p>
            <div className="flex flex-col gap-3">
              {products.map((p) => (
                <div key={p.product} className="flex flex-col gap-1">
                  <div className="flex items-baseline justify-between gap-2 text-sm">
                    <span className="truncate">{p.product}</span>
                    <span className="shrink-0 font-medium tabular-nums">
                      {formatBrl(p.total)}
                    </span>
                  </div>
                  <div className="bg-muted h-2 overflow-hidden rounded-full">
                    <div
                      className="bg-chart-1 h-full rounded-full"
                      style={{ width: `${(p.total / maxProduct) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      <ProductDayGrid table={table} />
    </div>
  )
}
