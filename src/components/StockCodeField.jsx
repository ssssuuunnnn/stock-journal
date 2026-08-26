import { useState } from 'react'
import stockList from '../data/twStockList.json'

const MAX_SUGGESTIONS = 8

function findSuggestions(code) {
  const query = code.trim().toUpperCase()
  if (!query) return []
  return stockList.filter((s) => s.code.startsWith(query)).slice(0, MAX_SUGGESTIONS)
}

export default function StockCodeField({ code, name, onCodeChange, onNameChange }) {
  const [suggestions, setSuggestions] = useState([])
  const [highlight, setHighlight] = useState(0)

  function selectStock(stock) {
    onCodeChange(stock.code)
    onNameChange(stock.name)
    setSuggestions([])
  }

  function handleCodeChange(value) {
    onCodeChange(value)
    setSuggestions(findSuggestions(value))
    setHighlight(0)
  }

  function handleKeyDown(e) {
    if (suggestions.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlight((h) => (h + 1) % suggestions.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlight((h) => (h - 1 + suggestions.length) % suggestions.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      selectStock(suggestions[highlight])
    } else if (e.key === 'Escape') {
      setSuggestions([])
    }
  }

  return (
    <div className="form-row">
      <label className="stock-code-field">
        股票代號 *
        <input
          value={code}
          onChange={(e) => handleCodeChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => setSuggestions([])}
          placeholder="例如 0050"
          autoComplete="off"
          required
        />
        {suggestions.length > 0 && (
          <ul className="stock-code-suggestions">
            {suggestions.map((s, i) => (
              <li key={s.code}>
                <button
                  type="button"
                  className={i === highlight ? 'active' : undefined}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    selectStock(s)
                  }}
                  onMouseEnter={() => setHighlight(i)}
                >
                  <span className="stock-code-suggestion-code">{s.code}</span>
                  <span className="stock-code-suggestion-name">{s.name}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </label>
      <label>
        股票名稱
        <input
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="例如 元大台灣50"
        />
      </label>
    </div>
  )
}
