import { z } from "zod"

export const channelOptions = [
  { value: "mercado_livre", label: "Mercado Livre" },
  { value: "meta_ads", label: "Meta Ads / COD" },
] as const

export const projectStatusOptions = [
  { value: "ACTIVE", label: "Ativo" },
  { value: "PAUSED", label: "Pausado" },
  { value: "ARCHIVED", label: "Arquivado" },
] as const

export const projectSchema = z.object({
  name: z.string().trim().min(2, "Informe um nome com pelo menos 2 caracteres."),
  channel: z.enum(["mercado_livre", "meta_ads"], {
    message: "Selecione um canal.",
  }),
  objective: z.string().trim().max(2000).optional().or(z.literal("")),
  notes: z.string().trim().max(4000).optional().or(z.literal("")),
})

export const projectUpdateSchema = projectSchema.extend({
  status: z.enum(["ACTIVE", "PAUSED", "ARCHIVED"]),
})

export type ProjectInput = z.infer<typeof projectSchema>
export type ProjectUpdateInput = z.infer<typeof projectUpdateSchema>
