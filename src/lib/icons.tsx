import {
  Activity,
  Building2,
  Clock,
  Flame,
  Moon,
  Repeat,
  Rocket,
  Star,
  Target,
  Timer,
  TrendingUp,
  Trophy,
  UserPlus,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type IconName =
  | 'match'
  | 'time'
  | 'partners'
  | 'challenge'
  | 'streak'
  | 'activity'
  | 'repeat'
  | 'new'
  | 'trophy'
  | 'star'
  | 'users'
  | 'court'
  | 'trending'
  | 'inactive';

const iconMap: Record<IconName, LucideIcon> = {
  match: Target,
  time: Clock,
  partners: Users,
  challenge: Rocket,
  streak: Flame,
  activity: Timer,
  repeat: Repeat,
  new: UserPlus,
  trophy: Trophy,
  star: Star,
  users: Users,
  court: Building2,
  trending: TrendingUp,
  inactive: Moon,
};

interface ActivityIconProps {
  name: IconName;
  className?: string;
  size?: number;
}

export function ActivityIcon({ name, className, size = 20 }: ActivityIconProps) {
  const Icon = iconMap[name];
  return <Icon className={cn('shrink-0', className)} size={size} strokeWidth={2} aria-hidden />;
}

interface IconBadgeProps {
  name: IconName;
  variant?: 'default' | 'teal' | 'navy' | 'orange' | 'muted';
  size?: 'sm' | 'md' | 'lg';
}

const badgeVariants = {
  default: 'bg-gray-100 text-tof-navy',
  teal: 'bg-tof-teal/15 text-tof-teal',
  navy: 'bg-tof-navy/10 text-tof-navy',
  orange: 'bg-orange-100 text-orange-600',
  muted: 'bg-white/10 text-tof-teal',
};

const badgeSizes = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
};

const iconSizes = { sm: 16, md: 20, lg: 24 };

export function IconBadge({
  name,
  variant = 'default',
  size = 'md',
}: IconBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full',
        badgeVariants[variant],
        badgeSizes[size]
      )}
    >
      <ActivityIcon name={name} size={iconSizes[size]} />
    </span>
  );
}

export { Activity };
