# Image Extender（简体中文）

[English](README.en.md) | 简体中文

一个开源的 AI 图像工作台，支持：

- 无缝扩图（Outpainting）
- 视差背景（Parallax）
- 地块图集（Tiles）
- 装饰素材（Props）
- 精灵动画（Sprites）

## 快速开始（本地运行）

```bash
npm install
npm run dev
```

打开：`http://localhost:3000`

## 小白上手建议

1. `扩图`：先做出一张满意的大场景图。  
2. `视差`：做可循环长背景（优先用“自动扩展 + 无缝化”）。  
3. `地块`：一次生成整张表，风格最稳定。  
4. `装饰`：每批追加素材，逐步补细节。  
5. `精灵`：选体型和动作，导出角色帧。

## 中转/模型配置

在页面设置中填写：

- `Base URL`：你的兼容接口地址
- `API Key`：你的密钥
- `Model`：例如 `gpt-image-2`

## 密钥安全

- `.env.local` 不要提交到仓库。
- 仅在 `.env.example` 放占位符，不放真实密钥。
