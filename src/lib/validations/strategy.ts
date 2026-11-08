import { z } from "zod"

function optionalNumber(message: string) {
  return z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v.replace(",", ".") : undefined))
    .refine((v) => v === undefined || Number.isFinite(Number(v)), message)
}

export const strategyPlanSchema = z.object({
  name: z.string().trim().min(2, "Informe um nome com pelo menos 2 caracteres."),
  description: z.string().trim().max(4000).optional().or(z.literal("")),
  targetProfit: optionalNumber("Lucro desejado inválido."),
})

export type StrategyPlanInput = z.infer<typeof strategyPlanSchema>

export const strategyExpenseSchema = z.object({
  name: z.string().trim().min(2, "Informe um nome com pelo menos 2 caracteres."),
  monthlyAmount: z.coerce.number().min(0, "Valor não pode ser negativo."),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
})

export type StrategyExpenseInput = z.infer<typeof strategyExpenseSchema>
