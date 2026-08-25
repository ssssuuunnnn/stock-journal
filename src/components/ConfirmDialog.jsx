import { useEffect } from 'react'

export default function ConfirmDialog({
  message,
  confirmLabel = '刪除',
  cancelLabel = '取消',
  confirmVariant = 'danger',
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onCancel])

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div
        className="modal"
        role="alertdialog"
        aria-modal="true"
        aria-describedby="confirm-dialog-message"
        onClick={(e) => e.stopPropagation()}
      >
        <p id="confirm-dialog-message">{message}</p>
        <div className="modal-actions">
          <button type="button" className="btn-ghost" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={confirmVariant === 'primary' ? 'btn-primary' : 'btn-danger'}
            onClick={onConfirm}
            autoFocus
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
