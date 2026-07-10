'use client'

import { useEffect, useRef, useState } from 'react'
import { Icons } from '@/app/components/icons'
import { ART_STYLE_GROUPS } from '@/app/lib/artStyles'
import {
  SPRITE_FACING_LABELS,
  SPRITE_ANIMATIONS,
  SPRITE_FRAME_COUNT,
  SPRITE_FRAME_SIZE,
  SPRITE_SHEET_H,
  SPRITE_SHEET_W,
  SpriteAnimType,
  SpriteFacing,
  SpriteFrame,
  SpriteSheet,
} from '@/app/lib/sprite'
import { BODY_PLANS, BODY_PLAN_ORDER, BodyPlan } from '@/app/lib/bodyPlans'

export function SpriteAnimationPlayer({
  frames,
  fps,
  loop,
  playing,
  setPlaying,
  anchorImageUrl,
  anchorUploaded,
}: {
  frames: SpriteFrame[]
  fps: number
  loop: boolean
  playing: boolean
  setPlaying: (v: boolean) => void
  anchorImageUrl?: string | null
  anchorUploaded?: boolean
}) {
  const [currentIdx, setCurrentIdx] = useState(0)
  const populated = frames.filter((f) => !!f.imageUrl && !f.disabled)
  const hasFrames = populated.length > 0
  const frameCount = populated.length

  useEffect(() => {
    if (!playing || !hasFrames) return
    const intervalMs = Math.max(1, Math.round(1000 / Math.max(1, fps)))
    let stopped = false
    const id = window.setInterval(() => {
      if (stopped) return
      setCurrentIdx((prev) => {
        const next = prev + 1
        if (next >= frameCount) {
          if (loop) return 0
          stopped = true
          window.clearInterval(id)
          queueMicrotask(() => setPlaying(false))
          return frameCount - 1
        }
        return next
      })
    }, intervalMs)
    return () => {
      stopped = true
      window.clearInterval(id)
    }
  }, [playing, fps, loop, frameCount, hasFrames, setPlaying])

  useEffect(() => {
    setCurrentIdx(0)
  }, [frameCount])

  const handleTogglePlay = () => {
    if (!playing && !loop && hasFrames && currentIdx >= frameCount - 1) {
      setCurrentIdx(0)
    }
    setPlaying(!playing)
  }

  const activeFrame = populated[currentIdx] ?? populated[0] ?? null

  return (
    <div className="flex w-full flex-col gap-2">
      <div
        className="flex items-center justify-between text-[11px] font-medium uppercase tracking-wider"
        style={{ color: 'var(--text-muted)' }}
      >
        <span>实时预览</span>
        <span
          className="font-mono normal-case tracking-normal"
          style={{ color: 'var(--text-muted)' }}
        >
          {hasFrames ? `第 ${currentIdx + 1}/${populated.length} 帧 · ${fps} FPS` : '暂无帧'}
        </span>
      </div>

      <div
        className="checker relative flex items-center justify-center overflow-hidden rounded-[var(--radius-lg)]"
        style={{
          aspectRatio: '1 / 1',
          width: '100%',
          border: '1px solid var(--border)',
          background:
            'linear-gradient(180deg, rgba(140, 195, 235, 0.15), rgba(40, 70, 110, 0.25))',
          boxShadow:
            '0 1px 0 rgba(255,255,255,0.04) inset, 0 24px 48px -12px rgba(0,0,0,0.5)',
        }}
      >
        {activeFrame?.imageUrl ? (
          <img
            src={activeFrame.imageUrl}
            alt={`第 ${activeFrame.index + 1} 帧`}
            draggable={false}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              imageRendering: 'pixelated',
            }}
          />
        ) : anchorImageUrl ? (
          <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-6">
            <img
              src={anchorImageUrl}
              alt="已锁定角色"
              draggable={false}
              style={{
                maxWidth: '62%',
                maxHeight: '62%',
                objectFit: 'contain',
                imageRendering: 'pixelated',
                filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.45))',
              }}
            />
            <div className="flex flex-col items-center gap-1 text-center">
              <span
                className="rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider"
                style={{
                  background: 'var(--accent-bg)',
                  color: 'var(--accent)',
                  border: '1px solid var(--accent)',
                }}
              >
                {anchorUploaded ? '已上传角色' : '角色已就绪'}
              </span>
              <span className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
                选择一个动作并点击生成，让角色动起来
              </span>
            </div>
          </div>
        ) : (
          <div className="text-[13px]" style={{ color: 'var(--text-muted)' }}>
            生成精灵表后即可在这里预览动画
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleTogglePlay}
          disabled={!hasFrames}
          className="icon-btn"
          aria-label={playing ? '暂停' : '播放'}
          title={playing ? '暂停' : '播放'}
          style={{ opacity: hasFrames ? 1 : 0.4 }}
        >
          {playing ? <Icons.Pause size={14} /> : <Icons.Play size={14} />}
        </button>
        <input
          type="range"
          min={0}
          max={Math.max(0, populated.length - 1)}
          value={Math.min(currentIdx, Math.max(0, populated.length - 1))}
          onChange={(e) => {
            setPlaying(false)
            setCurrentIdx(Number(e.target.value))
          }}
          disabled={!hasFrames}
          className="parallax-slider flex-1"
          aria-label="拖动查看帧"
        />
      </div>
    </div>
  )
}

export function SpriteFrameCell({
  frame,
  size,
  highlight,
  loading,
  onToggle,
}: {
  frame: SpriteFrame
  size: number
  highlight: boolean
  loading?: boolean
  onToggle?: (index: number) => void
}) {
  const hasImage = !!frame.imageUrl
  const disabled = !!frame.disabled
  const interactive = hasImage && !!onToggle && !loading
  return (
    <div
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={interactive ? () => onToggle(frame.index) : undefined}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onToggle(frame.index)
              }
            }
          : undefined
      }
      className="group relative checker overflow-hidden rounded-[var(--radius-md)] anim-fade"
      style={{
        border: `1px solid ${
          disabled
            ? 'var(--danger, #e5484d)'
            : highlight
              ? 'var(--accent)'
              : 'var(--border)'
        }`,
        aspectRatio: '1 / 1',
        cursor: interactive ? 'pointer' : 'default',
      }}
      title={
        interactive
          ? disabled
            ? `第 ${frame.index + 1} 帧：已排除，点击恢复`
            : `第 ${frame.index + 1} 帧：点击后从动画和导出中排除`
          : `第 ${frame.index + 1} 帧`
      }
    >
      {hasImage ? (
        <img
          src={frame.imageUrl as string}
          alt={`第 ${frame.index + 1} 帧`}
          draggable={false}
          className="block h-full w-full"
          style={{
            objectFit: 'contain',
            imageRendering: 'pixelated',
            opacity: disabled ? 0.28 : 1,
            filter: disabled ? 'grayscale(1)' : 'none',
            transition: 'opacity 0.12s ease, filter 0.12s ease',
          }}
        />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center text-[10px] font-mono"
          style={{
            color: 'var(--text-muted)',
            background:
              'repeating-linear-gradient(45deg, transparent 0 6px, rgba(255,255,255,0.025) 6px 12px)',
          }}
        >
          {frame.index + 1}
        </div>
      )}

      {loading && !hasImage && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.55)' }}
        >
          <Icons.Spinner size={16} className="text-[color:var(--accent)]" />
        </div>
      )}

      {disabled && (
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          style={{
            background:
              'repeating-linear-gradient(45deg, rgba(229,72,77,0.10) 0 7px, rgba(0,0,0,0) 7px 14px)',
          }}
        >
          <span
            className="rounded px-1.5 py-px font-mono text-[9px] font-semibold uppercase tracking-wider"
            style={{
              background: 'rgba(229,72,77,0.9)',
              color: '#fff',
              boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
            }}
          >
            已排除
          </span>
        </div>
      )}

      <div
        className="pointer-events-none absolute left-1 top-1 rounded px-1 py-px font-mono text-[9px]"
        style={{
          background: 'rgba(0,0,0,0.55)',
          color: 'var(--text-secondary)',
          backdropFilter: 'blur(4px)',
        }}
      >
        {frame.index + 1}
      </div>

      {interactive && (
        <div
          className={`pointer-events-none absolute right-1 top-1 rounded p-0.5 transition-opacity ${
            disabled ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
          style={{
            background: 'rgba(0,0,0,0.55)',
            color: disabled ? 'var(--danger, #e5484d)' : 'var(--text-secondary)',
            backdropFilter: 'blur(4px)',
          }}
        >
          {disabled ? <Icons.EyeOff size={12} /> : <Icons.Eye size={12} />}
        </div>
      )}
    </div>
  )
}

function SpriteBgRemovalTool({
  sourceImageUrl,
  resultImageUrl,
  processing,
  onUpload,
  onClear,
  onDownload,
}: {
  sourceImageUrl: string | null
  resultImageUrl: string | null
  processing: boolean
  onUpload: (file: File) => void
  onClear: () => void
  onDownload: () => void
}) {
  const uploadInputRef = useRef<HTMLInputElement | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const hasResult = !!resultImageUrl

  return (
    <aside
      className="flex h-full flex-col gap-3 rounded-[var(--radius-lg)] p-3"
      style={{
        border: '1px solid var(--border)',
        background: 'var(--bg-elev)',
        boxShadow: '0 18px 40px -18px rgba(0,0,0,0.55)',
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span
            className="text-[11px] font-medium uppercase tracking-wider"
            style={{ color: 'var(--text-muted)' }}
          >
            背景透明化
          </span>
          <span className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>
            上传白底、棋盘格或纯色背景图片，输出透明 PNG。
          </span>
        </div>
        {processing && <Icons.Spinner size={15} className="text-[color:var(--accent)]" />}
      </div>

      <input
        ref={uploadInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onUpload(file)
          e.target.value = ''
        }}
      />

      <button
        type="button"
        onClick={() => !processing && uploadInputRef.current?.click()}
        disabled={processing}
        onDragOver={(e) => {
          if (processing) return
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          if (processing) return
          const file = e.dataTransfer.files?.[0]
          if (file) onUpload(file)
        }}
        className="group flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3.5 py-3 text-left transition-colors"
        style={{
          border: `1.5px dashed ${dragOver ? 'var(--accent)' : 'var(--border-strong)'}`,
          background: dragOver ? 'var(--accent-bg)' : 'var(--bg)',
          cursor: processing ? 'not-allowed' : 'pointer',
          opacity: processing ? 0.6 : 1,
        }}
      >
        <span
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full transition-colors"
          style={{
            background: dragOver ? 'var(--accent)' : 'var(--bg-elev)',
            color: dragOver ? '#fff' : 'var(--accent)',
            border: '1px solid var(--border)',
          }}
        >
          <Icons.Upload size={15} />
        </span>
        <span className="flex min-w-0 flex-col">
          <span className="text-[13px] font-medium" style={{ color: 'var(--text)' }}>
            {hasResult ? '更换图片' : '上传待抠图图片'}
          </span>
          <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
            拖到这里，或点击选择文件
          </span>
        </span>
      </button>

      <div className="grid grid-cols-1 gap-3">
        <div className="flex flex-col gap-1.5">
          <span
            className="text-[11px] font-medium uppercase tracking-wider"
            style={{ color: 'var(--text-muted)' }}
          >
            原图
          </span>
          <div
            className="relative overflow-hidden rounded-[var(--radius-md)]"
            style={{
              aspectRatio: '1 / 1',
              border: '1px solid var(--border)',
              background: 'var(--bg)',
            }}
          >
            {sourceImageUrl ? (
              <img
                src={sourceImageUrl}
                alt="原图预览"
                draggable={false}
                className="h-full w-full"
                style={{ objectFit: 'contain' }}
              />
            ) : (
              <div
                className="flex h-full items-center justify-center px-4 text-center text-[12px]"
                style={{ color: 'var(--text-muted)' }}
              >
                上传后在这里显示原图
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <span
            className="text-[11px] font-medium uppercase tracking-wider"
            style={{ color: 'var(--text-muted)' }}
          >
            透明结果
          </span>
          <div
            className="checker relative overflow-hidden rounded-[var(--radius-md)]"
            style={{
              aspectRatio: '1 / 1',
              border: '1px solid var(--border)',
              background:
                'linear-gradient(180deg, rgba(140, 195, 235, 0.08), rgba(40, 70, 110, 0.12))',
            }}
          >
            {resultImageUrl ? (
              <img
                src={resultImageUrl}
                alt="透明结果预览"
                draggable={false}
                className="h-full w-full"
                style={{ objectFit: 'contain' }}
              />
            ) : (
              <div
                className="flex h-full items-center justify-center px-4 text-center text-[12px]"
                style={{ color: 'var(--text-muted)' }}
              >
                处理完成后在这里显示透明结果
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onDownload}
          disabled={!hasResult || processing}
          className="btn btn-secondary"
          title="下载透明 PNG"
        >
          <Icons.Download size={14} />
          下载 PNG
        </button>
        <button
          type="button"
          onClick={onClear}
          disabled={(!sourceImageUrl && !resultImageUrl) || processing}
          className="btn btn-ghost"
          title="清空当前图片"
        >
          <Icons.Trash size={14} />
          清空
        </button>
      </div>
    </aside>
  )
}

export function SpriteStudio({
  sheet,
  anchor,
  bodyPlan,
  setBodyPlan,
  selectedAnim,
  setSelectedAnim,
  attackFacing,
  setAttackFacing,
  generatedAnims,
  prompt,
  setPrompt,
  fps,
  setFps,
  artStyle,
  setArtStyle,
  generating,
  progressMessage,
  onGenerate,
  onRerollCharacter,
  onUploadCharacter,
  onRemoveUploadedCharacter,
  onStop,
  onClear,
  onDownloadSheet,
  onDownloadZip,
  onToggleFrame,
  bgToolSource,
  bgToolResult,
  bgToolProcessing,
  onUploadBgToolImage,
  onClearBgTool,
  onDownloadBgTool,
}: {
  sheet: SpriteSheet
  anchor: {
    imageUrl: string
    rawImageUrl: string
    prompt: string
    uploaded?: boolean
  } | null
  bodyPlan: BodyPlan
  setBodyPlan: (v: BodyPlan) => void
  selectedAnim: SpriteAnimType
  setSelectedAnim: (v: SpriteAnimType) => void
  attackFacing: SpriteFacing
  setAttackFacing: (v: SpriteFacing) => void
  generatedAnims: Set<SpriteAnimType>
  prompt: string
  setPrompt: (v: string) => void
  fps: number
  setFps: (v: number) => void
  artStyle: string
  setArtStyle: (v: string) => void
  generating: boolean
  progressMessage?: string | null
  onGenerate: () => void
  onRerollCharacter: () => void
  onUploadCharacter: (file: File) => void
  onRemoveUploadedCharacter: () => void
  onStop: () => void
  onClear: () => void
  onDownloadSheet: () => void
  onDownloadZip: () => void
  onToggleFrame: (index: number) => void
  bgToolSource: string | null
  bgToolResult: string | null
  bgToolProcessing: boolean
  onUploadBgToolImage: (file: File) => void
  onClearBgTool: () => void
  onDownloadBgTool: () => void
}) {
  const [playing, setPlaying] = useState(true)
  const [dragOver, setDragOver] = useState(false)
  const uploadInputRef = useRef<HTMLInputElement | null>(null)
  const spec = SPRITE_ANIMATIONS[selectedAnim]
  const filledCount = sheet.frames.filter((f) => !!f.imageUrl).length
  const activeCount = sheet.frames.filter((f) => !!f.imageUrl && !f.disabled).length
  const excludedCount = filledCount - activeCount
  const hasAny = filledCount > 0
  const canGenerate = !!prompt.trim() || !!anchor?.uploaded

  useEffect(() => {
    if (hasAny) setPlaying(true)
  }, [hasAny, sheet.anim, sheet.gridSheetUrl])

  return (
    <div className="flex flex-1 flex-col gap-3 px-4 pb-4 pt-3 sm:px-6">
      <div className="flex items-center justify-center gap-2 text-[12px]">
        <Icons.Play size={12} className="text-[color:var(--accent)]" />
        <span style={{ color: 'var(--text-secondary)' }}>
          精灵模式：先选体型，再选动作。第 1 步生成角色锚点，第 2 步把 8 个关键帧绘制到固定姿势图上。同一个角色可以复用到多个动作里。
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-1.5">
        <span
          className="mr-1 text-[11px] font-medium uppercase tracking-wider"
          style={{ color: 'var(--text-muted)' }}
        >
          体型方案
        </span>
        {BODY_PLAN_ORDER.map((planId) => {
          const plan = BODY_PLANS[planId]
          const active = bodyPlan === planId
          return (
            <button
              key={planId}
              type="button"
              onClick={() => setBodyPlan(planId)}
              disabled={generating}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-medium transition-colors"
              style={{
                border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                background: active ? 'var(--accent-bg)' : 'var(--bg-elev)',
                color: active ? 'var(--accent)' : 'var(--text-secondary)',
                cursor: generating ? 'not-allowed' : 'pointer',
                opacity: generating ? 0.5 : 1,
              }}
              title={plan.hint}
            >
              {plan.label}
            </button>
          )
        })}
      </div>
      {bodyPlan === 'biped' && selectedAnim === 'attack' && (
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          <span
            className="mr-1 text-[11px] font-medium uppercase tracking-wider"
            style={{ color: 'var(--text-muted)' }}
          >
            攻击朝向
          </span>
          {(Object.keys(SPRITE_FACING_LABELS) as SpriteFacing[]).map((facing) => {
            const active = attackFacing === facing
            return (
              <button
                key={facing}
                type="button"
                onClick={() => setAttackFacing(facing)}
                disabled={generating}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-medium transition-colors"
                style={{
                  border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                  background: active ? 'var(--accent-bg)' : 'var(--bg-elev)',
                  color: active ? 'var(--accent)' : 'var(--text-secondary)',
                  cursor: generating ? 'not-allowed' : 'pointer',
                  opacity: generating ? 0.5 : 1,
                }}
                title={`攻击朝向：${SPRITE_FACING_LABELS[facing]}`}
              >
                {SPRITE_FACING_LABELS[facing]}
              </button>
            )
          })}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-center gap-1.5">
        {BODY_PLANS[bodyPlan].anims.map((animType) => {
          const animSpec = SPRITE_ANIMATIONS[animType]
          const active = selectedAnim === animType
          const hasSaved = generatedAnims.has(animType) && !active
          return (
            <button
              key={animType}
              type="button"
              onClick={() => setSelectedAnim(animType)}
              disabled={generating}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-medium transition-colors"
              style={{
                border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                background: active ? 'var(--accent-bg)' : 'var(--bg-elev)',
                color: active ? 'var(--accent)' : 'var(--text-secondary)',
                cursor: generating ? 'not-allowed' : 'pointer',
                opacity: generating ? 0.5 : 1,
              }}
              title={hasSaved ? `${animSpec.hint} · 已生成，点击查看` : animSpec.hint}
            >
              {animSpec.label}
              {hasSaved && (
                <span
                  className="inline-block h-1.5 w-1.5 rounded-full"
                  style={{ background: 'var(--accent)' }}
                  aria-label="该动作已生成"
                />
              )}
            </button>
          )
        })}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        {generating ? (
          <button onClick={onStop} className="btn btn-danger" title="停止当前生成">
            <Icons.Stop size={14} />
            停止
          </button>
        ) : (
          <button
            onClick={onGenerate}
            disabled={!canGenerate}
            className="btn btn-primary"
            title={
              anchor
                ? `基于现有角色生成${spec.label}精灵表（跳过锚点步骤，更快）`
                : `两阶段生成：先锁定角色（第 1 步），再绘制${spec.label}精灵表（第 2 步）`
            }
          >
            <Icons.Sparkle size={14} />
            {anchor ? (hasAny ? `重生成${spec.label}` : `生成${spec.label}`) : `锁定角色 + ${spec.label}`}
          </button>
        )}
        {anchor && !generating && (
          <button
            onClick={onRerollCharacter}
            disabled={!prompt.trim()}
            className="btn btn-secondary"
            title="丢弃当前角色，并重新生成新的锚点和精灵表"
          >
            <Icons.Refresh size={14} />
            重生角色
          </button>
        )}
        <button
          onClick={onDownloadSheet}
          disabled={!hasAny || generating}
          className="btn btn-secondary"
          title="导出网格图、横向条带图和 JSON 清单"
        >
          <Icons.Download size={14} />
          图表 + 清单
        </button>
        <button
          onClick={onDownloadZip}
          disabled={!hasAny || generating}
          className="btn btn-ghost"
          title="导出独立帧 PNG、网格图、条带图和清单 ZIP"
        >
          <Icons.Layers size={14} />
          ZIP
        </button>
        <button
          onClick={onClear}
          disabled={(!hasAny && !anchor) || generating}
          className="btn btn-ghost"
          title="清空帧、角色锚点和提示词"
        >
          <Icons.Trash size={14} />
          清空
        </button>
        <div
          className="rounded-full border px-2.5 py-1 font-mono text-[11px]"
          style={{
            borderColor: 'var(--border)',
            background: 'var(--bg-elev)',
            color: hasAny ? 'var(--text-secondary)' : 'var(--text-muted)',
          }}
        >
          {filledCount}/{SPRITE_FRAME_COUNT} 帧
          {progressMessage ? ` · ${progressMessage}` : ''}
        </div>
      </div>

      <div className="grid w-full flex-1 grid-cols-1 gap-6 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] xl:grid-cols-[minmax(0,380px)_minmax(0,1fr)_320px]">
        <div className="flex flex-col gap-3">
          <SpriteAnimationPlayer
            frames={sheet.frames}
            fps={fps}
            loop={spec.loop}
            playing={playing}
            setPlaying={setPlaying}
            anchorImageUrl={anchor?.imageUrl ?? null}
            anchorUploaded={anchor?.uploaded}
          />
          <div
            className="flex items-center gap-2 rounded-[var(--radius-md)] px-3 py-2"
            style={{
              border: '1px solid var(--border)',
              background: 'var(--bg-elev)',
            }}
          >
            <label
              className="text-[11px] font-medium uppercase tracking-wider"
              style={{ color: 'var(--text-muted)' }}
            >
              FPS
            </label>
            <input
              type="range"
              min={1}
              max={30}
              value={fps}
              onChange={(e) => setFps(Number(e.target.value))}
              className="parallax-slider flex-1"
              aria-label="播放 FPS"
            />
            <span
              className="w-9 text-right font-mono text-[12px]"
              style={{ color: 'var(--text-secondary)' }}
            >
              {fps}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div
            className="flex items-center justify-between text-[11px] font-medium uppercase tracking-wider"
            style={{ color: 'var(--text-muted)' }}
          >
            <span>帧表（4×2）</span>
            <span
              className="font-mono normal-case tracking-normal"
              style={{ color: 'var(--text-muted)' }}
            >
              {SPRITE_SHEET_W}×{SPRITE_SHEET_H} 导出
            </span>
          </div>
          <div
            className="grid w-full"
            style={{
              gridTemplateColumns: `repeat(${SPRITE_FRAME_COUNT}, 1fr)`,
              gap: '6px',
            }}
          >
            {sheet.frames.map((frame, i) => (
              <SpriteFrameCell
                key={i}
                frame={frame}
                size={SPRITE_FRAME_SIZE}
                highlight={false}
                loading={generating && !frame.imageUrl}
                onToggle={onToggleFrame}
              />
            ))}
          </div>
          <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
            点击某一帧可将其从动画和所有导出中排除；再次点击可恢复。
            {excludedCount > 0 && (
              <span style={{ color: 'var(--danger, #e5484d)' }}>
                {' '}
                已排除 {excludedCount} 帧 · 生效中 {activeCount} 帧。
              </span>
            )}{' '}
            按行读取顺序：左上是第 1 帧，右上是第 4 帧，左下是第 5 帧。
          </div>

          <div className="mt-1 flex w-full flex-col gap-2">
            <div className="flex flex-col gap-2.5">
              <label
                className="text-[11px] font-medium uppercase tracking-wider"
                style={{ color: 'var(--text-muted)' }}
              >
                角色
              </label>

              <input
                ref={uploadInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) onUploadCharacter(file)
                  e.target.value = ''
                }}
              />
              <button
                type="button"
                onClick={() => !generating && uploadInputRef.current?.click()}
                disabled={generating}
                onDragOver={(e) => {
                  if (generating) return
                  e.preventDefault()
                  setDragOver(true)
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setDragOver(false)
                  if (generating) return
                  const file = e.dataTransfer.files?.[0]
                  if (file) onUploadCharacter(file)
                }}
                className="group flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3.5 py-3 text-left transition-colors"
                style={{
                  border: `1.5px dashed ${dragOver ? 'var(--accent)' : 'var(--border-strong)'}`,
                  background: dragOver ? 'var(--accent-bg)' : 'var(--bg-elev)',
                  cursor: generating ? 'not-allowed' : 'pointer',
                  opacity: generating ? 0.5 : 1,
                }}
                title="上传你自己的角色图像，并直接为它生成动画"
              >
                <span
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full transition-colors"
                  style={{
                    background: dragOver ? 'var(--accent)' : 'var(--bg)',
                    color: dragOver ? '#fff' : 'var(--accent)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <Icons.Upload size={15} />
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="text-[13px] font-medium" style={{ color: 'var(--text)' }}>
                    {anchor?.uploaded ? '替换已上传角色' : '上传自己的角色'}
                  </span>
                  <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                    拖拽到这里，或点击选择文件 · 透明 PNG 效果最好
                  </span>
                </span>
              </button>

              {anchor?.uploaded && (
                <button
                  type="button"
                  onClick={onRemoveUploadedCharacter}
                  disabled={generating}
                  className="inline-flex items-center gap-1.5 self-start rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors"
                  style={{
                    border: '1px solid var(--border)',
                    background: 'var(--bg-elev)',
                    color: 'var(--danger, #e5484d)',
                    cursor: generating ? 'not-allowed' : 'pointer',
                    opacity: generating ? 0.5 : 1,
                  }}
                  title="移除已上传角色，改用文字提示词"
                >
                  <Icons.Trash size={12} />
                  移除已上传角色
                </button>
              )}

              <div className="flex items-center gap-2">
                <span className="h-px flex-1" style={{ background: 'var(--border)' }} />
                <span
                  className="text-[10px] font-medium uppercase tracking-wider"
                  style={{ color: 'var(--text-muted)' }}
                >
                  或选择一个预设
                </span>
                <span className="h-px flex-1" style={{ background: 'var(--border)' }} />
              </div>

              <div className="flex flex-wrap gap-1.5">
                {BODY_PLANS[bodyPlan].presets.map((preset) => {
                  const active = prompt.trim() === preset.prompt
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setPrompt(preset.prompt)}
                      disabled={generating}
                      className="rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors"
                      style={{
                        border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                        background: active ? 'var(--accent-bg)' : 'var(--bg-elev)',
                        color: active ? 'var(--accent)' : 'var(--text-secondary)',
                        cursor: generating ? 'not-allowed' : 'pointer',
                        opacity: generating ? 0.5 : 1,
                      }}
                      title={preset.prompt}
                    >
                      {preset.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div
              className="flex w-full items-stretch gap-2 rounded-[var(--radius-lg)] p-1.5"
              style={{
                background: 'var(--bg-elev)',
                border: '1px solid var(--border-strong)',
                boxShadow: '0 12px 32px -12px rgba(0,0,0,0.6)',
              }}
            >
              <input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={generating}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && canGenerate && !generating) {
                    e.preventDefault()
                    onGenerate()
                  }
                }}
                placeholder={
                  anchor?.uploaded ? '可选：补充描述角色，细化结果' : '描述角色，或直接选择上方预设'
                }
                className="flex-1 bg-transparent px-3 py-2.5 text-[14px] focus:outline-none"
                style={{ color: 'var(--text)' }}
              />
              <div className="hidden items-center sm:flex" style={{ borderLeft: '1px solid var(--border)' }}>
                <select
                  value={artStyle}
                  onChange={(e) => setArtStyle(e.target.value)}
                  disabled={generating}
                  className="select-styled cursor-pointer border-0 bg-transparent py-2 pl-3 pr-7 text-[13px] focus:outline-none"
                  style={{ color: 'var(--text-secondary)' }}
                  title="精灵表的美术风格"
                >
                  {ART_STYLE_GROUPS.map((group) =>
                    group.options.length === 1 && group.label === 'Match original' ? (
                      <option key={group.options[0].value} value={group.options[0].value}>
                        {group.options[0].label}
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
          </div>
        </div>

        <div className="lg:col-span-2 xl:col-span-1">
          <SpriteBgRemovalTool
            sourceImageUrl={bgToolSource}
            resultImageUrl={bgToolResult}
            processing={bgToolProcessing}
            onUpload={onUploadBgToolImage}
            onClear={onClearBgTool}
            onDownload={onDownloadBgTool}
          />
        </div>
      </div>
    </div>
  )
}
