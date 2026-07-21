import { getProfile } from "@/lib/getData";
import { getFooterItems } from "@/lib/cms/footer";

export default async function Footer() {
  const profile = await getProfile();
  const footerSections = await getFooterItems();

  return (
    <footer className="mt-16 border-t border-aviation-100 bg-gradient-to-br from-indigo-50 to-blue-100">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-3 md:px-6">
        {footerSections.map((section) => (
          <div key={section.id} className="space-y-3">
            <h3 className="text-lg font-bold text-ink tracking-tight">{section.title}</h3>
            {section.content && (
              <div 
                className="text-sm text-ink/80 prose prose-sm max-w-none leading-relaxed prose-a:text-[#1D4ED8] prose-a:font-medium hover:prose-a:underline"
                dangerouslySetInnerHTML={{ __html: section.content }}
              />
            )}
          </div>
        ))}
      </div>

      <div className="border-t border-aviation-100/30 py-6 text-center">
        <p className="text-xs text-ink/50 font-medium">© {new Date().getFullYear()} {profile.name} • Professional GDS Training</p>
      </div>
    </footer>
  );
}
