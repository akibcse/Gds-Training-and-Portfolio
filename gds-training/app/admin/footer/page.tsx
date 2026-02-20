"use client";

import { useEffect, useState } from "react";
import { Plus, Power, List, AlignLeft } from "lucide-react";
import DataTable from "@/components/admin/DataTable";
import ConfirmModal from "@/components/admin/ConfirmModal";
import Toast, { useToast } from "@/components/admin/Toast";

interface FooterSection {
  id: string;
  title: string;
  content: string;
  order: number;
  isActive: boolean;
}

export default function FooterPage() {
  const [sections, setSections] = useState<FooterSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<FooterSection | null>(null);
  const [isDeleting, setIsDeleting] = useState<FooterSection | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/footer");
      const data = await res.json();
      setSections(data);
    } catch (error) {
      showToast("Failed to fetch footer sections", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (section: FooterSection) => {
    try {
      const updated = { ...section, isActive: !section.isActive };
      const res = await fetch(`/api/admin/footer/${section.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated)
      });
      if (res.ok) {
        setSections(prev => prev.map(s => s.id === section.id ? updated : s));
        showToast(`Section ${updated.isActive ? "activated" : "deactivated"}`, "success");
      }
    } catch {
      showToast("Failed to update status", "error");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title") as string,
      content: formData.get("content") as string,
      order: parseInt(formData.get("order") as string) || 0,
      isActive: true
    };

    try {
      const url = editingSection ? `/api/admin/footer/${editingSection.id}` : "/api/admin/footer";
      const method = editingSection ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      if (res.ok) {
        showToast(editingSection ? "Section updated!" : "Section created!", "success");
        setIsModalOpen(false);
        setEditingSection(null);
        fetchSections();
      } else {
        showToast("Failed to save section", "error");
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
      const res = await fetch(`/api/admin/footer/${isDeleting.id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Section deleted", "success");
        setSections(prev => prev.filter(s => s.id !== isDeleting.id));
        setIsDeleting(null);
      }
    } catch {
      showToast("Failed to delete section", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const columns = [
    {
      header: "Order",
      accessor: (item: FooterSection) => (
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-aviation-50 text-xs font-bold text-aviation-700">
          {item.order}
        </div>
      )
    },
    {
      header: "Title",
      accessor: (item: FooterSection) => (
        <span className="font-semibold text-ink">{item.title}</span>
      )
    },
    {
      header: "Content Preview",
      accessor: (item: FooterSection) => (
        <span className="text-ink/40 text-xs truncate max-w-[200px] block">
          {item.content || "(No content)"}
        </span>
      )
    },
    {
      header: "Status",
      accessor: (item: FooterSection) => (
        <button
          onClick={() => handleToggleActive(item)}
          className={`group flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold transition-all ${item.isActive
              ? "bg-green-50 text-green-600 ring-1 ring-inset ring-green-600/20"
              : "bg-ink/5 text-ink/40 ring-1 ring-inset ring-ink/10"
            }`}
        >
          <Power className={`h-3 w-3 ${item.isActive ? "text-green-600" : "text-ink/20"}`} />
          {item.isActive ? "Active" : "Inactive"}
        </button>
      )
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-ink tracking-tight">Footer Sections</h1>
          <p className="mt-1 text-ink/50">Manage the multi-column footer layout of your website.</p>
        </div>
        <button
          onClick={() => { setEditingSection(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 rounded-2xl bg-aviation-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-aviation-600/20 transition-all hover:brightness-105 active:scale-95"
        >
          <Plus className="h-5 w-5" />
          Add Section
        </button>
      </div>

      <DataTable
        data={sections}
        columns={columns}
        loading={loading}
        onEdit={(item) => { setEditingSection(item); setIsModalOpen(true); }}
        onDelete={(item) => setIsDeleting(item)}
        searchPlaceholder="Filter footer sections..."
      />

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative w-full max-w-2xl rounded-3xl bg-white p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
            <h2 className="text-2xl font-bold text-ink">{editingSection ? "Edit Section" : "New Section"}</h2>
            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-ink/60 px-1">Column Title</label>
                <input
                  name="title"
                  defaultValue={editingSection?.title}
                  required
                  placeholder="e.g. Quick Links, About Us, Contact"
                  className="h-12 w-full rounded-2xl border border-aviation-100 bg-aviation-50/30 px-4 text-sm focus:border-aviation-300 focus:outline-none focus:ring-4 focus:ring-aviation-500/10 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-ink/60 px-1 flex items-center gap-2">
                  Content (HTML Supported)
                  <AlignLeft className="h-3 w-3 opacity-40" />
                </label>
                <textarea
                  name="content"
                  defaultValue={editingSection?.content}
                  placeholder="Enter content or HTML snippet..."
                  rows={6}
                  className="w-full rounded-2xl border border-aviation-100 bg-aviation-50/30 p-4 text-sm focus:border-aviation-300 focus:outline-none focus:ring-4 focus:ring-aviation-500/10 transition-all resize-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-ink/60 px-1">Display Order</label>
                <input
                  name="order"
                  type="number"
                  defaultValue={editingSection?.order ?? sections.length + 1}
                  required
                  className="h-12 w-full rounded-2xl border border-aviation-100 bg-aviation-50/30 px-4 text-sm focus:border-aviation-300 focus:outline-none focus:ring-4 focus:ring-aviation-500/10 transition-all"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 rounded-2xl border border-aviation-100 py-3 text-sm font-bold text-ink hover:bg-aviation-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 rounded-2xl bg-aviation-600 py-3 text-sm font-bold text-white shadow-lg shadow-aviation-600/20 transition-all hover:brightness-105 disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : editingSection ? "Update Section" : "Create Section"}
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
        title="Delete Footer Section"
        message={`Are you sure you want to delete the "${isDeleting?.title}" section? This will remove the entire column from the website footer.`}
      />

      {/* Toast Notification */}
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
