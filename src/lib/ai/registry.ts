import type { ImageProvider } from "./provider.interface"
import { KairogenProvider } from "./providers/kairogen"

let imageProvider: ImageProvider | null = null

export function getImageProvider(): ImageProvider {
  if (!imageProvider) {
    imageProvider = new KairogenProvider()
  }
  return imageProvider
}

// Nenhum provider de texto ativo por decisão do usuário: só provedores sem
// custo são aceitáveis aqui. Quando um for definido, implementar seguindo o
// mesmo padrão de getImageProvider() acima.
