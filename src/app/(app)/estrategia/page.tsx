import Link from "next/link"
import { ExternalLink } from "lucide-react"

import { ESTRATEGIA_SHEETS, VENDAS_ENV_VAR } from "@/lib/sales-sheet-config"
import { loadSheetGroup } from "@/lib/sheets-source"
import { SheetGroupTabs } from "@/components/sheets/sheet-group-tabs"

export const dynamic = "force-dynamic"

export default async function EstrategiaPage() {
  const result = await loadSheetGroup(
    VENDAS_ENV_VAR,
    ESTRATEGIA_SHEETS.map((s) => s.name)
  )

  const spreadsheetId = process.env[VENDAS_ENV_VAR]

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Estratégia</h1>
          <p className="text-muted-foreground text-sm">
            Projeção de crescimento e metas — sincronizado ao vivo com a planilha do JT Group.
          </p>
        </div>
        {spreadsheetId ? (
          <Link
            href={`https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`}
            target="_blank"
            className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-sm"
          >
            Abrir planilha <ExternalLink className="size-3.5" />
          </Link>
        ) : null}
      </div>

      <SheetGroupTabs sheets={ESTRATEGIA_SHEETS} result={result} />
    </div>
  )
}
