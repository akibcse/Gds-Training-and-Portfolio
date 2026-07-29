"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Award, Search } from "lucide-react";

type NavItem = {
  id: string;
  label: string;
  url: string;
  order: number;
  isActive: boolean;
};

type Props = {
  navItems: NavItem[];
};

export default function MobileMenu({ navItems }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [certQuery, setCertQuery] = useState("");
  const pathname = usePathname();
  const router = useRouter();

  const handleCertSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = certQuery.trim();
    if (!trimmed) return;
    router.push(`/certificates/${encodeURIComponent(trimmed)}`);
    setCertQuery("");
    setIsOpen(false);
  };

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <>
      {/* Hamburger button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-ink shadow-sm transition hover:bg-slate-50"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 top-[57px] z-40 bg-slate-950/40 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Slide-down drawer */}
      <div
        className={`fixed left-0 right-0 top-[57px] z-50 origin-top overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0 pointer-events-none"
        }`}
      >
        <div className="border-b border-aviation-100 bg-white/95 px-5 py-4 shadow-xl backdrop-blur-md">
          {/* Nav links */}
          <ul className="flex flex-col gap-1">
            {navItems
              .filter((link) => !link.url.toLowerCase().includes("callnow") && !link.label.toLowerCase().includes("call now"))
              .map((link) => (
              <li key={link.id}>
                <Link
                  href={link.url}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center rounded-xl px-4 py-3 text-sm font-medium transition ${
                    pathname === link.url
                      ? "bg-aviation-50 text-aviation-700 font-bold"
                      : "text-ink/80 hover:bg-slate-50 hover:text-aviation-600"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Divider */}
          <div className="my-3 h-px bg-slate-100" />

          {/* CTA buttons */}
          <div className="flex flex-col gap-2">
            {/* Certificate verifier */}
            <form
              onSubmit={handleCertSearch}
              className="flex items-center gap-2 rounded-xl border border-aviation-200 bg-aviation-50 px-4 py-3"
            >
              <Award className="h-4 w-4 shrink-0 text-aviation-600" />
              <input
                type="text"
                value={certQuery}
                onChange={(e) => setCertQuery(e.target.value)}
                placeholder="Verify certificate no…"
                className="flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink/40"
              />
              <button
                type="submit"
                className="flex h-6 w-6 items-center justify-center rounded-full bg-aviation-600 text-white"
              >
                <Search className="h-3.5 w-3.5" />
              </button>
            </form>
            <Link
              href="/courses"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center rounded-xl border border-aviation-200 bg-aviation-50 px-4 py-3 text-sm font-bold text-aviation-700 transition hover:bg-aviation-100"
            >
              Buy Courses
            </Link>
            <a
              href="/#lead-form"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center rounded-xl bg-gradient-to-r from-cta-500 to-cta-600 px-4 py-3 text-sm font-bold text-white shadow-md transition hover:brightness-105"
            >
              Enroll Now
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
