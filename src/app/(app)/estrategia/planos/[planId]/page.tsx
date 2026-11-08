import { notFound } from "next/navigation"
import { Pencil } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { createStrategyExpense, updateStrategyPlan } from "@/lib/actions/strategy"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { StrategyExpenseForm } from "@/components/strategy/strategy-expense-form"
import { StrategyPlanForm } from "@/components/strategy/strategy-plan-form"
import { StrategyPlanDashboard } from "@/components/strategy/strategy-plan-dashboard"
import { DeleteStrategyPlanButton } from "@/components/strategy/delete-strategy-plan-button"
import type { StrategyPlan, StrategyPlanExpense } from "@/types/domain"

export const dynamic = "force-dynamic"

export default async function PlanoDetalhePage({
  params,
}: {
  params: Promise<{ planId: string }>
}) {
  const { planId } = await params
  const supabase = await createClient()

  const { data: plan } = await supabase
    .from("strategy_plans")
    .select("*")
    .eq("id", planId)
    .maybeSingle()

  if (!plan) {
    notFound()
  }

  const { data: expenses } = await supabase
    .from("strategy_plan_expenses")
    .select("*")
    .eq("plan_id", planId)
    .order("created_at", { ascending: true })

  const typedPlan = plan as StrategyPlan
  const boundUpdate = updateStrategyPlan.bind(null, typedPlan.id)
  const boundCreateExpense = createStrategyExpense.bind(null, typedPlan.id)

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">{typedPlan.name}</h1>
          {typedPlan.description ? (
            <p className="text-muted-foreground max-w-2xl text-sm whitespace-pre-wrap">
              {typedPlan.description}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Dialog>
            <DialogTrigger
              render={
                <Button variant="outline" size="sm">
                  <Pencil /> Editar plano
                </Button>
              }
            />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editar {typedPlan.name}</DialogTitle>
              </DialogHeader>
              <StrategyPlanForm
                action={boundUpdate}
                plan={typedPlan}
                submitLabel="Salvar alterações"
              />
            </DialogContent>
          </Dialog>
          <DeleteStrategyPlanButton planId={typedPlan.id} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Adicionar despesa mensal</CardTitle>
        </CardHeader>
        <CardContent>
          <StrategyExpenseForm action={boundCreateExpense} />
        </CardContent>
      </Card>

      <StrategyPlanDashboard
        plan={typedPlan}
        expenses={(expenses as StrategyPlanExpense[]) ?? []}
      />
    </div>
  )
}
