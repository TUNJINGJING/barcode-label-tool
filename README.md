# Barcode Label Tool

物料标签与条码生成、预览、PNG 导出和打印工具。

## Source of truth

`main` 分支是唯一正式源码。后续修改统一提交到本仓库，再由 Vercel 自动部署生产站点。

## Deploy with Vercel

1. 在 Vercel 中 Import `TUNJINGJING/barcode-label-tool`。
2. Framework Preset 选择 `Other`（通常自动识别即可）。
3. Build Command 留空。
4. Output Directory 留空 / 使用仓库根目录。
5. Deploy。

以后每次 push 到 `main`，Vercel 会自动更新生产站点。
