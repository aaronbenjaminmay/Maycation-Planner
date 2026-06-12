import { type ReactNode } from 'react'

type FeedbackTone = 'neutral' | 'error' | 'success'

type FeedbackMessageProps = {
  children: ReactNode
  tone?: FeedbackTone
}

export function FeedbackMessage({ children, tone = 'neutral' }: FeedbackMessageProps) {
  const modifier = tone !== 'neutral' ? ` feedback--${tone}` : ''
  return (
    <p className={`feedback${modifier}`}>
      {children}
    </p>
  )
}
