import { Client } from "@modelcontextprotocol/sdk/client/index.js"
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js"

import type {
  GenerateImageInput,
  GenerateImageResult,
  ImageProvider,
} from "../provider.interface"
import { getKairogenAccessToken } from "./kairogen-tokens"

const MCP_URL = "https://mcp.kairogen.ai/mcp"
const DEFAULT_MODEL = "seedream-v4"
const DEFAULT_SIZE = "1024x1024"

async function connect() {
  const accessToken = await getKairogenAccessToken()
  const transport = new StreamableHTTPClientTransport(new URL(MCP_URL), {
    requestInit: { headers: { Authorization: `Bearer ${accessToken}` } },
  })
  const client = new Client({ name: "centro-de-comando", version: "0.1.0" })
  await client.connect(transport)
  return client
}

function parseToolJson(result: { content?: Array<{ type: string; text?: string }> }): Record<string, unknown> {
  const textBlock = result.content?.find((block) => block.type === "text")
  if (!textBlock?.text) {
    throw new Error("Kairogen retornou uma resposta sem conteúdo de texto.")
  }
  return JSON.parse(textBlock.text)
}

export class KairogenProvider implements ImageProvider {
  async generateImage({
    instruction,
    referenceImageUrls,
  }: GenerateImageInput): Promise<GenerateImageResult> {
    const client = await connect()

    try {
      const estimateResult = await client.callTool({
        name: "estimate_cost",
        arguments: {
          model: DEFAULT_MODEL,
          quantity: 1,
          size: DEFAULT_SIZE,
          plan_key: "free",
        },
      })
      const estimate = parseToolJson(
        estimateResult as { content?: Array<{ type: string; text?: string }> }
      )
      if ("isError" in estimateResult && estimateResult.isError) {
        throw new Error(`Falha ao estimar custo: ${JSON.stringify(estimate)}`)
      }

      const generateResult = await client.callTool({
        name: "generate_image",
        arguments: {
          model: DEFAULT_MODEL,
          prompt: instruction,
          quantity: 1,
          size: DEFAULT_SIZE,
          wait_for_completion: true,
          expected_credits: estimate.credit_cost,
          ...(referenceImageUrls?.length
            ? { reference_image_urls: referenceImageUrls }
            : {}),
        },
      })

      if ("isError" in generateResult && generateResult.isError) {
        const body = parseToolJson(
          generateResult as { content?: Array<{ type: string; text?: string }> }
        )
        throw new Error(`Falha na geração: ${JSON.stringify(body)}`)
      }

      const body = parseToolJson(
        generateResult as { content?: Array<{ type: string; text?: string }> }
      )
      const imageUrl =
        (body.image_url as string | undefined) ??
        (body.url as string | undefined) ??
        (body.resource_link as string | undefined) ??
        (Array.isArray(body.images) ? (body.images[0] as { url?: string })?.url : undefined)

      if (!imageUrl) {
        throw new Error(
          `Kairogen não retornou uma URL de imagem reconhecível: ${JSON.stringify(body)}`
        )
      }

      return { imageUrl }
    } finally {
      await client.close()
    }
  }
}
