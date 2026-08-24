export default function AboutAuthor({ onBack }) {
  return (
    <div className="about">
      <button type="button" className="link-back" onClick={onBack}>
        ← 返回存股目標
      </button>
      <h2>關於作者</h2>
      <p>
        存股日記是我個人開發的小工具。想看更多作品或認識我，歡迎到我的網站逛逛：
        <br />
        <a href="https://www.sunkuo.cc/" target="_blank" rel="noopener noreferrer">
          https://www.sunkuo.cc/
        </a>
      </p>
    </div>
  )
}
