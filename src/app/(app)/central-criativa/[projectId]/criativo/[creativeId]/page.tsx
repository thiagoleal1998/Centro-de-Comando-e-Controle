import Link from "next/link"
import { notFound } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CreativeStatusBadge, CreativeTypeBadge } from "@/components/creative/badges"
import { VersionPreview } from "@/components/creative/version-preview"
import { CommandBox } from "@/components/creative/command-box"
import { ApproveButton } from "@/components/creative/approve-button"
import { VersionHistory } from "@/components/creative/version-history"
import { DeleteCreativeButton } from "@/components/creative/delete-creative-button"
import type { Creative, CreativeVersion } from "@/types/domain"

export default async function CreativeWorkspacePage({
  params,
}: {
  params: Promise<{ projectId: string; creativeId: string }>
}) {
  const { projectId, creativeId } = await params
  const supabase = await createClient()

  const { data: creative } = await supabase
    .from("creatives")
    .select("*")
    .eq("id", creativeId)
    .maybeSingle()

  if (!creative) {
    notFound()
  }

  const { data: versions } = await supabase
    .from("creative_versions")
    .select("*")
    .eq("creative_id", creativeId)
    .order("version_number", { ascending: false })

  const typedCreative = creative as Creative
  const typedVersions = (versions ?? []) as CreativeVersion[]
  const currentVersion =
    typedVersions.find((v) => v.id === typedCreative.current_version_id) ?? null

  let latestError: string | null = null
  if (typedCreative.status === "FAILED") {
    const { data: job } = await supabase
      .from("generation_jobs")
      .select("error_message")
      .eq("creative_id", creativeId)
      .eq("status", "FAILED")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
    latestError = job?.error_message ?? null
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <Link
            href={`/central-criativa/${projectId}`}
            className="text-muted-foreground text-xs hover:underline"
          >
            Voltar ao projeto
          </Link>
          <div className="flex items-center gap-2">
            <CreativeTypeBadge type={typedCreative.type} />
            <CreativeStatusBadge status={typedCreative.status} />
          </div>
        </div>
        <DeleteCreativeButton creativeId={creativeId} projectId={projectId} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Preview</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <VersionPreview
                status={typedCreative.status}
                version={currentVersion}
                errorMessage={latestError}
              />
              <div className="flex items-center gap-2">
                <ApproveButton creativeId={creativeId} projectId={projectId} />
              </div>
              <Separator />
              <div>
                <p className="mb-2 text-sm font-medium">O que deseja alterar?</p>
                <CommandBox creativeId={creativeId} projectId={projectId} />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Versões</CardTitle>
          </CardHeader>
          <CardContent>
            <VersionHistory
              versions={typedVersions}
              currentVersionId={typedCreative.current_version_id}
              creativeId={creativeId}
              projectId={projectId}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
