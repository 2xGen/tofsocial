'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Mail } from 'lucide-react';

export default function CTASection() {
  const sectionRef = useRef<HTMLElement>(null);
  const sectionInView = useInView(sectionRef, { once: false, amount: 0.3 });

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="relative py-24 md:py-32"
      style={{
        background: '#1B144C',
        backgroundImage:
          'url(https://toftennis.nl/wp-content/uploads/2024/04/Blauwe-bal-150x150.png)',
        backgroundRepeat: 'repeat',
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(62, 200, 188, 0.93) 0%, rgba(62, 200, 188, 0.93) 64%, rgba(180, 255, 200, 1) 100%)',
          opacity: 0.93,
        }}
        aria-hidden
      />

      <div className="container relative z-10 px-4">
        <motion.div
          className="tof-card-prominent mx-auto max-w-3xl p-8 text-center md:p-12"
          initial={{ opacity: 0, y: 40 }}
          animate={sectionInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="section-title md:text-5xl">
            Maak van jeugdleden actieve clubspelers
          </h2>
          <p className="section-desc mx-auto mt-5 max-w-xl">
            TOF Social maakt wedstrijden, speeltijd, uitdagingen en voortgang
            zichtbaar zodat jeugdspelers vaker de baan op gaan.
          </p>

          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <a
              href="mailto:info@tofsports.nl?subject=TOF%20Social%20demo"
              className="btn-primary py-4"
            >
              Demo aanvragen
              <ArrowRight className="h-5 w-5" />
            </a>
            <a
              href="https://tofsports.nl/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary py-4"
            >
              <Mail className="h-5 w-5" />
              TOF Sports
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
