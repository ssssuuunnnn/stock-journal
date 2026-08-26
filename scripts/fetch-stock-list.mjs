// 從證交所 ISIN 網站抓取上市/上櫃/興櫃證券清單，只保留股票與 ETF，
// 產生 src/data/twStockList.json 供「新增存股目標」的代號自動完成使用。
// 手動執行：npm run update:stocks
import { writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import iconv from 'iconv-lite'

const SOURCES = [
  { mode: 2, market: '上市' },
  { mode: 4, market: '上櫃' },
  { mode: 5, market: '興櫃' },
]

const INCLUDED_CATEGORIES = new Set(['股票', 'ETF'])

async function fetchHtml(mode) {
  const res = await fetch(`https://isin.twse.com.tw/isin/C_public.jsp?strMode=${mode}`)
  const buffer = Buffer.from(await res.arrayBuffer())
  return iconv.decode(buffer, 'big5')
}

function parseRows(html, market) {
  const rowRe = /<tr[^>]*>([\s\S]*?)<\/tr>/g
  const cellRe = /<td[^>]*>([\s\S]*?)<\/td>/g
  const stocks = []
  let currentCategory = null
  let row

  while ((row = rowRe.exec(html))) {
    const cells = [...row[1].matchAll(cellRe)].map((m) => m[1].trim())
    if (cells.length === 0) continue

    // 分類標題列，例如 <td colspan=7><B> 股票 <B></td>
    if (row[1].includes('colspan=7')) {
      currentCategory = cells[0].replace(/<[^>]+>/g, '').trim()
      continue
    }

    // 表頭列
    if (cells[0] === '有價證券代號及名稱') continue

    // 興櫃 (mode=5) 沒有分類列，全部視為股票
    const category = currentCategory ?? '股票'
    if (!INCLUDED_CATEGORIES.has(category)) continue

    const [code, name] = cells[0].split('　')
    if (!code || !name) continue

    stocks.push({ code: code.trim(), name: name.trim(), market })
  }

  return stocks
}

async function main() {
  const all = []
  for (const { mode, market } of SOURCES) {
    const html = await fetchHtml(mode)
    all.push(...parseRows(html, market))
  }

  const byCode = new Map()
  for (const stock of all) {
    if (!byCode.has(stock.code)) byCode.set(stock.code, stock)
  }
  const stocks = [...byCode.values()].sort((a, b) => a.code.localeCompare(b.code))

  const outPath = fileURLToPath(new URL('../src/data/twStockList.json', import.meta.url))
  await writeFile(outPath, JSON.stringify(stocks, null, 2) + '\n', 'utf-8')
  console.log(`寫入 ${stocks.length} 筆股票資料到 ${outPath}`)
}

main()
