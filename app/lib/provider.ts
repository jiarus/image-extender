import type { NextRequest } from 'next/server'

const DEFAULT_PROVIDER_NAME = 'OpenRouter'
const DEFAULT_BASE_API_URL = 'https://openrouter.ai/api/v1'
const DEFAULT_CHAT_COMPLETIONS_URL =
  `${DEFAULT_BASE_API_URL}/chat/completions`

function firstNonEmpty(
  ...values: Array<string | undefined>
): string | undefined {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }
  return undefined
}

function normalizeBaseApiUrl(value?: string): string {
  if (!value) return DEFAULT_BASE_API_URL
  const trimmed = value.trim().replace(/\/+$/, '')
  return trimmed.replace(/\/(chat\/completions|images\/generations|images\/edits)$/i, '')
}

function normalizeChatCompletionsUrl(value?: string): string {
  const baseApiUrl = normalizeBaseApiUrl(value)
  if (baseApiUrl === DEFAULT_BASE_API_URL) return DEFAULT_CHAT_COMPLETIONS_URL
  const trimmed = baseApiUrl.replace(/\/+$/, '')
  return /\/chat\/completions$/i.test(trimmed)
    ? trimmed
    : `${trimmed}/chat/completions`
}

function providerNameFromUrl(chatCompletionsUrl: string): string {
  if (chatCompletionsUrl === DEFAULT_CHAT_COMPLETIONS_URL) {
    return DEFAULT_PROVIDER_NAME
  }
  try {
    return new URL(chatCompletionsUrl).host || 'custom relay'
  } catch {
    return 'custom relay'
  }
}

export type ProviderConfig = {
  baseApiUrl: string
  chatCompletionsUrl: string
  imagesGenerationsUrl: string
  imagesEditsUrl: string
  providerName: string
  usingCustomEndpoint: boolean
  serverApiKey?: string
  hasServerKey: boolean
}

export function getProviderConfig(): ProviderConfig {
  const baseApiUrl = normalizeBaseApiUrl(
    firstNonEmpty(
      process.env.OPENROUTER_BASE_URL,
      process.env.OPENAI_BASE_URL,
      process.env.OPENAI_API_BASE,
      process.env.OPENAI_API_BASE_URL
    )
  )
  const chatCompletionsUrl = normalizeChatCompletionsUrl(baseApiUrl)
  const serverApiKey = firstNonEmpty(
    process.env.OPENROUTER_API_KEY,
    process.env.OPENAI_API_KEY
  )

  return {
    baseApiUrl,
    chatCompletionsUrl,
    imagesGenerationsUrl: `${baseApiUrl}/images/generations`,
    imagesEditsUrl: `${baseApiUrl}/images/edits`,
    providerName: providerNameFromUrl(chatCompletionsUrl),
    usingCustomEndpoint: chatCompletionsUrl !== DEFAULT_CHAT_COMPLETIONS_URL,
    serverApiKey,
    hasServerKey: Boolean(serverApiKey),
  }
}

export function resolveApiKey(apiKey: unknown): string | undefined {
  if (typeof apiKey === 'string' && apiKey.trim()) {
    return apiKey.trim()
  }
  return getProviderConfig().serverApiKey
}

export function missingApiKeyMessage(): string {
  return getProviderConfig().usingCustomEndpoint
    ? 'API key missing. Add one in Settings or configure your relay key in .env.local.'
    : 'API key missing. Add one in Settings or .env.local.'
}

export function buildProviderHeaders(
  request: NextRequest,
  apiKey: string,
  title: string,
  options?: { contentType?: string | null }
): HeadersInit {
  const headers: HeadersInit = {
    Authorization: `Bearer ${apiKey}`,
  }

  // Compatibility headers for relays/proxies that do not read Bearer auth.
  // Many OpenAI-compatible gateways expect one of these custom key headers.
  headers['X-API-Key'] = apiKey
  headers['api-key'] = apiKey

  if (options?.contentType !== null) {
    headers['Content-Type'] = options?.contentType || 'application/json'
  }

  if (!getProviderConfig().usingCustomEndpoint) {
    headers['HTTP-Referer'] =
      request.headers.get('referer') || 'http://localhost:3000'
    headers['X-Title'] = title
  }

  return headers
}

export function isImagesApiModel(modelId: string): boolean {
  const normalized = modelId.trim().toLowerCase()
  return normalized === 'gpt-image-2' || normalized.endsWith('/gpt-image-2')
}

const SUPPORTED_IMAGES_API_SIZES = [
  { size: '1024x1024', width: 1024, height: 1024 },
  { size: '1536x1024', width: 1536, height: 1024 },
  { size: '1024x1536', width: 1024, height: 1536 },
] as const

/**
 * GPT Image models on the Images API accept a narrow set of canvas sizes.
 * Pick the nearest supported size for the requested aspect, then let the
 * client resample back to the app's exact working resolution if needed.
 */
export function normalizeImagesApiSize(
  width: number,
  height: number
): string {
  const safeWidth = Math.max(1, Math.round(width))
  const safeHeight = Math.max(1, Math.round(height))
  const exact = `${safeWidth}x${safeHeight}`

  if (
    SUPPORTED_IMAGES_API_SIZES.some(
      (entry) => entry.width === safeWidth && entry.height === safeHeight
    )
  ) {
    return exact
  }

  const targetRatio = safeWidth / safeHeight
  return SUPPORTED_IMAGES_API_SIZES.map((entry) => ({
    size: entry.size,
    error: Math.abs(Math.log((entry.width / entry.height) / targetRatio)),
  })).sort((a, b) => a.error - b.error)[0].size
}
