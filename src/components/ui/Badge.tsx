import { type ReactNode } from 'react'
import './badge.css'

export type BadgeTone = 'neutral' | 'accent' | 'info' | 'secondary' | 'warning' | 'danger'

type BadgeProps = {
  children: ReactNode
  tone?: BadgeTone
}

export function Badge({ children, tone = 'neutral' }: BadgeProps) {
  return <span className={`badge badge--${tone}`}>{children}</span>
}
