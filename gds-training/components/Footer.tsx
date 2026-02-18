import { get, ref } from "firebase/database";
import { getFirebaseDatabase } from "@/lib/firebase";

type FooterSection = {
  id: string;
  title: string;
  content: string;
  order: number;
  isActive: boolean;
};

const DEFAULT_FOOTER: FooterSection[] = [
  {
    id: "1",
    title: "About",
    content:
      "Certified GDS Instructor portfolio for Air Ticketing Course in Bangladesh, practical GDS Training in Dhaka, Sabre, Galileo, and airline reservation mentoring.",
    order: 1,
    isActive: true
  },
  {
    id: "2",
    title: "Quick Links",
    content:
      "<ul class=\"mt-2 space-y-2 text-sm text-ink/80\"><li><a href=\"/\">Home</a></li><li><a href=\"/courses\">All Courses</a></li><li><a href=\"/about\">About</a></li><li><a href=\"/contact\">Contact</a></li><li><a href=\"https://facebook.com/roadyakib\" target=\"_blank\" rel=\"noreferrer\">Facebook</a></li><li><a href=\"https://linkedin.com/in/akibcse\" target=\"_blank\" rel=\"noreferrer\">LinkedIn</a></li></ul>",
    order: 2,
    isActive: true
  },
  {
    id: "3",
    title: "Lead Desk",
    content:
      "<p class=\"mt-2 text-sm text-ink/80\">Email: <a class=\"underline\" href=\"mailto:roadyakib@gmail.com\">roadyakib@gmail.com</a></p><p class=\"text-sm text-ink/80\">Phone: 01521438546</p>",
    order: 3,
    isActive: true
  }
];

const mapFooterObjectToArray = (input: unknown): FooterSection[] => {
  if (!input) return [];
  if (Array.isArray(input)) return input as FooterSection[];
  const records = input as Record<string, Omit<FooterSection, "id">>;
  return Object.entries(records).map(([id, value]) => ({
    id,
    title: value?.title || "",
    content: value?.content || "",
    order: Number(value?.order) || 0,
    isActive: Boolean(value?.isActive)
  }));
};

const getFooterSections = async (): Promise<FooterSection[]> => {
  try {
    const db = getFirebaseDatabase();
    if (!db) return DEFAULT_FOOTER;
    const snapshot = await get(ref(db, "footer"));
    const sections = mapFooterObjectToArray(snapshot.val());
    if (!sections || sections.length === 0) return DEFAULT_FOOTER;
    return sections.filter((section) => section.isActive).sort((a, b) => a.order - b.order);
  } catch {
    return DEFAULT_FOOTER;
  }
};

export default async function Footer() {
  const footerSections = await getFooterSections();

  return (
    <footer className="mt-16 border-t border-aviation-100 bg-gradient-to-br from-indigo-50 to-blue-100">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 md:grid-cols-3 md:px-6">
        {footerSections.map((section) => (
          <div key={section.id}>
            <h3 className="text-lg font-semibold text-ink">{section.title}</h3>
            <div className="mt-2" dangerouslySetInnerHTML={{ __html: section.content || "" }} />
          </div>
        ))}
      </div>
    </footer>
  );
}
