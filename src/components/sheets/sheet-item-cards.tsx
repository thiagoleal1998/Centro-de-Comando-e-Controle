"use client"

import * as React from "react"
import { List, LayoutGrid } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { detectHeaderAndRows } from "@/lib/sheet-table-detect"
import { SheetSmartTable } from "@/components/sheets/sheet-smart-table"
import type { SheetTable } from "@/lib/google-sheets"

const CURRENCY_RE = /^-?R\$\s?-?[\d.,]+$/
const PERCENT_RE = /^-?[\d.,]+\s?%$/

type ColumnKind = "currency" | "percent" | "text"

function columnKind(rows: string[][], colIndex: number): ColumnKind {
  const sample = rows.map((r) => r[colIndex]?.trim()).filter(Boolean) as string[]
  if (sample.length === 0) return "text"
  const currencyCount = sample.filter((v) => CURRENCY_RE.test(v)).length
  if (currencyCount / sample.length > 0.5) return "currency"
  const percentCount = sample.filter((v) => PERCENT_RE.test(v)).length
  if (percentCount / sample.length > 0.5) return "percent"
  return "text"
}

function parseBr(value: string): number {
  const cleaned = value.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".")
  const parsed = Number(cleaned)
  return Number.isFinite(parsed) ? parsed : 0
}

/**
 * Mostra cada linha como um card em vez de uma linha de tabela densa: nome
 * em destaque, colunas de texto curtas como badges, e as colunas
 * monetárias como uma mini barra por valor (sem rotular qual mês é cada
 * uma — a planilha não nomeia a maioria delas — só dá pra ver a
 * magnitude/tendência de relance; passe o mouse pra ver o valor exato).
 * Não calcula nenhum total novo, só reapresenta o que já está na célula.
 */
export function SheetItemCards({ table }: { table: SheetTable }) {
  const [view, setView] = React.useState<"cards" | "tabela">("cards")

  const { headers, dataRows } = React.useMemo(() => detectHeaderAndRows(table.raw), [table.raw])

  const { titleCol, badgeCols, currencyCols } = React.useMemo(() => {
    const kinds = headers.map((_, i) => columnKind(dataRows, i))
    const textCols = kinds.flatMap((k, i) => (k === "text" ? [i] : []))
    const currencyCols = kinds.flatMap((k, i) => (k === "currency" ? [i] : []))
    return {
      titleCol: textCols[0],
      badgeCols: textCols.slice(1),
      currencyCols,
    }
  }, [headers, dataRows])

  if (headers.length === 0 || dataRows.length === 0) {
    return (
      <p className="text-muted-foreground p-6 text-sm">
        Nenhum dado encontrado nesta aba.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={() => setView(view === "cards" ? "tabela" : "cards")}>
          {view === "cards" ? <List className="size-3.5" /> : <LayoutGrid className="size-3.5" />}
          {view === "cards" ? "Ver como tabela" : "Ver como cards"}
        </Button>
      </div>

      {view === "tabela" ? (
        <SheetSmartTable table={table} />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {dataRows.map((row, i) => {
            const title = (titleCol !== undefined ? row[titleCol]?.trim() : "") || `Item ${i + 1}`
            const currencyValues = currencyCols.map((c) => parseBr(row[c] ?? ""))
            const maxVal = Math.max(1, ...currencyValues)

            return (
              <Card key={i}>
                <CardContent className="flex flex-col gap-3 py-4">
                  <p className="truncate text-sm font-semibold" title={title}>
                    {title}
                  </p>

                  {badgeCols.some((c) => row[c]?.trim()) ? (
                    <div className="flex flex-wrap gap-1.5">
                      {badgeCols.map((c) =>
                        row[c]?.trim() ? (
                          <Badge key={c} variant="outline" className="font-normal">
                            {row[c]}
                          </Badge>
                        ) : null
                      )}
                    </div>
                  ) : null}

                  {currencyCols.length > 0 && currencyValues.some((v) => v > 0) ? (
                    <div className="flex h-9 items-end gap-0.5">
                      {currencyCols.map((c, idx) => {
                        const v = currencyValues[idx]
                        const h = Math.max(3, (v / maxVal) * 36)
                        return (
                          <div
                            key={c}
                            className="bg-chart-1 w-1.5 shrink-0 rounded-[1px]"
                            style={{ height: `${h}px`, opacity: v > 0 ? 1 : 0.15 }}
                            title={`${headers[c]}: ${row[c] || "—"}`}
                          />
                        )
                      })}
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
