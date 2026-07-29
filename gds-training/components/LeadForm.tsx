"use client";

import { type FormEvent, useState, useEffect } from "react";
import { ref, push, set } from "firebase/database";
import { db } from "@/lib/firebase";

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setError("");
    setSuccess("");
  }, []);

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess("");

    if (!form.name || !form.email || !form.phone) {
      setError("Please complete all required fields for enrollment assistance.");
      setIsSubmitting(false);
      return;
    }

    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
    if (!emailValid) {
      setError("Please enter a valid email address.");
      setIsSubmitting(false);
      return;
    }

    try {
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
        throw new Error("Failed to submit");
      }

      // Create Realtime Admin Notification
      try {
        const notifRef = push(ref(db, "notifications"));
        await set(notifRef, {
          id: notifRef.key,
          type: "new_lead",
          message: `New demo booking from ${form.name} (${form.phone}) for ${form.course}`,
          link: "/admin/leads",
          read: false,
          createdAt: new Date().toISOString()
        });
      } catch (notifErr) {
        console.warn("Could not push admin notification:", notifErr);
      }

      setSuccess(
        form.leadType === "booking"
          ? "Thanks! Your demo booking is submitted. Our advisor will contact you shortly."
          : "Thanks! Your registration request has been captured. Our advisor will contact you shortly."
      );
      setForm(initialState);
    } catch (err) {
      setError("Could not save your request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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
        <label className="mb-1 block text-xs font-medium text-ink">Email Address *</label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => updateField("email", e.target.value)}
          className="w-full rounded-lg border border-aviation-100 px-3 py-2 text-sm outline-none ring-cyan-500 focus:ring"
          placeholder="your.email@example.com"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-ink">Phone Number *</label>
        <input
          type="tel"
          value={form.phone}
          onChange={(e) => updateField("phone", e.target.value)}
          className="w-full rounded-lg border border-aviation-100 px-3 py-2 text-sm outline-none ring-cyan-500 focus:ring"
          placeholder="017XXXXXXXX"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-ink">Select Course</label>
        <select
          value={form.course}
          onChange={(e) => updateField("course", e.target.value)}
          className="w-full rounded-lg border border-aviation-100 bg-white px-3 py-2 text-sm outline-none ring-cyan-500 focus:ring"
        >
          <option value="Air Ticketing Course + GDS Training Masterclass">
            Air Ticketing Course + GDS Training Masterclass
          </option>
          <option value="Amadeus Airline Reservation Training">Amadeus Airline Reservation Training</option>
          <option value="Travelport GDS Training">Travelport GDS Training</option>
          <option value="Sabre GDS Training">Sabre GDS Training</option>
        </select>
      </div>

      {error && <p className="text-xs font-medium text-rose-600">{error}</p>}
      {success && <p className="text-xs font-medium text-emerald-600">{success}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-full bg-gradient-to-r from-aviation-600 to-cyan-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-105 disabled:opacity-50"
      >
        {isSubmitting ? "Submitting..." : "Submit Demo Class Request"}
      </button>
    </form>
  );
}
