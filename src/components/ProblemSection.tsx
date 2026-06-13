'use client';

import { motion } from 'framer-motion';
import { problemPoints } from '@/data/mockData';

const BG_IMAGE =
  'https://iemgpccgdlwpsrsjuumo.supabase.co/storage/v1/object/public/TOF%20nieuwe%20fotos/tof%20500kb.jpg';

export default function ProblemSection() {
  return (
    <section id="probleem" className="relative overflow-hidden section-padding">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${BG_IMAGE})` }}
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-white/85 via-[#FFFBEB]/80 to-white/85"
        aria-hidden
      />

      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="tof-card-prominent mx-auto max-w-3xl p-8 md:p-12"
        >
          <div className="text-center">
            <span className="section-badge mb-3 inline-block">Het probleem</span>
            <h2 className="section-title">Herken je dit?</h2>
            <p className="section-desc mx-auto mt-4 max-w-xl">
              Veel verenigingen merken hetzelfde: jeugd is aanwezig, maar niet
              actief genoeg buiten de training.
            </p>
          </div>

          <ul className="mt-8 space-y-3">
            {problemPoints.map((point, index) => (
              <motion.li
                key={point}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06 }}
                className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/80 px-4 py-3"
              >
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-100 text-sm font-bold text-red-500">
                  !
                </span>
                <p className="text-sm font-medium leading-relaxed text-gray-700 md:text-base">
                  {point}
                </p>
              </motion.li>
            ))}
          </ul>

          <div className="mt-8 rounded-2xl bg-tof-navy px-6 py-5 text-center md:px-8 md:py-6">
            <p className="text-base font-semibold leading-relaxed text-white md:text-lg">
              TOF Social maakt activiteit zichtbaar en beloont spelers voor wat ze
              doen op de baan.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
