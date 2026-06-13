'use client';

import { motion } from 'framer-motion';
import { streakStats } from '@/data/mockData';
import { ActivityIcon } from '@/lib/icons';
import { Section, SectionHeader } from './Section';

export default function StreakCard() {
  return (
    <Section variant="white" className="section-padding">
      <SectionHeader
        title="Blijf in beweging"
        description="Reeksen, wedstrijden en uitdagingen houden spelers gemotiveerd — blijf consistent op de baan."
      />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {streakStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.06 }}
            className="tof-card tof-card-body"
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-tof-teal/15">
                <ActivityIcon name={stat.icon} className="text-tof-navy" size={20} />
              </span>
              <span className="text-xl font-black text-tof-navy">
                {stat.value}
                <span className="ml-1 text-sm font-medium text-gray-500">
                  {stat.unit}
                </span>
              </span>
            </div>
            <p className="mt-4 text-sm font-semibold text-gray-800">{stat.label}</p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${stat.progress}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.15 + index * 0.08 }}
                className="h-full rounded-full bg-tof-teal"
              />
            </div>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
