import { useMemo, useState } from 'react'
import { formatShares } from '../lib/units'
import ConfirmDialog from './ConfirmDialog'

export default function RecordTable({ records, onDelete }) {
  const [filter, setFilter] = useState('all')
  const [pendingDelete, setPendingDelete] = useState(null)

  const stockCodes = useMemo(
    () => Array.from(new Set(records.map((r) => r.stockCode))).sort(),
    [records],
  )

  const filtered = useMemo(() => {
    const list = filter === 'all' ? records : records.filter((r) => r.stockCode === filter)
    return [...list].sort((a, b) => b.date.localeCompare(a.date))
  }, [records, filter])

  if (records.length === 0) {
    return <p className="empty-hint">還沒有任何買入紀錄，按下面的按鈕新增一筆吧。</p>
  }

  return (
    <div className="card">
      <div className="table-toolbar">
        <label>
          篩選股票
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">全部</option>
            {stockCodes.map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>
        </label>
        <span className="muted">共 {filtered.length} 筆</span>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>日期</th>
              <th>股票代號</th>
              <th>股數</th>
              <th>成交價</th>
              <th>金額</th>
              <th>備註</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id}>
                <td>{r.date}</td>
                <td>{r.stockCode}</td>
                <td>{formatShares(r.shares)}</td>
                <td>{r.price != null ? r.price : '—'}</td>
                <td>{r.price != null ? (r.price * r.shares).toLocaleString() : '—'}</td>
                <td className="muted">{r.note || '—'}</td>
                <td>
                  <button className="link-btn" onClick={() => setPendingDelete(r)}>
                    刪除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pendingDelete && (
        <ConfirmDialog
          message={`確定要刪除 ${pendingDelete.date} ${pendingDelete.stockCode} 這筆買入紀錄嗎？`}
          onConfirm={() => {
            onDelete(pendingDelete.id)
            setPendingDelete(null)
          }}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  )
}
