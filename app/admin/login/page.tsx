"use client";

import { type FormEvent, useState } from "react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      setError("Invalid admin email or password.");
      return;
    }

    window.location.href = "/admin";
  };

  return (
    <section className="mx-auto flex min-h-[70vh] max-w-xl items-center px-4 py-12">
      <form onSubmit={handleSubmit} className="w-full space-y-4 rounded-2xl border border-aviation-100 bg-white p-6 shadow-soft">
        <h1 className="text-3xl font-semibold text-ink">Admin Login</h1>
        <p className="text-sm text-ink/75">
          Login with your admin credentials to manage users, bookings, registrations, and testimonials.
        </p>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Admin Email</label>
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-lg border border-aviation-200 px-3 py-2 text-sm"
            placeholder="Enter admin email"
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
          />
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          className="w-full rounded-full bg-gradient-to-r from-aviation-600 to-cyan-500 px-4 py-2 text-sm font-semibold text-white"
        >
          Sign In
        </button>
      </form>
    </section>
  );
}
