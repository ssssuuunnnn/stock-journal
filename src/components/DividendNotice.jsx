import { dividendCalendarUrl, dividendSummaryParts, getDividendEvent } from '../lib/dividends'

// 存股目標項目下方的「即將除權息」提示：日期、股利、加入 Google 日曆連結。
// 對不到預告資料（含非上市櫃、或除權息日已過）時回傳 null。
export default function DividendNotice({ stockCode, stockName }) {
  const ev = getDividendEvent(stockCode)
  if (!ev) return null

  const parts = dividendSummaryParts(ev)
  const calUrl = dividendCalendarUrl(stockCode, stockName, ev)

  return (
    <p className="dividend-notice">
      <span className="dividend-badge">{ev.type}</span>
      即將除{ev.type}
      {' · '}
      {ev.date.replace(/-/g, '/')}
      {ev.daysUntil >= 0 && `（${ev.daysUntil === 0 ? '就是今天' : `還有 ${ev.daysUntil} 天`}）`}
      {parts.length > 0 && ` · ${parts.join('、')}`}{' '}
      <a
        className="dividend-cal-link"
        href={calUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        加入 Google 日曆
      </a>
    </p>
  )
}
