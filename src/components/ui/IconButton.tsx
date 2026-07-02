import { type ButtonHTMLAttributes } from 'react'
import { Icon, type IconName } from './Icon'
import './icon-button.css'

type IconButtonVariant = 'complete' | 'default' | 'destructive' | 'primary'

type IconButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'aria-label' | 'children' | 'className' | 'title'
> & {
  icon: IconName
  label: string
  selected?: boolean
  variant?: IconButtonVariant
}

export function IconButton({
  icon,
  label,
  selected = false,
  type = 'button',
  variant = 'default',
  ...props
}: IconButtonProps) {
  const className = `icon-button icon-button--${variant}${
    selected ? ' icon-button--selected' : ''
  }`
  const iconSize = variant === 'primary' || selected ? 'large' : 'default'

  return (
    <button
      type={type}
      className={className}
      aria-label={label}
      aria-pressed={variant === 'complete' ? selected : undefined}
      title={label}
      {...props}
    >
      <Icon name={icon} size={iconSize} />
    </button>
  )
}
