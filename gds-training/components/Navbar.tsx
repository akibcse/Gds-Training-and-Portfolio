import Link from "next/link";
import { getProfile } from "@/lib/getData";
import { getNavbar } from "@/lib/cms/navbar";
import AuthButtons from "./AuthButtons";

const DEFAULT_NAVBAR = [
  { id: "1", label: "Home", url: "/", order: 1, isActive: true },
  { id: "2", label: "Courses", url: "/courses", order: 2, isActive: true },
  { id: "3", label: "Blog", url: "/blog", order: 3, isActive: true },
  { id: "4", label: "Portfolio", url: "/portfolio", order: 4, isActive: true },
  { id: "5", label: "About", url: "/about", order: 5, isActive: true },
  { id: "6", label: "Contact", url: "/contact", order: 6, isActive: true }
];

export default async function Navbar() {
  const profile = await getProfile();
  let navItems = await getNavbar();

  if (!navItems || navItems.length === 0) {
    navItems = DEFAULT_NAVBAR as any;
  } else {
    navItems = navItems.filter(item => item.isActive);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-aviation-100/70 bg-white/85 backdrop-blur">
      <nav aria-label="Primary" className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
        <Link href="/" className="bg-gradient-to-r from-aviation-700 to-cyan-600 bg-clip-text text-lg font-bold text-transparent">
          {profile.name}
        </Link>
        <ul className="hidden items-center gap-5 text-sm font-medium text-ink/80 md:flex">
          {navItems.map((link) => (
            <li key={link.id}>
              <Link href={link.url} className="transition hover:text-aviation-600">
                {link.label}
              </Link>
            </li>
          ))}
          <Link
            href="/courses"
            className="font-bold text-aviation-600 transition hover:text-aviation-700"
          >
            Buy Courses
          </Link>
          <a
            href="/#lead-form"
            className="rounded-full bg-gradient-to-r from-cta-500 to-cta-600 px-4 py-2 text-white shadow-soft transition hover:brightness-105"
          >
            Enroll Now
          </a>
          <AuthButtons />
        </ul>
        <div className="flex items-center gap-3 md:hidden">
          <Link
            href="/courses"
            className="text-xs font-bold text-aviation-600"
          >
            Buy Courses
          </Link>
          <a
            href="/#lead-form"
            className="rounded-full bg-gradient-to-r from-cta-500 to-cta-600 px-3 py-1.5 text-xs font-semibold text-white shadow-soft"
          >
            Enroll
          </a>
          <AuthButtons />
        </div>
      </nav>
    </header>
  );
}
