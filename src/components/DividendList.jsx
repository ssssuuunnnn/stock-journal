import { useMemo, useState } from 'react'
import {
  dividendCalendarUrl,
  dividendEvents,
  dividendsUpdatedAt,
  todayISODate,
} from '../lib/dividends'

function trimNum(n) {
  return Number(Number(n).toFixed(4)).toString()
}

export default function DividendList({ goals = [] }) {
  const [showPast, setShowPast] = useState(false)
  const goalCodes = useMemo(() => new Set(goals.map((g) => g.stockCode)), [goals])
  const today = todayISODate()

  const rows = useMemo(
    () =>
      Object.entries(dividendEvents)
        .map(([code, ev]) => ({ code, ...ev }))
        .sort((a, b) => a.date.localeCompare(b.date) || a.code.localeCompare(b.code)),
    [],
  )

  const upcoming = rows.filter((r) => r.date >= today)
  const past = rows.filter((r) => r.date < today)
  const visible = showPast ? rows : upcoming
  const updated = (dividendsUpdatedAt || '').slice(0, 10).replace(/-/g, '/')

  return (
    <div className="dividend-page">
      <div className="dividend-page-header">
        <h3>除權息預告</h3>
        <span className="muted">
          即將除權息 {upcoming.length} 筆{updated && `・資料更新於 ${updated}`}
        </span>
      </div>
      <p className="muted dividend-page-hint">
        證交所（上市）與櫃買中心（上櫃）公告之除權除息預告，約含未來兩個月。僅供參考，實際請以公司公告為準。
      </p>

      {past.length > 0 && (
        <label className="dividend-page-toggle">
          <input
            type="checkbox"
            checked={showPast}
            onChange={(e) => setShowPast(e.target.checked)}
          />
          一併顯示已除權息（{past.length} 筆）
        </label>
      )}

      {visible.length === 0 ? (
        <p className="empty-hint">目前沒有即將除權息的資料。</p>
      ) : (
        <div className="table-wrap">
          <table className="dividend-table">
            <thead>
              <tr>
                <th>除權息日</th>
                <th>代號</th>
                <th>名稱</th>
                <th>類型</th>
                <th className="num">現金股利</th>
                <th className="num">股票股利</th>
                <th aria-label="加入日曆" />
              </tr>
            </thead>
            <tbody>
              {visible.map((r) => {
                const isPast = r.date < today
                const isGoal = goalCodes.has(r.code)
                return (
                  <tr
                    key={`${r.code}-${r.date}`}
                    className={isPast ? 'is-past' : isGoal ? 'is-goal' : undefined}
                  >
                    <td>{r.date.replace(/-/g, '/')}</td>
                    <td className="code">
                      {r.code}
                      {isGoal && <span className="dividend-goal-tag">目標</span>}
                    </td>
                    <td>{r.name}</td>
                    <td>
                      <span className="dividend-badge">{r.type}</span>
                    </td>
                    <td className="num">{r.cash > 0 ? trimNum(r.cash) : '—'}</td>
                    <td className="num">{r.stock > 0 ? trimNum(r.stock) : '—'}</td>
                    <td>
                      {!isPast && (
                        <a
                          className="dividend-cal-link"
                          href={dividendCalendarUrl(r.code, r.name, r)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          加入日曆
                        </a>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
