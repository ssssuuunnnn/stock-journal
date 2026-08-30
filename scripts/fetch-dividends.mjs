// 抓取「上市股票除權除息預告表」（證交所 OpenAPI TWT48U_ALL）與
// 「上櫃股票除權除息預告」（櫃買 OpenAPI tpex_exright_prepost），合併成
// src/data/twDividends.json，供存股目標項目顯示「即將除權息」提示。
// 由 .github/workflows/update-market-data.yml 每天更新，也可手動 `npm run update:dividends`。
import { writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const SOURCES = [
  {
    name: '上市 (TWSE)',
    url: 'https://openapi.twse.com.tw/v1/exchangeReport/TWT48U_ALL',
    keys: { date: 'Date', code: 'Code', name: 'Name', type: 'Exdividend' },
  },
  {
    name: '上櫃 (TPEX)',
    url: 'https://www.tpex.org.tw/openapi/v1/tpex_exright_prepost',
    keys: {
      date: 'ExRrightsExDividendDate',
      code: 'SecuritiesCompanyCode',
      name: 'CompanyName',
      type: 'ExRrightsExDividend',
    },
  },
]
// 兩個來源的股利欄位名稱剛好一樣
const STOCK_RATIO_KEY = 'StockDividendRatio'
const CASH_KEY = 'CashDividend'

// 民國日期（1150907）轉 ISO（2026-09-07）
function rocToISO(raw) {
  const s = String(raw).trim()
  if (!/^\d{6,7}$/.test(s)) return null
  const year = Number(s.slice(0, s.length - 4)) + 1911
  return `${year}-${s.slice(-4, -2)}-${s.slice(-2)}`
}

function round(n) {
  return Math.round(n * 10000) / 10000
}

async function fetchSource({ name, url, keys }) {
  const res = await fetch(url, {
    headers: { accept: 'application/json', 'Cache-Control': 'no-cache' },
  })
  if (!res.ok) throw new Error(`${name} 回應 ${res.status}`)
  const rows = await res.json()
  if (!Array.isArray(rows) || rows.length === 0) throw new Error(`${name} 沒有資料`)

  const out = []
  for (const r of rows) {
    const date = rocToISO(r[keys.date])
    const code = r[keys.code]?.trim()
    if (!date || !code) continue

    const cash = Number(r[CASH_KEY]) || 0
    // StockDividendRatio 是配股率（股/股），×10 換算成面額 10 元的股票股利（元/股）
    const stock = (Number(r[STOCK_RATIO_KEY]) || 0) * 10
    // 息 / 權 / 權息（TWSE 給「息」，TPEX 給「除息」，統一去掉「除」）
    const type = String(r[keys.type] || '').replace(/^除/, '').trim() || '息'

    out.push({ code, name: r[keys.name]?.trim() || '', date, type, cash: round(cash), stock: round(stock) })
  }
  return out
}

async function main() {
  const lists = await Promise.all(SOURCES.map(fetchSource))

  const events = {}
  for (const list of lists) {
    for (const ev of list) {
      // 同一檔若有多筆，留最早（最接近）的那一天
      if (!events[ev.code] || ev.date < events[ev.code].date) {
        events[ev.code] = { name: ev.name, date: ev.date, type: ev.type, cash: ev.cash, stock: ev.stock }
      }
    }
  }

  const out = {
    updatedAt: new Date().toISOString(),
    count: Object.keys(events).length,
    events: Object.fromEntries(Object.keys(events).sort().map((c) => [c, events[c]])),
  }

  const outPath = fileURLToPath(new URL('../src/data/twDividends.json', import.meta.url))
  await writeFile(outPath, JSON.stringify(out, null, 2) + '\n', 'utf-8')
  console.log(
    `寫入 ${out.count} 檔除權息預告（${SOURCES.map((s, i) => `${s.name} ${lists[i].length}`).join('、')}）`,
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
