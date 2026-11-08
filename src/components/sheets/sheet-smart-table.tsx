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
import { cn } from "@/lib/utils"
import type { SheetTable } from "@/lib/google-sheets"

const MAX_COLUMNS = 60
const MAX_ROWS = 300
const HEADER_SCAN_ROWS = 10

const CURRENCY_RE = /^-?R\$\s?-?[\d.,]+$/
const PERCENT_RE = /^-?[\d.,]+\s?%$/
const NUMERIC_RE = /^-?[\d.,]+$/

function isNumericish(value: string | undefined): boolean {
  if (!value) return false
  const v = value.trim()
  return CURRENCY_RE.test(v) || PERCENT_RE.test(v) || NUMERIC_RE.test(v)
}

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
 * Tenta renderizar uma aba como uma tabela "de verdade" (header real,
 * colunas vazias escondidas, valores monetários alinhados), detectando a
 * linha de cabeçalho pela que tem mais células preenchidas entre as
 * primeiras ~10 — em vez de assumir que a linha 1 é sempre o header, o que
 * quebra em abas com título solto nas primeiras linhas (comum nesta
 * planilha). Não é perfeito para abas com múltiplos blocos de tabela
 * empilhados, mas já é bem mais legível que espelhar a grade bruta.
 */
export function SheetSmartTable({ table }: { table: SheetTable }) {
  const [query, setQuery] = React.useState("")

  const { headers, dataRows, hiddenColumnCount, hiddenRowCount } = React.useMemo(() => {
    const raw = table.raw
    if (raw.length === 0) return { headers: [], dataRows: [], hiddenColumnCount: 0, hiddenRowCount: 0 }

    let headerRowIndex = 0
    let bestCount = -1
    for (let i = 0; i < Math.min(HEADER_SCAN_ROWS, raw.length); i++) {
      const count = raw[i].filter((c) => c?.trim()).length
      if (count > bestCount) {
        bestCount = count
        headerRowIndex = i
      }
    }

    const headerRow = raw[headerRowIndex]
    const bodyRows = raw.slice(headerRowIndex + 1)
    const totalCols = raw.reduce((max, row) => Math.max(max, row.length), 0)

    const keptCols: number[] = []
    for (let c = 0; c < totalCols; c++) {
      const hasContent =
        headerRow[c]?.trim() || bodyRows.some((row) => row[c]?.trim())
      if (hasContent) keptCols.push(c)
    }

    const visibleCols = keptCols.slice(0, MAX_COLUMNS)
    const headers = visibleCols.map((c) => headerRow[c]?.trim() || `Coluna ${columnLetter(c)}`)

    const nonEmptyBodyRows = bodyRows.filter((row) =>
      visibleCols.some((c) => row[c]?.trim())
    )
    const dataRows = nonEmptyBodyRows.slice(0, MAX_ROWS).map((row) => visibleCols.map((c) => row[c] ?? ""))

    return {
      headers,
      dataRows,
      hiddenColumnCount: keptCols.length - visibleCols.length,
      hiddenRowCount: nonEmptyBodyRows.length - dataRows.length,
    }
  }, [table.raw])

  const filteredRows = React.useMemo(() => {
    if (!query.trim()) return dataRows
    const q = query.trim().toLowerCase()
    return dataRows.filter((row) => row.some((cell) => cell?.toLowerCase().includes(q)))
  }, [dataRows, query])

  if (headers.length === 0 || dataRows.length === 0) {
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
              {headers.map((h, i) => (
                <TableHead key={i} className="whitespace-nowrap">
                  {h}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRows.map((row, i) => (
              <TableRow key={i}>
                {row.map((cell, colIndex) => (
                  <TableCell
                    key={colIndex}
                    className={cn(
                      "max-w-56 truncate text-sm",
                      isNumericish(cell) && "text-right tabular-nums"
                    )}
                    title={cell}
                  >
                    {cell || "—"}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <p className="text-muted-foreground px-1 pt-2 text-xs">
        {filteredRows.length} de {dataRows.length} linha(s)
        {hiddenRowCount > 0 ? ` (+${hiddenRowCount} ocultas)` : ""}
        {hiddenColumnCount > 0 ? `, ${hiddenColumnCount} coluna(s) a mais não mostradas` : ""}
        . Abra a planilha original para ver tudo ou editar.
      </p>
    </>
  )
}
