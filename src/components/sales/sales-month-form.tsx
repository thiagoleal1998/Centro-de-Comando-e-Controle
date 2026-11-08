"use client"

import { useActionState } from "react"
import { Loader2 } from "lucide-react"

import type { ActionState } from "@/lib/actions/sales"
import { monthName } from "@/lib/validations/sales"
import type { SalesMonth } from "@/types/domain"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const now = new Date()

export function SalesMonthForm({
  action,
  salesMonth,
  submitLabel,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>
  salesMonth?: SalesMonth
  submitLabel: string
}) {
  const [state, formAction, pending] = useActionState(action, undefined)

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="month">Mês</Label>
          <Select name="month" defaultValue={String(salesMonth?.month ?? now.getMonth() + 1)}>
            <SelectTrigger id="month" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <SelectItem key={m} value={String(m)}>
                  {monthName(m)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="year">Ano</Label>
          <Input
            id="year"
            name="year"
            type="number"
            required
            defaultValue={salesMonth?.year ?? now.getFullYear()}
          />
        </div>
      </div>

      <p className="text-muted-foreground text-xs">
        As metas abaixo são opcionais — preencha o que fizer sentido, o resto fica em branco.
      </p>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="metaFaturamento">Meta de faturamento (R$)</Label>
          <Input
            id="metaFaturamento"
            name="metaFaturamento"
            type="number"
            step="0.01"
            min="0"
            defaultValue={salesMonth?.meta_faturamento ?? ""}
            placeholder="15000"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="superMetaFaturamento">Super meta de faturamento (R$)</Label>
          <Input
            id="superMetaFaturamento"
            name="superMetaFaturamento"
            type="number"
            step="0.01"
            min="0"
            defaultValue={salesMonth?.super_meta_faturamento ?? ""}
            placeholder="22500"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="despesasPrevistas">Despesas previstas (R$)</Label>
          <Input
            id="despesasPrevistas"
            name="despesasPrevistas"
            type="number"
            step="0.01"
            min="0"
            defaultValue={salesMonth?.despesas_previstas ?? ""}
            placeholder="13500"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="margemPrevistaPct">Margem prevista (%)</Label>
          <Input
            id="margemPrevistaPct"
            name="margemPrevistaPct"
            type="number"
            step="0.01"
            min="0"
            max="100"
            defaultValue={salesMonth?.margem_prevista_pct ?? ""}
            placeholder="15"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="notes">Observações (opcional)</Label>
        <Textarea
          id="notes"
          name="notes"
          defaultValue={salesMonth?.notes ?? ""}
          rows={3}
        />
      </div>

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
