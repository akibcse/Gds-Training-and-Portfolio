import type { Blog, Course } from "@/lib/getData";

type ProfileForSchema = {
  name?: string;
  description?: string;
  phone?: string;
  email?: string;
  address?: {
    street?: string;
    city?: string;
    region?: string;
    postalCode?: string;
    country?: string;
  };
};

export const personSchema = (profile: ProfileForSchema, siteUrl: string) => ({
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile?.name || "Md. Akib Hasan",
  description: profile?.description || "",
  url: siteUrl,
  email: profile?.email || "",
  telephone: profile?.phone || ""
});

export const localBusinessSchema = (profile: ProfileForSchema, siteUrl: string) => ({
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: profile?.name || "GDS Training",
  description: profile?.description || "",
  url: siteUrl,
  telephone: profile?.phone || "",
  email: profile?.email || "",
  address: {
    "@type": "PostalAddress",
    streetAddress: profile?.address?.street || "",
    addressLocality: profile?.address?.city || "",
    addressRegion: profile?.address?.region || "",
    postalCode: profile?.address?.postalCode || "",
    addressCountry: profile?.address?.country || ""
  }
});

export const courseSchema = (course: Course, siteUrl: string) => ({
  "@context": "https://schema.org",
  "@type": "Course",
  name: course?.title || "",
  description: course?.description || "",
  provider: {
    "@type": "Organization",
    name: "Md. Akib Hasan",
    sameAs: siteUrl
  },
  keywords: course?.keywords?.join(", ") || "",
  educationalCredentialAwarded: course?.certification || "",
  timeRequired: course?.duration || "",
  url: `${siteUrl}/courses/${course?.slug || ""}`
});

export const faqSchema = (faqs: { question: string; answer: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs?.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer
    }
  })) || []
});

export const breadcrumbSchema = (items: { name: string; url: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items?.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: item.url
  })) || []
});

export const blogSchema = (blog: Blog, siteUrl: string) => ({
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: blog?.title || "",
  description: blog?.excerpt || "",
  author: {
    "@type": "Person",
    name: blog?.author || "Md. Akib Hasan"
  },
  datePublished: blog?.publishedAt,
  url: `${siteUrl}/blog/${blog?.slug || ""}`
});
