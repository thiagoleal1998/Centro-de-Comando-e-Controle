import { Target } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { SheetSmartTable } from "@/components/sheets/sheet-smart-table"
import type { SheetTable } from "@/lib/google-sheets"

// Inclui "janiero" (erro de digitação confirmado na planilha de origem,
// "Janiero/27") como alias de "janeiro" — sem isso, o bloco daquele mês
// herdaria por engano os campos do mês anterior na mesma coluna.
const MONTH_RE =
  /^(janeiro|janiero|fevereiro|mar[çc]o|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)(\/\d{2,4})?$/i
const FIELD_RE = /^(Faturamento|Realizado|Diferen[çc]a|Vendas):?\s*$/i

// Normaliza para o nome correto do mês (corrige o "janiero" acima) e
// preserva o sufixo de ano (ex.: "/27"), para não mostrar o erro de
// digitação da planilha de origem no card.
const MONTH_CANON: Record<string, string> = {
  janeiro: "Janeiro",
  janiero: "Janeiro",
  fevereiro: "Fevereiro",
  março: "Março",
  marco: "Março",
  abril: "Abril",
  maio: "Maio",
  junho: "Junho",
  julho: "Julho",
  agosto: "Agosto",
  setembro: "Setembro",
  outubro: "Outubro",
  novembro: "Novembro",
  dezembro: "Dezembro",
}

type MonthCard = {
  label: string
  order: number
  fields: { field: string; value: string }[]
}

/**
 * Esta aba tem um padrão de "blocos por mês": uma linha com o nome do mês
 * numa coluna, seguida por linhas "Faturamento:"/"Realizado:"/
 * "Diferença:"/"Vendas:" na MESMA coluna do mês, com o valor na coluna ao
 * lado. Associar por coluna (em vez de por posição fixa) deixa isso
 * resistente a mudanças de layout na planilha.
 */
function parseMonthBlocks(raw: string[][]): MonthCard[] {
  const colToMonth = new Map<number, string>()
  const cards = new Map<string, MonthCard>()
  let order = 0

  for (const row of raw) {
    row.forEach((cell, col) => {
      const v = cell?.trim()
      const match = v?.match(MONTH_RE)
      if (match) {
        const canon = MONTH_CANON[match[1].toLowerCase()] ?? match[1]
        const label = canon + (match[2] ?? "")
        colToMonth.set(col, label)
        if (!cards.has(label)) cards.set(label, { label, order: order++, fields: [] })
      }
    })

    row.forEach((cell, col) => {
      const v = cell?.trim()
      if (!v || !FIELD_RE.test(v)) return
      const value = row[col + 1]?.trim()
      const month = colToMonth.get(col)
      // Ignora erros de fórmula (#REF!, #N/A...) e células vazias.
      if (month && value && !value.startsWith("#")) {
        cards.get(month)!.fields.push({ field: v.replace(/:$/, ""), value })
      }
    })
  }

  return [...cards.values()].sort((a, b) => a.order - b.order)
}

function findHeroText(raw: string[][]): string | null {
  for (const row of raw) {
    if (!row.some((c) => c?.toLowerCase().includes("meta final"))) continue
    const longest = row.reduce<string>(
      (best, c) => ((c?.length ?? 0) > best.length ? c : best),
      ""
    )
    if (longest.length > 15) return longest
  }
  return null
}

export function ProjecaoCards({ table }: { table: SheetTable }) {
  const months = parseMonthBlocks(table.raw)
  const hero = findHeroText(table.raw)

  if (months.length === 0) {
    return <SheetSmartTable table={table} />
  }

  return (
    <div className="flex flex-col gap-5">
      {hero ? (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="flex items-center gap-3 py-5">
            <Target className="text-primary size-6 shrink-0" />
            <p className="text-sm font-medium">{hero}</p>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {months.map((month) => (
          <Card key={month.label}>
            <CardContent className="flex flex-col gap-3 py-5">
              <p className="text-sm font-semibold capitalize">{month.label}</p>
              <div className="flex flex-col gap-2">
                {month.fields.map((f) => (
                  <div key={f.field} className="flex items-baseline justify-between gap-3">
                    <span className="text-muted-foreground text-xs">{f.field}</span>
                    <span
                      className={cn(
                        "text-right text-sm font-medium tabular-nums",
                        f.field === "Faturamento" && "text-base font-semibold"
                      )}
                    >
                      {f.value}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
