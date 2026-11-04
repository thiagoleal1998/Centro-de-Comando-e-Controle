export type ChannelType = "mercado_livre" | "meta_ads"

export type ProjectStatus = "ACTIVE" | "PAUSED" | "ARCHIVED"

export type Project = {
  id: string
  name: string
  product_id: string | null
  channel: ChannelType
  objective: string | null
  notes: string | null
  status: ProjectStatus
  created_by: string
  created_at: string
  updated_at: string
}

export type Product = {
  id: string
  name: string
  description: string | null
  features: string[]
  benefits: string[]
  specs: Record<string, unknown>
  price: number | null
  created_by: string
  created_at: string
  updated_at: string
}

export type AssetType = "image" | "video" | "document" | "reference"

export type CreativeType = "image" | "video" | "copy" | "full_ad"

export type CreativeStatus =
  | "DRAFT"
  | "GENERATING"
  | "PREVIEW"
  | "NEEDS_REVISION"
  | "APPROVED"
  | "EXPORTED"
  | "FAILED"

export type Creative = {
  id: string
  project_id: string
  channel: ChannelType
  type: CreativeType
  briefing: { instruction?: string } & Record<string, unknown>
  status: CreativeStatus
  current_version_id: string | null
  created_by: string
  created_at: string
  updated_at: string
}

export type CreativeVersion = {
  id: string
  creative_id: string
  version_number: number
  parent_version_id: string | null
  content: { text?: string; imageUrl?: string } & Record<string, unknown>
  instruction_text: string | null
  generated_by: string | null
  status: string
  created_by: string
  created_at: string
}

export type JobStatus = "QUEUED" | "RUNNING" | "SUCCEEDED" | "FAILED"

export type GenerationJob = {
  id: string
  creative_id: string
  version_id: string | null
  type: string
  status: JobStatus
  provider: string | null
  payload: Record<string, unknown>
  error_message: string | null
  created_at: string
  updated_at: string
}

export type Asset = {
  id: string
  project_id: string | null
  product_id: string | null
  type: AssetType
  category: string | null
  storage_path: string
  metadata: { original_name?: string; mime?: string; size?: number } & Record<string, unknown>
  status: string
  created_by: string
  created_at: string
}
