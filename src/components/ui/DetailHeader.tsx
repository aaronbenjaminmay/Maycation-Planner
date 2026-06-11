import { type ReactNode } from 'react'
import { ActionBar } from './ActionBar'
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
      <ActionBar backLabel="Back" onBack={onBack} />
      <ScreenHeader eyebrow={eyebrow} title={title} meta={meta} actions={action} />
    </header>
  )
}
