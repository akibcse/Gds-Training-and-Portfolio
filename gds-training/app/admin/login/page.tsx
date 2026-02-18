"use client";

import { type FormEvent, useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { getFirebaseAuth } from "@/lib/firebase";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    const auth = getFirebaseAuth();
    if (!auth) {
      setError("Firebase auth is not available.");
      setLoading(false);
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const idToken = await userCredential.user.getIdToken();

      // Exchange Firebase token for legacy session cookie
      await fetch("/api/admin/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`
        }
      });

      router.replace("/admin/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      setError("Invalid admin email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto flex min-h-[70vh] max-w-xl items-center px-4 py-12">
      <form onSubmit={handleSubmit} className="w-full space-y-4 rounded-2xl border border-aviation-100 bg-white p-6 shadow-soft">
        <h1 className="text-3xl font-semibold text-ink">Admin Login</h1>
        <p className="text-sm text-ink/75">Sign in with your Firebase admin email and password.</p>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Admin Email</label>
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-lg border border-aviation-200 px-3 py-2 text-sm"
            placeholder="Enter admin email"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Password</label>
          <input
            value={password}
            type="password"
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-lg border border-aviation-200 px-3 py-2 text-sm"
            placeholder="Enter admin password"
            required
          />
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-gradient-to-r from-aviation-600 to-cyan-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>
      </form>
    </section>
  );
}
