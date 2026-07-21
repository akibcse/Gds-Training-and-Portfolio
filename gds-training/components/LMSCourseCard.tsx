"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { Course } from "@/lib/getData";
import { Star } from "lucide-react";

type Props = {
  course: Course;
};

export default function LMSCourseCard({ course }: Props) {
  const reduce = useReducedMotion();

  // Fallback data if not present
  const thumbnail = course.thumbnail || "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=600&q=80";
  const rating = course.rating || 4.8;
  const studentCount = course.studentCount || 1250;
  const price = course.price || 5000;
  const discountPrice = course.discountPrice || 2500;
  const instructor = course.instructorName || "Aviation Expert";

  return (
    <motion.article
      whileHover={reduce ? undefined : { scale: 1.02, y: -4 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="group relative rounded-2xl bg-white p-[1px] shadow-sm transition duration-300 hover:shadow-2xl hover:shadow-[#1D4ED8]/20 flex flex-col h-full border border-slate-100"
    >
      <Link href={`/courses/${course.slug}`} className="flex flex-col h-full rounded-2xl overflow-hidden bg-white">
        {/* Thumbnail */}
        <div className="relative h-48 w-full overflow-hidden bg-slate-100">
          <img
            src={thumbnail}
            alt={course.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {/* Badge */}
          <div className="absolute top-3 left-3 bg-[#F59E0B] text-white text-xs font-bold px-2 py-1 rounded shadow-sm">
            Bestseller
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col flex-grow p-5">
          <h3 className="text-lg font-bold text-[#0F172A] line-clamp-2 leading-tight group-hover:text-[#1D4ED8] transition-colors">
            {course.title}
          </h3>
          
          <p className="mt-2 text-sm text-slate-500 line-clamp-1">{instructor}</p>

          <div className="mt-2 flex items-center gap-1.5">
            <span className="text-sm font-bold text-[#F59E0B]">{rating}</span>
            <div className="flex items-center text-[#F59E0B]">
              <Star className="h-4 w-4 fill-current" />
              <Star className="h-4 w-4 fill-current" />
              <Star className="h-4 w-4 fill-current" />
              <Star className="h-4 w-4 fill-current" />
              <Star className="h-4 w-4 fill-current opacity-50" />
            </div>
            <span className="text-xs text-slate-400">({studentCount.toLocaleString()})</span>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <span className="text-xl font-bold text-[#0F172A]">৳{discountPrice.toLocaleString()}</span>
            {price > discountPrice && (
              <span className="text-sm text-slate-400 line-through">৳{price.toLocaleString()}</span>
            )}
          </div>

          {/* Tags */}
          <div className="mt-auto pt-4 flex flex-wrap gap-2">
            <span className="rounded bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-700 uppercase tracking-wider">
              {course.level || "Beginner"}
            </span>
            <span className="rounded bg-slate-50 px-2 py-1 text-[10px] font-semibold text-slate-600 uppercase tracking-wider">
              {course.duration}
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
