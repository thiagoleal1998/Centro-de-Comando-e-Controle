import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { statusTone } from "@/lib/sheets-badge"
import type { SheetTable } from "@/lib/google-sheets"

export function SheetSummary({
  table,
  column,
}: {
  table: SheetTable
  column: string
}) {
  const counts = new Map<string, number>()
  for (const row of table.rows) {
    const value = row[column]?.trim()
    if (!value) continue
    counts.set(value, (counts.get(value) ?? 0) + 1)
  }

  const entries = [...counts.entries()].sort((a, b) => b[1] - a[1])
  if (entries.length === 0) return null

  return (
    <Card>
      <CardContent className="flex flex-wrap items-center gap-2 py-4">
        <span className="text-sm font-medium">{table.rows.length} no total</span>
        <span className="text-muted-foreground">·</span>
        {entries.map(([value, count]) => (
          <Badge key={value} variant={statusTone(value)} className="gap-1.5 font-normal">
            {value}
            <span className="opacity-70">{count}</span>
          </Badge>
        ))}
      </CardContent>
    </Card>
  )
}
