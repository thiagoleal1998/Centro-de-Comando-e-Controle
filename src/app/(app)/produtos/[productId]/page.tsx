import { notFound } from "next/navigation"
import { Images } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { updateProduct } from "@/lib/actions/products"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProductForm } from "@/components/products/product-form"
import { DeleteProductButton } from "@/components/products/delete-product-button"
import { AssetUploadForm } from "@/components/assets/asset-upload-form"
import { AssetGrid } from "@/components/assets/asset-grid"
import type { Asset, Product } from "@/types/domain"

export default async function ProdutoDetalhePage({
  params,
}: {
  params: Promise<{ productId: string }>
}) {
  const { productId } = await params
  const supabase = await createClient()

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .maybeSingle()

  if (!product) {
    notFound()
  }

  const { data: assets } = await supabase
    .from("assets")
    .select("*")
    .eq("product_id", productId)
    .order("created_at", { ascending: false })

  const boundUpdate = updateProduct.bind(null, (product as Product).id)

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {(product as Product).name}
          </h1>
          <p className="text-muted-foreground text-sm">
            Criado em{" "}
            {new Date((product as Product).created_at).toLocaleDateString("pt-BR")}
          </p>
        </div>
        <DeleteProductButton productId={(product as Product).id} />
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-base">Dados do produto</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductForm
            action={boundUpdate}
            product={product as Product}
            submitLabel="Salvar alterações"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Images className="text-muted-foreground size-4" />
            Imagens e arquivos de referência
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <AssetUploadForm productId={productId} />
          <AssetGrid assets={(assets as Asset[]) ?? []} />
        </CardContent>
      </Card>
    </div>
  )
}
