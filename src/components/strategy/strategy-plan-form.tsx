"use client"

import { useActionState } from "react"
import { Loader2 } from "lucide-react"

import type { ActionState } from "@/lib/actions/strategy"
import type { StrategyPlan } from "@/types/domain"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export function StrategyPlanForm({
  action,
  plan,
  submitLabel,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>
  plan?: StrategyPlan
  submitLabel: string
}) {
  const [state, formAction, pending] = useActionState(action, undefined)

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Nome do plano</Label>
        <Input
          id="name"
          name="name"
          required
          defaultValue={plan?.name}
          placeholder="Ex.: Transição MEI → Simples Nacional"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">Contexto / descrição (opcional)</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={plan?.description ?? ""}
          placeholder="Descreva o cenário: o que muda, a partir de quando, por quê."
          rows={4}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="targetProfit">Lucro desejado por mês (R$)</Label>
          <Input
            id="targetProfit"
            name="targetProfit"
            type="number"
            step="0.01"
            min="0"
            defaultValue={plan?.target_profit ?? ""}
            placeholder="20000"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="targetMarginPct">Rentabilidade (% do faturamento)</Label>
          <Input
            id="targetMarginPct"
            name="targetMarginPct"
            type="number"
            step="0.01"
            min="0"
            max="100"
            defaultValue={plan?.target_margin_pct ?? ""}
            placeholder="10"
          />
        </div>
      </div>
      <p className="text-muted-foreground -mt-3 text-xs">
        Faturamento necessário = lucro desejado ÷ rentabilidade. Ex.: lucrar R$ 20.000 com 10% de
        rentabilidade exige R$ 200.000 de faturamento. Sem rentabilidade informada, usa despesas +
        lucro desejado como aproximação.
      </p>

      {state?.error ? <p className="text-destructive text-sm">{state.error}</p> : null}

      <div>
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2 className="animate-spin" /> : null}
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
