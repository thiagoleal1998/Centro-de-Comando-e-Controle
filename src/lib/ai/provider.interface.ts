export type GenerateTextInput = {
  instruction: string
  context?: string
}

export type GenerateTextResult = { text: string }

export interface TextProvider {
  generateText(input: GenerateTextInput): Promise<GenerateTextResult>
}

export type GenerateImageInput = {
  instruction: string
  referenceImageUrls?: string[]
}

export type GenerateImageResult = { imageUrl: string }

export interface ImageProvider {
  generateImage(input: GenerateImageInput): Promise<GenerateImageResult>
}
