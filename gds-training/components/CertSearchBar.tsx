"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Award } from "lucide-react";

export default function CertSearchBar() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(`/certificates/${encodeURIComponent(trimmed)}`);
    setQuery("");
    setOpen(false);
  };

  return (
    <div className="relative flex items-center">
      {/* Toggle button (icon only when collapsed) */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          title="Verify E-Certificate"
          className="flex items-center gap-1.5 rounded-full border border-aviation-200 bg-aviation-50 px-3 py-1.5 text-xs font-semibold text-aviation-700 transition hover:bg-aviation-100"
        >
          <Award className="h-3.5 w-3.5" />
          Verify Certificate
        </button>
      )}

      {/* Expanded search input */}
      {open && (
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-1 rounded-full border border-aviation-300 bg-white px-3 py-1.5 shadow-sm ring-1 ring-aviation-200 transition-all"
        >
          <Award className="h-3.5 w-3.5 shrink-0 text-aviation-500" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onBlur={() => { if (!query.trim()) setOpen(false); }}
            placeholder="Enter certificate no…"
            className="w-36 bg-transparent text-xs text-ink outline-none placeholder:text-ink/40"
          />
          <button
            type="submit"
            className="flex h-5 w-5 items-center justify-center rounded-full bg-aviation-600 text-white transition hover:bg-aviation-700"
          >
            <Search className="h-3 w-3" />
          </button>
        </form>
      )}
    </div>
  );
}
