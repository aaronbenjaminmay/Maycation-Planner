import {
  ArrowLeft,
  Calendar,
  Check,
  ChevronRight,
  CircleX,
  Image,
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
  | 'image'
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
  image: Image,
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
