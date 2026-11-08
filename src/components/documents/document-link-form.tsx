"use client"

import * as React from "react"
import { useActionState } from "react"
import { Loader2, Link as LinkIcon } from "lucide-react"

import { createDocumentLink } from "@/lib/actions/documents"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function DocumentLinkForm() {
  const [state, formAction, pending] = useActionState(createDocumentLink, undefined)
  const formRef = React.useRef<HTMLFormElement>(null)

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await formAction(formData)
        formRef.current?.reset()
      }}
      className="flex flex-col gap-3 sm:flex-row sm:items-end sm:flex-wrap"
    >
      <div className="flex min-w-48 flex-1 flex-col gap-1.5">
        <Label htmlFor="linkName">Nome</Label>
        <Input id="linkName" name="name" required placeholder="Ex.: Contrato social" />
      </div>
      <div className="flex min-w-56 flex-[2] flex-col gap-1.5">
        <Label htmlFor="url">Link (Google Drive, OneDrive, etc.)</Label>
        <Input
          id="url"
          name="url"
          type="url"
          required
          placeholder="https://drive.google.com/..."
        />
      </div>
      <div className="flex flex-col gap-1.5 sm:w-56">
        <Label htmlFor="linkDescription">Descrição (opcional)</Label>
        <Input id="linkDescription" name="description" />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? <Loader2 className="animate-spin" /> : <LinkIcon />}
        Adicionar link
      </Button>
      {state?.error ? <p className="text-destructive w-full text-sm">{state.error}</p> : null}
    </form>
  )
}
