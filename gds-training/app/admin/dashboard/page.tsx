import Link from "next/link";

const cards = [
  {
    title: "Inquiries & Leads",
    description: "Manage student inquiries, course registrations, and enrollment status.",
    href: "/admin/leads"
  },
  {
    title: "Course Manager",
    description: "Create and update curriculum contents, software, and outcomes.",
    href: "/admin/courses"
  },
  {
    title: "Blog Management",
    description: "Write articles, manage SEO keywords, and related content clusters.",
    href: "/admin/blogs"
  },
  {
    title: "SEO Manager",
    description: "Control global metadata, default keywords, and per-page SEO overrides.",
    href: "/admin/seo"
  },
  {
    title: "Portfolio Showcase",
    description: "Highlight student and instructor projects with case studies.",
    href: "/admin/portfolio"
  },
  {
    title: "About & Profile",
    description: "Update personal biography, education history, and career highlights.",
    href: "/admin/about"
  },
  {
    title: "Navigation Manager",
    description: "Add, edit, reorder, and toggle public navbar items with realtime sync.",
    href: "/admin/navigation"
  },
  {
    title: "Footer Manager",
    description: "Maintain footer sections, ordering, and visibility without deploys.",
    href: "/admin/footer"
  },
  {
    title: "Account Settings",
    description: "Update admin account details and reset credentials from Firebase Auth.",
    href: "/admin/settings"
  }
];

export default function AdminDashboardPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-8 md:px-6">
      <h2 className="text-2xl font-semibold text-ink">Dashboard</h2>
      <p className="mt-2 text-sm text-ink/75">
        Manage site content modules powered by Firebase Authentication and Realtime Database.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <article key={card.href} className="rounded-xl border border-aviation-100 bg-white p-5 shadow-soft">
            <h3 className="text-lg font-semibold text-ink">{card.title}</h3>
            <p className="mt-2 text-sm text-ink/75">{card.description}</p>
            <Link
              href={card.href}
              className="mt-4 inline-flex rounded-full bg-gradient-to-r from-aviation-600 to-cyan-500 px-4 py-2 text-sm font-semibold text-white"
            >
              Open
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
