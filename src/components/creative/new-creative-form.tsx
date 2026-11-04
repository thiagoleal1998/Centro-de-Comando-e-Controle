"use client"

import { useActionState } from "react"
import { Loader2 } from "lucide-react"

import type { ActionState } from "@/lib/actions/creatives"
import { creativeTypeOptions } from "@/lib/validations/creative"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function NewCreativeForm({
  action,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>
}) {
  const [state, formAction, pending] = useActionState(action, undefined)

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="type">O que você quer criar?</Label>
        <Select name="type" defaultValue="copy">
          <SelectTrigger id="type" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {creativeTypeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-muted-foreground text-xs">
          Nesta fase, Copy/Texto gera um placeholder (sem custo) — os outros
          tipos mostram o erro de provider não configurado.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="instruction">O que você quer criar ou alterar?</Label>
        <Textarea
          id="instruction"
          name="instruction"
          required
          rows={4}
          placeholder='Ex.: "Crie uma chamada persuasiva destacando a bateria de longa duração."'
        />
      </div>

      {state?.error ? (
        <p className="text-destructive text-sm">{state.error}</p>
      ) : null}

      <div>
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2 className="animate-spin" /> : null}
          Gerar
        </Button>
      </div>
    </form>
  )
}
