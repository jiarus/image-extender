'use client'

export type ModelOption = {
  value: string
  label: string
  hint?: string
  maxAttempts: number
  approxSecondsPerCall: number
}

export const MODELS: ModelOption[] = [
  {
    value: 'gpt-image-2',
    label: 'GPT Image 2',
    hint: '中转别名',
    maxAttempts: 1,
    approxSecondsPerCall: 180,
  },
  {
    value: 'openai/gpt-5.4-image-2',
    label: 'GPT-5.4 Image 2',
    hint: 'OpenAI · 高保真 · 较慢',
    maxAttempts: 1,
    approxSecondsPerCall: 240,
  },
  {
    value: 'google/gemini-3-pro-image-preview',
    label: 'Gemini 3 Pro Image',
    hint: 'Nano Banana Pro · 最高保真',
    maxAttempts: 1,
    approxSecondsPerCall: 75,
  },
  {
    value: 'google/gemini-3.1-flash-image-preview',
    label: 'Gemini 3 Flash Image',
    hint: 'Nano Banana 2 · 速度快 · 默认',
    maxAttempts: 3,
    approxSecondsPerCall: 18,
  },
  {
    value: 'google/gemini-2.5-flash-image',
    label: 'Gemini 2.5 Flash Image',
    hint: 'Nano Banana · 稳定',
    maxAttempts: 3,
    approxSecondsPerCall: 15,
  },
]

export const DEFAULT_MODEL = 'google/gemini-3.1-flash-image-preview'

export function getModelConfig(value: string): ModelOption {
  return (
    MODELS.find((m) => m.value === value) ||
    MODELS.find((m) => m.value === DEFAULT_MODEL) ||
    MODELS[0]
  )
}

export function skipsArtDirectorReview(value: string): boolean {
  const normalized = value.toLowerCase()
  return normalized.startsWith('openai/gpt-') || normalized.startsWith('gpt-')
}

export function maskKey(key: string): string {
  if (!key) return ''
  const tail = key.slice(-4)
  return `${'•'.repeat(Math.max(4, Math.min(20, key.length - 4)))}${tail}`
}
