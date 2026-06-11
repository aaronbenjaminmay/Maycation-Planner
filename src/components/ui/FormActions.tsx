import { type ReactNode } from 'react'
import './forms.css'

type FormActionsProps = {
  leading?: ReactNode
  children: ReactNode
}

export function FormActions({ leading, children }: FormActionsProps) {
  if (leading != null) {
    return (
      <div className="form-actions form-actions--has-leading">
        <div className="form-actions__leading">{leading}</div>
        <div className="form-actions__main">{children}</div>
      </div>
    )
  }

  return <div className="form-actions">{children}</div>
}
