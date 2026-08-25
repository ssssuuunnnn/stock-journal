import { buildContributionCalendar } from '../lib/calendar'
import { formatShares } from '../lib/units'

const WEEKDAY_LABELS = ['一', '', '三', '', '五', '', '']

function cellTitle(day) {
  if (day.isFuture) return undefined
  if (day.count === 0) return `${day.date}：無買入紀錄`
  return `${day.date}：買入 ${day.count} 筆、共 ${formatShares(day.shares)}（${day.stockCodes.join('、')}）`
}

export default function ContributionHeatmap({ records }) {
  if (records.length === 0) return null

  const { weeks, monthLabels, totalRecordsInRange } = buildContributionCalendar(records)

  return (
    <div className="heatmap">
      <div className="heatmap-header">
        <h3>買入熱力圖</h3>
        <span className="muted">近 12 個月共 {totalRecordsInRange} 筆買入紀錄</span>
      </div>
      <div className="heatmap-scroll">
        <div className="heatmap-grid">
          <div className="heatmap-corner" />
          <div className="heatmap-months">
            {monthLabels.map((m) => (
              <span key={m.colIndex} className="heatmap-month" style={{ gridColumn: m.colIndex + 1 }}>
                {m.label}
              </span>
            ))}
          </div>
          <div className="heatmap-weekdays">
            {WEEKDAY_LABELS.map((label, i) => (
              <span key={i} className="heatmap-weekday">
                {label}
              </span>
            ))}
          </div>
          <div className="heatmap-cells">
            {weeks.map((week) =>
              week.map((day) => (
                <div
                  key={day.date}
                  className={
                    day.isFuture
                      ? 'heatmap-cell heatmap-cell--pad'
                      : `heatmap-cell heatmap-cell--l${day.level}`
                  }
                  title={cellTitle(day)}
                />
              )),
            )}
          </div>
        </div>
      </div>
      <div className="heatmap-legend">
        <span>少</span>
        <span className="heatmap-cell heatmap-cell--l0" />
        <span className="heatmap-cell heatmap-cell--l1" />
        <span className="heatmap-cell heatmap-cell--l2" />
        <span className="heatmap-cell heatmap-cell--l3" />
        <span className="heatmap-cell heatmap-cell--l4" />
        <span>多</span>
      </div>
    </div>
  )
}
