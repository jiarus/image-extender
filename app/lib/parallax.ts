'use client'

export const PARALLAX_TARGET_PRESETS: { value: number; label: string; hint: string }[] = [
  { value: 3840, label: '3840 像素', hint: '2 个 1080p 屏宽' },
  { value: 5120, label: '5120 像素', hint: '4 个 720p 屏宽' },
  { value: 7680, label: '7680 像素', hint: '4 个 1080p 屏宽' },
  { value: 10240, label: '10240 像素', hint: '8 个 720p 屏宽' },
  { value: 15360, label: '15360 像素', hint: '8 个 1080p 屏宽' },
]

/** Hard upper bound on auto-extend iterations as a cost/time safety. */

export const PARALLAX_MAX_AUTO_STEPS = 14

// ─────────────────────────────────────────────────────────────────────────────
// Parallax layers — the actual model behind the parallax studio. Four classic
// depth bands: Sky (back, opaque), Far (distant silhouettes), Mid (mid-ground
// elements), Near (foreground props). Each non-sky layer is rendered against
// a flat magenta key that we client-side replace with transparency.
// ─────────────────────────────────────────────────────────────────────────────


export type LayerRole = 'sky' | 'far' | 'mid' | 'near'

export interface ParallaxLayer {
  id: string
  role: LayerRole
  /** Display image. For Sky this is the raw output; for keyed layers it has
   * had magenta replaced with alpha. */
  imageUrl: string | null
  /** Pre-keying source. For Sky this matches imageUrl; for keyed layers it's
   * the un-keyed magenta version we feed back into the extend pipeline. */
  rawImageUrl: string | null
  width: number | null
  height: number | null
  /** Multiplier on the base scroll speed in the live preview. Sky drifts very
   * slowly (≈parallax-distant), foreground moves at 1×. */
  scrollSpeed: number
  /** Did this layer come from upload (vs generate/extend)? Used so we don't
   * re-key uploads automatically — uploads already have their own alpha. */
  fromUpload: boolean
}


export interface LayerRoleSpec {
  role: LayerRole
  label: string
  short: string
  defaultSpeed: number
  isOpaque: boolean
  /** Sensible default text-to-image prompt the user can tweak. */
  defaultPrompt: string
  /** One-line description shown in the layer card. */
  hint: string
  /** Default starter dimensions for text-to-image generation. Sky covers
   * the full sky-to-horizon band so it's the tallest; keyed layers only
   * need to cover the band their elements sit in, so they're shorter.
   * All of them are intentionally wider than 1× viewport so the resulting
   * tile has natural variation across a scroll. */
  defaultWidth: number
  defaultHeight: number
}


export const LAYER_ROLES: Record<LayerRole, LayerRoleSpec> = {
  sky: {
    role: 'sky',
    label: '天空 · 远后景',
    short: '天空',
    defaultSpeed: 0.05,
    isOpaque: true,
    defaultPrompt:
      'A wide continuous sky with horizontally uniform color — every horizontal position has the same sky tone, with any gradient running only top-to-bottom (e.g. lighter at the horizon, deeper toward the zenith). Soft level horizon with a thin band of very-distant silhouette at the bottom. Even ambient omnidirectional light. No sun, no moon, no sunbeams, no sunrise or sunset glow on one side, no directional lighting, no vignette, no characters, no foreground objects. Designed to repeat seamlessly when tiled horizontally.',
    hint: '不透明背景层，滚动最慢。',
    defaultWidth: 1899,
    defaultHeight: 768,
  },
  far: {
    role: 'far',
    label: '远景 · 远处轮廓',
    short: '远景',
    defaultSpeed: 0.25,
    isOpaque: false,
    defaultPrompt:
      'Far-distant silhouettes only — distant mountain range or faint city skyline, sitting in the lower-middle band of the frame. No sky, no mid-ground, no foreground.',
    hint: '远处轮廓层，滚动较慢。',
    defaultWidth: 1952,
    defaultHeight: 544,
  },
  mid: {
    role: 'mid',
    label: '中景 · 场景主体',
    short: '中景',
    defaultSpeed: 0.55,
    isOpaque: false,
    defaultPrompt:
      'Mid-distance scene elements only — mid-size trees and terrain features sitting in the middle band of the frame. No sky, no far background, no near foreground.',
    hint: '中距离形体层，滚动中速。',
    defaultWidth: 1952,
    defaultHeight: 544,
  },
  near: {
    role: 'near',
    label: '近景 · 前景装饰',
    short: '近景',
    defaultSpeed: 1.0,
    isOpaque: false,
    defaultPrompt:
      'Near foreground elements only — near grass blades, foreground bushes, foreground rocks, near tree trunks along the bottom of the frame. No sky, no mid-ground, no characters.',
    hint: '前景装饰层，滚动最快。',
    defaultWidth: 1952,
    defaultHeight: 544,
  },
}

/** Visual / compositing order in the layer panel and preview (back → front). */

export const LAYER_ORDER: LayerRole[] = ['sky', 'far', 'mid', 'near']

/** Build workflow order — front → back so the anchor layer is composed first. */

export const WORKFLOW_ORDER: LayerRole[] = ['near', 'mid', 'far', 'sky']

export function getLayerIndexByRole(layers: ParallaxLayer[], role: LayerRole): number {
  return layers.findIndex((l) => l.role === role)
}

/** First empty layer in front→back build order — the one we nudge users toward. */

export function getRecommendedLayerIndex(layers: ParallaxLayer[]): number | null {
  for (const role of WORKFLOW_ORDER) {
    const idx = getLayerIndexByRole(layers, role)
    if (idx === -1) continue
    if (!layers[idx].imageUrl) return idx
  }
  return null
}

/** Which earlier workflow step must exist before this layer is built. */

export function getWorkflowPrerequisite(
  layers: ParallaxLayer[],
  role: LayerRole
): ParallaxLayer | null {
  const roleIdx = WORKFLOW_ORDER.indexOf(role)
  if (roleIdx <= 0) return null
  for (let i = 0; i < roleIdx; i++) {
    const prevRole = WORKFLOW_ORDER[i]
    const prev = layers.find((l) => l.role === prevRole)
    if (!prev?.imageUrl) return prev ?? null
  }
  return null
}


export function getWorkflowStep(role: LayerRole): number {
  return WORKFLOW_ORDER.indexOf(role) + 1
}


export function createDefaultLayers(): ParallaxLayer[] {
  return LAYER_ORDER.map((role) => ({
    id: `layer-${role}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    imageUrl: null,
    rawImageUrl: null,
    width: null,
    height: null,
    scrollSpeed: LAYER_ROLES[role].defaultSpeed,
    fromUpload: false,
  }))
}

// ─────────────────────────────────────────────────────────────────────────────
// Tile-set — a 13-tile autotile set for 2D platformers. Body + 4 edges +
// 4 outer corners (convex) + 4 inner corners (concave). Laid out in a 4x4
// sprite-sheet (3 cells empty / transparent) so engines can index by row,col.
//
// Layout (column,row) — columns 0..3, rows 0..3:
//   (0,0) tl_outer  (1,0) top      (2,0) tr_outer  (3,0) tl_inner
//   (0,1) left      (1,1) body     (2,1) right     (3,1) tr_inner
//   (0,2) bl_outer  (1,2) bottom   (2,2) br_outer  (3,2) bl_inner
//   (0,3) ---       (1,3) ---      (2,3) ---       (3,3) br_inner
// ─────────────────────────────────────────────────────────────────────────────

