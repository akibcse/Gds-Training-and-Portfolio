"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

type Props = {
  heading: string;
  copy: string;
};

export default function CTASection({ heading, copy }: Props) {
  const reduce = useReducedMotion();

  return (
    <section className="mx-auto max-w-6xl px-4 pb-16 pt-6 md:px-6">
      <div className="hero-gradient animate-gradientShift relative overflow-hidden rounded-3xl p-8 text-white">
        <div className="pointer-events-none absolute -left-16 top-0 h-40 w-40 rounded-full bg-white/20 blur-2xl" />
        <div className="pointer-events-none absolute -right-10 bottom-0 h-48 w-48 rounded-full bg-cyan-200/25 blur-3xl" />

        <h2 className="relative z-10 text-3xl font-semibold">{heading}</h2>
        <p className="relative z-10 mt-3 max-w-2xl text-sm text-white/90">{copy}</p>

        <div className="relative z-10 mt-5 flex flex-wrap gap-3">
          <motion.a
            href="#lead-form"
            whileHover={reduce ? undefined : { scale: 1.04 }}
            whileTap={reduce ? undefined : { scale: 0.97 }}
            className="animate-pulseGlow rounded-full bg-cta-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-cta-600"
          >
            Enroll Now
          </motion.a>
          <Link
            href="/contact"
            className="rounded-full border border-white/40 bg-white/10 px-5 py-2.5 text-sm font-semibold transition hover:bg-white/20"
          >
            Talk to Advisor
          </Link>
        </div>
      </div>
    </section>
  );
}
