import Link from "next/link";
import { getProfile } from "@/lib/getData";
import { getFooterItems } from "@/lib/cms/footer";

const DEFAULT_FOOTER = [
  { id: "1", title: "About", content: "Certified GDS Instructor portfolio for Air Ticketing Course in Bangladesh, practical GDS Training in Dhaka, Sabre, Galileo, and airline reservation mentoring.", order: 1, isActive: true },
  { id: "2", title: "Quick Links", content: "Explore our offerings.", order: 2, isActive: true },
  { id: "3", title: "Lead Desk", content: "Contact us for more details.", order: 3, isActive: true }
];

export default async function Footer() {
  const profile = await getProfile();
  let footerSections = await getFooterItems();

  if (!footerSections || footerSections.length === 0) {
    footerSections = DEFAULT_FOOTER as any;
  } else {
    footerSections = footerSections.filter(section => section.isActive);
  }

  return (
    <footer className="mt-16 border-t border-aviation-100 bg-gradient-to-br from-indigo-50 to-blue-100">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 md:grid-cols-3 md:px-6">
        {footerSections.map((section) => (
          <div key={section.id}>
            <h3 className="text-lg font-semibold text-ink">{section.title}</h3>
            {/* 
              Special cases for Quick Links and Lead Desk to preserve rich layouts while 
              using CMS data as a fallback or for new sections.
            */}
            {section.title === "Quick Links" ? (
              <ul className="mt-2 space-y-2 text-sm text-ink/80">
                <li><Link href="/">Home</Link></li>
                <li><Link href="/courses">All Courses</Link></li>
                <li><Link href="/about">About</Link></li>
                <li><Link href="/contact">Contact</Link></li>
                <li><a href="https://facebook.com/roadyakib" target="_blank" rel="noreferrer">Facebook</a></li>
                <li><a href="https://linkedin.com/in/akibcse" target="_blank" rel="noreferrer">LinkedIn</a></li>
              </ul>
            ) : section.title === "Lead Desk" ? (
              <div className="mt-2 space-y-2">
                <p className="text-sm text-ink/80">
                  Email: <a className="underline" href={`mailto:${profile.email}`}>{profile.email}</a>
                </p>
                <p className="text-sm text-ink/80">
                  Phone: {profile.phone}
                </p>
              </div>
            ) : (
              <div
                className="mt-2 text-sm text-ink/80 prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: section.content }}
              />
            )}
          </div>
        ))}
      </div>
      <div className="border-t border-aviation-100/30 py-6 text-center">
        <p className="text-xs text-ink/40">© {new Date().getFullYear()} {profile.name} • Professional GDS Training</p>
      </div>
    </footer>
  );
}
