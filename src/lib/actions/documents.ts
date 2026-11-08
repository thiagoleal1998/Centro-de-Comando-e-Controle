"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"
import { ASSETS_BUCKET } from "@/lib/supabase/storage"
import { documentLinkSchema } from "@/lib/validations/document"

export type DocumentActionState = { error?: string } | undefined

const MAX_FILE_BYTES = 20 * 1024 * 1024 // 20MB

export async function uploadDocumentFile(
  _prevState: DocumentActionState,
  formData: FormData
): Promise<DocumentActionState> {
  const file = formData.get("file")
  const name = (formData.get("name") as string | null)?.trim()
  const description = (formData.get("description") as string | null)?.trim() || null

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Selecione um arquivo." }
  }
  if (file.size > MAX_FILE_BYTES) {
    return { error: "Arquivo muito grande (máximo 20MB)." }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Sessão expirada. Faça login novamente." }
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")
  const path = `${user.id}/documentos/${Date.now()}-${safeName}`

  const { error: uploadError } = await supabase.storage
    .from(ASSETS_BUCKET)
    .upload(path, file, { contentType: file.type || undefined })

  if (uploadError) {
    return { error: `Não foi possível enviar o arquivo: ${uploadError.message}` }
  }

  const { error: insertError } = await supabase.from("documents").insert({
    name: name || file.name,
    kind: "file",
    storage_path: path,
    description,
    created_by: user.id,
  })

  if (insertError) {
    await supabase.storage.from(ASSETS_BUCKET).remove([path])
    return { error: `Não foi possível salvar o documento: ${insertError.message}` }
  }

  revalidatePath("/documentos")
  return undefined
}

export async function createDocumentLink(
  _prevState: DocumentActionState,
  formData: FormData
): Promise<DocumentActionState> {
  const parsed = documentLinkSchema.safeParse({
    name: formData.get("name"),
    url: formData.get("url"),
    description: formData.get("description"),
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

  const { error } = await supabase.from("documents").insert({
    name: parsed.data.name,
    kind: "link",
    url: parsed.data.url,
    description: parsed.data.description || null,
    created_by: user.id,
  })

  if (error) {
    return { error: `Não foi possível adicionar o link: ${error.message}` }
  }

  revalidatePath("/documentos")
  return undefined
}

export async function deleteDocument(documentId: string, storagePath: string | null) {
  const supabase = await createClient()

  if (storagePath) {
    await supabase.storage.from(ASSETS_BUCKET).remove([storagePath])
  }

  const { error } = await supabase.from("documents").delete().eq("id", documentId)
  if (error) {
    throw new Error(`Não foi possível excluir o documento: ${error.message}`)
  }

  revalidatePath("/documentos")
}
