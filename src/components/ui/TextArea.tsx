import { FormRow } from './FormRow'

type TextAreaProps = {
  label: string
  value: string
  onChange: (value: string) => void
  rows?: number
  placeholder?: string
  disabled?: boolean
  hint?: string
}

export function TextArea({
  label,
  value,
  onChange,
  rows,
  placeholder,
  disabled,
  hint,
}: TextAreaProps) {
  return (
    <FormRow label={label} hint={hint}>
      <textarea
        className="form-control form-control--textarea"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        disabled={disabled}
      />
    </FormRow>
  )
}
