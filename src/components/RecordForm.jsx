import { useState } from 'react'
import { toShares } from '../lib/units'

function today() {
  return new Date().toISOString().slice(0, 10)
}

const emptyForm = {
  stockCode: '',
  date: today(),
  unit: 'lot',
  qty: '',
  price: '',
  note: '',
}

export default function RecordForm({ onAdd, onCancel }) {
  const [form, setForm] = useState(emptyForm)

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.stockCode.trim() || !form.qty || !form.date) return

    onAdd({
      stockCode: form.stockCode.trim().toUpperCase(),
      date: form.date,
      shares: toShares(form.qty, form.unit),
      price: form.price === '' ? null : Number(form.price),
      note: form.note.trim(),
    })
    setForm({ ...emptyForm, date: form.date })
  }

  return (
    <form className="card form" onSubmit={handleSubmit}>
      <button type="button" className="link-back" onClick={onCancel}>
        ← 返回買入紀錄
      </button>
      <h2>新增買入紀錄</h2>
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
          買入日期 *
          <input
            type="date"
            value={form.date}
            onChange={(e) => update('date', e.target.value)}
            required
          />
        </label>
      </div>
      <div className="form-row">
        <label>
          張數 / 股數 *
          <input
            type="number"
            min="0"
            step="any"
            value={form.qty}
            onChange={(e) => update('qty', e.target.value)}
            placeholder="例如 1"
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
        <label>
          成交價（選填）
          <input
            type="number"
            min="0"
            step="any"
            value={form.price}
            onChange={(e) => update('price', e.target.value)}
            placeholder="例如 135.5"
          />
        </label>
      </div>
      <label>
        備註
        <input
          value={form.note}
          onChange={(e) => update('note', e.target.value)}
          placeholder="選填"
        />
      </label>
      <button type="submit">新增紀錄</button>
    </form>
  )
}
