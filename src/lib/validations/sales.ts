import { z } from "zod"

const MONTH_NAMES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
]

export function monthName(month: number): string {
  return MONTH_NAMES[month - 1] ?? String(month)
}

function optionalNumber(message: string) {
  return z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v.replace(",", ".") : undefined))
    .refine((v) => v === undefined || Number.isFinite(Number(v)), message)
}

export const salesMonthSchema = z.object({
  year: z.coerce.number().int().min(2020).max(2100),
  month: z.coerce.number().int().min(1).max(12),
  metaFaturamento: optionalNumber("Meta de faturamento inválida."),
  superMetaFaturamento: optionalNumber("Super meta inválida."),
  despesasPrevistas: optionalNumber("Despesas previstas inválidas."),
  margemPrevistaPct: optionalNumber("Margem prevista inválida."),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
})

export type SalesMonthInput = z.infer<typeof salesMonthSchema>

export const salesEntrySchema = z.object({
  productId: z.string().uuid("Selecione um produto."),
  day: z.coerce.number().int().min(1, "Dia inválido.").max(31, "Dia inválido."),
  units: z.coerce.number().int().min(0, "Unidades não pode ser negativo."),
  revenue: z.coerce.number().min(0, "Faturamento não pode ser negativo."),
})

export type SalesEntryInput = z.infer<typeof salesEntrySchema>
