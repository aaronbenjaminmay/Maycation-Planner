import { type ReactNode } from 'react'

type PageControlsProps = {
  leading: ReactNode
  trailing?: ReactNode
}

export function PageControls({ leading, trailing }: PageControlsProps) {
  return (
    <div className="page-controls">
      <div className="page-controls__inner">
        <div className="page-controls__slot">{leading}</div>
        {trailing != null ? (
          <div className="page-controls__slot">{trailing}</div>
        ) : null}
      </div>
    </div>
  )
}
