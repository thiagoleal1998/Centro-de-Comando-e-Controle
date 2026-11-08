"use client"

import { useActionState } from "react"
import { Loader2, Plus } from "lucide-react"

import type { ActionState } from "@/lib/actions/strategy"
import type { StrategyPlanExpense } from "@/types/domain"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function StrategyExpenseForm({
  action,
  expense,
  idPrefix = "",
  submitLabel = "Adicionar",
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>
  expense?: StrategyPlanExpense
  idPrefix?: string
  submitLabel?: string
}) {
  const [state, formAction, pending] = useActionState(action, undefined)

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <div className="flex min-w-48 flex-1 flex-col gap-1.5">
        <Label htmlFor={`${idPrefix}name`}>Despesa</Label>
        <Input
          id={`${idPrefix}name`}
          name="name"
          required
          defaultValue={expense?.name}
          placeholder="Ex.: DAS Simples Nacional, Contador, Imposto sobre faturamento"
        />
      </div>

      <div className="flex w-40 flex-col gap-1.5">
        <Label htmlFor={`${idPrefix}monthlyAmount`}>Valor mensal (R$)</Label>
        <Input
          id={`${idPrefix}monthlyAmount`}
          name="monthlyAmount"
          type="number"
          min="0"
          step="0.01"
          required
          defaultValue={expense?.monthly_amount ?? "0"}
        />
      </div>

      <div className="flex min-w-40 flex-1 flex-col gap-1.5">
        <Label htmlFor={`${idPrefix}notes`}>Observação (opcional)</Label>
        <Input
          id={`${idPrefix}notes`}
          name="notes"
          defaultValue={expense?.notes ?? ""}
          placeholder="Ex.: estimado, pode variar"
        />
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? <Loader2 className="animate-spin" /> : <Plus />}
        {submitLabel}
      </Button>

      {state?.error ? <p className="text-destructive w-full text-sm">{state.error}</p> : null}
    </form>
  )
}
