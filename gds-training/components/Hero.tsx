"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import type { HeroSlide } from "@/lib/cms/slider";

type Props = {
  headline: string;
  description: string;
  studentsTrained: number;
  experienceYears: number;
  whatsapp: string;
  profileImage?: string;
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
  const resolvedProfileImage = profileImage?.trim() || "/images/md-akib-hasan.svg";
  const isRemoteImage = /^https?:\/\//.test(resolvedProfileImage);

  /* ── Slider state ── */
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    fetch("/api/admin/slider")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setSlides(data);
      })
      .catch(() => {});
  }, []);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1 || isPaused) return;
    const timer = setInterval(handleNext, 6000);
    return () => clearInterval(timer);
  }, [slides.length, isPaused, handleNext]);

  const activeSlide = slides[currentIndex];

  return (
    <section className="relative overflow-hidden">

      {/* ── Part 1: Instructor hero content ── */}

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
              href="/#lead-form"
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
              src={resolvedProfileImage}
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

      {/* ── Part 2: CMS Image Slider (inside same section, below instructor grid) ── */}
      {slides.length > 0 && activeSlide && (
        <div
          className="relative z-10 mx-auto max-w-6xl px-5 pb-10 md:px-10"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Divider */}
          <div className="mb-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/20" />
            <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white/60 backdrop-blur-sm">
              Featured Announcements
            </span>
            <div className="h-px flex-1 bg-white/20" />
          </div>

          {/* Slide card */}
          <div className="relative overflow-hidden rounded-3xl border border-aviation-700/40 bg-aviation-900/70 shadow-xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSlide.id + currentIndex}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="relative"
              >
                {/* Slide background image */}
                {activeSlide.bgImageUrl && (
                  <div className="absolute inset-0 z-0 overflow-hidden rounded-3xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={activeSlide.bgImageUrl}
                      alt={activeSlide.title}
                      className="h-full w-full object-cover opacity-30"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-900/60 to-transparent" />
                  </div>
                )}

                {/* Slide content */}
                <div className="relative z-10 flex flex-col items-start gap-4 px-7 py-8 text-white md:flex-row md:items-center md:justify-between">
                  <div className="flex flex-col gap-2">
                    {activeSlide.badgeText && (
                      <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-500/20 px-3 py-1 text-[11px] font-bold text-amber-300">
                        <Sparkles className="h-3 w-3" />
                        {activeSlide.badgeText}
                      </span>
                    )}
                    <h2 className="text-xl font-bold leading-snug tracking-tight md:text-2xl">
                      <span className="bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
                        {activeSlide.title}
                      </span>
                    </h2>
                    {activeSlide.subtitle && (
                      <p className="max-w-lg text-sm text-white/75">{activeSlide.subtitle}</p>
                    )}
                  </div>

                  {activeSlide.ctaText && (
                    <Link
                      href={activeSlide.ctaLink || "/courses"}
                      className="shrink-0 rounded-full bg-gradient-to-r from-aviation-600 to-cyan-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-aviation-600/25 transition-all hover:scale-105 hover:brightness-110 active:scale-95"
                    >
                      {activeSlide.ctaText}
                    </Link>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Prev / Next arrows */}
            {slides.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  aria-label="Previous slide"
                  className="absolute left-3 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition hover:bg-white/25"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={handleNext}
                  aria-label="Next slide"
                  className="absolute right-3 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition hover:bg-white/25"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>

          {/* Dot indicators */}
          {slides.length > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentIndex
                      ? "w-7 bg-cyan-400"
                      : "w-1.5 bg-white/30 hover:bg-white/60"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
