"use client";

import { motion, useReducedMotion } from "framer-motion";

type Props = {
  testimonial: {
    name: string;
    role: string;
    quote: string;
  };
};

export default function TestimonialCard({ testimonial }: Props) {
  const reduce = useReducedMotion();
  const initials = testimonial.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <motion.article
      whileHover={reduce ? undefined : { y: -4 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="glass-card rounded-2xl p-5 shadow-soft"
    >
      <div className="mb-3 flex text-amber-500" aria-label="5 star rating">
        {"★★★★★"}
      </div>
      <p className="text-sm leading-relaxed text-ink/90">"{testimonial.quote}"</p>
      <div className="mt-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-aviation-600 to-cyan-500 text-xs font-semibold text-white">
          {initials}
        </div>
        <div>
          <h3 className="font-semibold text-ink">{testimonial.name}</h3>
          <p className="text-xs text-ink/70">{testimonial.role}</p>
        </div>
      </div>
    </motion.article>
  );
}
