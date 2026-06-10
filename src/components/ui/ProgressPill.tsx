import { type ReactNode } from 'react'

type ProgressPillProps = {
  children: ReactNode
  tone?: 'default' | 'complete' | 'attention'
}

export function ProgressPill({
  children,
  tone = 'default',
}: ProgressPillProps) {
  return <span className={`progress-pill progress-pill--${tone}`}>{children}</span>
}
