"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { projectSchema, projectUpdateSchema } from "@/lib/validations/project"

export type ActionState = { error?: string } | undefined

export async function createProject(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = projectSchema.safeParse({
    name: formData.get("name"),
    channel: formData.get("channel"),
    objective: formData.get("objective"),
    notes: formData.get("notes"),
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
    .from("projects")
    .insert({
      name: parsed.data.name,
      channel: parsed.data.channel,
      objective: parsed.data.objective || null,
      notes: parsed.data.notes || null,
      created_by: user.id,
    })
    .select("id")
    .single()

  if (error) {
    return { error: `Não foi possível criar o projeto: ${error.message}` }
  }

  revalidatePath("/projetos")
  redirect(`/projetos/${data.id}`)
}

export async function updateProject(
  projectId: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = projectUpdateSchema.safeParse({
    name: formData.get("name"),
    channel: formData.get("channel"),
    objective: formData.get("objective"),
    notes: formData.get("notes"),
    status: formData.get("status"),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from("projects")
    .update({
      name: parsed.data.name,
      channel: parsed.data.channel,
      objective: parsed.data.objective || null,
      notes: parsed.data.notes || null,
      status: parsed.data.status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", projectId)

  if (error) {
    return { error: `Não foi possível salvar: ${error.message}` }
  }

  revalidatePath("/projetos")
  revalidatePath(`/projetos/${projectId}`)
  return { error: undefined }
}

export async function deleteProject(projectId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("projects").delete().eq("id", projectId)

  if (error) {
    throw new Error(`Não foi possível excluir o projeto: ${error.message}`)
  }

  revalidatePath("/projetos")
  redirect("/projetos")
}
