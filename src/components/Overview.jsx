import { useMemo, useState } from 'react'
import { formatShares, formatSharesShort } from '../lib/units'
import {
  goalAchievementSeries,
  investmentBreakdown,
  portfolioValuation,
} from '../lib/overviewMetrics'
import { closePriceDate, getClosePrice } from '../lib/closePrices'
import ContributionHeatmap from './ContributionHeatmap'

function formatDateSlash(iso) {
  return iso ? iso.replace(/-/g, '/') : ''
}

const INITIAL_RECORD_COUNT = 8

export default function Overview({ goals, records, holdingsByStock }) {
  const [showAllRecords, setShowAllRecords] = useState(false)

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

  const nameByCode = useMemo(
    () => Object.fromEntries(goals.map((g) => [g.stockCode, g.stockName])),
    [goals],
  )
  const breakdown = useMemo(
    () => investmentBreakdown(records, nameByCode),
    [records, nameByCode],
  )
  const valuation = useMemo(
    () => portfolioValuation(holdingsByStock, records, getClosePrice),
    [holdingsByStock, records],
  )
  const pnl = valuation.unrealizedPnl
  const pnlSign = pnl == null ? '' : pnl > 0 ? '+' : pnl < 0 ? '−' : ''
  const pnlClass =
    pnl == null || pnl === 0
      ? 'overview-pnl'
      : pnl > 0
        ? 'overview-pnl overview-pnl--up'
        : 'overview-pnl overview-pnl--down'

  const visibleRecords = showAllRecords
    ? sortedRecords
    : sortedRecords.slice(0, INITIAL_RECORD_COUNT)
  const hiddenCount = sortedRecords.length - INITIAL_RECORD_COUNT

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
          {totalOwned > 0 && (
            <div className="overview-valuation">
              <div className="overview-valuation-row">
                <span className="muted">目前現值</span>
                <span>
                  {valuation.hasMarketValue
                    ? Math.round(valuation.marketValue).toLocaleString()
                    : '—'}
                </span>
              </div>
              <div className="overview-valuation-row">
                <span className="muted">
                  未實現損益{valuation.pnlPartial ? `（${valuation.pnlStocks} 檔）` : ''}
                </span>
                {pnl == null ? (
                  <span className="overview-pnl">—</span>
                ) : (
                  <span className={pnlClass}>
                    {pnlSign}
                    {Math.abs(Math.round(pnl)).toLocaleString()}
                    <span className="overview-pnl-pct">
                      （{pnlSign}
                      {Math.abs(valuation.unrealizedPnlPct).toFixed(1)}%）
                    </span>
                  </span>
                )}
              </div>
              <p className="overview-valuation-note">
                依 {formatDateSlash(closePriceDate)} 收盤價估算
                {valuation.missingPriceShares > 0 &&
                  `，${formatSharesShort(valuation.missingPriceShares)}查無收盤價未計入`}
              </p>
            </div>
          )}
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

      <ContributionHeatmap records={records} />

      <div className="overview-breakdown">
        <h3>投入金額比例</h3>
        {breakdown.total <= 0 ? (
          <p className="empty-hint">還沒有含成交價的買入紀錄，無法計算投入金額比例。</p>
        ) : (
          <div className="overview-breakdown-body">
            <svg className="overview-donut" viewBox="0 0 100 100" aria-hidden="true">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="var(--color-surface)"
                strokeWidth="10"
              />
              {breakdown.segments.map((s) => (
                <circle
                  key={s.stockCode}
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke={s.color}
                  strokeWidth="10"
                  strokeDasharray={s.dash}
                  strokeDashoffset={s.offset}
                />
              ))}
            </svg>
            <div className="overview-breakdown-list">
              {breakdown.segments.map((s) => (
                <div className="overview-breakdown-row" key={s.stockCode}>
                  <span
                    className="overview-breakdown-swatch"
                    style={{ background: s.color }}
                    aria-hidden="true"
                  />
                  <span className="overview-breakdown-code">{s.stockCode}</span>
                  <span className="overview-breakdown-name">{s.stockName}</span>
                  <span className="overview-breakdown-amount">
                    {Math.round(s.amount).toLocaleString()}
                  </span>
                  <span className="overview-breakdown-pct">{s.pct.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
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
                const goalPctColor = `color-mix(in srgb, var(--color-accent-800) ${Math.round(goalPct)}%, var(--color-accent-400))`
                const series = goalAchievementSeries(records, goal)
                return (
                  <div className="overview-goal" key={goal.id}>
                    <div className="overview-goal-header">
                      {series.done && (
                        <svg
                          className="overview-goal-done-icon"
                          viewBox="0 0 24 18"
                          aria-hidden="true"
                        >
                          <path
                            d="M2 16 L1 3 L7 8 L12 1 L17 8 L23 3 L22 16 Z"
                            fill="var(--color-process-yellow)"
                          />
                        </svg>
                      )}
                      <strong>{goal.stockCode}</strong>
                      {goal.stockName && <span className="muted">{goal.stockName}</span>}
                      {series.done && (
                        <span className="overview-goal-done-badge">已達標 {series.doneDate}</span>
                      )}
                      <span className="overview-goal-pct" style={{ color: goalPctColor }}>
                        {goalPct.toFixed(1)}%
                      </span>
                    </div>

                    <div className="overview-goal-chart">
                      <div className="overview-goal-chart-yaxis">
                        <span>100%</span>
                        <span>50%</span>
                        <span>0</span>
                      </div>
                      <div className="overview-goal-chart-plot">
                        <svg
                          className="overview-goal-chart-svg"
                          viewBox="0 0 100 100"
                          preserveAspectRatio="none"
                        >
                          <line
                            x1="0"
                            y1="1"
                            x2="100"
                            y2="1"
                            stroke={
                              series.done ? 'var(--color-process-yellow)' : 'var(--color-text)'
                            }
                            strokeOpacity={series.done ? 0.9 : 0.16}
                            strokeDasharray={series.done ? '0' : '3 3'}
                            strokeWidth="1"
                            vectorEffect="non-scaling-stroke"
                          />
                          <line
                            x1="0"
                            y1="50"
                            x2="100"
                            y2="50"
                            stroke="var(--color-text)"
                            strokeOpacity="0.1"
                            strokeWidth="1"
                            vectorEffect="non-scaling-stroke"
                          />
                          <line
                            x1="0"
                            y1="99"
                            x2="100"
                            y2="99"
                            stroke="var(--color-text)"
                            strokeOpacity="0.16"
                            strokeWidth="1"
                            vectorEffect="non-scaling-stroke"
                          />
                          <polyline
                            points={series.areaPts}
                            fill="var(--color-accent)"
                            fillOpacity="0.16"
                            stroke="none"
                          />
                          <polyline
                            points={series.stepPts}
                            fill="none"
                            stroke="var(--color-accent)"
                            strokeWidth="1.5"
                            strokeLinejoin="miter"
                            vectorEffect="non-scaling-stroke"
                          />
                        </svg>
                        <div className="overview-goal-chart-months">
                          {series.axisMonths.map((m, i) => (
                            <span key={i}>{m}</span>
                          ))}
                        </div>
                      </div>
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
            <>
              <div className="overview-record-list">
                {visibleRecords.map((r) => (
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
              {hiddenCount > 0 && (
                <button
                  type="button"
                  className="overview-record-more"
                  onClick={() => setShowAllRecords((v) => !v)}
                >
                  {showAllRecords ? '收合' : `展開更多（還有 ${hiddenCount} 筆）`}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
