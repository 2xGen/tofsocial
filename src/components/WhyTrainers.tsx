'use client';

import { motion } from 'framer-motion';
import { trainerBenefits } from '@/data/mockData';
import { ActivityIcon } from '@/lib/icons';
import { Section, SectionHeader } from './Section';

export default function WhyTrainers() {
  return (
    <Section id="trainers" variant="white" className="section-padding">
      <SectionHeader
        badge="Voor trainers"
        title="Waarom trainers dit gebruiken"
        description="Minder losse organisatie, meer overzicht en een jeugdprogramma dat vanzelf leeft."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {trainerBenefits.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
            className="tof-card tof-card-body text-center"
          >
            <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-tof-teal/15">
              <ActivityIcon name={item.icon} className="text-tof-navy" size={22} />
            </span>
            <p className="mt-4 text-sm font-bold leading-snug text-tof-navy md:text-base">
              {item.label}
            </p>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
