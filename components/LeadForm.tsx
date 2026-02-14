"use client";

import { type FormEvent, useState } from "react";

type FormState = {
  name: string;
  email: string;
  phone: string;
  course: string;
  leadType: "registration" | "booking";
};

const initialState: FormState = {
  name: "",
  email: "",
  phone: "",
  course: "Air Ticketing Course + GDS Training Masterclass",
  leadType: "registration"
};

export default function LeadForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.name || !form.email || !form.phone) {
      setError("Please complete all required fields for enrollment assistance.");
      return;
    }

    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
    if (!emailValid) {
      setError("Please enter a valid email address.");
      return;
    }

    const response = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        phone: form.phone,
        course: form.course,
        type: form.leadType
      })
    });

    if (!response.ok) {
      setError("Could not save your request. Please try again.");
      return;
    }

    setSuccess(
      form.leadType === "booking"
        ? "Thanks! Your demo booking is submitted. Our advisor will contact you shortly."
        : "Thanks! Your registration request has been captured. Our advisor will contact you shortly."
    );
    setForm(initialState);
  };

  return (
    <form id="lead-form" onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-aviation-100 bg-white p-6 shadow-soft">
      <h3 className="text-xl font-semibold text-ink">Book a Free Demo Class</h3>
      <p className="text-sm text-ink/75">
        Start your Air Ticketing Course in Dhaka and get a personalized roadmap for GDS Training.
      </p>
      <div>
        <label className="mb-1 block text-xs font-medium text-ink">Full Name *</label>
        <input
          value={form.name}
          onChange={(e) => updateField("name", e.target.value)}
          className="w-full rounded-lg border border-aviation-100 px-3 py-2 text-sm outline-none ring-cyan-500 focus:ring"
          placeholder="Your name"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-ink">Email *</label>
        <input
          value={form.email}
          onChange={(e) => updateField("email", e.target.value)}
          className="w-full rounded-lg border border-aviation-100 px-3 py-2 text-sm outline-none ring-cyan-500 focus:ring"
          placeholder="you@example.com"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-ink">Phone *</label>
        <input
          value={form.phone}
          onChange={(e) => updateField("phone", e.target.value)}
          className="w-full rounded-lg border border-aviation-100 px-3 py-2 text-sm outline-none ring-cyan-500 focus:ring"
          placeholder="01XXXXXXXXX"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-ink">Request Type</label>
        <select
          value={form.leadType}
          onChange={(e) => updateField("leadType", e.target.value as FormState["leadType"])}
          className="w-full rounded-lg border border-aviation-100 px-3 py-2 text-sm outline-none ring-cyan-500 focus:ring"
        >
          <option value="registration">Course Registration</option>
          <option value="booking">Book Free Demo</option>
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-ink">Preferred Course</label>
        <input
          value={form.course}
          onChange={(e) => updateField("course", e.target.value)}
          className="w-full rounded-lg border border-aviation-100 px-3 py-2 text-sm outline-none ring-cyan-500 focus:ring"
        />
      </div>
      {error ? <p className="text-xs font-medium text-red-600">{error}</p> : null}
      {success ? <p className="text-xs font-medium text-aviation-700">{success}</p> : null}
      <button type="submit" className="w-full rounded-full bg-gradient-to-r from-aviation-600 to-cyan-500 px-4 py-2 text-sm font-semibold text-white transition hover:brightness-105">
        Enroll Now
      </button>
    </form>
  );
}
