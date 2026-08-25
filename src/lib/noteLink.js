import { formatSharesShort } from './units'

// 心得紀錄可以關聯一筆買入紀錄或一個存股目標；回傳可顯示的文字，
// 若關聯的項目後來被刪除了，回傳提示文字而不是讓畫面掛掉。
export function resolveNoteLink(note, { goals, records }) {
  if (note.linkType === 'goal') {
    const goal = goals.find((g) => g.id === note.linkId)
    if (!goal) return { label: '關聯的存股目標已刪除', missing: true }
    return { label: `存股目標：${goal.stockCode}${goal.stockName ? ' ' + goal.stockName : ''}`, missing: false }
  }
  if (note.linkType === 'record') {
    const record = records.find((r) => r.id === note.linkId)
    if (!record) return { label: '關聯的買入紀錄已刪除', missing: true }
    return {
      label: `買入紀錄：${record.date} ${record.stockCode} ${formatSharesShort(record.shares)}`,
      missing: false,
    }
  }
  return null
}
