"use client";

import { useState, useCallback, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { AnimatePresence, motion } from "framer-motion";
import type { PortfolioProject } from "@/lib/admin-data";
import { getFirebaseAuth } from "@/lib/firebase";

type Toast = { id: string; type: "success" | "error"; message: string };

const slugify = (value: string) =>
    value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

const isValidUrl = (value: string) => {
    if (!value) return true;
    try {
        new URL(value);
        return true;
    } catch {
        return false;
    }
};

function ToastContainer({ toasts, remove }: { toasts: Toast[]; remove: (id: string) => void }) {
    return (
        <div className="fixed right-4 top-4 z-50 flex flex-col gap-2">
            <AnimatePresence>
                {toasts.map((toast) => (
                    <motion.div
                        key={toast.id}
                        initial={{ opacity: 0, x: 50, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 50, scale: 0.9 }}
                        className={`min-w-[280px] rounded-lg px-4 py-3 text-sm font-medium shadow-lg ${toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
                            }`}
                    >
                        <div className="flex items-center justify-between gap-3">
                            <span>{toast.message}</span>
                            <button onClick={() => remove(toast.id)} className="text-white/80 hover:text-white">
                                ✕
                            </button>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}

function ListEditor({ label, items, onChange, placeholder, required }: any) {
    const handleDragEnd = (result: DropResult) => {
        if (!result.destination) return;
        const newItems = Array.from(items || []);
        const [removed] = newItems.splice(result.source.index, 1);
        newItems.splice(result.destination.index, 0, removed);
        onChange(newItems);
    };

    const updateItem = (index: number, value: string) => {
        onChange((items || []).map((item: string, i: number) => (i === index ? value : item)));
    };

    const addItem = () => onChange([...(items || []), ""]);
    const removeItem = (index: number) => onChange((items || []).filter((_: any, i: number) => i !== index));

    return (
        <div className="space-y-2 rounded-xl border border-aviation-100 p-3">
            <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-ink/75">
                    {label} {required && <span className="text-red-500">*</span>}
                </p>
                <button
                    type="button"
                    onClick={addItem}
                    className="rounded-full border border-aviation-200 px-3 py-1 text-xs font-semibold text-aviation-700 hover:bg-aviation-50"
                >
                    + Add
                </button>
            </div>
            {(items || []).length === 0 && <p className="text-xs text-ink/60">No items. Click "+ Add" to create.</p>}
            <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId={`list-${label}`}>
                    {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                            {(items || []).map((item: string, index: number) => (
                                <Draggable key={`${label}-${index}`} draggableId={`${label}-${index}`} index={index}>
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            className={`flex items-center gap-2 rounded-lg border bg-white p-2 ${snapshot.isDragging ? "border-aviation-500 shadow-lg" : "border-aviation-200"
                                                }`}
                                        >
                                            <div {...provided.dragHandleProps} className="cursor-grab text-ink/40 hover:text-ink/70">
                                                ⋮⋮
                                            </div>
                                            <input
                                                className="w-full rounded border-0 bg-transparent px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-aviation-500"
                                                value={item}
                                                placeholder={placeholder}
                                                onChange={(e) => updateItem(index, e.target.value)}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeItem(index)}
                                                className="rounded-full border border-red-300 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
        </div>
    );
}

function ImagePreview({ value, label }: { value: string; label: string }) {
    const [error, setError] = useState(false);
    if (!value) return null;
    if (!isValidUrl(value)) return <p className="text-xs text-red-500">Invalid URL</p>;
    if (error) return <p className="text-xs text-red-500">Error loading image</p>;

    return (
        <img
            src={value}
            alt={label}
            onError={() => setError(true)}
            className="h-32 w-full rounded-xl border border-aviation-200 object-cover"
        />
    );
}

export default function PortfolioPage() {
    const [projects, setProjects] = useState<PortfolioProject[]>([]);
    const [loading, setLoading] = useState(true);
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [editingId, setEditingId] = useState("");
    const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string } | null>(null);

    const [form, setForm] = useState({
        title: "",
        slug: "",
        category: "",
        description: "",
        caseStudy: "",
        technologies: [] as string[],
        imageUrl: ""
    });

    const addToast = useCallback((type: "success" | "error", message: string) => {
        const id = crypto.randomUUID();
        setToasts((prev) => [...prev, { id, type, message }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3500);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const getAuthHeader = async (): Promise<Record<string, string>> => {
        const auth = getFirebaseAuth();
        const user = auth?.currentUser;
        if (user) {
            const token = await user.getIdToken();
            return { Authorization: `Bearer ${token}` };
        }
        return {};
    };

    const fetchData = useCallback(async () => {
        try {
            const headers = await getAuthHeader();
            const response = await fetch("/api/admin/portfolio", { headers });
            if (response.ok) {
                const data = await response.json();
                setProjects(data.projects || []);
            }
        } catch (error) {
            addToast("error", "Failed to fetch portfolio");
        } finally {
            setLoading(false);
        }
    }, [addToast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const setFormFromRecord = (project: PortfolioProject) => {
        setEditingId(project.id);
        setForm({
            title: project.title || "",
            slug: project.slug || "",
            category: project.category || "",
            description: project.description || "",
            caseStudy: project.caseStudy || "",
            technologies: project.technologies || [],
            imageUrl: project.imageUrl || ""
        });
    };

    const resetForm = () => {
        setEditingId("");
        setForm({
            title: "",
            slug: "",
            category: "",
            description: "",
            caseStudy: "",
            technologies: [],
            imageUrl: ""
        });
    };

    const saveProject = async () => {
        if (!form.title.trim() || !form.slug.trim()) {
            addToast("error", "Title and slug are required");
            return;
        }

        const payload = {
            id: editingId || undefined,
            ...form,
            technologies: form.technologies.map((s) => s.trim()).filter(Boolean)
        };

        const method = editingId ? "PUT" : "POST";
        const headers = { "Content-Type": "application/json", ...(await getAuthHeader()) };
        const response = await fetch("/api/admin/portfolio", {
            method,
            headers,
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            const result = await response.json();
            const saved = result.project;
            setProjects((prev) => {
                if (editingId) {
                    return prev.map((p) => (p.id === saved.id ? saved : p));
                }
                return [saved, ...prev];
            });
            resetForm();
            addToast("success", editingId ? "Project updated" : "Project created");
        } else {
            const data = await response.json();
            addToast("error", data.error || "Failed to save project");
        }
    };

    const deleteProject = async () => {
        if (!deleteConfirm) return;
        const headers = await getAuthHeader();
        const response = await fetch(`/api/admin/portfolio?id=${deleteConfirm.id}`, { method: "DELETE", headers });
        if (response.ok) {
            setProjects((prev) => prev.filter((p) => p.id !== deleteConfirm.id));
            addToast("success", "Project deleted");
        } else {
            addToast("error", "Failed to delete project");
        }
        setDeleteConfirm(null);
    };

    if (loading) {
        return <div className="p-8 text-center text-sm text-ink/70">Loading projects...</div>;
    }

    return (
        <div className="mx-auto max-w-6xl space-y-8 p-6">
            <ToastContainer toasts={toasts} remove={removeToast} />

            {deleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                        <h3 className="text-lg font-semibold">Confirm Delete</h3>
                        <p className="mt-2 text-sm text-ink/70">Are you sure you want to delete "{deleteConfirm.title}"?</p>
                        <div className="mt-6 flex justify-end gap-3">
                            <button onClick={() => setDeleteConfirm(null)} className="rounded-lg border px-4 py-2 text-sm">Cancel</button>
                            <button onClick={deleteProject} className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white">Delete</button>
                        </div>
                    </motion.div>
                </div>
            )}

            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-ink">Portfolio Management</h2>
            </div>

            <article className="space-y-4 rounded-2xl border border-aviation-100 bg-white p-5 shadow-soft">
                <h3 className="text-lg font-semibold">{editingId ? "Edit Project" : "Add New Project"}</h3>
                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <label className="mb-1 block text-xs font-semibold text-ink/70">Title *</label>
                        <input
                            className="w-full rounded-lg border border-aviation-200 px-3 py-2 text-sm"
                            placeholder="Project title"
                            value={form.title}
                            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-semibold text-ink/70">Slug *</label>
                        <div className="flex gap-2">
                            <input
                                className="w-full rounded-lg border border-aviation-200 px-3 py-2 text-sm"
                                placeholder="project-slug"
                                value={form.slug}
                                onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                            />
                            <button onClick={() => setForm((p) => ({ ...p, slug: slugify(p.title) }))} className="rounded-lg border border-aviation-200 px-3 py-2 text-xs">Auto</button>
                        </div>
                    </div>
                    <input className="rounded-lg border border-aviation-200 px-3 py-2 text-sm" placeholder="Category" value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} />
                    <input className="rounded-lg border border-aviation-200 px-3 py-2 text-sm" placeholder="Image URL" value={form.imageUrl} onChange={(e) => setForm((p) => ({ ...p, imageUrl: e.target.value }))} />

                    {form.imageUrl && (
                        <div className="md:col-span-2">
                            <p className="mb-2 text-xs font-semibold text-ink/70">Preview</p>
                            <ImagePreview value={form.imageUrl} label="Project preview" />
                        </div>
                    )}

                    <div className="md:col-span-2">
                        <label className="mb-1 block text-xs font-semibold text-ink/70">Description</label>
                        <textarea
                            className="w-full rounded-lg border border-aviation-200 px-3 py-2 text-sm"
                            rows={3}
                            value={form.description}
                            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="mb-1 block text-xs font-semibold text-ink/70">Case Study</label>
                        <textarea
                            className="w-full rounded-lg border border-aviation-200 px-3 py-2 text-sm"
                            rows={4}
                            value={form.caseStudy}
                            onChange={(e) => setForm((p) => ({ ...p, caseStudy: e.target.value }))}
                        />
                    </div>

                    <div className="md:col-span-2">
                        <ListEditor label="Technologies" items={form.technologies} onChange={(items: any) => setForm((p) => ({ ...p, technologies: items }))} placeholder="Technology name" />
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={saveProject} className="rounded-full bg-gradient-to-r from-aviation-600 to-cyan-500 px-6 py-2.5 text-sm font-semibold text-white">
                        {editingId ? "Update Project" : "Create Project"}
                    </button>
                    {editingId && <button onClick={resetForm} className="rounded-full border px-6 py-2.5 text-sm">Cancel</button>}
                </div>
            </article>

            <section className="space-y-2">
                <h3 className="text-lg font-semibold">Existing Projects</h3>
                {projects.map((project) => (
                    <div key={project.id} className="flex items-center justify-between rounded-lg border bg-aviation-50/20 p-3">
                        <span className="text-sm font-medium">{project.title}</span>
                        <div className="flex gap-2">
                            <button onClick={() => setFormFromRecord(project)} className="rounded-lg border bg-white px-3 py-1 text-xs">Edit</button>
                            <button onClick={() => setDeleteConfirm({ id: project.id, title: project.title })} className="rounded-lg border border-red-200 bg-white px-3 py-1 text-xs text-red-600">Delete</button>
                        </div>
                    </div>
                ))}
            </section>
        </div>
    );
}
