import Link from "next/link";
import { getProfile } from "@/lib/getData";

const links = [
  { href: "/", label: "Home" },
  { href: "/courses", label: "Courses" },
  { href: "/blog", label: "Blog" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" }
];

export default async function Navbar() {
  const profile = await getProfile();

  return (
    <header className="sticky top-0 z-50 border-b border-aviation-100/70 bg-white/85 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
        <Link href="/" className="bg-gradient-to-r from-aviation-700 to-cyan-600 bg-clip-text text-lg font-bold text-transparent">
          {profile.name}
        </Link>
        <div className="hidden items-center gap-5 text-sm font-medium text-ink/80 md:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="transition hover:text-aviation-600">
              {link.label}
            </Link>
          ))}
          <a
            href="/#lead-form"
            className="rounded-full bg-gradient-to-r from-cta-500 to-cta-600 px-4 py-2 text-white shadow-soft transition hover:brightness-105"
          >
            Enroll Now
          </a>
        </div>
        <a
          href="/#lead-form"
          className="rounded-full bg-gradient-to-r from-cta-500 to-cta-600 px-3 py-1.5 text-xs font-semibold text-white shadow-soft md:hidden"
        >
          Enroll
        </a>
      </nav>
    </header>
  );
}
