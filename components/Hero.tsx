"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";

type Props = {
  headline: string;
  description: string;
  studentsTrained: number;
  experienceYears: number;
  whatsapp: string;
  profileImage: string;
  instructorName: string;
};

export default function Hero({
  headline,
  description,
  studentsTrained,
  experienceYears,
  whatsapp,
  profileImage,
  instructorName
}: Props) {
  const reduce = useReducedMotion();
  const isRemoteImage = /^https?:\/\//.test(profileImage);

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1920&q=80"
          alt="Airlines Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-aviation-900/90 via-aviation-800/85 to-aviation-900/90" />
        <div className="absolute inset-0 bg-gradient-to-t from-aviation-900/60 via-transparent to-aviation-900/40" />
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`, backgroundSize: "60px 60px" }} />
      </div>
      <div className="hero-gradient animate-gradientShift relative z-10 mx-auto grid max-w-6xl gap-8 px-5 pb-10 pt-14 text-white md:grid-cols-2 md:px-10">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20 }}
          animate={reduce ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative z-10"
        >
          <p className="inline-flex rounded-full border border-white/40 bg-white/20 px-3 py-1 text-xs font-semibold">
            Certified GDS Training
          </p>
          <h1 className="mt-4 font-[var(--font-serif)] text-4xl leading-tight md:text-5xl">
            <span className="bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
              {headline}
            </span>
          </h1>
          <p className="mt-4 max-w-xl text-sm text-white/90 md:text-base">{description}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="#lead-form"
              className="animate-pulseGlow rounded-full bg-cta-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-cta-600"
            >
              Enroll Now
            </a>
            <a
              href={whatsapp}
              className="rounded-full border border-white/45 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              Book Free Demo
            </a>
          </div>
          <div className="mt-6 flex gap-6 text-sm text-white/90">
            <p>
              <strong>{studentsTrained}+</strong> students trained
            </p>
            <p>
              <strong>{experienceYears}+</strong> years experience
            </p>
          </div>
        </motion.div>

        <div className="relative z-10 hidden items-center justify-center md:flex">
          <motion.div
            initial={reduce ? false : { opacity: 0, scale: 0.92 }}
            animate={reduce ? undefined : { opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="glass-card relative h-72 w-72 overflow-hidden rounded-3xl"
          >
            <Image
              src={profileImage || "/placeholder-avatar.png"}
              alt={instructorName}
              width={400}
              height={400}
              className="h-full w-full object-cover transition-transform duration-700 hover:scale-110"
              priority={true}
              sizes="(max-width: 1024px) 240px, 288px"
              unoptimized={isRemoteImage}
            />
            <motion.div
              className="absolute -left-5 top-8 rounded-full bg-white/20 p-3"
              animate={reduce ? undefined : { y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <span className="text-2xl">✈</span>
            </motion.div>
            <motion.div
              className="absolute -right-4 bottom-10 rounded-full bg-white/20 p-3"
              animate={reduce ? undefined : { y: [0, 7, 0] }}
              transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
            >
              <span className="text-2xl">🎓</span>
            </motion.div>
            <motion.div
              className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white/20"
              animate={reduce ? undefined : { rotate: [0, 6, -6, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        </div>

        <div className="pointer-events-none absolute -left-12 top-8 h-36 w-36 rounded-full bg-white/20 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 right-10 h-44 w-44 rounded-full bg-cyan-300/35 blur-3xl" />
      </div>
    </section>
  );
}
