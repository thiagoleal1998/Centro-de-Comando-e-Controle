import { z } from "zod"

export const creativeTypeOptions = [
  { value: "copy", label: "Copy / Texto" },
  { value: "image", label: "Imagem" },
  { value: "video", label: "Vídeo" },
  { value: "full_ad", label: "Anúncio completo" },
] as const

export const creativeStatusOptions = [
  { value: "DRAFT", label: "Rascunho" },
  { value: "GENERATING", label: "Gerando" },
  { value: "PREVIEW", label: "Em preview" },
  { value: "NEEDS_REVISION", label: "Precisa de ajuste" },
  { value: "APPROVED", label: "Aprovado" },
  { value: "EXPORTED", label: "Exportado" },
  { value: "FAILED", label: "Falhou" },
] as const

export const newCreativeSchema = z.object({
  type: z.enum(["copy", "image", "video", "full_ad"], {
    message: "Selecione um tipo de criativo.",
  }),
  instruction: z
    .string()
    .trim()
    .min(5, "Descreva o que você quer criar (pelo menos 5 caracteres)."),
})

export const revisionSchema = z.object({
  instruction: z
    .string()
    .trim()
    .min(3, "Descreva o que deve mudar (pelo menos 3 caracteres)."),
})
