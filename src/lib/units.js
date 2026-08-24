// 台股慣例：1 張 = 1000 股。內部一律以「股」為單位儲存，顯示時再轉換。
export const SHARES_PER_LOT = 1000

export function toShares(qty, unit) {
  const n = Number(qty) || 0
  return unit === 'lot' ? n * SHARES_PER_LOT : n
}

export function formatShares(shares) {
  const n = Number(shares) || 0
  const lots = Math.floor(n / SHARES_PER_LOT)
  const rest = n % SHARES_PER_LOT
  if (lots > 0 && rest > 0) return `${lots} 張 ${rest} 股（共 ${n} 股）`
  if (lots > 0) return `${lots} 張（共 ${n} 股）`
  return `${n} 股`
}

// 精簡版：用於單行列表（例如存股總覽的買入紀錄），不附加「（共 N 股）」
export function formatSharesShort(shares) {
  const n = Number(shares) || 0
  const lots = Math.floor(n / SHARES_PER_LOT)
  const rest = n % SHARES_PER_LOT
  if (lots > 0 && rest > 0) return `${lots} 張 ${rest} 股`
  if (lots > 0) return `${lots} 張`
  return `${n} 股`
}
