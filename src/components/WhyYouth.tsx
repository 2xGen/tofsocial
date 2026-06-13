'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { youthBenefits } from '@/data/mockData';
import { Section, SectionHeader } from './Section';

export default function WhyYouth() {
  return (
    <Section id="jeugd" variant="warm-pattern" className="section-padding">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45 }}
        className="tof-card-prominent mx-auto max-w-2xl p-8 md:p-10"
      >
        <SectionHeader
          badge="Voor jeugdspelers"
          title="Waarom jeugdspelers dit leuk vinden"
          description="Jeugdspelers zien direct:"
          className="mb-8"
        />

        <ul className="space-y-4 text-left">
          {youthBenefits.map((item, index) => (
            <motion.li
              key={item.label}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.06 }}
              className="flex items-start gap-3"
            >
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-tof-teal text-white">
                <Check className="h-3.5 w-3.5 stroke-[3]" aria-hidden />
              </span>
              <p className="text-base font-semibold leading-snug text-tof-navy md:text-lg">
                {item.label}
              </p>
            </motion.li>
          ))}
        </ul>
      </motion.div>
    </Section>
  );
}
