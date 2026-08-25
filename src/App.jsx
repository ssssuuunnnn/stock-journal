import { useEffect, useMemo, useState } from 'react'
import { useLocalStorage } from './hooks/useLocalStorage'
import { createId } from './lib/id'
import About from './components/About'
import AboutAuthor from './components/AboutAuthor'
import GoalForm from './components/GoalForm'
import GoalList from './components/GoalList'
import NoteDetail from './components/NoteDetail'
import NoteForm from './components/NoteForm'
import NoteList from './components/NoteList'
import Overview from './components/Overview'
import RecordForm from './components/RecordForm'
import RecordTable from './components/RecordTable'
import './App.css'

const TABS = [
  { key: 'overview', label: '存股總覽' },
  { key: 'goals', label: '存股目標' },
  { key: 'records', label: '買入紀錄' },
  { key: 'notes', label: '心得紀錄' },
]
// 路由（網址路徑）：goals / records / overview / notes 幾個分頁，goals、records、notes 各自再加獨立的「新增」頁面
const VIEW_PATHS = {
  goals: '',
  'goals-new': 'goals/new',
  'goals-edit': 'goals/edit',
  records: 'records',
  'records-new': 'records/new',
  notes: 'notes',
  'notes-new': 'notes/new',
  'notes-edit': 'notes/edit',
  'notes-detail': 'notes/detail',
  overview: 'overview',
  about: 'about',
  author: 'author',
}
const DEFAULT_VIEW = 'goals'
// import.meta.env.BASE_URL 是 vite.config.js 設的 '/stock-daily/'，本機開發與 GitHub Pages 都要用它當路徑前綴
const BASE_PATH = import.meta.env.BASE_URL.replace(/\/$/, '')

function viewFromPath(pathname) {
  const rel = pathname.startsWith(BASE_PATH) ? pathname.slice(BASE_PATH.length) : pathname
  const segment = rel.replace(/^\/|\/$/g, '')
  const match = Object.entries(VIEW_PATHS).find(([, path]) => path === segment)
  return match ? match[0] : DEFAULT_VIEW
}

function pathForView(view) {
  return `${BASE_PATH}/${VIEW_PATHS[view]}`
}

// GA 的 gtag('config', ...) 只會在頁面第一次載入時記一次 pageview；
// 這裡切換分頁走的是 pushState（不會重新整理頁面），要手動補送 page_view 事件，
// 不然 GA 只會看到每個 session 一次瀏覽，量不到分頁之間的切換。
function trackPageview(pathname) {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'page_view', {
      page_path: pathname,
      page_title: document.title,
      page_location: window.location.href,
    })
  }
}

export default function App() {
  const [goals, setGoals] = useLocalStorage('stock-daily:goals', [])
  const [records, setRecords] = useLocalStorage('stock-daily:records', [])
  const [notes, setNotes] = useLocalStorage('stock-daily:notes', [])
  const [view, setView] = useState(() => viewFromPath(window.location.pathname))
  const [editingGoal, setEditingGoal] = useState(null)
  const [editingNote, setEditingNote] = useState(null)
  const [viewingNote, setViewingNote] = useState(null)
  // 直接連到 /goals/edit、/notes/edit、/notes/detail（例如重新整理）時沒有對應的資料可用，畫面上視同回到列表頁。
  const effectiveView =
    (view === 'goals-edit' && !editingGoal) ||
    (view === 'notes-edit' && !editingNote) ||
    (view === 'notes-detail' && !viewingNote)
      ? view.startsWith('notes') ? 'notes' : 'goals'
      : view
  const tab = effectiveView.startsWith('records')
    ? 'records'
    : effectiveView.startsWith('goals')
      ? 'goals'
      : effectiveView.startsWith('notes')
        ? 'notes'
        : effectiveView === 'overview'
          ? 'overview'
          : null

  useEffect(() => {
    function onPopState() {
      setView(viewFromPath(window.location.pathname))
      trackPageview(window.location.pathname)
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  useEffect(() => {
    if (view === 'goals-edit' && !editingGoal) {
      window.history.replaceState({}, '', pathForView('goals'))
    } else if ((view === 'notes-edit' && !editingNote) || (view === 'notes-detail' && !viewingNote)) {
      window.history.replaceState({}, '', pathForView('notes'))
    }
  }, [view, editingGoal, editingNote, viewingNote])

  function goTo(nextView) {
    if (nextView !== view) {
      const path = pathForView(nextView)
      window.history.pushState({}, '', path)
      setView(nextView)
      trackPageview(path)
    }
  }

  const holdingsByStock = useMemo(() => {
    return records.reduce((acc, r) => {
      acc[r.stockCode] = (acc[r.stockCode] || 0) + r.shares
      return acc
    }, {})
  }, [records])

  function addGoal(goal) {
    setGoals((prev) => [...prev, { id: createId(), createdAt: Date.now(), ...goal }])
  }

  function updateGoal(id, updates) {
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...updates } : g)))
  }

  function deleteGoal(id) {
    setGoals((prev) => prev.filter((g) => g.id !== id))
  }

  function addRecord(record) {
    setRecords((prev) => [...prev, { id: createId(), createdAt: Date.now(), ...record }])
  }

  function deleteRecord(id) {
    setRecords((prev) => prev.filter((r) => r.id !== id))
  }

  function addNote(note) {
    setNotes((prev) => [...prev, { id: createId(), createdAt: Date.now(), ...note }])
  }

  function updateNote(id, updates) {
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, ...updates } : n)))
  }

  function deleteNote(id) {
    setNotes((prev) => prev.filter((n) => n.id !== id))
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>存股日記</h1>
        <p className="muted">記錄每一次存股，追蹤目標達成進度</p>
      </header>
      <div className="masthead-rule" />
      <div className="dateline">
        <span>台北 · {new Date().toLocaleDateString('zh-TW')}</span>
        <span>資料存於本機瀏覽器</span>
      </div>
      <div className="masthead-rule-thin" />

      <nav className="tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={t.key === tab ? 'tab active' : 'tab'}
            onClick={() => goTo(t.key)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main>
        {effectiveView === 'goals' && (
          <>
            <GoalList
              goals={goals}
              holdingsByStock={holdingsByStock}
              onEdit={(goal) => {
                setEditingGoal(goal)
                goTo('goals-edit')
              }}
              onDelete={deleteGoal}
            />
            <div className="list-actions">
              <button type="button" className="btn-add" onClick={() => goTo('goals-new')}>
                + 新增存股目標
              </button>
            </div>
          </>
        )}
        {view === 'goals-new' && (
          <GoalForm
            existingGoals={goals}
            onSubmit={(goal) => {
              addGoal(goal)
              goTo('goals')
            }}
            onEditExisting={(existingGoal) => {
              setEditingGoal(existingGoal)
              goTo('goals-edit')
            }}
            onCancel={() => goTo('goals')}
          />
        )}
        {view === 'goals-edit' && editingGoal && (
          <GoalForm
            goal={editingGoal}
            onSubmit={(updates) => {
              updateGoal(editingGoal.id, updates)
              setEditingGoal(null)
              goTo('goals')
            }}
            onCancel={() => {
              setEditingGoal(null)
              goTo('goals')
            }}
          />
        )}
        {view === 'records' && (
          <>
            <RecordTable records={records} onDelete={deleteRecord} />
            <div className="list-actions">
              <button type="button" className="btn-add" onClick={() => goTo('records-new')}>
                + 新增買入紀錄
              </button>
            </div>
          </>
        )}
        {view === 'records-new' && (
          <RecordForm
            onAdd={(record) => {
              addRecord(record)
              goTo('records')
            }}
            onCancel={() => goTo('records')}
          />
        )}
        {effectiveView === 'notes' && (
          <>
            <NoteList
              notes={notes}
              goals={goals}
              records={records}
              onView={(note) => {
                setViewingNote(note)
                goTo('notes-detail')
              }}
              onEdit={(note) => {
                setEditingNote(note)
                goTo('notes-edit')
              }}
              onDelete={deleteNote}
            />
            <div className="list-actions">
              <button type="button" className="btn-add" onClick={() => goTo('notes-new')}>
                + 新增心得紀錄
              </button>
            </div>
          </>
        )}
        {view === 'notes-new' && (
          <NoteForm
            goals={goals}
            records={records}
            onSubmit={(note) => {
              addNote(note)
              goTo('notes')
            }}
            onCancel={() => goTo('notes')}
          />
        )}
        {view === 'notes-edit' && editingNote && (
          <NoteForm
            note={editingNote}
            goals={goals}
            records={records}
            onSubmit={(updates) => {
              updateNote(editingNote.id, updates)
              setEditingNote(null)
              goTo('notes')
            }}
            onCancel={() => {
              setEditingNote(null)
              goTo('notes')
            }}
          />
        )}
        {view === 'notes-detail' && viewingNote && (
          <NoteDetail
            note={viewingNote}
            goals={goals}
            records={records}
            onEdit={(note) => {
              setViewingNote(null)
              setEditingNote(note)
              goTo('notes-edit')
            }}
            onDelete={(id) => {
              deleteNote(id)
              setViewingNote(null)
              goTo('notes')
            }}
            onBack={() => {
              setViewingNote(null)
              goTo('notes')
            }}
          />
        )}
        {view === 'overview' && (
          <Overview goals={goals} records={records} holdingsByStock={holdingsByStock} />
        )}
        {view === 'about' && <About onBack={() => goTo('goals')} />}
        {view === 'author' && <AboutAuthor onBack={() => goTo('goals')} />}
      </main>

      <footer className="app-footer muted">
        資料僅儲存在此瀏覽器（localStorage），不會上傳到任何伺服器。
        {' · '}
        <button type="button" className="footer-link" onClick={() => goTo('about')}>
          關於本站
        </button>
        {' · '}
        <button type="button" className="footer-link" onClick={() => goTo('author')}>
          關於作者
        </button>
      </footer>
    </div>
  )
}
