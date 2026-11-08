"use client"

import * as React from "react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatBrl, formatCompactNumber } from "@/lib/format"
import { DeleteSalesEntryButton } from "@/components/sales/delete-sales-entry-button"
import type { SalesEntryWithProduct, SalesMonth } from "@/types/domain"

function Kpi({ label, value, danger }: { label: string; value: string; danger?: boolean }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-1 py-4">
        <p className="text-muted-foreground text-xs leading-tight">{label}</p>
        <p className={`text-lg font-semibold tabular-nums ${danger ? "text-destructive" : ""}`}>
          {value}
        </p>
      </CardContent>
    </Card>
  )
}

export function SalesMonthDashboard({
  salesMonth,
  entries,
}: {
  salesMonth: SalesMonth
  entries: SalesEntryWithProduct[]
}) {
  const [metric, setMetric] = React.useState<"units" | "revenue">("units")

  const totalRevenue = entries.reduce((sum, e) => sum + e.revenue, 0)
  const totalUnits = entries.reduce((sum, e) => sum + e.units, 0)
  const resultadoPrevisto =
    salesMonth.despesas_previstas !== null ? totalRevenue - salesMonth.despesas_previstas : null

  const productTotals = React.useMemo(() => {
    const map = new Map<string, { name: string; total: number }>()
    for (const e of entries) {
      const name = e.products?.name ?? "Produto removido"
      const cur = map.get(e.product_id) ?? { name, total: 0 }
      cur.total += e.revenue
      map.set(e.product_id, cur)
    }
    return [...map.values()].sort((a, b) => b.total - a.total)
  }, [entries])
  const maxProduct = Math.max(1, ...productTotals.map((p) => p.total))

  const days = React.useMemo(() => {
    const maxDay = Math.max(1, ...entries.map((e) => e.day))
    return Array.from({ length: maxDay }, (_, i) => i + 1)
  }, [entries])

  const gridProducts = React.useMemo(() => {
    const byProduct = new Map<string, { name: string; perDay: Map<number, { units: number; revenue: number }> }>()
    for (const e of entries) {
      const name = e.products?.name ?? "Produto removido"
      if (!byProduct.has(e.product_id)) {
        byProduct.set(e.product_id, { name, perDay: new Map() })
      }
      byProduct.get(e.product_id)!.perDay.set(e.day, { units: e.units, revenue: e.revenue })
    }
    return [...byProduct.values()]
  }, [entries])
  const gridMax = Math.max(
    1,
    ...gridProducts.flatMap((p) =>
      days.map((d) => {
        const cell = p.perDay.get(d)
        if (!cell) return 0
        return metric === "units" ? cell.units : cell.revenue
      })
    )
  )

  const sortedEntries = [...entries].sort((a, b) => a.day - b.day)

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <Kpi label="Realizado" value={formatBrl(totalRevenue)} />
        <Kpi label="Unidades vendidas" value={String(totalUnits)} />
        {salesMonth.meta_faturamento !== null ? (
          <Kpi label="Meta de faturamento" value={formatBrl(salesMonth.meta_faturamento)} />
        ) : null}
        {salesMonth.super_meta_faturamento !== null ? (
          <Kpi
            label="Super meta de faturamento"
            value={formatBrl(salesMonth.super_meta_faturamento)}
          />
        ) : null}
        {salesMonth.despesas_previstas !== null ? (
          <Kpi label="Despesas previstas" value={formatBrl(salesMonth.despesas_previstas)} />
        ) : null}
        {salesMonth.margem_prevista_pct !== null ? (
          <Kpi
            label="Margem prevista"
            value={`${salesMonth.margem_prevista_pct.toLocaleString("pt-BR")}%`}
          />
        ) : null}
        {resultadoPrevisto !== null ? (
          <Kpi
            label="Resultado (realizado - despesas)"
            value={formatBrl(resultadoPrevisto)}
            danger={resultadoPrevisto < 0}
          />
        ) : null}
      </div>

      {productTotals.length > 0 ? (
        <Card>
          <CardContent className="flex flex-col gap-3 py-5">
            <p className="text-sm font-semibold">Faturamento por produto</p>
            <div className="flex flex-col gap-3">
              {productTotals.map((p) => (
                <div key={p.name} className="flex flex-col gap-1">
                  <div className="flex items-baseline justify-between gap-2 text-sm">
                    <span className="truncate">{p.name}</span>
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

      {gridProducts.length > 0 ? (
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
                        {d}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {gridProducts.map((p) => (
                    <tr key={p.name}>
                      <td className="bg-card sticky left-0 max-w-40 truncate px-2 py-1 font-medium">
                        {p.name}
                      </td>
                      {days.map((d) => {
                        const cell = p.perDay.get(d)
                        const value = cell ? (metric === "units" ? cell.units : cell.revenue) : 0
                        const ratio = Math.min(1, value / gridMax)
                        return (
                          <td
                            key={d}
                            className="min-w-7 rounded px-0.5 py-1 text-center tabular-nums"
                            style={
                              value > 0
                                ? {
                                    backgroundColor: `color-mix(in oklch, var(--chart-1) ${Math.round(ratio * 85 + 15)}%, transparent)`,
                                  }
                                : undefined
                            }
                            title={cell ? `Dia ${d}: ${cell.units} un. · ${formatBrl(cell.revenue)}` : ""}
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
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardContent className="py-5">
          <p className="mb-3 text-sm font-semibold">Lançamentos ({entries.length})</p>
          {entries.length === 0 ? (
            <p className="text-muted-foreground text-sm">Nenhuma venda lançada ainda.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Dia</TableHead>
                  <TableHead className="text-right">Unidades</TableHead>
                  <TableHead className="text-right">Faturamento</TableHead>
                  <TableHead className="w-8" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedEntries.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell>{e.products?.name ?? "Produto removido"}</TableCell>
                    <TableCell>{e.day}</TableCell>
                    <TableCell className="text-right tabular-nums">{e.units}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatBrl(e.revenue)}
                    </TableCell>
                    <TableCell>
                      <DeleteSalesEntryButton monthId={salesMonth.id} entryId={e.id} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
