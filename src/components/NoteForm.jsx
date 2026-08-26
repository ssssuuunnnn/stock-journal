import { useState } from 'react'
import { formatSharesShort } from '../lib/units'

const MAX_CONTENT_LENGTH = 200
const FEELINGS = [
  '開心',
  '被愛',
  '興奮',
  '幸福',
  '酷',
  '抓狂',
  '被逗樂了',
  '正面積極',
  '驕傲',
  '幸運',
  '耍笨',
]

function linkValueOf(note) {
  return note && note.linkType && note.linkId ? `${note.linkType}:${note.linkId}` : ''
}

export default function NoteForm({ note, goals, records, onSubmit, onCancel }) {
  const isEdit = Boolean(note)
  const [content, setContent] = useState(note ? note.content : '')
  const [linkValue, setLinkValue] = useState(() => linkValueOf(note))
  const [feelings, setFeelings] = useState(() => (note && note.feelings) || [])
  const [isMilestone, setIsMilestone] = useState(() => Boolean(note && note.isMilestone))

  function toggleFeeling(feeling) {
    setFeelings((prev) =>
      prev.includes(feeling) ? prev.filter((f) => f !== feeling) : [...prev, feeling],
    )
  }

  function handleSubmit(e) {
    e.preventDefault()
    const trimmed = content.trim()
    if (!trimmed) return

    const [linkType, linkId] = linkValue ? linkValue.split(':') : [null, null]

    onSubmit({
      content: trimmed,
      linkType: linkType || null,
      linkId: linkId || null,
      feelings,
      isMilestone,
    })

    if (!isEdit) {
      setContent('')
      setLinkValue('')
      setFeelings([])
      setIsMilestone(false)
    }
  }

  return (
    <form className="card form" onSubmit={handleSubmit}>
      <button type="button" className="link-back" onClick={onCancel}>
        ← 返回心得筆記
      </button>
      <h2>{isEdit ? '編輯心得筆記' : '新增心得筆記'}</h2>
      <label>
        內容 *
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value.slice(0, MAX_CONTENT_LENGTH))}
          maxLength={MAX_CONTENT_LENGTH}
          rows={5}
          placeholder="寫下這次存股的想法、心情或觀察……"
          required
        />
      </label>
      <div className="char-counter">
        {content.length} / {MAX_CONTENT_LENGTH}
      </div>
      <fieldset className="feeling-field">
        <legend>感受</legend>
        <div className="feeling-picker">
          {FEELINGS.map((feeling) => (
            <button
              key={feeling}
              type="button"
              className={feelings.includes(feeling) ? 'feeling-chip active' : 'feeling-chip'}
              aria-pressed={feelings.includes(feeling)}
              onClick={() => toggleFeeling(feeling)}
            >
              {feeling}
            </button>
          ))}
        </div>
      </fieldset>
      <label className="milestone-toggle">
        <input
          type="checkbox"
          checked={isMilestone}
          onChange={(e) => setIsMilestone(e.target.checked)}
        />
        設為里程碑
      </label>
      <label>
        關聯項目
        <select value={linkValue} onChange={(e) => setLinkValue(e.target.value)}>
          <option value="">不關聯</option>
          {goals.length > 0 && (
            <optgroup label="存股目標">
              {goals.map((g) => (
                <option key={g.id} value={`goal:${g.id}`}>
                  {g.stockCode}
                  {g.stockName ? ` ${g.stockName}` : ''}
                </option>
              ))}
            </optgroup>
          )}
          {records.length > 0 && (
            <optgroup label="買入紀錄">
              {records.map((r) => (
                <option key={r.id} value={`record:${r.id}`}>
                  {r.date} {r.stockCode} {formatSharesShort(r.shares)}
                </option>
              ))}
            </optgroup>
          )}
        </select>
      </label>
      <button type="submit">{isEdit ? '儲存變更' : '新增心得'}</button>
    </form>
  )
}
