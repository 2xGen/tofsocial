import { cn } from '@/lib/utils';

const AVATAR_COLORS = [
  'bg-sky-500',
  'bg-violet-500',
  'bg-teal-500',
  'bg-orange-500',
  'bg-emerald-500',
  'bg-indigo-500',
  'bg-rose-500',
];

export function avatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

interface PlayerAvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  sm: 'h-9 w-9 text-xs',
  md: 'h-11 w-11 text-sm',
  lg: 'h-14 w-14 text-base',
};

export default function PlayerAvatar({ name, size = 'md', className }: PlayerAvatarProps) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-bold text-white',
        avatarColor(name),
        sizes[size],
        className
      )}
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );
}
