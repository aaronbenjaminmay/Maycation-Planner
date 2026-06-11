import { FormRow } from './FormRow'

export type SelectOption = { value: string; label: string }

type SelectInputProps = {
  label: string
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  disabled?: boolean
  hint?: string
}

export function SelectInput({
  label,
  value,
  onChange,
  options,
  disabled,
  hint,
}: SelectInputProps) {
  return (
    <FormRow label={label} hint={hint}>
      <select
        className="form-control"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </FormRow>
  )
}
