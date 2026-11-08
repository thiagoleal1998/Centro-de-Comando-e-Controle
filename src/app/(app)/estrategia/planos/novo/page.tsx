import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StrategyPlanForm } from "@/components/strategy/strategy-plan-form"
import { createStrategyPlan } from "@/lib/actions/strategy"

export default function NovoPlanoPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Novo plano</h1>
        <p className="text-muted-foreground text-sm">
          Depois de criar, você poderá adicionar as despesas mensais do cenário.
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-base">Dados do plano</CardTitle>
        </CardHeader>
        <CardContent>
          <StrategyPlanForm action={createStrategyPlan} submitLabel="Criar plano" />
        </CardContent>
      </Card>
    </div>
  )
}
