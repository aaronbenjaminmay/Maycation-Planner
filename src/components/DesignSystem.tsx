import {
  useEffect,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from 'react'
import {
  ArrowLeft,
  Calendar,
  Check,
  ChevronRight,
  CircleX,
  LogOut,
  Pencil,
  Plus,
  RefreshCw,
  Settings,
  Trash2,
  UserPlus,
  X,
  type LucideIcon,
} from 'lucide-react'

export type IconName =
  | 'add'
  | 'back'
  | 'calendar'
  | 'check'
  | 'chevron-right'
  | 'close'
  | 'delete'
  | 'edit'
  | 'refresh'
  | 'settings'
  | 'sign-out'
  | 'user-plus'
  | 'x-circle'

type IconProps = {
  name: IconName
  size?: 'default' | 'large' | 'small'
}

const iconMap: Record<IconName, LucideIcon> = {
  add: Plus,
  back: ArrowLeft,
  calendar: Calendar,
  check: Check,
  'chevron-right': ChevronRight,
  close: X,
  delete: Trash2,
  edit: Pencil,
  refresh: RefreshCw,
  settings: Settings,
  'sign-out': LogOut,
  'user-plus': UserPlus,
  'x-circle': CircleX,
}

const iconSizes = {
  default: 18,
  large: 20,
  small: 16,
}

export function Icon({ name, size = 'default' }: IconProps) {
  const LucideIconComponent = iconMap[name]

  return (
    <LucideIconComponent
      aria-hidden="true"
      className="system-icon"
      size={iconSizes[size]}
      strokeWidth={2.4}
    />
  )
}

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

type CardSurfaceProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
  className?: string
  interactive?: boolean
}

export function CardSurface({
  children,
  className = '',
  interactive = false,
  ...props
}: CardSurfaceProps) {
  return (
    <div
      className={`card-surface${interactive ? ' card-surface--interactive' : ''}${
        className ? ` ${className}` : ''
      }`}
      {...props}
    >
      {children}
    </div>
  )
}

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

  if (onClick) {
    return (
      <button
        type="button"
        className={`dashboard-card card-surface${className ? ` ${className}` : ''}`}
        onClick={onClick}
      >
        {body}
      </button>
    )
  }

  return (
    <CardSurface className={`dashboard-card${className ? ` ${className}` : ''}`}>
      {body}
    </CardSurface>
  )
}

type DayTileProps = {
  completedCount: number
  date?: string
  dayNumber: number
  itemCount: number
  onOpen: () => void
  previews?: ReactNode
  subtitle?: string
  title: string
}

export function DayTile({
  date,
  onOpen,
  subtitle,
  title,
}: DayTileProps) {
  return (
    <button type="button" className="day-tile card-surface" onClick={onOpen}>
      <div className="day-tile__content">
        <span className="day-tile__icon" aria-hidden="true">
          <Icon name="calendar" size="large" />
        </span>
        <div>
          <h2>{date ?? title}</h2>
          {subtitle ? <p className="muted day-tile__summary">{subtitle}</p> : null}
        </div>
      </div>
    </button>
  )
}

type DetailHeaderProps = {
  action?: ReactNode
  eyebrow: string
  meta?: ReactNode
  onBack: () => void
  title: string
}

export function DetailHeader({
  action,
  eyebrow,
  meta,
  onBack,
  title,
}: DetailHeaderProps) {
  return (
    <header className="detail-header">
      <ActionBar
        backLabel="Back"
        onBack={onBack}
      />
      <ScreenHeader eyebrow={eyebrow} title={title} meta={meta} actions={action} />
    </header>
  )
}

type ModalSheetProps = {
  ariaLabel: string
  children: ReactNode
  eyebrow?: string
  onClose: () => void
  title: string
}

export function ModalSheet({
  ariaLabel,
  children,
  eyebrow,
  onClose,
  title,
}: ModalSheetProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div className="modal-backdrop" role="presentation">
      <section
        className="modal-sheet"
        aria-label={ariaLabel}
        aria-modal="true"
        role="dialog"
      >
        <div className="modal-sheet__header">
          <div>
            {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
            <h2>{title}</h2>
          </div>
          <IconButton icon="close" label="Close" onClick={onClose} />
        </div>
        {children}
      </section>
    </div>
  )
}

type StatusButtonProps = {
  disabled?: boolean
  isComplete: boolean
  label: string
  onToggle?: () => void
  readOnly?: boolean
}

export function StatusButton({
  disabled = false,
  isComplete,
  label,
  onToggle,
  readOnly = false,
}: StatusButtonProps) {
  return (
    <IconButton
      disabled={disabled || readOnly}
      icon="check"
      label={isComplete ? `Mark ${label} active` : `Mark ${label} complete`}
      onClick={onToggle}
      selected={isComplete}
      variant="complete"
    />
  )
}

type EmptyStateProps = {
  action?: ReactNode
  children?: ReactNode
  title: string
}

export function EmptyState({ action, children, title }: EmptyStateProps) {
  return (
    <CardSurface className="empty-state">
      <h2>{title}</h2>
      {children ? <div className="empty-state__body">{children}</div> : null}
      {action}
    </CardSurface>
  )
}

type ActionBarProps = {
  backLabel?: string
  onBack?: () => void
  title?: string
  trailing?: ReactNode
}

export function ActionBar({
  backLabel = 'Back',
  onBack,
  title,
  trailing,
}: ActionBarProps) {
  return (
    <div className="action-bar">
      {onBack ? (
        <IconButton icon="back" label={backLabel} onClick={onBack} />
      ) : null}
      {title ? <span className="action-bar__title">{title}</span> : null}
      {trailing ? <div className="action-bar__trailing">{trailing}</div> : null}
    </div>
  )
}
