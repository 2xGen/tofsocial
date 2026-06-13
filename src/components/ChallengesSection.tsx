'use client';

import { motion } from 'framer-motion';
import { challengeExamples } from '@/data/mockData';
import { ActivityIcon } from '@/lib/icons';
import { Section, SectionHeader } from './Section';

export default function ChallengesSection() {
  return (
    <Section id="uitdagingen" variant="white" className="section-padding">
      <SectionHeader
        badge="Uitdagingen"
        title="Uitdagingen die motiveren"
        description="Elke uitdaging levert punten en voortgang op."
      />

      <div className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-2">
        {challengeExamples.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.06 }}
            className="tof-card flex items-center gap-4 tof-card-body"
          >
            <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-tof-teal/15">
              <ActivityIcon name={item.icon} className="text-tof-navy" size={22} />
            </span>
            <p className="text-sm font-bold leading-snug text-tof-navy md:text-base">
              {item.label}
            </p>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
