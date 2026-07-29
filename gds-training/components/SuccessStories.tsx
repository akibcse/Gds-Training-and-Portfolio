"use client";

import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "@/lib/firebase";
import { Star, Quote, User } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

interface Review {
    id: string;
    studentName: string;
    role: string;
    quote: string;
    rating: number;
    courseName: string;
    studentImage?: string;
    approvedAt?: string;
}

interface StaticTestimonial {
    name: string;
    role: string;
    quote: string;
    image?: string;
}

interface Props {
    staticTestimonials?: StaticTestimonial[];
}

function ReviewCard({ review, index }: { review: Review; index: number }) {
    const reduce = useReducedMotion();
    const initials = review.studentName
        .split(" ")
        .map((p) => p[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    return (
        <motion.article
            initial={reduce ? undefined : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.07, duration: 0.4, ease: "easeOut" }}
            whileHover={reduce ? undefined : { y: -4 }}
            className="glass-card rounded-2xl p-5 shadow-soft flex flex-col gap-3 relative overflow-hidden"
        >
            <Quote className="absolute top-4 right-4 h-8 w-8 text-aviation-100 opacity-60" />

            {/* Stars */}
            <div className="flex gap-0.5" aria-label={`${review.rating} star rating`}>
                {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                        key={s}
                        className={`h-4 w-4 ${s <= review.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`}
                    />
                ))}
            </div>

            <p className="text-sm leading-relaxed text-ink/90 flex-1">"{review.quote}"</p>

            {review.courseName && (
                <span className="inline-block text-[11px] font-semibold text-aviation-700 bg-aviation-50 border border-aviation-100 rounded-full px-2.5 py-0.5 w-fit">
                    {review.courseName}
                </span>
            )}

            <div className="flex items-center gap-3 border-t border-aviation-50 pt-3 mt-1">
                {review.studentImage ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                        src={review.studentImage}
                        alt={review.studentName}
                        className="h-10 w-10 shrink-0 rounded-full object-cover border-2 border-aviation-200 shadow-sm"
                        onError={(e) => {
                            // Fallback to initials avatar if image fails to load
                            e.currentTarget.style.display = "none";
                        }}
                    />
                ) : (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-aviation-600 to-cyan-500 text-xs font-semibold text-white shadow-sm">
                        {initials}
                    </div>
                )}
                <div>
                    <h3 className="font-semibold text-ink leading-none">{review.studentName}</h3>
                    <p className="text-xs text-ink/70 mt-0.5">{review.role}</p>
                </div>
            </div>
        </motion.article>
    );
}

export default function SuccessStories({ staticTestimonials = [] }: Props) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const reviewsRef = ref(db, "reviews");
        const unsub = onValue(reviewsRef, (snap) => {
            const data = snap.val();
            if (data) {
                const approved = Object.values(data)
                    .filter((r: any) => r.status === "approved")
                    .sort(
                        (a: any, b: any) =>
                            new Date(b.approvedAt || b.submittedAt || 0).getTime() -
                            new Date(a.approvedAt || a.submittedAt || 0).getTime()
                    ) as Review[];
                setReviews(approved);
            } else {
                setReviews([]);
            }
            setLoaded(true);
        });
        return () => unsub();
    }, []);

    // Merge: show dynamic approved reviews first, fall back to static testimonials if none
    const displayReviews: Review[] =
        loaded && reviews.length > 0
            ? reviews
            : staticTestimonials.map((t, i) => ({
                  id: `static-${i}`,
                  studentName: t.name,
                  role: t.role,
                  quote: t.quote,
                  rating: 5,
                  courseName: "",
                  studentImage: t.image || "",
              }));

    if (!loaded) {
        return (
            <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="rounded-2xl border border-aviation-100 bg-white p-5 h-48 animate-pulse" />
                ))}
            </div>
        );
    }

    return (
        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {displayReviews.map((review, i) => (
                <ReviewCard key={review.id} review={review} index={i} />
            ))}
        </div>
    );
}
