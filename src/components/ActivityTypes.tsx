'use client';

import { motion } from 'framer-motion';
import { activityTypes } from '@/data/mockData';
import { ActivityIcon } from '@/lib/icons';
import { Section, SectionHeader } from './Section';

export default function ActivityTypes() {
  return (
    <Section id="activiteiten-types" variant="white" className="section-padding">
      <SectionHeader
        badge="Functies"
        title="Wat wordt bijgehouden?"
        description="Vier pijlers die samen je volledige baanactiviteit vormen."
      />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {activityTypes.map((type, index) => (
          <motion.div
            key={type.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.06 }}
            className="tof-card tof-card-body"
          >
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-tof-teal/15">
              <ActivityIcon name={type.icon} className="text-tof-navy" size={24} />
            </span>
            <h3 className="mt-4 text-lg font-bold text-tof-navy">{type.title}</h3>
            <p className="mt-2 text-sm text-gray-600">{type.description}</p>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
