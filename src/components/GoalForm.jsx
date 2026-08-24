import { useState } from 'react'
import { toShares } from '../lib/units'

const emptyForm = {
  stockCode: '',
  stockName: '',
  unit: 'lot',
  targetQty: '',
  note: '',
}

export default function GoalForm({ onAdd, onCancel }) {
  const [form, setForm] = useState(emptyForm)

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.stockCode.trim() || !form.targetQty) return

    onAdd({
      stockCode: form.stockCode.trim().toUpperCase(),
      stockName: form.stockName.trim(),
      targetShares: toShares(form.targetQty, form.unit),
      note: form.note.trim(),
    })
    setForm(emptyForm)
  }

  return (
    <form className="card form" onSubmit={handleSubmit}>
      <button type="button" className="link-back" onClick={onCancel}>
        ← 返回存股目標
      </button>
      <h2>新增存股目標</h2>
      <div className="form-row">
        <label>
          股票代號 *
          <input
            value={form.stockCode}
            onChange={(e) => update('stockCode', e.target.value)}
            placeholder="例如 0050"
            required
          />
        </label>
        <label>
          股票名稱
          <input
            value={form.stockName}
            onChange={(e) => update('stockName', e.target.value)}
            placeholder="例如 元大台灣50"
          />
        </label>
      </div>
      <div className="form-row">
        <label>
          目標張數 / 股數 *
          <input
            type="number"
            min="0"
            step="any"
            value={form.targetQty}
            onChange={(e) => update('targetQty', e.target.value)}
            placeholder="例如 10"
            required
          />
        </label>
        <label>
          單位
          <select value={form.unit} onChange={(e) => update('unit', e.target.value)}>
            <option value="lot">張</option>
            <option value="share">股</option>
          </select>
        </label>
      </div>
      <label>
        備註
        <input
          value={form.note}
          onChange={(e) => update('note', e.target.value)}
          placeholder="選填，例如：退休金存股計畫"
        />
      </label>
      <button type="submit">新增目標</button>
    </form>
  )
}
