"use client";

import { useState, useCallback } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { AnimatePresence, motion } from "framer-motion";
import type {
  BlogRecord,
  CourseRecord,
  LeadUser,
  PortfolioProfileRecord,
  PortfolioProject,
  ProfileRecord,
  SeoGlobal,
  SeoPageEntry
} from "@/lib/admin-data";

type LeadRecord = {
  id: string;
  name: string;
  email: string;
  phone: string;
  course: string;
  type: "registration" | "booking";
  createdAt: string;
};

type Props = {
  users: LeadUser[];
  registrations: LeadRecord[];
  bookings: LeadRecord[];
  courses: CourseRecord[];
  blogs: BlogRecord[];
  projects: PortfolioProject[];
  seoGlobal: SeoGlobal;
  seoPages: SeoPageEntry[];
  profile: ProfileRecord;
  portfolioProfile: PortfolioProfileRecord;
};

type Tab = "courses" | "blogs" | "portfolio" | "about" | "leads" | "seo";

type Toast = { id: string; type: "success" | "error"; message: string };

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const isValidUrl = (value: string) => {
  if (!value) return true;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

const isValidEmail = (value: string) => {
  if (!value) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
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

type ListEditorProps = {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder: string;
  required?: boolean;
};

function ListEditor({ label, items, onChange, placeholder, required }: ListEditorProps) {
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const newItems = Array.from(items);
    const [removed] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, removed);
    onChange(newItems);
  };

  const updateItem = (index: number, value: string) => {
    onChange(items.map((item, i) => (i === index ? value : item)));
  };

  const addItem = () => onChange([...items, ""]);
  const removeItem = (index: number) => onChange(items.filter((_, i) => i !== index));

  return (
    <div className="space-y-2 rounded-xl border border-aviation-100 p-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-ink/75">
          {label} {required && <span className="text-red-500">*</span>}
        </p>
        <button type="button" onClick={addItem} className="rounded-full border border-aviation-200 px-3 py-1 text-xs font-semibold text-aviation-700 hover:bg-aviation-50">
          + Add
        </button>
      </div>
      {items.length === 0 && <p className="text-xs text-ink/60">No items. Click "+ Add" to create.</p>}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId={`list-${label}`}>
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
              {items.map((item, index) => (
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

type ImagePreviewProps = {
  value: string;
  label: string;
};

function ImagePreview({ value, label }: ImagePreviewProps) {
  const [error, setError] = useState(false);
  const strValue = value || "";
  const isUrl = strValue.startsWith("http://") || strValue.startsWith("https://");

  if (!value) {
    return (
      <div className="flex h-24 w-full items-center justify-center rounded-xl border-2 border-dashed border-aviation-200 bg-aviation-50">
        <p className="text-xs text-ink/50">No {label} set</p>
      </div>
    );
  }

  if (!isUrl) {
    return (
      <div className="flex h-24 w-full items-center justify-center rounded-xl border-2 border-dashed border-red-300 bg-red-50">
        <p className="text-xs text-red-500">Invalid URL format</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-24 w-full items-center justify-center rounded-xl border-2 border-dashed border-red-300 bg-red-50">
        <p className="text-xs text-red-500">Failed to load image</p>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={value}
      alt={label}
      onError={() => setError(true)}
      className="h-32 w-full rounded-xl border border-aviation-200 object-cover"
    />
  );
}

type DeleteConfirmProps = {
  open: boolean;
  title: string;
  onConfirm: () => void;
  onCancel: () => void;
};

function DeleteConfirm({ open, title, onConfirm, onCancel }: DeleteConfirmProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
      >
        <h3 className="text-lg font-semibold text-ink">Confirm Delete</h3>
        <p className="mt-2 text-sm text-ink/70">
          Are you sure you want to delete <strong>"{title}"</strong>? This action cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onCancel} className="rounded-full border border-aviation-200 px-4 py-2 text-sm font-semibold text-ink hover:bg-aviation-50">
            Cancel
          </button>
          <button onClick={onConfirm} className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">
            Delete
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function AdminDashboard(props: Props) {
  const [tab, setTab] = useState<Tab>("courses");
  const [toasts, setToasts] = useState<Toast[]>([]);

  const [courses, setCourses] = useState(props.courses || []);
  const [blogs, setBlogs] = useState(props.blogs || []);
  const [projects, setProjects] = useState(props.projects || []);
  const [users, setUsers] = useState(props.users || []);
  const [seoGlobal, setSeoGlobal] = useState(props.seoGlobal || {});
  const [seoPagesText, setSeoPagesText] = useState(JSON.stringify(props.seoPages || [], null, 2));
  const [profile, setProfile] = useState(props.profile || {});
  const [portfolioProfile, setPortfolioProfile] = useState(props.portfolioProfile || {});
  const [experienceRows, setExperienceRows] = useState(props.portfolioProfile?.experience || []);
  const [educationRows, setEducationRows] = useState(props.portfolioProfile?.education || []);
  const [languageRows, setLanguageRows] = useState(props.portfolioProfile?.languages || []);

  const [editingCourseId, setEditingCourseId] = useState("");
  const [editingBlogId, setEditingBlogId] = useState("");
  const [editingProjectId, setEditingProjectId] = useState("");

  const [deleteConfirm, setDeleteConfirm] = useState<{ type: string; id: string; title: string } | null>(null);

  const [courseForm, setCourseForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    description: "",
    duration: "",
    certification: "",
    mode: "",
    softwareCovered: [] as string[],
    curriculum: [] as string[],
    careerOutcomes: [] as string[],
    keywords: [] as string[],
    relatedBlogSlugs: [] as string[]
  });

  const [blogForm, setBlogForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    description: "",
    publishedAt: "",
    author: "",
    keywords: [] as string[],
    content: [] as string[],
    relatedSlugs: [] as string[]
  });

  const [projectForm, setProjectForm] = useState({
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

  const leadsCount = (props.registrations?.length || 0) + (props.bookings?.length || 0);

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  };

  const setCourseFromRecord = (course: CourseRecord) => {
    setCourseForm({
      title: course.title || "",
      slug: course.slug || "",
      excerpt: course.excerpt || "",
      description: course.description || "",
      duration: course.duration || "",
      certification: course.certification || "",
      mode: course.mode || "",
      softwareCovered: course.softwareCovered || [],
      curriculum: course.curriculum || [],
      careerOutcomes: course.careerOutcomes || [],
      keywords: course.keywords || [],
      relatedBlogSlugs: course.relatedBlogSlugs || []
    });
  };

  const saveCourse = async () => {
    if (!courseForm.title.trim()) {
      addToast("error", "Course title is required");
      return;
    }
    if (!courseForm.slug.trim()) {
      addToast("error", "Course slug is required");
      return;
    }

    const payload = {
      id: editingCourseId || undefined,
      ...courseForm,
      softwareCovered: courseForm.softwareCovered.map((item) => item.trim()).filter(Boolean),
      curriculum: courseForm.curriculum.map((item) => item.trim()).filter(Boolean),
      careerOutcomes: courseForm.careerOutcomes.map((item) => item.trim()).filter(Boolean),
      keywords: courseForm.keywords.map((item) => item.trim()).filter(Boolean),
      relatedBlogSlugs: courseForm.relatedBlogSlugs.map((item) => item.trim()).filter(Boolean),
      faqs: []
    };

    const method = editingCourseId ? "PUT" : "POST";
    const response = await fetch("/api/admin/courses", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const result = (await response.json()) as { error?: string; course?: CourseRecord };
    if (!response.ok || !result.course) {
      addToast("error", result.error ?? "Failed to save course");
      return;
    }

    const savedCourse = result.course;
    setCourses((prev) => {
      if (editingCourseId) {
        return prev.map((item) => (item.id === savedCourse.id ? savedCourse : item));
      }
      return [savedCourse, ...prev];
    });

    setEditingCourseId("");
    setCourseForm({
      title: "",
      slug: "",
      excerpt: "",
      description: "",
      duration: "",
      certification: "",
      mode: "",
      softwareCovered: [],
      curriculum: [],
      careerOutcomes: [],
      keywords: [],
      relatedBlogSlugs: []
    });
    addToast("success", editingCourseId ? "Course updated!" : "Course created!");
  };

  const confirmDeleteCourse = (id: string) => {
    const course = courses.find((c) => c.id === id);
    if (course) {
      setDeleteConfirm({ type: "course", id, title: course.title });
    }
  };

  const executeDeleteCourse = async () => {
    if (!deleteConfirm || deleteConfirm.type !== "course") return;
    const { id } = deleteConfirm;

    const response = await fetch(`/api/admin/courses?id=${id}`, { method: "DELETE" });
    if (!response.ok) {
      addToast("error", "Failed to delete course");
      setDeleteConfirm(null);
      return;
    }
    setCourses((prev) => prev.filter((item) => item.id !== id));
    setDeleteConfirm(null);
    addToast("success", "Course deleted!");
  };

  const setBlogFromRecord = (blog: BlogRecord) => {
    setEditingBlogId(blog.id);
    setBlogForm({
      title: blog.title || "",
      slug: blog.slug || "",
      excerpt: blog.excerpt || "",
      description: blog.description || "",
      publishedAt: blog.publishedAt || "",
      author: blog.author || "",
      keywords: blog.keywords || [],
      content: blog.content || [],
      relatedSlugs: blog.relatedSlugs || []
    });
  };

  const saveBlog = async () => {
    if (!blogForm.title.trim()) {
      addToast("error", "Blog title is required");
      return;
    }
    if (!blogForm.slug.trim()) {
      addToast("error", "Blog slug is required");
      return;
    }

    const payload = {
      id: editingBlogId || undefined,
      ...blogForm,
      keywords: blogForm.keywords.map((item) => item.trim()).filter(Boolean),
      content: blogForm.content.map((item) => item.trim()).filter(Boolean),
      relatedSlugs: blogForm.relatedSlugs.map((item) => item.trim()).filter(Boolean)
    };

    const method = editingBlogId ? "PUT" : "POST";
    const response = await fetch("/api/admin/blogs", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const result = (await response.json()) as { error?: string; blog?: BlogRecord };

    if (!response.ok || !result.blog) {
      addToast("error", result.error ?? "Failed to save blog");
      return;
    }

    const savedBlog = result.blog;
    setBlogs((prev) => {
      if (editingBlogId) {
        return prev.map((item) => (item.id === savedBlog.id ? savedBlog : item));
      }
      return [savedBlog, ...prev];
    });

    setEditingBlogId("");
    setBlogForm({
      title: "",
      slug: "",
      excerpt: "",
      description: "",
      publishedAt: "",
      author: "",
      keywords: [],
      content: [],
      relatedSlugs: []
    });
    addToast("success", editingBlogId ? "Blog updated!" : "Blog created!");
  };

  const confirmDeleteBlog = (id: string) => {
    const blog = blogs.find((b) => b.id === id);
    if (blog) {
      setDeleteConfirm({ type: "blog", id, title: blog.title });
    }
  };

  const executeDeleteBlog = async () => {
    if (!deleteConfirm || deleteConfirm.type !== "blog") return;
    const { id } = deleteConfirm;

    const response = await fetch(`/api/admin/blogs?id=${id}`, { method: "DELETE" });
    if (!response.ok) {
      addToast("error", "Failed to delete blog");
      setDeleteConfirm(null);
      return;
    }
    setBlogs((prev) => prev.filter((item) => item.id !== id));
    setDeleteConfirm(null);
    addToast("success", "Blog deleted!");
  };

  const setProjectFromRecord = (project: PortfolioProject) => {
    setEditingProjectId(project.id);
    setProjectForm({
      title: project.title || "",
      slug: project.slug || "",
      category: project.category || "",
      description: project.description || "",
      caseStudy: project.caseStudy || "",
      technologies: project.technologies || [],
      imageUrl: project.imageUrl || ""
    });
  };

  const saveProject = async () => {
    if (!projectForm.title.trim()) {
      addToast("error", "Project title is required");
      return;
    }
    if (!projectForm.slug.trim()) {
      addToast("error", "Project slug is required");
      return;
    }
    if (projectForm.imageUrl && !isValidUrl(projectForm.imageUrl)) {
      addToast("error", "Invalid image URL format");
      return;
    }

    const payload = {
      id: editingProjectId || undefined,
      ...projectForm,
      technologies: projectForm.technologies.map((item) => item.trim()).filter(Boolean)
    };

    const method = editingProjectId ? "PUT" : "POST";
    const response = await fetch("/api/admin/portfolio", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const result = (await response.json()) as { error?: string; project?: PortfolioProject };

    if (!response.ok || !result.project) {
      addToast("error", result.error ?? "Failed to save project");
      return;
    }

    const savedProject = result.project;
    setProjects((prev) => {
      if (editingProjectId) {
        return prev.map((item) => (item.id === savedProject.id ? savedProject : item));
      }
      return [savedProject, ...prev];
    });

    setEditingProjectId("");
    setProjectForm({ title: "", slug: "", category: "", description: "", caseStudy: "", technologies: [], imageUrl: "" });
    addToast("success", editingProjectId ? "Project updated!" : "Project created!");
  };

  const confirmDeleteProject = (id: string) => {
    const project = projects.find((p) => p.id === id);
    if (project) {
      setDeleteConfirm({ type: "project", id, title: project.title });
    }
  };

  const executeDeleteProject = async () => {
    if (!deleteConfirm || deleteConfirm.type !== "project") return;
    const { id } = deleteConfirm;

    const response = await fetch(`/api/admin/portfolio?id=${id}`, { method: "DELETE" });
    if (!response.ok) {
      addToast("error", "Failed to delete project");
      setDeleteConfirm(null);
      return;
    }
    setProjects((prev) => prev.filter((item) => item.id !== id));
    setDeleteConfirm(null);
    addToast("success", "Project deleted!");
  };

  const updateLeadStatus = async (id: string, status: LeadUser["status"]) => {
    const response = await fetch("/api/admin/leads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status })
    });

    if (!response.ok) {
      addToast("error", "Failed to update lead status");
      return;
    }

    setUsers((prev) => prev.map((item) => (item.id === id ? { ...item, status, updatedAt: new Date().toISOString() } : item)));
    addToast("success", "Lead status updated!");
  };

  const confirmDeleteLead = (id: string) => {
    const user = users.find((u) => u.id === id);
    if (user) {
      setDeleteConfirm({ type: "lead", id, title: user.name });
    }
  };

  const executeDeleteLead = async () => {
    if (!deleteConfirm || deleteConfirm.type !== "lead") return;
    const { id } = deleteConfirm;

    const response = await fetch(`/api/admin/leads?id=${id}`, { method: "DELETE" });
    if (!response.ok) {
      addToast("error", "Failed to delete lead");
      setDeleteConfirm(null);
      return;
    }
    setUsers((prev) => prev.filter((item) => item.id !== id));
    setDeleteConfirm(null);
    addToast("success", "Lead deleted!");
  };

  const saveSeo = async () => {
    if (!seoGlobal.siteUrl.trim()) {
      addToast("error", "Site URL is required");
      return;
    }
    if (!seoGlobal.defaultTitle.trim()) {
      addToast("error", "Default title is required");
      return;
    }
    if (!seoGlobal.defaultDescription.trim()) {
      addToast("error", "Default description is required");
      return;
    }
    if (seoGlobal.defaultOgImage && !isValidUrl(seoGlobal.defaultOgImage)) {
      addToast("error", "Invalid OG image URL");
      return;
    }

    let pages: SeoPageEntry[] = [];
    try {
      pages = JSON.parse(seoPagesText) as SeoPageEntry[];
      if (!Array.isArray(pages)) {
        addToast("error", "SEO pages must be a JSON array");
        return;
      }
    } catch {
      addToast("error", "Invalid SEO pages JSON format");
      return;
    }

    const response = await fetch("/api/admin/seo", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ global: seoGlobal, pages })
    });

    const result = (await response.json()) as { error?: string };
    if (!response.ok) {
      addToast("error", result.error ?? "Failed to save SEO settings");
      return;
    }

    addToast("success", "SEO settings saved!");
  };

  const handleExperienceDrag = (result: DropResult) => {
    if (!result.destination) return;
    const newItems = Array.from(experienceRows);
    const [removed] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, removed);
    setExperienceRows(newItems);
  };

  const updateExperienceRow = (index: number, key: keyof PortfolioProfileRecord["experience"][number], value: string) => {
    setExperienceRows((prev) => prev.map((item, i) => (i === index ? { ...item, [key]: value } : item)));
  };

  const updateExperienceHighlights = (index: number, value: string) => {
    const lines = value.split("\n").map((l) => l.trim()).filter(Boolean);
    setExperienceRows((prev) => prev.map((item, i) => (i === index ? { ...item, highlights: lines } : item)));
  };

  const addExperienceRow = () => {
    setExperienceRows((prev) => [
      ...prev,
      { title: "", organization: "", location: "", duration: "", years: "", highlights: [] }
    ]);
  };

  const removeExperienceRow = (index: number) => {
    setExperienceRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEducationDrag = (result: DropResult) => {
    if (!result.destination) return;
    const newItems = Array.from(educationRows);
    const [removed] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, removed);
    setEducationRows(newItems);
  };

  const updateEducationRow = (index: number, key: keyof PortfolioProfileRecord["education"][number], value: string) => {
    setEducationRows((prev) => prev.map((item, i) => (i === index ? { ...item, [key]: value } : item)));
  };

  const addEducationRow = () => {
    setEducationRows((prev) => [...prev, { exam: "", institute: "", result: "", year: "" }]);
  };

  const removeEducationRow = (index: number) => {
    setEducationRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleLanguageDrag = (result: DropResult) => {
    if (!result.destination) return;
    const newItems = Array.from(languageRows);
    const [removed] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, removed);
    setLanguageRows(newItems);
  };

  const updateLanguageRow = (index: number, key: keyof PortfolioProfileRecord["languages"][number], value: string) => {
    setLanguageRows((prev) => prev.map((item, i) => (i === index ? { ...item, [key]: value } : item)));
  };

  const addLanguageRow = () => {
    setLanguageRows((prev) => [...prev, { name: "", reading: "", writing: "", speaking: "" }]);
  };

  const removeLanguageRow = (index: number) => {
    setLanguageRows((prev) => prev.filter((_, i) => i !== index));
  };

  const saveAbout = async () => {
    if (!profile.name.trim()) {
      addToast("error", "Name is required");
      return;
    }
    if (!portfolioProfile.fullName.trim()) {
      addToast("error", "Full name is required");
      return;
    }
    if (portfolioProfile.profileImage && !isValidUrl(portfolioProfile.profileImage)) {
      addToast("error", "Invalid profile image URL");
      return;
    }
    if (profile.email && !isValidEmail(profile.email)) {
      addToast("error", "Invalid email format");
      return;
    }

    const payload = {
      profile,
      portfolioProfile: {
        ...portfolioProfile,
        experience: experienceRows,
        education: educationRows,
        languages: languageRows
      }
    };

    const response = await fetch("/api/admin/about", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const result = (await response.json()) as { error?: string };
    if (!response.ok) {
      addToast("error", result.error ?? "Failed to save about settings");
      return;
    }

    setPortfolioProfile(payload.portfolioProfile);
    addToast("success", "About content saved!");
  };

  return (
    <>
      <ToastContainer toasts={toasts} remove={removeToast} />
      <DeleteConfirm
        open={!!deleteConfirm}
        title={deleteConfirm?.title ?? ""}
        onConfirm={() => {
          if (deleteConfirm?.type === "course") executeDeleteCourse();
          else if (deleteConfirm?.type === "blog") executeDeleteBlog();
          else if (deleteConfirm?.type === "project") executeDeleteProject();
          else if (deleteConfirm?.type === "lead") executeDeleteLead();
        }}
        onCancel={() => setDeleteConfirm(null)}
      />
      <section className="mx-auto max-w-6xl space-y-6 px-4 py-10 md:px-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold text-ink">Admin Dashboard</h1>
          <button type="button" onClick={logout} className="rounded-full border border-aviation-200 px-4 py-2 text-sm font-semibold text-aviation-700 hover:bg-aviation-50">
            Logout
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {(["courses", "blogs", "portfolio", "about", "leads", "seo"] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setTab(item)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold ${tab === item ? "bg-aviation-600 text-white" : "border border-aviation-200 text-aviation-700 hover:bg-aviation-50"}`}
            >
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </button>
          ))}
        </div>

        {tab === "courses" && (
          <article className="space-y-4 rounded-2xl border border-aviation-100 bg-white p-5 shadow-soft">
            <h2 className="text-xl font-semibold text-ink">Manage Courses</h2>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-ink/70">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full rounded-lg border border-aviation-200 px-3 py-2 text-sm focus:border-aviation-500 focus:outline-none focus:ring-1 focus:ring-aviation-500"
                  placeholder="Course title"
                  value={courseForm.title}
                  onChange={(e) => setCourseForm((p) => ({ ...p, title: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-ink/70">
                  Slug <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    className="w-full rounded-lg border border-aviation-200 px-3 py-2 text-sm focus:border-aviation-500 focus:outline-none focus:ring-1 focus:ring-aviation-500"
                    placeholder="course-slug"
                    value={courseForm.slug}
                    onChange={(e) => setCourseForm((p) => ({ ...p, slug: e.target.value }))}
                  />
                  <button
                    type="button"
                    onClick={() => setCourseForm((p) => ({ ...p, slug: slugify(p.title) }))}
                    className="rounded-lg border border-aviation-200 px-3 py-2 text-xs font-semibold text-aviation-700 hover:bg-aviation-50"
                  >
                    Auto
                  </button>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-xs font-semibold text-ink/70">Excerpt</label>
                <input
                  className="w-full rounded-lg border border-aviation-200 px-3 py-2 text-sm focus:border-aviation-500 focus:outline-none focus:ring-1 focus:ring-aviation-500"
                  placeholder="Short description"
                  value={courseForm.excerpt}
                  onChange={(e) => setCourseForm((p) => ({ ...p, excerpt: e.target.value }))}
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-xs font-semibold text-ink/70">Description</label>
                <textarea
                  className="w-full rounded-lg border border-aviation-200 px-3 py-2 text-sm focus:border-aviation-500 focus:outline-none focus:ring-1 focus:ring-aviation-500"
                  rows={3}
                  placeholder="Full description"
                  value={courseForm.description}
                  onChange={(e) => setCourseForm((p) => ({ ...p, description: e.target.value }))}
                />
              </div>
              <input
                className="rounded-lg border border-aviation-200 px-3 py-2 text-sm focus:border-aviation-500 focus:outline-none focus:ring-1 focus:ring-aviation-500"
                placeholder="Duration (e.g., 8 weeks)"
                value={courseForm.duration}
                onChange={(e) => setCourseForm((p) => ({ ...p, duration: e.target.value }))}
              />
              <input
                className="rounded-lg border border-aviation-200 px-3 py-2 text-sm focus:border-aviation-500 focus:outline-none focus:ring-1 focus:ring-aviation-500"
                placeholder="Certification"
                value={courseForm.certification}
                onChange={(e) => setCourseForm((p) => ({ ...p, certification: e.target.value }))}
              />
              <div className="md:col-span-2">
                <input
                  className="w-full rounded-lg border border-aviation-200 px-3 py-2 text-sm focus:border-aviation-500 focus:outline-none focus:ring-1 focus:ring-aviation-500"
                  placeholder="Mode (Online/Offline)"
                  value={courseForm.mode}
                  onChange={(e) => setCourseForm((p) => ({ ...p, mode: e.target.value }))}
                />
              </div>
              <div className="md:col-span-2 grid gap-3 md:grid-cols-2">
                <ListEditor
                  label="Software Covered"
                  items={courseForm.softwareCovered}
                  onChange={(items) => setCourseForm((p) => ({ ...p, softwareCovered: items }))}
                  placeholder="Amadeus"
                />
                <ListEditor
                  label="Curriculum"
                  items={courseForm.curriculum}
                  onChange={(items) => setCourseForm((p) => ({ ...p, curriculum: items }))}
                  placeholder="Topic name"
                />
                <ListEditor
                  label="Career Outcomes"
                  items={courseForm.careerOutcomes}
                  onChange={(items) => setCourseForm((p) => ({ ...p, careerOutcomes: items }))}
                  placeholder="Job title"
                />
                <ListEditor
                  label="Keywords"
                  items={courseForm.keywords}
                  onChange={(items) => setCourseForm((p) => ({ ...p, keywords: items }))}
                  placeholder="Keyword"
                />
                <div className="md:col-span-2">
                  <ListEditor
                    label="Related Blog Slugs"
                    items={courseForm.relatedBlogSlugs}
                    onChange={(items) => setCourseForm((p) => ({ ...p, relatedBlogSlugs: items }))}
                    placeholder="blog-slug"
                  />
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={saveCourse}
              className="rounded-full bg-gradient-to-r from-aviation-600 to-cyan-500 px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90"
            >
              {editingCourseId ? "Update Course" : "Create Course"}
            </button>
            {editingCourseId && (
              <button
                type="button"
                onClick={() => {
                  setEditingCourseId("");
                  setCourseForm({
                    title: "",
                    slug: "",
                    excerpt: "",
                    description: "",
                    duration: "",
                    certification: "",
                    mode: "",
                    softwareCovered: [],
                    curriculum: [],
                    careerOutcomes: [],
                    keywords: [],
                    relatedBlogSlugs: []
                  });
                }}
                className="rounded-full border border-aviation-200 px-4 py-2 text-sm font-semibold text-aviation-700 hover:bg-aviation-50"
              >
                Cancel
              </button>
            )}

            <div className="mt-6 space-y-2">
              {courses.map((item) => (
                <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-aviation-100 bg-aviation-50/50 p-3">
                  <p className="text-sm font-medium text-ink">{item.title}</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setCourseFromRecord(item)}
                      className="rounded-full border border-aviation-200 bg-white px-3 py-1 text-xs font-semibold text-aviation-700 hover:bg-aviation-50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => confirmDeleteCourse(item.id)}
                      className="rounded-full border border-red-300 bg-white px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </article>
        )}

        {tab === "blogs" && (
          <article className="space-y-4 rounded-2xl border border-aviation-100 bg-white p-5 shadow-soft">
            <h2 className="text-xl font-semibold text-ink">Manage Blog</h2>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-ink/70">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full rounded-lg border border-aviation-200 px-3 py-2 text-sm focus:border-aviation-500 focus:outline-none focus:ring-1 focus:ring-aviation-500"
                  placeholder="Blog title"
                  value={blogForm.title}
                  onChange={(e) => setBlogForm((p) => ({ ...p, title: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-ink/70">
                  Slug <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    className="w-full rounded-lg border border-aviation-200 px-3 py-2 text-sm focus:border-aviation-500 focus:outline-none focus:ring-1 focus:ring-aviation-500"
                    placeholder="blog-slug"
                    value={blogForm.slug}
                    onChange={(e) => setBlogForm((p) => ({ ...p, slug: e.target.value }))}
                  />
                  <button
                    type="button"
                    onClick={() => setBlogForm((p) => ({ ...p, slug: slugify(p.title) }))}
                    className="rounded-lg border border-aviation-200 px-3 py-2 text-xs font-semibold text-aviation-700 hover:bg-aviation-50"
                  >
                    Auto
                  </button>
                </div>
              </div>
              <input
                className="rounded-lg border border-aviation-200 px-3 py-2 text-sm focus:border-aviation-500 focus:outline-none focus:ring-1 focus:ring-aviation-500"
                placeholder="Published date (YYYY-MM-DD)"
                value={blogForm.publishedAt}
                onChange={(e) => setBlogForm((p) => ({ ...p, publishedAt: e.target.value }))}
              />
              <input
                className="rounded-lg border border-aviation-200 px-3 py-2 text-sm focus:border-aviation-500 focus:outline-none focus:ring-1 focus:ring-aviation-500"
                placeholder="Author name"
                value={blogForm.author}
                onChange={(e) => setBlogForm((p) => ({ ...p, author: e.target.value }))}
              />
              <div className="md:col-span-2">
                <label className="mb-1 block text-xs font-semibold text-ink/70">Excerpt</label>
                <input
                  className="w-full rounded-lg border border-aviation-200 px-3 py-2 text-sm focus:border-aviation-500 focus:outline-none focus:ring-1 focus:ring-aviation-500"
                  placeholder="Short excerpt"
                  value={blogForm.excerpt}
                  onChange={(e) => setBlogForm((p) => ({ ...p, excerpt: e.target.value }))}
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-xs font-semibold text-ink/70">Description</label>
                <textarea
                  className="w-full rounded-lg border border-aviation-200 px-3 py-2 text-sm focus:border-aviation-500 focus:outline-none focus:ring-1 focus:ring-aviation-500"
                  rows={3}
                  placeholder="Blog description"
                  value={blogForm.description}
                  onChange={(e) => setBlogForm((p) => ({ ...p, description: e.target.value }))}
                />
              </div>
              <ListEditor
                label="Keywords"
                items={blogForm.keywords}
                onChange={(items) => setBlogForm((p) => ({ ...p, keywords: items }))}
                placeholder="Keyword"
              />
              <ListEditor
                label="Related Slugs"
                items={blogForm.relatedSlugs}
                onChange={(items) => setBlogForm((p) => ({ ...p, relatedSlugs: items }))}
                placeholder="blog-slug"
              />
              <div className="md:col-span-2">
                <ListEditor
                  label="Content Paragraphs"
                  items={blogForm.content}
                  onChange={(items) => setBlogForm((p) => ({ ...p, content: items }))}
                  placeholder="Paragraph text"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={saveBlog}
              className="rounded-full bg-gradient-to-r from-aviation-600 to-cyan-500 px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90"
            >
              {editingBlogId ? "Update Blog" : "Create Blog"}
            </button>
            {editingBlogId && (
              <button
                type="button"
                onClick={() => {
                  setEditingBlogId("");
                  setBlogForm({
                    title: "",
                    slug: "",
                    excerpt: "",
                    description: "",
                    publishedAt: "",
                    author: "",
                    keywords: [],
                    content: [],
                    relatedSlugs: []
                  });
                }}
                className="rounded-full border border-aviation-200 px-4 py-2 text-sm font-semibold text-aviation-700 hover:bg-aviation-50"
              >
                Cancel
              </button>
            )}

            <div className="mt-6 space-y-2">
              {blogs.map((item) => (
                <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-aviation-100 bg-aviation-50/50 p-3">
                  <p className="text-sm font-medium text-ink">{item.title}</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setBlogFromRecord(item)}
                      className="rounded-full border border-aviation-200 bg-white px-3 py-1 text-xs font-semibold text-aviation-700 hover:bg-aviation-50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => confirmDeleteBlog(item.id)}
                      className="rounded-full border border-red-300 bg-white px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </article>
        )}

        {tab === "portfolio" && (
          <article className="space-y-4 rounded-2xl border border-aviation-100 bg-white p-5 shadow-soft">
            <h2 className="text-xl font-semibold text-ink">Manage Portfolio</h2>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-ink/70">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full rounded-lg border border-aviation-200 px-3 py-2 text-sm focus:border-aviation-500 focus:outline-none focus:ring-1 focus:ring-aviation-500"
                  placeholder="Project title"
                  value={projectForm.title}
                  onChange={(e) => setProjectForm((p) => ({ ...p, title: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-ink/70">
                  Slug <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    className="w-full rounded-lg border border-aviation-200 px-3 py-2 text-sm focus:border-aviation-500 focus:outline-none focus:ring-1 focus:ring-aviation-500"
                    placeholder="project-slug"
                    value={projectForm.slug}
                    onChange={(e) => setProjectForm((p) => ({ ...p, slug: e.target.value }))}
                  />
                  <button
                    type="button"
                    onClick={() => setProjectForm((p) => ({ ...p, slug: slugify(p.title) }))}
                    className="rounded-lg border border-aviation-200 px-3 py-2 text-xs font-semibold text-aviation-700 hover:bg-aviation-50"
                  >
                    Auto
                  </button>
                </div>
              </div>
              <input
                className="rounded-lg border border-aviation-200 px-3 py-2 text-sm focus:border-aviation-500 focus:outline-none focus:ring-1 focus:ring-aviation-500"
                placeholder="Category"
                value={projectForm.category}
                onChange={(e) => setProjectForm((p) => ({ ...p, category: e.target.value }))}
              />
              <div>
                <label className="mb-1 block text-xs font-semibold text-ink/70">Image URL</label>
                <input
                  className="w-full rounded-lg border border-aviation-200 px-3 py-2 text-sm focus:border-aviation-500 focus:outline-none focus:ring-1 focus:ring-aviation-500"
                  placeholder="https://example.com/image.jpg"
                  value={projectForm.imageUrl}
                  onChange={(e) => setProjectForm((p) => ({ ...p, imageUrl: e.target.value }))}
                />
              </div>
              <div className="md:col-span-2 rounded-xl border border-aviation-100 p-3">
                <p className="mb-2 text-xs font-semibold text-ink/75">Image Preview</p>
                <ImagePreview value={projectForm.imageUrl} label="Project" />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-xs font-semibold text-ink/70">Description</label>
                <textarea
                  className="w-full rounded-lg border border-aviation-200 px-3 py-2 text-sm focus:border-aviation-500 focus:outline-none focus:ring-1 focus:ring-aviation-500"
                  rows={3}
                  placeholder="Project description"
                  value={projectForm.description}
                  onChange={(e) => setProjectForm((p) => ({ ...p, description: e.target.value }))}
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-xs font-semibold text-ink/70">Case Study</label>
                <textarea
                  className="w-full rounded-lg border border-aviation-200 px-3 py-2 text-sm focus:border-aviation-500 focus:outline-none focus:ring-1 focus:ring-aviation-500"
                  rows={4}
                  placeholder="Case study details"
                  value={projectForm.caseStudy}
                  onChange={(e) => setProjectForm((p) => ({ ...p, caseStudy: e.target.value }))}
                />
              </div>
              <div className="md:col-span-2">
                <ListEditor
                  label="Technologies"
                  items={projectForm.technologies}
                  onChange={(items) => setProjectForm((p) => ({ ...p, technologies: items }))}
                  placeholder="Technology name"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={saveProject}
              className="rounded-full bg-gradient-to-r from-aviation-600 to-cyan-500 px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90"
            >
              {editingProjectId ? "Update Project" : "Create Project"}
            </button>
            {editingProjectId && (
              <button
                type="button"
                onClick={() => {
                  setEditingProjectId("");
                  setProjectForm({ title: "", slug: "", category: "", description: "", caseStudy: "", technologies: [], imageUrl: "" });
                }}
                className="rounded-full border border-aviation-200 px-4 py-2 text-sm font-semibold text-aviation-700 hover:bg-aviation-50"
              >
                Cancel
              </button>
            )}

            <div className="mt-6 space-y-2">
              {projects.map((item) => (
                <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-aviation-100 bg-aviation-50/50 p-3">
                  <p className="text-sm font-medium text-ink">{item.title}</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setProjectFromRecord(item)}
                      className="rounded-full border border-aviation-200 bg-white px-3 py-1 text-xs font-semibold text-aviation-700 hover:bg-aviation-50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => confirmDeleteProject(item.id)}
                      className="rounded-full border border-red-300 bg-white px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </article>
        )}

        {tab === "about" && (
          <article className="space-y-4 rounded-2xl border border-aviation-100 bg-white p-5 shadow-soft">
            <h2 className="text-xl font-semibold text-ink">Manage About</h2>

            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-ink/70">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full rounded-lg border border-aviation-200 px-3 py-2 text-sm focus:border-aviation-500 focus:outline-none focus:ring-1 focus:ring-aviation-500"
                  placeholder="Your full name"
                  value={portfolioProfile.fullName}
                  onChange={(e) => setPortfolioProfile((p) => ({ ...p, fullName: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-ink/70">Profile Image URL</label>
                <input
                  className="w-full rounded-lg border border-aviation-200 px-3 py-2 text-sm focus:border-aviation-500 focus:outline-none focus:ring-1 focus:ring-aviation-500"
                  placeholder="https://example.com/profile.jpg"
                  value={portfolioProfile.profileImage}
                  onChange={(e) => setPortfolioProfile((p) => ({ ...p, profileImage: e.target.value }))}
                />
              </div>
              <div className="md:col-span-2 rounded-xl border border-aviation-100 p-3">
                <p className="mb-2 text-xs font-semibold text-ink/75">Profile Image Preview</p>
                <ImagePreview value={portfolioProfile.profileImage} label="Profile" />
              </div>
              <input
                className="rounded-lg border border-aviation-200 px-3 py-2 text-sm focus:border-aviation-500 focus:outline-none focus:ring-1 focus:ring-aviation-500"
                placeholder="Location"
                value={portfolioProfile.location}
                onChange={(e) => setPortfolioProfile((p) => ({ ...p, location: e.target.value }))}
              />
              <input
                className="rounded-lg border border-aviation-200 px-3 py-2 text-sm focus:border-aviation-500 focus:outline-none focus:ring-1 focus:ring-aviation-500"
                placeholder="Email"
                value={portfolioProfile.email}
                onChange={(e) => setPortfolioProfile((p) => ({ ...p, email: e.target.value }))}
              />
              <input
                className="rounded-lg border border-aviation-200 px-3 py-2 text-sm focus:border-aviation-500 focus:outline-none focus:ring-1 focus:ring-aviation-500"
                placeholder="Experience (years)"
                value={profile.experienceYears}
                onChange={(e) => setProfile((p) => ({ ...p, experienceYears: Number(e.target.value) || 0 }))}
              />
              <input
                className="rounded-lg border border-aviation-200 px-3 py-2 text-sm focus:border-aviation-500 focus:outline-none focus:ring-1 focus:ring-aviation-500"
                placeholder="Students trained"
                value={profile.studentsTrained}
                onChange={(e) => setProfile((p) => ({ ...p, studentsTrained: Number(e.target.value) || 0 }))}
              />
              <input
                className="rounded-lg border border-aviation-200 px-3 py-2 text-sm focus:border-aviation-500 focus:outline-none focus:ring-1 focus:ring-aviation-500"
                placeholder="Phone"
                value={profile.phone}
                onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
              />
              <input
                className="rounded-lg border border-aviation-200 px-3 py-2 text-sm focus:border-aviation-500 focus:outline-none focus:ring-1 focus:ring-aviation-500"
                placeholder="WhatsApp link"
                value={profile.whatsapp}
                onChange={(e) => setProfile((p) => ({ ...p, whatsapp: e.target.value }))}
              />
              <input
                className="rounded-lg border border-aviation-200 px-3 py-2 text-sm focus:border-aviation-500 focus:outline-none focus:ring-1 focus:ring-aviation-500"
                placeholder="Tagline"
                value={profile.tagline}
                onChange={(e) => setProfile((p) => ({ ...p, tagline: e.target.value }))}
              />
              <input
                className="rounded-lg border border-aviation-200 px-3 py-2 text-sm focus:border-aviation-500 focus:outline-none focus:ring-1 focus:ring-aviation-500"
                placeholder="Headline"
                value={profile.headline}
                onChange={(e) => setProfile((p) => ({ ...p, headline: e.target.value }))}
              />
              <div className="md:col-span-2">
                <label className="mb-1 block text-xs font-semibold text-ink/70">Description</label>
                <textarea
                  className="w-full rounded-lg border border-aviation-200 px-3 py-2 text-sm focus:border-aviation-500 focus:outline-none focus:ring-1 focus:ring-aviation-500"
                  rows={3}
                  placeholder="Profile description"
                  value={profile.description}
                  onChange={(e) => setProfile((p) => ({ ...p, description: e.target.value }))}
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-xs font-semibold text-ink/70">Career Objective</label>
                <textarea
                  className="w-full rounded-lg border border-aviation-200 px-3 py-2 text-sm focus:border-aviation-500 focus:outline-none focus:ring-1 focus:ring-aviation-500"
                  rows={4}
                  placeholder="Career objective"
                  value={portfolioProfile.careerObjective}
                  onChange={(e) => setPortfolioProfile((p) => ({ ...p, careerObjective: e.target.value }))}
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-xs font-semibold text-ink/70">Special Qualification</label>
                <textarea
                  className="w-full rounded-lg border border-aviation-200 px-3 py-2 text-sm focus:border-aviation-500 focus:outline-none focus:ring-1 focus:ring-aviation-500"
                  rows={3}
                  placeholder="Special qualifications"
                  value={portfolioProfile.specialQualification}
                  onChange={(e) => setPortfolioProfile((p) => ({ ...p, specialQualification: e.target.value }))}
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-xs font-semibold text-ink/70">Professional Qualification</label>
                <textarea
                  className="w-full rounded-lg border border-aviation-200 px-3 py-2 text-sm focus:border-aviation-500 focus:outline-none focus:ring-1 focus:ring-aviation-500"
                  rows={3}
                  placeholder="Professional qualifications"
                  value={portfolioProfile.professionalQualification}
                  onChange={(e) => setPortfolioProfile((p) => ({ ...p, professionalQualification: e.target.value }))}
                />
              </div>
              <div className="md:col-span-2 grid gap-3 md:grid-cols-2">
                <ListEditor
                  label="Phones"
                  items={portfolioProfile.phones || []}
                  onChange={(items) => setPortfolioProfile((p) => ({ ...p, phones: items }))}
                  placeholder="Phone number"
                />
                <ListEditor
                  label="Career Summary"
                  items={portfolioProfile.careerSummary || []}
                  onChange={(items) => setPortfolioProfile((p) => ({ ...p, careerSummary: items }))}
                  placeholder="Summary point"
                />
                <ListEditor
                  label="Trainings"
                  items={portfolioProfile.trainings || []}
                  onChange={(items) => setPortfolioProfile((p) => ({ ...p, trainings: items }))}
                  placeholder="Training name"
                />
                <ListEditor
                  label="Skills"
                  items={portfolioProfile.skills || []}
                  onChange={(items) => setPortfolioProfile((p) => ({ ...p, skills: items }))}
                  placeholder="Skill name"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-ink">Experience</p>
                <button
                  type="button"
                  onClick={addExperienceRow}
                  className="rounded-full border border-aviation-200 px-3 py-1 text-xs font-semibold text-aviation-700 hover:bg-aviation-50"
                >
                  + Add
                </button>
              </div>
              <DragDropContext onDragEnd={handleExperienceDrag}>
                <Droppable droppableId="experience">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                      {experienceRows.map((item, index) => (
                        <Draggable key={`exp-${index}`} draggableId={`exp-${index}`} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`rounded-xl border bg-white p-3 ${snapshot.isDragging ? "border-aviation-500 shadow-lg" : "border-aviation-100"}`}
                            >
                              <div className="flex items-center gap-2">
                                <div {...provided.dragHandleProps} className="cursor-grab text-ink/40">⋮⋮</div>
                                <div className="grid flex-1 gap-2 md:grid-cols-2">
                                  <input className="rounded-lg border border-aviation-200 px-3 py-2 text-sm" placeholder="Title" value={item.title} onChange={(e) => updateExperienceRow(index, "title", e.target.value)} />
                                  <input className="rounded-lg border border-aviation-200 px-3 py-2 text-sm" placeholder="Organization" value={item.organization} onChange={(e) => updateExperienceRow(index, "organization", e.target.value)} />
                                  <input className="rounded-lg border border-aviation-200 px-3 py-2 text-sm" placeholder="Location" value={item.location} onChange={(e) => updateExperienceRow(index, "location", e.target.value)} />
                                  <input className="rounded-lg border border-aviation-200 px-3 py-2 text-sm" placeholder="Duration" value={item.duration} onChange={(e) => updateExperienceRow(index, "duration", e.target.value)} />
                                  <input className="rounded-lg border border-aviation-200 px-3 py-2 text-sm" placeholder="Years" value={item.years} onChange={(e) => updateExperienceRow(index, "years", e.target.value)} />
                                  <button type="button" onClick={() => removeExperienceRow(index)} className="rounded-full border border-red-300 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-50">Remove</button>
                                </div>
                              </div>
                              <textarea className="mt-2 w-full rounded-lg border border-aviation-200 px-3 py-2 text-sm" rows={2} placeholder="Highlights (one per line)" value={(item.highlights || []).join("\n")} onChange={(e) => updateExperienceHighlights(index, e.target.value)} />
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

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-ink">Education</p>
                <button type="button" onClick={addEducationRow} className="rounded-full border border-aviation-200 px-3 py-1 text-xs font-semibold text-aviation-700 hover:bg-aviation-50">+ Add</button>
              </div>
              <DragDropContext onDragEnd={handleEducationDrag}>
                <Droppable droppableId="education">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                      {educationRows.map((item, index) => (
                        <Draggable key={`edu-${index}`} draggableId={`edu-${index}`} index={index}>
                          {(provided, snapshot) => (
                            <div ref={provided.innerRef} {...provided.draggableProps} className={`flex items-center gap-2 rounded-xl border bg-white p-3 ${snapshot.isDragging ? "border-aviation-500 shadow-lg" : "border-aviation-100"}`}>
                              <div {...provided.dragHandleProps} className="cursor-grab text-ink/40">⋮⋮</div>
                              <div className="grid flex-1 gap-2 md:grid-cols-2">
                                <input className="rounded-lg border border-aviation-200 px-3 py-2 text-sm" placeholder="Exam" value={item.exam} onChange={(e) => updateEducationRow(index, "exam", e.target.value)} />
                                <input className="rounded-lg border border-aviation-200 px-3 py-2 text-sm" placeholder="Institute" value={item.institute} onChange={(e) => updateEducationRow(index, "institute", e.target.value)} />
                                <input className="rounded-lg border border-aviation-200 px-3 py-2 text-sm" placeholder="Result" value={item.result} onChange={(e) => updateEducationRow(index, "result", e.target.value)} />
                                <input className="rounded-lg border border-aviation-200 px-3 py-2 text-sm" placeholder="Year" value={item.year} onChange={(e) => updateEducationRow(index, "year", e.target.value)} />
                                <button type="button" onClick={() => removeEducationRow(index)} className="rounded-full border border-red-300 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-50">Remove</button>
                              </div>
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

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-ink">Languages</p>
                <button type="button" onClick={addLanguageRow} className="rounded-full border border-aviation-200 px-3 py-1 text-xs font-semibold text-aviation-700 hover:bg-aviation-50">+ Add</button>
              </div>
              <DragDropContext onDragEnd={handleLanguageDrag}>
                <Droppable droppableId="languages">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                      {languageRows.map((item, index) => (
                        <Draggable key={`lang-${index}`} draggableId={`lang-${index}`} index={index}>
                          {(provided, snapshot) => (
                            <div ref={provided.innerRef} {...provided.draggableProps} className={`flex items-center gap-2 rounded-xl border bg-white p-3 ${snapshot.isDragging ? "border-aviation-500 shadow-lg" : "border-aviation-100"}`}>
                              <div {...provided.dragHandleProps} className="cursor-grab text-ink/40">⋮⋮</div>
                              <div className="grid flex-1 gap-2 md:grid-cols-2">
                                <input className="rounded-lg border border-aviation-200 px-3 py-2 text-sm" placeholder="Language" value={item.name} onChange={(e) => updateLanguageRow(index, "name", e.target.value)} />
                                <input className="rounded-lg border border-aviation-200 px-3 py-2 text-sm" placeholder="Reading" value={item.reading} onChange={(e) => updateLanguageRow(index, "reading", e.target.value)} />
                                <input className="rounded-lg border border-aviation-200 px-3 py-2 text-sm" placeholder="Writing" value={item.writing} onChange={(e) => updateLanguageRow(index, "writing", e.target.value)} />
                                <input className="rounded-lg border border-aviation-200 px-3 py-2 text-sm" placeholder="Speaking" value={item.speaking} onChange={(e) => updateLanguageRow(index, "speaking", e.target.value)} />
                                <button type="button" onClick={() => removeLanguageRow(index)} className="rounded-full border border-red-300 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-50">Remove</button>
                              </div>
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

            <button type="button" onClick={saveAbout} className="mt-4 rounded-full bg-gradient-to-r from-aviation-600 to-cyan-500 px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90">
              Save About
            </button>
          </article>
        )}

        {tab === "leads" && (
          <article className="space-y-4 rounded-2xl border border-aviation-100 bg-white p-5 shadow-soft">
            <h2 className="text-xl font-semibold text-ink">Lead Management</h2>
            <p className="text-sm text-ink/70">Total leads: {leadsCount} | User profiles: {users.length}</p>
            <div className="space-y-2">
              {users.length === 0 ? (
                <p className="py-4 text-center text-sm text-ink/50">No leads yet.</p>
              ) : (
                users.map((user) => (
                  <div key={user.id} className="grid gap-2 rounded-lg border border-aviation-100 bg-aviation-50/50 p-3 md:grid-cols-6 md:items-center">
                    <p className="text-sm font-medium text-ink">{user.name}</p>
                    <p className="text-xs text-ink/80">{user.email}</p>
                    <p className="text-xs text-ink/80">{user.phone}</p>
                    <p className="text-xs text-ink/80">{user.latestCourse} ({user.source})</p>
                    <select
                      value={user.status}
                      onChange={(e) => updateLeadStatus(user.id, e.target.value as LeadUser["status"])}
                      className="rounded-lg border border-aviation-200 px-2 py-1 text-xs focus:border-aviation-500 focus:outline-none"
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="enrolled">Enrolled</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => confirmDeleteLead(user.id)}
                      className="rounded-full border border-red-300 px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                ))
              )}
            </div>
          </article>
        )}

        {tab === "seo" && (
          <article className="space-y-4 rounded-2xl border border-aviation-100 bg-white p-5 shadow-soft">
            <h2 className="text-xl font-semibold text-ink">SEO Settings</h2>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-ink/70">
                  Site URL <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full rounded-lg border border-aviation-200 px-3 py-2 text-sm focus:border-aviation-500 focus:outline-none focus:ring-1 focus:ring-aviation-500"
                  placeholder="https://example.com"
                  value={seoGlobal.siteUrl}
                  onChange={(e) => setSeoGlobal((p) => ({ ...p, siteUrl: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-ink/70">Site Name</label>
                <input
                  className="w-full rounded-lg border border-aviation-200 px-3 py-2 text-sm focus:border-aviation-500 focus:outline-none focus:ring-1 focus:ring-aviation-500"
                  placeholder="Site name"
                  value={seoGlobal.siteName}
                  onChange={(e) => setSeoGlobal((p) => ({ ...p, siteName: e.target.value }))}
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-xs font-semibold text-ink/70">
                  Default Title <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full rounded-lg border border-aviation-200 px-3 py-2 text-sm focus:border-aviation-500 focus:outline-none focus:ring-1 focus:ring-aviation-500"
                  placeholder="Default page title"
                  value={seoGlobal.defaultTitle}
                  onChange={(e) => setSeoGlobal((p) => ({ ...p, defaultTitle: e.target.value }))}
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-xs font-semibold text-ink/70">Title Template</label>
                <input
                  className="w-full rounded-lg border border-aviation-200 px-3 py-2 text-sm focus:border-aviation-500 focus:outline-none focus:ring-1 focus:ring-aviation-500"
                  placeholder="%s | Site Name"
                  value={seoGlobal.titleTemplate}
                  onChange={(e) => setSeoGlobal((p) => ({ ...p, titleTemplate: e.target.value }))}
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-xs font-semibold text-ink/70">
                  Default Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="w-full rounded-lg border border-aviation-200 px-3 py-2 text-sm focus:border-aviation-500 focus:outline-none focus:ring-1 focus:ring-aviation-500"
                  rows={3}
                  placeholder="Default meta description"
                  value={seoGlobal.defaultDescription}
                  onChange={(e) => setSeoGlobal((p) => ({ ...p, defaultDescription: e.target.value }))}
                />
              </div>
              <div className="md:col-span-2">
                <ListEditor
                  label="Default Keywords"
                  items={seoGlobal.defaultKeywords}
                  onChange={(items) => setSeoGlobal((p) => ({ ...p, defaultKeywords: items }))}
                  placeholder="Keyword"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-ink/70">Default OG Image</label>
                <input
                  className="w-full rounded-lg border border-aviation-200 px-3 py-2 text-sm focus:border-aviation-500 focus:outline-none focus:ring-1 focus:ring-aviation-500"
                  placeholder="https://example.com/og-image.jpg"
                  value={seoGlobal.defaultOgImage ?? ""}
                  onChange={(e) => setSeoGlobal((p) => ({ ...p, defaultOgImage: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-ink/70">Twitter Handle</label>
                <input
                  className="w-full rounded-lg border border-aviation-200 px-3 py-2 text-sm focus:border-aviation-500 focus:outline-none focus:ring-1 focus:ring-aviation-500"
                  placeholder="@username"
                  value={seoGlobal.twitterHandle}
                  onChange={(e) => setSeoGlobal((p) => ({ ...p, twitterHandle: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-ink/70">Google Verification</label>
                <input
                  className="w-full rounded-lg border border-aviation-200 px-3 py-2 text-sm focus:border-aviation-500 focus:outline-none focus:ring-1 focus:ring-aviation-500"
                  placeholder="Google verification code"
                  value={seoGlobal.googleVerification ?? ""}
                  onChange={(e) => setSeoGlobal((p) => ({ ...p, googleVerification: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-ink/70">Bing Verification</label>
                <input
                  className="w-full rounded-lg border border-aviation-200 px-3 py-2 text-sm focus:border-aviation-500 focus:outline-none focus:ring-1 focus:ring-aviation-500"
                  placeholder="Bing verification code"
                  value={seoGlobal.bingVerification ?? ""}
                  onChange={(e) => setSeoGlobal((p) => ({ ...p, bingVerification: e.target.value }))}
                />
              </div>
            </div>
            <div className="rounded-xl border border-aviation-100 p-3">
              <p className="mb-2 text-xs font-semibold text-ink/75">OG Image Preview</p>
              <ImagePreview value={seoGlobal.defaultOgImage ?? ""} label="OG" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-ink">Page-level SEO JSON</label>
              <textarea
                className="h-64 w-full rounded-lg border border-aviation-200 px-3 py-2 font-mono text-xs focus:border-aviation-500 focus:outline-none focus:ring-1 focus:ring-aviation-500"
                value={seoPagesText}
                onChange={(e) => setSeoPagesText(e.target.value)}
              />
            </div>
            <button
              type="button"
              onClick={saveSeo}
              className="rounded-full bg-gradient-to-r from-aviation-600 to-cyan-500 px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90"
            >
              Save SEO Settings
            </button>
          </article>
        )}
      </section>
    </>
  );
}
