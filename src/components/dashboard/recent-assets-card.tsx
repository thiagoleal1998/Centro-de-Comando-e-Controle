import Link from "next/link"
import { FileText, Images, Video } from "lucide-react"

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import type { Asset } from "@/types/domain"

const iconByType = { image: Images, video: Video, document: FileText, reference: Images }

export async function RecentAssetsCard() {
  const supabase = await createClient()
  const { data: assets } = await supabase
    .from("assets")
    .select("id, type, metadata")
    .order("created_at", { ascending: false })
    .limit(5)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Images className="text-muted-foreground size-4" />
          Últimos assets
        </CardTitle>
        <CardAction>
          <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/assets" />}>
            Ver biblioteca
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {!assets || assets.length === 0 ? (
          <CardDescription>Nenhum asset na biblioteca ainda.</CardDescription>
        ) : (
          <ul className="flex flex-col gap-2">
            {(assets as Pick<Asset, "id" | "type" | "metadata">[]).map((asset) => {
              const Icon = iconByType[asset.type]
              return (
                <li key={asset.id} className="flex items-center gap-2 text-sm">
                  <Icon className="text-muted-foreground size-4 shrink-0" />
                  <span className="truncate">
                    {asset.metadata.original_name ?? "Arquivo"}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
