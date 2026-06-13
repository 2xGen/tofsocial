'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ChevronDown, Radio } from 'lucide-react';
import ActivityFeedStack from './ActivityFeedStack';

export default function ActivityFeed() {
  const sectionRef = useRef<HTMLElement>(null);
  const sectionInView = useInView(sectionRef, { once: false, amount: 0.1 });

  return (
    <section
      ref={sectionRef}
      id="activiteiten"
      className="relative overflow-hidden bg-white pb-20 pt-14 md:pb-24 md:pt-20"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-tof-mint/25 via-[#FFFBEB] to-white"
        aria-hidden
      />

      <div className="container relative z-10 px-4">
        <motion.div
          className="mx-auto max-w-3xl text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={sectionInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.45 }}
        >
          <h2 className="font-poppins text-2xl font-bold leading-tight text-tof-navy md:text-4xl">
            Elke activiteit telt
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-gray-600 md:text-lg">
            Wedstrijden, speeltijd, uitdagingen en voortgang — automatisch
            bijgehouden. Zo zien jeugdspelers wat ze doen en blijven ze gemotiveerd
            om vaker op de baan te staan.
          </p>
        </motion.div>

        <div className="relative mx-auto mt-12 max-w-5xl md:mt-14">
          <div className="relative flex flex-col items-center gap-10 md:flex-row md:items-start md:gap-14">
            <div className="w-full md:w-2/5">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                viewport={{ once: true }}
                className="tof-card tof-card-body md:sticky md:top-24"
              >
                <div className="mb-3">
                  <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-tof-navy md:text-sm">
                    <Radio className="h-3.5 w-3.5 text-tof-teal" aria-hidden />
                    Activiteit op jouw vereniging
                  </span>
                </div>
                <p className="text-sm font-medium leading-relaxed text-gray-600 md:text-base">
                  Zichtbaar maken wat jeugd doet — wie speelt, wint of vooruitgaat
                  op de baan.
                </p>
                <p className="mt-3 text-xs text-gray-500 md:text-sm">
                  Tennis en padel. Alles wat op de baan gebeurt.
                </p>
              </motion.div>
            </div>

            <div className="flex w-full justify-center md:w-3/5 md:justify-end md:pr-4">
              <ActivityFeedStack />
            </div>
          </div>
        </div>
      </div>

      <motion.a
        href="#hoe-het-werkt"
        className="absolute bottom-6 left-1/2 z-20 -translate-x-1/2 text-tof-navy/30 hover:text-tof-navy md:bottom-8"
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.9 }}
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown className="h-6 w-6 md:h-7 md:w-7" />
        </motion.div>
      </motion.a>
    </section>
  );
}
