import Link from "next/link"
import { Plus } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/layout/empty-state"
import type { Product } from "@/types/domain"

export default async function ProdutosPage() {
  const supabase = await createClient()
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false })

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Produtos</h1>
          <p className="text-muted-foreground text-sm">
            Cadastro de produtos usados nos briefings de criativos.
          </p>
        </div>
        <Button nativeButton={false} render={<Link href="/produtos/novo" />}>
          <Plus /> Novo produto
        </Button>
      </div>

      {error ? (
        <Card className="border-destructive/50">
          <CardContent className="text-destructive py-6 text-sm">
            Não foi possível carregar os produtos: {error.message}
          </CardContent>
        </Card>
      ) : !products || products.length === 0 ? (
        <Card className="border-dashed">
          <EmptyState
            title="Nenhum produto cadastrado ainda."
            description="Cadastre um produto para começar a montar briefings de criativos."
            action={
              <Button nativeButton={false} render={<Link href="/produtos/novo" />} className="mt-2">
                <Plus /> Novo produto
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(products as Product[]).map((product) => (
            <Link key={product.id} href={`/produtos/${product.id}`}>
              <Card className="h-full transition-colors hover:bg-muted/50">
                <CardHeader>
                  <CardTitle className="text-base">{product.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  <p className="text-muted-foreground line-clamp-2 text-sm">
                    {product.description || "Sem descrição."}
                  </p>
                  {product.price ? (
                    <p className="text-sm font-medium">
                      {product.price.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </p>
                  ) : null}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
