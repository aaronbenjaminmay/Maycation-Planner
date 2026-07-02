import { useEffect, type ReactNode } from 'react'
import { IconButton } from './IconButton'
import './modal-sheet.css'

type ModalSheetProps = {
  ariaLabel: string
  children: ReactNode
  eyebrow?: string
  onClose: () => void
  title: string
}

export function ModalSheet({
  ariaLabel,
  children,
  eyebrow,
  onClose,
  title,
}: ModalSheetProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div className="modal-backdrop" role="presentation">
      <section
        className="modal-sheet"
        aria-label={ariaLabel}
        aria-modal="true"
        role="dialog"
      >
        <div className="modal-sheet__header">
          <div>
            {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
            <h2>{title}</h2>
          </div>
          <IconButton icon="close" label="Close" onClick={onClose} />
        </div>
        {children}
      </section>
    </div>
  )
}
