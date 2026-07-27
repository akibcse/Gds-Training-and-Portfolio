"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { Course } from "@/lib/getData";

import { normalizeCourse } from "@/lib/getData";

type Props = {
  course: Course;
};

export default function CourseCard({ course: rawCourse }: Props) {
  const reduce = useReducedMotion();
  const course = normalizeCourse(rawCourse);

  return (
    <motion.article
      whileHover={reduce ? undefined : { scale: 1.02, y: -4 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="group relative rounded-2xl bg-gradient-to-br from-aviation-100/80 via-cyan-50 to-white p-[1px]"
    >
      <div className="rounded-2xl bg-white p-6 shadow-soft transition duration-300 group-hover:shadow-glowHover">
        <div className="flex items-start justify-between gap-3">
          <div>
            {course.bestseller && (
              <span className="mb-2 inline-block rounded bg-amber-500 px-2 py-0.5 text-[10px] font-extrabold text-white">
                BESTSELLER
              </span>
            )}
            <h3 className="text-xl font-semibold text-ink">{course.title}</h3>
          </div>
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-aviation-600 to-cyan-500 text-lg text-white shrink-0">
            ✈
          </span>
        </div>
        <p className="mt-2 text-sm text-ink/80">{course.excerpt}</p>

        {!course.hideFee && (
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-lg font-bold text-ink">৳{(course.discountPrice || 0).toLocaleString()}</span>
            {course.price && course.price > (course.discountPrice || 0) && (
              <span className="text-xs text-slate-400 line-through">৳{course.price.toLocaleString()}</span>
            )}
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-aviation-50 px-3 py-1 text-xs font-semibold text-aviation-700">
            Duration: {course.duration}
          </span>
          <span className="rounded-full bg-aviation-50 px-3 py-1 text-xs font-semibold text-aviation-700">
            Mode: {course.mode}
          </span>
        </div>
        <Link
          href={`/courses/${course.slug}`}
          className="mt-5 inline-flex rounded-full bg-gradient-to-r from-cta-500 to-cta-600 px-4 py-2 text-sm font-semibold text-white transition hover:brightness-105"
        >
          Enroll Now
        </Link>
      </div>
    </motion.article>
  );
}
