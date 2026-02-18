import Link from "next/link";
import { getProfile } from "@/lib/getData";
import { readJsonFile } from "@/lib/storage";

type FooterSection = {
  id: string;
  title: string;
  content: string;
  order: number;
  isActive: boolean;
};

const DEFAULT_FOOTER: FooterSection[] = [
  { id: "1", title: "About", content: "Certified GDS Instructor portfolio for Air Ticketing Course in Bangladesh, practical GDS Training in Dhaka, Sabre, Galileo, and airline reservation mentoring.", order: 1, isActive: true },
  { id: "2", title: "Quick Links", content: "", order: 2, isActive: true },
  { id: "3", title: "Lead Desk", content: "", order: 3, isActive: true }
];

const getFooterSections = async (): Promise<FooterSection[]> => {
  try {
    const sections = await readJsonFile<FooterSection[]>("footer.json");
    if (!sections || sections.length === 0) {
      return DEFAULT_FOOTER;
    }
    return sections.filter(section => section.isActive).sort((a, b) => a.order - b.order);
  } catch {
    return DEFAULT_FOOTER;
  }
};

export default async function Footer() {
  const profile = await getProfile();
  const footerSections = await getFooterSections();

  const quickLinksContent = `
    <ul class="mt-2 space-y-2 text-sm text-ink/80">
      <li><a href="/about">About</a></li>
      <li><a href="/contact">Contact</a></li>
      <li><a href="/courses/air-ticketing-gds-masterclass">Air Ticketing Course</a></li>
      <li><a href="/admin/login">Admin Login</a></li>
    </ul>
  `;

  const leadDeskContent = `
    <p class="mt-2 text-sm text-ink/80">
      Email: <a class="underline" href="mailto:${profile.email}">${profile.email}</a>
    </p>
    <p class="text-sm text-ink/80">
      Phone: ${profile.phone}
    </p>
  `;

  const getSectionContent = (section: FooterSection) => {
    if (section.title === "Quick Links") return { __html: quickLinksContent };
    if (section.title === "Lead Desk") return { __html: leadDeskContent };
    return { __html: section.content };
  };

  return (
    <footer className="mt-16 border-t border-aviation-100 bg-gradient-to-br from-indigo-50 to-blue-100">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 md:grid-cols-3 md:px-6">
        {footerSections.map((section) => (
          <div key={section.id}>
            <h3 className="text-lg font-semibold text-ink">{section.title}</h3>
            {section.title === "About" ? (
              <p className="mt-2 text-sm text-ink/80">
                {section.content || "Certified GDS Instructor portfolio for Air Ticketing Course in Bangladesh, practical GDS Training in Dhaka, Sabre, Galileo, and airline reservation mentoring."}
              </p>
            ) : section.title === "Quick Links" ? (
              <ul className="mt-2 space-y-2 text-sm text-ink/80">
                <li><Link href="/">Home</Link></li>
                <li><Link href="/courses">All Courses</Link></li>
                <li><Link href="/about">About</Link></li>
                <li><Link href="/contact">Contact</Link></li>
                <li><a href="https://facebook.com/roadyakib" target="_blank" rel="noreferrer">Facebook</a></li>
                <li><a href="https://linkedin.com/in/akibcse" target="_blank" rel="noreferrer">LinkedIn</a></li>
              </ul>
            ) : section.title === "Lead Desk" ? (
              <>
                <p className="mt-2 text-sm text-ink/80">
                  Email: <a className="underline" href={`mailto:${profile.email}`}>{profile.email}</a>
                </p>
                <p className="text-sm text-ink/80">
                  Phone: {profile.phone}
                </p>
              </>
            ) : (
              <div dangerouslySetInnerHTML={getSectionContent(section)} />
            )}
          </div>
        ))}
      </div>
    </footer>
  );
}
