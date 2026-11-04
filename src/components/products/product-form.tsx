"use client"

import { useActionState } from "react"
import { Loader2 } from "lucide-react"

import type { ActionState } from "@/lib/actions/products"
import { formatList } from "@/lib/validations/product"
import type { Product } from "@/types/domain"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export function ProductForm({
  action,
  product,
  submitLabel,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>
  product?: Product
  submitLabel: string
}) {
  const [state, formAction, pending] = useActionState(action, undefined)
  const specsNotes = (product?.specs?.notes as string | undefined) ?? ""

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Nome do produto</Label>
        <Input
          id="name"
          name="name"
          required
          defaultValue={product?.name}
          placeholder="Ex.: Câmera Jortan X200"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={product?.description ?? ""}
          placeholder="Breve descrição do produto."
          rows={3}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="features">Características (uma por linha)</Label>
          <Textarea
            id="features"
            name="features"
            defaultValue={formatList(product?.features)}
            placeholder={"Bateria 4000mAh\nResistente à água"}
            rows={4}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="benefits">Benefícios (um por linha)</Label>
          <Textarea
            id="benefits"
            name="benefits"
            defaultValue={formatList(product?.benefits)}
            placeholder={"Mais autonomia no dia a dia\nUso em qualquer clima"}
            rows={4}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="price">Preço (opcional)</Label>
        <Input
          id="price"
          name="price"
          inputMode="decimal"
          defaultValue={product?.price ?? ""}
          placeholder="Ex.: 199.90"
          className="max-w-40"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="specs">Especificações técnicas</Label>
        <Textarea
          id="specs"
          name="specs"
          defaultValue={specsNotes}
          placeholder="Dimensões, peso, voltagem, material, etc."
          rows={3}
        />
      </div>

      {state?.error ? (
        <p className="text-destructive text-sm">{state.error}</p>
      ) : null}

      <div>
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2 className="animate-spin" /> : null}
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
