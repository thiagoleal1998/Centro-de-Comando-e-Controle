"use client"

import * as React from "react"
import { useActionState } from "react"
import { Loader2, Upload } from "lucide-react"

import { uploadAsset } from "@/lib/actions/assets"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function AssetUploadForm({ productId }: { productId: string | null }) {
  const action = React.useMemo(() => uploadAsset.bind(null, productId), [productId])
  const [state, formAction, pending] = useActionState(action, undefined)
  const formRef = React.useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await formAction(formData)
        formRef.current?.reset()
      }}
      className="flex flex-col gap-3 sm:flex-row sm:items-end"
    >
      <div className="flex flex-1 flex-col gap-1.5">
        <Label htmlFor="file">Arquivo (imagem, vídeo ou documento — até 10MB)</Label>
        <Input id="file" name="file" type="file" required />
      </div>
      <div className="flex flex-col gap-1.5 sm:w-48">
        <Label htmlFor="category">Categoria (opcional)</Label>
        <Input id="category" name="category" placeholder="Ex.: embalagem, logo" />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? <Loader2 className="animate-spin" /> : <Upload />}
        Enviar
      </Button>
      {state?.error ? (
        <p className="text-destructive w-full text-sm">{state.error}</p>
      ) : null}
    </form>
  )
}
