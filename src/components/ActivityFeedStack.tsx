'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, useInView } from 'framer-motion';
import { activityFeed } from '@/data/mockData';
import ActivityFeedCard, { NOTIF_CARD_H, NOTIF_PEEK } from './ActivityFeedCard';

const VISIBLE_COUNT = 3;
const CYCLE_MS = 2800;

type StackEntry = {
  instanceId: number;
  feedIndex: number;
};

let instanceCounter = 0;

function createInitialStack(): StackEntry[] {
  return Array.from({ length: VISIBLE_COUNT }, (_, position) => ({
    instanceId: instanceCounter++,
    feedIndex:
      (activityFeed.length - 1 - position + activityFeed.length) %
      activityFeed.length,
  }));
}

const stackHeight = NOTIF_CARD_H + NOTIF_PEEK * (VISIBLE_COUNT - 1);

export default function ActivityFeedStack() {
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { amount: 0.4 });
  const [stack, setStack] = useState<StackEntry[]>(createInitialStack);
  const [newInstanceId, setNewInstanceId] = useState<number | null>(null);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduceMotion(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const advance = useCallback(() => {
    setStack((prev) => {
      const nextFeedIndex = (prev[0].feedIndex + 1) % activityFeed.length;
      const entry: StackEntry = {
        instanceId: instanceCounter++,
        feedIndex: nextFeedIndex,
      };
      setNewInstanceId(entry.instanceId);
      return [entry, ...prev].slice(0, VISIBLE_COUNT);
    });
  }, []);

  useEffect(() => {
    if (newInstanceId !== null) {
      const timer = window.setTimeout(() => setNewInstanceId(null), 500);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [newInstanceId]);

  useEffect(() => {
    if (!inView || reduceMotion) return undefined;
    const timer = window.setInterval(advance, CYCLE_MS);
    return () => window.clearInterval(timer);
  }, [inView, reduceMotion, advance]);

  return (
    <div ref={containerRef} className="relative mx-auto w-full max-w-sm">
      <div className="relative" style={{ height: stackHeight }}>
        <AnimatePresence mode="sync" initial={false}>
          {[...stack].reverse().map((entry, reverseIndex) => {
            const stackPosition = stack.length - 1 - reverseIndex;
            const item = activityFeed[entry.feedIndex];
            return (
              <ActivityFeedCard
                key={entry.instanceId}
                item={item}
                stackPosition={stackPosition}
                isNew={entry.instanceId === newInstanceId}
              />
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
