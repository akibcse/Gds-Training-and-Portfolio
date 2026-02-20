"use client";

import { useEffect, useState } from "react";
import { Plus, Briefcase, ExternalLink, Tag, Layout } from "lucide-react";
import DataTable from "@/components/admin/DataTable";
import ConfirmModal from "@/components/admin/ConfirmModal";
import Toast, { useToast } from "@/components/admin/Toast";

interface Project {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    category: string;
    imageUrl: string;
    projectUrl: string;
    technologies: string[];
}

export default function PortfolioPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [isDeleting, setIsDeleting] = useState<Project | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const { toast, showToast, hideToast } = useToast();

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/admin/portfolio");
            const data = await res.json();
            setProjects(data);
        } catch {
            showToast("Failed to fetch portfolio projects", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSaving(true);
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        // Handle technologies array
        const technologies = (data.technologies as string).split(",").map(t => t.trim()).filter(Boolean);

        try {
            const url = editingProject ? `/api/admin/portfolio/${editingProject.id}` : "/api/admin/portfolio";
            const method = editingProject ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...data, technologies })
            });

            if (res.ok) {
                showToast(editingProject ? "Project updated!" : "Project added!", "success");
                setIsModalOpen(false);
                setEditingProject(null);
                fetchProjects();
            } else {
                showToast("Failed to save project", "error");
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
            const res = await fetch(`/api/admin/portfolio/${isDeleting.id}`, { method: "DELETE" });
            if (res.ok) {
                showToast("Project deleted", "success");
                setProjects(prev => prev.filter(p => p.id !== isDeleting.id));
                setIsDeleting(null);
            }
        } catch {
            showToast("Failed to delete project", "error");
        } finally {
            setIsSaving(false);
        }
    };

    const columns = [
        {
            header: "Project",
            accessor: (p: Project) => (
                <div className="flex items-center gap-3">
                    <div className="h-10 w-16 rounded-lg bg-amber-50 overflow-hidden relative">
                        {p.imageUrl ? (
                            <img src={p.imageUrl} alt={p.title} className="h-full w-full object-cover" />
                        ) : (
                            <div className="h-full w-full flex items-center justify-center text-amber-600">
                                <Layout className="h-5 w-5" />
                            </div>
                        )}
                    </div>
                    <div>
                        <p className="font-bold text-ink leading-tight">{p.title}</p>
                        <p className="text-xs text-ink/40">/{p.slug}</p>
                    </div>
                </div>
            )
        },
        {
            header: "Category",
            accessor: (p: Project) => (
                <div className="flex items-center gap-2">
                    <Tag className="h-3 w-3 text-aviation-600" />
                    <span className="text-xs font-bold text-ink/60">{p.category}</span>
                </div>
            )
        },
        {
            header: "Technologies",
            accessor: (p: Project) => (
                <div className="flex flex-wrap gap-1 max-w-[200px]">
                    {p.technologies?.slice(0, 3).map((tech, i) => (
                        <span key={i} className="rounded bg-aviation-50 px-1.5 py-0.5 text-[10px] font-bold text-aviation-700">
                            {tech}
                        </span>
                    ))}
                    {(p.technologies?.length ?? 0) > 3 && (
                        <span className="text-[10px] text-ink/40">+{p.technologies.length - 3} more</span>
                    )}
                </div>
            )
        }
    ];

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-ink tracking-tight">Portfolio</h1>
                    <p className="mt-1 text-ink/50">Showcase your best projects and case studies.</p>
                </div>
                <button
                    onClick={() => { setEditingProject(null); setIsModalOpen(true); }}
                    className="flex items-center gap-2 rounded-2xl bg-aviation-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-aviation-600/20 transition-all hover:brightness-105 active:scale-95"
                >
                    <Plus className="h-5 w-5" />
                    Add Project
                </button>
            </div>

            <DataTable
                data={projects}
                columns={columns}
                loading={loading}
                onEdit={(item) => { setEditingProject(item); setIsModalOpen(true); }}
                onDelete={(item) => setIsDeleting(item)}
                searchPlaceholder="Filter projects..."
            />

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                    <div className="relative w-full max-w-2xl rounded-3xl bg-white p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
                        <h2 className="text-2xl font-bold text-ink">{editingProject ? "Edit Project" : "New Portfolio Project"}</h2>
                        <form onSubmit={handleSubmit} className="mt-8 grid grid-cols-2 gap-6">
                            <div className="space-y-2 col-span-2 md:col-span-1">
                                <label className="text-xs font-bold text-ink/50 uppercase tracking-wider ml-1">Project Title</label>
                                <input name="title" defaultValue={editingProject?.title} required className="h-12 w-full rounded-2xl border border-aviation-100 bg-aviation-50/30 px-4 text-sm focus:border-aviation-300 outline-none transition-all" />
                            </div>
                            <div className="space-y-2 col-span-2 md:col-span-1">
                                <label className="text-xs font-bold text-ink/50 uppercase tracking-wider ml-1">Slug</label>
                                <input name="slug" defaultValue={editingProject?.slug} required placeholder="e.g. e-commerce-app" className="h-12 w-full rounded-2xl border border-aviation-100 bg-aviation-50/30 px-4 text-sm focus:border-aviation-300 outline-none transition-all" />
                            </div>
                            <div className="space-y-2 col-span-2">
                                <label className="text-xs font-bold text-ink/50 uppercase tracking-wider ml-1">Image URL</label>
                                <input name="imageUrl" defaultValue={editingProject?.imageUrl} placeholder="https://..." className="h-12 w-full rounded-2xl border border-aviation-100 bg-aviation-50/30 px-4 text-sm focus:border-aviation-300 outline-none transition-all" />
                            </div>
                            <div className="space-y-2 col-span-2 md:col-span-1">
                                <label className="text-xs font-bold text-ink/50 uppercase tracking-wider ml-1">Category</label>
                                <input name="category" defaultValue={editingProject?.category} placeholder="e.g. Web App, Mobile" className="h-12 w-full rounded-2xl border border-aviation-100 bg-aviation-50/30 px-4 text-sm focus:border-aviation-300 outline-none transition-all" />
                            </div>
                            <div className="space-y-2 col-span-2 md:col-span-1">
                                <label className="text-xs font-bold text-ink/50 uppercase tracking-wider ml-1">Project URL</label>
                                <input name="projectUrl" defaultValue={editingProject?.projectUrl} placeholder="https://live-demo.com" className="h-12 w-full rounded-2xl border border-aviation-100 bg-aviation-50/30 px-4 text-sm focus:border-aviation-300 outline-none transition-all" />
                            </div>
                            <div className="space-y-2 col-span-2">
                                <label className="text-xs font-bold text-ink/50 uppercase tracking-wider ml-1">Technologies (Comma separated)</label>
                                <input name="technologies" defaultValue={editingProject?.technologies?.join(", ")} placeholder="React, Next.js, Tailwind" className="h-12 w-full rounded-2xl border border-aviation-100 bg-aviation-50/30 px-4 text-sm focus:border-aviation-300 outline-none transition-all" />
                            </div>

                            <div className="flex gap-4 pt-4 col-span-2">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 rounded-2xl border border-aviation-100 py-3 text-sm font-bold text-ink hover:bg-aviation-50 transition-all">Cancel</button>
                                <button type="submit" disabled={isSaving} className="flex-1 rounded-2xl bg-aviation-600 py-3 text-sm font-bold text-white shadow-lg shadow-aviation-600/20 transition-all hover:brightness-105 disabled:opacity-50">
                                    {isSaving ? "Saving..." : editingProject ? "Update Project" : "Add Project"}
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
                title="Delete Project"
                message={`Are you sure you want to delete "${isDeleting?.title}"? This will remove the project from your showcase portfolio.`}
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
