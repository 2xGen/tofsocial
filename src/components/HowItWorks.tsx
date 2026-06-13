'use client';

import { motion } from 'framer-motion';
import { howItWorksSteps } from '@/data/mockData';
import { ActivityIcon } from '@/lib/icons';
import { Section, SectionHeader } from './Section';

export default function HowItWorks() {
  return (
    <Section id="hoe-het-werkt" variant="white" className="section-padding">
      <SectionHeader
        badge="Hoe het werkt"
        title="Hoe werkt TOF Social?"
        description="Van spelen op de baan tot punten verdienen — in vier stappen."
      />

      <div className="mx-auto grid max-w-4xl gap-5 sm:grid-cols-2">
        {howItWorksSteps.map((item, index) => (
          <motion.div
            key={item.step}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.08 }}
            className="tof-card tof-card-body"
          >
            <div className="flex items-start gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-tof-teal text-lg font-black text-white">
                {item.step}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-tof-teal/15">
                    <ActivityIcon name={item.icon} className="text-tof-navy" size={18} />
                  </span>
                  <h3 className="text-lg font-bold text-tof-navy">{item.title}</h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-gray-600 md:text-base">
                  {item.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
