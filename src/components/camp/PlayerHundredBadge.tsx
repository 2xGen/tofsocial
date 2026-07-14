import { cn } from '@/lib/utils';
import { getHundredBadgeStyle, getHundredBadgeTier } from '@/lib/camp-hundred-badge';

interface PlayerHundredBadgeProps {
  totalPoints: number;
  className?: string;
}

export default function PlayerHundredBadge({ totalPoints, className }: PlayerHundredBadgeProps) {
  const tier = getHundredBadgeTier(totalPoints);
  if (!tier) return null;

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded-md px-1.5 py-0.5 text-[10px] font-black leading-none',
        getHundredBadgeStyle(tier),
        className
      )}
      title={`${tier} punten — button halen bij begeleider`}
    >
      {tier}
    </span>
  );
}

interface PlayerNameWithBadgeProps {
  name: string;
  totalPoints: number;
  nameClassName?: string;
  className?: string;
}

export function PlayerNameWithBadge({
  name,
  totalPoints,
  nameClassName,
  className,
}: PlayerNameWithBadgeProps) {
  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <span className={nameClassName}>{name}</span>
      <PlayerHundredBadge totalPoints={totalPoints} />
    </span>
  );
}
