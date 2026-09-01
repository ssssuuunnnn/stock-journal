// 使用者可見的更新紀錄。新增功能時在最上面補一則（日期新的在前）。
const ENTRIES = [
  {
    date: '2026/09/01',
    items: ['新增買入紀錄時，可填寫「券商」欄位，並顯示在買入紀錄表格。'],
  },
  {
    date: '2026/08/30',
    items: [
      '存股總覽改版：新增「投入金額比例」圓環圖、存股目標改用「達成率折線圖」並標示已達標、買入紀錄可展開更多／收合。',
      '存股總覽新增「目前現值 / 未實現損益」，依最新收盤價估算（獲利紅、虧損綠）。',
      '新增買入紀錄時，輸入股票代號會自動帶入最新收盤價，可自行修改。',
      '每個存股目標會顯示最新收盤價與持股現值。',
      '存股目標若即將除權息，會顯示日期、股利，並提供「加入 Google 日曆」連結。',
      '新增「除權息」分頁，列出上市／上櫃所有除權除息預告。',
      '收盤價與除權息預告資料每天自動更新（資料來源：證交所、櫃買中心）。',
      '手機版可左右滑動切換分頁，並修正分頁名稱會折行的問題。',
      '頁尾新增「更新紀錄」與「意見回饋」連結。',
    ],
  },
  {
    date: '2026/08/26',
    items: [
      '「心得紀錄」更名為「心得筆記」。',
      '新增存股目標時，股票代號支援自動完成。',
    ],
  },
  {
    date: '2026/08/25',
    items: [
      '存股目標可以編輯。',
      '新增「心得筆記」分頁。',
      '新增「買入熱力圖」。',
    ],
  },
  {
    date: '2026/08/24',
    items: ['存股日記上線。'],
  },
]

export default function Changelog({ onBack }) {
  return (
    <div className="about changelog">
      <button type="button" className="link-back" onClick={onBack}>
        ← 返回存股目標
      </button>
      <h2>更新紀錄</h2>
      <p>存股日記歷次的功能更新，新的在上面。</p>
      {ENTRIES.map((entry) => (
        <div className="changelog-entry" key={entry.date}>
          <div className="changelog-date">{entry.date}</div>
          <ul>
            {entry.items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
