import type { SheetTable } from "@/lib/google-sheets"

/**
 * Renderiza abas que não são uma tabela tradicional, mas um resumo em duas
 * colunas (ex.: "Critério" / "Valor"). Usa `table.raw` diretamente — cada
 * linha com conteúdo na primeira célula vira um par chave/valor.
 */
export function SheetKeyValueCard({ table }: { table: SheetTable }) {
  const pairs = table.raw.filter((row) => row[0]?.trim())

  if (pairs.length === 0) {
    return (
      <p className="text-muted-foreground p-6 text-sm">
        Nenhum dado encontrado nesta aba.
      </p>
    )
  }

  return (
    <div className="divide-y rounded-md border">
      {pairs.map((row, i) => (
        <div key={i} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-start sm:gap-4">
          <span className="text-muted-foreground min-w-48 shrink-0 text-xs font-medium sm:text-sm">
            {row[0]}
          </span>
          <span className="text-sm whitespace-pre-wrap">
            {row.slice(1).filter(Boolean).join(" — ") || "—"}
          </span>
        </div>
      ))}
    </div>
  )
}
