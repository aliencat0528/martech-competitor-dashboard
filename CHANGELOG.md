# Changelog

本檔格式遵循 [Keep a Changelog](https://keepachangelog.com/)，版本規則遵循 [Semantic Versioning](https://semver.org/)。

## [Unreleased]

### Added
- （M1）Vite + React + TypeScript 專案骨架
- （M1）Zone A 報告區與 PDF／CSV／Markdown 匯出
- （M1）`scripts/validate.js` 資料契約檢查

### Added
- `docs/FEATURES.md`「圖說」節 — 每張圖下方固定兩塊（「怎麼讀」＋「這張圖現在說什麼」），
  含硬規則與各圖的圖說內容對照表（← `prepare.md` MC-008）
- `prepare.md` MC-008 — 圖說規格的決策記錄

### Changed
- `docs/FEATURES.md` — Zone A「本期變化」由 M1 改列 M3：M1 只有一份快照，無前版可比。
  Zone A 元件表補上里程碑欄，M1／M3 交付說明同步對齊
- `docs/FEATURES.md` — Zone B／C／D 各補圖說要求；匯出表明訂 PDF／Markdown 帶圖說、CSV 不帶
- `docs/ARCHITECTURE.md` — L2 職責加上「產出圖說 `summary`」、L3 明訂不自己寫圖說描述、
  L4 明訂匯出帶圖說；目錄結構新增 `src/charts/`

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
