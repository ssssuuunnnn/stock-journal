import { formatShares, formatSharesShort } from '../lib/units'

export default function Overview({ goals, records, holdingsByStock }) {
  const totalOwned = Object.values(holdingsByStock).reduce((sum, n) => sum + n, 0)
  const totalTarget = goals.reduce((sum, g) => sum + g.targetShares, 0)

  const pricedRecords = records.filter((r) => r.price != null)
  const totalInvested = pricedRecords.reduce((sum, r) => sum + r.price * r.shares, 0)
  const pricedShares = pricedRecords.reduce((sum, r) => sum + r.shares, 0)
  const avgCost = pricedShares > 0 ? totalInvested / pricedShares : null

  const lastRecordDate = records.reduce((latest, r) => (!latest || r.date > latest ? r.date : latest), null)

  const pct = totalTarget > 0 ? Math.min(100, (totalOwned / totalTarget) * 100) : 0
  const remaining = Math.max(0, totalTarget - totalOwned)

  const summary =
    goals.length === 0 && records.length === 0
      ? '還沒有任何存股目標或買入紀錄。'
      : `${goals.length} 檔標的、${records.length} 筆買入。` +
        (totalTarget > 0 ? `整體達成率 ${pct.toFixed(1)}%，離目標還有 ${formatShares(remaining)}。` : '')

  const sortedRecords = [...records].sort((a, b) => b.date.localeCompare(a.date))
  const totalInvestedText = totalInvested.toLocaleString()

  return (
    <div className="overview">
      <div className="overview-stats">
        <div>
          <h6>累計投入</h6>
          <div className="overview-total">
            <span className="paper">{totalInvestedText}</span>
            <span className="plate plate-c" aria-hidden="true">
              {totalInvestedText}
            </span>
            <span className="plate plate-m" aria-hidden="true">
              {totalInvestedText}
            </span>
            <span className="plate plate-y" aria-hidden="true">
              {totalInvestedText}
            </span>
          </div>
          <p className="overview-summary">{summary}</p>
        </div>
        <div className="overview-metrics">
          <div className="overview-metric">
            <span className="muted">持有股數</span>
            <span>{formatShares(totalOwned)}</span>
          </div>
          <div className="overview-metric">
            <span className="muted">目標股數</span>
            <span>{formatShares(totalTarget)}</span>
          </div>
          <div className="overview-metric">
            <span className="muted">平均成本</span>
            <span>{avgCost != null ? avgCost.toFixed(2) : '—'}</span>
          </div>
          <div className="overview-metric">
            <span className="muted">最近買入</span>
            <span>{lastRecordDate ?? '—'}</span>
          </div>
        </div>
      </div>

      <div className="overview-columns">
        <div>
          <h3>存股目標</h3>
          {goals.length === 0 ? (
            <p className="empty-hint">還沒有設定任何存股目標。</p>
          ) : (
            <div className="overview-goal-list">
              {goals.map((goal) => {
                const owned = holdingsByStock[goal.stockCode] || 0
                const goalPct =
                  goal.targetShares > 0 ? Math.min(100, (owned / goal.targetShares) * 100) : 0
                return (
                  <div className="overview-goal" key={goal.id}>
                    <div className="overview-goal-header">
                      <strong>{goal.stockCode}</strong>
                      {goal.stockName && <span className="muted">{goal.stockName}</span>}
                      <span className="overview-goal-pct">{goalPct.toFixed(1)}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${goalPct}%` }} />
                    </div>
                    <div className="overview-goal-numbers">
                      {formatShares(owned)}
                      <span className="muted">／目標 {formatShares(goal.targetShares)}</span>
                    </div>
                    {goal.note && <p className="overview-goal-note">{goal.note}</p>}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div>
          <div className="overview-records-header">
            <h3>買入紀錄</h3>
            <span className="muted">共 {records.length} 筆</span>
          </div>
          {records.length === 0 ? (
            <p className="empty-hint">還沒有任何買入紀錄。</p>
          ) : (
            <div className="overview-record-list">
              {sortedRecords.map((r) => (
                <div className="overview-record-row" key={r.id}>
                  <span className="overview-record-date">{r.date}</span>
                  <span className="overview-record-code">{r.stockCode}</span>
                  <span className="overview-record-shares">{formatSharesShort(r.shares)}</span>
                  <span className="overview-record-amount">
                    {r.price != null ? (r.price * r.shares).toLocaleString() : '—'}
                  </span>
                  <span className="overview-record-price">{r.price != null ? `@${r.price}` : ''}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
