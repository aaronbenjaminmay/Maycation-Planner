import {
  ArrowLeft,
  Bed,
  Calendar,
  Check,
  ChevronRight,
  CircleX,
  Compass,
  Image,
  LogOut,
  Pencil,
  Plane,
  Plus,
  RefreshCw,
  Settings,
  Star,
  Ticket,
  Trash2,
  TreePalm,
  UserPlus,
  Utensils,
  X,
  type LucideIcon,
} from 'lucide-react'

export type IconName =
  | 'add'
  | 'back'
  | 'bed'
  | 'calendar'
  | 'check'
  | 'chevron-right'
  | 'close'
  | 'compass'
  | 'delete'
  | 'edit'
  | 'image'
  | 'plane'
  | 'refresh'
  | 'settings'
  | 'sign-out'
  | 'star'
  | 'ticket'
  | 'tree-palm'
  | 'user-plus'
  | 'utensils'
  | 'x-circle'

type IconProps = {
  name: IconName
  size?: 'default' | 'large' | 'small'
}

const iconMap: Record<IconName, LucideIcon> = {
  add: Plus,
  back: ArrowLeft,
  bed: Bed,
  calendar: Calendar,
  check: Check,
  'chevron-right': ChevronRight,
  close: X,
  compass: Compass,
  delete: Trash2,
  edit: Pencil,
  image: Image,
  plane: Plane,
  refresh: RefreshCw,
  settings: Settings,
  'sign-out': LogOut,
  star: Star,
  ticket: Ticket,
  'tree-palm': TreePalm,
  'user-plus': UserPlus,
  utensils: Utensils,
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
