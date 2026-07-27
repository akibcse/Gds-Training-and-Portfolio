"use client";

import { useEffect, useState } from "react";
import { Image as ImageIcon, Plus, Trash2, Edit3, Tag } from "lucide-react";
import DataTable from "@/components/admin/DataTable";
import ConfirmModal from "@/components/admin/ConfirmModal";
import Toast, { useToast } from "@/components/admin/Toast";
import type { GalleryItem } from "@/lib/cms/gallery";

export default function AdminGalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<GalleryItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Classroom");
  const [imageUrl, setImageUrl] = useState("");
  const [caption, setCaption] = useState("");

  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/gallery");
      const data = await res.json();
      setItems(data);
    } catch {
      showToast("Failed to fetch gallery items", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (item?: GalleryItem) => {
    if (item) {
      setEditingItem(item);
      setTitle(item.title);
      setCategory(item.category || "Classroom");
      setImageUrl(item.imageUrl);
      setCaption(item.caption || "");
    } else {
      setEditingItem(null);
      setTitle("");
      setCategory("Classroom");
      setImageUrl("https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80");
      setCaption("");
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const payload: Partial<GalleryItem> = {
      title,
      category,
      imageUrl,
      caption
    };

    try {
      const url = editingItem ? `/api/admin/gallery/${editingItem.id}` : "/api/admin/gallery";
      const method = editingItem ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showToast(editingItem ? "Gallery photo updated!" : "Photo added to gallery!", "success");
        setIsModalOpen(false);
        setEditingItem(null);
        fetchGallery();
      } else {
        showToast("Failed to save gallery item", "error");
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
      const res = await fetch(`/api/admin/gallery/${isDeleting.id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Photo removed from gallery", "success");
        setItems((prev) => prev.filter((i) => i.id !== isDeleting.id));
        setIsDeleting(null);
      }
    } catch {
      showToast("Failed to delete gallery photo", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const columns = [
    {
      header: "Photo Preview & Title",
      accessor: (item: GalleryItem) => (
        <div className="flex items-center gap-3">
          <img src={item.imageUrl} alt={item.title} className="h-14 w-14 rounded-xl object-cover border border-slate-200 shrink-0" />
          <div>
            <p className="font-bold text-ink">{item.title}</p>
            <p className="text-xs text-slate-400 line-clamp-1">{item.caption || "No caption"}</p>
          </div>
        </div>
      )
    },
    {
      header: "Category",
      accessor: (item: GalleryItem) => (
        <span className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full text-xs font-bold uppercase">
          {item.category || "Classroom"}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-ink tracking-tight flex items-center gap-3">
            <ImageIcon className="h-8 w-8 text-aviation-600" /> Image Gallery Manager
          </h1>
          <p className="mt-1 text-ink/50">Manage classroom, workshop, event, and certificate photo showcases.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 rounded-2xl bg-aviation-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-aviation-600/20 hover:brightness-105"
        >
          <Plus className="h-5 w-5" />
          Add Photo
        </button>
      </div>

      <DataTable
        data={items}
        columns={columns}
        loading={loading}
        onEdit={(item) => handleOpenModal(item)}
        onDelete={(item) => setIsDeleting(item)}
        searchPlaceholder="Search gallery photos by title or category..."
      />

      {/* Edit/Add Gallery Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl z-10 animate-in fade-in zoom-in duration-200">
            <h2 className="text-2xl font-bold text-ink">{editingItem ? "Edit Gallery Photo" : "Add Gallery Photo"}</h2>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Photo Title *</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="Interactive GDS Computer Lab Training"
                  className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm font-semibold outline-none focus:border-aviation-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm font-bold bg-white outline-none focus:border-aviation-500"
                >
                  <option value="Classroom">Classroom & Labs</option>
                  <option value="Workshops">Workshops & Seminars</option>
                  <option value="Certifications">Certifications & Graduation</option>
                  <option value="Events">Institute Events</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Image URL *</label>
                <input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  required
                  placeholder="https://images.unsplash.com/..."
                  className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm font-mono outline-none focus:border-aviation-500"
                />
                {imageUrl && <img src={imageUrl} alt="Preview" className="h-32 w-full object-cover rounded-xl mt-2 border" />}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Caption / Description</label>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  rows={2}
                  placeholder="Short photo description..."
                  className="w-full rounded-2xl border border-slate-200 p-4 text-sm outline-none focus:border-aviation-500"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 rounded-2xl border border-slate-200 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50">
                  Cancel
                </button>
                <button type="submit" disabled={isSaving} className="flex-1 rounded-2xl bg-aviation-600 py-3 text-sm font-bold text-white shadow-lg shadow-aviation-600/20 hover:brightness-105 disabled:opacity-50">
                  {isSaving ? "Saving..." : editingItem ? "Save Changes" : "Add Photo"}
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
        title="Delete Gallery Photo"
        message={`Are you sure you want to delete photo "${isDeleting?.title}"?`}
      />

      {/* Toast Notification */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  );
}
