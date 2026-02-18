"use client";

import { motion, useReducedMotion } from "framer-motion";

type Props = {
  href: string;
};

export default function FloatingWhatsAppButton({ href }: Props) {
  const reduce = useReducedMotion();

  return (
    <motion.a
      href={href}
      aria-label="Chat on WhatsApp"
      animate={reduce ? undefined : { y: [0, -5, 0] }}
      transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
      className="fixed bottom-5 right-5 z-50 hidden rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-soft md:inline-flex"
    >
      WhatsApp
    </motion.a>
  );
}
