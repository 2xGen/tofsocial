'use client';

import { useEffect, useState } from 'react';
import type { PlayerSportFocus } from '@/types';
import { PLAYER_SPORT_FOCUS_LABELS } from '@/types';
import { SportFocusSelector } from '@/components/platform/SportFocusSelector';
import { getDemoSportFocus, setDemoSportFocus } from '@/lib/sport-focus';
import { updatePlayerSportFocus } from '@/lib/store';

interface PlayerSportPreferenceProps {
  userId?: string;
  isDemo?: boolean;
  initialFocus?: PlayerSportFocus;
  onUpdated?: (focus: PlayerSportFocus) => void;
}

export default function PlayerSportPreference({
  userId,
  isDemo,
  initialFocus = 'beide',
  onUpdated,
}: PlayerSportPreferenceProps) {
  const [focus, setFocus] = useState<PlayerSportFocus>(
    isDemo ? getDemoSportFocus() : initialFocus
  );
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!isDemo) setFocus(initialFocus);
  }, [initialFocus, isDemo]);

  function handleChange(next: PlayerSportFocus) {
    setFocus(next);
    setSaved(false);

    if (isDemo) {
      setDemoSportFocus(next);
      onUpdated?.(next);
      setSaved(true);
      return;
    }

    if (!userId) return;

    try {
      updatePlayerSportFocus(userId, next);
      onUpdated?.(next);
      setSaved(true);
    } catch {
      setSaved(false);
    }
  }

  return (
    <div className="tof-card tof-card-body">
      <h3 className="text-sm font-bold text-tof-navy">Waar speel jij op de club?</h3>
      <p className="mt-1 text-xs text-gray-500">
        Kies wat op jou van toepassing is. Je hoeft niet beide te spelen.
      </p>
      <div className="mt-4">
        <SportFocusSelector value={focus} onChange={handleChange} compact />
      </div>
      {saved && (
        <p className="mt-3 text-xs font-semibold text-tof-teal">
          Opgeslagen · {PLAYER_SPORT_FOCUS_LABELS[focus]}
        </p>
      )}
    </div>
  );
}
