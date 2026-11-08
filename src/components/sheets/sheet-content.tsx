import { AlertTriangle } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { SheetSmartTable } from "@/components/sheets/sheet-smart-table"
import { ProjecaoCards } from "@/components/sheets/projecao-cards"
import { VendasBrutasChart } from "@/components/sheets/vendas-brutas-chart"
import { MonthSalesDashboard } from "@/components/sheets/month-sales-dashboard"
import type { SalesSheet } from "@/lib/sales-sheet-config"
import type { SheetTable } from "@/lib/google-sheets"

export function SheetContent({ sheet, table }: { sheet: SalesSheet; table: SheetTable }) {
  switch (sheet.render) {
    case "cards":
      return <ProjecaoCards table={table} />
    case "chart":
      return <VendasBrutasChart table={table} />
    case "month-dashboard":
      return <MonthSalesDashboard table={table} />
    default:
      return <SheetSmartTable table={table} />
  }
}

export function SheetLoadError({ message }: { message: string }) {
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
