import { FormRow } from './FormRow'

type TextInputProps = {
  label: string
  type?: 'text' | 'email' | 'password' | 'date' | 'time'
  value: string
  onChange: (value: string) => void
  required?: boolean
  disabled?: boolean
  placeholder?: string
  autoComplete?: string
  minLength?: number
  hint?: string
}

export function TextInput({
  label,
  type = 'text',
  value,
  onChange,
  required,
  disabled,
  placeholder,
  autoComplete,
  minLength,
  hint,
}: TextInputProps) {
  return (
    <FormRow label={label} hint={hint}>
      <input
        className="form-control"
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        autoComplete={autoComplete}
        minLength={minLength}
      />
    </FormRow>
  )
}
