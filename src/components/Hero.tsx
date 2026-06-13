'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { HERO_WAVE_PATH } from '@/data/heroSlides';

const LOGO_SRC =
  'https://toftennis.nl/wp-content/uploads/2024/04/TOF-logo.svg';

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-white pt-20">
      <div
        className="absolute inset-x-0 top-0 bottom-14 tof-pattern md:bottom-16"
        aria-hidden
      />
      <div
        className="tof-pattern-overlay absolute inset-x-0 top-0 bottom-14 md:bottom-16"
        aria-hidden
      />

      <div className="container relative z-10 flex min-h-[calc(100vh-5rem)] items-center justify-center py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="tof-card-prominent w-full max-w-3xl text-center"
        >
          <div className="p-8 md:p-10">
            <div className="flex items-end justify-center gap-2 md:gap-3">
              <Image
                src={LOGO_SRC}
                alt="TOF"
                width={220}
                height={90}
                className="h-14 w-auto md:h-[4.5rem]"
                priority
              />
              <span className="pb-1 font-poppins text-xl font-bold leading-none text-tof-navy md:pb-1.5 md:text-2xl">
                Social
              </span>
            </div>

            <p className="mt-5 text-lg font-semibold text-tof-navy md:text-2xl">
              Maak van jeugdleden actieve clubspelers.
            </p>
            <p className="section-desc mx-auto mt-4 max-w-xl">
              TOF Social maakt wedstrijden, speeltijd, uitdagingen en voortgang
              zichtbaar zodat jeugdspelers vaker de baan op gaan.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <a href="#contact" className="btn-primary">
                Demo aanvragen
                <ArrowRight className="h-4 w-4" />
              </a>
              <a href="#contact" className="btn-secondary">
                Start je jeugdprogramma
              </a>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="relative z-20 -mb-px bg-white">
        <svg
          viewBox="0 0 1000 100"
          preserveAspectRatio="none"
          className="block h-14 w-full md:h-16"
          aria-hidden
        >
          <path d={HERO_WAVE_PATH} fill="#ffffff" />
        </svg>
      </div>

      <a
        href="#probleem"
        className="absolute bottom-[4.5rem] left-1/2 z-30 -translate-x-1/2 text-tof-navy/40 hover:text-tof-navy md:bottom-20"
        aria-label="Scroll naar probleem"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <ChevronDown className="h-6 w-6" />
        </motion.div>
      </a>
    </section>
  );
}
