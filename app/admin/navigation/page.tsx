"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type NavbarItem = {
  id: string;
  label: string;
  url: string;
  order: number;
  isActive: boolean;
};

export default function AdminNavigationPage() {
  const router = useRouter();
  const [items, setItems] = useState<NavbarItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingItem, setEditingItem] = useState<NavbarItem | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({ label: "", url: "", order: 0, isActive: true });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/admin/leads");
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      fetchItems();
    } catch {
      router.push("/admin/login");
    }
  };

  const fetchItems = async () => {
    try {
      const res = await fetch("/api/admin/navbar");
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const url = editingItem ? "/api/admin/navbar" : "/api/admin/navbar";
      const method = editingItem ? "PATCH" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingItem ? { ...editingItem, ...form } : form)
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to save");
        return;
      }

      setSuccess(editingItem ? "Item updated!" : "Item added!");
      setForm({ label: "", url: "", order: 0, isActive: true });
      setEditingItem(null);
      setIsAdding(false);
      fetchItems();
    } catch {
      setError("An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: NavbarItem) => {
    setEditingItem(item);
    setForm({ label: item.label, url: item.url, order: item.order, isActive: item.isActive });
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/navbar?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setSuccess("Item deleted!");
        fetchItems();
      } else {
        setError("Failed to delete");
      }
    } catch {
      setError("An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (item: NavbarItem) => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/navbar", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...item, isActive: !item.isActive })
      });
      if (res.ok) {
        fetchItems();
      }
    } catch {
      setError("Failed to update");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink">Navigation Management</h1>
        <button
          onClick={() => { setIsAdding(true); setEditingItem(null); setForm({ label: "", url: "", order: items.length + 1, isActive: true }); }}
          className="rounded-lg bg-aviation-600 px-4 py-2 text-white hover:bg-aviation-700"
        >
          Add New Item
        </button>
      </div>

      {error && <div className="mb-4 rounded-lg bg-red-100 p-3 text-red-700">{error}</div>}
      {success && <div className="mb-4 rounded-lg bg-green-100 p-3 text-green-700">{success}</div>}

      {isAdding && (
        <form onSubmit={handleSubmit} className="mb-6 rounded-xl border border-aviation-200 bg-white p-4">
          <h2 className="mb-4 text-lg font-semibold">{editingItem ? "Edit Item" : "Add New Item"}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Label</label>
              <input
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                className="w-full rounded-lg border border-aviation-200 px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">URL</label>
              <input
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                className="w-full rounded-lg border border-aviation-200 px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Order</label>
              <input
                type="number"
                value={form.order}
                onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
                className="w-full rounded-lg border border-aviation-200 px-3 py-2"
              />
            </div>
            <div className="flex items-center">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="h-4 w-4 rounded border-aviation-300"
                />
                <span className="text-sm text-ink">Active</span>
              </label>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-aviation-600 px-4 py-2 text-white hover:bg-aviation-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={() => { setIsAdding(false); setEditingItem(null); }}
              className="rounded-lg border border-aviation-200 px-4 py-2 text-ink hover:bg-aviation-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="rounded-xl border border-aviation-200 bg-white overflow-hidden">
        <table className="w-full">
          <thead className="bg-aviation-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-ink">Order</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-ink">Label</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-ink">URL</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-ink">Status</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-ink">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t border-aviation-100">
                <td className="px-4 py-3 text-sm text-ink">{item.order}</td>
                <td className="px-4 py-3 text-sm font-medium text-ink">{item.label}</td>
                <td className="px-4 py-3 text-sm text-ink/70">{item.url}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleToggleActive(item)}
                    className={`rounded-full px-2 py-1 text-xs font-semibold ${item.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
                  >
                    {item.isActive ? "Active" : "Inactive"}
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleEdit(item)}
                    className="mr-2 text-aviation-600 hover:text-aviation-800"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
