"use client";

import { useState, useCallback, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { AnimatePresence, motion } from "framer-motion";
import type { ProfileRecord, PortfolioProfileRecord } from "@/lib/admin-data";
import { getFirebaseAuth } from "@/lib/firebase";

type Toast = { id: string; type: "success" | "error"; message: string };

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

function ListSection({ label, items, onChange, renderItem, onAdd }: any) {
    const handleDragEnd = (result: DropResult) => {
        if (!result.destination) return;
        const newItems = Array.from(items || []);
        const [removed] = newItems.splice(result.source.index, 1);
        newItems.splice(result.destination.index, 0, removed);
        onChange(newItems);
    };

    const removeItem = (index: number) => onChange((items || []).filter((_: any, i: number) => i !== index));

    return (
        <div className="space-y-4 rounded-xl border border-aviation-100 p-4">
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-ink">{label}</h4>
                <button
                    type="button"
                    onClick={onAdd}
                    className="rounded-lg border border-aviation-200 px-3 py-1.5 text-xs font-semibold text-aviation-700 hover:bg-aviation-50"
                >
                    + Add
                </button>
            </div>
            {(items || []).length === 0 && <p className="text-xs text-ink/50">No items added yet.</p>}
            <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId={`about-${label}`}>
                    {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                            {(items || []).map((item: any, index: number) => (
                                <Draggable key={`${label}-${index}`} draggableId={`${label}-${index}`} index={index}>
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            className={`relative rounded-xl border bg-white p-4 ${snapshot.isDragging ? "border-aviation-500 shadow-xl" : "border-aviation-100 shadow-sm"
                                                }`}
                                        >
                                            <div {...provided.dragHandleProps} className="absolute left-1 top-1/2 -translate-y-1/2 cursor-grab py-2 text-ink/20">
                                                ⋮⋮
                                            </div>
                                            <div className="ml-4 space-y-3">
                                                {renderItem(item, index)}
                                                <button
                                                    type="button"
                                                    onClick={() => removeItem(index)}
                                                    className="text-xs font-semibold text-red-500 hover:text-red-700"
                                                >
                                                    Remove This Item
                                                </button>
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
    );
}

export default function AboutPage() {
    const [profile, setProfile] = useState<ProfileRecord | null>(null);
    const [portfolioProfile, setPortfolioProfile] = useState<PortfolioProfileRecord | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toasts, setToasts] = useState<Toast[]>([]);

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
            const response = await fetch("/api/admin/about", { headers });
            if (response.ok) {
                const data = await response.json();
                setProfile(data.profile);
                setPortfolioProfile(data.portfolioProfile);
            }
        } catch (error) {
            addToast("error", "Failed to fetch about data");
        } finally {
            setLoading(false);
        }
    }, [addToast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const saveAll = async () => {
        if (!profile || !portfolioProfile) return;
        setSaving(true);
        try {
            const headers = { "Content-Type": "application/json", ...(await getAuthHeader()) };
            const response = await fetch("/api/admin/about", {
                method: "PUT",
                headers,
                body: JSON.stringify({ profile, portfolioProfile })
            });

            if (response.ok) {
                addToast("success", "Profile updated successfully");
            } else {
                addToast("error", "Failed to save profile");
            }
        } catch {
            addToast("error", "Network error occurred");
        } finally {
            setSaving(false);
        }
    };

    if (loading || !profile || !portfolioProfile) {
        return <div className="p-8 text-center text-sm text-ink/70">Loading profile data...</div>;
    }

    return (
        <div className="mx-auto max-w-6xl space-y-8 p-6">
            <ToastContainer toasts={toasts} remove={removeToast} />

            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-ink">About & Profile</h2>
                <button
                    onClick={saveAll}
                    disabled={saving}
                    className="rounded-full bg-gradient-to-r from-aviation-600 to-cyan-500 px-8 py-3 text-sm font-bold text-white shadow-lg disabled:opacity-50"
                >
                    {saving ? "Saving Changes..." : "Save All Changes"}
                </button>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
                <section className="space-y-6">
                    <article className="space-y-4 rounded-2xl border border-aviation-100 bg-white p-6 shadow-soft">
                        <h3 className="text-lg font-semibold border-b pb-2">Public Profile</h3>
                        <div className="grid gap-4">
                            <div>
                                <label className="text-xs font-bold uppercase text-ink/50">Full Name</label>
                                <input
                                    className="w-full rounded-lg border border-aviation-100 bg-aviation-50/30 px-3 py-2 text-sm"
                                    value={profile.name}
                                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase text-ink/50">Tagline</label>
                                <input
                                    className="w-full rounded-lg border border-aviation-100 bg-aviation-50/30 px-3 py-2 text-sm"
                                    value={profile.tagline}
                                    onChange={(e) => setProfile({ ...profile, tagline: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase text-ink/50">Biography / Description</label>
                                <textarea
                                    rows={4}
                                    className="w-full rounded-lg border border-aviation-100 bg-aviation-50/30 px-3 py-2 text-sm"
                                    value={profile.description}
                                    onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase text-ink/50">Hero Image URL</label>
                                <input
                                    className="w-full rounded-lg border border-aviation-100 bg-aviation-50/30 px-3 py-2 text-sm"
                                    placeholder="https://example.com/hero-image.jpg"
                                    value={portfolioProfile.profileImage}
                                    onChange={(e) => setPortfolioProfile({ ...portfolioProfile, profileImage: e.target.value })}
                                />
                                <p className="mt-1 text-xs text-ink/50">Used in homepage hero and about profile image.</p>
                            </div>
                        </div>
                    </article>

                    <article className="space-y-4 rounded-2xl border border-aviation-100 bg-white p-6 shadow-soft">
                        <h3 className="text-lg font-semibold border-b pb-2">Portfolio Details</h3>
                        <div className="grid gap-4">
                            <div>
                                <label className="text-xs font-bold uppercase text-ink/50">Career Objective</label>
                                <textarea
                                    rows={3}
                                    className="w-full rounded-lg border border-aviation-100 bg-aviation-50/30 px-3 py-2 text-sm"
                                    value={portfolioProfile.careerObjective}
                                    onChange={(e) => setPortfolioProfile({ ...portfolioProfile, careerObjective: e.target.value })}
                                />
                            </div>
                            <ListSection
                                label="Professional Experience"
                                items={portfolioProfile.experience}
                                onAdd={() => setPortfolioProfile({
                                    ...portfolioProfile,
                                    experience: [...portfolioProfile.experience, { title: "", organization: "", location: "", duration: "", years: "", highlights: [] }]
                                })}
                                onChange={(items: any) => setPortfolioProfile({ ...portfolioProfile, experience: items })}
                                renderItem={(item: any, index: number) => (
                                    <div className="grid gap-3">
                                        <input
                                            placeholder="Title / Role"
                                            className="w-full rounded border border-aviation-100 px-3 py-2 text-sm"
                                            value={item.title}
                                            onChange={(e) => {
                                                const next = [...portfolioProfile.experience];
                                                next[index].title = e.target.value;
                                                setPortfolioProfile({ ...portfolioProfile, experience: next });
                                            }}
                                        />
                                        <div className="grid grid-cols-2 gap-3">
                                            <input
                                                placeholder="Organization"
                                                className="rounded border border-aviation-100 px-3 py-2 text-sm"
                                                value={item.organization}
                                                onChange={(e) => {
                                                    const next = [...portfolioProfile.experience];
                                                    next[index].organization = e.target.value;
                                                    setPortfolioProfile({ ...portfolioProfile, experience: next });
                                                }}
                                            />
                                            <input
                                                placeholder="Duration (e.g. 2020 - Present)"
                                                className="rounded border border-aviation-100 px-3 py-2 text-sm"
                                                value={item.duration}
                                                onChange={(e) => {
                                                    const next = [...portfolioProfile.experience];
                                                    next[index].duration = e.target.value;
                                                    setPortfolioProfile({ ...portfolioProfile, experience: next });
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}
                            />
                        </div>
                    </article>
                </section>

                <section className="space-y-6">
                    <article className="space-y-4 rounded-2xl border border-aviation-100 bg-white p-6 shadow-soft">
                        <h3 className="text-lg font-semibold border-b pb-2">Education & Skills</h3>
                        <ListSection
                            label="Academic Background"
                            items={portfolioProfile.education}
                            onAdd={() => setPortfolioProfile({
                                ...portfolioProfile,
                                education: [...portfolioProfile.education, { exam: "", institute: "", result: "", year: "" }]
                            })}
                            onChange={(items: any) => setPortfolioProfile({ ...portfolioProfile, education: items })}
                            renderItem={(item: any, index: number) => (
                                <div className="grid gap-3">
                                    <input
                                        placeholder="Degree / Exam"
                                        className="w-full rounded border border-aviation-100 px-3 py-2 text-sm"
                                        value={item.exam}
                                        onChange={(e) => {
                                            const next = [...portfolioProfile.education];
                                            next[index].exam = e.target.value;
                                            setPortfolioProfile({ ...portfolioProfile, education: next });
                                        }}
                                    />
                                    <input
                                        placeholder="Institute"
                                        className="w-full rounded border border-aviation-100 px-3 py-2 text-sm"
                                        value={item.institute}
                                        onChange={(e) => {
                                            const next = [...portfolioProfile.education];
                                            next[index].institute = e.target.value;
                                            setPortfolioProfile({ ...portfolioProfile, education: next });
                                        }}
                                    />
                                </div>
                            )}
                        />

                        <ListSection
                            label="Languages"
                            items={portfolioProfile.languages}
                            onAdd={() => setPortfolioProfile({
                                ...portfolioProfile,
                                languages: [...portfolioProfile.languages, { name: "", reading: "High", writing: "High", speaking: "High" }]
                            })}
                            onChange={(items: any) => setPortfolioProfile({ ...portfolioProfile, languages: items })}
                            renderItem={(item: any, index: number) => (
                                <div className="flex items-center gap-3">
                                    <input
                                        placeholder="Language Name"
                                        className="w-1/3 rounded border border-aviation-100 px-3 py-2 text-sm"
                                        value={item.name}
                                        onChange={(e) => {
                                            const next = [...portfolioProfile.languages];
                                            next[index].name = e.target.value;
                                            setPortfolioProfile({ ...portfolioProfile, languages: next });
                                        }}
                                    />
                                    <select
                                        className="w-2/3 rounded border border-aviation-100 px-3 py-2 text-sm"
                                        value={item.speaking}
                                        onChange={(e) => {
                                            const next = [...portfolioProfile.languages];
                                            next[index].speaking = e.target.value;
                                            setPortfolioProfile({ ...portfolioProfile, languages: next });
                                        }}
                                    >
                                        <option value="High">High Proficiency</option>
                                        <option value="Medium">Medium Proficiency</option>
                                        <option value="Low">Low Proficiency</option>
                                    </select>
                                </div>
                            )}
                        />
                    </article>
                </section>
            </div>
        </div>
    );
}
