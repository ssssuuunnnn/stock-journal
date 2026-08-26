import { useState } from 'react'
import { formatDateTime } from '../lib/datetime'
import { resolveNoteLink } from '../lib/noteLink'
import ConfirmDialog from './ConfirmDialog'
import FeelingBadges from './FeelingBadges'

export default function NoteDetail({ note, goals, records, onEdit, onDelete, onBack }) {
  const [pendingDelete, setPendingDelete] = useState(false)
  const link = resolveNoteLink(note, { goals, records })

  return (
    <div className="card note-detail">
      <button type="button" className="link-back" onClick={onBack}>
        ← 返回心得筆記
      </button>
      <div className="note-detail-header">
        <div className="note-header-left">
          <span className="note-time muted">{formatDateTime(note.createdAt)}</span>
          {note.isMilestone && <span className="milestone-badge">里程碑</span>}
        </div>
        <div className="note-card-actions">
          <button className="link-btn link-btn-muted" onClick={() => onEdit(note)}>
            修改
          </button>
          <button className="link-btn" onClick={() => setPendingDelete(true)}>
            刪除
          </button>
        </div>
      </div>
      <p className="note-detail-content">{note.content}</p>
      <FeelingBadges feelings={note.feelings} />
      {link && (
        <p className={link.missing ? 'note-link muted note-link-missing' : 'note-link muted'}>{link.label}</p>
      )}
      {pendingDelete && (
        <ConfirmDialog
          message="確定要刪除這篇心得筆記嗎？"
          onConfirm={() => {
            onDelete(note.id)
            setPendingDelete(false)
          }}
          onCancel={() => setPendingDelete(false)}
        />
      )}
    </div>
  )
}
