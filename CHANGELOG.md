# Changelog

本檔格式遵循 [Keep a Changelog](https://keepachangelog.com/)，版本規則遵循 [Semantic Versioning](https://semver.org/)。

## [Unreleased]

### Added
- **`data/` 改為日期快照目錄**（← `prepare.md` MC-012）：`data/2026-08-07/`（首版，
  內容取自 v0.1.0 commit，逐位元組相同）與 `data/2026-08-14/`（當期），
  加 `data/manifest.json` 標明 `latest` / `previous` 與各快照的觸發原因
- 子專案 `CLAUDE.md` 資料層硬規則新增第 7 條「歷史快照不可變」
- 子專案 `CLAUDE.md` 資料層硬規則 1 新增**就近繼承**條款（← MC-013）：項目未自帶
  `source_url` / `captured_at` 時沿祖層取值；並明訂契約檢查只對 `latest` 快照 fail
- `data/2026-08-14/agents.json` — 補檔案層 `source_url` 與 `source_note`，
  值取自該檔既有的 `announcement.source_url`（非新查證）。**當期快照契約違規歸零**
- `data/2026-08-14/vendors.json` — **91APP 廠商層入庫**（← `prepare.md` MC-011）：7 個產品線名稱、
  FY2026 Q1 財報、AgentOne 發表日期。產品未進 `products.json`、能力未進矩陣
- `prepare.md` MC-009／MC-010／MC-011 — 指標方向、圖表比較單位、91APP 收錄層級的決策記錄
- `docs/FEATURES.md` — Zone B 新增「M1 的比較單位是產品，不是廠商」節
- `docs/FEATURES.md`「圖說」節 — 每張圖下方固定兩塊（「怎麼讀」＋「這張圖現在說什麼」），
  含硬規則與各圖的圖說內容對照表（← `prepare.md` MC-008）
- `prepare.md` MC-008 — 圖說規格的決策記錄
- （M1，未開工）Vite + React + TypeScript 專案骨架
- （M1，未開工）Zone A 報告區與 PDF／CSV／Markdown 匯出
- （M1，未開工）`scripts/validate.js` 資料契約檢查

### Removed
- **「宣稱 vs. 證據落差分」不再是本專案指標**（← MC-009 撤銷 MC-007）。
  `claimed_strengths` / `evidence_reviews` 兩組欄位保留，降級為 Zone E 口碑素材，
  不再相減成分數；`src/analysis/gap.ts` 從架構中移除。**既有產品資料一筆都不用重填**

### Changed
- `docs/FEATURES.md` — Zone D 主軸改 G2 Grid 式（市場影響力 × 產品覆蓋度）四象限，
  權重公開可調；M1 先以產品層級軸上線，M2 換廠商層級（← MC-010）
- `docs/FEATURES.md` — Zone D 由 M3 提前至 M1 起分階段上線；里程碑 M1／M2／M3 交付同步重排
- `docs/FEATURES.md` — Zone C 明訂 `claimed_only` 是信度標記而非指控；91APP 不進矩陣的理由
- `docs/FEATURES.md` — Zone B 明訂口碑分在 M1 無資料可畫，顯示「無公開資料」而非 0 分
- `docs/ARCHITECTURE.md` — L2 指標「宣稱／證據落差分」改為「市場影響力分（權重可調）」；
  未決事項重編為四項
- `README.md` — 功能特色改列客觀指標；專案結構與 M1 範圍同步 91APP
- `prepare.md` — 待討論事項 1 結案移除，新增 4（對照組納入門檻）、5（能力字典是否擴充零售側）；
  待討論 2 收斂為只剩「快照頻率」，目錄結構已由 MC-012 定案
- `docs/FEATURES.md` — Zone A「本期變化」維持 M3，但理由改寫：兩份快照已存在，
  不再是「還不存在」而是排程考量
- `docs/ARCHITECTURE.md`／`README.md`／子專案 `CLAUDE.md` — 資料路徑改為 `data/<YYYY-MM-DD>/`，
  驗證指令改為掃描所有快照
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
