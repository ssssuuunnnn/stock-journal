import { useState } from 'react'
import { toShares } from '../lib/units'
import ConfirmDialog from './ConfirmDialog'

const emptyForm = {
  stockCode: '',
  stockName: '',
  unit: 'lot',
  targetQty: '',
  note: '',
}

// 目標只存「股」，編輯時反推成張或股：能整除 1000 就顯示成張，比較符合使用習慣。
function formToEdit(goal) {
  const shares = goal.targetShares || 0
  const isWholeLots = shares > 0 && shares % 1000 === 0
  return {
    stockCode: goal.stockCode || '',
    stockName: goal.stockName || '',
    unit: isWholeLots ? 'lot' : 'share',
    targetQty: isWholeLots ? String(shares / 1000) : String(shares),
    note: goal.note || '',
  }
}

export default function GoalForm({ goal, existingGoals = [], onSubmit, onEditExisting, onCancel }) {
  const isEdit = Boolean(goal)
  const [form, setForm] = useState(() => (isEdit ? formToEdit(goal) : emptyForm))
  const [duplicateGoal, setDuplicateGoal] = useState(null)
  const [pendingPayload, setPendingPayload] = useState(null)

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.stockCode.trim() || !form.targetQty) return

    const payload = {
      stockCode: form.stockCode.trim().toUpperCase(),
      stockName: form.stockName.trim(),
      targetShares: toShares(form.targetQty, form.unit),
      note: form.note.trim(),
    }

    if (!isEdit) {
      const duplicate = existingGoals.find((g) => g.stockCode === payload.stockCode)
      if (duplicate) {
        setPendingPayload(payload)
        setDuplicateGoal(duplicate)
        return
      }
    }

    onSubmit(payload)
    if (!isEdit) setForm(emptyForm)
  }

  function handleEditExisting() {
    setDuplicateGoal(null)
    setPendingPayload(null)
    onEditExisting(duplicateGoal)
  }

  function handleAddAnyway() {
    onSubmit(pendingPayload)
    setDuplicateGoal(null)
    setPendingPayload(null)
    setForm(emptyForm)
  }

  return (
    <>
      <form className="card form" onSubmit={handleSubmit}>
        <button type="button" className="link-back" onClick={onCancel}>
          ← 返回存股目標
        </button>
        <h2>{isEdit ? '編輯存股目標' : '新增存股目標'}</h2>
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
        <button type="submit">{isEdit ? '儲存變更' : '新增目標'}</button>
      </form>
      {duplicateGoal && (
        <ConfirmDialog
          message={`股票代號「${duplicateGoal.stockCode}」已經有存股目標了，是否要修改原本的目標？`}
          confirmLabel="修改原本目標"
          cancelLabel="照樣新增"
          confirmVariant="primary"
          onConfirm={handleEditExisting}
          onCancel={handleAddAnyway}
        />
      )}
    </>
  )
}
