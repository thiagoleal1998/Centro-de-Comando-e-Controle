import { AlertTriangle } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SheetRawGrid } from "@/components/sheets/sheet-raw-grid"
import type { SheetGroupResult } from "@/lib/sheets-source"
import type { SalesSheet } from "@/lib/sales-sheet-config"

export function SheetGroupTabs({
  sheets,
  result,
}: {
  sheets: SalesSheet[]
  result: SheetGroupResult
}) {
  if (!result.ok) {
    return (
      <Card className="border-destructive/50">
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
          <AlertTriangle className="text-destructive size-8" />
          <p className="text-sm font-medium">Não foi possível carregar a planilha</p>
          <p className="text-muted-foreground max-w-md text-sm">{result.error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Tabs defaultValue={sheets[0]?.name}>
      <TabsList className="h-auto flex-wrap">
        {sheets.map((sheet) => (
          <TabsTrigger key={sheet.name} value={sheet.name}>
            {sheet.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {sheets.map((sheet) => (
        <TabsContent key={sheet.name} value={sheet.name} className="pt-4">
          <SheetRawGrid table={result.tables[sheet.name]} />
        </TabsContent>
      ))}
    </Tabs>
  )
}
