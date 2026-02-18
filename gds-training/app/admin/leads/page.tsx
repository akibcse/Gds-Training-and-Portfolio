"use client";

import { useState, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getFirebaseAuth } from "@/lib/firebase";

type UserRecord = {
    id: string;
    name: string;
    email: string;
    phone: string;
    status: "pending" | "processing" | "enrolled" | "cancelled";
    createdAt: string;
    source: string;
};

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

export default function LeadsPage() {
    const [inquiries, setInquiries] = useState<UserRecord[]>([]);
    const [registrations, setRegistrations] = useState<UserRecord[]>([]);
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; type: string; title: string } | null>(null);

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
        setLoading(true);
        try {
            const headers = await getAuthHeader();
            const response = await fetch("/api/admin/leads", { headers });
            if (response.ok) {
                const data = await response.json();
                setInquiries(data.users || []);
                setRegistrations(data.registrations || []);
                setBookings(data.bookings || []);
            }
        } catch {
            addToast("error", "Failed to load leads");
        } finally {
            setLoading(false);
        }
    }, [addToast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const updateStatus = async (id: string, status: string) => {
        try {
            const headers = { "Content-Type": "application/json", ...(await getAuthHeader()) };
            const response = await fetch("/api/admin/leads", {
                method: "PATCH",
                headers,
                body: JSON.stringify({ id, status })
            });
            if (response.ok) {
                setInquiries((prev) => prev.map((u) => (u.id === id ? { ...u, status: status as any } : u)));
                addToast("success", "Status updated");
            }
        } catch {
            addToast("error", "Update failed");
        }
    };

    const deleteLead = async () => {
        if (!deleteConfirm) return;
        try {
            const headers = await getAuthHeader();
            const response = await fetch(`/api/admin/leads?id=${deleteConfirm.id}&type=${deleteConfirm.type}`, {
                method: "DELETE",
                headers
            });
            if (response.ok) {
                if (deleteConfirm.type === "user") setInquiries((prev) => prev.filter((u) => u.id !== deleteConfirm.id));
                if (deleteConfirm.type === "registration") setRegistrations((prev) => prev.filter((u) => u.id !== deleteConfirm.id));
                if (deleteConfirm.type === "booking") setBookings((prev) => prev.filter((u) => u.id !== deleteConfirm.id));
                addToast("success", "Deleted successfully");
            }
        } catch {
            addToast("error", "Delete failed");
        }
        setDeleteConfirm(null);
    };

    if (loading) return <div className="p-8 text-center text-sm text-ink/70">Loading leads...</div>;

    return (
        <div className="mx-auto max-w-6xl space-y-8 p-6">
            <ToastContainer toasts={toasts} remove={removeToast} />

            {deleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                        <h3 className="text-lg font-semibold">Confirm Delete</h3>
                        <p className="mt-2 text-sm text-ink/70">Delete this {deleteConfirm.type} from "{deleteConfirm.title}"?</p>
                        <div className="mt-6 flex justify-end gap-3">
                            <button onClick={() => setDeleteConfirm(null)} className="rounded-lg border px-4 py-2 text-sm">Cancel</button>
                            <button onClick={deleteLead} className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white">Delete</button>
                        </div>
                    </motion.div>
                </div>
            )}

            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-ink">Inquiries & Leads</h2>
                <button onClick={fetchData} className="rounded-lg border bg-white px-4 py-2 text-sm">Refresh</button>
            </div>

            <section className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Student Profiles ({inquiries.length})</h3>
                <div className="overflow-hidden rounded-xl border bg-white shadow-soft">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-aviation-50/50 uppercase text-ink/50">
                            <tr>
                                <th className="px-4 py-3 font-bold">Name</th>
                                <th className="px-4 py-3 font-bold">Phone</th>
                                <th className="px-4 py-3 font-bold">Status</th>
                                <th className="px-4 py-3 font-bold">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {inquiries.map((lead) => (
                                <tr key={lead.id} className="hover:bg-aviation-50/20">
                                    <td className="px-4 py-3 font-medium">{lead.name}</td>
                                    <td className="px-4 py-3">{lead.phone}</td>
                                    <td className="px-4 py-3">
                                        <select
                                            value={lead.status}
                                            onChange={(e) => updateStatus(lead.id, e.target.value)}
                                            className="rounded border border-aviation-200 bg-transparent px-2 py-1 text-xs"
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="processing">Processing</option>
                                            <option value="enrolled">Enrolled</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button
                                            onClick={() => setDeleteConfirm({ id: lead.id, type: "user", title: lead.name })}
                                            className="text-red-500 hover:underline"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Simplified views for registrations and bookings */}
            <section className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Course Registrations ({registrations.length})</h3>
                    <div className="space-y-2">
                        {registrations.map((r: any) => (
                            <div key={r.id} className="flex items-center justify-between rounded-lg border bg-white p-3 shadow-sm">
                                <div>
                                    <p className="text-sm font-bold">{r.name}</p>
                                    <p className="text-xs text-ink/60">{r.course || "General"}</p>
                                </div>
                                <button
                                    onClick={() => setDeleteConfirm({ id: r.id, type: "registration", title: r.name })}
                                    className="rounded border border-red-100 bg-red-50 px-2 py-1 text-xs text-red-600"
                                >
                                    Delete
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Direct Bookings ({bookings.length})</h3>
                    <div className="space-y-2">
                        {bookings.map((b: any) => (
                            <div key={b.id} className="flex items-center justify-between rounded-lg border bg-white p-3 shadow-sm">
                                <div>
                                    <p className="text-sm font-bold">{b.name}</p>
                                    <p className="text-xs text-ink/60">{b.service || "Booking"}</p>
                                </div>
                                <button
                                    onClick={() => setDeleteConfirm({ id: b.id, type: "booking", title: b.name })}
                                    className="rounded border border-red-100 bg-red-50 px-2 py-1 text-xs text-red-600"
                                >
                                    Delete
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
