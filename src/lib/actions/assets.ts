"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"
import { ASSETS_BUCKET } from "@/lib/supabase/storage"
import type { AssetType } from "@/types/domain"

export type AssetActionState = { error?: string } | undefined

const MAX_FILE_BYTES = 10 * 1024 * 1024 // 10MB por arquivo

function inferAssetType(mime: string): AssetType {
  if (mime.startsWith("image/")) return "image"
  if (mime.startsWith("video/")) return "video"
  return "document"
}

export async function uploadAsset(
  productId: string | null,
  _prevState: AssetActionState,
  formData: FormData
): Promise<AssetActionState> {
  const file = formData.get("file")
  const category = (formData.get("category") as string | null)?.trim() || null

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Selecione um arquivo." }
  }
  if (file.size > MAX_FILE_BYTES) {
    return { error: "Arquivo muito grande (máximo 10MB)." }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Sessão expirada. Faça login novamente." }
  }

  const type = inferAssetType(file.type)
  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")
  const path = `${user.id}/${productId ?? "geral"}/${Date.now()}-${safeName}`

  const { error: uploadError } = await supabase.storage
    .from(ASSETS_BUCKET)
    .upload(path, file, { contentType: file.type || undefined })

  if (uploadError) {
    return {
      error: `Não foi possível enviar o arquivo: ${uploadError.message}. Verifique se o bucket "${ASSETS_BUCKET}" existe no Supabase Storage.`,
    }
  }

  const { error: insertError } = await supabase.from("assets").insert({
    product_id: productId,
    type,
    category,
    storage_path: path,
    metadata: { original_name: file.name, mime: file.type, size: file.size },
    created_by: user.id,
  })

  if (insertError) {
    await supabase.storage.from(ASSETS_BUCKET).remove([path])
    return { error: `Não foi possível salvar o asset: ${insertError.message}` }
  }

  revalidatePath("/assets")
  if (productId) revalidatePath(`/produtos/${productId}`)
  return undefined
}

export async function deleteAsset(
  assetId: string,
  storagePath: string,
  productId: string | null
) {
  const supabase = await createClient()

  await supabase.storage.from(ASSETS_BUCKET).remove([storagePath])

  const { error } = await supabase.from("assets").delete().eq("id", assetId)
  if (error) {
    throw new Error(`Não foi possível excluir o asset: ${error.message}`)
  }

  revalidatePath("/assets")
  if (productId) revalidatePath(`/produtos/${productId}`)
}
