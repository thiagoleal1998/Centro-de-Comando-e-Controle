import { z } from "zod"

export const orgChartPhotoAdjustmentSchema = z.object({
  personKey: z.string().min(1),
  positionX: z.coerce.number().min(0).max(100),
  positionY: z.coerce.number().min(0).max(100),
  zoom: z.coerce.number().min(100).max(220),
})
