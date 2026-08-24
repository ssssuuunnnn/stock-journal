# Handoff: 存股日記 套用 Broadsheet 設計系統

## Overview

把 `stock-daily`（React + Vite，資料存 localStorage 的存股記錄工具）的介面，從現有的紫色卡片式樣式改成 **Broadsheet** 設計系統：報紙式的紙白底、Source Serif 4 襯線字、青（cyan）為互動色、洋紅（magenta）為第二特別色，版面靠留白與字級分層，不用卡片框線。

功能不變 — 不新增、不移除任何功能。這是一次純視覺的改版（外加報頭與表單位置的版面調整）。

## About the Design Files

`design_references/` 裡的 `.dc.html` 是**設計參考稿**，用 HTML 做的原型，用來表達預期的外觀與行為，**不是要直接搬進 codebase 的產品程式碼**。任務是在既有的 React + Vite 環境、用專案原本的檔案結構與慣例把這些設計實作出來。

- `存股日記 Broadsheet.dc.html` — 比稿板，含兩個方向（1a / 1b），每個都有桌機 900px 與手機 390px 兩種寬度。
- `存股日記 現況重建.dc.html` — 現況畫面的重建（改版前基準），用來對照。
- 用瀏覽器直接開這兩個檔即可（同層的 `support.js`、`_ds/` 是它們的執行環境）。

`proposed_css/` 則是**可直接用的產品程式碼**：已經照 Broadsheet token 寫好的 `index.css` 與 `App.css`，class 名稱沿用專案現有的 JSX，可直接覆蓋。

## Fidelity

**High-fidelity。** 顏色、字體、字級、間距都是最終值，直接照抄。所有值都來自 `design_references/_ds/.../styles.css` 的 token，不要自己發明新的顏色或間距。

## 選哪個方向

有兩個版面方向，**預設實作 1a**（改動最小、與現有元件一對一對應）。1b 需要重寫 `App.jsx` 結構。

### 1a — 保留分頁結構（建議）

- 保留 `存股目標` / `買入紀錄` 兩個分頁與現有的四個元件。
- 拿掉所有卡片（背景、邊框、陰影、圓角），改用留白分區。
- 報頭改成報紙式：大標題 + 副標同一行，下方接 3px 粗線 → 日期欄 → 1px 細線。
- 表單從列表**上方**移到列表**下方**，標題降級成小字全大寫的 kicker（`新增存股目標`）。
- 目標列表改成 2 欄 grid（`minmax(320px, 1fr)`），進度條由 8px 圓角條改成 4px 直角條。

### 1b — 單頁報紙版面

- 拿掉分頁，目標與紀錄放在同一頁的雙欄 grid（左 1.15fr 目標 / 右 1fr 紀錄，column-gap 56px）。
- 置中報頭：小字全大寫的 kicker `個人存股帳簿` → 76px 標題 → 4px 粗線 → 三段日期欄（期數／日期／地點）→ 1px 細線。
- 上方加統計摘要區：左側「累計投入」用 `.cmyk-num` 疊印數字（64px），右側四行對照數字（持有股數／目標股數／平均成本／最近買入）。需要一併引入設計系統的 `print-plates.js`（SVG filter defs）。
- 買入紀錄不用 `<table>`，改成單行列表：日期(84px) / 代號(48px) / 張數 / 金額(靠右) / @成交價(52px 靠右)。
- 兩個表單各自縮成 2 欄 grid 放在自己那一欄的下方。

## Screens / Views

### 1. 存股目標（tab: goals）

**Purpose**：看每檔標的的存股進度，並新增目標。

**Layout**（桌機）
- 頁面容器：`max-width: 900px`，`margin: 0 auto`，`padding: 40px 30px 96px`。
- 報頭 → 分頁列（`margin: 40px 0 44px`，`gap: 40px`）→ 目標 grid → 表單（`margin-top: 52px`）→ footer（`margin-top: 56px`）。
- 目標 grid：`repeat(auto-fill, minmax(320px, 1fr))`，`column-gap: 56px`，`row-gap: 40px`。

**每張目標的內容（由上到下）**
1. 一行 baseline 對齊：代號（28px / 600 / letter-spacing -0.01em）、名稱（15px、`--color-neutral-700`）、達成率靠右（24px / 600、`--color-accent-700`）。
2. 進度條：高 4px，底色 `--color-neutral-300`，填色 `--color-accent`，無圓角，`margin-top: 14px`，寬度 = `min(100, owned/target*100)%`，`transition: width .3s ease`。
3. 數字行（`margin-top: 10px`，14px）：`已持有` + `／目標 …`（後者 `--color-neutral-700`）。
4. 備註（13px、italic、`--color-neutral-700`）與「刪除」按鈕同一行，兩端對齊。

**表單（新增存股目標）**
- 標題：13px / 600 / `letter-spacing: .08em` / 全大寫 / `--color-neutral-700`。
- 桌機 4 欄：股票代號＊、股票名稱、目標張數/股數＊、單位；下一行「備註」佔滿寬，右側接主要按鈕。
- 欄位 label 12px（`color-mix(in srgb, var(--color-text) 70%, transparent)`）；input 高 36px、`padding: 6px 10px`、14px、底 `--color-surface`、1px `--color-divider` 邊、`radius 2px`。
- 單位可用設計系統的 `.seg` segmented control（張／股）取代 `<select>`。

**空狀態**：`還沒有設定任何存股目標，先在上面新增一個吧。`（16px、italic、`--color-neutral-700`、上下 padding 40px）。若表單移到下方，文案的「上面」要改成「下面」。

### 2. 買入紀錄（tab: records）

**Purpose**：依股票代號篩選、瀏覽並刪除買入紀錄，並新增一筆。

**Layout**
- 工具列：左側篩選（`.seg` 或 `<select>`：全部 / 各股票代號），右側「共 N 筆」（13px、`--color-neutral-700`），兩端對齊，`margin-bottom: 15px`。
- 表格：`width: 100%`、`border-collapse: collapse`、14px。欄位：日期 / 股票代號 / 股數 / 成交價 / 金額 / 備註 / （刪除）。
  - `th`：11px、`letter-spacing .08em`、全大寫、`font-weight 400`、色 `color-mix(in srgb, var(--color-text) 60%, transparent)`、下框 1px `--color-divider`。
  - `td`：`padding: 10px`、下框 1px `color-mix(in srgb, var(--color-text) 8%, transparent)`、`white-space: nowrap`。代號 600；備註 italic + `--color-neutral-700`。
  - `tbody tr:hover`：`color-mix(in srgb, var(--color-text) 4%, transparent)`。
- 表單（新增買入紀錄）：4 欄（股票代號＊、買入日期＊、張數/股數＊、成交價），下一行單位 + 備註 + 按鈕。

**空狀態**：`還沒有任何買入紀錄，先在上面新增一筆吧。`（同上樣式，位置改了要改文案）

### 分頁列

- 無底線容器（原本的 `border-bottom` 移除）。
- 每個 tab：襯線、22px / 600、未選 `--color-neutral-600`、hover `--color-accent-700`。
- 選中：色 `--color-text`，下方 3px 青色底線（`box-shadow: inset 0 -3px 0 var(--color-accent)`，`padding-bottom: 6px`）。

### 報頭

- 1a：`h1` 52px / 600 / `letter-spacing -0.02em`，副標 14px `--color-neutral-700` 靠右對齊底部；`margin-top: 18px` 接 3px 粗線；日期欄 11px 全大寫 `letter-spacing .1em`、`padding: 6px 0`、左「台北 · 日期」右「資料存於本機瀏覽器」；再接 1px 細線。
- 標題移除原本的 📈 emoji（設計系統不用 emoji）。

### Footer

`資料僅儲存在此瀏覽器（localStorage），不會上傳到任何伺服器。` — 12px、`--color-neutral-700`、`margin-top: 56px`。1a 左對齊，1b 置中並在上方加一條 `--color-divider` 細線。

## Interactions & Behavior

功能與現有程式完全相同，只有樣式改變：

- 分頁切換：`useState('goals' | 'records')`，只換內容不換路由。
- 新增目標 / 紀錄：驗證規則不變（目標需 `stockCode` 與 `targetQty`；紀錄需 `stockCode`、`qty`、`date`）。代號 `trim().toUpperCase()`。單位為「張」時 ×1000 存成股數（`lib/units.js` 不動）。
- 刪除：即時移除，無確認框（維持現狀）。
- 進度條寬度變化 `.3s ease`。
- 互動狀態全部走設計系統：
  - 主要按鈕 hover `--color-accent-600`、active `--color-accent-700`。
  - 刪除（ghost）文字 `--color-accent-2-700`，hover 底 `color-mix(in srgb, var(--color-accent-2) 10%, transparent)`、active 18%。
  - input hover 邊框 `color-mix(in srgb, var(--color-text) 45%, transparent)`，focus 邊框 `--color-accent`。
  - 鍵盤焦點：`:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 2px }`，不要留瀏覽器預設藍框。

**Responsive**（`max-width: 640px`，已寫在 `proposed_css/App.css`）
- 容器 padding 降為 `20px 20px 64px`；`h1` 34px；報頭改上下堆疊。
- 分頁 gap 20px、字級 18px。
- 目標 grid 改單欄，`row-gap: 30px`；代號 22px、達成率 19px。
- 送出按鈕 `width: 100%`、`min-height: 44px`（手機點擊區下限）。

## State Management

沿用現況，不需新增：

- `goals` — `useLocalStorage('stock-daily:goals', [])`
- `records` — `useLocalStorage('stock-daily:records', [])`
- `tab` — `useState('goals')`（1b 不需要）
- `RecordTable` 內的 `filter` — `useState('all')`
- `holdingsByStock` — 由 `records` 以 `useMemo` 累加
- 無 API、無資料抓取。

## Design Tokens

全部來自 `design_references/_ds/.../styles.css`，請用 `var(--*)` 引用而不是寫死 hex。

**Color**
- `--color-bg` `#f3f2f2`（頁面紙白）
- `--color-surface` `#eae9e9`（input 底）
- `--color-text` `#201e1d`
- `--color-accent` `#0088b0`（青，互動色）
- `--color-accent-600` `#1186ac` / `--color-accent-700` `#006786`（hover / pressed、以及青色的小字用色）
- `--color-accent-2` `#d6006c`（洋紅，第二特別色）/ `--color-accent-2-700` `#aa0b56`
- `--color-neutral-300` `#d7d3d3`（進度條底）/ `--color-neutral-600` `#7d7979` / `--color-neutral-700` `#605d5d` / `--color-neutral-800` `#444141`
- `--color-divider` `color-mix(in srgb, #201e1d 16%, transparent)`
- `--color-process-yellow` `#edbb00`（僅疊印處理用，介面不用）

**Spacing**（density 1.25×，不要壓縮）
`--space-1: 5px` `--space-2: 10px` `--space-3: 15px` `--space-4: 20px` `--space-6: 30px` `--space-8: 40px`

**Typography**
- `--font-heading` / `--font-body`：`'Source Serif 4', 'Noto Serif TC', serif`（中文用 Noto Serif TC 補字，兩個都從 Google Fonts 載）。標題 weight 600、內文 400、強調用真斜體。
- 基礎：15px / 1.55。標題 `line-height 1.12`、`letter-spacing -0.015em`。
- 頁內用到的字級：52px（1a 標題）、76px（1b 標題）、28px / 24px / 22px / 21px / 20px、15px、14px、13px、12px、11px（全大寫小標）。
- **不要引入無襯線字**當 UI 字型 — 襯線就是這個系統的 UI 字。

**Radius**：`--radius-md: 2px`（按鈕、input）。進度條、報頭線、表格皆為直角。

**Shadow**：`--shadow-sm/md/lg`。**介面本身不用陰影** — 比稿板上的 `--shadow-md` 只是把「紙張」浮在畫布上，實際頁面不需要。

## Assets

- 無圖片、無 icon（若之後要加 icon，設計系統指定 Phosphor duotone）。
- 字型：Google Fonts 的 Source Serif 4 與 Noto Serif TC，用 `@import` 載入（見 `proposed_css/index.css`）。
- 1b 的 `.cmyk-num` 疊印數字需要設計系統的 `print-plates.js`（SVG filter defs）進到 document；`_ds_bundle.js` 已內含。

## Files

**可直接用的產品程式碼**
- `proposed_css/index.css` → `src/index.css`（token、字型、base；已移除深色模式）
- `proposed_css/App.css` → `src/App.css`（1a 完整版面，class 名稱沿用現有 JSX）
- `APPLY.md` — 套用步驟與 `App.jsx` 需要動的三處

**設計參考（不要直接搬）**
- `design_references/存股日記 Broadsheet.dc.html` — 1a / 1b 比稿板（桌機 + 手機）
- `design_references/存股日記 現況重建.dc.html` — 改版前的現況
- `design_references/_ds/broadsheet-.../styles.css` — 設計系統的 token 與元件 class（`.btn` `.input` `.field` `.seg` `.table` `.tag` `.card` `.cmyk-num` …）

**目標 repo 中會被改到的檔案**
- `src/index.css`（覆蓋）
- `src/App.css`（覆蓋）
- `src/App.jsx`（報頭 markup、表單順序）
- `src/components/GoalForm.jsx`、`RecordForm.jsx`（可選：單位改 `.seg`）
- `src/components/GoalList.jsx`、`RecordTable.jsx`（1a 不需改；1b 需要重寫）

> 資料存放與 localStorage key（`stock-daily:goals` / `stock-daily:records`）不要改，改版後既有使用者的資料要能沿用。
