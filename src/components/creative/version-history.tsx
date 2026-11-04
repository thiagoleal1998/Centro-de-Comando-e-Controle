"use client"

import * as React from "react"
import { History, Loader2, RotateCcw } from "lucide-react"

import { restoreVersion } from "@/lib/actions/creatives"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { CreativeVersion } from "@/types/domain"

function RestoreButton({
  creativeId,
  projectId,
  versionId,
}: {
  creativeId: string
  projectId: string
  versionId: string
}) {
  const [pending, startTransition] = React.useTransition()

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={pending}
      onClick={() => startTransition(() => restoreVersion(creativeId, projectId, versionId))}
    >
      {pending ? <Loader2 className="animate-spin" /> : <RotateCcw />}
      Restaurar
    </Button>
  )
}

export function VersionHistory({
  versions,
  currentVersionId,
  creativeId,
  projectId,
}: {
  versions: CreativeVersion[]
  currentVersionId: string | null
  creativeId: string
  projectId: string
}) {
  if (versions.length === 0) {
    return <p className="text-muted-foreground text-sm">Nenhuma versão ainda.</p>
  }

  return (
    <ul className="flex flex-col gap-2">
      {versions.map((version) => {
        const isCurrent = version.id === currentVersionId
        return (
          <li
            key={version.id}
            className="flex items-start justify-between gap-3 rounded-lg border p-3"
          >
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <History className="text-muted-foreground size-3.5" />
                <span className="text-sm font-medium">V{version.version_number}</span>
                {isCurrent ? <Badge>Atual</Badge> : null}
              </div>
              {version.instruction_text ? (
                <p className="text-muted-foreground text-xs">
                  {version.instruction_text}
                </p>
              ) : null}
              <p className="text-muted-foreground text-xs">
                {new Date(version.created_at).toLocaleString("pt-BR")}
              </p>
            </div>
            {!isCurrent ? (
              <RestoreButton
                creativeId={creativeId}
                projectId={projectId}
                versionId={version.id}
              />
            ) : null}
          </li>
        )
      })}
    </ul>
  )
}
