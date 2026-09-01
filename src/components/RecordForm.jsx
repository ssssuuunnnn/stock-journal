import { useState } from 'react'
import { toShares } from '../lib/units'
import { closePriceDate, getClosePrice } from '../lib/closePrices'

function today() {
  return new Date().toISOString().slice(0, 10)
}

const emptyForm = {
  stockCode: '',
  date: today(),
  unit: 'lot',
  qty: '',
  price: '',
  priceAuto: false, // 成交價是自動帶入的收盤價（使用者尚未手動改過）
  broker: '',
  note: '',
}

// 常見券商，供 datalist 快速選填（仍可自行輸入其他名稱）
const BROKERS = [
  '元大',
  '國泰',
  '富邦',
  '凱基',
  '群益',
  '永豐金',
  '統一',
  '兆豐',
  '玉山',
  '第一金',
  '華南永昌',
  '台新',
  '中信',
  '日盛',
  '新光',
  '元富',
  '康和',
]

export default function RecordForm({ onAdd, onCancel }) {
  const [form, setForm] = useState(emptyForm)

  function update(field, value) {
    setForm((prev) => {
      const next = { ...prev, [field]: value }
      if (field === 'stockCode') {
        // 換股票代號時，若成交價還沒被手動填過，就帶入該股最新收盤價
        const close = getClosePrice(value)
        if (close != null && (prev.price === '' || prev.priceAuto)) {
          next.price = String(close)
          next.priceAuto = true
        } else if (close == null && prev.priceAuto) {
          next.price = ''
          next.priceAuto = false
        }
      } else if (field === 'price') {
        next.priceAuto = false
      }
      return next
    })
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.stockCode.trim() || !form.qty || !form.date) return

    onAdd({
      stockCode: form.stockCode.trim().toUpperCase(),
      date: form.date,
      shares: toShares(form.qty, form.unit),
      price: form.price === '' ? null : Number(form.price),
      broker: form.broker.trim(),
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
          {form.priceAuto && (
            <span className="field-hint">
              已帶入 {closePriceDate.replace(/-/g, '/')} 收盤價，可自行修改
            </span>
          )}
        </label>
      </div>
      <label>
        券商（選填）
        <input
          list="broker-list"
          value={form.broker}
          onChange={(e) => update('broker', e.target.value)}
          placeholder="例如 元大"
        />
        <datalist id="broker-list">
          {BROKERS.map((b) => (
            <option key={b} value={b} />
          ))}
        </datalist>
      </label>
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
