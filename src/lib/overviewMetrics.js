import { parseISODate, toISODate } from './calendar'

const DONUT_RADIUS = 45
const DONUT_CIRC = 2 * Math.PI * DONUT_RADIUS

// 疊在青／洋紅／黃 accent ramp 上的分段配色，最後一段（其他）用中性灰
const SEGMENT_COLORS = [
  'var(--color-accent)',
  'var(--color-accent-2)',
  'var(--color-process-yellow)',
  'var(--color-accent-800)',
  'var(--color-accent-400)',
  'var(--color-neutral-600)',
]
const OTHER_COLOR = 'var(--color-neutral-300)'

function round(n) {
  return Math.round(n * 100) / 100
}

// 投入金額比例：以「含成交價的買入紀錄」的 price × shares 加總，算各標的佔總投入金額的比例。
// 超過 maxSegments 檔時，把最小的幾檔併成「其他」，避免圓環被切得太碎。
export function investmentBreakdown(records, nameByCode = {}, maxSegments = 6) {
  const byCode = new Map()
  for (const r of records) {
    if (r.price == null) continue
    byCode.set(r.stockCode, (byCode.get(r.stockCode) || 0) + r.price * r.shares)
  }

  const entries = [...byCode.entries()]
    .map(([stockCode, amount]) => ({ stockCode, amount }))
    .sort((a, b) => b.amount - a.amount)
  const total = entries.reduce((sum, e) => sum + e.amount, 0)
  if (total <= 0) return { total: 0, segments: [] }

  let grouped = entries
  if (entries.length > maxSegments) {
    const head = entries.slice(0, maxSegments - 1)
    const tail = entries.slice(maxSegments - 1)
    grouped = [
      ...head,
      {
        stockCode: '其他',
        amount: tail.reduce((sum, e) => sum + e.amount, 0),
        isOther: true,
        count: tail.length,
      },
    ]
  }

  let acc = 0
  const segments = grouped.map((seg, i) => {
    const fraction = seg.amount / total
    const len = fraction * DONUT_CIRC
    const out = {
      stockCode: seg.stockCode,
      stockName: seg.isOther ? `${seg.count} 檔` : nameByCode[seg.stockCode] || '',
      amount: seg.amount,
      pct: fraction * 100,
      color: seg.isOther ? OTHER_COLOR : SEGMENT_COLORS[i % SEGMENT_COLORS.length],
      dash: `${round(len)} ${round(DONUT_CIRC - len)}`,
      offset: round(-acc * DONUT_CIRC),
    }
    acc += fraction
    return out
  })

  return { total, segments }
}

// 用收盤價估算整體現值與未實現損益。
// 這個 app 只記買入、沒有賣出，所以「持有股數 = 歷來買入加總」、「投入成本 = 有填成交價的買入加總」。
//   現值    ＝ Σ（持有股數 × 收盤價），只計得到收盤價的標的
//   未實現損益 ＝ Σ（現值 − 投入成本），只計「每一筆買入都有成交價」且「拿得到收盤價」的標的
// priceOf(code) 由呼叫端提供（通常是 lib/closePrices 的 getClosePrice）。
export function portfolioValuation(holdingsByStock, records, priceOf) {
  const costByStock = {}
  const pricedSharesByStock = {}
  for (const r of records) {
    if (r.price == null) continue
    costByStock[r.stockCode] = (costByStock[r.stockCode] ?? 0) + r.price * r.shares
    pricedSharesByStock[r.stockCode] = (pricedSharesByStock[r.stockCode] ?? 0) + r.shares
  }

  let marketValue = 0
  let missingPriceShares = 0 // 有持股、但查不到收盤價
  let heldStocks = 0
  let pnlMarketValue = 0
  let pnlCost = 0
  let pnlStocks = 0

  for (const [code, shares] of Object.entries(holdingsByStock)) {
    if (shares <= 0) continue
    heldStocks += 1

    const close = priceOf(code)
    if (close == null) {
      missingPriceShares += shares
      continue
    }
    const value = shares * close
    marketValue += value

    // 該標的每一股都有成交價才納入損益計算，否則成本不完整、只計現值
    if ((pricedSharesByStock[code] ?? 0) >= shares) {
      pnlMarketValue += value
      pnlCost += costByStock[code]
      pnlStocks += 1
    }
  }

  const hasPnl = pnlCost > 0
  const unrealizedPnl = hasPnl ? pnlMarketValue - pnlCost : null

  return {
    marketValue,
    hasMarketValue: marketValue > 0,
    missingPriceShares,
    heldStocks,
    pnlStocks,
    unrealizedPnl,
    unrealizedPnlPct: hasPnl ? (unrealizedPnl / pnlCost) * 100 : null,
    // 損益涵蓋的標的少於全部持股時，畫面上標註「N 檔」讓使用者知道不是全部
    pnlPartial: hasPnl && pnlStocks < heldStocks,
  }
}

// 達成率折線圖：把某個目標近 months 個月的「持有股數 ÷ 目標股數」畫成階梯線。
// 座標用 0–100 的 viewBox：x 為時間（0 = 視窗起點、100 = 今天），y 為 100 - 達成率（0 在上、100 在下）。
export function goalAchievementSeries(records, goal, { today = new Date(), months = 6 } = {}) {
  const target = goal.targetShares || 0
  const stockRecords = records
    .filter((r) => r.stockCode === goal.stockCode)
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))

  // 全期間累計，找出第一次達標的日期
  let cumulative = 0
  let doneDate = null
  for (const r of stockRecords) {
    cumulative += r.shares
    if (doneDate == null && target > 0 && cumulative >= target) doneDate = r.date
  }
  const currentHoldings = cumulative
  const currentPct = target > 0 ? (currentHoldings / target) * 100 : 0

  const windowStart = new Date(today.getFullYear(), today.getMonth() - (months - 1), 1)
  const startISO = toISODate(windowStart)
  const todayISO = toISODate(today)
  const spanMs = Math.max(1, parseISODate(todayISO).getTime() - windowStart.getTime())

  const xForISO = (iso) => {
    const t = parseISODate(iso).getTime() - windowStart.getTime()
    return Math.max(0, Math.min(100, (t / spanMs) * 100))
  }
  const yForShares = (shares) => {
    const pct = target > 0 ? (shares / target) * 100 : 0
    return round(100 - Math.max(0, Math.min(100, pct)))
  }

  // 視窗起點前已持有的股數 = 折線的起始高度
  let running = 0
  for (const r of stockRecords) {
    if (r.date < startISO) running += r.shares
    else break
  }

  const pts = [[0, yForShares(running)]]
  for (const r of stockRecords) {
    if (r.date < startISO) continue
    const x = round(xForISO(r.date))
    pts.push([x, yForShares(running)]) // 先水平走到買入日
    running += r.shares
    pts.push([x, yForShares(running)]) // 再垂直跳一階
  }
  pts.push([100, yForShares(running)]) // 延伸到今天

  const stepPts = pts.map(([x, y]) => `${x},${y}`).join(' ')
  const areaPts = `0,100 ${stepPts} 100,100`

  const axisMonths = []
  for (let i = 0; i < months; i++) {
    const d = new Date(windowStart.getFullYear(), windowStart.getMonth() + i, 1)
    axisMonths.push(`${d.getMonth() + 1}月`)
  }

  return {
    stepPts,
    areaPts,
    axisMonths,
    currentHoldings,
    currentPct,
    done: doneDate != null && doneDate <= todayISO,
    doneDate,
  }
}
