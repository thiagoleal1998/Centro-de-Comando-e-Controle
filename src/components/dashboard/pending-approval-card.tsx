import Link from "next/link"
import { CircleCheckBig } from "lucide-react"

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CreativeTypeBadge } from "@/components/creative/badges"
import { createClient } from "@/lib/supabase/server"
import type { CreativeType } from "@/types/domain"

export async function PendingApprovalCard() {
  const supabase = await createClient()
  const { data: creatives } = await supabase
    .from("creatives")
    .select("id, type, project_id")
    .in("status", ["PREVIEW", "NEEDS_REVISION"])
    .order("updated_at", { ascending: false })
    .limit(5)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <CircleCheckBig className="text-muted-foreground size-4" />
          Aguardando aprovação
        </CardTitle>
        <CardAction>
          <Button
            variant="ghost"
            size="sm"
            nativeButton={false}
            render={<Link href="/central-criativa" />}
          >
            Central Criativa
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {!creatives || creatives.length === 0 ? (
          <CardDescription>Nenhum criativo aguardando revisão.</CardDescription>
        ) : (
          <ul className="flex flex-col gap-2">
            {(
              creatives as { id: string; type: CreativeType; project_id: string }[]
            ).map((creative) => (
              <li key={creative.id}>
                <Link
                  href={`/central-criativa/${creative.project_id}/criativo/${creative.id}`}
                  className="flex items-center justify-between gap-2 text-sm hover:underline"
                >
                  <span>Criativo</span>
                  <CreativeTypeBadge type={creative.type} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
