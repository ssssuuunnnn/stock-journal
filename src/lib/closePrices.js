// 最新一個交易日的台股收盤價快照，由 scripts/fetch-close-prices.mjs 產生、
// GitHub Actions 每個交易日收盤後更新。詳見 CLAUDE.md。
import data from '../data/twClosePrices.json'

export const closePriceDate = data.date // 例如 '2026-08-28'

// 找不到（未上市、代號有誤、當日暫停交易…）時回傳 null。
export function getClosePrice(stockCode) {
  if (!stockCode) return null
  return data.prices[stockCode.trim().toUpperCase()] ?? null
}
