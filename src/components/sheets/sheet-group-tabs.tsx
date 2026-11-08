import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SheetContent, SheetLoadError } from "@/components/sheets/sheet-content"
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
    return <SheetLoadError message={result.error} />
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
          <SheetContent sheet={sheet} table={result.tables[sheet.name]} />
        </TabsContent>
      ))}
    </Tabs>
  )
}
