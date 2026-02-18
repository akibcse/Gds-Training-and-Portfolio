"use client";

import { useState } from "react";
import { useFooter, type FooterSection } from "@/lib/hooks/useFooter";

export default function AdminFooterPage() {
  const { sections, loading, error, addSection, updateSection, deleteSection } = useFooter();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [editingSection, setEditingSection] = useState<FooterSection | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", order: 0, isActive: true });

  const resetForm = () => {
    setForm({ title: "", content: "", order: sections.length + 1, isActive: true });
    setEditingSection(null);
    setIsAdding(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      if (editingSection) {
        await updateSection(editingSection.id, form);
        setMessage("Footer section updated.");
      } else {
        await addSection(form);
        setMessage("Footer section added.");
      }

      resetForm();
    } catch (submitError) {
      setMessage(submitError instanceof Error ? submitError.message : "Failed to save section.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (section: FooterSection) => {
    setEditingSection(section);
    setForm({
      title: section.title,
      content: section.content,
      order: section.order,
      isActive: section.isActive
    });
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this footer section?")) {
      return;
    }

    setSaving(true);
    setMessage("");
    try {
      await deleteSection(id);
      setMessage("Footer section deleted.");
    } catch {
      setMessage("Failed to delete section.");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (section: FooterSection) => {
    setSaving(true);
    setMessage("");
    try {
      await updateSection(section.id, { isActive: !section.isActive });
    } catch {
      setMessage("Failed to change status.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-sm text-ink/70">Loading footer sections...</div>;
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-ink">Footer Manager</h2>
        <button
          onClick={() => {
            setIsAdding(true);
            setEditingSection(null);
            setForm({ title: "", content: "", order: sections.length + 1, isActive: true });
          }}
          className="rounded-lg bg-aviation-600 px-4 py-2 text-white hover:bg-aviation-700"
        >
          Add Section
        </button>
      </div>

      {error ? <div className="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-700">{error}</div> : null}
      {message ? <div className="mb-4 rounded-lg bg-aviation-50 p-3 text-sm text-aviation-700">{message}</div> : null}

      {isAdding ? (
        <form onSubmit={handleSubmit} className="mb-6 rounded-xl border border-aviation-200 bg-white p-4">
          <h3 className="mb-4 text-lg font-semibold text-ink">{editingSection ? "Edit Section" : "Add New Section"}</h3>
          <div className="grid gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Title</label>
              <input
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                className="w-full rounded-lg border border-aviation-200 px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Content (HTML supported)</label>
              <textarea
                value={form.content}
                onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
                className="w-full rounded-lg border border-aviation-200 px-3 py-2"
                rows={5}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
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

      <div className="space-y-4">
        {sections.map((section) => (
          <article key={section.id} className="rounded-xl border border-aviation-200 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-ink">{section.title}</h3>
                <p className="mt-2 text-xs text-ink/50">Order: {section.order}</p>
                <div className="mt-2 rounded border border-aviation-100 bg-slate-50 p-3 text-sm text-ink/80">
                  <div dangerouslySetInnerHTML={{ __html: section.content || "(No content)" }} />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => toggleActive(section)}
                  className={`rounded-lg px-3 py-1 text-xs ${
                    section.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {section.isActive ? "Active" : "Inactive"}
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
          </article>
        ))}
      </div>
    </div>
  );
}
