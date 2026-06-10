import { type ReactNode } from 'react'

type ScreenHeaderProps = {
  actions?: ReactNode
  eyebrow: string
  meta?: ReactNode
  title: string
}

export function ScreenHeader({
  actions,
  eyebrow,
  meta,
  title,
}: ScreenHeaderProps) {
  return (
    <header className="screen-header">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        {meta ? <div className="screen-header__meta">{meta}</div> : null}
      </div>
      {actions ? <div className="screen-header__actions">{actions}</div> : null}
    </header>
  )
}
