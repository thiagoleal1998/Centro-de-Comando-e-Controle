import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AssetUploadForm } from "@/components/assets/asset-upload-form"
import { AssetGrid } from "@/components/assets/asset-grid"
import { createClient } from "@/lib/supabase/server"
import type { Asset } from "@/types/domain"

export default async function AssetsPage() {
  const supabase = await createClient()
  const { data: assets, error } = await supabase
    .from("assets")
    .select("*, products(id, name)")
    .order("created_at", { ascending: false })

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Assets</h1>
        <p className="text-muted-foreground text-sm">
          Biblioteca central de imagens, vídeos, documentos e referências.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Enviar para a biblioteca</CardTitle>
        </CardHeader>
        <CardContent>
          <AssetUploadForm productId={null} />
        </CardContent>
      </Card>

      {error ? (
        <Card className="border-destructive/50">
          <CardContent className="text-destructive py-6 text-sm">
            Não foi possível carregar os assets: {error.message}
          </CardContent>
        </Card>
      ) : (
        <AssetGrid
          assets={(assets as (Asset & { products: { id: string; name: string } | null })[]) ?? []}
          showProductLink
        />
      )}
    </div>
  )
}
