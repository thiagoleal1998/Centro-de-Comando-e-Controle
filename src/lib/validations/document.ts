import { z } from "zod"

export const documentLinkSchema = z.object({
  name: z.string().trim().min(2, "Informe um nome com pelo menos 2 caracteres."),
  url: z.string().trim().url("Informe um link válido (começando com http:// ou https://)."),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
})

export type DocumentLinkInput = z.infer<typeof documentLinkSchema>
