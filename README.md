# martech-competitor-dashboard - MarTech 競品情報 Dashboard

把 MarTech 廠商的產品線拆成可比較、可追溯、可匯出的一份分析報告，並且每個結論都連得回它的證據。

![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 功能特色

- **報告在最上方** — 開頁先看執行摘要、關鍵發現、與上一版的 diff，資料在底下供追問
- **每筆欄位都帶來源** — `source_url` / `confidence` / `captured_at` 三個中繼欄位為必填，沒有來源的資料進不了表
- **四態信度標記** — 已查證／官方宣稱／推測／無公開，查不到的欄位留空，不編數字填滿
- **客觀可查的比較指標** — 能力覆蓋率、產品線重疊率、渠道與垂直產業覆蓋、計價透明度、財報規模，
  全部由公開資料算出，不做主觀評分；定位圖的合成權重公開且可由讀者自行調整
- **每張圖都有圖說** — 圖下方固定兩塊：「怎麼讀」與「這張圖現在說什麼」。後者由分析層算出來，
  資料一改描述跟著改，不會有數字變了說明沒變的情況
- **三種匯出** — PDF（`@media print`）、CSV（資料表）、Markdown（報告全文）

## 快速開始

> 📌 v0.1.0 **只有文件與資料層，沒有實作程式碼**。以下是目前唯一能跑的驗證。

```bash
# 檢查所有快照的資料檔是否為合法 JSON
for f in data/*.json data/*/*.json; do python3 -m json.tool "$f" > /dev/null && echo "OK $f"; done
# 預期：manifest.json 與 data/2026-08-07/、data/2026-08-14/ 各四份全部 OK
```

M1 開工後的本地開發流程屆時補 `docs/DEPLOYMENT.md`，此處連結過去。

## 使用方式

目前的使用方式是**讀資料與文件**：

- 想知道要蓋什麼 → `docs/FEATURES.md`（Zone A–F 的功能規格與出口條件）
- 想知道怎麼蓋 → `docs/ARCHITECTURE.md`（四層架構、資料模型、資料流）
- 想知道為什麼這樣決定 → `prepare.md`（MC-000 起）
- 想看已收集的 Appier 情報 → `data/2026-08-14/products.json`、`data/2026-08-14/agents.json`
- 想看廠商層資料（含 91APP）→ `data/2026-08-14/vendors.json`
- 想知道有哪幾份快照、哪份最新 → `data/manifest.json`

## 專案結構

```
martech-competitor-dashboard/
├── data/                    # 資料層：手動維護的結構化 JSON，唯一事實來源
│   ├── manifest.json        # 快照索引，標明哪一份是最新
│   ├── 2026-08-07/          # 首版快照（只有 Appier）
│   └── 2026-08-14/          # 當期快照 ← latest
│       ├── vendors.json     # 廠商主檔（Appier 完整、91APP 僅廠商層）
│       ├── products.json    # 產品明細，九個 Appier 產品
│       ├── agents.json      # Agent 能力層，八個 Appier AI Agent
│       └── capabilities.json # 能力字典，能力矩陣的欄位定義
├── docs/
│   ├── ARCHITECTURE.md      # 四層架構、資料模型、資料流、技術棧
│   └── FEATURES.md          # 功能規格、Zone A–F、M1–M3 里程碑與出口條件
├── prepare.md               # 本專案決策記錄（MC-000 起）
└── CHANGELOG.md
```

模組職責與資料流見 `docs/ARCHITECTURE.md`。

## 測試

```bash
# 資料契約檢查（M1 補 validate.js 之前的替代方案）
for f in data/*.json data/*/*.json; do python3 -m json.tool "$f" > /dev/null && echo "OK $f"; done
```

完整測試流程待 M1 實作層落地後補 `docs/TESTING.md`。

## 開發階段 / 里程碑

| 階段 | 範圍 | 出口條件 |
|------|------|---------|
| **M1** | 單一廠商做深（Appier）＋91APP 廠商層，資料層 schema 定案、報告區可讀、產品層級比較圖、PDF＋CSV＋Markdown 匯出可用 | 不看原始碼的人能在 3 分鐘內講出 Appier 的三個弱點 |
| **M2** | 加入四組對照廠商、能力矩陣上線 | 矩陣能撐起一句「Appier 唯一贏／唯一輸」的具體結論 |
| **M3** | 定位圖、方法論頁、與上一版 diff | 任一分數都能回答「這 0.5 分是怎麼來的」 |

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
