import type { Metadata } from "next";
import Image from "next/image";
import { getPortfolio, getProfile, getSeo } from "@/lib/getData";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeo();
  const title = "About Md. Akib Hasan - Certified GDS Instructor";
  const description =
    "View Md. Akib Hasan portfolio: certified GDS Instructor in Dhaka with practical expertise in Sabre, Galileo, airline reservation, ticket issuance, reissue, and refund training.";

  return {
    title,
    description,
    keywords: [
      "Best GDS training institute",
      "Air Ticketing Course in Bangladesh",
      "GDS Training in Dhaka",
      "Md Akib Hasan GDS Instructor"
    ],
    alternates: { canonical: "/about" },
    openGraph: {
      title: `${title} | ${seo.siteName}`,
      description,
      url: `${seo.siteUrl}/about`
    },
    twitter: { card: "summary", title, description }
  };
}

export default async function AboutPage() {
  const [profile, portfolio] = await Promise.all([getProfile(), getPortfolio()]);
  const isRemoteImage = /^https?:\/\//.test(portfolio.profileImage);

  return (
    <section className="mx-auto max-w-6xl px-4 py-14 md:px-6">
      <div className="grid gap-6 md:grid-cols-[220px_1fr] md:items-center">
        <div className="relative h-52 w-52 overflow-hidden rounded-2xl border border-aviation-100 shadow-soft">
          <Image
            src={portfolio.profileImage}
            alt={portfolio.fullName}
            fill
            className="object-cover"
            sizes="208px"
            unoptimized={isRemoteImage}
            priority
          />
        </div>
        <div>
          <h1 className="font-[var(--font-serif)] text-4xl text-ink">About {portfolio.fullName}</h1>
          <p className="mt-4 text-base text-ink/80">
            {portfolio.careerObjective}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 rounded-2xl border border-aviation-100 bg-white p-5 text-sm text-ink/85 shadow-soft md:grid-cols-3">
        <p>
          <strong>Location:</strong> {portfolio.location}
        </p>
        <p>
          <strong>Phone:</strong> {portfolio.phones.join(", ")}
        </p>
        <p>
          <strong>Email:</strong> {portfolio.email}
        </p>
      </div>

      <h2 className="mt-8 text-2xl font-semibold text-ink">Career Summary</h2>
      <ul className="mt-3 list-disc space-y-2 pl-6 text-sm text-ink/85">
        {portfolio.careerSummary.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>

      <h2 className="mt-8 text-2xl font-semibold text-ink">Special Qualification</h2>
      <p className="mt-3 text-sm text-ink/85">{portfolio.specialQualification}</p>

      <h2 className="mt-8 text-2xl font-semibold text-ink">Experience ({profile.experienceYears} years)</h2>
      <div className="mt-4 space-y-4">
        {portfolio.experience.map((job) => (
          <article key={`${job.organization}-${job.title}`} className="rounded-2xl border border-aviation-100 bg-white p-5 shadow-soft">
            <h3 className="text-lg font-semibold text-ink">
              {job.title} - {job.organization}
            </h3>
            <p className="text-sm text-ink/70">
              {job.location} | {job.duration}
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-ink/85">
              {job.highlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <h2 className="mt-8 text-2xl font-semibold text-ink">Education</h2>
      <div className="mt-3 grid gap-3 md:grid-cols-3">
        {portfolio.education.map((edu) => (
          <article key={edu.exam} className="rounded-xl border border-aviation-100 bg-white p-4">
            <h3 className="font-semibold text-ink">{edu.exam}</h3>
            <p className="text-sm text-ink/75">{edu.institute}</p>
            <p className="text-xs text-ink/70">Result: {edu.result}</p>
            <p className="text-xs text-ink/70">Year: {edu.year}</p>
          </article>
        ))}
      </div>

      <h2 className="mt-8 text-2xl font-semibold text-ink">Training and Professional Qualification</h2>
      <ul className="mt-3 list-disc space-y-2 pl-6 text-sm text-ink/85">
        {portfolio.trainings.map((training) => (
          <li key={training}>{training}</li>
        ))}
        <li>{portfolio.professionalQualification}</li>
      </ul>

      <h2 className="mt-8 text-2xl font-semibold text-ink">Skills</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {portfolio.skills.map((skill) => (
          <span key={skill} className="rounded-full bg-aviation-100 px-3 py-1 text-xs font-semibold text-aviation-700">
            {skill}
          </span>
        ))}
      </div>
    </section>
  );
}
