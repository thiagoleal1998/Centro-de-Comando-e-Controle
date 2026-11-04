"use client"

import * as React from "react"
import { CircleCheckBig, Loader2 } from "lucide-react"

import { approveCreative } from "@/lib/actions/creatives"
import { Button } from "@/components/ui/button"

export function ApproveButton({
  creativeId,
  projectId,
}: {
  creativeId: string
  projectId: string
}) {
  const [pending, startTransition] = React.useTransition()

  return (
    <Button
      disabled={pending}
      onClick={() => startTransition(() => approveCreative(creativeId, projectId))}
    >
      {pending ? <Loader2 className="animate-spin" /> : <CircleCheckBig />}
      Aprovar
    </Button>
  )
}
