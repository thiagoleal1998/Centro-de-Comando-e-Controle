import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProductForm } from "@/components/products/product-form"
import { createProduct } from "@/lib/actions/products"

export default function NovoProdutoPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Novo produto</h1>
        <p className="text-muted-foreground text-sm">
          Depois de criar, você poderá enviar imagens e outros arquivos de referência.
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-base">Dados do produto</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductForm action={createProduct} submitLabel="Criar produto" />
        </CardContent>
      </Card>
    </div>
  )
}
