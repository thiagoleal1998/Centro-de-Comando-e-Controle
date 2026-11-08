"use client"

import * as React from "react"
import { useActionState } from "react"
import { Loader2, Upload } from "lucide-react"

import { uploadDocumentFile } from "@/lib/actions/documents"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function DocumentUploadForm() {
  const [state, formAction, pending] = useActionState(uploadDocumentFile, undefined)
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
      <div className="flex flex-1 flex-col gap-1.5">
        <Label htmlFor="file">Arquivo (PDF e outros — até 20MB)</Label>
        <Input id="file" name="file" type="file" required />
      </div>
      <div className="flex flex-col gap-1.5 sm:w-48">
        <Label htmlFor="name">Nome (opcional)</Label>
        <Input id="name" name="name" placeholder="Usa o nome do arquivo se vazio" />
      </div>
      <div className="flex flex-col gap-1.5 sm:w-56">
        <Label htmlFor="description">Descrição (opcional)</Label>
        <Input id="description" name="description" />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? <Loader2 className="animate-spin" /> : <Upload />}
        Enviar
      </Button>
      {state?.error ? <p className="text-destructive w-full text-sm">{state.error}</p> : null}
    </form>
  )
}
