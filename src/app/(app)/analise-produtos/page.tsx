import { AlertTriangle } from "lucide-react"

import { fetchSheetTables, type SheetTable } from "@/lib/google-sheets"
import {
  SHEET_LABELS,
  SHEET_NAMES,
  SHEET_NEW_BADGE_COLUMN,
  SHEET_PRIORITY_COLUMNS,
  SHEET_REVERSE_ORDER,
  SHEET_STATUS_COLUMNS,
  SHEET_SUMMARY_COLUMN,
} from "@/lib/sheets-config"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SheetDataTable } from "@/components/sheets/sheet-data-table"
import { SheetSummary } from "@/components/sheets/sheet-summary"
import {
  ViabilityCalculator,
  type ViabilityProductOption,
} from "@/components/sheets/viability-calculator"

export const dynamic = "force-dynamic"

function parseBrNumber(value: string | undefined): number {
  if (!value) return 0
  const parsed = Number(value.replace(/\./g, "").replace(",", "."))
  return Number.isFinite(parsed) ? parsed : 0
}

function buildProductOptions(tables: Record<string, SheetTable>): ViabilityProductOption[] {
  const options: ViabilityProductOption[] = []

  for (const row of tables.Radar?.rows ?? []) {
    const label = row["Produto normalizado"]?.trim()
    if (!label) continue
    options.push({
      id: `radar-${row["ID"]}`,
      label,
      unitCost: parseBrNumber(row["Custo unitario"]),
    })
  }

  for (const row of tables.Analises?.rows ?? []) {
    const label = row["Produto"]?.trim()
    if (!label) continue
    options.push({
      id: `analises-${row["ID"]}`,
      label,
      unitCost: parseBrNumber(row["Custo unitario"]),
    })
  }

  return options
}

export default async function AnaliseProdutosPage() {
  let tables: Record<string, SheetTable> | null = null
  let error: string | null = null

  try {
    tables = await fetchSheetTables([...SHEET_NAMES])
  } catch (err) {
    error = err instanceof Error ? err.message : "Erro desconhecido."
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Análise de Produtos</h1>
        <p className="text-muted-foreground text-sm">
          Esteira de mineração de produtos — sincronizado ao vivo com a planilha do JT Group.
        </p>
      </div>

      {error ? (
        <Card className="border-destructive/50">
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <AlertTriangle className="text-destructive size-8" />
            <p className="text-sm font-medium">Não foi possível carregar a planilha</p>
            <p className="text-muted-foreground max-w-md text-sm">{error}</p>
          </CardContent>
        </Card>
      ) : tables ? (
        <Tabs defaultValue="Viabilidade">
          <TabsList className="h-auto flex-wrap">
            <TabsTrigger value="Viabilidade">Viabilidade</TabsTrigger>
            {SHEET_NAMES.map((name) => (
              <TabsTrigger key={name} value={name}>
                {SHEET_LABELS[name]}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="Viabilidade" className="pt-4">
            <ViabilityCalculator products={buildProductOptions(tables)} />
          </TabsContent>
          {SHEET_NAMES.map((name) => (
            <TabsContent key={name} value={name} className="flex flex-col gap-4 pt-4">
              {SHEET_SUMMARY_COLUMN[name] ? (
                <SheetSummary table={tables![name]} column={SHEET_SUMMARY_COLUMN[name]} />
              ) : null}
              <SheetDataTable
                table={tables![name]}
                priorityColumns={SHEET_PRIORITY_COLUMNS[name] ?? []}
                statusColumns={SHEET_STATUS_COLUMNS[name] ?? []}
                newBadgeColumn={SHEET_NEW_BADGE_COLUMN[name]}
                reverseOrder={SHEET_REVERSE_ORDER.has(name)}
              />
            </TabsContent>
          ))}
        </Tabs>
      ) : null}
    </div>
  )
}
