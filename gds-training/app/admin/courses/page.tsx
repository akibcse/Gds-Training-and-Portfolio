"use client";

import { useEffect, useState } from "react";
import { Plus, BookOpen, Clock, Award, Layers, Trash2, Edit3, MoveUp, MoveDown, Check, Star, Video, FileText, Image as ImageIcon, Sparkles, Tag, HelpCircle, Shield, Globe } from "lucide-react";
import DataTable from "@/components/admin/DataTable";
import ConfirmModal from "@/components/admin/ConfirmModal";
import Toast, { useToast } from "@/components/admin/Toast";
import type { Course, CourseModule, ModuleLesson, CourseFaq } from "@/lib/getData";
import { normalizeCourse } from "@/lib/getData";

type TabType = "basic" | "instructor" | "pricing" | "details" | "curriculum" | "learning" | "seo";

export default function CoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>("basic");
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);
    const [isDeleting, setIsDeleting] = useState<Course | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Form state for complete editable fields
    const [formData, setFormData] = useState<Partial<Course>>({});

    // Array editor states
    const [modules, setModules] = useState<CourseModule[]>([]);
    const [learningOutcomes, setLearningOutcomes] = useState<string[]>([]);
    const [requirements, setRequirements] = useState<string[]>([]);
    const [softwareCovered, setSoftwareCovered] = useState<string[]>([]);
    const [keywords, setKeywords] = useState<string[]>([]);

    const { toast, showToast, hideToast } = useToast();

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/admin/courses");
            const data: Partial<Course>[] = await res.json();
            const normalized = data.map((c) => normalizeCourse(c));
            setCourses(normalized);
        } catch {
            showToast("Failed to fetch courses", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (courseToEdit?: Course) => {
        if (courseToEdit) {
            const normalized = normalizeCourse(courseToEdit);
            setEditingCourse(normalized);
            setFormData({ ...normalized });
            setModules(Array.isArray(normalized.curriculum) ? (normalized.curriculum as CourseModule[]) : []);
            setLearningOutcomes(normalized.learningOutcomes || []);
            setRequirements(normalized.requirements || []);
            setSoftwareCovered(normalized.softwareCovered || []);
            setKeywords(normalized.keywords || []);
        } else {
            const defaultCourse = normalizeCourse(null);
            setEditingCourse(null);
            setFormData({
                title: "",
                slug: "",
                excerpt: "",
                description: "",
                instructorName: "Aviation Expert",
                instructorImage: "",
                thumbnail: "",
                previewVideo: "",
                category: "Aviation & GDS",
                level: "Beginner",
                duration: "3 Months",
                language: "English / Bangla",
                mode: "Online & Offline",
                certification: "Verified Certificate",
                rating: 4.8,
                reviewCount: 125,
                studentCount: 1250,
                price: 5000,
                discountPrice: 2500,
                discount: 50,
                hideFee: false,
                badgeText: "Bestseller",
                bestseller: true,
                featured: false,
                published: true,
                certificate: true,
            });
            setModules([]);
            setLearningOutcomes(["Master Amadeus GDS System", "Handle Passenger PNR Creation", "Issue & Reissue Tickets"]);
            setRequirements(["Basic computer literacy", "Interest in travel & aviation industry"]);
            setSoftwareCovered(["Amadeus Altéa", "Sabre GDS", "Galileo"]);
            setKeywords(["GDS Training", "Air Ticketing", "Aviation Course"]);
        }
        setActiveTab("basic");
        setIsModalOpen(true);
    };

    const handleFieldChange = (field: keyof Course, value: any) => {
        setFormData((prev) => {
            const updated = { ...prev, [field]: value };
            // Automatically calculate discount percentage if price or discountPrice changes
            if (field === "price" || field === "discountPrice") {
                const p = Number(updated.price || 0);
                const dp = Number(updated.discountPrice || 0);
                if (p > 0 && dp > 0 && p >= dp) {
                    updated.discount = Math.round(((p - dp) / p) * 100);
                }
            }
            return updated;
        });
    };

    // --- Array Editor Handlers ---
    const addArrayItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, defaultVal = "New Item") => {
        setter((prev) => [...prev, defaultVal]);
    };

    const updateArrayItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, index: number, val: string) => {
        setter((prev) => {
            const next = [...prev];
            next[index] = val;
            return next;
        });
    };

    const deleteArrayItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, index: number) => {
        setter((prev) => prev.filter((_, i) => i !== index));
    };

    const moveArrayItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, index: number, dir: -1 | 1) => {
        setter((prev) => {
            if ((index === 0 && dir === -1) || (index === prev.length - 1 && dir === 1)) return prev;
            const next = [...prev];
            const target = index + dir;
            const temp = next[index];
            next[index] = next[target];
            next[target] = temp;
            return next;
        });
    };

    // --- Curriculum Module Handlers ---
    const addModule = () => {
        setModules((prev) => [
            ...prev,
            {
                id: "mod-" + Date.now(),
                title: "New Module Title",
                duration: "1 Hour",
                lessons: [
                    { id: "les-" + Date.now(), title: "Introductory Lesson", duration: "15 mins", isFreePreview: true }
                ]
            }
        ]);
    };

    const updateModuleTitle = (modIdx: number, title: string) => {
        setModules((prev) => {
            const next = [...prev];
            next[modIdx] = { ...next[modIdx], title };
            return next;
        });
    };

    const deleteModule = (modIdx: number) => {
        setModules((prev) => prev.filter((_, i) => i !== modIdx));
    };

    const addLessonToModule = (modIdx: number) => {
        setModules((prev) => {
            const next = [...prev];
            const mod = next[modIdx];
            const newLessons = [
                ...mod.lessons,
                { id: "les-" + Date.now(), title: "New Lesson", duration: "20 mins", isFreePreview: false }
            ];
            next[modIdx] = { ...mod, lessons: newLessons };
            return next;
        });
    };

    const updateLesson = (modIdx: number, lesIdx: number, field: keyof ModuleLesson, value: any) => {
        setModules((prev) => {
            const next = [...prev];
            const mod = next[modIdx];
            const lessons = [...mod.lessons];
            lessons[lesIdx] = { ...lessons[lesIdx], [field]: value };
            next[modIdx] = { ...mod, lessons };
            return next;
        });
    };

    const deleteLesson = (modIdx: number, lesIdx: number) => {
        setModules((prev) => {
            const next = [...prev];
            const mod = next[modIdx];
            next[modIdx] = { ...mod, lessons: mod.lessons.filter((_, i) => i !== lesIdx) };
            return next;
        });
    };

    // --- Form Submit ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        const payload: Partial<Course> = {
            ...formData,
            slug: (formData.slug || formData.title || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
            curriculum: modules,
            learningOutcomes,
            careerOutcomes: learningOutcomes,
            requirements,
            softwareCovered,
            tags: softwareCovered,
            keywords,
            price: Number(formData.price || 0),
            discountPrice: Number(formData.discountPrice || 0),
            discount: Number(formData.discount || 0),
            hideFee: Boolean(formData.hideFee),
            rating: Number(formData.rating || 4.8),
            reviewCount: Number(formData.reviewCount || 100),
            studentCount: Number(formData.studentCount || 1000),
            updatedAt: Date.now()
        };

        try {
            const url = editingCourse ? `/api/admin/courses/${editingCourse.id}` : "/api/admin/courses";
            const method = editingCourse ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                showToast(editingCourse ? "Course updated successfully!" : "Course created successfully!", "success");
                setIsModalOpen(false);
                setEditingCourse(null);
                fetchCourses();
            } else {
                showToast("Failed to save course", "error");
            }
        } catch {
            showToast("An error occurred while saving", "error");
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
                setCourses((prev) => prev.filter((c) => c.id !== isDeleting.id));
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
                    <img src={c.thumbnail || "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=100"} alt={c.title} className="h-12 w-12 rounded-xl object-cover border border-slate-200 shrink-0" />
                    <div>
                        <div className="flex items-center gap-2">
                            <p className="font-bold text-ink">{c.title}</p>
                            {c.bestseller && <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">Bestseller</span>}
                        </div>
                        <p className="text-xs text-ink/40">/{c.slug}</p>
                    </div>
                </div>
            )
        },
        {
            header: "Pricing",
            accessor: (c: Course) => (
                <div>
                    <div className="flex items-center gap-1.5 font-bold text-ink">
                        <span>৳{(c.discountPrice || 0).toLocaleString()}</span>
                        {c.price && c.price > (c.discountPrice || 0) && (
                            <span className="text-xs text-ink/40 line-through">৳{c.price.toLocaleString()}</span>
                        )}
                    </div>
                    {c.discount ? <span className="text-[10px] font-bold text-emerald-600">{c.discount}% OFF</span> : null}
                </div>
            )
        },
        {
            header: "Stats & Instructor",
            accessor: (c: Course) => (
                <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                        <span className="font-bold">{c.rating || 4.8}</span>
                        <span className="text-slate-400">({c.studentCount || 0} enrolled)</span>
                    </div>
                    <p className="text-xs text-slate-500">Instructor: <span className="font-medium text-slate-700">{c.instructorName || "Aviation Expert"}</span></p>
                </div>
            )
        },
        {
            header: "Status",
            accessor: (c: Course) => (
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${c.published !== false ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-600"}`}>
                    {c.published !== false ? "Published" : "Draft"}
                </span>
            )
        }
    ];

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-ink tracking-tight">Course Management CMS</h1>
                    <p className="mt-1 text-ink/50">Edit every course property, curriculum module, media, pricing, and SEO settings.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 rounded-2xl bg-aviation-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-aviation-600/20 transition-all hover:brightness-105 active:scale-95"
                >
                    <Plus className="h-5 w-5" />
                    Add New Course
                </button>
            </div>

            <DataTable
                data={courses}
                columns={columns}
                loading={loading}
                onEdit={(item) => handleOpenModal(item)}
                onDelete={(item) => setIsDeleting(item)}
                searchPlaceholder="Search courses by title, category, or slug..."
            />

            {/* --- COMPREHENSIVE MULTI-TAB COURSE EDITOR MODAL --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
                    <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                    <div className="relative w-full max-w-4xl rounded-3xl bg-white p-6 md:p-8 shadow-2xl z-10 max-h-[90vh] flex flex-col my-auto">
                        
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <div>
                                <h2 className="text-2xl font-bold text-ink">{editingCourse ? `Edit: ${editingCourse.title}` : "Create New Course"}</h2>
                                <p className="text-xs text-slate-500">Configure basic details, media, pricing, curriculum modules, and SEO.</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="rounded-full p-2 text-slate-400 hover:bg-slate-100">✕</button>
                        </div>

                        {/* Navigation Tabs */}
                        <div className="flex flex-wrap gap-2 border-b border-slate-100 py-3 overflow-x-auto">
                            {[
                                { id: "basic", label: "1. Basic Info", icon: BookOpen },
                                { id: "instructor", label: "2. Instructor & Media", icon: ImageIcon },
                                { id: "pricing", label: "3. Pricing & Badges", icon: Award },
                                { id: "details", label: "4. Details & Stats", icon: Layers },
                                { id: "curriculum", label: "5. Curriculum Builder", icon: Video },
                                { id: "learning", label: "6. Learning & Tags", icon: Sparkles },
                                { id: "seo", label: "7. SEO Metadata", icon: Globe }
                            ].map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => setActiveTab(tab.id as TabType)}
                                        className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${activeTab === tab.id ? "bg-aviation-600 text-white shadow-md shadow-aviation-600/20" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Tab Contents */}
                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-6 space-y-6">
                            
                            {/* TAB 1: BASIC INFO */}
                            {activeTab === "basic" && (
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2 col-span-2 md:col-span-1">
                                        <label className="text-xs font-bold text-ink/60 uppercase">Course Title *</label>
                                        <input
                                            value={formData.title || ""}
                                            onChange={(e) => handleFieldChange("title", e.target.value)}
                                            required
                                            placeholder="e.g. Amadeus GDS Mastery Course"
                                            className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none focus:border-aviation-500"
                                        />
                                    </div>
                                    <div className="space-y-2 col-span-2 md:col-span-1">
                                        <label className="text-xs font-bold text-ink/60 uppercase">URL Slug *</label>
                                        <input
                                            value={formData.slug || ""}
                                            onChange={(e) => handleFieldChange("slug", e.target.value)}
                                            required
                                            placeholder="amadeus-gds-mastery"
                                            className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none focus:border-aviation-500"
                                        />
                                    </div>
                                    <div className="space-y-2 col-span-2 md:col-span-1">
                                        <label className="text-xs font-bold text-ink/60 uppercase">Regular Course Fee (৳) *</label>
                                        <input
                                            type="number"
                                            value={formData.price || 0}
                                            onChange={(e) => handleFieldChange("price", Number(e.target.value))}
                                            required
                                            placeholder="5000"
                                            className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm font-bold text-slate-800 outline-none focus:border-aviation-500"
                                        />
                                    </div>
                                    <div className="space-y-2 col-span-2 md:col-span-1">
                                        <label className="text-xs font-bold text-ink/60 uppercase">Offer / Discounted Fee (৳) *</label>
                                        <input
                                            type="number"
                                            value={formData.discountPrice || 0}
                                            onChange={(e) => handleFieldChange("discountPrice", Number(e.target.value))}
                                            required
                                            placeholder="2500"
                                            className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm font-bold text-aviation-600 outline-none focus:border-aviation-500"
                                        />
                                    </div>
                                    <div className="space-y-2 col-span-2">
                                        <label className="text-xs font-bold text-ink/60 uppercase">Short Excerpt / Card Description</label>
                                        <textarea
                                            value={formData.excerpt || ""}
                                            onChange={(e) => handleFieldChange("excerpt", e.target.value)}
                                            rows={2}
                                            placeholder="Brief overview shown on course cards..."
                                            className="w-full rounded-2xl border border-slate-200 p-4 text-sm outline-none focus:border-aviation-500"
                                        />
                                    </div>
                                    <div className="space-y-2 col-span-2">
                                        <label className="text-xs font-bold text-ink/60 uppercase">Full Course Description</label>
                                        <textarea
                                            value={formData.description || ""}
                                            onChange={(e) => handleFieldChange("description", e.target.value)}
                                            rows={6}
                                            placeholder="Detailed course breakdown, syllabus introduction, and target audience..."
                                            className="w-full rounded-2xl border border-slate-200 p-4 text-sm outline-none focus:border-aviation-500 font-mono text-xs"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* TAB 2: INSTRUCTOR & MEDIA */}
                            {activeTab === "instructor" && (
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2 col-span-2 md:col-span-1">
                                        <label className="text-xs font-bold text-ink/60 uppercase">Instructor Name</label>
                                        <input
                                            value={formData.instructorName || ""}
                                            onChange={(e) => handleFieldChange("instructorName", e.target.value)}
                                            placeholder="e.g. Capt. Tanvir Rahman"
                                            className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none focus:border-aviation-500"
                                        />
                                    </div>
                                    <div className="space-y-2 col-span-2 md:col-span-1">
                                        <label className="text-xs font-bold text-ink/60 uppercase">Instructor Image URL</label>
                                        <input
                                            value={formData.instructorImage || ""}
                                            onChange={(e) => handleFieldChange("instructorImage", e.target.value)}
                                            placeholder="https://..."
                                            className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none focus:border-aviation-500"
                                        />
                                    </div>
                                    <div className="space-y-2 col-span-2 md:col-span-1">
                                        <label className="text-xs font-bold text-ink/60 uppercase">Thumbnail Image URL</label>
                                        <input
                                            value={formData.thumbnail || ""}
                                            onChange={(e) => handleFieldChange("thumbnail", e.target.value)}
                                            placeholder="https://images.unsplash.com/..."
                                            className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none focus:border-aviation-500"
                                        />
                                        {formData.thumbnail && (
                                            <img src={formData.thumbnail} alt="Preview" className="h-24 w-40 object-cover rounded-xl border mt-2" />
                                        )}
                                    </div>
                                    <div className="space-y-2 col-span-2 md:col-span-1">
                                        <label className="text-xs font-bold text-ink/60 uppercase">Preview Video Embed URL (YouTube/Vimeo)</label>
                                        <input
                                            value={formData.previewVideo || ""}
                                            onChange={(e) => handleFieldChange("previewVideo", e.target.value)}
                                            placeholder="https://www.youtube.com/embed/..."
                                            className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none focus:border-aviation-500"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* TAB 3: PRICING & BADGES */}
                            {activeTab === "pricing" && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-ink/60 uppercase">Regular Price (৳)</label>
                                            <input
                                                type="number"
                                                value={formData.price || 0}
                                                onChange={(e) => handleFieldChange("price", Number(e.target.value))}
                                                className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm font-bold text-slate-800"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-ink/60 uppercase">Discounted / Offer Price (৳)</label>
                                            <input
                                                type="number"
                                                value={formData.discountPrice || 0}
                                                onChange={(e) => handleFieldChange("discountPrice", Number(e.target.value))}
                                                className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm font-bold text-aviation-600"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-ink/60 uppercase">Calculated Discount (%)</label>
                                            <input
                                                type="number"
                                                readOnly
                                                value={formData.discount || 0}
                                                className="h-12 w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 text-sm font-bold text-emerald-600 cursor-not-allowed"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-ink/60 uppercase">Custom Badge Text</label>
                                        <input
                                            value={formData.badgeText || ""}
                                            onChange={(e) => handleFieldChange("badgeText", e.target.value)}
                                            placeholder="e.g. Bestseller, 50% OFF, Limited Batch"
                                            className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
                                        {[
                                            { key: "bestseller", label: "Bestseller Badge" },
                                            { key: "featured", label: "Featured Course" },
                                            { key: "certificate", label: "Offers Certificate" },
                                            { key: "published", label: "Published Live" },
                                            { key: "hideFee", label: "Hide Course Fee" }
                                        ].map((badge) => (
                                            <label key={badge.key} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200 bg-slate-50/50 cursor-pointer hover:bg-slate-100">
                                                <input
                                                    type="checkbox"
                                                    checked={Boolean(formData[badge.key as keyof Course])}
                                                    onChange={(e) => handleFieldChange(badge.key as keyof Course, e.target.checked)}
                                                    className="h-5 w-5 rounded border-slate-300 text-aviation-600 focus:ring-aviation-500"
                                                />
                                                <span className="text-xs font-bold text-slate-700">{badge.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* TAB 4: DETAILS & STATS */}
                            {activeTab === "details" && (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-ink/60 uppercase">Course Duration</label>
                                        <input
                                            value={formData.duration || ""}
                                            onChange={(e) => handleFieldChange("duration", e.target.value)}
                                            placeholder="e.g. 3 Months / 10 Weeks"
                                            className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-ink/60 uppercase">Level</label>
                                        <select
                                            value={formData.level || "Beginner"}
                                            onChange={(e) => handleFieldChange("level", e.target.value)}
                                            className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm bg-white"
                                        >
                                            <option value="Beginner">Beginner</option>
                                            <option value="Intermediate">Intermediate</option>
                                            <option value="Advanced">Advanced</option>
                                            <option value="All Levels">All Levels</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-ink/60 uppercase">Category</label>
                                        <input
                                            value={formData.category || ""}
                                            onChange={(e) => handleFieldChange("category", e.target.value)}
                                            placeholder="e.g. GDS Ticketing"
                                            className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-ink/60 uppercase">Language</label>
                                        <input
                                            value={formData.language || "English / Bangla"}
                                            onChange={(e) => handleFieldChange("language", e.target.value)}
                                            className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-ink/60 uppercase">Training Mode</label>
                                        <input
                                            value={formData.mode || "Online & Offline"}
                                            onChange={(e) => handleFieldChange("mode", e.target.value)}
                                            className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-ink/60 uppercase">Certification Type</label>
                                        <input
                                            value={formData.certification || "IATA Standard Certificate"}
                                            onChange={(e) => handleFieldChange("certification", e.target.value)}
                                            className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-ink/60 uppercase">Rating (1.0 - 5.0)</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            max="5.0"
                                            min="1.0"
                                            value={formData.rating ?? 4.8}
                                            onChange={(e) => handleFieldChange("rating", Number(e.target.value))}
                                            className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm font-bold text-amber-600"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-ink/60 uppercase">Review Count</label>
                                        <input
                                            type="number"
                                            value={formData.reviewCount ?? 125}
                                            onChange={(e) => handleFieldChange("reviewCount", Number(e.target.value))}
                                            className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-ink/60 uppercase">Enrolled Students Count</label>
                                        <input
                                            type="number"
                                            value={formData.studentCount ?? 1250}
                                            onChange={(e) => handleFieldChange("studentCount", Number(e.target.value))}
                                            className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* TAB 5: CURRICULUM BUILDER */}
                            {activeTab === "curriculum" && (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-sm font-bold text-ink uppercase">Course Curriculum Modules</h3>
                                            <p className="text-xs text-slate-500">Add sections, lessons, video URLs, and PDF attachments.</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={addModule}
                                            className="flex items-center gap-1.5 rounded-xl bg-aviation-600 px-4 py-2 text-xs font-bold text-white hover:brightness-105"
                                        >
                                            <Plus className="h-4 w-4" /> Add Module
                                        </button>
                                    </div>

                                    {modules.length === 0 ? (
                                        <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl">
                                            <p className="text-sm text-slate-500">No modules added yet. Click "Add Module" to build syllabus.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {modules.map((mod, modIdx) => (
                                                <div key={mod.id || modIdx} className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-bold text-xs text-aviation-600 bg-white border px-2.5 py-1 rounded-lg">Module {modIdx + 1}</span>
                                                        <input
                                                            value={mod.title}
                                                            onChange={(e) => updateModuleTitle(modIdx, e.target.value)}
                                                            placeholder="Module Title"
                                                            className="flex-1 h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-ink"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => deleteModule(modIdx)}
                                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                                            title="Delete Module"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>

                                                    {/* Lessons in Module */}
                                                    <div className="pl-4 border-l-2 border-aviation-200 space-y-2 pt-2">
                                                        {mod.lessons.map((les, lesIdx) => (
                                                            <div key={les.id || lesIdx} className="grid grid-cols-12 gap-2 items-center bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                                                <div className="col-span-4">
                                                                    <input
                                                                        value={les.title}
                                                                        onChange={(e) => updateLesson(modIdx, lesIdx, "title", e.target.value)}
                                                                        placeholder="Lesson Title"
                                                                        className="w-full text-xs font-semibold px-2 py-1 border border-slate-200 rounded-lg"
                                                                    />
                                                                </div>
                                                                <div className="col-span-3">
                                                                    <input
                                                                        value={les.videoUrl || ""}
                                                                        onChange={(e) => updateLesson(modIdx, lesIdx, "videoUrl", e.target.value)}
                                                                        placeholder="Video URL"
                                                                        className="w-full text-xs px-2 py-1 border border-slate-200 rounded-lg"
                                                                    />
                                                                </div>
                                                                <div className="col-span-2">
                                                                    <input
                                                                        value={les.duration || ""}
                                                                        onChange={(e) => updateLesson(modIdx, lesIdx, "duration", e.target.value)}
                                                                        placeholder="e.g. 15m"
                                                                        className="w-full text-xs px-2 py-1 border border-slate-200 rounded-lg"
                                                                    />
                                                                </div>
                                                                <div className="col-span-2 flex items-center gap-1">
                                                                    <label className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={Boolean(les.isFreePreview)}
                                                                            onChange={(e) => updateLesson(modIdx, lesIdx, "isFreePreview", e.target.checked)}
                                                                        />
                                                                        Free
                                                                    </label>
                                                                </div>
                                                                <div className="col-span-1 text-right">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => deleteLesson(modIdx, lesIdx)}
                                                                        className="text-red-400 hover:text-red-600 p-1"
                                                                    >
                                                                        ✕
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}

                                                        <button
                                                            type="button"
                                                            onClick={() => addLessonToModule(modIdx)}
                                                            className="text-xs font-bold text-aviation-600 hover:underline flex items-center gap-1 pt-1"
                                                        >
                                                            + Add Lesson to Module {modIdx + 1}
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* TAB 6: LEARNING OUTCOMES & TAGS */}
                            {activeTab === "learning" && (
                                <div className="space-y-8">
                                    {/* Learning Outcomes */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <label className="text-xs font-bold text-ink uppercase">What You'll Learn / Outcomes</label>
                                            <button type="button" onClick={() => addArrayItem(setLearningOutcomes, "New Learning Outcome")} className="text-xs font-bold text-aviation-600 hover:underline">+ Add Outcome</button>
                                        </div>
                                        {learningOutcomes.map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-2">
                                                <input
                                                    value={item}
                                                    onChange={(e) => updateArrayItem(setLearningOutcomes, idx, e.target.value)}
                                                    className="flex-1 h-10 rounded-xl border border-slate-200 px-3 text-xs"
                                                />
                                                <button type="button" onClick={() => moveArrayItem(setLearningOutcomes, idx, -1)} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded"><MoveUp className="h-4 w-4" /></button>
                                                <button type="button" onClick={() => moveArrayItem(setLearningOutcomes, idx, 1)} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded"><MoveDown className="h-4 w-4" /></button>
                                                <button type="button" onClick={() => deleteArrayItem(setLearningOutcomes, idx)} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><Trash2 className="h-4 w-4" /></button>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Prerequisites */}
                                    <div className="space-y-3 pt-4 border-t border-slate-100">
                                        <div className="flex items-center justify-between">
                                            <label className="text-xs font-bold text-ink uppercase">Requirements / Prerequisites</label>
                                            <button type="button" onClick={() => addArrayItem(setRequirements, "Basic computer knowledge")} className="text-xs font-bold text-aviation-600 hover:underline">+ Add Requirement</button>
                                        </div>
                                        {requirements.map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-2">
                                                <input
                                                    value={item}
                                                    onChange={(e) => updateArrayItem(setRequirements, idx, e.target.value)}
                                                    className="flex-1 h-10 rounded-xl border border-slate-200 px-3 text-xs"
                                                />
                                                <button type="button" onClick={() => deleteArrayItem(setRequirements, idx)} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><Trash2 className="h-4 w-4" /></button>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Software Covered / Tags */}
                                    <div className="space-y-3 pt-4 border-t border-slate-100">
                                        <div className="flex items-center justify-between">
                                            <label className="text-xs font-bold text-ink uppercase">Software & Tags Covered</label>
                                            <button type="button" onClick={() => addArrayItem(setSoftwareCovered, "Amadeus GDS")} className="text-xs font-bold text-aviation-600 hover:underline">+ Add Tag</button>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {softwareCovered.map((item, idx) => (
                                                <div key={idx} className="flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1 text-xs">
                                                    <input
                                                        value={item}
                                                        onChange={(e) => updateArrayItem(setSoftwareCovered, idx, e.target.value)}
                                                        className="bg-transparent border-none outline-none font-bold text-slate-700 w-28"
                                                    />
                                                    <button type="button" onClick={() => deleteArrayItem(setSoftwareCovered, idx)} className="text-red-500 hover:text-red-700 font-bold ml-1">✕</button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB 7: SEO */}
                            {activeTab === "seo" && (
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-ink/60 uppercase">SEO Meta Title</label>
                                        <input
                                            value={formData.seoTitle || ""}
                                            onChange={(e) => handleFieldChange("seoTitle", e.target.value)}
                                            placeholder={formData.title || "Meta Title..."}
                                            className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-ink/60 uppercase">SEO Meta Description</label>
                                        <textarea
                                            value={formData.seoDescription || ""}
                                            onChange={(e) => handleFieldChange("seoDescription", e.target.value)}
                                            rows={3}
                                            placeholder={formData.excerpt || "Meta Description..."}
                                            className="w-full rounded-2xl border border-slate-200 p-4 text-sm"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <label className="text-xs font-bold text-ink/60 uppercase">SEO Keywords</label>
                                            <button type="button" onClick={() => addArrayItem(setKeywords, "GDS Training Dhaka")} className="text-xs font-bold text-aviation-600 hover:underline">+ Add Keyword</button>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {keywords.map((kw, idx) => (
                                                <div key={idx} className="flex items-center gap-1 bg-blue-50 text-blue-700 rounded-lg px-3 py-1 text-xs font-semibold">
                                                    <input
                                                        value={kw}
                                                        onChange={(e) => updateArrayItem(setKeywords, idx, e.target.value)}
                                                        className="bg-transparent border-none outline-none font-semibold text-blue-800 w-32"
                                                    />
                                                    <button type="button" onClick={() => deleteArrayItem(setKeywords, idx)} className="text-blue-500 hover:text-red-600 ml-1">✕</button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Action Footer */}
                            <div className="flex items-center justify-between border-t border-slate-100 pt-6 mt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-2xl border border-slate-200 px-6 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50">
                                    Cancel
                                </button>
                                <button type="submit" disabled={isSaving} className="rounded-2xl bg-aviation-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-aviation-600/20 hover:brightness-105 disabled:opacity-50 flex items-center gap-2">
                                    {isSaving ? "Saving..." : editingCourse ? "Save & Publish Changes" : "Create Course"}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={!!isDeleting}
                onClose={() => setIsDeleting(null)}
                onConfirm={handleDelete}
                isLoading={isSaving}
                title="Delete Course"
                message={`Are you sure you want to delete "${isDeleting?.title}"? All curriculum data associated with this course will be permanently removed.`}
            />

            {/* Toast Notification */}
            {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
        </div>
    );
}
