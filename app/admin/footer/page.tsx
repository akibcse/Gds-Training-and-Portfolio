"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type FooterSection = {
  id: string;
  title: string;
  content: string;
  order: number;
  isActive: boolean;
};

export default function AdminFooterPage() {
  const router = useRouter();
  const [sections, setSections] = useState<FooterSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingSection, setEditingSection] = useState<FooterSection | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", order: 0, isActive: true });

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
      fetchSections();
    } catch {
      router.push("/admin/login");
    }
  };

  const fetchSections = async () => {
    try {
      const res = await fetch("/api/admin/footer");
      if (res.ok) {
        const data = await res.json();
        setSections(data);
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
      const url = editingSection ? "/api/admin/footer" : "/api/admin/footer";
      const method = editingSection ? "PATCH" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingSection ? { ...editingSection, ...form } : form)
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to save");
        return;
      }

      setSuccess(editingSection ? "Section updated!" : "Section added!");
      setForm({ title: "", content: "", order: 0, isActive: true });
      setEditingSection(null);
      setIsAdding(false);
      fetchSections();
    } catch {
      setError("An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (section: FooterSection) => {
    setEditingSection(section);
    setForm({ title: section.title, content: section.content, order: section.order, isActive: section.isActive });
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this section?")) return;
    
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/footer?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setSuccess("Section deleted!");
        fetchSections();
      } else {
        setError("Failed to delete");
      }
    } catch {
      setError("An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (section: FooterSection) => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/footer", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...section, isActive: !section.isActive })
      });
      if (res.ok) {
        fetchSections();
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
        <h1 className="text-2xl font-bold text-ink">Footer Management</h1>
        <button
          onClick={() => { setIsAdding(true); setEditingSection(null); setForm({ title: "", content: "", order: sections.length + 1, isActive: true }); }}
          className="rounded-lg bg-aviation-600 px-4 py-2 text-white hover:bg-aviation-700"
        >
          Add New Section
        </button>
      </div>

      {error && <div className="mb-4 rounded-lg bg-red-100 p-3 text-red-700">{error}</div>}
      {success && <div className="mb-4 rounded-lg bg-green-100 p-3 text-green-700">{success}</div>}

      {isAdding && (
        <form onSubmit={handleSubmit} className="mb-6 rounded-xl border border-aviation-200 bg-white p-4">
          <h2 className="mb-4 text-lg font-semibold">{editingSection ? "Edit Section" : "Add New Section"}</h2>
          <div className="grid gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Title</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full rounded-lg border border-aviation-200 px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Content (HTML supported)</label>
              <textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                className="w-full rounded-lg border border-aviation-200 px-3 py-2"
                rows={4}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
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
              onClick={() => { setIsAdding(false); setEditingSection(null); }}
              className="rounded-lg border border-aviation-200 px-4 py-2 text-ink hover:bg-aviation-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {sections.map((section) => (
          <div key={section.id} className="rounded-xl border border-aviation-200 bg-white p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-ink">{section.title}</h3>
                  <span className={`rounded-full px-2 py-1 text-xs font-semibold ${section.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {section.isActive ? "Active" : "Inactive"}
                  </span>
                  <span className="text-xs text-ink/50">Order: {section.order}</span>
                </div>
                <p className="mt-2 text-sm text-ink/70">{section.content || "(No content)"}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleToggleActive(section)}
                  className="rounded-lg border border-aviation-200 px-3 py-1 text-sm text-ink hover:bg-aviation-50"
                >
                  {section.isActive ? "Disable" : "Enable"}
                </button>
                <button
                  onClick={() => handleEdit(section)}
                  className="rounded-lg border border-aviation-200 px-3 py-1 text-sm text-aviation-600 hover:bg-aviation-50"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(section.id)}
                  className="rounded-lg border border-red-200 px-3 py-1 text-sm text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
