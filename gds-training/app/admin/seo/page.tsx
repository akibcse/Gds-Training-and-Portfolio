"use client";

import { useEffect, useState } from "react";
import { Globe, Shield, Search, Save, History, FileSearch } from "lucide-react";
import Toast, { useToast } from "@/components/admin/Toast";

interface GlobalSeo {
    siteUrl: string;
    siteName: string;
    defaultTitle: string;
    titleTemplate: string;
    defaultDescription: string;
    defaultKeywords: string[];
    defaultOgImage: string;
    twitterHandle: string;
    googleVerification: string;
    bingVerification: string;
}

interface PageSeo {
    slug: string;
    title: string;
    description: string;
    keywords: string[];
    ogImage: string;
    jsonLd: string;
}

export default function SeoPage() {
    const [globalSeo, setGlobalSeo] = useState<GlobalSeo | null>(null);
    const [pageSeo, setPageSeo] = useState<PageSeo | null>(null);
    const [activeTab, setActiveTab] = useState<"global" | "pages">("global");
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [searchSlug, setSearchSlug] = useState("");

    const { toast, showToast, hideToast } = useToast();

    useEffect(() => {
        fetchGlobalSeo();
    }, []);

    const fetchGlobalSeo = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/admin/seo");
            const data = await res.json();
            setGlobalSeo(data);
        } catch {
            showToast("Failed to fetch global SEO", "error");
        } finally {
            setLoading(false);
        }
    };

    const fetchPageSeo = async (slug: string) => {
        try {
            setLoading(true);
            const res = await fetch(`/api/admin/seo?slug=${encodeURIComponent(slug)}`);
            const data = await res.json();
            setPageSeo(data.slug ? data : { slug, title: "", description: "", keywords: [], ogImage: "", jsonLd: "" });
        } catch {
            showToast("Failed to fetch page SEO", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleGlobalSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSaving(true);
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        // Handle keywords array
        const keywords = (data.defaultKeywords as string).split(",").map(k => k.trim()).filter(Boolean);

        try {
            const res = await fetch("/api/admin/seo", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...data, defaultKeywords: keywords })
            });
            if (res.ok) {
                showToast("Global SEO updated!", "success");
            }
        } catch {
            showToast("Failed to save SEO", "error");
        } finally {
            setIsSaving(false);
        }
    };

    const handlePageSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!pageSeo?.slug) return;
        setIsSaving(true);
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        const keywords = (data.keywords as string).split(",").map(k => k.trim()).filter(Boolean);

        try {
            const res = await fetch("/api/admin/seo", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...data, slug: pageSeo.slug, keywords })
            });
            if (res.ok) {
                showToast("Page SEO updated!", "success");
            }
        } catch {
            showToast("Failed to save page SEO", "error");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading && !globalSeo) {
        return <div className="space-y-6 animate-pulse">
            <div className="h-10 w-48 bg-aviation-100 rounded-xl"></div>
            <div className="h-[500px] w-full bg-white border border-aviation-50 rounded-3xl"></div>
        </div>;
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-ink tracking-tight">SEO Manager</h1>
                <p className="mt-1 text-ink/50">Optimize your website's visibility across search engines.</p>
            </div>

            <div className="flex gap-1 rounded-2xl bg-aviation-50/50 p-1 w-fit">
                <button
                    onClick={() => setActiveTab("global")}
                    className={`flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold transition-all ${activeTab === "global" ? "bg-white text-aviation-600 shadow-soft" : "text-ink/40 hover:text-ink/60"}`}
                >
                    <Globe className="h-4 w-4" /> Global Settings
                </button>
                <button
                    onClick={() => setActiveTab("pages")}
                    className={`flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold transition-all ${activeTab === "pages" ? "bg-white text-aviation-600 shadow-soft" : "text-ink/40 hover:text-ink/60"}`}
                >
                    <FileSearch className="h-4 w-4" /> Page-Level SEO
                </button>
            </div>

            <div className="rounded-3xl border border-aviation-100 bg-white p-8 shadow-soft">
                {activeTab === "global" ? (
                    <form onSubmit={handleGlobalSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                            <div className="space-y-6">
                                <h3 className="text-lg font-bold text-ink flex items-center gap-2 border-b border-aviation-50 pb-2">
                                    <History className="h-4 w-4 text-aviation-600" /> Basic Metadata
                                </h3>
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-ink/50 uppercase tracking-wider ml-1">Site Name</label>
                                        <input name="siteName" defaultValue={globalSeo?.siteName} className="h-12 w-full rounded-2xl border border-aviation-100 bg-aviation-50/30 px-4 text-sm focus:border-aviation-300 focus:ring-4 focus:ring-aviation-500/5 outline-none transition-all" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-ink/50 uppercase tracking-wider ml-1">Site URL</label>
                                        <input name="siteUrl" defaultValue={globalSeo?.siteUrl} className="h-12 w-full rounded-2xl border border-aviation-100 bg-aviation-50/30 px-4 text-sm focus:border-aviation-300 focus:ring-4 focus:ring-aviation-500/5 outline-none transition-all" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-ink/50 uppercase tracking-wider ml-1">Default Title</label>
                                        <input name="defaultTitle" defaultValue={globalSeo?.defaultTitle} className="h-12 w-full rounded-2xl border border-aviation-100 bg-aviation-50/30 px-4 text-sm focus:border-aviation-300 focus:ring-4 focus:ring-aviation-500/5 outline-none transition-all" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-ink/50 uppercase tracking-wider ml-1">Title Template</label>
                                        <input name="titleTemplate" defaultValue={globalSeo?.titleTemplate} placeholder="%s | Site Name" className="h-12 w-full rounded-2xl border border-aviation-100 bg-aviation-50/30 px-4 text-sm focus:border-aviation-300 focus:ring-4 focus:ring-aviation-500/5 outline-none transition-all" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-lg font-bold text-ink flex items-center gap-2 border-b border-aviation-50 pb-2">
                                    <Search className="h-4 w-4 text-aviation-600" /> Search & Social
                                </h3>
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-ink/50 uppercase tracking-wider ml-1">Default Description</label>
                                        <textarea name="defaultDescription" defaultValue={globalSeo?.defaultDescription} rows={3} className="w-full rounded-2xl border border-aviation-100 bg-aviation-50/30 p-4 text-sm focus:border-aviation-300 focus:ring-4 focus:ring-aviation-500/5 outline-none transition-all resize-none" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-ink/50 uppercase tracking-wider ml-1">Default Keywords (Comma separated)</label>
                                        <input name="defaultKeywords" defaultValue={globalSeo?.defaultKeywords?.join(", ")} className="h-12 w-full rounded-2xl border border-aviation-100 bg-aviation-50/30 px-4 text-sm focus:border-aviation-300 focus:ring-4 focus:ring-aviation-500/5 outline-none transition-all" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-ink/50 uppercase tracking-wider ml-1">Twitter Handle</label>
                                        <input name="twitterHandle" defaultValue={globalSeo?.twitterHandle} placeholder="@username" className="h-12 w-full rounded-2xl border border-aviation-100 bg-aviation-50/30 px-4 text-sm focus:border-aviation-300 focus:ring-4 focus:ring-aviation-500/5 outline-none transition-all" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6 md:col-span-2">
                                <h3 className="text-lg font-bold text-ink flex items-center gap-2 border-b border-aviation-50 pb-2">
                                    <Shield className="h-4 w-4 text-aviation-600" /> Webmaster Verification
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-ink/50 uppercase tracking-wider ml-1">Google Verification Code</label>
                                        <input name="googleVerification" defaultValue={globalSeo?.googleVerification} className="h-12 w-full rounded-2xl border border-aviation-100 bg-aviation-50/30 px-4 text-sm focus:border-aviation-300 focus:ring-4 focus:ring-aviation-500/5 outline-none transition-all" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-ink/50 uppercase tracking-wider ml-1">Bing Verification Code</label>
                                        <input name="bingVerification" defaultValue={globalSeo?.bingVerification} className="h-12 w-full rounded-2xl border border-aviation-100 bg-aviation-50/30 px-4 text-sm focus:border-aviation-300 focus:ring-4 focus:ring-aviation-500/5 outline-none transition-all" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-6 border-t border-aviation-50">
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="flex items-center gap-2 rounded-2xl bg-aviation-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-aviation-600/20 transition-all hover:brightness-105 active:scale-95 disabled:opacity-50"
                            >
                                <Save className="h-5 w-5" /> {isSaving ? "Saving..." : "Save Global Settings"}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="space-y-8">
                        <div className="flex items-end gap-4 max-w-lg">
                            <div className="flex-1 space-y-1.5">
                                <label className="text-xs font-bold text-ink/50 uppercase tracking-wider ml-1">Enter Page Slug</label>
                                <input
                                    value={searchSlug}
                                    onChange={(e) => setSearchSlug(e.target.value)}
                                    placeholder="e.g. courses/web-design"
                                    className="h-12 w-full rounded-2xl border border-aviation-100 bg-aviation-50/30 px-4 text-sm outline-none transition-all focus:border-aviation-300"
                                />
                            </div>
                            <button
                                onClick={() => fetchPageSeo(searchSlug)}
                                className="h-12 rounded-2xl bg-aviation-100 px-6 text-sm font-bold text-aviation-700 hover:bg-aviation-200 transition-all active:scale-95"
                            >
                                Load Page
                            </button>
                        </div>

                        {pageSeo && (
                            <form onSubmit={handlePageSubmit} className="space-y-6 pt-8 border-t border-aviation-50 transition-all animate-in fade-in slide-in-from-top-4">
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-ink/50 uppercase tracking-wider ml-1">Meta Title</label>
                                        <input name="title" defaultValue={pageSeo.title} className="h-12 w-full rounded-2xl border border-aviation-100 bg-aviation-50/30 px-4 text-sm focus:border-aviation-300 outline-none transition-all" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-ink/50 uppercase tracking-wider ml-1">Keywords</label>
                                        <input name="keywords" defaultValue={pageSeo.keywords?.join(", ")} className="h-12 w-full rounded-2xl border border-aviation-100 bg-aviation-50/30 px-4 text-sm focus:border-aviation-300 outline-none transition-all" />
                                    </div>
                                    <div className="space-y-1.5 md:col-span-2">
                                        <label className="text-xs font-bold text-ink/50 uppercase tracking-wider ml-1">Meta Description</label>
                                        <textarea name="description" defaultValue={pageSeo.description} rows={3} className="w-full rounded-2xl border border-aviation-100 bg-aviation-50/30 p-4 text-sm focus:border-aviation-300 outline-none transition-all resize-none" />
                                    </div>
                                    <div className="space-y-1.5 md:col-span-2">
                                        <label className="text-xs font-bold text-ink/50 uppercase tracking-wider ml-1">JSON-LD Structured Data (LD+JSON)</label>
                                        <textarea name="jsonLd" defaultValue={pageSeo.jsonLd} rows={5} placeholder='{ "@context": "https://schema.org", ... }' className="w-full rounded-2xl border border-aviation-100 bg-aviation-50/30 p-4 text-sm font-mono focus:border-aviation-300 outline-none transition-all resize-none" />
                                    </div>
                                </div>
                                <div className="flex justify-end pt-4">
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="flex items-center gap-2 rounded-2xl bg-aviation-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-aviation-600/20 transition-all hover:brightness-105 active:scale-95 disabled:opacity-50"
                                    >
                                        <Save className="h-5 w-5" /> {isSaving ? "Saving..." : "Save Page SEO"}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                )}
            </div>

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={hideToast}
                />
            )}
        </div>
    );
}
