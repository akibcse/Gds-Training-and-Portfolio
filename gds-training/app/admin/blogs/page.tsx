"use client";

import { useEffect, useState } from "react";
import { Plus, FileText, Calendar, User, Eye } from "lucide-react";
import DataTable from "@/components/admin/DataTable";
import ConfirmModal from "@/components/admin/ConfirmModal";
import Toast, { useToast } from "@/components/admin/Toast";

interface Blog {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    author: string;
    date: string;
    category: string;
    readTime: string;
}

export default function BlogsPage() {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
    const [isDeleting, setIsDeleting] = useState<Blog | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const { toast, showToast, hideToast } = useToast();

    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/admin/blogs");
            const data = await res.json();
            setBlogs(data);
        } catch {
            showToast("Failed to fetch blogs", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSaving(true);
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        try {
            const url = editingBlog ? `/api/admin/blogs/${editingBlog.id}` : "/api/admin/blogs";
            const method = editingBlog ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...data,
                    date: data.date || new Date().toISOString()
                })
            });

            if (res.ok) {
                showToast(editingBlog ? "Blog updated!" : "Blog published!", "success");
                setIsModalOpen(false);
                setEditingBlog(null);
                fetchBlogs();
            } else {
                showToast("Failed to save blog", "error");
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
            const res = await fetch(`/api/admin/blogs/${isDeleting.id}`, { method: "DELETE" });
            if (res.ok) {
                showToast("Blog deleted", "success");
                setBlogs(prev => prev.filter(b => b.id !== isDeleting.id));
                setIsDeleting(null);
            }
        } catch {
            showToast("Failed to delete blog", "error");
        } finally {
            setIsSaving(false);
        }
    };

    const columns = [
        {
            header: "Article",
            accessor: (b: Blog) => (
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                        <FileText className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="font-bold text-ink leading-tight">{b.title}</p>
                        <p className="text-xs text-ink/40">/{b.slug}</p>
                    </div>
                </div>
            )
        },
        {
            header: "Author & Date",
            accessor: (b: Blog) => (
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-medium text-ink/60">
                        <User className="h-3 w-3" /> {b.author}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-medium text-ink/60">
                        <Calendar className="h-3 w-3" /> {new Date(b.date).toLocaleDateString()}
                    </div>
                </div>
            )
        },
        {
            header: "Category",
            accessor: (b: Blog) => (
                <span className="rounded-full bg-purple-50 px-2.5 py-1 text-xs font-bold text-purple-700">
                    {b.category}
                </span>
            )
        }
    ];

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-ink tracking-tight">Blogs</h1>
                    <p className="mt-1 text-ink/50">Write and manage your blog articles.</p>
                </div>
                <button
                    onClick={() => { setEditingBlog(null); setIsModalOpen(true); }}
                    className="flex items-center gap-2 rounded-2xl bg-aviation-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-aviation-600/20 transition-all hover:brightness-105 active:scale-95"
                >
                    <Plus className="h-5 w-5" />
                    New Article
                </button>
            </div>

            <DataTable
                data={blogs}
                columns={columns}
                loading={loading}
                onEdit={(item) => { setEditingBlog(item); setIsModalOpen(true); }}
                onDelete={(item) => setIsDeleting(item)}
                searchPlaceholder="Filter articles..."
            />

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                    <div className="relative w-full max-w-4xl rounded-3xl bg-white p-8 shadow-2xl animate-in fade-in zoom-in duration-200 overflow-y-auto max-h-[90vh]">
                        <h2 className="text-2xl font-bold text-ink">{editingBlog ? "Edit Article" : "Write New Article"}</h2>
                        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs font-bold text-ink/50 uppercase tracking-wider ml-1">Title</label>
                                    <input name="title" defaultValue={editingBlog?.title} required className="h-12 w-full rounded-2xl border border-aviation-100 bg-aviation-50/30 px-4 text-sm focus:border-aviation-300 outline-none transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-ink/50 uppercase tracking-wider ml-1">Slug</label>
                                    <input name="slug" defaultValue={editingBlog?.slug} required placeholder="e.g. how-to-learn-design" className="h-12 w-full rounded-2xl border border-aviation-100 bg-aviation-50/30 px-4 text-sm focus:border-aviation-300 outline-none transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-ink/50 uppercase tracking-wider ml-1">Author Name</label>
                                    <input name="author" defaultValue={editingBlog?.author} required className="h-12 w-full rounded-2xl border border-aviation-100 bg-aviation-50/30 px-4 text-sm focus:border-aviation-300 outline-none transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-ink/50 uppercase tracking-wider ml-1">Category</label>
                                    <input name="category" defaultValue={editingBlog?.category} placeholder="e.g. Design, Coding" className="h-12 w-full rounded-2xl border border-aviation-100 bg-aviation-50/30 px-4 text-sm focus:border-aviation-300 outline-none transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-ink/50 uppercase tracking-wider ml-1">Read Time</label>
                                    <input name="readTime" defaultValue={editingBlog?.readTime} placeholder="e.g. 5 Min Read" className="h-12 w-full rounded-2xl border border-aviation-100 bg-aviation-50/30 px-4 text-sm focus:border-aviation-300 outline-none transition-all" />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs font-bold text-ink/50 uppercase tracking-wider ml-1">Excerpt</label>
                                    <textarea name="excerpt" defaultValue={editingBlog?.excerpt} rows={3} className="w-full rounded-2xl border border-aviation-100 bg-aviation-50/30 p-4 text-sm focus:border-aviation-300 outline-none transition-all resize-none" />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 rounded-2xl border border-aviation-100 py-3 text-sm font-bold text-ink hover:bg-aviation-50 transition-all">Cancel</button>
                                <button type="submit" disabled={isSaving} className="flex-1 rounded-2xl bg-aviation-600 py-3 text-sm font-bold text-white shadow-lg shadow-aviation-600/20 transition-all hover:brightness-105 disabled:opacity-50">
                                    {isSaving ? "Saving..." : editingBlog ? "Update Blog" : "Publish Blog"}
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
                title="Delete Article"
                message={`Are you sure you want to delete "${isDeleting?.title}"? This will permanently remove the article from the public blog.`}
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
