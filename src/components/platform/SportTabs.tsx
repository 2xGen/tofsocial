'use client';

import type { Sport } from '@/types';
import { cn } from '@/lib/utils';

export type SportFilter = 'all' | Sport;

interface SportTabsProps {
  value: SportFilter;
  onChange: (v: SportFilter) => void;
  counts: { all: number; tennis: number; padel: number };
}

const tabs: { id: SportFilter; label: string }[] = [
  { id: 'all', label: 'Alles' },
  { id: 'tennis', label: 'Tennis' },
  { id: 'padel', label: 'Padel' },
];

export default function SportTabs({ value, onChange, counts }: SportTabsProps) {
  return (
    <div className="flex gap-2 rounded-2xl bg-gray-100 p-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            'flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition-all',
            value === tab.id
              ? 'bg-white text-tof-navy shadow-sm'
              : 'text-gray-500 hover:text-tof-navy'
          )}
        >
          {tab.label}
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-[10px] font-black',
              value === tab.id ? 'bg-tof-teal/15 text-tof-navy' : 'bg-gray-200 text-gray-500'
            )}
          >
            {counts[tab.id]}
          </span>
        </button>
      ))}
    </div>
  );
}
