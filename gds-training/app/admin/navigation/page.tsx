"use client";

import { useState } from "react";
import { useNavbar, type NavbarItem } from "@/lib/hooks/useNavbar";

export default function AdminNavigationPage() {
  const { items, loading, error, addItem, updateItem, deleteItem } = useNavbar();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [editingItem, setEditingItem] = useState<NavbarItem | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({ label: "", url: "", order: 0, isActive: true });

  const resetForm = () => {
    setForm({ label: "", url: "", order: items.length + 1, isActive: true });
    setEditingItem(null);
    setIsAdding(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      if (editingItem) {
        await updateItem(editingItem.id, form);
        setMessage("Navigation item updated.");
      } else {
        await addItem(form);
        setMessage("Navigation item added.");
      }
      resetForm();
    } catch (submitError) {
      setMessage(submitError instanceof Error ? submitError.message : "Failed to save item.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: NavbarItem) => {
    setEditingItem(item);
    setForm({
      label: item.label,
      url: item.url,
      order: item.order,
      isActive: item.isActive
    });
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this navigation item?")) {
      return;
    }

    setSaving(true);
    setMessage("");
    try {
      await deleteItem(id);
      setMessage("Navigation item deleted.");
    } catch {
      setMessage("Failed to delete item.");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (item: NavbarItem) => {
    setSaving(true);
    setMessage("");
    try {
      await updateItem(item.id, { isActive: !item.isActive });
    } catch {
      setMessage("Failed to change status.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-sm text-ink/70">Loading navigation items...</div>;
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-ink">Navigation Manager</h2>
        <button
          onClick={() => {
            setIsAdding(true);
            setEditingItem(null);
            setForm({ label: "", url: "", order: items.length + 1, isActive: true });
          }}
          className="rounded-lg bg-aviation-600 px-4 py-2 text-white hover:bg-aviation-700"
        >
          Add Item
        </button>
      </div>

      {error ? <div className="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-700">{error}</div> : null}
      {message ? <div className="mb-4 rounded-lg bg-aviation-50 p-3 text-sm text-aviation-700">{message}</div> : null}

      {isAdding ? (
        <form onSubmit={handleSubmit} className="mb-6 rounded-xl border border-aviation-200 bg-white p-4">
          <h3 className="mb-4 text-lg font-semibold text-ink">{editingItem ? "Edit Item" : "Add New Item"}</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Label</label>
              <input
                value={form.label}
                onChange={(e) => setForm((prev) => ({ ...prev, label: e.target.value }))}
                className="w-full rounded-lg border border-aviation-200 px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">URL</label>
              <input
                value={form.url}
                onChange={(e) => setForm((prev) => ({ ...prev, url: e.target.value }))}
                className="w-full rounded-lg border border-aviation-200 px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Order</label>
              <input
                type="number"
                value={form.order}
                onChange={(e) => setForm((prev) => ({ ...prev, order: Number(e.target.value) || 0 }))}
                className="w-full rounded-lg border border-aviation-200 px-3 py-2"
              />
            </div>
            <label className="mt-6 flex items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
              />
              Active
            </label>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-aviation-600 px-4 py-2 text-white hover:bg-aviation-700 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg border border-aviation-200 px-4 py-2 text-ink hover:bg-aviation-50"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      <div className="rounded-xl border border-aviation-200 bg-white p-2">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-ink/70">
              <th className="px-3 py-2">Order</th>
              <th className="px-3 py-2">Label</th>
              <th className="px-3 py-2">URL</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t border-aviation-100 text-sm">
                <td className="px-3 py-2">{item.order}</td>
                <td className="px-3 py-2 font-medium text-ink">{item.label}</td>
                <td className="px-3 py-2 text-ink/70">{item.url}</td>
                <td className="px-3 py-2">
                  <button
                    onClick={() => toggleActive(item)}
                    className={`rounded-full px-2 py-1 text-xs ${item.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
                  >
                    {item.isActive ? "Active" : "Inactive"}
                  </button>
                </td>
                <td className="px-3 py-2 text-right">
                  <button onClick={() => handleEdit(item)} className="mr-2 text-aviation-600 hover:text-aviation-800">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800">
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
