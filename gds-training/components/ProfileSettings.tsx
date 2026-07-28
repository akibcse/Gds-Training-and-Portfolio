"use client";

import { useEffect, useState } from "react";
import {
  EmailAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  updatePassword,
  verifyBeforeUpdateEmail,
  updateProfile,
  type User
} from "firebase/auth";
import { getFirebaseAuth, db } from "@/lib/firebase";
import { ref, update } from "firebase/database";
import { useAuthStore } from "@/store/useAuthStore";
import { User as UserIcon } from "lucide-react";

export default function ProfileSettings() {
  const { profile, setProfile } = useAuthStore();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [emailError, setEmailError] = useState("");
  const [emailSuccess, setEmailSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const [displayName, setDisplayName] = useState("");
  const [photoURL, setPhotoURL] = useState("");
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
      if (nextUser) {
        setDisplayName(nextUser.displayName || profile?.displayName || "");
        setPhotoURL(nextUser.photoURL || profile?.photoURL || "");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [profile]);

  const reauthenticate = async () => {
    const auth = getFirebaseAuth();
    const currentUser = auth?.currentUser;

    if (!currentUser?.email) {
      throw new Error("No authenticated user found.");
    }

    if (!currentPassword) {
      throw new Error("Current password is required to save changes.");
    }

    const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
    await reauthenticateWithCredential(currentUser, credential);
    return currentUser;
  };

  const handleProfileUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    setProfileError("");
    setProfileSuccess("");
    setSavingProfile(true);

    try {
      const auth = getFirebaseAuth();
      const currentUser = auth?.currentUser;
      if (!currentUser) throw new Error("No authenticated user found.");

      // Update Firebase Auth Profile
      await updateProfile(currentUser, {
        displayName: displayName.trim(),
        photoURL: photoURL.trim(),
      });

      // Update Realtime DB
      await update(ref(db, `users/${currentUser.uid}`), {
        displayName: displayName.trim(),
        photoURL: photoURL.trim(),
      });

      // Update Zustand store
      if (profile) {
        setProfile({
          ...profile,
          displayName: displayName.trim(),
          photoURL: photoURL.trim(),
        });
      }

      setProfileSuccess("Profile information updated successfully.");
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : "Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleEmailUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    setEmailError("");
    setEmailSuccess("");
    setSavingEmail(true);

    try {
      const currentUser = await reauthenticate();
      await verifyBeforeUpdateEmail(currentUser, newEmail.trim());
      setEmailSuccess("Verification email sent. Confirm it to complete email update.");
    } catch (updateError) {
      setEmailError(updateError instanceof Error ? updateError.message : "Failed to update email.");
    } finally {
      setSavingEmail(false);
    }
  };

  const handlePasswordUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirm password do not match.");
      return;
    }

    setSavingPassword(true);
    try {
      const currentUser = await reauthenticate();
      await updatePassword(currentUser, newPassword);
      setPasswordSuccess("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (updateError) {
      setPasswordError(updateError instanceof Error ? updateError.message : "Failed to update password.");
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-sm text-ink/70">Loading account settings...</div>;
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h2 className="mb-2 text-2xl font-bold text-ink">Account Settings</h2>
      <p className="mb-6 text-sm text-ink/70">Signed in as {user?.email || "Unknown"}</p>

      <div className="space-y-6">
        {/* Profile Settings */}
        <form onSubmit={handleProfileUpdate} className="rounded-xl border border-aviation-200 bg-white p-5">
          <h3 className="mb-4 text-lg font-semibold text-ink">Profile Information</h3>
          
          {profileError ? <div className="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-700">{profileError}</div> : null}
          {profileSuccess ? <div className="mb-4 rounded-lg bg-green-100 p-3 text-sm text-green-700">{profileSuccess}</div> : null}

          <div className="space-y-4">
            <div className="flex items-center gap-4 mb-4">
              {photoURL ? (
                <img src={photoURL} alt="Profile" className="h-16 w-16 rounded-full object-cover border border-aviation-200" />
              ) : (
                <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center">
                  <UserIcon className="h-8 w-8 text-slate-400" />
                </div>
              )}
              <div className="flex-1">
                <label className="mb-1 block text-sm font-medium text-ink">Image URL (Optional)</label>
                <input
                  type="url"
                  value={photoURL}
                  onChange={(event) => setPhotoURL(event.target.value)}
                  placeholder="https://example.com/photo.jpg"
                  className="w-full rounded-lg border border-aviation-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-aviation-500"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="Enter your full name"
                className="w-full rounded-lg border border-aviation-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-aviation-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={savingProfile}
            className="mt-4 rounded-lg bg-aviation-600 px-4 py-2 text-white font-medium shadow transition hover:bg-aviation-700 disabled:opacity-60"
          >
            {savingProfile ? "Saving..." : "Save Profile"}
          </button>
        </form>

        {/* Email Update */}
        <form onSubmit={handleEmailUpdate} className="rounded-xl border border-aviation-200 bg-white p-5">
          <h3 className="mb-4 text-lg font-semibold text-ink">Change Email</h3>
          
          {emailError ? <div className="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-700">{emailError}</div> : null}
          {emailSuccess ? <div className="mb-4 rounded-lg bg-green-100 p-3 text-sm text-green-700">{emailSuccess}</div> : null}

          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">New Email</label>
              <input
                type="email"
                value={newEmail}
                onChange={(event) => setNewEmail(event.target.value)}
                className="w-full rounded-lg border border-aviation-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-aviation-500"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                className="w-full rounded-lg border border-aviation-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-aviation-500"
                required
              />
              <p className="mt-1 text-xs text-slate-500">Required to authorize sensitive changes.</p>
            </div>
          </div>

          <button
            type="submit"
            disabled={savingEmail}
            className="mt-4 rounded-lg bg-aviation-600 px-4 py-2 text-white font-medium shadow transition hover:bg-aviation-700 disabled:opacity-60"
          >
            {savingEmail ? "Updating..." : "Update Email"}
          </button>
        </form>

        {/* Password Update */}
        <form onSubmit={handlePasswordUpdate} className="rounded-xl border border-aviation-200 bg-white p-5">
          <h3 className="mb-4 text-lg font-semibold text-ink">Change Password</h3>

          {passwordError ? <div className="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-700">{passwordError}</div> : null}
          {passwordSuccess ? <div className="mb-4 rounded-lg bg-green-100 p-3 text-sm text-green-700">{passwordSuccess}</div> : null}

          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                className="w-full rounded-lg border border-aviation-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-aviation-500"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                className="w-full rounded-lg border border-aviation-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-aviation-500"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="w-full rounded-lg border border-aviation-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-aviation-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={savingPassword}
            className="mt-4 rounded-lg bg-aviation-600 px-4 py-2 text-white font-medium shadow transition hover:bg-aviation-700 disabled:opacity-60"
          >
            {savingPassword ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
