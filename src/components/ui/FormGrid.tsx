import { type ReactNode } from 'react'
import './forms.css'

type FormGridProps = {
  children: ReactNode
}

export function FormGrid({ children }: FormGridProps) {
  return <div className="form-grid">{children}</div>
}
