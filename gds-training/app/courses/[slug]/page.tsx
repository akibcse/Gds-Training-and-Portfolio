import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SEO from "@/components/SEO";
import { getBlogBySlug, getCourseBySlug, getSeo, type CourseModule, type ModuleLesson } from "@/lib/getData";
import { getSeoOverride } from "@/lib/seo-settings";
import { breadcrumbSchema, courseSchema, faqSchema } from "@/lib/structuredData";
import { PlayCircle, CheckCircle, Clock, BookOpen, Award, Shield, ChevronRight, Star, FileText, Lock, Globe, Layers } from "lucide-react";

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

  const title = course.seoTitle || `${course.title} in Dhaka`;
  const description = course.seoDescription || course.excerpt || course.description;

  return {
    title: override?.metaTitle || title,
    description: override?.metaDescription || description,
    keywords: override?.keywords?.length ? override.keywords : course.keywords,
    alternates: { canonical: override?.canonicalUrl || `${seo.siteUrl}/courses/${course.slug}` },
    openGraph: {
      title: override?.ogTitle || `${title} | ${seo.siteName}`,
      description: override?.ogDescription || description,
      url: `${seo.siteUrl}/courses/${course.slug}`,
      images: course.thumbnail ? [{ url: course.thumbnail }] : undefined,
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
  const reviewCount = course.reviewCount || course.studentCount || 125;
  const studentCount = course.studentCount || 1250;
  const instructor = course.instructorName || "Aviation Expert";
  const badge = course.badgeText || (course.bestseller ? "Bestseller" : course.featured ? "Featured" : null);

  const modules = (Array.isArray(course.curriculum) ? course.curriculum : []) as CourseModule[];
  const outcomes = course.learningOutcomes?.length ? course.learningOutcomes : (course.careerOutcomes || []);

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
      <section className="bg-[#0F172A] pt-8 pb-16 lg:pt-12 lg:pb-32 text-white relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 md:px-6 relative z-10">
          <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-slate-400">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/courses" className="hover:text-white transition-colors">Courses</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-slate-300">{course.category || "Aviation & GDS"}</span>
          </div>

          <div className="grid lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                {badge && (
                  <span className="bg-[#F59E0B] text-white px-3 py-1 rounded-md font-extrabold text-xs tracking-wider uppercase shadow-sm">
                    {badge}
                  </span>
                )}
                {course.discount && course.discount > 0 ? (
                  <span className="bg-emerald-600 text-white px-2.5 py-1 rounded-md font-extrabold text-xs">
                    {course.discount}% OFF
                  </span>
                ) : null}
                <span className="bg-blue-900/60 text-blue-300 border border-blue-700/50 px-2.5 py-1 rounded-md font-semibold text-xs">
                  {course.level || "Beginner"}
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
                {course.title}
              </h1>

              <p className="text-lg text-slate-300 leading-relaxed">
                {course.excerpt}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-1 text-[#F59E0B] font-bold">
                  <span>{course.rating || 4.8}</span>
                  <Star className="h-4 w-4 fill-current" />
                  <span className="text-slate-300 font-normal">({reviewCount.toLocaleString()} reviews)</span>
                </div>
                <span className="text-slate-400">•</span>
                <span className="text-slate-300 font-medium">{studentCount.toLocaleString()} Enrolled Students</span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-300">Instructor: <span className="text-blue-400 font-bold">{instructor}</span></span>
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-slate-400">
                <span className="flex items-center gap-1.5"><Globe className="h-4 w-4 text-slate-400" /> {course.language || "English / Bangla"}</span>
                <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-slate-400" /> {course.duration}</span>
                <span className="flex items-center gap-1.5"><Award className="h-4 w-4 text-slate-400" /> {course.certification}</span>
              </div>
            </div>
            
            {/* Mobile Preview & Enroll Card */}
            <div className="lg:hidden">
              <div className="bg-white rounded-2xl p-4 shadow-2xl relative border border-slate-200 text-slate-900">
                <div className="relative aspect-video bg-slate-900 rounded-xl overflow-hidden group">
                  <img src={thumbnail} className="w-full h-full object-cover opacity-80" alt={course.title} />
                  {course.previewVideo && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-white/20 backdrop-blur-md rounded-full p-4 group-hover:scale-110 transition-transform">
                        <PlayCircle className="h-12 w-12 text-white" />
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  {!course.hideFee && (
                    <div className="flex items-baseline gap-3 mb-4">
                      <span className="text-3xl font-bold text-[#0F172A]">৳{(discountPrice || 0).toLocaleString()}</span>
                      {price > discountPrice && (
                        <span className="text-lg text-slate-400 line-through">৳{price.toLocaleString()}</span>
                      )}
                    </div>
                  )}
                  <Link href={`/checkout/${course.slug}`} className="block w-full bg-[#1D4ED8] hover:bg-blue-800 text-white font-bold py-3.5 rounded-xl transition-colors text-center shadow-lg shadow-blue-500/30">
                    Enroll Now with bKash / Nagad
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
          <div className="lg:col-span-2 -mt-8 lg:-mt-16 relative z-10 bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100 space-y-10">
            
            {/* What you'll learn */}
            {outcomes.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-[#0F172A]">What You'll Learn</h2>
                <div className="mt-4 grid sm:grid-cols-2 gap-3 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  {outcomes.map((item: string, i: number) => (
                    <div key={i} className="flex gap-2.5 items-start">
                      <CheckCircle className="h-5 w-5 text-[#1D4ED8] shrink-0 mt-0.5" />
                      <span className="text-slate-700 text-sm font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Curriculum Builder Output */}
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-[#0F172A]">Course Content & Modules</h2>
                <span className="text-xs text-slate-500 font-semibold">{modules.length} Modules • {course.duration}</span>
              </div>
              
              <div className="mt-4 space-y-4">
                {modules.length === 0 ? (
                  <p className="text-sm text-slate-500 italic">Curriculum details available upon enrollment.</p>
                ) : (
                  modules.map((mod: CourseModule, mIdx: number) => (
                    <div key={mod.id || mIdx} className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                      <div className="bg-slate-50 p-4 border-b border-slate-200 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="h-7 w-7 rounded-lg bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">{mIdx + 1}</span>
                          <h3 className="font-bold text-slate-900 text-base">{mod.title}</h3>
                        </div>
                        <span className="text-xs font-semibold text-slate-500">{mod.lessons?.length || 0} lessons {mod.duration ? `• ${mod.duration}` : ""}</span>
                      </div>

                      <div className="divide-y divide-slate-100">
                        {mod.lessons?.map((les: ModuleLesson, lIdx: number) => (
                          <div key={les.id || lIdx} className="p-3.5 px-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                            <div className="flex items-center gap-3">
                              {les.videoUrl ? <PlayCircle className="h-4 w-4 text-blue-600 shrink-0" /> : <FileText className="h-4 w-4 text-slate-400 shrink-0" />}
                              <span className="text-sm font-medium text-slate-700">{les.title}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              {les.isFreePreview ? (
                                <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">Free Preview</span>
                              ) : (
                                <Lock className="h-3.5 w-3.5 text-slate-300" />
                              )}
                              {les.duration && <span className="text-xs text-slate-400 font-mono">{les.duration}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Prerequisites / Requirements */}
            {course.requirements && course.requirements.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-[#0F172A]">Course Requirements</h2>
                <ul className="mt-4 space-y-2 list-disc list-inside text-sm text-slate-600">
                  {course.requirements.map((req: string, idx: number) => (
                    <li key={idx} className="leading-relaxed">{req}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Full Description */}
            <div>
              <h2 className="text-2xl font-bold text-[#0F172A]">Detailed Overview</h2>
              <div className="mt-4 text-slate-600 space-y-4 leading-relaxed whitespace-pre-line text-sm md:text-base">
                {course.description}
              </div>
            </div>

            {/* Software & Tags */}
            {course.softwareCovered && course.softwareCovered.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Software & Tools Covered</h3>
                <div className="flex flex-wrap gap-2">
                  {course.softwareCovered.map((soft: string) => (
                    <span key={soft} className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-xl text-xs font-semibold">
                      {soft}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* FAQs */}
            {course.faqs && course.faqs.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-[#0F172A]">Frequently Asked Questions</h2>
                <div className="mt-4 space-y-3">
                  {course.faqs.map((faq: { question: string; answer: string }) => (
                    <div key={faq.question} className="rounded-2xl border border-slate-200 p-5 bg-white">
                      <h3 className="font-bold text-[#0F172A]">{faq.question}</h3>
                      <p className="mt-2 text-sm text-slate-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Related Reading */}
            {relatedBlogs.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-[#0F172A]">Related Reading</h2>
                <div className="mt-4 space-y-2">
                  {relatedBlogs.map((blog: { slug: string; title: string }) => (
                    <Link key={blog.slug} href={`/blog/${blog.slug}`} className="block text-[#1D4ED8] hover:underline font-semibold text-sm">
                      → {blog.title}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Desktop Floating Sidebar */}
          <div className="hidden lg:block">
            <div className="sticky top-24 bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden -mt-32 relative z-20">
              <div className="relative aspect-video bg-slate-900 group">
                <img src={thumbnail} className="w-full h-full object-cover opacity-80" alt={course.title} />
                {course.previewVideo ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white/20 backdrop-blur-md rounded-full p-4 group-hover:scale-110 transition-transform cursor-pointer">
                      <PlayCircle className="h-12 w-12 text-white" />
                    </div>
                  </div>
                ) : null}
              </div>
              
              <div className="p-6">
                {!course.hideFee && (
                  <div className="flex items-baseline gap-3 mb-6">
                    <span className="text-4xl font-bold text-[#0F172A]">৳{(discountPrice || 0).toLocaleString()}</span>
                    {price > discountPrice && (
                      <span className="text-xl text-slate-400 line-through">৳{price.toLocaleString()}</span>
                    )}
                  </div>
                )}

                <Link href={`/checkout/${course.slug}`} className="block w-full bg-[#1D4ED8] hover:bg-blue-800 text-white font-bold py-3.5 rounded-2xl transition-colors text-lg mb-3 shadow-lg shadow-blue-500/30 text-center">
                  Enroll with bKash / Nagad
                </Link>

                <div className="mt-6 pt-6 border-t border-slate-100">
                  <h4 className="font-bold text-[#0F172A] mb-3 text-sm">This course includes:</h4>
                  <ul className="space-y-3 text-xs font-medium text-slate-600">
                    <li className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-blue-600" /> {course.duration} comprehensive training
                    </li>
                    <li className="flex items-center gap-3">
                      <BookOpen className="h-4 w-4 text-blue-600" /> Complete GDS Software Access & Manuals
                    </li>
                    <li className="flex items-center gap-3">
                      <Globe className="h-4 w-4 text-blue-600" /> Language: {course.language || "English / Bangla"}
                    </li>
                    <li className="flex items-center gap-3">
                      <Shield className="h-4 w-4 text-blue-600" /> Lifetime learning portal access
                    </li>
                    <li className="flex items-center gap-3">
                      <Award className="h-4 w-4 text-blue-600" /> {course.certification}
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
