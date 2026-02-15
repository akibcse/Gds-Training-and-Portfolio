import Link from "next/link";
import { getProfile } from "@/lib/getData";
import { readJsonFile } from "@/lib/storage";

type NavbarItem = {
  id: string;
  label: string;
  url: string;
  order: number;
  isActive: boolean;
};

const DEFAULT_NAVBAR: NavbarItem[] = [
  { id: "1", label: "Home", url: "/", order: 1, isActive: true },
  { id: "2", label: "Courses", url: "/courses", order: 2, isActive: true },
  { id: "3", label: "Blog", url: "/blog", order: 3, isActive: true },
  { id: "4", label: "Portfolio", url: "/portfolio", order: 4, isActive: true },
  { id: "5", label: "About", url: "/about", order: 5, isActive: true },
  { id: "6", label: "Contact", url: "/contact", order: 6, isActive: true }
];

const getNavbarItems = async (): Promise<NavbarItem[]> => {
  try {
    const items = await readJsonFile<NavbarItem[]>("navbar.json");
    if (!items || items.length === 0) {
      return DEFAULT_NAVBAR;
    }
    return items.filter(item => item.isActive).sort((a, b) => a.order - b.order);
  } catch {
    return DEFAULT_NAVBAR;
  }
};

export default async function Navbar() {
  const profile = await getProfile();
  const navItems = await getNavbarItems();

  return (
    <header className="sticky top-0 z-50 border-b border-aviation-100/70 bg-white/85 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
        <Link href="/" className="bg-gradient-to-r from-aviation-700 to-cyan-600 bg-clip-text text-lg font-bold text-transparent">
          {profile.name}
        </Link>
        <div className="hidden items-center gap-5 text-sm font-medium text-ink/80 md:flex">
          {navItems.map((link) => (
            <Link key={link.id} href={link.url} className="transition hover:text-aviation-600">
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
