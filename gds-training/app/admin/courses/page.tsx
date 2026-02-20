"use client";

import { useEffect, useState } from "react";
import { Plus, BookOpen, Clock, Award, Layers } from "lucide-react";
import DataTable from "@/components/admin/DataTable";
import ConfirmModal from "@/components/admin/ConfirmModal";
import Toast, { useToast } from "@/components/admin/Toast";

interface Course {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    description: string;
    duration: string;
    certification: string;
    mode: string;
}

export default function CoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);
    const [isDeleting, setIsDeleting] = useState<Course | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const { toast, showToast, hideToast } = useToast();

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/admin/courses");
            const data = await res.json();
            setCourses(data);
        } catch {
            showToast("Failed to fetch courses", "error");
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
            const url = editingCourse ? `/api/admin/courses/${editingCourse.id}` : "/api/admin/courses";
            const method = editingCourse ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });

            if (res.ok) {
                showToast(editingCourse ? "Course updated!" : "Course created!", "success");
                setIsModalOpen(false);
                setEditingCourse(null);
                fetchCourses();
            } else {
                showToast("Failed to save course", "error");
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
            const res = await fetch(`/api/admin/courses/${isDeleting.id}`, { method: "DELETE" });
            if (res.ok) {
                showToast("Course deleted", "success");
                setCourses(prev => prev.filter(c => c.id !== isDeleting.id));
                setIsDeleting(null);
            }
        } catch {
            showToast("Failed to delete course", "error");
        } finally {
            setIsSaving(false);
        }
    };

    const columns = [
        {
            header: "Course Title",
            accessor: (c: Course) => (
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                        <BookOpen className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="font-bold text-ink">{c.title}</p>
                        <p className="text-xs text-ink/40">/{c.slug}</p>
                    </div>
                </div>
            )
        },
        {
            header: "Details",
            accessor: (c: Course) => (
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-medium text-ink/60">
                        <Clock className="h-3 w-3" /> {c.duration}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-medium text-ink/60">
                        <Layers className="h-3 w-3" /> {c.mode}
                    </div>
                </div>
            )
        },
        {
            header: "Certification",
            accessor: (c: Course) => (
                <div className="flex items-center gap-2 text-xs font-bold text-aviation-700">
                    <Award className="h-3 w-3 text-aviation-500" />
                    {c.certification}
                </div>
            )
        }
    ];

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-ink tracking-tight">Courses</h1>
                    <p className="mt-1 text-ink/50">Manage your training programs and certificates.</p>
                </div>
                <button
                    onClick={() => { setEditingCourse(null); setIsModalOpen(true); }}
                    className="flex items-center gap-2 rounded-2xl bg-aviation-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-aviation-600/20 transition-all hover:brightness-105 active:scale-95"
                >
                    <Plus className="h-5 w-5" />
                    Add Course
                </button>
            </div>

            <DataTable
                data={courses}
                columns={columns}
                loading={loading}
                onEdit={(item) => { setEditingCourse(item); setIsModalOpen(true); }}
                onDelete={(item) => setIsDeleting(item)}
                searchPlaceholder="Filter courses..."
            />

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                    <div className="relative w-full max-w-2xl rounded-3xl bg-white p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
                        <h2 className="text-2xl font-bold text-ink">{editingCourse ? "Edit Course" : "New Training Course"}</h2>
                        <form onSubmit={handleSubmit} className="mt-8 grid grid-cols-2 gap-6">
                            <div className="space-y-2 col-span-2 md:col-span-1">
                                <label className="text-xs font-bold text-ink/50 uppercase tracking-wider ml-1">Course Title</label>
                                <input name="title" defaultValue={editingCourse?.title} required className="h-12 w-full rounded-2xl border border-aviation-100 bg-aviation-50/30 px-4 text-sm focus:border-aviation-300 outline-none transition-all" />
                            </div>
                            <div className="space-y-2 col-span-2 md:col-span-1">
                                <label className="text-xs font-bold text-ink/50 uppercase tracking-wider ml-1">Slug</label>
                                <input name="slug" defaultValue={editingCourse?.slug} required placeholder="e.g. web-design-masterclass" className="h-12 w-full rounded-2xl border border-aviation-100 bg-aviation-50/30 px-4 text-sm focus:border-aviation-300 outline-none transition-all" />
                            </div>
                            <div className="space-y-2 col-span-2">
                                <label className="text-xs font-bold text-ink/50 uppercase tracking-wider ml-1">Excerpt</label>
                                <textarea name="excerpt" defaultValue={editingCourse?.excerpt} rows={2} className="w-full rounded-2xl border border-aviation-100 bg-aviation-50/30 p-4 text-sm focus:border-aviation-300 outline-none transition-all resize-none" />
                            </div>
                            <div className="space-y-2 col-span-2 md:col-span-1">
                                <label className="text-xs font-bold text-ink/50 uppercase tracking-wider ml-1">Duration</label>
                                <input name="duration" defaultValue={editingCourse?.duration} placeholder="e.g. 3 Months" className="h-12 w-full rounded-2xl border border-aviation-100 bg-aviation-50/30 px-4 text-sm focus:border-aviation-300 outline-none transition-all" />
                            </div>
                            <div className="space-y-2 col-span-2 md:col-span-1">
                                <label className="text-xs font-bold text-ink/50 uppercase tracking-wider ml-1">Certification</label>
                                <input name="certification" defaultValue={editingCourse?.certification} placeholder="e.g. Professional Certificate" className="h-12 w-full rounded-2xl border border-aviation-100 bg-aviation-50/30 px-4 text-sm focus:border-aviation-300 outline-none transition-all" />
                            </div>
                            <div className="space-y-2 col-span-2 md:col-span-1">
                                <label className="text-xs font-bold text-ink/50 uppercase tracking-wider ml-1">Training Mode</label>
                                <input name="mode" defaultValue={editingCourse?.mode} placeholder="e.g. Offline / Online" className="h-12 w-full rounded-2xl border border-aviation-100 bg-aviation-50/30 px-4 text-sm focus:border-aviation-300 outline-none transition-all" />
                            </div>

                            <div className="flex gap-4 pt-4 col-span-2">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 rounded-2xl border border-aviation-100 py-3 text-sm font-bold text-ink hover:bg-aviation-50 transition-all">Cancel</button>
                                <button type="submit" disabled={isSaving} className="flex-1 rounded-2xl bg-aviation-600 py-3 text-sm font-bold text-white shadow-lg shadow-aviation-600/20 transition-all hover:brightness-105 disabled:opacity-50">
                                    {isSaving ? "Saving..." : editingCourse ? "Update Course" : "Create Course"}
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
                title="Delete Course"
                message={`Are you sure you want to delete "${isDeleting?.title}"? All curriculum data associated with this course will be permanently removed.`}
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
