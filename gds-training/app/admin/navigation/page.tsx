"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, MoveVertical, Power, ExternalLink, MoreVertical } from "lucide-react";
import DataTable from "@/components/admin/DataTable";
import ConfirmModal from "@/components/admin/ConfirmModal";
import Toast, { useToast } from "@/components/admin/Toast";

interface NavbarItem {
  id: string;
  label: string;
  url: string;
  order: number;
  isActive: boolean;
}

export default function NavigationPage() {
  const [items, setItems] = useState<NavbarItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NavbarItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<NavbarItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/navbar");
      const data = await res.json();
      setItems(data);
    } catch (error) {
      showToast("Failed to fetch navigation items", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (item: NavbarItem) => {
    try {
      const updated = { ...item, isActive: !item.isActive };
      const res = await fetch(`/api/admin/navbar/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated)
      });
      if (res.ok) {
        setItems(prev => prev.map(i => i.id === item.id ? updated : i));
        showToast(`Item ${updated.isActive ? "activated" : "deactivated"}`, "success");
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
      label: formData.get("label") as string,
      url: formData.get("url") as string,
      order: parseInt(formData.get("order") as string) || 0,
      isActive: true
    };

    try {
      const url = editingItem ? `/api/admin/navbar/${editingItem.id}` : "/api/admin/navbar";
      const method = editingItem ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      if (res.ok) {
        showToast(editingItem ? "Item updated!" : "Item created!", "success");
        setIsModalOpen(false);
        setEditingItem(null);
        fetchItems();
      } else {
        showToast("Failed to save item", "error");
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
      const res = await fetch(`/api/admin/navbar/${isDeleting.id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Item deleted", "success");
        setItems(prev => prev.filter(i => i.id !== isDeleting.id));
        setIsDeleting(null);
      }
    } catch {
      showToast("Failed to delete item", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const columns = [
    {
      header: "Order",
      accessor: (item: NavbarItem) => (
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-aviation-50 text-xs font-bold text-aviation-700">
            {item.order}
          </div>
          <MoveVertical className="h-4 w-4 text-ink/20 cursor-move" />
        </div>
      )
    },
    {
      header: "Label",
      accessor: (item: NavbarItem) => (
        <span className="font-semibold text-ink">{item.label}</span>
      )
    },
    {
      header: "URL",
      accessor: (item: NavbarItem) => (
        <div className="flex items-center gap-2">
          <code>{item.url}</code>
          <Link href={item.url} target="_blank" className="p-1 text-ink/20 hover:text-aviation-600 transition-colors">
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      )
    },
    {
      header: "Status",
      accessor: (item: NavbarItem) => (
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
          <h1 className="text-3xl font-bold text-ink tracking-tight">Navigation</h1>
          <p className="mt-1 text-ink/50">Manage your website's primary navigation menu.</p>
        </div>
        <button
          onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 rounded-2xl bg-aviation-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-aviation-600/20 transition-all hover:brightness-105 active:scale-95"
        >
          <Plus className="h-5 w-5" />
          Add Item
        </button>
      </div>

      <DataTable
        data={items}
        columns={columns}
        loading={loading}
        onEdit={(item) => { setEditingItem(item); setIsModalOpen(true); }}
        onDelete={(item) => setIsDeleting(item)}
        searchPlaceholder="Filter navigation items..."
      />

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
            <h2 className="text-2xl font-bold text-ink">{editingItem ? "Edit Navigation Item" : "New Navigation Item"}</h2>
            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-ink/60 px-1">Label Name</label>
                <input
                  name="label"
                  defaultValue={editingItem?.label}
                  required
                  placeholder="e.g. Home, Courses, Blog"
                  className="h-12 w-full rounded-2xl border border-aviation-100 bg-aviation-50/30 px-4 text-sm focus:border-aviation-300 focus:outline-none focus:ring-4 focus:ring-aviation-500/10 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-ink/60 px-1">Navigation URL</label>
                <input
                  name="url"
                  defaultValue={editingItem?.url}
                  required
                  placeholder="e.g. /, /courses, /blog"
                  className="h-12 w-full rounded-2xl border border-aviation-100 bg-aviation-50/30 px-4 text-sm focus:border-aviation-300 focus:outline-none focus:ring-4 focus:ring-aviation-500/10 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-ink/60 px-1">Display Order</label>
                <input
                  name="order"
                  type="number"
                  defaultValue={editingItem?.order ?? items.length + 1}
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
                  {isSaving ? "Saving..." : editingItem ? "Update Item" : "Create Item"}
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
        title="Delete Navigation Item"
        message={`Are you sure you want to delete "${isDeleting?.label}"? This action cannot be undone and will remove the link from your website's navigation bar.`}
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
