# martech-competitor-dashboard - MarTech 競品情報 Dashboard

把 MarTech 廠商的產品線拆成可比較、可追溯、可匯出的一份分析報告，並且每個結論都連得回它的證據。

![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 功能特色

- **報告在最上方** — 開頁先看執行摘要、關鍵發現、與上一版的 diff，資料在底下供追問
- **每筆欄位都帶來源** — `source_url` / `confidence` / `captured_at` 三個中繼欄位為必填，沒有來源的資料進不了表
- **四態信度標記** — 已查證／官方宣稱／推測／無公開，查不到的欄位留空，不編數字填滿
- **客觀可查的比較指標** — 能力覆蓋率、渠道與垂直產業覆蓋、計價透明度、財報規模，
  全部由公開資料算出，不做主觀評分
- **權重交給讀者** — 這份報告裡唯一主觀的東西不是分數，是「你願意信廠商說法幾分」，
  所以做成滑桿：拉到 0% 只認第三方查得到的，拉到 100% 完全採信官方說法，圖與描述即時重算
- **每張圖都有圖說** — 圖下方固定兩塊：「怎麼讀」與「這張圖現在說什麼」。後者由分析層算出來，
  資料一改描述跟著改，不會有數字變了說明沒變的情況
- **三種匯出** — PDF（`@media print`）、CSV（資料表）、Markdown（報告全文）

## 快速開始

```bash
npm install
npm run dev        # 開發伺服器，頁面顯示 Zone A–F
npm run validate   # 資料契約檢查（含就近繼承）
npm test           # 分析層單元測試
npm run build      # tsc --noEmit + vite build
```

> 📌 M1 已可讀：Zone A／B／C／D／E／F 全部上線，兩家 16 個產品、28 項能力、448 格矩陣。
> 頂部下拉選單可切「兩家比較」或單一廠商；定位圖有「僅宣稱採計權重」滑桿。
> **匯出函式已寫但尚未接到 UI 按鈕**；矩陣為 AI 草稿，`reviewed: false` 待人工覆核。

部署設定（GitHub Pages／Vercel）待實際部署時補 `docs/DEPLOYMENT.md`。

## 使用方式

目前的使用方式是**讀資料與文件**：

- 想知道要蓋什麼 → `docs/FEATURES.md`（Zone A–F 的功能規格與出口條件）
- 想知道怎麼蓋 → `docs/ARCHITECTURE.md`（四層架構、資料模型、資料流）
- 想知道為什麼這樣決定 → `prepare.md`（MC-000 起）
- 想看兩家的產品明細 → `data/2026-08-17/products.json`（Appier 9 ＋ 91APP 7）
- 想看能力矩陣的 448 格 → `data/2026-08-17/matrix.json`
- 想看廠商層資料與財報 → `data/2026-08-17/vendors.json`
- 想知道有哪幾份快照、哪份最新 → `data/manifest.json`

## 專案結構

```
martech-competitor-dashboard/
├── data/                    # 資料層：手動維護的結構化 JSON，唯一事實來源
│   ├── manifest.json        # 快照索引，標明哪一份是最新
│   ├── 2026-08-07/          # 首版快照（只有 Appier）
│   ├── 2026-08-14/          # 加入 91APP 廠商層
│   └── 2026-08-17/          # 當期快照 ← latest
│       ├── vendors.json     # 廠商主檔與財報
│       ├── products.json    # 產品明細，Appier 9 ＋ 91APP 7
│       ├── agents.json      # Agent 能力層，八個 Appier AI Agent
│       ├── capabilities.json # 能力字典 28 項（含零售側 commerce 群）
│       └── matrix.json      # 產品 × 能力 448 格，reviewed: false
├── src/
│   ├── data/loader.ts       # 讀 manifest → 載入快照
│   ├── types/               # confidence 四態等共用型別
│   ├── analysis/            # L2 純函式（含測試）
│   ├── charts/              # 圖說靜態文字 ＋ 手寫 SVG 圖元件
│   ├── zones/               # L3 Zone A–F ＋ 廠商下拉選單
│   └── export/              # L4 csv / markdown / pdf
├── scripts/validate.js      # 資料契約檢查，含就近繼承
├── docs/
│   ├── ARCHITECTURE.md      # 四層架構、資料模型、資料流、技術棧
│   └── FEATURES.md          # 功能規格、Zone A–F、M1–M3 里程碑與出口條件
├── prepare.md               # 本專案決策記錄（MC-000 起）
└── CHANGELOG.md
```

模組職責與資料流見 `docs/ARCHITECTURE.md`。

## 測試

```bash
npm run validate   # 資料契約：三個中繼欄位、confidence 四態、就近繼承
npm test           # 分析層純函式（Vitest）
npm run lint       # ESLint
npm run build      # 型別檢查 + 建置
```

**契約檢查只對 `latest` 快照 fail**——歷史快照不可修，讓它擋 CI 只會逼人去改歷史
（← `CLAUDE.md` 資料層硬規則 7）。目前 `data/2026-08-07/` 有 16 筆早於 MC-013 的資料列為報告。

呈現層不寫測試——作品集專案的測試該用在「分數算得對不對」這種會被追問的地方。

## 開發階段 / 里程碑

| 階段 | 範圍 | 出口條件 |
|------|------|---------|
| **M1** | 兩家 16 個產品入庫、Zone A–F 全部上線、能力矩陣 448 格、定位圖含權重滑桿、廠商下拉選單 | 不看原始碼的人能在 3 分鐘內講出 Appier 的三個弱點 |
| **M2** | 加入四組對照廠商、能力字典續補、定位圖換廠商層級 G2 Grid 式 | 矩陣能撐起一句「Appier 唯一贏／唯一輸」的具體結論 |
| **M3** | 方法論頁、與上一版 diff、矩陣 448 格人工覆核 | 任一分數都能回答「這 0.5 分是怎麼來的」 |

各階段的完整功能清單與棄選項見 `docs/FEATURES.md`。

## 版本歷史

### v0.1.0 (2026-08-07)

- **立項** — 只寫文件與資料層，不寫實作程式碼
- **Appier 全產品線入庫** — 三條 Cloud、九個產品、八個 AI Agent，含四態信度標記
- **架構定案** — 資料／分析／呈現／匯出四層，靜態 JSON 無後端

逐條變更見 `CHANGELOG.md`。

## 授權

MIT License

---

## 相關文件

- 架構與資料模型 → `docs/ARCHITECTURE.md`
- 功能規格與里程碑 → `docs/FEATURES.md`
- 決策記錄 → `prepare.md`
- README 更新觸發條件、版本規則、CHANGELOG 格式 → 根專案 `.claude/specs/docs.md`
