import { IconButton } from './IconButton'

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
