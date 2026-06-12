import { type ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'secondary'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
}

export function Button({
  variant = 'primary',
  className,
  ...props
}: ButtonProps) {
  const cls = `button button--${variant}${className ? ` ${className}` : ''}`
  return <button className={cls} {...props} />
}
