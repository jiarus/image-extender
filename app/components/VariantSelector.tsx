'use client'

import { Icons } from '@/app/components/icons'

export function VariantSelector({
  index,
  total,
  isBest,
  score,
  onPrev,
  onNext,
}: {
  index: number
  total: number
  isBest: boolean
  score?: number
  onPrev: () => void
  onNext: () => void
}) {
  return (
    <div
      className="inline-flex items-center gap-1 rounded-full border py-0.5 pl-1 pr-2 anim-fade"
      style={{
        borderColor: 'var(--border-strong)',
        background: 'var(--bg-elev)',
      }}
      role="group"
      aria-label="切换扩图候选结果"
    >
      <button
        onClick={onPrev}
        className="icon-btn h-6 w-6"
        aria-label="上一个候选"
        title="上一个候选"
      >
        <Icons.ArrowLeft size={13} />
      </button>
      <span
        className="font-mono text-[11px] tabular-nums"
        style={{ color: 'var(--text-secondary)' }}
      >
        候选 {index + 1}/{total}
      </span>
      {isBest && (
        <span
          className="rounded-full px-1.5 py-px text-[10px] font-medium tracking-wide"
          style={{
            background: 'var(--accent-bg)',
            color: 'var(--accent)',
            border: '1px solid var(--accent-border)',
          }}
          title="算法选择的最佳结果：拼缝残差最低"
        >
          最佳
        </span>
      )}
      {typeof score === 'number' && (
        <span
          className="font-mono text-[10px]"
          style={{ color: 'var(--text-muted)' }}
          title="拼缝处平均色差，越低越好"
        >
          {score.toFixed(1)}
        </span>
      )}
      <button
        onClick={onNext}
        className="icon-btn h-6 w-6"
        aria-label="下一个候选"
        title="下一个候选"
      >
        <Icons.ArrowRight size={13} />
      </button>
    </div>
  )
}

export function ResultActions({
  onAccept,
  onRegenerate,
  onDiscard,
  onDownload,
  loading,
}: {
  onAccept: () => void
  onRegenerate: () => void
  onDiscard: () => void
  onDownload: () => void
  loading: boolean
}) {
  return (
    <div
      className="flex items-center gap-1.5 rounded-full border p-1"
      style={{
        background: 'var(--bg-elev)',
        borderColor: 'var(--border-strong)',
        boxShadow: '0 12px 32px -16px rgba(0,0,0,0.6)',
      }}
    >
      <button
        onClick={onDiscard}
        disabled={loading}
        className="btn btn-ghost"
        title="丢弃这次扩图"
      >
        <Icons.X size={14} />
        丢弃
      </button>
      <button
        onClick={onRegenerate}
        disabled={loading}
        className="btn btn-ghost"
        title="重新生成一个新版本"
      >
        {loading ? <Icons.Spinner size={14} /> : <Icons.Refresh size={14} />}
        重生成
      </button>
      <button
        onClick={onDownload}
        disabled={loading}
        className="btn btn-ghost"
        title="下载为 PNG"
      >
        <Icons.Download size={14} />
        下载
      </button>
      <div
        className="mx-1 h-5 w-px"
        style={{ background: 'var(--border)' }}
        aria-hidden
      />
      <button
        onClick={onAccept}
        disabled={loading}
        className="btn btn-primary"
        title="将当前结果作为新的基础图"
      >
        <Icons.Check size={14} />
        接受
      </button>
    </div>
  )
}
