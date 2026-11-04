export const ASSETS_BUCKET = "assets"

export function getAssetPublicUrl(storagePath: string) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL
  return `${base}/storage/v1/object/public/${ASSETS_BUCKET}/${storagePath}`
}
