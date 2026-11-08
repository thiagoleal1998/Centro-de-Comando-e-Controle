"use client"

import { useActionState } from "react"
import { Loader2, Plus } from "lucide-react"

import type { ActionState } from "@/lib/actions/strategy"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function StrategyProfitSplitForm({
  action,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>
}) {
  const [state, formAction, pending] = useActionState(action, undefined)

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <div className="flex min-w-48 flex-1 flex-col gap-1.5">
        <Label htmlFor="splitName">Sócio / empresa</Label>
        <Input id="splitName" name="name" required placeholder="Ex.: Thiago, Jonas, Empresa" />
      </div>

      <div className="flex w-32 flex-col gap-1.5">
        <Label htmlFor="percentage">Percentual (%)</Label>
        <Input
          id="percentage"
          name="percentage"
          type="number"
          min="0"
          max="100"
          step="0.01"
          required
          defaultValue="0"
        />
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? <Loader2 className="animate-spin" /> : <Plus />}
        Adicionar
      </Button>

      {state?.error ? <p className="text-destructive w-full text-sm">{state.error}</p> : null}
    </form>
  )
}
