'use client';

import { motion } from 'framer-motion';
import type { ActivityFeedItem } from '@/data/mockData';
import { ActivityIcon } from '@/lib/icons';
import { cn } from '@/lib/utils';

/** iOS-style stack: each layer peeks below the one above */
export const NOTIF_CARD_H = 72;
export const NOTIF_PEEK = 11;

const avatarColors = [
  'bg-sky-500',
  'bg-violet-500',
  'bg-teal-500',
  'bg-orange-500',
  'bg-emerald-500',
  'bg-indigo-500',
];

function avatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
  return avatarColors[hash % avatarColors.length];
}

function stackTransform(position: number) {
  return {
    y: position * NOTIF_PEEK,
    scale: 1 - position * 0.025,
    opacity: position === 0 ? 1 : 0.92 - position * 0.08,
  };
}

interface ActivityFeedCardProps {
  item: ActivityFeedItem;
  stackPosition: number;
  isNew: boolean;
}

export default function ActivityFeedCard({
  item,
  stackPosition,
  isNew,
}: ActivityFeedCardProps) {
  const isFront = stackPosition === 0;
  const target = stackTransform(stackPosition);
  const initial = isNew
    ? { opacity: 0, y: -(NOTIF_CARD_H + 8), scale: 1 }
    : target;

  return (
    <motion.div
      initial={initial}
      animate={target}
      exit={{
        opacity: 0,
        scale: 0.96,
        transition: { duration: 0.15 },
      }}
      transition={{
        duration: isNew ? 0.38 : 0.26,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={cn(
        'absolute inset-x-0 top-0 overflow-hidden rounded-2xl bg-white',
        'border border-black/[0.06] shadow-[0_8px_30px_rgba(0,0,0,0.12)]',
        isFront && 'shadow-[0_12px_40px_rgba(0,0,0,0.15)]'
      )}
      style={{
        zIndex: 40 - stackPosition,
        height: NOTIF_CARD_H,
        transformOrigin: 'top center',
      }}
    >
      {isNew && (
        <span className="absolute right-3.5 top-3.5 h-2 w-2 rounded-full bg-tof-teal ring-2 ring-white" />
      )}

      <div className="flex h-full items-center gap-3 px-3.5">
        <div className="relative shrink-0">
          <span
            className={cn(
              'flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold text-white',
              avatarColor(item.user)
            )}
          >
            {item.user.charAt(0)}
          </span>
          <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-gray-100">
            <ActivityIcon name={item.icon} className="text-tof-navy" size={11} />
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[13px] leading-snug text-gray-900 md:text-sm">
            <span className="font-semibold">{item.user}</span>{' '}
            <span className="text-gray-600">{item.action}</span>
          </p>
          <time className="mt-0.5 block text-xs text-gray-400">{item.timestamp}</time>
        </div>
      </div>
    </motion.div>
  );
}
