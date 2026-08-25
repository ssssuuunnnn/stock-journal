const WEEKS = 53

// 用年/月/日組出 local midnight 的 Date，避免 new Date('YYYY-MM-DD') 在負時區被解讀成 UTC 而位移一天
function parseISODate(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function toISODate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function addDays(date, n) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + n)
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

// 週一 = 0 ... 週日 = 6
function mondayIndex(date) {
  return (date.getDay() + 6) % 7
}

// 強度以「當天買入股數加總」為準，而非買入筆數——多數人一天最多新增一筆紀錄，
// 用筆數算會導致 maxCount<=1、只剩「有買/沒買」兩色；股數本來就會隨每次買入量不同而變化。
function level(shares, maxShares) {
  if (shares <= 0) return 0
  if (maxShares <= 0) return 0
  const ratio = shares / maxShares
  if (ratio >= 0.75) return 4
  if (ratio >= 0.5) return 3
  if (ratio >= 0.25) return 2
  return 1
}

export function buildContributionCalendar(records, { today = new Date(), weeks = WEEKS } = {}) {
  const todayLocal = startOfDay(today)
  const endOfWeekEnd = addDays(todayLocal, 6 - mondayIndex(todayLocal))
  const gridStart = addDays(endOfWeekEnd, -(weeks * 7 - 1))

  const tally = new Map()
  for (const r of records) {
    const entry = tally.get(r.date) || { count: 0, shares: 0, stockCodes: new Set() }
    entry.count += 1
    entry.shares += r.shares
    entry.stockCodes.add(r.stockCode)
    tally.set(r.date, entry)
  }

  let maxShares = 0
  for (const entry of tally.values()) {
    if (entry.shares > maxShares) maxShares = entry.shares
  }

  const gridWeeks = []
  const monthLabels = []
  let prevMonthKey = null
  let totalRecordsInRange = 0

  for (let col = 0; col < weeks; col++) {
    const weekStart = addDays(gridStart, col * 7)
    const monthKey = `${weekStart.getFullYear()}-${weekStart.getMonth()}`
    if (monthKey !== prevMonthKey) {
      monthLabels.push({ colIndex: col, label: `${weekStart.getMonth() + 1}月` })
      prevMonthKey = monthKey
    }

    const days = []
    for (let row = 0; row < 7; row++) {
      const date = addDays(weekStart, row)
      const iso = toISODate(date)
      const isFuture = date > todayLocal
      const entry = tally.get(iso)
      const count = entry ? entry.count : 0
      const shares = entry ? entry.shares : 0
      if (!isFuture) totalRecordsInRange += count
      days.push({
        date: iso,
        count,
        shares,
        stockCodes: entry ? Array.from(entry.stockCodes) : [],
        isFuture,
        level: isFuture ? -1 : level(shares, maxShares),
      })
    }
    gridWeeks.push(days)
  }

  return {
    weeks: gridWeeks,
    monthLabels,
    totalRecordsInRange,
    rangeStart: toISODate(gridStart),
    rangeEnd: toISODate(endOfWeekEnd),
  }
}

export { parseISODate, toISODate, addDays, mondayIndex }
