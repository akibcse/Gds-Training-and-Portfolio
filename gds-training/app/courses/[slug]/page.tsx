import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SEO from "@/components/SEO";
import { getBlogBySlug, getCourseBySlug, getCourses, getSeo } from "@/lib/getData";
import { getSeoOverride } from "@/lib/seo-settings";
import { breadcrumbSchema, courseSchema, faqSchema } from "@/lib/structuredData";
import { PlayCircle, CheckCircle, Clock, BookOpen, Award, Shield, ChevronRight } from "lucide-react";

type Props = {
  params: Promise<{ slug: string }>;
};

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [course, seo, override] = await Promise.all([getCourseBySlug(slug), getSeo(), getSeoOverride(`course:${slug}`)]);
  if (!course) {
    return { title: "Course Not Found" };
  }

  const title = `${course.title} in Dhaka`;
  const description = course.description;

  return {
    title: override?.metaTitle || title,
    description: override?.metaDescription || description,
    keywords: override?.keywords?.length ? override.keywords : course.keywords,
    alternates: { canonical: override?.canonicalUrl || `${seo.siteUrl}/courses/${course.slug}` },
    openGraph: {
      title: override?.ogTitle || `${title} | ${seo.siteName}`,
      description: override?.ogDescription || description,
      url: `${seo.siteUrl}/courses/${course.slug}`,
      type: "article"
    },
    twitter: { card: "summary_large_image", title, description }
  };
}

export default async function CoursePage({ params }: Props) {
  const { slug } = await params;
  const [course, seo] = await Promise.all([getCourseBySlug(slug), getSeo()]);

  if (!course) {
    notFound();
  }

  const relatedBlogs = course.relatedBlogSlugs 
    ? (
        await Promise.all(course.relatedBlogSlugs.map((relatedSlug: string) => getBlogBySlug(relatedSlug)))
      ).filter((blog): blog is NonNullable<typeof blog> => Boolean(blog))
    : [];

  const thumbnail = course.thumbnail || "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80";
  const price = course.price || 5000;
  const discountPrice = course.discountPrice || 2500;
  const studentCount = course.studentCount || 1250;
  const instructor = course.instructorName || "Industry Professional";

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-20">
      <SEO id="course-schema" data={courseSchema(course, seo.siteUrl)} />
      <SEO id="course-faq-schema" data={faqSchema(course.faqs || [])} />
      <SEO
        id="course-breadcrumb-schema"
        data={breadcrumbSchema([
          { name: "Home", url: seo.siteUrl },
          { name: "Courses", url: `${seo.siteUrl}/courses` },
          { name: course.title, url: `${seo.siteUrl}/courses/${course.slug}` }
        ])}
      />

      {/* Hero Header */}
      <section className="bg-[#0F172A] pt-8 pb-16 lg:pt-12 lg:pb-32 text-white">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-slate-400">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/courses" className="hover:text-white transition-colors">Courses</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-slate-300">{course.category || "Aviation"}</span>
          </div>

          <div className="grid lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
                {course.title}
              </h1>
              <p className="mt-4 text-lg text-slate-300">
                {course.excerpt}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-4 text-sm">
                <span className="bg-[#F59E0B] text-white px-2.5 py-1 rounded font-bold text-xs">
                  Bestseller
                </span>
                <span className="flex items-center gap-1 text-[#F59E0B] font-bold">
                  {course.rating || 4.8} ★★★★☆
                </span>
                <span className="text-slate-300">({studentCount.toLocaleString()} students)</span>
                <span className="text-slate-300">Created by <span className="text-blue-400 font-medium underline">{instructor}</span></span>
              </div>
            </div>
            
            {/* Mobile Video/Enroll Card (Hidden on Desktop) */}
            <div className="lg:hidden">
              <div className="bg-white rounded-xl p-1 shadow-2xl relative">
                <div className="relative aspect-video bg-slate-900 rounded-lg overflow-hidden group cursor-pointer">
                  <img src={thumbnail} className="w-full h-full object-cover opacity-80" alt={course.title} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white/20 backdrop-blur-md rounded-full p-4 group-hover:scale-110 transition-transform">
                      <PlayCircle className="h-12 w-12 text-white" />
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-3xl font-bold text-[#0F172A]">৳{discountPrice.toLocaleString()}</span>
                    {price > discountPrice && (
                      <span className="text-lg text-slate-400 line-through">৳{price.toLocaleString()}</span>
                    )}
                  </div>
                  <Link href={`/checkout/${course.slug}`} className="block w-full bg-[#1D4ED8] hover:bg-blue-800 text-white font-bold py-3 rounded-lg transition-colors text-center">
                    Enroll with bKash
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 md:px-6 relative">
        <div className="grid lg:grid-cols-3 gap-10">
          
          {/* Main Content Area */}
          <div className="lg:col-span-2 -mt-8 lg:-mt-16 relative z-10 bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100">
            
            <h2 className="text-2xl font-bold text-[#0F172A]">What you'll learn</h2>
            <div className="mt-4 grid sm:grid-cols-2 gap-3">
              {course.careerOutcomes?.map((item: string) => (
                <div key={item} className="flex gap-2">
                  <CheckCircle className="h-5 w-5 text-[#1D4ED8] shrink-0" />
                  <span className="text-slate-600 text-sm">{item}</span>
                </div>
              ))}
            </div>

            <h2 className="mt-10 text-2xl font-bold text-[#0F172A]">Course Content</h2>
            <div className="mt-4 space-y-2">
              <div className="text-sm text-slate-500 mb-2">
                {course.curriculum?.length || 0} sections • {course.duration} total length
              </div>
              {course.curriculum?.map((item: string, idx: number) => (
                <div key={item} className="border border-slate-200 rounded-lg p-4 bg-slate-50 flex items-start gap-3">
                  <span className="text-[#1D4ED8] font-bold mt-0.5">{idx + 1}.</span>
                  <div className="text-slate-700 font-medium">{item}</div>
                </div>
              ))}
            </div>

            <h2 className="mt-10 text-2xl font-bold text-[#0F172A]">Description</h2>
            <div className="mt-4 text-slate-600 space-y-4 leading-relaxed whitespace-pre-line">
              {course.description}
            </div>

            {course.faqs && course.faqs.length > 0 && (
              <>
                <h2 className="mt-10 text-2xl font-bold text-[#0F172A]">Frequently Asked Questions</h2>
                <div className="mt-4 space-y-3">
                  {course.faqs.map((faq: { question: string; answer: string }) => (
                    <div key={faq.question} className="rounded-xl border border-slate-200 p-5">
                      <h3 className="font-bold text-[#0F172A]">{faq.question}</h3>
                      <p className="mt-2 text-sm text-slate-600">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </>
            )}

            {relatedBlogs.length > 0 && (
              <>
                <h2 className="mt-10 text-2xl font-bold text-[#0F172A]">Related Reading</h2>
                <div className="mt-4 space-y-2">
                  {relatedBlogs.map((blog: { slug: string; title: string }) => (
                    <Link key={blog.slug} href={`/blog/${blog.slug}`} className="block text-[#1D4ED8] hover:underline font-medium">
                      {blog.title}
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Desktop Floating Sidebar */}
          <div className="hidden lg:block">
            <div className="sticky top-24 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden -mt-32 relative z-20">
              <div className="relative aspect-video bg-slate-900 group cursor-pointer">
                <img src={thumbnail} className="w-full h-full object-cover opacity-80" alt={course.title} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/20 backdrop-blur-md rounded-full p-4 group-hover:scale-110 transition-transform">
                    <PlayCircle className="h-12 w-12 text-white" />
                  </div>
                </div>
                <div className="absolute bottom-4 inset-x-0 text-center text-white font-medium text-sm">
                  Preview this course
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-4xl font-bold text-[#0F172A]">৳{discountPrice.toLocaleString()}</span>
                  {price > discountPrice && (
                    <span className="text-xl text-slate-400 line-through">৳{price.toLocaleString()}</span>
                  )}
                </div>

                <Link href={`/checkout/${course.slug}`} className="block w-full bg-[#1D4ED8] hover:bg-blue-800 text-white font-bold py-3.5 rounded-lg transition-colors text-lg mb-3 shadow-lg shadow-blue-500/30 text-center">
                  Enroll with bKash
                </Link>
                <button className="w-full bg-slate-100 hover:bg-slate-200 text-[#0F172A] font-bold py-3.5 rounded-lg transition-colors">
                  Add to Wishlist
                </button>

                <div className="mt-6">
                  <h4 className="font-bold text-[#0F172A] mb-3">This course includes:</h4>
                  <ul className="space-y-3 text-sm text-slate-600">
                    <li className="flex items-center gap-3">
                      <PlayCircle className="h-4 w-4 text-slate-400" /> {course.duration} on-demand video
                    </li>
                    <li className="flex items-center gap-3">
                      <BookOpen className="h-4 w-4 text-slate-400" /> Comprehensive GDS Manuals
                    </li>
                    <li className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-slate-400" /> Lifetime access
                    </li>
                    <li className="flex items-center gap-3">
                      <Shield className="h-4 w-4 text-slate-400" /> Access on mobile and TV
                    </li>
                    <li className="flex items-center gap-3">
                      <Award className="h-4 w-4 text-slate-400" /> Certificate of completion
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
