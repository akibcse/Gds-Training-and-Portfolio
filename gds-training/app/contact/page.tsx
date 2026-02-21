import type { Metadata } from "next";
import LeadForm from "@/components/LeadForm";
import SEO from "@/components/SEO";
import { getProfile, getSeo } from "@/lib/getData";
import { breadcrumbSchema } from "@/lib/structuredData";

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeo();
  const title = "Contact for GDS Training in Dhaka, Bangladesh";
  const description =
    "Enroll in the best GDS Training in Bangladesh. Contact us for Amadeus, Sabre, and Travelport courses, batch schedules, and fees for air ticketing careers.";

  return {
    title,
    description,
    keywords: ["GDS Training in Dhaka", "Amadeus Course Bangladesh", "Air Ticketing Course"],
    alternates: { canonical: "/contact" },
    openGraph: {
      title: `${title} | ${seo?.siteName || 'GDS Training'}`,
      description,
      url: `${seo?.siteUrl || 'https://gds-training.vercel.app'}/contact`
    },
    twitter: { card: "summary", title, description }
  };
}

export default async function ContactPage() {
  const [profile, seo] = await Promise.all([getProfile(), getSeo()]);
  
  const profileData = profile || {
    phone: "",
    email: "",
    whatsapp: "",
    address: {
      street: "",
      city: "",
      region: "",
      postalCode: "",
      country: ""
    }
  };

  return (
    <section className="mx-auto grid max-w-6xl gap-6 px-4 py-14 md:grid-cols-2 md:px-6">
      <SEO
        id="contact-breadcrumb-schema"
        data={breadcrumbSchema([
          { name: "Home", url: seo.siteUrl },
          { name: "Contact", url: `${seo.siteUrl}/contact` }
        ])}
      />
      <div>
        <h1 className="font-[var(--font-serif)] text-4xl text-ink">Contact Admissions</h1>
        <p className="mt-3 text-sm text-ink/80">
          Talk to our advisors for batch schedule, fees, and scholarship guidance for Air Ticketing Course in Bangladesh.
        </p>
        <div className="mt-5 space-y-2 text-sm text-ink/90">
          <p>
            <strong>Phone:</strong> {profileData.phone || "N/A"}
          </p>
          <p>
            <strong>Email:</strong> {profileData.email || "N/A"}
          </p>
          <p>
            <strong>Address:</strong> {profileData.address?.street || ""}, {profileData.address?.city || ""}
          </p>
          <a href={profileData.whatsapp || "#"} className="inline-flex rounded-full bg-gradient-to-r from-aviation-600 to-cyan-500 px-4 py-2 font-semibold text-white">
            Chat on WhatsApp
          </a>
          <a href={`mailto:${profileData.email || ""}`} className="ml-2 inline-flex rounded-full border border-aviation-600 px-4 py-2 font-semibold text-aviation-700">
            Email Admissions
          </a>
        </div>
      </div>
      <LeadForm />
    </section>
  );
}
