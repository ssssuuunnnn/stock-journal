// 抓取台股「上市」（證交所 STOCK_DAY_ALL）與「上櫃」（櫃買中心 stk_wn1430）的每日收盤價，
// 合併成 src/data/twClosePrices.json（只保留最新一個交易日的快照）。
// 由 .github/workflows/update-close-prices.yml 每個交易日收盤後自動執行，也可手動 `npm run update:prices`。
import { writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const LISTED_URL =
  'https://www.twse.com.tw/exchangeReport/STOCK_DAY_ALL?response=open_data'
const OTC_URL =
  'https://www.tpex.org.tw/web/stock/aftertrading/otc_quotes_no1430/stk_wn1430_result.php?l=zh-tw&se=EW&o=data'

// 兩個來源都把「資料日期」放在第一欄；「收盤價」的欄位索引不同
const CLOSE_INDEX = { listed: 8, otc: 3 }

// 民國日期（例如 1150828）轉成 ISO（2026-08-28）
function rocToISO(raw) {
  const digits = String(raw).trim()
  if (!/^\d{6,7}$/.test(digits)) return null
  const year = Number(digits.slice(0, digits.length - 4)) + 1911
  const month = digits.slice(-4, -2)
  const day = digits.slice(-2)
  return `${year}-${month}-${day}`
}

function parseCsvLine(line) {
  return line.replace(/^"|"$/g, '').split('","')
}

async function fetchQuotes(url, market) {
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
  if (!res.ok) throw new Error(`${market} 來源回應 ${res.status}`)
  const text = (await res.text()).replace(/^﻿/, '')
  const closeIndex = CLOSE_INDEX[market]

  const prices = {}
  let date = null
  for (const line of text.split(/\r?\n/)) {
    if (!line.startsWith('"')) continue // 跳過表頭與說明列
    const cells = parseCsvLine(line)
    if (cells.length <= closeIndex) continue

    const rowDate = rocToISO(cells[0])
    const code = cells[1]?.trim()
    const close = Number(cells[closeIndex]?.replace(/,/g, ''))
    if (!rowDate || !code || !Number.isFinite(close) || close <= 0) continue

    if (!date || rowDate > date) date = rowDate
    prices[code] = close
  }

  const count = Object.keys(prices).length
  if (count === 0) throw new Error(`${market} 來源沒有解析到任何收盤價`)
  return { date, count, prices }
}

async function main() {
  const [listed, otc] = await Promise.all([
    fetchQuotes(LISTED_URL, 'listed'),
    fetchQuotes(OTC_URL, 'otc'),
  ])

  if (listed.date !== otc.date) {
    console.warn(`⚠ 上市（${listed.date}）與上櫃（${otc.date}）資料日期不一致，仍照樣合併`)
  }

  const prices = {}
  const codes = [...new Set([...Object.keys(otc.prices), ...Object.keys(listed.prices)])].sort()
  for (const code of codes) {
    prices[code] = listed.prices[code] ?? otc.prices[code]
  }

  const out = {
    date: listed.date > otc.date ? listed.date : otc.date,
    updatedAt: new Date().toISOString(),
    sources: {
      listed: { date: listed.date, count: listed.count },
      otc: { date: otc.date, count: otc.count },
    },
    prices,
  }

  const outPath = fileURLToPath(new URL('../src/data/twClosePrices.json', import.meta.url))
  await writeFile(outPath, JSON.stringify(out, null, 2) + '\n', 'utf-8')
  console.log(
    `寫入 ${codes.length} 檔收盤價（上市 ${listed.count}、上櫃 ${otc.count}），資料日期 ${out.date}`,
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
