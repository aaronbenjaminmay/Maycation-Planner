import { type ReactNode } from 'react'
import { CardSurface } from './CardSurface'

type DashboardCardProps = {
  children?: ReactNode
  className?: string
  eyebrow?: string
  meta?: ReactNode
  onClick?: () => void
  subtitle?: string
  title: string
}

export function DashboardCard({
  children,
  className = '',
  eyebrow,
  meta,
  onClick,
  subtitle,
  title,
}: DashboardCardProps) {
  const body = (
    <>
      {eyebrow ? <span className="label">{eyebrow}</span> : null}
      <strong>{title}</strong>
      {subtitle ? <span className="muted">{subtitle}</span> : null}
      {meta ? <div className="dashboard-card__meta">{meta}</div> : null}
      {children}
    </>
  )

  const cardClassName = `dashboard-card${className ? ` ${className}` : ''}`

  if (onClick) {
    return (
      <CardSurface as="button" className={cardClassName} onClick={onClick}>
        {body}
      </CardSurface>
    )
  }

  return (
    <CardSurface className={cardClassName}>
      {body}
    </CardSurface>
  )
}
