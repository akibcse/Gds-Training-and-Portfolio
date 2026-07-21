"use client";

import { useEffect, useState } from "react";
import {
    Users,
    Search,
    Filter,
    Download,
    Mail,
    Phone,
    MessageSquare,
    Clock,
    CheckCircle,
    XCircle,
    MoreVertical
} from "lucide-react";
import DataTable from "@/components/admin/DataTable";
import ConfirmModal from "@/components/admin/ConfirmModal";
import Toast, { useToast } from "@/components/admin/Toast";

interface Lead {
    id: string;
    name: string;
    email: string;
    phone: string;
    message: string;
    course: string;
    status: "New" | "Contacted" | "Converted";
    notes?: string;
    createdAt: string;
}

export default function LeadsPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState<Lead | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [statusFilter, setStatusFilter] = useState("All");

    const { toast, showToast, hideToast } = useToast();

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/admin/leads");
            const data = await res.json();
            setLeads(data);
        } catch {
            showToast("Failed to fetch leads", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (leadId: string, newStatus: string) => {
        try {
            const res = await fetch(`/api/admin/leads/${leadId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus as any } : l));
                showToast("Status updated", "success");
            }
        } catch {
            showToast("Failed to update status", "error");
        }
    };

    const handleDelete = async () => {
        if (!isDeleting) return;
        setIsSaving(true);
        try {
            const res = await fetch(`/api/admin/leads/${isDeleting.id}`, { method: "DELETE" });
            if (res.ok) {
                showToast("Lead deleted", "success");
                setLeads(prev => prev.filter(l => l.id !== isDeleting.id));
                setIsDeleting(null);
            }
        } catch {
            showToast("Failed to delete lead", "error");
        } finally {
            setIsSaving(false);
        }
    };

    const exportCsv = () => {
        const headers = ["Name", "Email", "Phone", "Course", "Status", "Date"];
        const rows = leads.map(l => [
            l.name,
            l.email,
            l.phone,
            l.course,
            l.status,
            new Date(l.createdAt).toLocaleDateString()
        ]);

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `leads-export-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredLeads = statusFilter === "All"
        ? leads
        : leads.filter(l => l.status === statusFilter);

    const columns = [
        {
            header: "Lead Info",
            accessor: (l: Lead) => (
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-aviation-50 text-aviation-600 flex items-center justify-center font-bold">
                        {l.name.charAt(0)}
                    </div>
                    <div>
                        <p className="font-bold text-ink">{l.name}</p>
                        <p className="text-xs text-ink/40">{new Date(l.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>
            )
        },
        {
            header: "Contact",
            accessor: (l: Lead) => (
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-medium text-ink/60">
                        <Mail className="h-3 w-3" /> {l.email}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-medium text-ink/60">
                        <Phone className="h-3 w-3" /> {l.phone}
                    </div>
                </div>
            )
        },
        {
            header: "Course & Request Type",
            accessor: (l: Lead) => (
                <div className="space-y-1">
                    <span className="inline-block rounded-lg bg-aviation-50 px-2.5 py-1 text-xs font-bold text-aviation-700">
                        {l.course}
                    </span>
                    {l.message && (
                        <div className="text-[11px] font-semibold text-cyan-700 bg-cyan-50 border border-cyan-100 rounded px-2 py-0.5 w-fit">
                            {l.message}
                        </div>
                    )}
                </div>
            )
        },
        {
            header: "Status",
            accessor: (l: Lead) => (
                <select
                    value={l.status}
                    onChange={(e) => handleStatusUpdate(l.id, e.target.value)}
                    className={`rounded-full px-3 py-1.5 text-xs font-bold outline-none border-none cursor-pointer transition-all ${l.status === "New" ? "bg-blue-50 text-blue-600" :
                            l.status === "Contacted" ? "bg-amber-50 text-amber-600" :
                                "bg-emerald-50 text-emerald-600"
                        }`}
                >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Converted">Converted</option>
                </select>
            )
        }
    ];

    const stats = [
        { label: "Total Leads", value: leads.length, icon: Users, color: "bg-blue-600" },
        { label: "New Leads", value: leads.filter(l => l.status === "New").length, icon: Clock, color: "bg-orange-500" },
        { label: "Converted", value: leads.filter(l => l.status === "Converted").length, icon: CheckCircle, color: "bg-emerald-600" },
    ];

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-ink tracking-tight">Leads CRM</h1>
                    <p className="mt-1 text-ink/50">Track and manage student enrollment interest.</p>
                </div>
                <button
                    onClick={exportCsv}
                    className="flex items-center gap-2 rounded-2xl border border-aviation-100 bg-white px-6 py-3 text-sm font-bold text-ink shadow-soft hover:bg-aviation-50 active:scale-95 transition-all"
                >
                    <Download className="h-5 w-5" />
                    Export CSV
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {stats.map((s, i) => (
                    <div key={i} className="rounded-3xl border border-aviation-100 bg-white p-6 shadow-soft">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-2xl text-white ${s.color}`}>
                                <s.icon className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-ink/40">{s.label}</p>
                                <p className="text-2xl font-bold text-ink">{s.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex items-center gap-4">
                <div className="flex rounded-2xl bg-aviation-50/50 p-1">
                    {["All", "New", "Contacted", "Converted"].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setStatusFilter(tab)}
                            className={`rounded-xl px-5 py-2 text-sm font-bold transition-all ${statusFilter === tab ? "bg-white text-aviation-600 shadow-soft" : "text-ink/40 hover:text-ink/60"}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            <DataTable
                data={filteredLeads}
                columns={columns}
                loading={loading}
                onDelete={(item) => setIsDeleting(item)}
                searchPlaceholder="Search leads by name, email or phone..."
            />

            {/* Delete Confirmation */}
            <ConfirmModal
                isOpen={!!isDeleting}
                onClose={() => setIsDeleting(null)}
                onConfirm={handleDelete}
                isLoading={isSaving}
                title="Delete Lead Record"
                message={`Are you sure you want to delete the record for "${isDeleting?.name}"? This will permanently remove their information from the CRM.`}
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
