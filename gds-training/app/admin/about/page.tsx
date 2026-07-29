"use client";

import { useState, useCallback, useEffect } from "react";
import type { PortfolioProfileRecord } from "@/lib/admin-data";
import { getFirebaseAuth } from "@/lib/firebase";
import {
    User,
    Save,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Plus,
    Trash2,
    Briefcase,
    GraduationCap,
    Award,
    Sparkles,
    Image as ImageIcon
} from "lucide-react";

export default function AboutMdAkibHasanPage() {
    const [portfolio, setPortfolio] = useState<PortfolioProfileRecord | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const getAuthHeader = async (): Promise<Record<string, string>> => {
        const auth = getFirebaseAuth();
        const user = auth?.currentUser;
        if (user) {
            const token = await user.getIdToken();
            return { Authorization: `Bearer ${token}` };
        }
        return {};
    };

    const fetchAboutData = useCallback(async () => {
        try {
            const headers = await getAuthHeader();
            const response = await fetch("/api/admin/about", { headers });
            if (response.ok) {
                const data = await response.json();
                setPortfolio(data.portfolioProfile);
            }
        } catch {
            setMessage({ type: "error", text: "Failed to fetch about profile data" });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAboutData();
    }, [fetchAboutData]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!portfolio) return;
        setSaving(true);
        setMessage(null);

        try {
            const headers = { "Content-Type": "application/json", ...(await getAuthHeader()) };
            // Get public profile to preserve it
            const getRes = await fetch("/api/admin/about", { headers });
            const currentData = await getRes.json();

            const response = await fetch("/api/admin/about", {
                method: "PUT",
                headers,
                body: JSON.stringify({
                    profile: currentData.profile,
                    portfolioProfile: portfolio
                })
            });

            if (response.ok) {
                setMessage({ type: "success", text: "About profile saved successfully!" });
            } else {
                setMessage({ type: "error", text: "Failed to save profile changes." });
            }
        } catch {
            setMessage({ type: "error", text: "Network error occurred while saving." });
        } finally {
            setSaving(false);
        }
    };

    if (loading || !portfolio) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-aviation-600" />
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-5xl space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-ink tracking-tight flex items-center gap-3">
                        <User className="h-8 w-8 text-aviation-600" />
                        About
                    </h1>
                    <p className="mt-1 text-ink/50 text-sm">
                        Manage detailed instructor profile, career summary, experience, education, qualifications, and skills.
                    </p>
                </div>
            </div>

            {message && (
                <div
                    className={`flex items-center gap-3 p-4 rounded-xl text-sm font-semibold border ${
                        message.type === "success"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : "bg-rose-50 text-rose-800 border-rose-200"
                    }`}
                >
                    {message.type === "success" ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                    ) : (
                        <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
                    )}
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSave} className="space-y-6">
                {/* 1. Basic Bio & Contact */}
                <div className="bg-white rounded-2xl border border-aviation-100 p-6 shadow-soft space-y-5">
                    <h2 className="text-lg font-bold text-ink border-b border-aviation-100 pb-3 flex items-center gap-2">
                        <User className="h-5 w-5 text-aviation-600" /> Basic Bio & Details
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-ink/60 uppercase mb-1.5">Full Name</label>
                            <input
                                type="text"
                                value={portfolio.fullName}
                                onChange={(e) => setPortfolio({ ...portfolio, fullName: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl border border-aviation-200 text-sm outline-none focus:border-aviation-600 bg-white"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-ink/60 uppercase mb-1.5">Location</label>
                            <input
                                type="text"
                                value={portfolio.location}
                                onChange={(e) => setPortfolio({ ...portfolio, location: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl border border-aviation-200 text-sm outline-none focus:border-aviation-600 bg-white"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-ink/60 uppercase mb-1.5">Phone Number</label>
                            <input
                                type="text"
                                value={portfolio.phones[0] || ""}
                                onChange={(e) => setPortfolio({ ...portfolio, phones: [e.target.value] })}
                                className="w-full px-4 py-2.5 rounded-xl border border-aviation-200 text-sm outline-none focus:border-aviation-600 bg-white"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-ink/60 uppercase mb-1.5">Email Address</label>
                            <input
                                type="email"
                                value={portfolio.email}
                                onChange={(e) => setPortfolio({ ...portfolio, email: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl border border-aviation-200 text-sm outline-none focus:border-aviation-600 bg-white"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-ink/60 uppercase mb-1.5">Profile Image URL</label>
                        <div className="flex gap-3 items-center">
                            <input
                                type="text"
                                value={portfolio.profileImage}
                                onChange={(e) => setPortfolio({ ...portfolio, profileImage: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl border border-aviation-200 text-sm outline-none focus:border-aviation-600 bg-white"
                            />
                            {portfolio.profileImage && (
                                <img
                                    src={portfolio.profileImage}
                                    alt="Preview"
                                    className="h-10 w-10 rounded-full object-cover border border-aviation-200 shrink-0"
                                />
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-ink/60 uppercase mb-1.5">About Md Akib Hasan (Biography)</label>
                        <textarea
                            rows={3}
                            value={portfolio.careerObjective}
                            onChange={(e) => setPortfolio({ ...portfolio, careerObjective: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl border border-aviation-200 text-sm outline-none focus:border-aviation-600 bg-white"
                            placeholder="Certified GDS Instructor and aviation professional..."
                        />
                    </div>
                </div>

                {/* 2. Special Qualification */}
                <div className="bg-white rounded-2xl border border-aviation-100 p-6 shadow-soft space-y-5">
                    <h2 className="text-lg font-bold text-ink border-b border-aviation-100 pb-3 flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-amber-500" /> Special Qualification
                    </h2>

                    <div>
                        <textarea
                            rows={3}
                            value={portfolio.specialQualification}
                            onChange={(e) => setPortfolio({ ...portfolio, specialQualification: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl border border-aviation-200 text-sm outline-none focus:border-aviation-600 bg-white"
                            placeholder="Certified GDS instructor with hands-on experience in airline reservation systems..."
                        />
                    </div>
                </div>

                {/* 3. Career Summary Points */}
                <div className="bg-white rounded-2xl border border-aviation-100 p-6 shadow-soft space-y-5">
                    <div className="flex items-center justify-between border-b border-aviation-100 pb-3">
                        <h2 className="text-lg font-bold text-ink flex items-center gap-2">
                            <Briefcase className="h-5 w-5 text-aviation-600" /> Career Summary ({portfolio.careerSummary.length} points)
                        </h2>
                        <button
                            type="button"
                            onClick={() => setPortfolio({ ...portfolio, careerSummary: [...portfolio.careerSummary, ""] })}
                            className="flex items-center gap-1 text-xs font-bold text-aviation-700 bg-aviation-50 hover:bg-aviation-100 px-3 py-1.5 rounded-lg transition-colors"
                        >
                            <Plus className="h-3.5 w-3.5" /> Add Point
                        </button>
                    </div>

                    <div className="space-y-3">
                        {portfolio.careerSummary.map((point, index) => (
                            <div key={index} className="flex gap-2 items-center">
                                <input
                                    type="text"
                                    value={point}
                                    onChange={(e) => {
                                        const next = [...portfolio.careerSummary];
                                        next[index] = e.target.value;
                                        setPortfolio({ ...portfolio, careerSummary: next });
                                    }}
                                    placeholder={`Career summary point ${index + 1}`}
                                    className="w-full px-4 py-2 rounded-xl border border-aviation-200 text-sm outline-none focus:border-aviation-600 bg-white"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        const next = portfolio.careerSummary.filter((_, i) => i !== index);
                                        setPortfolio({ ...portfolio, careerSummary: next });
                                    }}
                                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 4. Professional Experience */}
                <div className="bg-white rounded-2xl border border-aviation-100 p-6 shadow-soft space-y-5">
                    <div className="flex items-center justify-between border-b border-aviation-100 pb-3">
                        <h2 className="text-lg font-bold text-ink flex items-center gap-2">
                            <Briefcase className="h-5 w-5 text-emerald-600" /> Experience ({portfolio.experience.length} roles)
                        </h2>
                        <button
                            type="button"
                            onClick={() =>
                                setPortfolio({
                                    ...portfolio,
                                    experience: [
                                        ...portfolio.experience,
                                        { title: "", organization: "", location: "Dhaka", duration: "", years: "", highlights: [""] }
                                    ]
                                })
                            }
                            className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors"
                        >
                            <Plus className="h-3.5 w-3.5" /> Add Experience Role
                        </button>
                    </div>

                    <div className="space-y-6">
                        {portfolio.experience.map((job, jIndex) => (
                            <div key={jIndex} className="p-4 rounded-xl border border-aviation-100 bg-slate-50/50 space-y-3 relative">
                                <button
                                    type="button"
                                    onClick={() => {
                                        const next = portfolio.experience.filter((_, i) => i !== jIndex);
                                        setPortfolio({ ...portfolio, experience: next });
                                    }}
                                    className="absolute top-4 right-4 text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1"
                                >
                                    <Trash2 className="h-3.5 w-3.5" /> Remove Role
                                </button>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-24">
                                    <div>
                                        <label className="block text-xs font-semibold text-ink/60 mb-1">Title / Role</label>
                                        <input
                                            type="text"
                                            value={job.title}
                                            onChange={(e) => {
                                                const next = [...portfolio.experience];
                                                next[jIndex].title = e.target.value;
                                                setPortfolio({ ...portfolio, experience: next });
                                            }}
                                            placeholder="e.g. Executive Admin, Instructor"
                                            className="w-full px-3.5 py-2 rounded-lg border border-aviation-200 text-sm bg-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-ink/60 mb-1">Organization / Company</label>
                                        <input
                                            type="text"
                                            value={job.organization}
                                            onChange={(e) => {
                                                const next = [...portfolio.experience];
                                                next[jIndex].organization = e.target.value;
                                                setPortfolio({ ...portfolio, experience: next });
                                            }}
                                            placeholder="e.g. ATTI - ATAB"
                                            className="w-full px-3.5 py-2 rounded-lg border border-aviation-200 text-sm bg-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-ink/60 mb-1">Location</label>
                                        <input
                                            type="text"
                                            value={job.location}
                                            onChange={(e) => {
                                                const next = [...portfolio.experience];
                                                next[jIndex].location = e.target.value;
                                                setPortfolio({ ...portfolio, experience: next });
                                            }}
                                            placeholder="e.g. Dhaka"
                                            className="w-full px-3.5 py-2 rounded-lg border border-aviation-200 text-sm bg-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-ink/60 mb-1">Duration / Years</label>
                                        <input
                                            type="text"
                                            value={job.duration}
                                            onChange={(e) => {
                                                const next = [...portfolio.experience];
                                                next[jIndex].duration = e.target.value;
                                                next[jIndex].years = e.target.value;
                                                setPortfolio({ ...portfolio, experience: next });
                                            }}
                                            placeholder="e.g. 3.3 Years"
                                            className="w-full px-3.5 py-2 rounded-lg border border-aviation-200 text-sm bg-white"
                                        />
                                    </div>
                                </div>

                                {/* Role Highlights */}
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className="text-xs font-bold text-ink/70">Job Responsibilities & Highlights</label>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const next = [...portfolio.experience];
                                                next[jIndex].highlights = [...(next[jIndex].highlights || []), ""];
                                                setPortfolio({ ...portfolio, experience: next });
                                            }}
                                            className="text-[11px] font-bold text-aviation-600 hover:underline"
                                        >
                                            + Add Highlight
                                        </button>
                                    </div>

                                    <div className="space-y-2">
                                        {(job.highlights || []).map((hl, hIndex) => (
                                            <div key={hIndex} className="flex gap-2 items-center">
                                                <input
                                                    type="text"
                                                    value={hl}
                                                    onChange={(e) => {
                                                        const next = [...portfolio.experience];
                                                        next[jIndex].highlights[hIndex] = e.target.value;
                                                        setPortfolio({ ...portfolio, experience: next });
                                                    }}
                                                    placeholder={`Highlight ${hIndex + 1}`}
                                                    className="w-full px-3 py-1.5 rounded-lg border border-aviation-200 text-xs bg-white"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const next = [...portfolio.experience];
                                                        next[jIndex].highlights = next[jIndex].highlights.filter((_, i) => i !== hIndex);
                                                        setPortfolio({ ...portfolio, experience: next });
                                                    }}
                                                    className="p-1 text-rose-500 hover:bg-rose-50 rounded shrink-0"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 5. Education */}
                <div className="bg-white rounded-2xl border border-aviation-100 p-6 shadow-soft space-y-5">
                    <div className="flex items-center justify-between border-b border-aviation-100 pb-3">
                        <h2 className="text-lg font-bold text-ink flex items-center gap-2">
                            <GraduationCap className="h-5 w-5 text-indigo-600" /> Education ({portfolio.education.length} degrees)
                        </h2>
                        <button
                            type="button"
                            onClick={() =>
                                setPortfolio({
                                    ...portfolio,
                                    education: [...portfolio.education, { exam: "", institute: "", result: "", year: "" }]
                                })
                            }
                            className="flex items-center gap-1 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
                        >
                            <Plus className="h-3.5 w-3.5" /> Add Degree
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {portfolio.education.map((edu, eIndex) => (
                            <div key={eIndex} className="p-4 rounded-xl border border-aviation-100 bg-slate-50/50 space-y-2 relative">
                                <button
                                    type="button"
                                    onClick={() => {
                                        const next = portfolio.education.filter((_, i) => i !== eIndex);
                                        setPortfolio({ ...portfolio, education: next });
                                    }}
                                    className="absolute top-2 right-2 text-rose-500 hover:bg-rose-50 p-1 rounded"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>

                                <div>
                                    <label className="block text-[11px] font-semibold text-ink/60 mb-0.5">Exam / Degree</label>
                                    <input
                                        type="text"
                                        value={edu.exam}
                                        onChange={(e) => {
                                            const next = [...portfolio.education];
                                            next[eIndex].exam = e.target.value;
                                            setPortfolio({ ...portfolio, education: next });
                                        }}
                                        placeholder="e.g. BSc, HSC, SSC"
                                        className="w-full px-3 py-1.5 rounded-lg border border-aviation-200 text-xs bg-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-semibold text-ink/60 mb-0.5">Institute</label>
                                    <input
                                        type="text"
                                        value={edu.institute}
                                        onChange={(e) => {
                                            const next = [...portfolio.education];
                                            next[eIndex].institute = e.target.value;
                                            setPortfolio({ ...portfolio, education: next });
                                        }}
                                        placeholder="e.g. Eastern University"
                                        className="w-full px-3 py-1.5 rounded-lg border border-aviation-200 text-xs bg-white"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-[10px] font-semibold text-ink/60 mb-0.5">Result</label>
                                        <input
                                            type="text"
                                            value={edu.result}
                                            onChange={(e) => {
                                                const next = [...portfolio.education];
                                                next[eIndex].result = e.target.value;
                                                setPortfolio({ ...portfolio, education: next });
                                            }}
                                            placeholder="Optional"
                                            className="w-full px-2.5 py-1 rounded-lg border border-aviation-200 text-xs bg-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-semibold text-ink/60 mb-0.5">Year</label>
                                        <input
                                            type="text"
                                            value={edu.year}
                                            onChange={(e) => {
                                                const next = [...portfolio.education];
                                                next[eIndex].year = e.target.value;
                                                setPortfolio({ ...portfolio, education: next });
                                            }}
                                            placeholder="Optional"
                                            className="w-full px-2.5 py-1 rounded-lg border border-aviation-200 text-xs bg-white"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 6. Training & Professional Qualifications */}
                <div className="bg-white rounded-2xl border border-aviation-100 p-6 shadow-soft space-y-5">
                    <div className="flex items-center justify-between border-b border-aviation-100 pb-3">
                        <h2 className="text-lg font-bold text-ink flex items-center gap-2">
                            <Award className="h-5 w-5 text-amber-600" /> Training & Professional Qualifications ({portfolio.trainings.length})
                        </h2>
                        <button
                            type="button"
                            onClick={() => setPortfolio({ ...portfolio, trainings: [...portfolio.trainings, ""] })}
                            className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition-colors"
                        >
                            <Plus className="h-3.5 w-3.5" /> Add Training
                        </button>
                    </div>

                    <div className="space-y-3">
                        {portfolio.trainings.map((tr, tIndex) => (
                            <div key={tIndex} className="flex gap-2 items-center">
                                <input
                                    type="text"
                                    value={tr}
                                    onChange={(e) => {
                                        const next = [...portfolio.trainings];
                                        next[tIndex] = e.target.value;
                                        setPortfolio({ ...portfolio, trainings: next });
                                    }}
                                    placeholder={`Training program ${tIndex + 1}`}
                                    className="w-full px-4 py-2 rounded-xl border border-aviation-200 text-sm outline-none focus:border-aviation-600 bg-white"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        const next = portfolio.trainings.filter((_, i) => i !== tIndex);
                                        setPortfolio({ ...portfolio, trainings: next });
                                    }}
                                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 7. Skills */}
                <div className="bg-white rounded-2xl border border-aviation-100 p-6 shadow-soft space-y-5">
                    <div className="flex items-center justify-between border-b border-aviation-100 pb-3">
                        <h2 className="text-lg font-bold text-ink flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-cyan-600" /> Skills ({portfolio.skills.length})
                        </h2>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-ink/60 uppercase mb-1.5">
                            Skills List (Comma Separated)
                        </label>
                        <input
                            type="text"
                            value={portfolio.skills.join(", ")}
                            onChange={(e) => {
                                const list = e.target.value.split(",").map((s) => s.trim()).filter(Boolean);
                                setPortfolio({ ...portfolio, skills: list });
                            }}
                            placeholder="Air Ticketing, Sabre, Galileo, GDS Training, PNR Creation..."
                            className="w-full px-4 py-2.5 rounded-xl border border-aviation-200 text-sm outline-none focus:border-aviation-600 bg-white"
                        />
                        <div className="flex flex-wrap gap-2 mt-3">
                            {portfolio.skills.map((sk, index) => (
                                <span key={index} className="inline-flex items-center gap-1 rounded-full bg-aviation-100 text-aviation-800 text-xs font-bold px-3 py-1">
                                    {sk}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 bg-aviation-600 hover:bg-aviation-700 text-white font-bold px-8 py-3 rounded-2xl shadow-lg transition-all disabled:opacity-50 active:scale-95"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" /> Saving Changes...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4" /> Save About Details
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
