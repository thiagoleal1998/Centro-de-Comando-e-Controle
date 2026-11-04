import { Card } from "@/components/ui/card"
import { EmptyState } from "@/components/layout/empty-state"

export default function RhPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">RH</h1>
        <p className="text-muted-foreground text-sm">Área de recursos humanos da operação.</p>
      </div>

      <Card className="border-dashed">
        <EmptyState
          title="Nenhum conteúdo adicionado ainda."
          description="Esta página está pronta para receber o que for preciso aqui."
        />
      </Card>
    </div>
  )
}
