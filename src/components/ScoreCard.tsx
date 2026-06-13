'use client';

import { motion } from 'framer-motion';
import { scorePoints } from '@/data/mockData';
import { ActivityIcon } from '@/lib/icons';
import { Section, SectionHeader } from './Section';

export default function ScoreCard() {
  return (
    <Section id="score" variant="warm" className="section-padding">
      <SectionHeader
        badge="TOF Social Score"
        title="Beloon activiteit, niet alleen prestaties"
        description="Met TOF Social Score verdienen spelers punten voor wat ze doen op de baan — niet alleen voor winnen."
      />

      <div className="tof-card mx-auto max-w-4xl overflow-hidden p-0">
        <div className="grid lg:grid-cols-2 lg:items-stretch">
          <div className="flex flex-col items-center justify-center border-b border-tof-navy/10 bg-white p-8 text-center md:p-10 lg:min-h-full lg:border-b-0 lg:border-r">
            <div className="mx-auto inline-flex items-center gap-3 rounded-2xl bg-tof-teal px-5 py-4 text-white shadow-lg">
              <span className="text-3xl font-black">80</span>
              <div className="text-left">
                <p className="text-sm font-bold">punten deze week</p>
                <p className="text-sm font-bold text-white">Emma</p>
              </div>
            </div>
            <p className="mx-auto mt-6 max-w-xs text-sm leading-relaxed text-gray-600">
              Zo krijgt iedere speler succeservaringen — ook buiten de les.
            </p>
          </div>

          <div className="bg-white p-8 md:p-10">
            <p className="mb-5 text-sm font-bold uppercase tracking-wider text-tof-navy/70">
              Punten voor
            </p>
            <ul className="space-y-3">
              {scorePoints.map((point, index) => (
                <motion.li
                  key={point.label}
                  initial={{ opacity: 0, x: 12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.06 }}
                  className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/80 px-4 py-3"
                >
                  <span className="flex items-center gap-3">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-tof-teal/15">
                      <ActivityIcon name={point.icon} className="text-tof-navy" size={18} />
                    </span>
                    <span className="font-medium text-tof-navy">{point.label}</span>
                  </span>
                  <span className="rounded-full bg-tof-teal/15 px-3 py-1 text-sm font-bold text-tof-navy">
                    {point.points}
                  </span>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Section>
  );
}
