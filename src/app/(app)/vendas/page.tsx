import Link from "next/link"
import { ExternalLink } from "lucide-react"

import {
  VENDAS_BRUTAS_SHEET,
  VENDAS_ENV_VAR,
  VENDAS_MONTHS_BY_YEAR,
  VENDAS_SHEETS,
} from "@/lib/sales-sheet-config"
import { loadSheetGroup } from "@/lib/sheets-source"
import { VendasNestedTabs } from "@/components/sheets/vendas-nested-tabs"

export const dynamic = "force-dynamic"

export default async function VendasPage() {
  const result = await loadSheetGroup(
    VENDAS_ENV_VAR,
    VENDAS_SHEETS.map((s) => s.name)
  )

  const spreadsheetId = process.env[VENDAS_ENV_VAR]

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Vendas</h1>
          <p className="text-muted-foreground text-sm">
            Vendas brutas e detalhe mensal — sincronizado ao vivo com a planilha do JT Group.
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

      <VendasNestedTabs
        vendasBrutas={VENDAS_BRUTAS_SHEET}
        monthsByYear={VENDAS_MONTHS_BY_YEAR}
        result={result}
      />
    </div>
  )
}
