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

export type SalesMonth = {
  id: string
  year: number
  month: number
  meta_faturamento: number | null
  super_meta_faturamento: number | null
  despesas_previstas: number | null
  margem_prevista_pct: number | null
  notes: string | null
  created_by: string
  created_at: string
  updated_at: string
}

export type SalesEntry = {
  id: string
  month_id: string
  product_id: string
  day: number
  units: number
  revenue: number
  created_by: string
  created_at: string
  updated_at: string
}

export type SalesEntryWithProduct = SalesEntry & {
  products: { name: string } | null
}

export type StrategyPlan = {
  id: string
  name: string
  description: string | null
  target_profit: number | null
  target_margin_pct: number | null
  created_by: string
  created_at: string
  updated_at: string
}

export type StrategyPlanExpense = {
  id: string
  plan_id: string
  name: string
  monthly_amount: number
  notes: string | null
  created_by: string
  created_at: string
  updated_at: string
}
