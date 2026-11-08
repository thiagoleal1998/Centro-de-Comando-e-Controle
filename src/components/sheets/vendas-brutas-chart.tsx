"use client"

import * as React from "react"
import { List, TrendingUp } from "lucide-react"

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
import { cn } from "@/lib/utils"
import { formatBrl, formatCompactNumber, parseBrNumber } from "@/lib/format"
import type { SheetTable } from "@/lib/google-sheets"

const MONTH_ABBR: Record<string, string> = {
  janeiro: "Jan",
  fevereiro: "Fev",
  março: "Mar",
  marco: "Mar",
  abril: "Abr",
  maio: "Mai",
  junho: "Jun",
  julho: "Jul",
  agosto: "Ago",
  setembro: "Set",
  outubro: "Out",
  novembro: "Nov",
  dezembro: "Dez",
}

function niceStep(max: number, targetTicks = 4): number {
  if (max <= 0) return 1
  const rough = max / targetTicks
  const mag = Math.pow(10, Math.floor(Math.log10(rough)))
  const norm = rough / mag
  const step = norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10
  return step * mag
}

function roundedTopPath(x: number, y: number, w: number, h: number, r: number): string {
  const radius = Math.min(r, w / 2, h)
  return `M${x},${y + radius} Q${x},${y} ${x + radius},${y} L${x + w - radius},${y} Q${x + w},${y} ${x + w},${y + radius} L${x + w},${y + h} L${x},${y + h} Z`
}

export function VendasBrutasChart({ table }: { table: SheetTable }) {
  const [view, setView] = React.useState<"chart" | "tabela">("chart")
  const [hovered, setHovered] = React.useState<number | null>(null)

  const months = React.useMemo(() => {
    return table.rows
      .filter((row) => row["Mês"]?.trim() && !/total/i.test(row["Mês"]))
      .map((row) => ({
        label: row["Mês"].trim(),
        value: parseBrNumber(row["Vendas Brutas"]),
      }))
  }, [table.rows])

  const total = React.useMemo(() => months.reduce((sum, m) => sum + m.value, 0), [months])

  if (months.length === 0) {
    return (
      <p className="text-muted-foreground p-6 text-sm">
        Nenhum dado encontrado nesta aba.
      </p>
    )
  }

  const max = Math.max(...months.map((m) => m.value))
  const step = niceStep(max)
  const niceMax = Math.ceil(max / step) * step || step
  const ticks: number[] = []
  for (let v = 0; v <= niceMax; v += step) ticks.push(v)

  const width = 760
  const height = 220
  const padLeft = 44
  const padBottom = 28
  const padTop = 12
  const plotWidth = width - padLeft - 12
  const plotHeight = height - padTop - padBottom
  const slot = plotWidth / months.length
  const barWidth = Math.min(28, slot * 0.6)

  const valueToY = (v: number) => padTop + plotHeight - (v / niceMax) * plotHeight

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <TrendingUp className="text-primary size-5" />
          <div>
            <p className="text-muted-foreground text-xs">Total no período</p>
            <p className="text-xl font-semibold tabular-nums">{formatBrl(total)}</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setView(view === "chart" ? "tabela" : "chart")}
        >
          <List className="size-3.5" />
          {view === "chart" ? "Ver como tabela" : "Ver gráfico"}
        </Button>
      </div>

      {view === "tabela" ? (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mês</TableHead>
                <TableHead className="text-right">Vendas Brutas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {months.map((m) => (
                <TableRow key={m.label}>
                  <TableCell className="capitalize">{m.label}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatBrl(m.value)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-5">
            <div className="relative">
              <svg
                viewBox={`0 0 ${width} ${height}`}
                className="w-full"
                role="img"
                aria-label="Vendas brutas por mês"
              >
                {ticks.map((t) => {
                  const y = valueToY(t)
                  return (
                    <g key={t}>
                      <line
                        x1={padLeft}
                        x2={width - 8}
                        y1={y}
                        y2={y}
                        className="stroke-border"
                        strokeWidth={1}
                      />
                      <text
                        x={padLeft - 8}
                        y={y + 4}
                        textAnchor="end"
                        className="fill-muted-foreground text-[10px]"
                      >
                        {formatCompactNumber(t)}
                      </text>
                    </g>
                  )
                })}

                {months.map((m, i) => {
                  const x = padLeft + i * slot + (slot - barWidth) / 2
                  const y = valueToY(m.value)
                  const h = padTop + plotHeight - y
                  const abbr = MONTH_ABBR[m.label.toLowerCase()] ?? m.label.slice(0, 3)
                  return (
                    <g
                      key={m.label}
                      onMouseEnter={() => setHovered(i)}
                      onMouseLeave={() => setHovered((cur) => (cur === i ? null : cur))}
                      className="cursor-pointer"
                    >
                      <rect
                        x={x}
                        y={padTop}
                        width={barWidth}
                        height={plotHeight}
                        fill="transparent"
                      />
                      <path
                        d={roundedTopPath(x, y, barWidth, h, 4)}
                        className={cn(
                          "fill-chart-1 transition-opacity",
                          hovered !== null && hovered !== i && "opacity-40"
                        )}
                      />
                      <text
                        x={x + barWidth / 2}
                        y={height - padBottom + 16}
                        textAnchor="middle"
                        className="fill-muted-foreground text-[10px]"
                      >
                        {abbr}
                      </text>
                    </g>
                  )
                })}
              </svg>

              {hovered !== null ? (
                <div
                  className="bg-popover text-popover-foreground pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded-md border px-2.5 py-1.5 text-xs shadow-md"
                  style={{
                    left: `${((padLeft + hovered * slot + slot / 2) / width) * 100}%`,
                    top: `${(valueToY(months[hovered].value) / height) * 100 - 2}%`,
                  }}
                >
                  <p className="font-medium capitalize">{months[hovered].label}</p>
                  <p className="tabular-nums">{formatBrl(months[hovered].value)}</p>
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
