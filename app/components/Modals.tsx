'use client'

import { useEffect, useRef, useState } from 'react'
import { Icons } from '@/app/components/icons'
import { ART_STYLE_GROUPS } from '@/app/lib/artStyles'
import { MODELS, maskKey } from '@/app/lib/models'

export function SettingsDrawer({
  open,
  onClose,
  debugMode,
  setDebugMode,
  onGenerate,
  apiKey,
  onEditApiKey,
  onClearApiKey,
  selectedModel,
  setSelectedModel,
  providerName,
  usingCustomProvider,
  hasServerKey,
}: {
  open: boolean
  onClose: () => void
  debugMode: boolean
  setDebugMode: (v: boolean) => void
  onGenerate: () => void
  apiKey: string
  onEditApiKey: () => void
  onClearApiKey: () => void
  selectedModel: string
  setSelectedModel: (v: string) => void
  providerName: string
  usingCustomProvider: boolean
  hasServerKey: boolean
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  return (
    <>
      <div
        className="fixed inset-0 z-30 anim-fade"
        style={{ background: 'rgba(0,0,0,0.5)' }}
        onClick={onClose}
      />
      <aside
        className="fixed right-0 top-0 z-40 flex h-full w-[360px] flex-col anim-slide-up"
        style={{
          background: 'var(--bg-elev)',
          borderLeft: '1px solid var(--border-strong)',
        }}
      >
        <div
          className="flex h-14 shrink-0 items-center justify-between border-b px-5"
          style={{ borderColor: 'var(--border)' }}
        >
          <h2 className="text-[14px] font-semibold tracking-tight">设置</h2>
          <button onClick={onClose} className="icon-btn" aria-label="关闭">
            <Icons.X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <Section title="模型">
            <div className="space-y-2">
              {MODELS.map((m) => {
                const active = m.value === selectedModel
                return (
                  <button
                    key={m.value}
                    onClick={() => setSelectedModel(m.value)}
                    className="flex w-full items-start gap-3 rounded-[var(--radius-sm)] p-3 text-left transition-colors"
                    style={{
                      background: active ? 'var(--accent-bg)' : 'var(--surface)',
                      border: `1px solid ${active ? 'var(--accent-border)' : 'var(--border)'}`,
                    }}
                  >
                    <div
                      className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full"
                      style={{
                        border: `1.5px solid ${active ? 'var(--accent)' : 'var(--border-strong)'}`,
                        background: active ? 'var(--accent)' : 'transparent',
                      }}
                    >
                      {active && (
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ background: '#1a1404' }}
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] font-medium">{m.label}</div>
                      <div
                        className="mt-0.5 truncate text-[11px]"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {m.hint ? `${m.hint} · ` : ''}
                        <code className="font-mono">{m.value}</code>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </Section>

          <Section title="API 密钥">
            {apiKey ? (
              <div
                className="flex items-center gap-3 rounded-[var(--radius-sm)] p-3"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                }}
              >
                <div
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded"
                  style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}
                >
                  <Icons.Key size={14} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[12px] font-medium">已保存在本地</div>
                  <div
                    className="truncate font-mono text-[11px]"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {maskKey(apiKey)}
                  </div>
                </div>
                <button
                  onClick={onEditApiKey}
                  className="icon-btn"
                  aria-label="编辑密钥"
                  title="编辑密钥"
                >
                  <Icons.Settings size={14} />
                </button>
                <button
                  onClick={onClearApiKey}
                  className="icon-btn"
                  aria-label="移除密钥"
                  title="移除密钥"
                >
                  <Icons.Trash size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={onEditApiKey}
                className="btn btn-secondary w-full justify-start"
              >
                <Icons.Key size={14} />
                添加 API 密钥
              </button>
            )}
            <p className="mt-2 text-[12px]" style={{ color: 'var(--text-muted)' }}>
              Stored only in this browser.
              {usingCustomProvider ? (
                <> Requests go through <code className="font-mono">{providerName}</code>.</>
              ) : (
                <>
                  {' '}For OpenRouter keys, use{' '}
                  <a
                    href="https://openrouter.ai/keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--accent)' }}
                  >
                    openrouter.ai/keys
                  </a>
                  .
                </>
              )}
              {hasServerKey ? ' Server-side fallback is configured.' : ''}
            </p>
          </Section>

          <Section title="工具">
            <button
              onClick={() => {
                onClose()
                onGenerate()
              }}
              className="btn btn-secondary w-full justify-start"
            >
              <Icons.Sparkle size={15} />
              从零生成图片
            </button>
            <p className="mt-2 text-[12px]" style={{ color: 'var(--text-muted)' }}>
              先根据文字生成一张全新图片，再继续扩展。
            </p>
          </Section>

          <Section title="开发">
            <Toggle
              label="调试叠层"
              description="显示拼缝参考线，并把泊松评分输出到控制台。"
              checked={debugMode}
              onChange={setDebugMode}
            />
          </Section>

          <Section title="说明">
            <p
              className="text-[12px] leading-relaxed"
              style={{ color: 'var(--text-secondary)' }}
            >
              Extensions are 38% of the current image dimension. For larger
              extensions, click an edge again after accepting.
            </p>
            <p
              className="mt-3 text-[11px]"
              style={{ color: 'var(--text-muted)' }}
            >
              Seamless blending via Poisson editing (Pérez et al. 2003).
            </p>
          </Section>
        </div>
      </aside>
    </>
  )
}


export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3
        className="mb-3 text-[11px] font-medium uppercase tracking-wider"
        style={{ color: 'var(--text-muted)' }}
      >
        {title}
      </h3>
      {children}
    </div>
  )
}


export function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description?: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-[var(--radius-sm)] py-1">
      <div className="flex-1">
        <div className="text-[13px] font-medium">{label}</div>
        {description && (
          <div
            className="mt-0.5 text-[12px] leading-snug"
            style={{ color: 'var(--text-muted)' }}
          >
            {description}
          </div>
        )}
      </div>
      <span
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className="relative mt-0.5 inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors"
        style={{
          background: checked ? 'var(--accent)' : 'var(--surface)',
          border: `1px solid ${checked ? 'var(--accent)' : 'var(--border-strong)'}`,
        }}
      >
        <span
          className="inline-block h-3 w-3 rounded-full transition-transform"
          style={{
            background: checked ? '#1a1404' : 'var(--text-secondary)',
            transform: checked ? 'translateX(18px)' : 'translateX(3px)',
          }}
        />
      </span>
    </label>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Generate modal — text-to-image
// ─────────────────────────────────────────────────────────────────────────────


export function GenerateModal({
  open,
  onClose,
  prompt,
  setPrompt,
  width,
  setWidth,
  height,
  setHeight,
  artStyle,
  setArtStyle,
  generating,
  onGenerate,
  workflowNote,
  sceneBrief,
  setSceneBrief,
  sceneBriefLoading,
  showSceneBrief,
  layerLabel,
}: {
  open: boolean
  onClose: () => void
  prompt: string
  setPrompt: (v: string) => void
  width: number
  setWidth: (v: number) => void
  height: number
  setHeight: (v: number) => void
  artStyle: string
  setArtStyle: (v: string) => void
  generating: boolean
  onGenerate: () => void
  workflowNote?: string | null
  sceneBrief?: string
  setSceneBrief?: (v: string) => void
  sceneBriefLoading?: boolean
  showSceneBrief?: boolean
  layerLabel?: string
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 anim-fade">
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
        onClick={onClose}
      />
      <div
        className="anim-slide-up relative w-full max-w-lg rounded-[var(--radius-lg)] p-6"
        style={{
          background: 'var(--bg-elev)',
          border: '1px solid var(--border-strong)',
          boxShadow: '0 32px 64px -16px rgba(0,0,0,0.8)',
        }}
      >
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-md"
              style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}
            >
              <Icons.Sparkle size={15} />
            </div>
            <h2 className="text-[15px] font-semibold tracking-tight">
              生成图片
            </h2>
          </div>
          <button onClick={onClose} className="icon-btn" aria-label="关闭">
            <Icons.X size={16} />
          </button>
        </div>

        {workflowNote && (
          <div
            className="mb-4 rounded-[var(--radius-sm)] px-3 py-2.5 text-[11px] leading-relaxed"
            style={{
              background: 'var(--accent-bg)',
              border: '1px solid var(--accent-border)',
              color: 'var(--text-secondary)',
            }}
          >
            {workflowNote}
          </div>
        )}

        <div className="space-y-4">
          {showSceneBrief && setSceneBrief && (
            <div>
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <label
                  className="text-[12px] font-medium"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  场景方向
                </label>
                {sceneBriefLoading ? (
                  <span
                    className="inline-flex items-center gap-1 text-[10px]"
                    style={{ color: 'var(--accent)' }}
                  >
                    <Icons.Spinner size={10} />
                    Deriving from Near…
                  </span>
                ) : (
                  <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    所有图层共享
                  </span>
                )}
              </div>
              <textarea
                value={sceneBrief ?? ''}
                onChange={(e) => setSceneBrief(e.target.value)}
                disabled={generating || sceneBriefLoading}
                placeholder="Generate the Near layer first — we'll derive palette, lighting, and mood from that prompt. You can edit this before generating Mid, Far, and Sky."
                rows={3}
                className="field resize-none text-[13px] leading-relaxed"
              />
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-[12px] font-medium" style={{ color: 'var(--text-secondary)' }}>
              {layerLabel ? `${layerLabel} 图层` : '描述'}
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
                placeholder="例如：金色黄昏下的宽阔山谷，一条蜿蜒河流穿过松林"
              rows={3}
              className="field resize-none"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[12px] font-medium" style={{ color: 'var(--text-secondary)' }}>
                宽度
              </label>
              <select
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
                className="field select-styled"
              >
                {[512, 768, 960, 1024, 1280, 1536, 1920].map((v) => (
                  <option key={v} value={v}>
                    {v}px
                    {v === 1280 ? ' · 720p' : v === 1920 ? ' · 1080p' : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-[12px] font-medium" style={{ color: 'var(--text-secondary)' }}>
                高度
              </label>
              <select
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                className="field select-styled"
              >
                {[360, 540, 720, 768, 1024, 1080, 1280, 1536].map((v) => (
                  <option key={v} value={v}>
                    {v}px
                    {v === 720 ? ' · 720p' : v === 1080 ? ' · 1080p' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[12px] font-medium" style={{ color: 'var(--text-secondary)' }}>
              风格
            </label>
            <select
              value={artStyle}
              onChange={(e) => setArtStyle(e.target.value)}
              className="field select-styled"
            >
              {ART_STYLE_GROUPS.map((group) =>
                group.options.length === 1 && group.label === 'Match original' ? (
                  <option key={group.options[0].value} value={group.options[0].value}>
                    写实
                  </option>
                ) : (
                  <optgroup key={group.label} label={group.label}>
                    {group.options.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </optgroup>
                )
              )}
            </select>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <button onClick={onClose} disabled={generating} className="btn btn-ghost">
            取消
          </button>
          <button
            onClick={onGenerate}
            disabled={generating || !prompt.trim()}
            className="btn btn-primary"
          >
            {generating ? <Icons.Spinner size={14} /> : <Icons.Sparkle size={14} />}
            {generating ? 'Generating…' : 'Generate'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// API key modal — first-run prompt to BYOK
// ─────────────────────────────────────────────────────────────────────────────


export function ApiKeyModal({
  open,
  initialValue,
  required,
  onSave,
  onSkip,
  onClose,
  providerName,
  usingCustomProvider,
}: {
  open: boolean
  initialValue: string
  /** If true, the user can't dismiss without entering a key (no Skip / Esc). */
  required: boolean
  onSave: (key: string) => void
  onSkip?: () => void
  onClose: () => void
  providerName: string
  usingCustomProvider: boolean
}) {
  const [value, setValue] = useState(initialValue)
  const [reveal, setReveal] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    setValue(initialValue)
    setTimeout(() => inputRef.current?.focus(), 50)
  }, [open, initialValue])

  useEffect(() => {
    if (!open || required) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, required, onClose])

  if (!open) return null

  const trimmed = value.trim()
  const looksValid = trimmed.length >= 6
  const providerLabel = usingCustomProvider ? providerName : 'OpenRouter'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 anim-fade">
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
        onClick={() => {
          if (!required) onClose()
        }}
      />
      <div
        className="anim-slide-up relative w-full max-w-md rounded-[var(--radius-lg)] p-6"
        style={{
          background: 'var(--bg-elev)',
          border: '1px solid var(--border-strong)',
          boxShadow: '0 32px 64px -16px rgba(0,0,0,0.8)',
        }}
      >
        <div className="mb-4 flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-md"
            style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}
          >
            <Icons.Key size={17} />
          </div>
          <div className="flex-1">
            <h2 className="text-[15px] font-semibold tracking-tight">
              {required ? '添加 API 密钥' : 'API 密钥'}
            </h2>
            <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
              生成或扩展图片时需要提供。
            </p>
          </div>
          {!required && (
            <button onClick={onClose} className="icon-btn" aria-label="关闭">
              <Icons.X size={16} />
            </button>
          )}
        </div>

        <div className="mb-4">
          <div className="relative">
            <input
              ref={inputRef}
              type={reveal ? 'text' : 'password'}
              autoComplete="off"
              spellCheck={false}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && looksValid) onSave(trimmed)
              }}
              placeholder={usingCustomProvider ? '请输入中转密钥' : 'sk-or-...'}
              className="field pr-10 font-mono text-[13px]"
            />
            <button
              type="button"
              onClick={() => setReveal((r) => !r)}
              className="icon-btn absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
              aria-label={reveal ? '隐藏密钥' : '显示密钥'}
              tabIndex={-1}
            >
              {reveal ? <Icons.EyeOff size={14} /> : <Icons.Eye size={14} />}
            </button>
          </div>
          {value && !looksValid && (
            <div
              className="mt-2 flex items-start gap-2 text-[12px]"
              style={{ color: 'var(--danger)' }}
            >
              <Icons.AlertTriangle size={13} className="mt-0.5 shrink-0" />
              <span>请输入你的服务商或中转平台签发的密钥。</span>
            </div>
          )}
          {usingCustomProvider && (
            <div className="mt-2 text-[12px]" style={{ color: 'var(--text-muted)' }}>
              中转节点：<code className="font-mono">{providerLabel}</code>
            </div>
          )}
        </div>

        <div
          className="mb-4 rounded-[var(--radius-sm)] p-3 text-[12px] leading-relaxed"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            color: 'var(--text-secondary)',
          }}
        >
          Your key is stored only in this browser&apos;s <code className="font-mono">localStorage</code>.
          It&apos;s sent with each request to your local server, which proxies it to OpenRouter — never logged, never persisted server-side.
        </div>

        {!usingCustomProvider && (
          <a
            href="https://openrouter.ai/keys"
            target="_blank"
            rel="noopener noreferrer"
            className="mb-5 inline-flex items-center gap-1.5 text-[12px] transition-colors"
            style={{ color: 'var(--accent)' }}
          >
            前往 openrouter.ai/keys 获取密钥
            <Icons.External size={11} />
          </a>
        )}

        <div className="flex items-center justify-between gap-2">
          {onSkip ? (
            <button onClick={onSkip} className="btn btn-ghost">
              使用服务端环境变量
            </button>
          ) : (
            <span />
          )}
          <button
            onClick={() => onSave(trimmed)}
            disabled={!looksValid}
            className="btn btn-primary"
          >
            <Icons.Check size={14} />
            保存密钥
          </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Error toast — slides in at the top, auto-dismisses
// ─────────────────────────────────────────────────────────────────────────────


export function ErrorToast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 6000)
    return () => clearTimeout(t)
  }, [onClose])
  return (
    <div
      className="fixed left-1/2 top-4 z-50 -translate-x-1/2 anim-slide-down"
      role="alert"
    >
      <div
        className="flex items-start gap-3 rounded-[var(--radius)] px-4 py-3"
        style={{
          background: 'var(--bg-elev)',
          border: '1px solid rgba(255, 107, 107, 0.35)',
          boxShadow: '0 16px 40px -12px rgba(0,0,0,0.6)',
          maxWidth: 480,
        }}
      >
        <div className="mt-0.5" style={{ color: 'var(--danger)' }}>
          <Icons.X size={16} />
        </div>
        <div className="flex-1 text-[13px]" style={{ color: 'var(--text)' }}>
          {message}
        </div>
        <button onClick={onClose} className="icon-btn -m-1.5 h-7 w-7">
          <Icons.X size={14} />
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main orchestrator
// ─────────────────────────────────────────────────────────────────────────────

