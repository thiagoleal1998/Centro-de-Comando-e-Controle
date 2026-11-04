import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { EmptyState } from "@/components/layout/empty-state"

export function ModulePlaceholder({
  title,
  description,
  phase,
}: {
  title: string
  description: string
  phase: string
}) {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <Badge variant="secondary">Em desenvolvimento</Badge>
        </div>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>

      <Card className="border-dashed">
        <EmptyState
          title="Este módulo ainda não foi implementado."
          description={`Previsto para a ${phase} do Centro de Comando e Controle.`}
        />
      </Card>
    </div>
  )
}
