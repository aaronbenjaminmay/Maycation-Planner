import { type ReactNode } from 'react'
import { Badge, type BadgeTone } from './Badge'

type ProgressPillTone = 'default' | 'complete' | 'attention'

type ProgressPillProps = {
  children: ReactNode
  tone?: ProgressPillTone
}

const toneMap: Record<ProgressPillTone, BadgeTone> = {
  default: 'neutral',
  complete: 'accent',
  attention: 'warning',
}

export function ProgressPill({ children, tone = 'default' }: ProgressPillProps) {
  return <Badge tone={toneMap[tone]}>{children}</Badge>
}
