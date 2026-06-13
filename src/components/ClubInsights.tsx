'use client';

import { motion } from 'framer-motion';
import { clubInsights } from '@/data/mockData';
import { ActivityIcon } from '@/lib/icons';
import { cn } from '@/lib/utils';
import { Section, SectionHeader } from './Section';

const weeklyMatches = [
  { day: 'Maandag', matches: 28 },
  { day: 'Dinsdag', matches: 34 },
  { day: 'Woensdag', matches: 19 },
  { day: 'Donderdag', matches: 41 },
  { day: 'Vrijdag', matches: 31 },
  { day: 'Zaterdag', matches: 48 },
  { day: 'Zondag', matches: 36 },
];

const maxMatches = Math.max(...weeklyMatches.map((d) => d.matches));

export default function ClubInsights() {
  return (
    <Section id="club" variant="white" className="section-padding">
      <SectionHeader
        badge="Voor trainers"
        title="Inzicht in je club"
        description="Zie in één oogopslag hoe actief je leden zijn — en wie extra aandacht nodig heeft."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {clubInsights.map((insight, index) => (
          <motion.div
            key={insight.label}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
            className="tof-card tof-card-body"
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-tof-teal/15">
              <ActivityIcon name={insight.icon} className="text-tof-navy" size={20} />
            </span>
            <p className="mt-3 text-2xl font-black text-tof-navy">{insight.value}</p>
            <p className="mt-1 text-sm text-gray-600">{insight.label}</p>
            <p
              className={cn(
                'mt-2 text-xs font-bold',
                insight.change.startsWith('-') ? 'text-red-500' : 'text-emerald-600'
              )}
            >
              {insight.change} t.o.v. vorige week
            </p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="tof-card mx-auto mt-10 max-w-3xl tof-card-body"
      >
        <p className="text-lg font-bold text-tof-navy">TC De Smash · Voorbeeld van het overzicht</p>
        <p className="text-sm text-gray-500">86 actieve spelers · 14 inactief</p>

        <div className="mt-6 border-t border-gray-100 pt-6">
          <p className="text-sm font-bold text-tof-navy">Gespeelde wedstrijden per dag</p>
          <p className="mt-1 text-xs text-gray-500">
            Werkelijke aantallen deze week — geen relatieve percentages.
          </p>

          <div className="mt-5 space-y-3">
            {weeklyMatches.map((item, index) => (
              <div key={item.day}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">{item.day}</span>
                  <span className="font-bold tabular-nums text-tof-navy">
                    {item.matches} wedstrijden
                  </span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${(item.matches / maxMatches) * 100}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.04 }}
                    className="h-full rounded-full bg-tof-teal"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </Section>
  );
}
