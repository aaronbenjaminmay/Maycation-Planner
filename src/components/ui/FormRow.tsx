import { type ReactNode } from 'react'
import './forms.css'

type FormRowProps = {
  label: string
  hint?: string
  children: ReactNode
}

export function FormRow({ label, hint, children }: FormRowProps) {
  return (
    <label className="form-row">
      <span className="form-row__label">{label}</span>
      {children}
      {hint ? <span className="form-row__hint">{hint}</span> : null}
    </label>
  )
}
