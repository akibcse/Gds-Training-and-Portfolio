"use client";

import { useState, useCallback, useEffect } from "react";
import type { ProfileRecord } from "@/lib/admin-data";
import { getFirebaseAuth } from "@/lib/firebase";
import { Globe, Save, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function PublicProfilePage() {
    const [profile, setProfile] = useState<ProfileRecord | null>(null);
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

    const fetchProfile = useCallback(async () => {
        try {
            const headers = await getAuthHeader();
            const response = await fetch("/api/admin/about", { headers });
            if (response.ok) {
                const data = await response.json();
                setProfile(data.profile);
            }
        } catch {
            setMessage({ type: "error", text: "Failed to fetch public profile" });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile) return;
        setSaving(true);
        setMessage(null);

        try {
            const headers = { "Content-Type": "application/json", ...(await getAuthHeader()) };
            // Get portfolio profile to preserve it
            const getRes = await fetch("/api/admin/about", { headers });
            const currentData = await getRes.json();

            const response = await fetch("/api/admin/about", {
                method: "PUT",
                headers,
                body: JSON.stringify({
                    profile,
                    portfolioProfile: currentData.portfolioProfile
                })
            });

            if (response.ok) {
                setMessage({ type: "success", text: "Public Profile updated successfully!" });
            } else {
                setMessage({ type: "error", text: "Failed to save profile changes." });
            }
        } catch {
            setMessage({ type: "error", text: "Network error occurred while saving." });
        } finally {
            setSaving(false);
        }
    };

    if (loading || !profile) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-aviation-600" />
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-4xl space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-ink tracking-tight flex items-center gap-3">
                        <Globe className="h-8 w-8 text-aviation-600" />
                        Public Website Profile
                    </h1>
                    <p className="mt-1 text-ink/50 text-sm">
                        Manage global site information, institute brand details, and contact info shown across the website.
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
                {/* Institute & Brand Info */}
                <div className="bg-white rounded-2xl border border-aviation-100 p-6 shadow-soft space-y-5">
                    <h2 className="text-lg font-bold text-ink border-b border-aviation-100 pb-3">
                        Institute & Brand Info
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-ink/60 uppercase mb-1.5">
                                Institute / Academy Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={profile.instituteName || ""}
                                onChange={(e) => setProfile({ ...profile, instituteName: e.target.value })}
                                placeholder="e.g. GDS Training & Aviation Academy"
                                className="w-full px-4 py-2.5 rounded-xl border border-aviation-200 text-sm outline-none focus:border-aviation-600 bg-white"
                                required
                            />
                            <p className="mt-1 text-[11px] text-ink/40">Printed on official E-Certificates & public verification.</p>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-ink/60 uppercase mb-1.5">
                                Full Instructor / Brand Name
                            </label>
                            <input
                                type="text"
                                value={profile.name}
                                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl border border-aviation-200 text-sm outline-none focus:border-aviation-600 bg-white"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-ink/60 uppercase mb-1.5">
                            Tagline / Subheading
                        </label>
                        <input
                            type="text"
                            value={profile.tagline}
                            onChange={(e) => setProfile({ ...profile, tagline: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl border border-aviation-200 text-sm outline-none focus:border-aviation-600 bg-white"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-ink/60 uppercase mb-1.5">
                            Homepage Hero Headline
                        </label>
                        <input
                            type="text"
                            value={profile.headline}
                            onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl border border-aviation-200 text-sm outline-none focus:border-aviation-600 bg-white"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-ink/60 uppercase mb-1.5">
                            Site Description / Summary
                        </label>
                        <textarea
                            rows={3}
                            value={profile.description}
                            onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl border border-aviation-200 text-sm outline-none focus:border-aviation-600 bg-white"
                        />
                    </div>
                </div>

                {/* Contact & Location */}
                <div className="bg-white rounded-2xl border border-aviation-100 p-6 shadow-soft space-y-5">
                    <h2 className="text-lg font-bold text-ink border-b border-aviation-100 pb-3">
                        Contact Details
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-ink/60 uppercase mb-1.5">Phone</label>
                            <input
                                type="text"
                                value={profile.phone}
                                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl border border-aviation-200 text-sm outline-none focus:border-aviation-600 bg-white"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-ink/60 uppercase mb-1.5">Email</label>
                            <input
                                type="email"
                                value={profile.email}
                                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl border border-aviation-200 text-sm outline-none focus:border-aviation-600 bg-white"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-ink/60 uppercase mb-1.5">WhatsApp URL / Number</label>
                            <input
                                type="text"
                                value={profile.whatsapp}
                                onChange={(e) => setProfile({ ...profile, whatsapp: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl border border-aviation-200 text-sm outline-none focus:border-aviation-600 bg-white"
                            />
                        </div>
                    </div>
                </div>

                {/* Statistics & Highlights */}
                <div className="bg-white rounded-2xl border border-aviation-100 p-6 shadow-soft space-y-5">
                    <h2 className="text-lg font-bold text-ink border-b border-aviation-100 pb-3">
                        Key Statistics & Features
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-ink/60 uppercase mb-1.5">Students Trained</label>
                            <input
                                type="number"
                                value={profile.studentsTrained}
                                onChange={(e) => setProfile({ ...profile, studentsTrained: Number(e.target.value) || 0 })}
                                className="w-full px-4 py-2.5 rounded-xl border border-aviation-200 text-sm outline-none focus:border-aviation-600 bg-white"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-ink/60 uppercase mb-1.5">Years Experience</label>
                            <input
                                type="number"
                                value={profile.experienceYears}
                                onChange={(e) => setProfile({ ...profile, experienceYears: Number(e.target.value) || 0 })}
                                className="w-full px-4 py-2.5 rounded-xl border border-aviation-200 text-sm outline-none focus:border-aviation-600 bg-white"
                            />
                        </div>
                        <div className="flex items-center pt-6">
                            <label className="flex items-center gap-2.5 text-sm font-semibold text-ink cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={profile.jobPlacementSupport}
                                    onChange={(e) => setProfile({ ...profile, jobPlacementSupport: e.target.checked })}
                                    className="h-4 w-4 rounded border-aviation-300 text-aviation-600 focus:ring-aviation-500"
                                />
                                Job Placement Support Included
                            </label>
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
                                <Save className="h-4 w-4" /> Save Public Profile
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
