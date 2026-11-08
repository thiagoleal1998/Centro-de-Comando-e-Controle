"use client"

import { useActionState } from "react"
import Link from "next/link"
import { Loader2, Plus } from "lucide-react"

import type { ActionState } from "@/lib/actions/sales"
import type { Product } from "@/types/domain"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function SalesEntryForm({
  action,
  products,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>
  products: Product[]
}) {
  const [state, formAction, pending] = useActionState(action, undefined)

  if (products.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        Nenhum produto cadastrado ainda —{" "}
        <Link href="/produtos/novo" className="underline">
          cadastre um produto
        </Link>{" "}
        antes de lançar vendas.
      </p>
    )
  }

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <div className="flex min-w-48 flex-col gap-1.5">
        <Label htmlFor="productId">Produto</Label>
        <Select name="productId" defaultValue={products[0].id}>
          <SelectTrigger id="productId" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {products.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex w-20 flex-col gap-1.5">
        <Label htmlFor="day">Dia</Label>
        <Input id="day" name="day" type="number" min="1" max="31" required defaultValue="1" />
      </div>

      <div className="flex w-28 flex-col gap-1.5">
        <Label htmlFor="units">Unidades</Label>
        <Input id="units" name="units" type="number" min="0" step="1" required defaultValue="0" />
      </div>

      <div className="flex w-36 flex-col gap-1.5">
        <Label htmlFor="revenue">Faturamento (R$)</Label>
        <Input
          id="revenue"
          name="revenue"
          type="number"
          min="0"
          step="0.01"
          required
          defaultValue="0"
        />
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? <Loader2 className="animate-spin" /> : <Plus />}
        Lançar
      </Button>

      {state?.error ? <p className="text-destructive w-full text-sm">{state.error}</p> : null}
    </form>
  )
}
