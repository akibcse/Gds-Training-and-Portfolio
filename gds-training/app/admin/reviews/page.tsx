"use client";

import { useState, useEffect } from "react";
import { ref, onValue, update, set, push } from "firebase/database";
import { db } from "@/lib/firebase";
import { useAuthStore } from "@/store/useAuthStore";
import {
    Star,
    CheckCircle,
    XCircle,
    Clock,
    Search,
    Eye,
    BookOpen,
    User,
} from "lucide-react";

interface Review {
    id: string;
    studentId: string;
    studentName: string;
    studentEmail: string;
    courseId: string;
    courseName: string;
    rating: number;
    quote: string;
    role: string;
    status: "pending" | "approved" | "rejected";
    submittedAt: string;
    approvedAt?: string;
    rejectedAt?: string;
}

const STATUS_CONFIG = {
    pending: { label: "Pending", color: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock },
    approved: { label: "Approved", color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle },
    rejected: { label: "Rejected", color: "bg-rose-50 text-rose-700 border-rose-200", icon: XCircle },
};

export default function AdminReviewsPage() {
    const { user, profile } = useAuthStore();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"pending" | "approved" | "rejected" | "all">("pending");
    const [search, setSearch] = useState("");
    const [processing, setProcessing] = useState<string | null>(null);
    const [selected, setSelected] = useState<Review | null>(null);

    useEffect(() => {
        const reviewsRef = ref(db, "reviews");
        const unsub = onValue(reviewsRef, (snap) => {
            const data = snap.val();
            if (data) {
                const list = Object.values(data)
                    .sort((a: any, b: any) =>
                        new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
                    ) as Review[];
                setReviews(list);
            } else {
                setReviews([]);
            }
            setLoading(false);
        });
        return () => unsub();
    }, []);

    const handleApprove = async (review: Review) => {
        if (processing) return;
        setProcessing(review.id);
        try {
            const updates: any = {};
            updates[`reviews/${review.id}/status`] = "approved";
            updates[`reviews/${review.id}/approvedAt`] = new Date().toISOString();
            updates[`reviews/${review.id}/approvedBy`] = profile?.email || user?.email || "Admin";

            // Notify student
            if (review.studentId) {
                const notifKey = push(ref(db, `student_notifications/${review.studentId}`)).key;
                updates[`student_notifications/${review.studentId}/${notifKey}`] = {
                    id: notifKey,
                    studentId: review.studentId,
                    type: "payment_approved",
                    message: `Your review for "${review.courseName}" has been approved and published on the homepage!`,
                    link: "/",
                    read: false,
                    createdAt: new Date().toISOString()
                };
            }

            await update(ref(db), updates);
            setSelected(null);
        } catch (err: any) {
            alert("Failed to approve: " + err.message);
        } finally {
            setProcessing(null);
        }
    };

    const handleReject = async (review: Review) => {
        if (processing) return;
        setProcessing(review.id);
        try {
            const updates: any = {};
            updates[`reviews/${review.id}/status`] = "rejected";
            updates[`reviews/${review.id}/rejectedAt`] = new Date().toISOString();
            updates[`reviews/${review.id}/rejectedBy`] = profile?.email || user?.email || "Admin";
            await update(ref(db), updates);
            setSelected(null);
        } catch (err: any) {
            alert("Failed to reject: " + err.message);
        } finally {
            setProcessing(null);
        }
    };

    const pending = reviews.filter((r) => r.status === "pending");
    const approved = reviews.filter((r) => r.status === "approved");
    const rejected = reviews.filter((r) => r.status === "rejected");

    const filtered = reviews
        .filter((r) => {
            if (activeTab !== "all" && r.status !== activeTab) return false;
            if (search.trim()) {
                const q = search.toLowerCase();
                return (
                    r.studentName.toLowerCase().includes(q) ||
                    r.courseName.toLowerCase().includes(q) ||
                    r.quote.toLowerCase().includes(q)
                );
            }
            return true;
        });

    const getTimeAgo = (d: string) => {
        const diff = Date.now() - new Date(d).getTime();
        const hrs = Math.floor(diff / 3600000);
        if (hrs < 1) return "just now";
        if (hrs < 24) return `${hrs}h ago`;
        return `${Math.floor(hrs / 24)}d ago`;
    };

    if (loading) {
        return (
            <div className="space-y-4 animate-pulse">
                <div className="h-10 w-48 bg-aviation-100 rounded-xl" />
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-20 bg-white rounded-2xl border border-aviation-50" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-ink tracking-tight flex items-center gap-3">
                        <Star className="h-7 w-7 text-amber-500" />
                        Student Reviews
                    </h1>
                    <p className="mt-1 text-ink/50 text-sm">
                        Approve student reviews to display them on the homepage.
                    </p>
                </div>
                {pending.length > 0 && (
                    <span className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 font-bold text-sm px-4 py-2 rounded-xl">
                        <Clock className="h-4 w-4" />
                        {pending.length} awaiting approval
                    </span>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Total Reviews", value: reviews.length, color: "text-ink", bg: "bg-aviation-50" },
                    { label: "Pending", value: pending.length, color: "text-amber-700", bg: "bg-amber-50" },
                    { label: "Approved", value: approved.length, color: "text-emerald-700", bg: "bg-emerald-50" },
                    { label: "Rejected", value: rejected.length, color: "text-rose-700", bg: "bg-rose-50" },
                ].map((stat) => (
                    <div key={stat.label} className={`${stat.bg} rounded-2xl p-4 border border-aviation-100`}>
                        <p className="text-xs font-semibold text-ink/50">{stat.label}</p>
                        <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-3">
                {/* Tabs */}
                <div className="flex bg-white rounded-xl border border-aviation-100 shadow-soft p-1 overflow-x-auto">
                    {(["pending", "approved", "rejected", "all"] as const).map((tab) => {
                        const counts = { pending: pending.length, approved: approved.length, rejected: rejected.length, all: reviews.length };
                        return (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                                    activeTab === tab
                                        ? "bg-aviation-600 text-white shadow-sm"
                                        : "text-ink/60 hover:text-aviation-600"
                                }`}
                            >
                                {tab} ({counts[tab]})
                            </button>
                        );
                    })}
                </div>

                {/* Search */}
                <div className="relative flex-1 sm:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink/40" />
                    <input
                        type="text"
                        placeholder="Search reviews..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-aviation-100 rounded-xl text-sm outline-none focus:border-aviation-300 bg-white shadow-soft"
                    />
                </div>
            </div>

            {/* Review List */}
            <div className="space-y-3">
                {filtered.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-aviation-100 p-12 text-center">
                        <Star className="h-10 w-10 text-aviation-200 mx-auto mb-3" />
                        <p className="font-semibold text-ink/40">No reviews found</p>
                    </div>
                ) : (
                    filtered.map((review) => {
                        const cfg = STATUS_CONFIG[review.status];
                        const StatusIcon = cfg.icon;
                        return (
                            <div
                                key={review.id}
                                className="bg-white rounded-2xl border border-aviation-100 shadow-soft p-4 md:p-5 hover:shadow-md transition-shadow"
                            >
                                <div className="flex flex-col md:flex-row gap-4">
                                    {/* Review Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-3 mb-2">
                                            {/* Stars */}
                                            <div className="flex gap-0.5">
                                                {[1,2,3,4,5].map((s) => (
                                                    <Star
                                                        key={s}
                                                        className={`h-4 w-4 ${s <= review.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`}
                                                    />
                                                ))}
                                            </div>
                                            {/* Status badge */}
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${cfg.color}`}>
                                                <StatusIcon className="h-3 w-3" />
                                                {cfg.label}
                                            </span>
                                            <span className="text-xs text-ink/40">{getTimeAgo(review.submittedAt)}</span>
                                        </div>

                                        <p className="text-sm text-ink/80 leading-relaxed mb-3 line-clamp-2">
                                            "{review.quote}"
                                        </p>

                                        <div className="flex flex-wrap gap-4 text-xs text-ink/50">
                                            <span className="flex items-center gap-1">
                                                <User className="h-3.5 w-3.5" />
                                                {review.studentName} · {review.role}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <BookOpen className="h-3.5 w-3.5" />
                                                {review.courseName}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex md:flex-col items-center gap-2 shrink-0">
                                        <button
                                            onClick={() => setSelected(review)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-aviation-100 text-aviation-600 hover:bg-aviation-50 text-xs font-bold transition-colors"
                                        >
                                            <Eye className="h-3.5 w-3.5" />
                                            Preview
                                        </button>

                                        {review.status === "pending" && (
                                            <>
                                                <button
                                                    onClick={() => handleApprove(review)}
                                                    disabled={!!processing}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors disabled:opacity-60"
                                                >
                                                    <CheckCircle className="h-3.5 w-3.5" />
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleReject(review)}
                                                    disabled={!!processing}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors disabled:opacity-60"
                                                >
                                                    <XCircle className="h-3.5 w-3.5" />
                                                    Reject
                                                </button>
                                            </>
                                        )}

                                        {review.status === "approved" && (
                                            <button
                                                onClick={() => handleReject(review)}
                                                disabled={!!processing}
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors disabled:opacity-60"
                                            >
                                                <XCircle className="h-3.5 w-3.5" />
                                                Reject
                                            </button>
                                        )}

                                        {review.status === "rejected" && (
                                            <button
                                                onClick={() => handleApprove(review)}
                                                disabled={!!processing}
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors disabled:opacity-60"
                                            >
                                                <CheckCircle className="h-3.5 w-3.5" />
                                                Approve
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Preview Modal */}
            {selected && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                    onClick={() => setSelected(null)}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between">
                            <h3 className="text-lg font-bold text-ink">Review Preview</h3>
                            <button
                                onClick={() => setSelected(null)}
                                className="text-ink/40 hover:text-ink"
                            >
                                <XCircle className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="flex gap-0.5 mb-1">
                            {[1,2,3,4,5].map((s) => (
                                <Star
                                    key={s}
                                    className={`h-5 w-5 ${s <= selected.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`}
                                />
                            ))}
                        </div>

                        <p className="text-sm leading-relaxed text-ink/80">"{selected.quote}"</p>

                        <div className="flex items-center gap-3 pt-3 border-t border-aviation-50">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-aviation-600 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">
                                {selected.studentName.split(" ").map(p => p[0]).join("").slice(0,2).toUpperCase()}
                            </div>
                            <div>
                                <p className="font-bold text-ink text-sm">{selected.studentName}</p>
                                <p className="text-xs text-ink/60">{selected.role} · {selected.courseName}</p>
                            </div>
                        </div>

                        {selected.status === "pending" && (
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => handleApprove(selected)}
                                    disabled={!!processing}
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-sm transition-colors disabled:opacity-60"
                                >
                                    Approve & Publish
                                </button>
                                <button
                                    onClick={() => handleReject(selected)}
                                    disabled={!!processing}
                                    className="flex-1 border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold py-2.5 rounded-xl text-sm transition-colors disabled:opacity-60"
                                >
                                    Reject
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
