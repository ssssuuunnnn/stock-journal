export default function About({ onBack }) {
  return (
    <div className="about">
      <button type="button" className="link-back" onClick={onBack}>
        ← 返回存股目標
      </button>
      <h2>關於存股日記</h2>
      <p>
        存股日記是一個記錄個人存股計畫的小工具。設定每檔股票的存股目標，記錄每一次買入的張數或股數，就能一眼看出目前的存股進度。
      </p>
      <p>
        這是一個純前端網頁，用 React + Vite 打造，沒有後端伺服器。所有資料只存在你自己瀏覽器的
        localStorage，不會上傳、也不會分享給任何人；換瀏覽器、換裝置或清除瀏覽器資料都會遺失紀錄，請自行留意備份。
      </p>
      <p className="muted">版面採用 Broadsheet 報紙式設計，源自於一份設計交付文件。</p>
    </div>
  )
}
