# 存股日記

紀錄存股目標與每一次買入紀錄的純前端小工具。使用 React + Vite 開發，資料儲存在瀏覽器的 `localStorage`，不需要後端伺服器，可直接部署到 GitHub Pages。

## 功能

- 設定存股目標（股票代號、目標張數／股數、備註）
- 新增買入紀錄（股票代號、日期、張數／股數、成交價、備註）
- 依股票代號篩選瀏覽買入紀錄
- 每檔股票的存股進度條（已持有 / 目標）
- PWA：可安裝到手機／桌面當作獨立 App，離線也能開啟

## 開發

```bash
npm install
npm run dev
```

## 建置

```bash
npm run build
npm run preview   # 本機預覽建置結果
```

## 部署到 GitHub Pages

專案已內建 `.github/workflows/deploy.yml`：推送到 `main` 分支即會自動建置並部署到 GitHub Pages。

第一次設定：

1. 將專案推上 GitHub（repo 名稱建議維持 `stock-journal`，若改名要同步修改 `vite.config.js` 的 `base`）。
2. 到 repo 的 **Settings → Pages**，將 **Source** 設為 **GitHub Actions**。
3. push 到 `main` 後，等待 Actions 跑完即可看到網站，網址預設是 `https://<你的帳號>.github.io/stock-journal/`；若帳號的 GitHub Pages 有另外設定自訂網域（例如 `https://<你的帳號>.github.io` 綁了自訂域名），專案頁面會改用同一個網域的 `/stock-journal/` 路徑。

分頁切換用瀏覽器 History API 走真正的路徑（`/stock-journal/` 存股目標、`/stock-journal/records` 買入紀錄），不是 `#` hash。GitHub Pages 是純靜態託管、不會做路徑轉發，所以 `npm run build` 之後會自動把 `dist/index.html` 複製一份成 `dist/404.html`（見 `package.json` 的 `postbuild`）：使用者直接打開或重新整理 `/stock-journal/records` 時，GitHub Pages 會用 404.html 頂上，內容其實就是同一份 SPA，由前端路由接手顯示正確分頁。

## 資料儲存說明

所有資料只存在使用者自己瀏覽器的 `localStorage`，不會上傳到任何伺服器；清除瀏覽器資料或換裝置都會遺失紀錄。

## PWA

用 `vite-plugin-pwa`（設定在 `vite.config.js`）產生 Web App Manifest 與 Service Worker：

- 手機瀏覽器（Chrome/Safari）開啟後可以「加到主畫面」，桌機 Chrome/Edge 網址列會出現安裝圖示，安裝後以獨立視窗開啟、沒有瀏覽器網址列。
- Service Worker 會把靜態資源（HTML/CSS/JS/圖示）快取起來，離線或訊號不好時也能開啟 App 本體（資料本來就存在 localStorage，跟網路無關）。
- `registerType: 'autoUpdate'`：改版部署後，使用者下次開啟會自動抓新版本、背景更新，不會跳更新提示。
- 只有 `npm run build` 的正式產物（`dist/sw.js`、`dist/manifest.webmanifest`）才有 PWA 行為；`npm run dev` 底下 Service Worker 是空的（vite-plugin-pwa 的預設行為），要測試安裝或離線效果請用 `npm run build && npm run preview`。
- PWA 圖示（`public/pwa-*.png`、`public/apple-touch-icon.png`）是依 Broadsheet 設計系統重新畫的（襯線「存」字 + 青色底線），跟網站本身視覺一致；瀏覽器分頁的 `favicon.svg` 目前還是舊的紫色圖示，沒有一併更換。
