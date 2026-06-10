import { type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from 'react'

type CardSurfaceDivProps = {
  as?: 'div'
  children: ReactNode
  className?: string
  interactive?: boolean
} & Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'className'>

type CardSurfaceButtonProps = {
  as: 'button'
  children: ReactNode
  className?: string
  interactive?: boolean
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'className'>

type CardSurfaceProps = CardSurfaceDivProps | CardSurfaceButtonProps

export function CardSurface(props: CardSurfaceProps) {
  if (props.as === 'button') {
    const { as: _as, children, className = '', interactive: _interactive, ...buttonProps } = props
    return (
      <button
        type="button"
        className={`card-surface card-surface--interactive${className ? ` ${className}` : ''}`}
        {...buttonProps}
      >
        {children}
      </button>
    )
  }

  const { as: _as, children, className = '', interactive = false, ...divProps } = props
  return (
    <div
      className={`card-surface${interactive ? ' card-surface--interactive' : ''}${className ? ` ${className}` : ''}`}
      {...divProps}
    >
      {children}
    </div>
  )
}
