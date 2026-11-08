import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SheetContent, SheetLoadError } from "@/components/sheets/sheet-content"
import type { SheetGroupResult } from "@/lib/sheets-source"
import type { SalesSheet } from "@/lib/sales-sheet-config"

export function VendasNestedTabs({
  vendasBrutas,
  monthsByYear,
  result,
}: {
  vendasBrutas: SalesSheet
  monthsByYear: Record<string, SalesSheet[]>
  result: SheetGroupResult
}) {
  if (!result.ok) {
    return <SheetLoadError message={result.error} />
  }

  const years = Object.keys(monthsByYear)

  return (
    <Tabs defaultValue={vendasBrutas.name}>
      <TabsList className="h-auto flex-wrap">
        <TabsTrigger value={vendasBrutas.name}>{vendasBrutas.label}</TabsTrigger>
        {years.map((year) => (
          <TabsTrigger key={year} value={year}>
            {year}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value={vendasBrutas.name} className="pt-4">
        <SheetContent sheet={vendasBrutas} table={result.tables[vendasBrutas.name]} />
      </TabsContent>

      {years.map((year) => (
        <TabsContent key={year} value={year} className="pt-4">
          <Tabs defaultValue={monthsByYear[year][0]?.name}>
            <TabsList className="h-auto flex-wrap">
              {monthsByYear[year].map((sheet) => (
                <TabsTrigger key={sheet.name} value={sheet.name}>
                  {sheet.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {monthsByYear[year].map((sheet) => (
              <TabsContent key={sheet.name} value={sheet.name} className="pt-4">
                <SheetContent sheet={sheet} table={result.tables[sheet.name]} />
              </TabsContent>
            ))}
          </Tabs>
        </TabsContent>
      ))}
    </Tabs>
  )
}
