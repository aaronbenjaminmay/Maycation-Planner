import { type ReactNode } from 'react'

type FeedbackTone = 'neutral' | 'error'

type FeedbackMessageProps = {
  children: ReactNode
  tone?: FeedbackTone
}

export function FeedbackMessage({ children, tone = 'neutral' }: FeedbackMessageProps) {
  return (
    <p className={`feedback${tone === 'error' ? ' feedback--error' : ''}`}>
      {children}
    </p>
  )
}
