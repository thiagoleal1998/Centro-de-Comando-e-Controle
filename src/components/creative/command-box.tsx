"use client"

import * as React from "react"
import { useActionState } from "react"
import { Loader2, Wand2 } from "lucide-react"

import { requestRevision } from "@/lib/actions/creatives"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

export function CommandBox({
  creativeId,
  projectId,
}: {
  creativeId: string
  projectId: string
}) {
  const action = React.useMemo(
    () => requestRevision.bind(null, creativeId, projectId),
    [creativeId, projectId]
  )
  const [state, formAction, pending] = useActionState(action, undefined)
  const formRef = React.useRef<HTMLFormElement>(null)

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await formAction(formData)
        formRef.current?.reset()
      }}
      className="flex flex-col gap-2"
    >
      <Textarea
        name="instruction"
        required
        rows={2}
        placeholder='O que deseja alterar? Ex.: "Deixe mais persuasivo" ou "Crie uma versão mais premium."'
      />
      <div className="flex items-center justify-between gap-2">
        {state?.error ? (
          <p className="text-destructive text-sm">{state.error}</p>
        ) : (
          <span />
        )}
        <Button type="submit" disabled={pending} size="sm">
          {pending ? <Loader2 className="animate-spin" /> : <Wand2 />}
          Pedir alteração
        </Button>
      </div>
    </form>
  )
}
