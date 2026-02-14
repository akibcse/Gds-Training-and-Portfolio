import type { Metadata } from "next";
import LeadForm from "@/components/LeadForm";
import { getProfile, getSeo } from "@/lib/getData";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeo();
  const title = "Contact Md. Akib Hasan for GDS Training";
  const description =
    "Contact Md. Akib Hasan to enroll in Air Ticketing Course and practical GDS Training in Dhaka for Sabre and Galileo based reservation careers.";

  return {
    title,
    description,
    keywords: ["GDS Training in Dhaka", "Amadeus Course Bangladesh", "Air Ticketing Course"],
    alternates: { canonical: "/contact" },
    openGraph: {
      title: `${title} | ${seo.siteName}`,
      description,
      url: `${seo.siteUrl}/contact`
    },
    twitter: { card: "summary", title, description }
  };
}

export default async function ContactPage() {
  const profile = await getProfile();

  return (
    <section className="mx-auto grid max-w-6xl gap-6 px-4 py-14 md:grid-cols-2 md:px-6">
      <div>
        <h1 className="font-[var(--font-serif)] text-4xl text-ink">Contact Admissions</h1>
        <p className="mt-3 text-sm text-ink/80">
          Talk to our advisors for batch schedule, fees, and scholarship guidance for Air Ticketing Course in Bangladesh.
        </p>
        <div className="mt-5 space-y-2 text-sm text-ink/90">
          <p>
            <strong>Phone:</strong> {profile.phone}
          </p>
          <p>
            <strong>Email:</strong> {profile.email}
          </p>
          <p>
            <strong>Address:</strong> {profile.address.street}, {profile.address.city}
          </p>
          <a href={profile.whatsapp} className="inline-flex rounded-full bg-gradient-to-r from-aviation-600 to-cyan-500 px-4 py-2 font-semibold text-white">
            Chat on WhatsApp
          </a>
          <a href={`mailto:${profile.email}`} className="ml-2 inline-flex rounded-full border border-aviation-600 px-4 py-2 font-semibold text-aviation-700">
            Email Admissions
          </a>
        </div>
      </div>
      <LeadForm />
    </section>
  );
}
