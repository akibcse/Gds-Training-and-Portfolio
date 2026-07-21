import type { Metadata } from "next";
import LMSCourseCard from "@/components/LMSCourseCard";
import SEO from "@/components/SEO";
import { getCourses, getSeo } from "@/lib/getData";
import { getSeoOverride } from "@/lib/seo-settings";
import { breadcrumbSchema } from "@/lib/structuredData";
import { Search, Sparkles, Filter } from "lucide-react";

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const [seo, override] = await Promise.all([getSeo(), getSeoOverride("courses")]);
  const title = "Airline Ticketing Course in Bangladesh | GDS Training";
  const description =
    "Professional Air Ticketing Course and GDS Training in Bangladesh. Master Amadeus, Sabre, and Travelport with job-focused reservation skills and certification.";

  return {
    title: override?.metaTitle || title,
    description: override?.metaDescription || description,
    keywords: override?.keywords?.length ? override.keywords : ["Air Ticketing Course", "Amadeus Training", "Travelport Training", "Sabre Training"],
    alternates: { canonical: override?.canonicalUrl || "/courses" },
    openGraph: {
      title: override?.ogTitle || `${title} | ${seo.siteName}`,
      description: override?.ogDescription || description,
      url: `${seo.siteUrl}/courses`
    }
  };
}

export default async function CoursesPage() {
  const [courses, seo] = await Promise.all([getCourses(), getSeo()]);
  
  const categories = [
    "All Courses",
    "Sabre GDS",
    "Galileo GDS",
    "Amadeus GDS",
    "Air Ticketing",
    "Visa Processing"
  ];

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-20">
      <SEO
        id="courses-breadcrumb-schema"
        data={breadcrumbSchema([
          { name: "Home", url: seo.siteUrl },
          { name: "Courses", url: `${seo.siteUrl}/courses` }
        ])}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#0F172A] pt-20 pb-24 lg:pt-28 lg:pb-32">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1920&q=80" 
            alt="Aviation Background" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/80 to-transparent" />
        </div>
        
        <div className="mx-auto max-w-7xl px-4 relative z-10 md:px-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-sm mb-6 backdrop-blur-sm font-medium">
              <Sparkles className="h-4 w-4 text-[#F59E0B]" />
              Aviation Academy Pro
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight">
              Become a Professional Air Ticketing & GDS Expert
            </h1>
            <p className="mt-6 text-lg md:text-xl text-slate-300">
              Learn Sabre, Galileo, Amadeus and Travel Agency Operations from Industry Professionals. Get certified and start your career in aviation.
            </p>
            
            <div className="mt-10 max-w-2xl bg-white rounded-full p-2 flex shadow-2xl items-center focus-within:ring-2 focus-within:ring-[#1D4ED8] transition-all">
              <div className="pl-4 text-slate-400">
                <Search className="h-6 w-6" />
              </div>
              <input 
                type="text" 
                placeholder="What do you want to learn today?" 
                className="w-full bg-transparent border-none px-4 py-3 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-0 text-lg"
              />
              <button className="bg-[#1D4ED8] hover:bg-blue-800 text-white font-bold py-3 px-8 rounded-full transition-colors whitespace-nowrap">
                Search
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section className="mx-auto max-w-7xl px-4 md:px-6 -mt-10 relative z-20">
        
        {/* Categories Bar */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-2 md:p-4 mb-10 overflow-x-auto">
          <div className="flex items-center gap-2 min-w-max">
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg text-slate-600 font-medium hover:bg-slate-200 transition-colors">
              <Filter className="h-4 w-4" /> Filters
            </button>
            <div className="w-px h-6 bg-slate-200 mx-2" />
            {categories.map((cat, i) => (
              <button 
                key={cat} 
                className={`px-5 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  i === 0 
                    ? "bg-[#1D4ED8] text-white" 
                    : "text-slate-600 hover:bg-blue-50 hover:text-[#1D4ED8]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-end mb-6">
          <h2 className="text-2xl font-bold text-[#0F172A]">All Courses</h2>
          <span className="text-slate-500 font-medium">{courses.length} results</span>
        </div>

        {/* Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {courses.map((course) => (
            <LMSCourseCard key={course.slug} course={course} />
          ))}
        </div>
      </section>
    </div>
  );
}
