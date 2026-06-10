import { type ReactNode } from 'react'
import { CardSurface } from './CardSurface'

type EmptyStateProps = {
  action?: ReactNode
  children?: ReactNode
  title: string
}

export function EmptyState({ action, children, title }: EmptyStateProps) {
  return (
    <CardSurface className="empty-state">
      <h2>{title}</h2>
      {children ? <div className="empty-state__body">{children}</div> : null}
      {action}
    </CardSurface>
  )
}
