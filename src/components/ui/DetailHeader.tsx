import { type ReactNode } from 'react'
import { IconButton } from './IconButton'
import { PageControls } from './PageControls'
import { ScreenHeader } from './ScreenHeader'

type DetailHeaderProps = {
  action?: ReactNode
  eyebrow?: string
  meta?: ReactNode
  onBack: () => void
  title: string
}

export function DetailHeader({
  action,
  eyebrow,
  meta,
  onBack,
  title,
}: DetailHeaderProps) {
  return (
    <header className="detail-header">
      <PageControls
        leading={<IconButton icon="back" label="Back" onClick={onBack} />}
        trailing={action}
      />
      <ScreenHeader eyebrow={eyebrow} title={title} meta={meta} />
    </header>
  )
}
