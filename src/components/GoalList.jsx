import { useState } from 'react'
import { formatShares } from '../lib/units'
import ConfirmDialog from './ConfirmDialog'

export default function GoalList({ goals, holdingsByStock, onDelete }) {
  const [pendingDelete, setPendingDelete] = useState(null)

  if (goals.length === 0) {
    return <p className="empty-hint">還沒有設定任何存股目標，按下面的按鈕新增一個吧。</p>
  }

  return (
    <>
      <div className="goal-grid">
        {goals.map((goal) => {
          const owned = holdingsByStock[goal.stockCode] || 0
          const pct = goal.targetShares > 0 ? Math.min(100, (owned / goal.targetShares) * 100) : 0
          return (
            <div className="card goal-card" key={goal.id}>
              <div className="goal-card-header">
                <div>
                  <strong>{goal.stockCode}</strong>
                  {goal.stockName && <span className="muted"> {goal.stockName}</span>}
                </div>
                <button className="link-btn" onClick={() => setPendingDelete(goal)}>
                  刪除
                </button>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${pct}%` }} />
              </div>
              <div className="goal-numbers">
                <span>{formatShares(owned)}</span>
                <span className="muted">/ 目標 {formatShares(goal.targetShares)}</span>
                <span className="pct">{pct.toFixed(1)}%</span>
              </div>
              {goal.note && <p className="muted note">{goal.note}</p>}
            </div>
          )
        })}
      </div>
      {pendingDelete && (
        <ConfirmDialog
          message={`確定要刪除「${pendingDelete.stockCode}」這個存股目標嗎？`}
          onConfirm={() => {
            onDelete(pendingDelete.id)
            setPendingDelete(null)
          }}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </>
  )
}
