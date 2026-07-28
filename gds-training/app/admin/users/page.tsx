"use client";

import { useEffect, useState } from "react";
import { Users, Shield, UserCheck, Mail, Phone, Trash2, Edit3, Search } from "lucide-react";
import DataTable from "@/components/admin/DataTable";
import ConfirmModal from "@/components/admin/ConfirmModal";
import Toast, { useToast } from "@/components/admin/Toast";
import type { UserProfile, UserRole } from "@/lib/cms/users";

export default function UsersManagementPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [isDeleting, setIsDeleting] = useState<UserProfile | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<UserRole>("student");

  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setUsers(data);
    } catch {
      showToast("Failed to fetch users list", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (user: UserProfile) => {
    setEditingUser(user);
    setFullName(user.fullName || user.displayName || user.name || "");
    setEmail(user.email || "");
    setPhone(user.phone || "");
    setRole(user.role || "student");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsSaving(true);

    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, phone, role })
      });

      if (res.ok) {
        showToast("User details updated successfully!", "success");
        setIsModalOpen(false);
        setEditingUser(null);
        fetchUsers();
      } else {
        showToast("Failed to update user", "error");
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
      const res = await fetch(`/api/admin/users/${isDeleting.id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("User record deleted", "success");
        setUsers((prev) => prev.filter((u) => u.id !== isDeleting.id));
        setIsDeleting(null);
      }
    } catch {
      showToast("Failed to delete user", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const columns = [
    {
      header: "User Profile",
      accessor: (u: UserProfile) => {
        const displayName = u.fullName || u.displayName || u.name || "Registered User";
        return (
          <div className="flex items-center gap-3">
            {u.photoURL ? (
              <img src={u.photoURL} alt={displayName} className="h-10 w-10 rounded-full object-cover border border-aviation-100" />
            ) : (
              <div className="h-10 w-10 rounded-full bg-aviation-100 text-aviation-700 flex items-center justify-center font-bold text-sm">
                {(displayName).substring(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <p className="font-bold text-ink">{displayName}</p>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <Mail className="h-3 w-3" /> {u.email}
              </p>
            </div>
          </div>
        );
      }
    },
    {
      header: "Role & Permission",
      accessor: (u: UserProfile) => {
        const badgeColors = {
          admin: "bg-purple-100 text-purple-700 border-purple-200",
          instructor: "bg-blue-100 text-blue-700 border-blue-200",
          student: "bg-emerald-100 text-emerald-700 border-emerald-200"
        };
        return (
          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold uppercase border ${badgeColors[u.role] || badgeColors.student}`}>
            <Shield className="h-3 w-3" />
            {u.role || "student"}
          </span>
        );
      }
    },
    {
      header: "Contact Phone",
      accessor: (u: UserProfile) => (
        <span className="text-xs font-mono text-slate-600 flex items-center gap-1">
          <Phone className="h-3 w-3 text-slate-400" />
          {u.phone || "Not Provided"}
        </span>
      )
    },
    {
      header: "Registered",
      accessor: (u: UserProfile) => (
        <span className="text-xs text-slate-500">
          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : u.updatedAt ? new Date(u.updatedAt).toLocaleDateString() : "Unknown"}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-ink tracking-tight flex items-center gap-3">
            <Users className="h-8 w-8 text-aviation-600" /> User Management
          </h1>
          <p className="mt-1 text-ink/50">Manage student, instructor, and admin accounts, roles, and permissions.</p>
        </div>
      </div>

      <DataTable
        data={users}
        columns={columns}
        loading={loading}
        onEdit={(item) => handleEditClick(item)}
        onDelete={(item) => setIsDeleting(item)}
        searchPlaceholder="Search users by name, email, or role..."
      />

      {/* Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl z-10 animate-in fade-in zoom-in duration-200">
            <h2 className="text-2xl font-bold text-ink">Edit User Account</h2>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm font-semibold outline-none focus:border-aviation-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm font-semibold outline-none focus:border-aviation-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone Number</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm font-semibold outline-none focus:border-aviation-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Assign System Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm font-bold bg-white outline-none focus:border-aviation-500"
                >
                  <option value="student">Student (Standard Course Access)</option>
                  <option value="instructor">Instructor (Course Content Creator)</option>
                  <option value="admin">Admin (Full System CMS Access)</option>
                </select>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 rounded-2xl border border-slate-200 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50">
                  Cancel
                </button>
                <button type="submit" disabled={isSaving} className="flex-1 rounded-2xl bg-aviation-600 py-3 text-sm font-bold text-white shadow-lg shadow-aviation-600/20 hover:brightness-105 disabled:opacity-50">
                  {isSaving ? "Saving..." : "Save Changes"}
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
        title="Delete User Account"
        message={`Are you sure you want to delete account for "${isDeleting?.fullName || isDeleting?.email}"?`}
      />

      {/* Toast Notification */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  );
}
