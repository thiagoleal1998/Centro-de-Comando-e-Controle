import { AlertTriangle } from "lucide-react"

import type { SheetTable } from "@/lib/google-sheets"
import { SHEET_SOURCES, type SheetSourceConfig } from "@/lib/sheets-config"
import { loadSheetGroup, type SheetGroupResult } from "@/lib/sheets-source"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SheetDataTable } from "@/components/sheets/sheet-data-table"
import { SheetKeyValueCard } from "@/components/sheets/sheet-key-value-card"
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

function SourceError({ message }: { message: string }) {
  return (
    <Card className="border-destructive/50">
      <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
        <AlertTriangle className="text-destructive size-8" />
        <p className="text-sm font-medium">Não foi possível carregar a planilha</p>
        <p className="text-muted-foreground max-w-md text-sm">{message}</p>
      </CardContent>
    </Card>
  )
}

function SourceTabs({
  config,
  result,
}: {
  config: SheetSourceConfig
  result: SheetGroupResult
}) {
  if (!result.ok) {
    return <SourceError message={result.error} />
  }

  const tables = result.tables

  return (
    <Tabs defaultValue={config.sheetOrder[0]}>
      <TabsList className="h-auto flex-wrap">
        {config.sheetOrder.map((name) => (
          <TabsTrigger key={name} value={name}>
            {config.labels[name] ?? name}
          </TabsTrigger>
        ))}
      </TabsList>
      {config.sheetOrder.map((name) => (
        <TabsContent key={name} value={name} className="flex flex-col gap-4 pt-4">
          {config.summaryColumn[name] ? (
            <SheetSummary table={tables[name]} column={config.summaryColumn[name]} />
          ) : null}
          {config.keyValueSheets.has(name) ? (
            <SheetKeyValueCard table={tables[name]} />
          ) : (
            <SheetDataTable
              table={tables[name]}
              priorityColumns={config.priorityColumns[name] ?? []}
              statusColumns={config.statusColumns[name] ?? []}
              newBadgeColumn={config.newBadgeColumn[name]}
              reverseOrder={config.reverseOrder.has(name)}
            />
          )}
        </TabsContent>
      ))}
    </Tabs>
  )
}

export default async function AnaliseProdutosPage() {
  const [esteiraResult, shortlistResult] = await Promise.all([
    loadSheetGroup(SHEET_SOURCES.esteira.envVar, [...SHEET_SOURCES.esteira.sheetOrder]),
    loadSheetGroup(SHEET_SOURCES.shortlist.envVar, [...SHEET_SOURCES.shortlist.sheetOrder]),
  ])

  const viabilityProducts = esteiraResult.ok
    ? buildProductOptions(esteiraResult.tables)
    : []

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Análise de Produtos</h1>
        <p className="text-muted-foreground text-sm">
          Sincronizado ao vivo com as planilhas do JT Group.
        </p>
      </div>

      <Tabs defaultValue="esteira">
        <TabsList className="h-auto flex-wrap">
          <TabsTrigger value="esteira">{SHEET_SOURCES.esteira.label}</TabsTrigger>
          <TabsTrigger value="shortlist">{SHEET_SOURCES.shortlist.label}</TabsTrigger>
          <TabsTrigger value="viabilidade">Viabilidade</TabsTrigger>
        </TabsList>

        <TabsContent value="esteira" className="pt-4">
          <SourceTabs config={SHEET_SOURCES.esteira} result={esteiraResult} />
        </TabsContent>

        <TabsContent value="shortlist" className="pt-4">
          <SourceTabs config={SHEET_SOURCES.shortlist} result={shortlistResult} />
        </TabsContent>

        <TabsContent value="viabilidade" className="pt-4">
          <ViabilityCalculator products={viabilityProducts} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
