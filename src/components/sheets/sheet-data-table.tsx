"use client"

import * as React from "react"
import { Search } from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { statusTone, isWithinHours } from "@/lib/sheets-badge"
import type { SheetTable } from "@/lib/google-sheets"

export function SheetDataTable({
  table,
  priorityColumns,
  statusColumns = [],
  newBadgeColumn,
  reverseOrder = false,
}: {
  table: SheetTable
  priorityColumns: string[]
  statusColumns?: string[]
  /** Nome da coluna de data usada para marcar a linha como "Novo" por 24h. */
  newBadgeColumn?: string
  /** Mostra as últimas linhas primeiro (a planilha vem mais antigo primeiro). */
  reverseOrder?: boolean
}) {
  const [query, setQuery] = React.useState("")
  const [selectedRow, setSelectedRow] = React.useState<Record<string, string> | null>(
    null
  )

  const columns = priorityColumns.filter((c) => table.headers.includes(c))
  const displayColumns = columns.length > 0 ? columns : table.headers.slice(0, 6)

  const orderedRows = React.useMemo(
    () => (reverseOrder ? [...table.rows].reverse() : table.rows),
    [table.rows, reverseOrder]
  )

  const filteredRows = React.useMemo(() => {
    if (!query.trim()) return orderedRows
    const q = query.trim().toLowerCase()
    return orderedRows.filter((row) =>
      displayColumns.some((col) => row[col]?.toLowerCase().includes(q))
    )
  }, [orderedRows, query, displayColumns])

  if (table.rows.length === 0) {
    return (
      <p className="text-muted-foreground p-6 text-sm">
        Nenhum dado encontrado nesta aba.
      </p>
    )
  }

  return (
    <>
      <div className="relative mb-3 max-w-xs">
        <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
        <Input
          placeholder="Buscar..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-8"
        />
      </div>

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {displayColumns.map((col) => (
                <TableHead key={col} className="whitespace-nowrap">
                  {col}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRows.map((row, i) => (
              <TableRow
                key={i}
                className="cursor-pointer"
                onClick={() => setSelectedRow(row)}
              >
                {displayColumns.map((col, colIndex) => (
                  <TableCell key={col} className="max-w-64 truncate" title={row[col]}>
                    <span className="inline-flex items-center gap-1.5">
                      {statusColumns.includes(col) && row[col] ? (
                        <Badge variant={statusTone(row[col])} className="font-normal">
                          {row[col]}
                        </Badge>
                      ) : (
                        row[col] || "—"
                      )}
                      {colIndex === 0 &&
                      newBadgeColumn &&
                      isWithinHours(row[newBadgeColumn]) ? (
                        <Badge className="bg-emerald-600 font-normal text-white dark:bg-emerald-500">
                          Novo
                        </Badge>
                      ) : null}
                    </span>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <p className="text-muted-foreground px-1 pt-2 text-xs">
        {filteredRows.length} de {table.rows.length} linha(s). Clique numa linha para ver
        todos os campos.
      </p>

      <Dialog
        open={!!selectedRow}
        onOpenChange={(open) => !open && setSelectedRow(null)}
      >
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Detalhes
              {newBadgeColumn && selectedRow && isWithinHours(selectedRow[newBadgeColumn]) ? (
                <Badge className="bg-emerald-600 font-normal text-white dark:bg-emerald-500">
                  Novo
                </Badge>
              ) : null}
            </DialogTitle>
          </DialogHeader>
          <dl className="flex flex-col gap-3">
            {selectedRow &&
              table.headers.map((header) =>
                selectedRow[header] ? (
                  <div key={header} className="flex flex-col gap-0.5">
                    <dt className="text-muted-foreground text-xs font-medium">
                      {header}
                    </dt>
                    <dd className="text-sm whitespace-pre-wrap">
                      {statusColumns.includes(header) ? (
                        <Badge
                          variant={statusTone(selectedRow[header])}
                          className="font-normal"
                        >
                          {selectedRow[header]}
                        </Badge>
                      ) : (
                        selectedRow[header]
                      )}
                    </dd>
                  </div>
                ) : null
              )}
          </dl>
        </DialogContent>
      </Dialog>
    </>
  )
}
