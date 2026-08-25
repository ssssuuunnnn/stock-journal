import { useState } from 'react'
import { formatDateTime } from '../lib/datetime'
import { resolveNoteLink } from '../lib/noteLink'
import ConfirmDialog from './ConfirmDialog'
import FeelingBadges from './FeelingBadges'

const PREVIEW_LENGTH = 60

function preview(content) {
  if (content.length <= PREVIEW_LENGTH) return content
  return `${content.slice(0, PREVIEW_LENGTH)}…`
}

export default function NoteList({ notes, goals, records, onView, onEdit, onDelete }) {
  const [pendingDelete, setPendingDelete] = useState(null)

  if (notes.length === 0) {
    return <p className="empty-hint">還沒有任何心得紀錄，按下面的按鈕寫下第一篇吧。</p>
  }

  const sorted = [...notes].sort((a, b) => b.createdAt - a.createdAt)

  return (
    <>
      <div className="note-list">
        {sorted.map((note) => {
          const link = resolveNoteLink(note, { goals, records })
          return (
            <div className={note.isMilestone ? 'card note-card note-card--milestone' : 'card note-card'} key={note.id}>
              <div className="note-card-header">
                <div className="note-header-left">
                  <span className="note-time muted">{formatDateTime(note.createdAt)}</span>
                  {note.isMilestone && <span className="milestone-badge">里程碑</span>}
                </div>
                <div className="note-card-actions">
                  <button className="link-btn link-btn-muted" onClick={() => onEdit(note)}>
                    修改
                  </button>
                  <button className="link-btn" onClick={() => setPendingDelete(note)}>
                    刪除
                  </button>
                </div>
              </div>
              <button type="button" className="note-content" onClick={() => onView(note)}>
                {preview(note.content)}
              </button>
              <FeelingBadges feelings={note.feelings} />
              {link && (
                <p className={link.missing ? 'note-link muted note-link-missing' : 'note-link muted'}>
                  {link.label}
                </p>
              )}
            </div>
          )
        })}
      </div>
      {pendingDelete && (
        <ConfirmDialog
          message="確定要刪除這篇心得紀錄嗎？"
          onConfirm={() => {
            onDelete(pendingDelete.id)
            setPendingDelete(null)
          }}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </>
  )
}
