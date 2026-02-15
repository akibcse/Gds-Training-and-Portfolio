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

export const organizationSchema = (profile: ProfileForSchema, siteUrl: string) => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Md. Akib Hasan",
  alternateName: "GDS Training by Akib",
  url: siteUrl,
  logo: `${siteUrl}/logo.png`, // Assuming a logo exists at this path
  contactPoint: [
    {
      "@type": "ContactPoint",
      telephone: profile?.phone || "",
      contactType: "customer service",
      areaServed: "BD",
      availableLanguage: ["Bengali", "English"]
    }
  ],
  sameAs: [
    "https://facebook.com/roadyakib", // Example social links based on context
    "https://linkedin.com/in/akibcse"
  ]
});

export const websiteSchema = (siteUrl: string) => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "GDS Training and Portfolio",
  url: siteUrl,
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${siteUrl}/search?q={search_term_string}`
    },
    "query-input": "required name=search_term_string"
  }
});

export const personSchema = (profile: ProfileForSchema, siteUrl: string) => ({
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile?.name || "Md. Akib Hasan",
  description: profile?.description || "",
  url: siteUrl,
  image: `${siteUrl}/api/og?title=${encodeURIComponent(profile?.name || "Md. Akib Hasan")}`,
  email: profile?.email || "",
  telephone: profile?.phone || "",
  jobTitle: "GDS Instructor",
  worksFor: {
    "@type": "Organization",
    name: "GDS Training"
  }
});

export const localBusinessSchema = (profile: ProfileForSchema, siteUrl: string) => ({
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: profile?.name || "GDS Training",
  description: profile?.description || "",
  url: siteUrl,
  telephone: profile?.phone || "",
  email: profile?.email || "",
  image: `${siteUrl}/api/og?title=GDS+Training`,
  address: {
    "@type": "PostalAddress",
    streetAddress: profile?.address?.street || "",
    addressLocality: profile?.address?.city || "",
    addressRegion: profile?.address?.region || "",
    postalCode: profile?.address?.postalCode || "",
    addressCountry: profile?.address?.country || ""
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: "23.8103", // Dhaka coordinates
    longitude: "90.4125"
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "09:00",
      closes: "21:00"
    }
  ]
});

export const courseSchema = (course: Course, siteUrl: string) => ({
  "@context": "https://schema.org",
  "@type": "Course",
  name: course?.title || "",
  description: course?.description || "",
  provider: {
    "@type": "Organization",
    name: "GDS Training",
    alternateName: "Md. Akib Hasan",
    url: siteUrl,
    logo: `${siteUrl}/logo.png`
  },
  keywords: course?.keywords?.join(", ") || "",
  educationalCredentialAwarded: course?.certification || "Professional Certificate",
  timeRequired: course?.duration || "",
  url: `${siteUrl}/courses/${course?.slug || ""}`,
  offers: {
    "@type": "Offer",
    category: "Professional Training"
  }
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
  dateModified: blog?.publishedAt,
  url: `${siteUrl}/blog/${blog?.slug || ""}`,
  publisher: {
    "@type": "Organization",
    name: "GDS Training",
    logo: {
      "@type": "ImageObject",
      url: `${siteUrl}/logo.png`
    }
  },
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": `${siteUrl}/blog/${blog?.slug || ""}`
  }
});
