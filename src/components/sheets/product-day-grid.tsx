"use client"

import * as React from "react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatBrl, formatCompactNumber, parseBrNumber } from "@/lib/format"
import type { SheetTable } from "@/lib/google-sheets"

const DATE_RE = /^(\d{1,2})\/(\d{1,2})(\/\d{2,4})?$/
const CURRENCY_RE = /^-?R\$\s?-?[\d.,]+$/
const PERCENT_RE = /^-?[\d.,]+\s?%$/
const STRUCTURAL_ROW_RE =
  /^(di[áa]rio|agregado|parcial\/dia bruto|unidades vendidas)$/i
const KPI_LABEL_RE = /meta|realizado|proje[çc][ãa]o|margem|rentabilidade|resultado/i

function isValueish(v: string | undefined): boolean {
  if (!v) return false
  const t = v.trim()
  return CURRENCY_RE.test(t) || PERCENT_RE.test(t)
}

type DayCell = { day: string; units: number; revenue: number }
type ProductRow = { product: string; cells: DayCell[] }

/**
 * Cada dia do mês ocupa um bloco de colunas (data no cabeçalho, depois
 * faturamento/%/unidades nas colunas seguintes, sem header próprio). Em vez
 * de assumir a largura exata do bloco, usa a distância até a próxima data
 * encontrada no cabeçalho — e dentro do bloco identifica cada valor pelo
 * FORMATO (R$ = faturamento, % = ignorado, inteiro puro = unidades), não
 * pela posição, o que é resistente a blocos de largura inconsistente.
 */
function extractDailyGrid(raw: string[][]): { days: string[]; products: ProductRow[] } {
  let headerRowIndex = -1
  let bestCount = 0
  for (let i = 0; i < Math.min(raw.length, 5); i++) {
    const count = raw[i].filter((c) => c?.trim() && DATE_RE.test(c.trim())).length
    if (count > bestCount) {
      bestCount = count
      headerRowIndex = i
    }
  }
  if (headerRowIndex === -1 || bestCount < 2) return { days: [], products: [] }

  const headerRow = raw[headerRowIndex]
  const dateCols: { col: number; day: string }[] = []
  headerRow.forEach((cell, col) => {
    const t = cell?.trim()
    if (t && DATE_RE.test(t)) dateCols.push({ col, day: t })
  })

  const blocks = dateCols.map((d, i) => ({
    day: d.day,
    start: d.col,
    end: i + 1 < dateCols.length ? dateCols[i + 1].col - 1 : d.col + 4,
  }))

  const products: ProductRow[] = []
  for (const row of raw.slice(headerRowIndex + 1)) {
    const nameCell = [row[2], row[1], row[3]].find(
      (c) => c?.trim() && !isValueish(c) && !/^\d+$/.test(c.trim())
    )
    const name = nameCell?.trim()
    if (!name || name.length > 60) continue
    if (STRUCTURAL_ROW_RE.test(name) || KPI_LABEL_RE.test(name)) continue

    const cells: DayCell[] = blocks.map((b) => {
      let revenue = 0
      let units = 0
      for (let c = b.start; c <= b.end; c++) {
        const t = row[c]?.trim()
        if (!t) continue
        if (CURRENCY_RE.test(t)) revenue = parseBrNumber(t)
        else if (!PERCENT_RE.test(t) && /^\d+$/.test(t)) units = Number(t)
      }
      return { day: b.day, units, revenue }
    })

    if (cells.some((c) => c.units > 0 || c.revenue > 0)) {
      products.push({ product: name, cells })
    }
  }

  return { days: blocks.map((b) => b.day), products }
}

export function ProductDayGrid({ table }: { table: SheetTable }) {
  const [metric, setMetric] = React.useState<"units" | "revenue">("units")

  const { days, products } = React.useMemo(() => extractDailyGrid(table.raw), [table.raw])

  if (products.length === 0 || days.length === 0) return null

  const max = Math.max(
    1,
    ...products.flatMap((p) => p.cells.map((c) => (metric === "units" ? c.units : c.revenue)))
  )

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 py-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold">Vendas por produto e dia</p>
          <div className="flex gap-1">
            <Button
              size="xs"
              variant={metric === "units" ? "secondary" : "ghost"}
              onClick={() => setMetric("units")}
            >
              Unidades
            </Button>
            <Button
              size="xs"
              variant={metric === "revenue" ? "secondary" : "ghost"}
              onClick={() => setMetric("revenue")}
            >
              Faturamento
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="border-separate border-spacing-y-0.5 text-xs">
            <thead>
              <tr>
                <th className="bg-card sticky left-0 px-2 py-1 text-left font-medium">
                  Produto
                </th>
                {days.map((d) => (
                  <th
                    key={d}
                    className="text-muted-foreground min-w-7 px-0.5 py-1 text-center font-normal"
                  >
                    {d.split("/")[0]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.product}>
                  <td
                    className="bg-card sticky left-0 max-w-40 truncate px-2 py-1 font-medium"
                    title={p.product}
                  >
                    {p.product}
                  </td>
                  {p.cells.map((c, i) => {
                    const value = metric === "units" ? c.units : c.revenue
                    const ratio = Math.min(1, value / max)
                    return (
                      <td
                        key={i}
                        className="min-w-7 rounded px-0.5 py-1 text-center tabular-nums"
                        style={
                          value > 0
                            ? {
                                backgroundColor: `color-mix(in oklch, var(--chart-1) ${Math.round(ratio * 85 + 15)}%, transparent)`,
                              }
                            : undefined
                        }
                        title={`${p.product} — ${c.day}: ${c.units} un. · ${formatBrl(c.revenue)}`}
                      >
                        {value > 0
                          ? metric === "units"
                            ? value
                            : formatCompactNumber(value)
                          : ""}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-muted-foreground text-xs">
          Passe o mouse sobre uma célula para ver unidades e faturamento do dia.
        </p>
      </CardContent>
    </Card>
  )
}
