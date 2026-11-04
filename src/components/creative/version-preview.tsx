import { AlertTriangle } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { EmptyState } from "@/components/layout/empty-state"
import type { CreativeStatus, CreativeVersion } from "@/types/domain"

export function VersionPreview({
  status,
  version,
  errorMessage,
}: {
  status: CreativeStatus
  version: CreativeVersion | null
  errorMessage: string | null
}) {
  if (status === "FAILED" && !version) {
    return (
      <Card className="border-destructive/50">
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
          <AlertTriangle className="text-destructive size-8" />
          <p className="text-sm font-medium">Não foi possível gerar este criativo</p>
          <p className="text-muted-foreground max-w-sm text-sm">
            {errorMessage ?? "Erro desconhecido."}
          </p>
        </CardContent>
      </Card>
    )
  }

  if (!version) {
    return (
      <Card className="border-dashed">
        <EmptyState title="Nenhum preview disponível ainda." className="py-12" />
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="py-6">
        {version.content.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- URL externa (Kairogen), fora da allowlist de next/image.
          <img
            src={version.content.imageUrl}
            alt="Imagem gerada"
            className="mx-auto max-h-[480px] rounded-lg object-contain"
          />
        ) : version.content.text ? (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {version.content.text}
          </p>
        ) : (
          <p className="text-muted-foreground text-sm">
            Esta versão não tem conteúdo de preview.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
