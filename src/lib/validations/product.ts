import { z } from "zod"

export const productSchema = z.object({
  name: z.string().trim().min(2, "Informe um nome com pelo menos 2 caracteres."),
  description: z.string().trim().max(4000).optional().or(z.literal("")),
  features: z.string().trim().max(4000).optional().or(z.literal("")),
  benefits: z.string().trim().max(4000).optional().or(z.literal("")),
  price: z.string().trim().optional().or(z.literal("")),
  specs: z.string().trim().max(4000).optional().or(z.literal("")),
})

export type ProductInput = z.infer<typeof productSchema>

export function parseList(value: string | undefined): string[] {
  if (!value) return []
  return value
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)
}

export function formatList(value: string[] | null | undefined): string {
  return (value ?? []).join("\n")
}
