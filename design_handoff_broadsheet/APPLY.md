# 把 Broadsheet 套進 stock-daily

這份是 **1a（保留分頁結構）** 的實作版本。CSS 沿用你原本的 class 名稱，所以 JSX 幾乎不用動。

## 1. 覆蓋兩個 CSS

    handoff/src/index.css  →  stock-daily/src/index.css
    handoff/src/App.css    →  stock-daily/src/App.css

字型用 Google Fonts 的 Source Serif 4（拉丁字、數字）＋ Noto Serif TC（中文），在 `index.css` 用 `@import` 載入，不需要改 `index.html`。
深色模式的 `@media (prefers-color-scheme: dark)` 已移除 — Broadsheet 只有紙白面。

## 2. App.jsx：報頭加兩條 rule

原本：

    <header className="app-header">
      <h1>📈 存股日記</h1>
      <p className="muted">記錄每一次存股，追蹤目標達成進度</p>
    </header>

改成（拿掉 emoji，副標移到標題右側，下面接粗線／日期欄／細線）：

    <header className="app-header">
      <h1>存股日記</h1>
      <p className="muted">記錄每一次存股，追蹤目標達成進度</p>
    </header>
    <div className="masthead-rule" />
    <div className="dateline">
      <span>台北 · {new Date().toLocaleDateString('zh-TW')}</span>
      <span>資料存於本機瀏覽器</span>
    </div>
    <div className="masthead-rule-thin" />

## 3. 表單移到列表下方

`.form` 已加 `margin-top: 52px`，把 `<GoalForm>` / `<RecordForm>` 移到列表後面即可：

    {tab === 'goals' && (
      <>
        <GoalList goals={goals} holdingsByStock={holdingsByStock} onDelete={deleteGoal} />
        <GoalForm onAdd={addGoal} />
      </>
    )}

紀錄頁同理（`RecordTable` 在前、`RecordForm` 在後）。若想維持原順序，把 `.form { margin-top }` 改成 `margin-bottom` 就好。

## 4. 可選：單位改用 segmented control

`.seg` / `.seg-opt` 是 design system 的元件，比 `<select>` 更貼近版面。把 GoalForm / RecordForm 的單位欄改成：

    <div className="seg">
      <label className="seg-opt">
        <input type="radio" name="unit" value="lot"
               checked={form.unit === 'lot'} onChange={(e) => update('unit', e.target.value)} />張
      </label>
      <label className="seg-opt">
        <input type="radio" name="unit" value="share"
               checked={form.unit === 'share'} onChange={(e) => update('unit', e.target.value)} />股
      </label>
    </div>

需要的話把 design system 的 `.seg` / `.seg-opt` 規則從 `_ds/.../styles.css` 複製到 `App.css`，或直接沿用 `<select>`（已套好 token 樣式）。

## 想改成 1b（單頁報紙版面）

1b 需要動 `App.jsx` 的結構：拿掉 tabs、改成雙欄 grid、上方加統計摘要（累計投入用 `.cmyk-num` 疊印數字，需要一併帶 design system 的 `print-plates.js`）。跟我說一聲我就把 1b 的元件檔一起寫出來。
