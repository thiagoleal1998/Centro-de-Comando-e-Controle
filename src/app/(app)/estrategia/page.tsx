import Link from "next/link"
import { ExternalLink } from "lucide-react"

import { ESTRATEGIA_SHEETS, VENDAS_ENV_VAR } from "@/lib/sales-sheet-config"
import { loadSheetGroup } from "@/lib/sheets-source"
import { createClient } from "@/lib/supabase/server"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SheetGroupTabs } from "@/components/sheets/sheet-group-tabs"
import { StrategyPlansList } from "@/components/strategy/strategy-plans-list"
import type { StrategyPlan } from "@/types/domain"

export const dynamic = "force-dynamic"

export default async function EstrategiaPage() {
  const supabase = await createClient()

  const [sheetResult, { data: plans }] = await Promise.all([
    loadSheetGroup(
      VENDAS_ENV_VAR,
      ESTRATEGIA_SHEETS.map((s) => s.name)
    ),
    supabase.from("strategy_plans").select("*").order("created_at", { ascending: false }),
  ])

  const spreadsheetId = process.env[VENDAS_ENV_VAR]

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Estratégia</h1>
        <p className="text-muted-foreground text-sm">
          Planos de projeção próprios do sistema e dados da planilha do JT Group.
        </p>
      </div>

      <Tabs defaultValue="planos">
        <TabsList className="h-auto flex-wrap">
          <TabsTrigger value="planos">Planos</TabsTrigger>
          <TabsTrigger value="planilha">Planilha JT</TabsTrigger>
        </TabsList>

        <TabsContent value="planos" className="pt-4">
          <StrategyPlansList plans={(plans as StrategyPlan[]) ?? []} />
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
          <SheetGroupTabs sheets={ESTRATEGIA_SHEETS} result={sheetResult} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
