"use client";

import { useEffect, useState } from "react";
import { Sliders, Plus, Image as ImageIcon, Link as LinkIcon, Trash2, Edit3, MoveUp, MoveDown } from "lucide-react";
import DataTable from "@/components/admin/DataTable";
import ConfirmModal from "@/components/admin/ConfirmModal";
import Toast, { useToast } from "@/components/admin/Toast";
import type { HeroSlide } from "@/lib/cms/slider";

export default function AdminHeroSliderPage() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [isDeleting, setIsDeleting] = useState<HeroSlide | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [bgImageUrl, setBgImageUrl] = useState("");
  const [ctaText, setCtaText] = useState("Explore Courses");
  const [ctaLink, setCtaLink] = useState("/courses");
  const [badgeText, setBadgeText] = useState("Batch Admission Open");
  const [displayOrder, setDisplayOrder] = useState(1);

  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/slider");
      const data = await res.json();
      setSlides(data);
    } catch {
      showToast("Failed to fetch hero slides", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (slide?: HeroSlide) => {
    if (slide) {
      setEditingSlide(slide);
      setTitle(slide.title);
      setSubtitle(slide.subtitle);
      setBgImageUrl(slide.bgImageUrl);
      setCtaText(slide.ctaText);
      setCtaLink(slide.ctaLink);
      setBadgeText(slide.badgeText || "");
      setDisplayOrder(slide.displayOrder || 1);
    } else {
      setEditingSlide(null);
      setTitle("");
      setSubtitle("");
      setBgImageUrl("https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1600&q=80");
      setCtaText("Explore Courses");
      setCtaLink("/courses");
      setBadgeText("Admission Open");
      setDisplayOrder(slides.length + 1);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const payload: Partial<HeroSlide> = {
      title,
      subtitle,
      bgImageUrl,
      ctaText,
      ctaLink,
      badgeText,
      displayOrder: Number(displayOrder)
    };

    try {
      const url = editingSlide ? `/api/admin/slider/${editingSlide.id}` : "/api/admin/slider";
      const method = editingSlide ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showToast(editingSlide ? "Hero slide updated!" : "Hero slide created!", "success");
        setIsModalOpen(false);
        setEditingSlide(null);
        fetchSlides();
      } else {
        showToast("Failed to save slide", "error");
      }
    } catch {
      showToast("An error occurred", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!isDeleting) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/slider/${isDeleting.id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Slide deleted", "success");
        setSlides((prev) => prev.filter((s) => s.id !== isDeleting.id));
        setIsDeleting(null);
      }
    } catch {
      showToast("Failed to delete slide", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const columns = [
    {
      header: "Slide Preview & Title",
      accessor: (s: HeroSlide) => (
        <div className="flex items-center gap-3">
          <img src={s.bgImageUrl} alt={s.title} className="h-12 w-20 rounded-xl object-cover border border-slate-200 shrink-0" />
          <div>
            <p className="font-bold text-ink">{s.title}</p>
            <p className="text-xs text-slate-400 line-clamp-1">{s.subtitle}</p>
          </div>
        </div>
      )
    },
    {
      header: "Badge & CTA",
      accessor: (s: HeroSlide) => (
        <div>
          <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full inline-block mb-1">
            {s.badgeText || "Badge"}
          </span>
          <p className="text-xs text-blue-600 font-bold">{s.ctaText} → ({s.ctaLink})</p>
        </div>
      )
    },
    {
      header: "Sort Order",
      accessor: (s: HeroSlide) => (
        <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border">
          Order #{s.displayOrder || 1}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-ink tracking-tight flex items-center gap-3">
            <Sliders className="h-8 w-8 text-aviation-600" /> Hero Slider Manager
          </h1>
          <p className="mt-1 text-ink/50">Manage homepage hero background slides, headlines, CTAs, and promotional badges.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 rounded-2xl bg-aviation-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-aviation-600/20 hover:brightness-105"
        >
          <Plus className="h-5 w-5" />
          Add Slide
        </button>
      </div>

      <DataTable
        data={slides}
        columns={columns}
        loading={loading}
        onEdit={(item) => handleOpenModal(item)}
        onDelete={(item) => setIsDeleting(item)}
        searchPlaceholder="Search slides by title or badge..."
      />

      {/* Edit/Add Slide Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative w-full max-w-xl rounded-3xl bg-white p-8 shadow-2xl z-10 animate-in fade-in zoom-in duration-200">
            <h2 className="text-2xl font-bold text-ink">{editingSlide ? "Edit Hero Slide" : "New Hero Slide"}</h2>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Headline Title *</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="Master Amadeus & Sabre GDS Systems in Dhaka"
                  className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm font-semibold outline-none focus:border-aviation-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Subheading Description</label>
                <textarea
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  rows={3}
                  placeholder="Subheading text..."
                  className="w-full rounded-2xl border border-slate-200 p-4 text-sm font-medium outline-none focus:border-aviation-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Background Image URL *</label>
                <input
                  value={bgImageUrl}
                  onChange={(e) => setBgImageUrl(e.target.value)}
                  required
                  placeholder="https://images.unsplash.com/..."
                  className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm font-mono outline-none focus:border-aviation-500"
                />
                {bgImageUrl && <img src={bgImageUrl} alt="Preview" className="h-24 w-full object-cover rounded-xl mt-2 border" />}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">CTA Button Text</label>
                  <input
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    placeholder="Explore Courses"
                    className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm font-semibold outline-none focus:border-aviation-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">CTA Destination Link</label>
                  <input
                    value={ctaLink}
                    onChange={(e) => setCtaLink(e.target.value)}
                    placeholder="/courses"
                    className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm font-semibold outline-none focus:border-aviation-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Promotional Badge Text</label>
                  <input
                    value={badgeText}
                    onChange={(e) => setBadgeText(e.target.value)}
                    placeholder="Admission Open 2026"
                    className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm font-semibold outline-none focus:border-aviation-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Display Sort Order</label>
                  <input
                    type="number"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(Number(e.target.value))}
                    className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm font-bold text-slate-800 outline-none focus:border-aviation-500"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 rounded-2xl border border-slate-200 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50">
                  Cancel
                </button>
                <button type="submit" disabled={isSaving} className="flex-1 rounded-2xl bg-aviation-600 py-3 text-sm font-bold text-white shadow-lg shadow-aviation-600/20 hover:brightness-105 disabled:opacity-50">
                  {isSaving ? "Saving..." : editingSlide ? "Update Slide" : "Create Slide"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!isDeleting}
        onClose={() => setIsDeleting(null)}
        onConfirm={handleDelete}
        isLoading={isSaving}
        title="Delete Hero Slide"
        message={`Are you sure you want to delete slide "${isDeleting?.title}"?`}
      />

      {/* Toast Notification */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  );
}
