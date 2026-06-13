'use client';

import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { leaderboard } from '@/data/mockData';
import { ActivityIcon } from '@/lib/icons';
import { cn } from '@/lib/utils';
import { Section } from './Section';

export default function Leaderboard() {
  return (
    <Section id="ranking" variant="warm-pattern" className="section-padding">
      <div className="tof-card mx-auto mb-12 max-w-2xl tof-card-body text-center">
        <span className="section-badge mb-3 inline-block">Deze week</span>
        <h2 className="section-title">Meest actieve spelers deze week</h2>
        <p className="section-desc mt-4">
          Wie zet deze week de meeste stappen op de baan? Activiteit telt — elke
          wedstrijd, minuut en uitdaging.
        </p>
      </div>

      <div className="tof-card mx-auto max-w-xl overflow-hidden p-0">
        <div className="flex items-center gap-2 bg-tof-navy px-5 py-4">
          <Trophy className="h-5 w-5 text-tof-teal" />
          <span className="text-sm font-bold text-white">Activiteitenranglijst</span>
        </div>

        <ol className="divide-y divide-gray-100 bg-white">
          {leaderboard.map((player, index) => (
            <motion.li
              key={player.name}
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                'flex items-center gap-4 px-5 py-4',
                player.rank === 1 && 'bg-tof-teal/5'
              )}
            >
              <span
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-black',
                  player.rank <= 3
                    ? 'bg-tof-teal text-white'
                    : 'bg-gray-100 text-gray-600'
                )}
              >
                {player.rank}
              </span>

              <div className="flex min-w-0 flex-1 items-center gap-2">
                <span className="font-bold text-tof-navy">{player.name}</span>
                <ActivityIcon name={player.badge} className="text-gray-400" size={14} />
              </div>

              <div className="text-right">
                <p className="font-black text-tof-navy">+{player.points}</p>
                <p className="text-xs text-gray-400">activiteitspunten</p>
              </div>

              <span className="hidden rounded-full bg-tof-teal/15 px-2 py-0.5 text-xs font-semibold text-tof-navy sm:inline">
                {player.trend}
              </span>
            </motion.li>
          ))}
        </ol>
      </div>
    </Section>
  );
}
