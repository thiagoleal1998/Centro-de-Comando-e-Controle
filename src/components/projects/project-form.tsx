"use client"

import { useActionState } from "react"
import { Loader2 } from "lucide-react"

import type { ActionState } from "@/lib/actions/projects"
import { channelOptions, projectStatusOptions } from "@/lib/validations/project"
import type { Project } from "@/types/domain"
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

export function ProjectForm({
  action,
  project,
  submitLabel,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>
  project?: Project
  submitLabel: string
}) {
  const [state, formAction, pending] = useActionState(action, undefined)

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Nome do projeto</Label>
        <Input
          id="name"
          name="name"
          required
          defaultValue={project?.name}
          placeholder="Ex.: Campanha Câmera Jortan"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="channel">Canal</Label>
        <Select name="channel" defaultValue={project?.channel ?? "mercado_livre"}>
          <SelectTrigger id="channel" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {channelOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {project ? (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="status">Status</Label>
          <Select name="status" defaultValue={project.status}>
            <SelectTrigger id="status" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {projectStatusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="objective">Objetivo</Label>
        <Textarea
          id="objective"
          name="objective"
          defaultValue={project?.objective ?? ""}
          placeholder="O que essa campanha precisa alcançar?"
          rows={3}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="notes">Observações</Label>
        <Textarea
          id="notes"
          name="notes"
          defaultValue={project?.notes ?? ""}
          placeholder="Contexto adicional para quem for criar os criativos."
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
