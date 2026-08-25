// 僅開發模式使用：如果 localStorage 裡還沒有存股目標/買入紀錄，自動塞一份範例資料，
// 這樣每次重開 npm run dev（或清瀏覽器資料）都不用手動重新輸入。
// import.meta.env.DEV 在 `npm run build` 會是 false，整段邏輯會被 Vite 靜態排除，不會進正式版。

const GOALS_KEY = 'stock-daily:goals'
const RECORDS_KEY = 'stock-daily:records'

const SEED_STOCKS = [
  { code: '0050', name: '元大台灣50', price: 140, targetLots: 20 },
  { code: '2330', name: '台積電', price: 600, targetLots: 5 },
  { code: '0056', name: '元大高股息', price: 34, targetLots: 30 },
]

function toISODate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function makeId(prefix, i) {
  return `${prefix}-${i}`
}

function buildSeedGoals() {
  return SEED_STOCKS.map((s, i) => ({
    id: makeId('seed-goal', i),
    createdAt: Date.now(),
    stockCode: s.code,
    stockName: s.name,
    targetShares: s.targetLots * 1000,
    note: '',
  }))
}

// 過去約 5 個月，每週隨機挑 1~2 天買入，張數 1~3 張、價格在基準價上下浮動
function buildSeedRecords(today) {
  const records = []
  let i = 0
  for (let weeksAgo = 20; weeksAgo >= 0; weeksAgo--) {
    const buysThisWeek = Math.random() < 0.7 ? 1 : 2
    for (let b = 0; b < buysThisWeek; b++) {
      const dayOffset = weeksAgo * 7 + Math.floor(Math.random() * 7)
      const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - dayOffset)
      const stock = SEED_STOCKS[Math.floor(Math.random() * SEED_STOCKS.length)]
      const lots = Math.floor(Math.random() * 3) + 1
      const priceJitter = (Math.random() - 0.5) * stock.price * 0.08
      records.push({
        id: makeId('seed-record', i++),
        createdAt: date.getTime(),
        stockCode: stock.code,
        date: toISODate(date),
        shares: lots * 1000,
        price: Math.round((stock.price + priceJitter) * 100) / 100,
        note: '',
      })
    }
  }
  return records.sort((a, b) => a.date.localeCompare(b.date))
}

export function seedDevData() {
  if (!import.meta.env.DEV) return
  try {
    const hasGoals = window.localStorage.getItem(GOALS_KEY)
    const hasRecords = window.localStorage.getItem(RECORDS_KEY)
    if (hasGoals || hasRecords) return

    window.localStorage.setItem(GOALS_KEY, JSON.stringify(buildSeedGoals()))
    window.localStorage.setItem(RECORDS_KEY, JSON.stringify(buildSeedRecords(new Date())))
  } catch {
    // storage unavailable — ignore, app falls back to empty state
  }
}
