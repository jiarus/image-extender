'use client'

import { Mode } from '@/app/lib/app'

export const ART_STYLE_GROUPS: { label: string; options: { value: string; label: string }[] }[] = [
  {
    label: '保持原图',
    options: [{ value: 'none', label: '保持原图风格' }],
  },
  {
    label: '摄影',
    options: [
      { value: 'cinematic', label: '电影感' },
      { value: 'vintage', label: '复古胶片' },
      { value: 'black-white', label: '黑白' },
      { value: 'macro', label: '微距' },
    ],
  },
  {
    label: '绘画',
    options: [
      { value: 'oil-painting', label: '油画' },
      { value: 'watercolor', label: '水彩' },
      { value: 'impressionism', label: '印象派' },
      { value: 'abstract', label: '抽象' },
      { value: 'pop-art', label: '波普艺术' },
      { value: 'cubism', label: '立体主义' },
      { value: 'minimalist', label: '极简' },
    ],
  },
  {
    label: '数字艺术',
    options: [
      { value: 'digital-art', label: '数字绘画' },
      { value: 'cyberpunk', label: 'Cyberpunk' },
      { value: 'vaporwave', label: 'Vaporwave' },
      { value: 'low-poly', label: '低多边形' },
      { value: 'pixel-art', label: '像素艺术' },
      { value: '3d-render', label: '3D 渲染' },
    ],
  },
  {
    label: '插画',
    options: [
      { value: 'anime', label: 'Anime' },
      { value: 'cartoon', label: '卡通' },
      { value: 'comic-book', label: '漫画' },
      { value: 'sketch', label: '铅笔素描' },
      { value: 'ink', label: '墨线绘制' },
    ],
  },
  {
    label: '动画工作室',
    options: [
      { value: 'studio-ghibli', label: 'Studio Ghibli' },
      { value: 'pixar', label: 'Pixar' },
      { value: 'disney', label: 'Disney' },
      { value: 'dreamworks', label: 'DreamWorks' },
      { value: 'illumination', label: 'Illumination' },
      { value: 'laika', label: 'Laika' },
      { value: 'cartoon-network', label: 'Cartoon Network' },
      { value: 'nickelodeon', label: 'Nickelodeon' },
      { value: 'aardman', label: 'Aardman' },
      { value: 'blue-sky', label: 'Blue Sky' },
    ],
  },
  {
    label: '幻想与复古',
    options: [
      { value: 'fantasy', label: '奇幻' },
      { value: 'sci-fi', label: '科幻' },
      { value: 'steampunk', label: 'Steampunk' },
      { value: 'surreal', label: '超现实' },
      { value: 'art-deco', label: 'Art Deco' },
      { value: 'art-nouveau', label: 'Art Nouveau' },
      { value: 'retro-80s', label: '80 年代复古' },
      { value: 'retro-50s', label: '50 年代复古' },
    ],
  },
]


export const findStyleLabel = (value: string) => {
  for (const group of ART_STYLE_GROUPS) {
    const opt = group.options.find((o) => o.value === value)
    if (opt) return opt.label
  }
  return '保持原图'
}

// ─────────────────────────────────────────────────────────────────────────────
// Mode — Extender (default), Parallax (sidescroller background builder),
// Tile (seamless 2D-tileable material textures), Sprite (character animations)
// ─────────────────────────────────────────────────────────────────────────────

/** Top-level tool the user is currently working in. Persisted to localStorage. */
