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
import { Input } from "@/components/ui/input"
import type { SheetTable } from "@/lib/google-sheets"

const MAX_COLUMNS = 40
const MAX_ROWS = 300

function columnLetter(index: number): string {
  let n = index
  let letters = ""
  do {
    letters = String.fromCharCode(65 + (n % 26)) + letters
    n = Math.floor(n / 26) - 1
  } while (n >= 0)
  return letters
}

/**
 * Espelha a aba como uma grade bruta (letras de coluna + número de linha,
 * como no Google Sheets), em vez de tentar mapear colunas com significado —
 * várias abas desta planilha têm cabeçalhos em duas linhas e blocos
 * mesclados, o que quebraria uma tabela com header fixo.
 */
export function SheetRawGrid({ table }: { table: SheetTable }) {
  const [query, setQuery] = React.useState("")

  const colCount = Math.min(
    MAX_COLUMNS,
    table.raw.reduce((max, row) => Math.max(max, row.length), 0)
  )
  const rows = table.raw
    .slice(0, MAX_ROWS)
    .map((cells, index) => ({ cells, rowNumber: index + 1 }))

  const filteredRows = React.useMemo(() => {
    if (!query.trim()) return rows
    const q = query.trim().toLowerCase()
    return rows.filter(({ cells }) => cells.some((cell) => cell?.toLowerCase().includes(q)))
  }, [rows, query])

  if (table.raw.length === 0 || colCount === 0) {
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
              <TableHead className="bg-muted/50 text-muted-foreground w-10 text-center text-xs">
                #
              </TableHead>
              {Array.from({ length: colCount }, (_, i) => (
                <TableHead
                  key={i}
                  className="bg-muted/50 text-muted-foreground text-center text-xs whitespace-nowrap"
                >
                  {columnLetter(i)}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRows.map(({ cells, rowNumber }) => (
              <TableRow key={rowNumber}>
                <TableCell className="text-muted-foreground bg-muted/30 text-center text-xs">
                  {rowNumber}
                </TableCell>
                {Array.from({ length: colCount }, (_, colIndex) => (
                  <TableCell
                    key={colIndex}
                    className="max-w-48 truncate text-sm"
                    title={cells[colIndex]}
                  >
                    {cells[colIndex] || ""}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <p className="text-muted-foreground px-1 pt-2 text-xs">
        {filteredRows.length} de {rows.length} linha(s)
        {table.raw.length > MAX_ROWS ? ` (mostrando as primeiras ${MAX_ROWS})` : ""}
        {colCount < table.raw.reduce((max, row) => Math.max(max, row.length), 0)
          ? ` — mostrando as primeiras ${MAX_COLUMNS} colunas`
          : ""}
        . Abra a planilha original para ver tudo ou editar.
      </p>
    </>
  )
}
