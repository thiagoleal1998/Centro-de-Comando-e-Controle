"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { generateCreativeContent, GenerationNotConfiguredError } from "@/lib/ai/generate"
import { newCreativeSchema, revisionSchema } from "@/lib/validations/creative"
import type { CreativeType } from "@/types/domain"

export type ActionState = { error?: string } | undefined

export async function createCreative(
  projectId: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = newCreativeSchema.safeParse({
    type: formData.get("type"),
    instruction: formData.get("instruction"),
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

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("channel")
    .eq("id", projectId)
    .maybeSingle()

  if (projectError || !project) {
    return { error: "Projeto não encontrado." }
  }

  const { data: creative, error: creativeError } = await supabase
    .from("creatives")
    .insert({
      project_id: projectId,
      channel: project.channel,
      type: parsed.data.type,
      briefing: { instruction: parsed.data.instruction },
      status: "DRAFT",
      created_by: user.id,
    })
    .select("id")
    .single()

  if (creativeError) {
    return { error: `Não foi possível criar o criativo: ${creativeError.message}` }
  }

  await runGeneration({
    creativeId: creative.id,
    type: parsed.data.type,
    instruction: parsed.data.instruction,
    versionNumber: 1,
    parentVersionId: null,
    userId: user.id,
  })

  revalidatePath(`/central-criativa/${projectId}`)
  redirect(`/central-criativa/${projectId}/criativo/${creative.id}`)
}

export async function requestRevision(
  creativeId: string,
  projectId: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = revisionSchema.safeParse({ instruction: formData.get("instruction") })

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

  const { data: creative, error: creativeError } = await supabase
    .from("creatives")
    .select("type, current_version_id")
    .eq("id", creativeId)
    .maybeSingle()

  if (creativeError || !creative) {
    return { error: "Criativo não encontrado." }
  }

  const { count } = await supabase
    .from("creative_versions")
    .select("id", { count: "exact", head: true })
    .eq("creative_id", creativeId)

  const result = await runGeneration({
    creativeId,
    type: creative.type as CreativeType,
    instruction: parsed.data.instruction,
    versionNumber: (count ?? 0) + 1,
    parentVersionId: creative.current_version_id,
    userId: user.id,
  })

  if (!result.ok) {
    // Falha na regeneração não descarta a versão atual — o preview continua
    // mostrando o último resultado bom, só o erro é reportado.
    return { error: result.error }
  }

  revalidatePath(`/central-criativa/${projectId}/criativo/${creativeId}`)
  return { error: undefined }
}

export async function approveCreative(creativeId: string, projectId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("creatives")
    .update({ status: "APPROVED", updated_at: new Date().toISOString() })
    .eq("id", creativeId)

  if (error) {
    throw new Error(`Não foi possível aprovar: ${error.message}`)
  }

  revalidatePath(`/central-criativa/${projectId}/criativo/${creativeId}`)
}

export async function restoreVersion(
  creativeId: string,
  projectId: string,
  versionId: string
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Sessão expirada.")

  const { data: creative } = await supabase
    .from("creatives")
    .select("current_version_id")
    .eq("id", creativeId)
    .maybeSingle()

  const { data: target, error: targetError } = await supabase
    .from("creative_versions")
    .select("content, version_number")
    .eq("id", versionId)
    .maybeSingle()

  if (targetError || !target) {
    throw new Error("Versão não encontrada.")
  }

  const { count } = await supabase
    .from("creative_versions")
    .select("id", { count: "exact", head: true })
    .eq("creative_id", creativeId)

  const { data: newVersion, error: insertError } = await supabase
    .from("creative_versions")
    .insert({
      creative_id: creativeId,
      version_number: (count ?? 0) + 1,
      parent_version_id: creative?.current_version_id ?? null,
      content: target.content,
      instruction_text: `Restaurado da versão ${target.version_number}`,
      generated_by: "restore",
      status: "READY",
      created_by: user.id,
    })
    .select("id")
    .single()

  if (insertError) {
    throw new Error(`Não foi possível restaurar: ${insertError.message}`)
  }

  await supabase
    .from("creatives")
    .update({
      current_version_id: newVersion.id,
      status: "PREVIEW",
      updated_at: new Date().toISOString(),
    })
    .eq("id", creativeId)

  revalidatePath(`/central-criativa/${projectId}/criativo/${creativeId}`)
}

export async function deleteCreative(creativeId: string, projectId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("creatives").delete().eq("id", creativeId)

  if (error) {
    throw new Error(`Não foi possível excluir o criativo: ${error.message}`)
  }

  revalidatePath(`/central-criativa/${projectId}`)
  redirect(`/central-criativa/${projectId}`)
}

async function runGeneration({
  creativeId,
  type,
  instruction,
  versionNumber,
  parentVersionId,
  userId,
}: {
  creativeId: string
  type: CreativeType
  instruction: string
  versionNumber: number
  parentVersionId: string | null
  userId: string
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient()

  const { data: job } = await supabase
    .from("generation_jobs")
    .insert({
      creative_id: creativeId,
      type: `version_${versionNumber}`,
      status: "RUNNING",
      provider: "stub",
      payload: { instruction },
    })
    .select("id")
    .single()

  try {
    const content = await generateCreativeContent(type, instruction)

    const { data: version, error: versionError } = await supabase
      .from("creative_versions")
      .insert({
        creative_id: creativeId,
        version_number: versionNumber,
        parent_version_id: parentVersionId,
        content,
        instruction_text: instruction,
        generated_by: "stub",
        status: "READY",
        created_by: userId,
      })
      .select("id")
      .single()

    if (versionError) throw new Error(versionError.message)

    if (job) {
      await supabase
        .from("generation_jobs")
        .update({ status: "SUCCEEDED", version_id: version.id, updated_at: new Date().toISOString() })
        .eq("id", job.id)
    }

    await supabase
      .from("creatives")
      .update({
        status: "PREVIEW",
        current_version_id: version.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", creativeId)

    return { ok: true }
  } catch (err) {
    const message =
      err instanceof GenerationNotConfiguredError || err instanceof Error
        ? err.message
        : "Erro desconhecido na geração."

    if (job) {
      await supabase
        .from("generation_jobs")
        .update({ status: "FAILED", error_message: message, updated_at: new Date().toISOString() })
        .eq("id", job.id)
    }

    if (!parentVersionId) {
      // Sem versão anterior para preservar — reflete a falha no status.
      await supabase
        .from("creatives")
        .update({ status: "FAILED", updated_at: new Date().toISOString() })
        .eq("id", creativeId)
    }

    return { ok: false, error: message }
  }
}
