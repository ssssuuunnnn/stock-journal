// 上市／上櫃股票除權除息預告，由 scripts/fetch-dividends.mjs 產生、每天更新。詳見 CLAUDE.md。
import data from '../data/twDividends.json'

export const dividendsUpdatedAt = data.updatedAt
export const dividendEvents = data.events // { <code>: { name, date, type, cash, stock } }

export function todayISODate() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

export function daysUntil(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  const t = todayISODate().split('-').map(Number)
  return Math.round((Date.UTC(y, m - 1, d) - Date.UTC(t[0], t[1] - 1, t[2])) / 86400000)
}

// 回傳 { name, date, type, cash, stock, daysUntil }；查無、或除權息日已過就回 null。
export function getDividendEvent(stockCode) {
  if (!stockCode) return null
  const ev = data.events[stockCode.trim().toUpperCase()]
  if (!ev || ev.date < todayISODate()) return null
  return { ...ev, daysUntil: daysUntil(ev.date) }
}

function trimNum(n) {
  return Number(Number(n).toFixed(4)).toString()
}

// 例如 ['現金股利 4.38 元', '股票股利 0.8 元']
export function dividendSummaryParts(ev) {
  const parts = []
  if (ev.cash > 0) parts.push(`現金股利 ${trimNum(ev.cash)} 元`)
  if (ev.stock > 0) parts.push(`股票股利 ${trimNum(ev.stock)} 元`)
  return parts
}

// 該檔除權息事件對應的 Google 日曆連結
export function dividendCalendarUrl(code, name, ev) {
  const label = `${code}${name ? ` ${name}` : ''}`
  return googleCalendarUrl({
    title: `${label} 除${ev.type}`,
    date: ev.date,
    details: [
      `${label} 除${ev.type}日：${ev.date.replace(/-/g, '/')}`,
      ...dividendSummaryParts(ev),
      '資料來源：證交所／櫃買中心 除權除息預告，僅供參考。',
    ].join('\n'),
  })
}

// 組出 Google 日曆「新增活動」網址（全天活動，結束日為隔天＝Google 的慣例）
export function googleCalendarUrl({ title, date, details }) {
  const [y, m, d] = date.split('-').map(Number)
  const start = `${y}${String(m).padStart(2, '0')}${String(d).padStart(2, '0')}`
  const next = new Date(Date.UTC(y, m - 1, d + 1))
  const end = `${next.getUTCFullYear()}${String(next.getUTCMonth() + 1).padStart(2, '0')}${String(
    next.getUTCDate(),
  ).padStart(2, '0')}`
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${start}/${end}`,
    details: details || '',
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}
