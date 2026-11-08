import Link from "next/link"
import { ExternalLink } from "lucide-react"

import {
  VENDAS_BRUTAS_SHEET,
  VENDAS_ENV_VAR,
  VENDAS_MONTHS_BY_YEAR,
  VENDAS_SHEETS,
} from "@/lib/sales-sheet-config"
import { loadSheetGroup } from "@/lib/sheets-source"
import { createClient } from "@/lib/supabase/server"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VendasNestedTabs } from "@/components/sheets/vendas-nested-tabs"
import { SalesMonthsList } from "@/components/sales/sales-months-list"
import type { SalesMonth } from "@/types/domain"

export const dynamic = "force-dynamic"

export default async function VendasPage() {
  const supabase = await createClient()

  const [sheetResult, { data: salesMonths }] = await Promise.all([
    loadSheetGroup(
      VENDAS_ENV_VAR,
      VENDAS_SHEETS.map((s) => s.name)
    ),
    supabase
      .from("sales_months")
      .select("*")
      .order("year", { ascending: false })
      .order("month", { ascending: false }),
  ])

  const spreadsheetId = process.env[VENDAS_ENV_VAR]

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Vendas</h1>
        <p className="text-muted-foreground text-sm">
          Dados da planilha do JT Group e lançamentos manuais próprios do sistema.
        </p>
      </div>

      <Tabs defaultValue="lancamentos">
        <TabsList className="h-auto flex-wrap">
          <TabsTrigger value="lancamentos">Lançamentos</TabsTrigger>
          <TabsTrigger value="planilha">Planilha JT</TabsTrigger>
        </TabsList>

        <TabsContent value="lancamentos" className="pt-4">
          <SalesMonthsList months={(salesMonths as SalesMonth[]) ?? []} />
        </TabsContent>

        <TabsContent value="planilha" className="flex flex-col gap-4 pt-4">
          {spreadsheetId ? (
            <div className="flex justify-end">
              <Link
                href={`https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`}
                target="_blank"
                className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-sm"
              >
                Abrir planilha <ExternalLink className="size-3.5" />
              </Link>
            </div>
          ) : null}
          <VendasNestedTabs
            vendasBrutas={VENDAS_BRUTAS_SHEET}
            monthsByYear={VENDAS_MONTHS_BY_YEAR}
            result={sheetResult}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
