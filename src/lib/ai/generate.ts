import { ProviderNotConfiguredError } from "./errors"
import { getImageProvider } from "./registry"
import type { CreativeType } from "@/types/domain"

export { ProviderNotConfiguredError as GenerationNotConfiguredError }

const TYPE_LABELS: Record<CreativeType, string> = {
  copy: "copy",
  image: "imagem",
  video: "vídeo",
  full_ad: "anúncio completo",
}

/**
 * Ponto único de geração chamado pelas actions de criativos. "copy" segue
 * como placeholder — por decisão do usuário, nenhuma API paga (ex.: Anthropic)
 * deve ser usada até que um provider de texto sem custo seja definido.
 */
export async function generateCreativeContent(
  type: CreativeType,
  instruction: string
): Promise<{ text?: string; imageUrl?: string }> {
  if (type === "copy") {
    return {
      text: `[PLACEHOLDER — aguardando definição de um provider de texto sem custo]\n\nCopy gerada a partir da instrução: "${instruction}"`,
    }
  }

  if (type === "image") {
    const provider = getImageProvider()
    const { imageUrl } = await provider.generateImage({ instruction })
    return { imageUrl }
  }

  throw new ProviderNotConfiguredError(
    `Nenhum provider de IA configurado para geração de ${TYPE_LABELS[type]} ainda.`
  )
}
