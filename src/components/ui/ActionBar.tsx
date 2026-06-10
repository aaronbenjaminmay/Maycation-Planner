import { type ReactNode } from 'react'
import { IconButton } from './IconButton'

type ActionBarProps = {
  backLabel?: string
  onBack?: () => void
  title?: string
  trailing?: ReactNode
}

export function ActionBar({
  backLabel = 'Back',
  onBack,
  title,
  trailing,
}: ActionBarProps) {
  return (
    <div className="action-bar">
      {onBack ? (
        <IconButton icon="back" label={backLabel} onClick={onBack} />
      ) : null}
      {title ? <span className="action-bar__title">{title}</span> : null}
      {trailing ? <div className="action-bar__trailing">{trailing}</div> : null}
    </div>
  )
}
