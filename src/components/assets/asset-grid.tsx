import Image from "next/image"
import Link from "next/link"
import { FileText, Video } from "lucide-react"

import { getAssetPublicUrl } from "@/lib/supabase/storage"
import { DeleteAssetButton } from "./delete-asset-button"
import type { Asset } from "@/types/domain"

export function AssetGrid({
  assets,
  showProductLink = false,
}: {
  assets: (Asset & { products?: { id: string; name: string } | null })[]
  showProductLink?: boolean
}) {
  if (assets.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">Nenhum asset enviado ainda.</p>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      {assets.map((asset) => {
        const url = getAssetPublicUrl(asset.storage_path)
        const name = asset.metadata.original_name ?? asset.storage_path

        return (
          <div key={asset.id} className="group relative flex flex-col gap-1">
            <div className="bg-muted relative flex aspect-square items-center justify-center overflow-hidden rounded-lg border">
              {asset.type === "image" ? (
                <Image
                  src={url}
                  alt={name}
                  fill
                  className="object-cover"
                  sizes="(min-width: 768px) 200px, 40vw"
                />
              ) : asset.type === "video" ? (
                <Video className="text-muted-foreground size-8" />
              ) : (
                <FileText className="text-muted-foreground size-8" />
              )}
              <DeleteAssetButton
                assetId={asset.id}
                storagePath={asset.storage_path}
                productId={asset.product_id}
              />
            </div>
            <p className="truncate text-xs" title={name}>
              {name}
            </p>
            {showProductLink && asset.products ? (
              <Link
                href={`/produtos/${asset.products.id}`}
                className="text-muted-foreground truncate text-xs hover:underline"
              >
                {asset.products.name}
              </Link>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}
