import Link from "next/link";
import CTASection from "@/components/CTASection";
import CourseCard from "@/components/CourseCard";
import FloatingWhatsAppButton from "@/components/FloatingWhatsAppButton";
import Hero from "@/components/Hero";
import LeadForm from "@/components/LeadForm";
import Reveal from "@/components/Reveal";
import SEO from "@/components/SEO";
import StickyEnrollBar from "@/components/StickyEnrollBar";
import SuccessStories from "@/components/SuccessStories";
import { getCourses, getPortfolio, getProfile, getSeo, getTestimonials } from "@/lib/getData";
import { faqSchema, localBusinessSchema, organizationSchema, personSchema, websiteSchema } from "@/lib/structuredData";

import Gallery from "@/components/Gallery";

export const dynamic = 'force-dynamic';

const homeFaqs = [
  {
    question: "Which course is best for starting a travel industry career?",
    answer:
      "Our Air Ticketing Course + GDS Training Masterclass is the best starting option because it covers Amadeus, Travelport, and Sabre in one structured roadmap."
  },
  {
    question: "Do you offer GDS Training in Dhaka with flexible timing?",
    answer:
      "Yes, we run weekday evening and weekend batches for students and working professionals in Dhaka."
  },
  {
    question: "Can I get support for job placement after training?",
    answer:
      "Yes, we provide interview preparation, CV support, and referral guidance for travel agencies and OTA roles."
  },
  {
    question: "Is this air ticketing course suitable for beginners in Bangladesh?",
    answer:
      "Yes. The course starts from booking fundamentals and gradually moves into fare pricing, ticket issue, reissue, and refund workflows."
  },
  {
    question: "Which software will I practice in your GDS Training in Bangladesh?",
    answer:
      "You will train on Amadeus, Sabre, and Travelport systems through practical reservation cases used in real agency operations."
  },
  {
    question: "Will I receive certification after completing the training?",
    answer:
      "Yes, learners receive course completion certification and interview guidance for entry-level air ticketing and reservation roles."
  }
];

export default async function HomePage() {
  const [profile, portfolio, courses, testimonials, seo] = await Promise.all([
    getProfile(),
    getPortfolio(),
    getCourses(),
    getTestimonials(),
    getSeo()
  ]);

  const portfolioData = portfolio || {
    fullName: profile.name,
    profileImage: "/images/md-akib-hasan.svg"
  };

  return (
    <>
      <SEO id="org-schema" data={organizationSchema(profile, seo.siteUrl)} />
      <SEO id="site-schema" data={websiteSchema(seo.siteUrl)} />
      <SEO id="person-schema" data={personSchema(profile, seo.siteUrl)} />
      <SEO id="local-business-schema" data={localBusinessSchema(profile, seo.siteUrl)} />
      <SEO id="home-faq-schema" data={faqSchema(homeFaqs)} />

      <Hero
        headline={profile.headline}
        description={profile.description}
        studentsTrained={profile.studentsTrained}
        experienceYears={profile.experienceYears}
        whatsapp={profile.whatsapp}
        profileImage={portfolioData.profileImage}
        instructorName={portfolioData.fullName}
      />

      <Reveal className="mx-auto max-w-6xl px-4 py-10 md:px-6" delay={0.05}>
        <div className="grid items-start gap-6 md:grid-cols-[1.2fr_1fr]">
          <div>
            <h2 className="text-3xl font-semibold text-ink">Master Airline Reservation with Job-Focused GDS Training</h2>
            <p className="mt-2 text-sm text-ink/80">
              Gain booking, fare, ticketing, reissue, and refund skills that employers in Dhaka actively hire for.
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                "High demand in travel agencies, OTAs, and airline support operations",
                "Better salary potential with Amadeus, Travelport, and Sabre expertise",
                "Practical reservation skills that convert quickly into job interviews"
              ].map((item) => (
                <p key={item} className="rounded-2xl border border-aviation-100 bg-white p-4 text-sm text-ink/80 shadow-soft">
                  {item}
                </p>
              ))}
            </div>
          </div>
          <LeadForm />
        </div>
      </Reveal>

      <Reveal className="mx-auto max-w-6xl px-4 py-10 md:px-6" delay={0.07}>
        <h2 className="text-3xl font-semibold text-ink">Practical Training on Amadeus, Sabre &amp; Travelport Systems</h2>
        <p className="mt-2 text-sm text-ink/80">
          Learn the world&apos;s leading systems: <strong>Amadeus Training</strong>, <strong>Travelport Training</strong>, and <strong>Sabre Training</strong> through real booking scenarios.
        </p>
        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => (
            <CourseCard key={course.slug} course={course} />
          ))}
        </div>
      </Reveal>

      <Reveal className="mx-auto max-w-6xl px-4 py-10 md:px-6" delay={0.09}>
        <h2 className="text-3xl font-semibold text-ink">Career Opportunities After Air Ticketing Course in Bangladesh</h2>
        <ul className="mt-4 grid list-disc gap-3 pl-6 text-sm text-ink/85 md:grid-cols-2">
          <li>Air Ticketing Executive in IATA and non-IATA agencies</li>
          <li>GDS Reservation Agent for domestic and international routes</li>
          <li>OTA back-office and customer service specialist</li>
          <li>Corporate travel coordinator and account support</li>
        </ul>
      </Reveal>

      <Reveal className="mx-auto max-w-6xl px-4 py-10 md:px-6" delay={0.12}>
        <h2 className="text-3xl font-semibold text-ink">Student Success Stories</h2>
        <SuccessStories staticTestimonials={testimonials} />
      </Reveal>

      {/* Dynamic Image Gallery Showcase */}
      <Gallery />

      <Reveal className="mx-auto max-w-6xl px-4 py-10 md:px-6" delay={0.13}>
        <h2 className="text-3xl font-semibold text-ink">FAQ: Air Ticketing &amp; GDS Training in Dhaka</h2>
        <div className="mt-6 space-y-4">
          {homeFaqs.map((faq) => (
            <article key={faq.question} className="rounded-2xl border border-aviation-100 bg-white p-5 shadow-soft">
              <h3 className="font-semibold text-ink">{faq.question}</h3>
              <p className="mt-2 text-sm text-ink/80">{faq.answer}</p>
            </article>
          ))}
        </div>
      </Reveal>

      <CTASection
        heading="Ready to start your Airline Reservation Career?"
        copy="Join the best GDS training institute experience with practical labs and job placement support."
      />

      <section className="mx-auto max-w-6xl px-4 pb-10 md:px-6">
        <div className="rounded-2xl border border-aviation-100 bg-white p-6 text-center shadow-soft">
          <h2 className="text-2xl font-semibold text-ink">Want a personalized study plan?</h2>
          <p className="mt-2 text-sm text-ink/80">
            Book a quick counseling call and choose the right path for <strong>Air Ticketing Course in Bangladesh</strong>.
          </p>
          <Link href="/contact" className="mt-4 inline-flex rounded-full bg-gradient-to-r from-aviation-600 to-cyan-500 px-5 py-2.5 text-sm font-semibold text-white">
            Contact Admissions
          </Link>
        </div>
      </section>

      <FloatingWhatsAppButton href={profile.whatsapp} />
      <StickyEnrollBar whatsapp={profile.whatsapp} phone={profile.phone} />
    </>
  );
}
