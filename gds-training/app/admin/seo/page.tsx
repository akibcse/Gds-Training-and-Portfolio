"use client";

import { useCallback, useEffect, useState } from "react";
import { getFirebaseAuth } from "@/lib/firebase";

type SeoGlobal = {
  siteUrl: string;
  siteName: string;
  defaultTitle: string;
  titleTemplate: string;
  defaultDescription: string;
  defaultKeywords: string[];
  twitterHandle: string;
  locale: string;
  defaultOgImage?: string;
  twitterCard?: "summary" | "summary_large_image";
  googleVerification?: string;
  bingVerification?: string;
};

type SeoPageEntry = {
  pageKey: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  structuredDataOn?: boolean;
};

const DEFAULT_GLOBAL: SeoGlobal = {
  siteUrl: "https://gds-training.vercel.app",
  siteName: "GDS Training Bangladesh",
  defaultTitle: "GDS Training in Bangladesh | Amadeus, Sabre & Travelport Certification",
  titleTemplate: "%s | GDS Training Bangladesh",
  defaultDescription:
    "Join practical GDS Training in Bangladesh. Learn Amadeus, Sabre, and Travelport for airline careers with certified instructors, labs, and placement support.",
  defaultKeywords: ["GDS Training in Bangladesh"],
  twitterHandle: "@roadyakib",
  locale: "en_US",
  twitterCard: "summary_large_image"
};

const makeBlankPage = (): SeoPageEntry => ({
  pageKey: "",
  metaTitle: "",
  metaDescription: "",
  keywords: [],
  canonicalUrl: "",
  ogTitle: "",
  ogDescription: "",
  structuredDataOn: true
});

export default function AdminSeoPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [global, setGlobal] = useState<SeoGlobal>(DEFAULT_GLOBAL);
  const [pages, setPages] = useState<SeoPageEntry[]>([]);

  const getAuthHeader = useCallback(async (): Promise<Record<string, string>> => {
    const auth = getFirebaseAuth();
    const user = auth?.currentUser;
    if (!user) {
      return {};
    }

    const token = await user.getIdToken();
    return { Authorization: `Bearer ${token}` };
  }, []);

  const loadSeo = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const headers: Record<string, string> = await getAuthHeader();
      const res = await fetch("/api/admin/seo", { headers });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to load SEO data");
        return;
      }

      const data = (await res.json()) as { global?: SeoGlobal; pages?: SeoPageEntry[] };
      setGlobal(data.global || DEFAULT_GLOBAL);
      setPages(data.pages || []);
    } catch {
      setError("Failed to load SEO data");
    } finally {
      setLoading(false);
    }
  }, [getAuthHeader]);

  useEffect(() => {
    loadSeo();
  }, [loadSeo]);

  const updatePage = (index: number, patch: Partial<SeoPageEntry>) => {
    setPages((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const addPage = () => setPages((prev) => [...prev, makeBlankPage()]);
  const removePage = (index: number) => setPages((prev) => prev.filter((_, i) => i !== index));

  const save = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(await getAuthHeader())
      };

      const payload = {
        global: {
          ...global,
          defaultKeywords: global.defaultKeywords.filter(Boolean)
        },
        pages: pages.map((item) => ({
          ...item,
          pageKey: item.pageKey.trim(),
          metaTitle: item.metaTitle.trim(),
          metaDescription: item.metaDescription.trim(),
          keywords: item.keywords.filter(Boolean),
          canonicalUrl: item.canonicalUrl?.trim() || "",
          ogTitle: item.ogTitle?.trim() || "",
          ogDescription: item.ogDescription?.trim() || "",
          structuredDataOn: item.structuredDataOn ?? true
        }))
      };

      const res = await fetch("/api/admin/seo", {
        method: "PUT",
        headers,
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to save SEO data");
        return;
      }

      setSuccess("SEO settings updated successfully.");
    } catch {
      setError("Failed to save SEO data");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-sm text-ink/70">Loading SEO settings...</div>;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-ink">SEO Management</h2>
        <button
          onClick={save}
          disabled={saving}
          className="rounded-full bg-gradient-to-r from-aviation-600 to-cyan-500 px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save SEO"}
        </button>
      </div>

      {error ? <div className="rounded-lg bg-red-100 p-3 text-sm text-red-700">{error}</div> : null}
      {success ? <div className="rounded-lg bg-green-100 p-3 text-sm text-green-700">{success}</div> : null}

      <section className="grid gap-4 rounded-2xl border border-aviation-100 bg-white p-5 md:grid-cols-2">
        <h3 className="md:col-span-2 text-lg font-semibold text-ink">Global SEO</h3>

        <label className="text-sm text-ink/80">
          Site URL
          <input
            className="mt-1 w-full rounded-lg border border-aviation-200 px-3 py-2"
            value={global.siteUrl}
            onChange={(e) => setGlobal((p) => ({ ...p, siteUrl: e.target.value }))}
          />
        </label>
        <label className="text-sm text-ink/80">
          Site Name
          <input
            className="mt-1 w-full rounded-lg border border-aviation-200 px-3 py-2"
            value={global.siteName}
            onChange={(e) => setGlobal((p) => ({ ...p, siteName: e.target.value }))}
          />
        </label>
        <label className="text-sm text-ink/80">
          Default Title
          <input
            className="mt-1 w-full rounded-lg border border-aviation-200 px-3 py-2"
            value={global.defaultTitle}
            onChange={(e) => setGlobal((p) => ({ ...p, defaultTitle: e.target.value }))}
          />
        </label>
        <label className="text-sm text-ink/80">
          Title Template
          <input
            className="mt-1 w-full rounded-lg border border-aviation-200 px-3 py-2"
            value={global.titleTemplate}
            onChange={(e) => setGlobal((p) => ({ ...p, titleTemplate: e.target.value }))}
          />
        </label>
        <label className="md:col-span-2 text-sm text-ink/80">
          Default Description
          <textarea
            className="mt-1 w-full rounded-lg border border-aviation-200 px-3 py-2"
            rows={3}
            value={global.defaultDescription}
            onChange={(e) => setGlobal((p) => ({ ...p, defaultDescription: e.target.value }))}
          />
        </label>
        <label className="md:col-span-2 text-sm text-ink/80">
          Default Keywords (comma separated)
          <input
            className="mt-1 w-full rounded-lg border border-aviation-200 px-3 py-2"
            value={global.defaultKeywords.join(", ")}
            onChange={(e) =>
              setGlobal((p) => ({
                ...p,
                defaultKeywords: e.target.value.split(",").map((x) => x.trim()).filter(Boolean)
              }))
            }
          />
        </label>
      </section>

      <section className="space-y-3 rounded-2xl border border-aviation-100 bg-white p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-ink">Page SEO Overrides</h3>
          <button onClick={addPage} className="rounded-full border border-aviation-200 px-4 py-1.5 text-sm text-ink">
            + Add Page
          </button>
        </div>

        {pages.map((row, index) => (
          <article key={`seo-page-${index}`} className="space-y-3 rounded-lg border border-aviation-100 p-4">
            <div className="grid gap-3 md:grid-cols-2">
              <label className="text-sm text-ink/80">
                Page Key
                <input
                  className="mt-1 w-full rounded-lg border border-aviation-200 px-3 py-2"
                  value={row.pageKey}
                  onChange={(e) => updatePage(index, { pageKey: e.target.value })}
                  placeholder="home, courses, contact"
                />
              </label>
              <label className="text-sm text-ink/80">
                Meta Title
                <input
                  className="mt-1 w-full rounded-lg border border-aviation-200 px-3 py-2"
                  value={row.metaTitle}
                  onChange={(e) => updatePage(index, { metaTitle: e.target.value })}
                />
              </label>
              <label className="md:col-span-2 text-sm text-ink/80">
                Meta Description
                <textarea
                  className="mt-1 w-full rounded-lg border border-aviation-200 px-3 py-2"
                  rows={2}
                  value={row.metaDescription}
                  onChange={(e) => updatePage(index, { metaDescription: e.target.value })}
                />
              </label>
              <label className="md:col-span-2 text-sm text-ink/80">
                Keywords (comma separated)
                <input
                  className="mt-1 w-full rounded-lg border border-aviation-200 px-3 py-2"
                  value={row.keywords.join(", ")}
                  onChange={(e) =>
                    updatePage(index, {
                      keywords: e.target.value.split(",").map((x) => x.trim()).filter(Boolean)
                    })
                  }
                />
              </label>
            </div>
            <div className="flex justify-end">
              <button onClick={() => removePage(index)} className="rounded-lg border border-red-200 px-3 py-1 text-sm text-red-600">
                Remove
              </button>
            </div>
          </article>
        ))}

        {pages.length === 0 ? <p className="text-sm text-ink/60">No page overrides yet.</p> : null}
      </section>
    </div>
  );
}
