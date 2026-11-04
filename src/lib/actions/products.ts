"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { parseList, productSchema } from "@/lib/validations/product"

export type ActionState = { error?: string } | undefined

function parsePrice(value: string): number | null {
  if (!value.trim()) return null
  const normalized = value.replace(",", ".")
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : null
}

export async function createProduct(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    features: formData.get("features"),
    benefits: formData.get("benefits"),
    price: formData.get("price"),
    specs: formData.get("specs"),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Sessão expirada. Faça login novamente." }
  }

  const { data, error } = await supabase
    .from("products")
    .insert({
      name: parsed.data.name,
      description: parsed.data.description || null,
      features: parseList(parsed.data.features),
      benefits: parseList(parsed.data.benefits),
      price: parsePrice(parsed.data.price ?? ""),
      specs: parsed.data.specs ? { notes: parsed.data.specs } : {},
      created_by: user.id,
    })
    .select("id")
    .single()

  if (error) {
    return { error: `Não foi possível criar o produto: ${error.message}` }
  }

  revalidatePath("/produtos")
  redirect(`/produtos/${data.id}`)
}

export async function updateProduct(
  productId: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    features: formData.get("features"),
    benefits: formData.get("benefits"),
    price: formData.get("price"),
    specs: formData.get("specs"),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from("products")
    .update({
      name: parsed.data.name,
      description: parsed.data.description || null,
      features: parseList(parsed.data.features),
      benefits: parseList(parsed.data.benefits),
      price: parsePrice(parsed.data.price ?? ""),
      specs: parsed.data.specs ? { notes: parsed.data.specs } : {},
      updated_at: new Date().toISOString(),
    })
    .eq("id", productId)

  if (error) {
    return { error: `Não foi possível salvar: ${error.message}` }
  }

  revalidatePath("/produtos")
  revalidatePath(`/produtos/${productId}`)
  return { error: undefined }
}

export async function deleteProduct(productId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("products").delete().eq("id", productId)

  if (error) {
    throw new Error(`Não foi possível excluir o produto: ${error.message}`)
  }

  revalidatePath("/produtos")
  redirect("/produtos")
}
