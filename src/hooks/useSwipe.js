import { useRef } from 'react'

// 水平滑動偵測（主要給手機切換分頁用）。只在 touchend 判斷，不攔截捲動：
// - 水平位移要夠大，而且要明顯大於垂直位移（否則視為在上下捲動）
// - 起點若落在可水平捲動的區塊（熱力圖、表格）或彈窗內，就不觸發
const MIN_DISTANCE = 55
const DOMINANCE = 1.3 // |dx| 至少要是 |dy| 的這麼多倍
const MAX_DURATION = 700 // ms，太慢的拖曳不算滑動

function startedInScrollableOrModal(target, boundary) {
  let node = target
  while (node && node !== boundary) {
    if (node.classList?.contains('modal-overlay')) return true
    if (node.scrollWidth > node.clientWidth + 2) {
      const overflowX = getComputedStyle(node).overflowX
      if (overflowX === 'auto' || overflowX === 'scroll') return true
    }
    node = node.parentElement
  }
  return false
}

export function useSwipe({ onSwipeLeft, onSwipeRight } = {}) {
  const start = useRef(null)

  function onTouchStart(e) {
    if (e.touches.length !== 1 || startedInScrollableOrModal(e.target, e.currentTarget)) {
      start.current = null
      return
    }
    const t = e.touches[0]
    start.current = { x: t.clientX, y: t.clientY, at: Date.now() }
  }

  function onTouchMove(e) {
    if (start.current && e.touches.length !== 1) start.current = null
  }

  function onTouchEnd(e) {
    const s = start.current
    start.current = null
    if (!s) return

    const t = e.changedTouches[0]
    const dx = t.clientX - s.x
    const dy = t.clientY - s.y
    if (
      Date.now() - s.at > MAX_DURATION ||
      Math.abs(dx) < MIN_DISTANCE ||
      Math.abs(dx) < Math.abs(dy) * DOMINANCE
    ) {
      return
    }

    if (dx < 0) onSwipeLeft?.()
    else onSwipeRight?.()
  }

  return { onTouchStart, onTouchMove, onTouchEnd }
}
