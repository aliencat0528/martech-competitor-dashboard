# Changelog

本檔格式遵循 [Keep a Changelog](https://keepachangelog.com/)，版本規則遵循 [Semantic Versioning](https://semver.org/)。

## [Unreleased]

### Added
- **Zone C 能力矩陣與 Zone D 定位圖上線——規格指定的三張圖到齊**
  - `data/2026-08-17/matrix.json` — 16 產品 × 28 能力 = **448 格**，
    四態判定直接套 `capabilities.json` 的 `cell_states` 定義，每格帶 `basis`（判斷取自哪個欄位）。
    **`reviewed: false`**，依資料層硬規則 6 待人工覆核
  - `src/zones/ZoneC.tsx` — 四態矩陣，顏色與符號各標一次；「怎麼讀」直接引用
    `cell_states[].definition` 原文；依產品線篩選，篩選後 summary 重算
  - `src/charts/PositioningScatter.tsx`＋`src/zones/ZoneD.tsx` — 手寫 SVG 散佈圖，
    四象限、圓點大小映射策略權重、**標籤自動避讓**（16 個標籤零重疊）
  - `src/analysis/capabilityMetrics.ts` — 覆蓋率、四態統計、最密集的僅宣稱群，含 13 個測試
- **91APP 七個產品入庫，能力字典擴充零售側 6 項**（← `prepare.md` MC-015，反轉 MC-011）
  - `commerce` 群：開店平台／金流／物流出貨／全通路庫存／門市 POS／門市人員工具，22 → 28 項
  - **91APP 的 22 個有能力的格子全部是 `claimed_only`，零格 `full` 或 `partial`**——
    無 G2 規模的評論樣本。這是查不到第三方證據，不是產品沒有評價
- **廠商下拉選單**（`src/zones/VendorPicker.tsx`）：切「兩家比較」或單一廠商，
  Zone C／D／E 一起縮放，圖說 summary 跟著重算
- **Zone D 權重滑桿**（← MC-010「權重公開且可調」的落地）：控制「僅宣稱」的採計權重 0–100%。
  拉到 0% 時 91APP 七個產品的覆蓋率全部歸零

### Fixed
- `filterCells` 在沒有產品線篩選時直接回傳全集，導致切換廠商後 Zone C 的 summary
  仍在數全部 448 格——描述講的不是眼前看到的東西。改為 `cellsForProducts`，一律依產品清單過濾
- 定位圖底部標籤重疊到無法閱讀（16 個產品有 10 個落在計價透明度 0）；
  加入依名稱寬度估算的標籤避讓，實測重疊數 3 → 0
- 圖說字串裡的 Markdown 星號被當字面輸出（`**兩者期間不同**`）——那些字串同時要餵給
  Markdown 匯出，改為不依賴標記的寫法
- **廠商層對照的兩張圖**（← `prepare.md` MC-014）：加入 91APP 之後，它一度只有一張卡、
  不出現在任何圖裡。補上兩張兩家都畫得進去的圖：
  - `src/charts/GrowthCompare.tsx` — 營收年增率並排長條，**期間不同時每根長條下方各標自己的期間**
  - `src/charts/AvailabilityMatrix.tsx` — 6 個對照欄位 × 2 家的四態矩陣，符號與顏色各標一次
  - `src/analysis/vendorMetrics.ts` — `availabilityMatrix` / `availabilityScore` / `revenueGrowth`
    / `periodsAligned`，含 7 個測試
  - Zone B 廠商卡新增「查得到的欄位」欄（Appier 5/6、91APP 2/6）
  - **營收金額不並排**：兩家幣別不同，匯率不在資料層裡，換算值沒有 `source_url`
- **M1 骨架落地——本專案第一批實作程式碼**：Vite + React + TypeScript，
  `npm run dev` / `lint` / `test` / `build` / `validate` 五個指令全部可跑且全過
  - `src/data/loader.ts` — 用 `import.meta.glob` 在建置期併入快照，依 manifest 取 latest／previous
  - `src/types/data.ts` — `Confidence` 四態用 union type，填錯值編譯期即擋
  - `src/analysis/productMetrics.ts` — 計價透明度分、渠道／垂直產業數；口碑分固定回 `null`
    （九產品 `adoption.rating` 全為 `null`），含 8 個 Vitest 測試
  - `src/charts/PricingBar.tsx` — 手寫 SVG 長條圖，圖說兩塊固定跟在下方（← MC-008）
  - `src/zones/` — Zone A 報告區、Zone B 廠商快照＋產品層級橫向比（← MC-010）、
    Zone E 產品明細、Zone F 來源清單（**沿繼承鏈收集來源**）
  - `src/export/` — CSV／Markdown／PDF 的序列化函式
  - `scripts/validate.js` — 資料契約檢查，**已實作 MC-013 繼承鏈**，只對 `latest` 快照 fail
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
