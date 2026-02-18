"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/admin/leads", { credentials: "include" });
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      fetchEmail();
    } catch {
      router.push("/admin/login");
    }
  };

  const fetchEmail = async () => {
    try {
      const res = await fetch("/api/admin/email", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setEmail(data.email || "");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/admin/email", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email })
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to update email");
        return;
      }

      setSuccess("Email updated successfully!");
    } catch {
      setError("An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match");
      setSaving(false);
      return;
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters");
      setSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword
        })
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to update password");
        return;
      }

      setSuccess("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setError("An error occurred");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-bold text-ink">Admin Settings</h1>

      {error && <div className="mb-4 rounded-lg bg-red-100 p-3 text-red-700">{error}</div>}
      {success && <div className="mb-4 rounded-lg bg-green-100 p-3 text-green-700">{success}</div>}

      <div className="space-y-6">
        <div className="rounded-xl border border-aviation-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-ink">Change Admin Email</h2>
          <form onSubmit={handleEmailSubmit}>
            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-ink">Admin Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-aviation-200 px-3 py-2"
                required
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-aviation-600 px-4 py-2 text-white hover:bg-aviation-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Update Email"}
            </button>
          </form>
        </div>

        <div className="rounded-xl border border-aviation-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-ink">Change Password</h2>
          <form onSubmit={handlePasswordSubmit}>
            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-ink">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full rounded-lg border border-aviation-200 px-3 py-2"
                required
              />
            </div>
            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-ink">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-lg border border-aviation-200 px-3 py-2"
                required
              />
            </div>
            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-ink">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg border border-aviation-200 px-3 py-2"
                required
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-aviation-600 px-4 py-2 text-white hover:bg-aviation-700 disabled:opacity-50"
            >
              {saving ? "Updating..." : "Change Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
