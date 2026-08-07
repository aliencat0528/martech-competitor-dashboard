# Changelog

本檔格式遵循 [Keep a Changelog](https://keepachangelog.com/)，版本規則遵循 [Semantic Versioning](https://semver.org/)。

## [Unreleased]

### Added
- （M1）Vite + React + TypeScript 專案骨架
- （M1）Zone A 報告區與 PDF／CSV／Markdown 匯出
- （M1）`scripts/validate.js` 資料契約檢查

## [0.1.0] - 2026-08-07

### Added
- 專案立項：`README.md`、`CLAUDE.md`、`prepare.md`（MC-000～MC-007）、`.gitignore`
- `docs/ARCHITECTURE.md` — 四層架構、資料模型、資料流、技術棧
- `docs/FEATURES.md` — Zone A–F 功能規格、M1–M3 里程碑與出口條件
- `data/vendors.json` — 廠商主檔，v0.1.0 收錄 Appier 一家
- `data/products.json` — Appier 九個產品完整明細，含四態信度標記與來源連結
- `data/agents.json` — Appier 八個 AI Agent 能力層
- `data/capabilities.json` — 能力字典，能力矩陣的欄位定義

### Notes
- 本版**不含任何實作程式碼**，僅有文件與資料層
- 所有事實欄位均帶 `source_url` / `confidence` / `captured_at`；查不到的欄位值為 `null` 且 `confidence` 為 `none`
