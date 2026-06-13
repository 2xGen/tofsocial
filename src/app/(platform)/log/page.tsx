'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState } from 'react';
import {
  Clock,
  Rocket,
  Target,
  Tv,
  UserPlus,
  Users,
  Swords,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { getClubMembers, logActivity } from '@/lib/store';
import type { ActivityType, Sport } from '@/types';
import { ACTIVITY_LABELS, ACTIVITY_POINTS } from '@/types';
import { ACTIVITY_COLOR } from '@/lib/demo';
import {
  activityNeedsSport,
  getAvailableLogSports,
  getDemoSportFocus,
  resolveDefaultSport,
} from '@/lib/sport-focus';
import { ActivitySportPicker } from '@/components/platform/SportFocusSelector';
import { DemoBanner } from '@/components/platform/FeedItemCard';
import PlayerAvatar from '@/components/platform/PlayerAvatar';
import { DEMO_MEMBERS, DEMO_PLAYER } from '@/lib/demo';

const SPEELTIJD_TYPES = [
  { id: 'vrij_spelen', label: 'Vrij spelen' },
  { id: 'les', label: 'Les' },
  { id: 'training', label: 'Training' },
  { id: 'toernooi', label: 'Toernooi' },
  { id: 'interclub', label: 'Interclub' },
  { id: 'clubactiviteit', label: 'Clubactiviteit' },
] as const;

type SpeeltijdType = (typeof SPEELTIJD_TYPES)[number]['id'];

function formatSpeeltijdHours(hours: number): string {
  if (hours === 1) return '1 uur';
  const formatted = Number.isInteger(hours) ? String(hours) : hours.toFixed(1).replace('.', ',');
  return `${formatted} uur`;
}

function buildSpeeltijdDescription(type: SpeeltijdType, hours: number): string {
  const typeLabel = SPEELTIJD_TYPES.find((t) => t.id === type)?.label.toLowerCase() ?? type;
  return `speelde ${formatSpeeltijdHours(hours)} ${typeLabel}`;
}

const ACTION_CONFIG: {
  type: ActivityType;
  label: string;
  placeholder: string;
  preset?: string;
  icon: typeof Clock;
}[] = [
  { type: 'speeltijd', label: 'Speeltijd', placeholder: '', icon: Clock },
  { type: 'spelen', label: 'Wedstrijd', placeholder: 'bijv. 2 wedstrijden gespeeld', icon: Target },
  { type: 'deelnemen', label: 'Deelnemen', placeholder: 'bijv. clubactiviteit', icon: Users },
  { type: 'sociaal', label: 'Sociaal', placeholder: 'bijv. naar Wimbledon gekeken', preset: 'naar Wimbledon gekeken', icon: Tv },
  { type: 'uitdaging_speler', label: 'Speler uitdagen', placeholder: '', icon: Swords },
  { type: 'uitdaging', label: 'Uitdaging klaar', placeholder: 'bijv. Kraak de Code afgerond', icon: Rocket },
  { type: 'nieuwe_tegenstander', label: 'Nieuwe speler', placeholder: 'bijv. eerste keer tegen Lisa', icon: UserPlus },
];

function LogForm() {
  const { user, club } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isDemo = !user;

  const clubSport = isDemo ? 'beide' as const : club?.sport ?? 'beide';
  const playerFocus = isDemo ? getDemoSportFocus() : user?.sportFocus ?? 'beide';
  const availableLogSports = useMemo(
    () => getAvailableLogSports(clubSport, playerFocus),
    [clubSport, playerFocus]
  );

  const initialType = (searchParams.get('type') as ActivityType) || 'speeltijd';
  const initialTarget = searchParams.get('target') ?? '';

  const [selected, setSelected] = useState(
    ACTION_CONFIG.find((a) => a.type === initialType) ?? ACTION_CONFIG[0]
  );
  const [description, setDescription] = useState(selected.preset ?? '');
  const [speeltijdType, setSpeeltijdType] = useState<SpeeltijdType>('vrij_spelen');
  const [speeltijdHours, setSpeeltijdHours] = useState('1');
  const [activitySport, setActivitySport] = useState<Sport>(
    resolveDefaultSport(clubSport, playerFocus)
  );
  const [challengeTarget, setChallengeTarget] = useState(initialTarget);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setActivitySport(resolveDefaultSport(clubSport, playerFocus));
  }, [clubSport, playerFocus]);

  const showSportPicker =
    activityNeedsSport(selected.type) && availableLogSports.length > 1;

  const members = isDemo
    ? DEMO_MEMBERS.filter((m) => m.name !== DEMO_PLAYER.name)
    : user?.clubId
      ? getClubMembers(user.clubId).filter((m) => m.id !== user.id)
      : [];

  function selectAction(action: (typeof ACTION_CONFIG)[0]) {
    setSelected(action);
    setDescription(action.preset ?? '');
    setSpeeltijdType('vrij_spelen');
    setSpeeltijdHours('1');
    setSuccess(false);
  }

  const speeltijdPreview =
    selected.type === 'speeltijd'
      ? buildSpeeltijdDescription(speeltijdType, parseFloat(speeltijdHours.replace(',', '.')) || 0)
      : '';

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess(false);

    let finalDescription = description.trim();
    if (selected.type === 'speeltijd') {
      const hours = parseFloat(speeltijdHours.replace(',', '.'));
      if (!hours || hours <= 0) {
        setError('Vul een geldig aantal uren in.');
        return;
      }
      if (hours > 12) {
        setError('Maximaal 12 uur per melding.');
        return;
      }
      finalDescription = buildSpeeltijdDescription(speeltijdType, hours);
    }
    if (selected.type === 'uitdaging_speler' && challengeTarget) {
      finalDescription = `heeft ${challengeTarget} uitgedaagd`;
    }
    if (selected.type === 'sociaal' && !finalDescription && selected.preset) {
      finalDescription = selected.preset;
    }
    if (!finalDescription && selected.type !== 'uitdaging_speler' && selected.type !== 'speeltijd') {
      setError('Vul een beschrijving in.');
      return;
    }
    if (selected.type === 'uitdaging_speler' && !challengeTarget) {
      setError('Kies een speler om uit te dagen.');
      return;
    }

    if (isDemo) {
      setSuccess(true);
      setTimeout(() => router.push('/vereniging'), 1500);
      return;
    }

    if (!user) return;

    try {
      logActivity({
        userId: user.id,
        type: selected.type,
        description: finalDescription,
        sport: activityNeedsSport(selected.type)
          ? activitySport
          : resolveDefaultSport(clubSport, playerFocus),
      });
      router.push('/vereniging');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Loggen mislukt.');
    }
  }

  const Icon = selected.icon;

  return (
    <div className="mx-auto max-w-2xl">
      {isDemo && <DemoBanner className="mb-6" />}

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-tof-navy">Activiteit melden</h1>
        <p className="mt-1 text-sm text-gray-600">
          Kies wat je hebt gedaan — punten worden direct toegevoegd aan je TOF Social Score.
        </p>
      </div>

      {success ? (
        <div className="tof-card flex flex-col items-center tof-card-body py-12 text-center">
          <CheckCircle2 className="h-14 w-14 text-tof-teal" />
          <p className="mt-4 text-xl font-bold text-tof-navy">Activiteit gemeld!</p>
          <p className="mt-2 text-sm text-gray-600">
            +{ACTIVITY_POINTS[selected.type]} punten · zichtbaar in de feed
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
          )}

          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">
              Wat heb je gedaan?
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {ACTION_CONFIG.map((action) => {
                const ActionIcon = action.icon;
                const active = selected.type === action.type;
                return (
                  <button
                    key={action.type}
                    type="button"
                    onClick={() => selectAction(action)}
                    className={`flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-all ${
                      active
                        ? 'border-tof-teal bg-tof-teal/10 shadow-sm'
                        : 'border-gray-100 bg-white hover:border-tof-teal/40'
                    }`}
                  >
                    <span
                      className={`inline-flex h-10 w-10 items-center justify-center rounded-xl text-white ${ACTIVITY_COLOR[action.type]}`}
                    >
                      <ActionIcon className="h-5 w-5" />
                    </span>
                    <span className="text-xs font-bold text-tof-navy">{action.label}</span>
                    <span className="text-[10px] font-bold text-tof-teal">
                      +{ACTIVITY_POINTS[action.type]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preview card */}
          <div className="tof-card overflow-hidden p-0">
            <div className="flex items-center gap-3 border-b border-gray-100 bg-gray-50 px-5 py-3">
              <span
                className={`inline-flex h-9 w-9 items-center justify-center rounded-xl text-white ${ACTIVITY_COLOR[selected.type]}`}
              >
                <Icon className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-bold text-tof-navy">{selected.label}</p>
                <p className="text-xs text-gray-500">
                  {ACTIVITY_LABELS[selected.type]} · +{ACTIVITY_POINTS[selected.type]} punten
                </p>
              </div>
            </div>

            <div className="space-y-4 p-5">
              {showSportPicker && (
                <ActivitySportPicker
                  value={activitySport}
                  onChange={setActivitySport}
                  availableSports={availableLogSports}
                />
              )}

              {selected.type === 'uitdaging_speler' && (
                <div>
                  <p className="mb-3 text-sm font-semibold text-tof-navy">Kies een speler</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {members.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setChallengeTarget(m.name)}
                        className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
                          challengeTarget === m.name
                            ? 'border-tof-teal bg-tof-teal/10'
                            : 'border-gray-100 hover:border-tof-teal/40'
                        }`}
                      >
                        <PlayerAvatar name={m.name} size="sm" />
                        <span className="font-semibold text-tof-navy">{m.name}</span>
                      </button>
                    ))}
                  </div>
                  <Link
                    href="/spelers"
                    className="mt-2 inline-block text-sm font-semibold text-tof-teal hover:underline"
                  >
                    Alle spelers bekijken →
                  </Link>
                </div>
              )}

              {selected.type === 'speeltijd' && (
                <>
                  <div>
                    <p className="mb-3 text-sm font-semibold text-tof-navy">Wat heb je gedaan?</p>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {SPEELTIJD_TYPES.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => setSpeeltijdType(option.id)}
                          className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors ${
                            speeltijdType === option.id
                              ? 'border-tof-teal bg-tof-teal/10 text-tof-navy'
                              : 'border-gray-100 text-gray-600 hover:border-tof-teal/40'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="speeltijd-hours"
                      className="mb-1.5 block text-sm font-semibold text-tof-navy"
                    >
                      Aantal uur gespeeld
                    </label>
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        id="speeltijd-hours"
                        type="number"
                        min={0.5}
                        max={12}
                        step={0.5}
                        value={speeltijdHours}
                        onChange={(e) => setSpeeltijdHours(e.target.value)}
                        className="w-28 rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-tof-teal"
                      />
                      <span className="text-sm text-gray-500">uur</span>
                      <div className="flex flex-wrap gap-1.5">
                        {['0.5', '1', '1.5', '2', '3'].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setSpeeltijdHours(preset)}
                            className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-colors ${
                              speeltijdHours === preset
                                ? 'bg-tof-teal text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-tof-teal/15'
                            }`}
                          >
                            {preset.replace('.', ',')}u
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <p className="rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-600">
                    <span className="font-bold text-tof-navy">
                      {isDemo ? DEMO_PLAYER.name : user?.name ?? 'Jij'}
                    </span>{' '}
                    {speeltijdPreview || '…'}
                  </p>
                </>
              )}

              {selected.type !== 'uitdaging_speler' && selected.type !== 'speeltijd' && (
                <div>
                  <label
                    htmlFor="description"
                    className="mb-1.5 block text-sm font-semibold text-tof-navy"
                  >
                    Beschrijving
                  </label>
                  <input
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={selected.placeholder}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-tof-teal"
                  />
                </div>
              )}

              <button type="submit" className="btn-primary w-full justify-center py-3.5">
                Melden · +{ACTIVITY_POINTS[selected.type]} punten
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

export default function LogActivityPage() {
  return (
    <Suspense>
      <LogForm />
    </Suspense>
  );
}
