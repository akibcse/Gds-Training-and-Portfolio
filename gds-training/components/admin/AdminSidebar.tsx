"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/seo", label: "SEO" },
  { href: "/admin/navigation", label: "Navigation" },
  { href: "/admin/footer", label: "Footer" },
  { href: "/admin/courses", label: "Courses" },
  { href: "/admin/blogs", label: "Blogs" },
  { href: "/admin/portfolio", label: "Portfolio" },
  { href: "/admin/about", label: "About" },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/settings", label: "Settings" }
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full border-b border-aviation-100 bg-white md:min-h-screen md:w-64 md:border-b-0 md:border-r">
      <div className="px-4 py-4 md:px-6">
        <h2 className="text-lg font-semibold text-ink">Admin Panel</h2>
        <p className="text-xs text-ink/70">Firebase Auth + Realtime DB</p>
      </div>

      <nav className="px-3 pb-4 md:px-4" aria-label="Admin Navigation">
        <ul className="flex flex-wrap gap-2 md:block md:space-y-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`block rounded-lg px-3 py-2 text-sm transition ${isActive ? "bg-aviation-600 text-white" : "text-ink/80 hover:bg-aviation-50"
                    }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
