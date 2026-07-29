"use client";

import { useState } from "react";
import { ref, push, set } from "firebase/database";
import { db } from "@/lib/firebase";
import { Star, Send, CheckCircle, AlertCircle } from "lucide-react";

interface ReviewFormProps {
    studentId: string;
    studentName: string;
    studentEmail: string;
    studentImage?: string;
    courseId: string;
    courseName: string;
}

export default function ReviewForm({
    studentId,
    studentName,
    studentEmail,
    studentImage,
    courseId,
    courseName,
}: ReviewFormProps) {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [quote, setQuote] = useState("");
    const [role, setRole] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            setError("Please select a star rating.");
            return;
        }
        if (quote.trim().length < 15) {
            setError("Please write at least 15 characters for your review.");
            return;
        }
        setError("");
        setSubmitting(true);

        try {
            const reviewsRef = ref(db, "reviews");
            const newRef = push(reviewsRef);
            const reviewId = newRef.key!;

            await set(newRef, {
                id: reviewId,
                studentId,
                studentName,
                studentEmail,
                studentImage: studentImage || "",
                courseId,
                courseName,
                rating,
                quote: quote.trim(),
                role: role.trim() || "Student",
                status: "pending",
                submittedAt: new Date().toISOString(),
            });

            // Create admin notification
            const notifRef = push(ref(db, "notifications"));
            await set(notifRef, {
                id: notifRef.key,
                type: "new_review",
                message: `${studentName} submitted a ${rating}★ review for "${courseName}"`,
                link: "/admin/reviews",
                read: false,
                createdAt: new Date().toISOString(),
            });

            setSubmitted(true);
        } catch (err: any) {
            setError("Failed to submit review. Please try again.");
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                    <CheckCircle className="h-8 w-8 text-emerald-600" />
                </div>
                <h4 className="text-lg font-bold text-slate-800">Review Submitted!</h4>
                <p className="text-sm text-slate-500 max-w-sm">
                    Your review is pending admin approval and will appear on the homepage once approved. Thank you!
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div>
                <p className="text-sm font-semibold text-slate-700 mb-1">
                    Reviewing: <span className="text-[#1D4ED8]">{courseName}</span>
                </p>
            </div>

            {/* Star Rating */}
            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Your Rating <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="transition-transform hover:scale-110 focus:outline-none"
                        >
                            <Star
                                className={`h-8 w-8 transition-colors ${
                                    star <= (hoverRating || rating)
                                        ? "fill-amber-400 text-amber-400"
                                        : "text-slate-300"
                                }`}
                            />
                        </button>
                    ))}
                    {rating > 0 && (
                        <span className="ml-2 self-center text-sm font-bold text-amber-600">
                            {["", "Poor", "Fair", "Good", "Great", "Excellent"][rating]}
                        </span>
                    )}
                </div>
            </div>

            {/* Role / Designation */}
            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Your Current Role / Designation
                </label>
                <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. GDS Specialist, Air Ticketing Agent..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/20 transition-all"
                />
            </div>

            {/* Review Text */}
            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Your Review <span className="text-red-500">*</span>
                </label>
                <textarea
                    value={quote}
                    onChange={(e) => setQuote(e.target.value)}
                    placeholder="Share your experience with the course. How did it help your career? What did you learn?"
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/20 transition-all resize-none"
                />
                <p className="mt-1 text-xs text-slate-400">{quote.length}/500 characters</p>
            </div>

            {error && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 rounded-xl px-4 py-3 text-sm font-medium border border-red-100">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                </div>
            )}

            <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 bg-[#1D4ED8] hover:bg-blue-800 disabled:opacity-60 text-white font-bold px-6 py-2.5 rounded-xl transition-colors shadow-sm text-sm"
            >
                {submitting ? (
                    <>
                        <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        Submitting...
                    </>
                ) : (
                    <>
                        <Send className="h-4 w-4" />
                        Submit Review
                    </>
                )}
            </button>

            <p className="text-xs text-slate-400">
                Your review will be visible on the homepage after admin approval.
            </p>
        </form>
    );
}
