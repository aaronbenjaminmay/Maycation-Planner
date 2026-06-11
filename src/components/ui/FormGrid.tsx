import { type ReactNode } from 'react'

type FormGridProps = {
  children: ReactNode
}

export function FormGrid({ children }: FormGridProps) {
  return <div className="form-grid">{children}</div>
}
