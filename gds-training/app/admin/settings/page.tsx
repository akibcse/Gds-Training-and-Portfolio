"use client";

import { useEffect, useState } from "react";
import {
  EmailAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  updatePassword,
  verifyBeforeUpdateEmail,
  type User
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";

export default function AdminSettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setNewEmail(nextUser?.email || "");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const reauthenticate = async () => {
    const auth = getFirebaseAuth();
    const currentUser = auth?.currentUser;

    if (!currentUser?.email) {
      throw new Error("No authenticated admin user found.");
    }

    const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
    await reauthenticateWithCredential(currentUser, credential);
    return currentUser;
  };

  const handleEmailUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const currentUser = await reauthenticate();
      await verifyBeforeUpdateEmail(currentUser, newEmail.trim());
      setSuccess("Verification email sent. Confirm it to complete email update.");
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Failed to update email.");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }

    setSaving(true);
    try {
      const currentUser = await reauthenticate();
      await updatePassword(currentUser, newPassword);
      setSuccess("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Failed to update password.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-sm text-ink/70">Loading account settings...</div>;
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h2 className="mb-2 text-2xl font-bold text-ink">Account Settings</h2>
      <p className="mb-6 text-sm text-ink/70">Signed in as {user?.email || "Unknown"}</p>

      {error ? <div className="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-700">{error}</div> : null}
      {success ? <div className="mb-4 rounded-lg bg-green-100 p-3 text-sm text-green-700">{success}</div> : null}

      <div className="space-y-6">
        <form onSubmit={handleEmailUpdate} className="rounded-xl border border-aviation-200 bg-white p-5">
          <h3 className="mb-4 text-lg font-semibold text-ink">Change Email</h3>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">New Email</label>
              <input
                type="email"
                value={newEmail}
                onChange={(event) => setNewEmail(event.target.value)}
                className="w-full rounded-lg border border-aviation-200 px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                className="w-full rounded-lg border border-aviation-200 px-3 py-2"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="mt-4 rounded-lg bg-aviation-600 px-4 py-2 text-white disabled:opacity-60"
          >
            {saving ? "Updating..." : "Update Email"}
          </button>
        </form>

        <form onSubmit={handlePasswordUpdate} className="rounded-xl border border-aviation-200 bg-white p-5">
          <h3 className="mb-4 text-lg font-semibold text-ink">Change Password</h3>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                className="w-full rounded-lg border border-aviation-200 px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                className="w-full rounded-lg border border-aviation-200 px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="w-full rounded-lg border border-aviation-200 px-3 py-2"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="mt-4 rounded-lg bg-aviation-600 px-4 py-2 text-white disabled:opacity-60"
          >
            {saving ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
