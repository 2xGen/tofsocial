'use client';

import type { PlayerSportFocus, Sport } from '@/types';
import { cn } from '@/lib/utils';

const FOCUS_OPTIONS: { id: PlayerSportFocus; label: string; hint: string }[] = [
  { id: 'tennis', label: 'Alleen tennis', hint: 'Ik speel tennis op de club' },
  { id: 'padel', label: 'Alleen padel', hint: 'Ik speel padel op de club' },
  { id: 'beide', label: 'Tennis en padel', hint: 'Ik speel beide — of wissel af' },
];

interface SportFocusSelectorProps {
  value: PlayerSportFocus;
  onChange: (value: PlayerSportFocus) => void;
  compact?: boolean;
}

export function SportFocusSelector({ value, onChange, compact }: SportFocusSelectorProps) {
  return (
    <div className={cn(compact ? 'grid gap-2 sm:grid-cols-3' : 'space-y-2')}>
      {FOCUS_OPTIONS.map((option) => {
        const active = value === option.id;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={cn(
              'w-full rounded-xl border px-4 py-3 text-left transition-colors',
              active
                ? 'border-tof-teal bg-tof-teal/10'
                : 'border-gray-100 bg-white hover:border-tof-teal/30'
            )}
          >
            <p className="text-sm font-bold text-tof-navy">{option.label}</p>
            {!compact && (
              <p className="mt-0.5 text-xs text-gray-500">{option.hint}</p>
            )}
          </button>
        );
      })}
    </div>
  );
}

interface ActivitySportPickerProps {
  value: Sport;
  onChange: (value: Sport) => void;
  availableSports: Sport[];
}

export function ActivitySportPicker({
  value,
  onChange,
  availableSports,
}: ActivitySportPickerProps) {
  if (availableSports.length === 1) {
    const sport = availableSports[0];
    return (
      <p className="text-sm text-gray-600">
        Sport:{' '}
        <span className="font-semibold capitalize text-tof-navy">{sport}</span>
      </p>
    );
  }

  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-tof-navy">Welke sport?</p>
      <div className="flex gap-2">
        {availableSports.map((sport) => (
          <button
            key={sport}
            type="button"
            onClick={() => onChange(sport)}
            className={cn(
              'flex-1 rounded-xl border py-2.5 text-sm font-bold capitalize transition-colors',
              value === sport
                ? sport === 'padel'
                  ? 'border-violet-300 bg-violet-50 text-violet-800'
                  : 'border-sky-300 bg-sky-50 text-sky-800'
                : 'border-gray-100 text-gray-600 hover:border-gray-200'
            )}
          >
            {sport}
          </button>
        ))}
      </div>
    </div>
  );
}
