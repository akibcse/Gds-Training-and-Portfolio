# MASTER PROJECT SPECIFICATION: GDS TRAINING & PORTFOLIO LMS
**Single Source of Truth (SSOT) Enterprise-Grade Requirements & Technical Specification**
*Version: 2.0.0 | Date: July 27, 2026 | Project: GDS Training & Portfolio (`gds-training-seo-site`)*

---

## TABLE OF CONTENTS
1. [Executive Summary](#1-executive-summary)
2. [Current Project Analysis](#2-current-project-analysis)
3. [Critical Rules (Never Break Existing Features)](#3-critical-rules-never-break-existing-features)
4. [Existing Features Audit](#4-existing-features-audit)
5. [Bugs to Fix](#5-bugs-to-fix)
6. [Authentication Improvements](#6-authentication-improvements)
7. [Admin Panel Enhancements](#7-admin-panel-enhancements)
8. [Course Management (Complete Editable CMS)](#8-course-management-complete-editable-cms)
9. [LMS Features](#9-lms-features)
10. [Course Selling & Enrollment](#10-course-selling--enrollment)
11. [Payment Verification System](#11-payment-verification-system)
12. [Blog CMS](#12-blog-cms)
13. [Portfolio CMS](#13-portfolio-cms)
14. [Gallery Module](#14-gallery-module)
15. [Image Library (URL-Based)](#15-image-library-url-based)
16. [Hero Slider](#16-hero-slider)
17. [Testimonials](#17-testimonials)
18. [Success Stories](#18-success-stories)
19. [Partners & Achievements](#19-partners--achievements)
20. [Lead Management CRM](#20-lead-management-crm)
21. [SEO & Google Search Preservation](#21-seo--google-search-preservation)
22. [Google Discover Optimization](#22-google-discover-optimization)
23. [Performance & Core Web Vitals](#23-performance--core-web-vitals)
24. [Firebase Architecture](#24-firebase-architecture)
25. [Database Schema](#25-database-schema)
26. [Security Rules](#26-security-rules)
27. [UI/UX Improvements](#27-uiux-improvements)
28. [Mobile Optimization](#28-mobile-optimization)
29. [Accessibility](#29-accessibility)
30. [Analytics Dashboard](#30-analytics-dashboard)
31. [Deployment & Vercel](#31-deployment--vercel)
32. [Testing & Validation Checklist](#32-testing--validation-checklist)
33. [Future Roadmap](#33-future-roadmap)

---

## 1. EXECUTIVE SUMMARY

### 1.1 Project Vision
The **GDS Training & Portfolio Platform** is a state-of-the-art Learning Management System (LMS), Enterprise Content Management System (CMS), and Lead Generation Web Application. Designed to serve students, professionals, and corporate trainees, the application provides course enrollment, digital learning workflows, payment verification, blog/portfolio publishing, and CRM capabilities.

### 1.2 Tech Stack Standard
* **Framework**: Next.js 15 (App Router, Server Actions, React Server Components)
* **Runtime / Language**: Node.js v20+ / TypeScript 5.x
* **Database & Auth**: Firebase Realtime Database (RTDB), Firebase Auth (Client & Admin SDK)
* **Secondary Storage / Cache**: Vercel KV (`@vercel/kv`) & Local JSON Fallbacks (`lib/storage.ts`)
* **Styling & UI Components**: Tailwind CSS 3.4, Lucide React Icons, Custom Glassmorphism System
* **Animations**: Framer Motion 12.x
* **Drag and Drop**: `@hello-pangea/dnd`
* **Deployment Platform**: Vercel (Edge & Serverless Node Runtime)

---

## 2. CURRENT PROJECT ANALYSIS

### 2.1 Directory Structure
```
gds-training/
├── app/                      # Next.js App Router Routes
│   ├── (auth)/               # Login & Signup pages
│   ├── about/                # About institute page
│   ├── admin/                # Secure Admin Panel CMS
│   │   ├── blogs/            # Blog management
│   │   ├── courses/          # Course management & curriculum builder
│   │   ├── dashboard/        # Admin dashboard analytics
│   │   ├── footer/           # Footer CMS
│   │   ├── leads/            # CRM lead management
│   │   ├── navigation/       # Navbar menu builder
│   │   ├── payments/         # Payment verification queue
│   │   ├── portfolio/        # Student & instructor portfolio CMS
│   │   ├── seo/              # Meta tags & page SEO manager
│   │   └── settings/         # Institute profile settings
│   ├── api/                  # Serverless API routes (Revalidation, Lead sync)
│   ├── blog/                 # Public Blog list & detail pages
│   ├── checkout/             # Course enrollment checkout & payment submit
│   ├── contact/              # Contact form & location map
│   ├── courses/              # Public course catalogue & LMS detail page
│   ├── dashboard/            # Student LMS Learning Portal
│   ├── portfolio/            # Interactive Portfolio showcase
│   ├── globals.css           # Global CSS tokens & Tailwind imports
│   ├── layout.tsx            # Root layout with SEO Providers & Navbar/Footer
│   ├── page.tsx              # Landing homepage
│   ├── robots.ts             # SEO robots.txt generator
│   └── sitemap.ts            # Dynamic sitemap generator
├── components/               # Reusable React components
│   ├── admin/                # Admin layout & form controls
│   ├── AuthButtons.tsx       # Auth control state buttons
│   ├── Hero.tsx              # Dynamic hero header with CTA
│   ├── LMSCourseCard.tsx     # LMS Course Card with badge/pricing
│   ├── LeadForm.tsx          # High-conversion popup & inline lead form
│   └── Parallax.tsx          # Smooth parallax visual container
├── database.rules.json       # Firebase RTDB Security Rules
├── lib/                      # Business logic & data adapters
│   ├── cms/                  # CMS module API abstraction (courses, blogs, leads, etc.)
│   ├── firebase.ts           # Client Firebase initialization
│   ├── firebase-admin-auth.ts# Server-side Firebase token validation
│   ├── getData.ts            # Data layer bridging CMS & Public components
│   ├── storage.ts            # Storage fallback driver (Vercel KV / Local JSON)
│   └── structuredData.ts     # Schema.org JSON-LD generator
└── package.json
```

---

## 3. CRITICAL RULES (NEVER BREAK EXISTING FEATURES)

1. **Zero SEO & Ranking Loss**:
   - URL structures (`/courses/[slug]`, `/blog/[slug]`, `/portfolio`) must NEVER change.
   - Dynamic canonical tags, OpenGraph tags, and JSON-LD schemas must be rendered on the server side (RSC).
2. **Backward Data Compatibility**:
   - If Firebase RTDB is unreachable, the system must fall back smoothly to `lib/storage.ts` (Vercel KV or local JSON) without throwing a 500 error.
3. **Strict Control Flow & Type Safety**:
   - All component props, CMS models, and API responses must strictly adhere to TypeScript interfaces in `lib/getData.ts`.
4. **Dynamic Data Principle**:
   - No hardcoded course titles, prices, curriculum items, or phone numbers in UI components. Everything must pull from the Firebase CMS node.
5. **Security Enforcement**:
   - Admin routes (`/admin/*`) must enforce server-side cookie/token verification using `firebase-admin-auth.ts`. Client-side redirects alone are forbidden.

---

## 4. EXISTING FEATURES AUDIT

| Component / Module | Path | Data Source | Status / Condition |
|---|---|---|---|
| **Homepage Hero** | `components/Hero.tsx` | `lib/getData.ts` | Functional; needs dynamic Hero Slider CMS |
| **Course Catalog** | `app/courses/page.tsx` | `cms/courses` | Functional; features category tabs and search |
| **Course Detail** | `app/courses/[slug]/page.tsx` | `cms/courses` | Fully SSR rendered with JSON-LD schema |
| **Lead Generation Form** | `components/LeadForm.tsx` | `cms/leads` | Firebase write-enabled; fallback to local storage |
| **Admin Dashboard** | `app/admin/dashboard/page.tsx` | `lib/admin-data.ts` | Functional layout; needs realtime metric counters |
| **Blog Engine** | `app/blog/page.tsx` | `cms/blogs` | Rich text rendering supported |
| **Portfolio Showcase** | `app/portfolio/page.tsx` | `cms/portfolio` | Filterable by project category |
| **Payment Checkout** | `app/checkout/page.tsx` | Client State / RTDB | Manual bKash/Nagad/Bank form |

---

## 5. BUGS TO FIX

1. **Auth Persistence Bug**:
   - *Issue*: Refreshing the page inside `/admin` occasionally redirects the user back to `/login` because Firebase Client Auth takes ~500ms to resolve token state.
   - *Fix*: Implement standard HTTP-only session cookies set upon login and verified by Next.js Middleware.
2. **Lead Form Fallback Timeout**:
   - *Issue*: When network connectivity to Firebase RTDB is throttled, lead submission freezes without visual user feedback.
   - *Fix*: Implement a 3-second timeout race condition in `components/LeadForm.tsx` that commits to Vercel KV if Firebase hangs.
3. **Revalidation Delay**:
   - *Issue*: Editing a course in Admin CMS doesn't update the public detail page immediately due to aggressive static cache.
   - *Fix*: Call `/api/revalidate?path=/courses/[slug]` inside `lib/cms/courses.ts` upon save.
4. **Drag-and-Drop Order Sync**:
   - *Issue*: Reordering curriculum modules in Admin Course Editor fails to save new index array ordering correctly in Firebase RTDB.
   - *Fix*: Serialize item arrays with an explicit `order` index property prior to writing back to RTDB.

---

## 6. AUTHENTICATION IMPROVEMENTS

### 6.1 Role-Based Access Control (RBAC)
The application supports 3 distinct user roles stored under `users/{uid}/role`:
* `admin`: Full system access, CMS edits, payment approval, CRM management.
* `instructor`: Course content creation, student submission reviews.
* `student`: Course access, video lessons, certificate downloads, payment receipts.

### 6.2 Middleware Authentication Flow
```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('__session')?.value;
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login?redirect=' + pathname, request.url));
    }
    // Verify session token server-side via API route or edge check
  }
  return NextResponse.next();
}
```

---

## 7. ADMIN PANEL ENHANCEMENTS

### 7.1 Modern Glassmorphism Dashboard Layout
* **Sidebar**: `components/admin/Sidebar.tsx` with collapsible active routes, quick-action search bar, and user profile badge.
* **Top Navigation Bar**: Quick status indicator for Firebase DB connectivity, pending payment notifications counter, and dark/light theme switch.
* **Overview Widget Cards**:
  1. Total Active Leads (with 7-day trend graph)
  2. Verified Revenue (bKash/Nagad/Bank breakdown)
  3. Enrolled Students Counter
  4. Active Published Courses count

---

## 8. COURSE MANAGEMENT (COMPLETE EDITABLE CMS)

### 8.1 Data Model Attributes
Every course object in `cms/courses/{courseId}` must support the full lifecycle attributes:
* **Basic Info**: `title`, `slug`, `excerpt`, `description` (Markdown/HTML), `category`, `level` (`Beginner` | `Intermediate` | `Advanced`).
* **Pricing & Selling**: `price` (BDT), `discountPrice`, `isEnrollmentOpen` (boolean), `badgeText` (`Bestseller`, `Popular`, `New`).
* **Media**: `thumbnail` (URL), `introVideoUrl` (YouTube/Vimeo embed URL).
* **Course Structure**:
  - `curriculum`: Array of Modules containing `title`, `duration`, and `lessons` array (`title`, `videoUrl`, `isFreePreview`, `durationMinutes`).
  - `softwareCovered`: Array of software names/icons (e.g., `["Amadeus GDS", "Sabre GDS", "Galileo"]`).
  - `careerOutcomes`: Array of career strings.
  - `faqs`: Array of `{ question: string, answer: string }`.

---

## 9. LMS FEATURES

### 9.1 Student Learning Dashboard (`/dashboard`)
* **Enrolled Courses Grid**: Visual progress bars showing percentage completion (`completedLessons.length / totalLessons * 100`).
* **Interactive Video Player**:
  - HTML5 / YouTube iframe player integration.
  - Automatic lesson progress tracking saved to `users/{uid}/progress/{courseId}/{lessonId}`.
  - Timestamp note taking saved per user.

### 9.2 Certificate Generation Engine
* Automatically unlocks when course progress reaches 100%.
* Renders a printable PDF certificate containing:
  - Student Full Name
  - Course Title & Completion Date
  - Unique Certificate Verification Hash (`GDS-CERT-XXXXX`)
  - Institute Seal & Instructor Signature

---

## 10. COURSE SELLING & ENROLLMENT

### 10.1 Checkout Workflow (`/checkout`)
1. User selects course -> Redirected to `/checkout?course=slug`.
2. Form collects: Student Name, Email, Phone Number, Selected Payment Method (`bKash`, `Nagad`, `Rocket`, `Bank Transfer`).
3. User receives payment instructions (Merchant Number / Account Details).
4. User submits Transaction ID (TrxID) and Sender Phone/Account Number.
5. System creates entry in `cms/payments/{paymentId}` with status `pending`.

---

## 11. PAYMENT VERIFICATION SYSTEM

### 11.1 Admin Payment Queue (`/admin/payments`)
* **Data Table Filters**: Filter by `pending`, `approved`, `rejected`.
* **Action Workflow**:
  - **Approve**: Changes status to `approved`, updates student record in `users/{uid}/enrolledCourses`, triggers confirmation email.
  - **Reject**: Changes status to `rejected` with rejection reason note.

```json
// Sample Payment Node: cms/payments/-Nx8273hGdh
{
  "id": "-Nx8273hGdh",
  "userId": "usr_99812",
  "userName": "Rahim Ahmed",
  "userEmail": "rahim@example.com",
  "userPhone": "+8801700000000",
  "courseSlug": "amadeus-gds-mastery",
  "courseTitle": "Amadeus GDS Mastery Course",
  "amount": 4500,
  "paymentMethod": "bKash",
  "transactionId": "8H72GA91XZ",
  "status": "pending",
  "submittedAt": "2026-07-27T10:15:00Z"
}
```

---

## 12. BLOG CMS

### 12.1 Features
* Categories & Tagging system (`Travel Tech`, `GDS Training`, `Aviation Industry`).
* Estimated read time calculator based on word count.
* Embeddable Course Widget inside blog post content (links relevant course dynamically).
* SEO fields per post: `metaTitle`, `metaDescription`, `keywords`, `canonicalUrl`.

---

## 13. PORTFOLIO CMS

### 13.1 Showcase Features
* Student & Instructor profiles (`/portfolio`).
* Category filters: `Airline Ticketing`, `GDS Automation`, `Travel Agency Setup`.
* Project Case Study details: Problem statement, tools used, results achieved, link to live demo/credential.

---

## 14. GALLERY MODULE

### 14.1 Interactive Media Grid
* Categories: `Classroom`, `Workshops`, `Certifications`, `Events`.
* Lightbox view with touch swipe support, zoom, and image title captioning.
* Fully manageable via Admin Gallery Manager (`cms/gallery`).

---

## 15. IMAGE LIBRARY (URL-BASED)

### 15.1 Asset Management System
To optimize storage costs and prevent heavy file uploads, the application utilizes a **URL-Based Image Library**:
* **CDN / External Storage Integration**: Supports direct Unsplash, Cloudinary, ImgBB, or Firebase Storage URLs.
* **Admin Media Picker Modal**:
  - Search images by tag or title.
  - One-click copy image URL to clipboard.
  - Instant image preview thumbnail with dimension aspect ratio checker.

---

## 16. HERO SLIDER

### 16.1 Hero Slider CMS (`cms/heroSlider`)
Allows admins to create multiple hero slides for the homepage landing page:
* `slideId`: Unique key.
* `title`: Main heading text.
* `subtitle`: Subheading text.
* `bgImageUrl`: High-resolution background image (optimized webp URL).
* `ctaText`: Primary button text (e.g. `"Explore Courses"`).
* `ctaLink`: Primary button destination URL.
* `badgeText`: Promotional floating pill text (e.g. `"Batch 24 Admission Open"`).
* `displayOrder`: Numerical sort position.

---

## 17. TESTIMONIALS

### 17.1 Testimonial CMS (`cms/testimonials`)
* **Fields**: `studentName`, `designation`, `company`, `avatarUrl`, `courseTaken`, `rating` (1-5), `quote`, `videoEmbedUrl` (optional YouTube Shorts / Vimeo embed).
* Renders dynamically on homepage and course detail pages in an interactive touch carousel.

---

## 18. SUCCESS STORIES

### 18.1 Career Growth Tracker
* Highlights alumni achievements:
  - Previous Role vs. Current Role (e.g., `Intern` -> `Travel Operations Executive`).
  - Hiring Partner Company logo.
  - Quote & salary growth multiplier indicator.

---

## 19. PARTNERS & ACHIEVEMENTS

### 19.1 Institutional Marquee
* Displays accreditation logos (IATA, Civil Aviation, Travel Agency Partners).
* Animated infinite CSS marquee for smooth visual appeal.
* Key stats counter widget: `12,000+ Students Trained`, `98% Placement Rate`, `15+ Years Experience`.

---

## 20. LEAD MANAGEMENT CRM

### 20.1 Admin CRM Dashboard (`/admin/leads`)
* **Lead Node Structure**: `cms/leads/{leadId}` containing `name`, `email`, `phone`, `courseInterest`, `status`, `notes`, `createdAt`.
* **Statuses**: `New` | `Contacted` | `In Progress` | `Enrolled` | `Closed`.
* **CRM Actions**:
  - Filter leads by Course or Date Range.
  - Export filtered lead list to CSV format.
  - Add internal administrative notes per lead.

---

## 21. SEO & GOOGLE SEARCH PRESERVATION

### 21.1 Structural SEO Protocol
1. **Dynamic Metadata API**: Every page must export an async `generateMetadata()` function using `lib/cms/seo.ts`.
2. **Schema.org Structured Data (`lib/structuredData.ts`)**:
   - `EducationalOrganization`: Applied globally on Root Layout.
   - `Course`: Applied on `/courses/[slug]`.
   - `Article`: Applied on `/blog/[slug]`.
   - `FAQPage`: Embedded dynamically on course pages with FAQs.
   - `BreadcrumbList`: Injected across deep subpages.

### 21.2 Dynamic Sitemap Generator (`app/sitemap.ts`)
```typescript
import { MetadataRoute } from 'next';
import { getCourses } from '@/lib/cms/courses';
import { getBlogs } from '@/lib/cms/blogs';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://gdstraining.com';
  const courses = await getCourses();
  const blogs = await getBlogs();

  const courseUrls = courses.map(course => ({
    url: `${baseUrl}/courses/${course.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  const blogUrls = blogs.map(blog => ({
    url: `${baseUrl}/blog/${blog.slug}`,
    lastModified: new Date(blog.publishedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/courses`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    ...courseUrls,
    ...blogUrls,
  ];
}
```

---

## 22. GOOGLE DISCOVER OPTIMIZATION

1. **Feature Image Standard**: Blog and Course thumbnails must have minimum dimensions of **1200 x 675 pixels** (16:9 aspect ratio).
2. **Robots Meta Tag**: Include `max-image-preview:large`, `max-snippet:-1`, `max-video-preview:-1` on all public pages.
3. **E-E-A-T Signal Reinforcement**: Author biography cards with social credentials attached to every published blog post.

---

## 23. PERFORMANCE & CORE WEB VITALS

* **LCP (Largest Contentful Paint)**: < 2.2 seconds (Hero images optimized via `next/image` with `priority` flag).
* **INP (Interaction to Next Paint)**: < 150 ms (Client interactivity decoupled using React `startTransition`).
* **CLS (Cumulative Layout Shift)**: 0.00 (Fixed aspect ratio containers reserved for media embeds and dynamic banners).
* **Font Optimization**: Google Fonts (`Inter`, `Outfit`) loaded with `display: swap` via `next/font/google`.

---

## 24. FIREBASE ARCHITECTURE

### 24.1 Client vs. Admin Connection
* **Client SDK (`lib/firebase.ts`)**: Read operations for public CMS data (`cms/courses`, `cms/navbar`, `cms/seo`) and user client authentication.
* **Admin SDK (`lib/firebase-admin-auth.ts`)**: Server-side write operations, privileged user claims management, token verification in Next.js Server Actions & API routes.

---

## 25. DATABASE SCHEMA

### 25.1 JSON Structure Overview
```json
{
  "cms": {
    "navbar": {
      "logoText": "GDS Training Center",
      "logoUrl": "/images/logo.png",
      "navItems": [
        { "label": "Home", "path": "/" },
        { "label": "Courses", "path": "/courses" },
        { "label": "Blog", "path": "/blog" },
        { "label": "Portfolio", "path": "/portfolio" },
        { "label": "Contact", "path": "/contact" }
      ]
    },
    "seo": {
      "global": {
        "siteName": "GDS Training Center",
        "siteUrl": "https://gdstraining.com",
        "defaultTitle": "Professional GDS & Aviation Training Institute",
        "defaultDescription": "Master Amadeus, Sabre, and Galileo GDS systems with industry experts."
      }
    },
    "courses": {
      "course_101": {
        "id": "course_101",
        "slug": "amadeus-gds-mastery",
        "title": "Amadeus GDS Mastery Course",
        "excerpt": "Complete ticketing and reservation course.",
        "description": "Comprehensive hands-on training...",
        "duration": "2 Months",
        "certification": "IATA Standard Certificate",
        "mode": "Online & Offline",
        "price": 5000,
        "discountPrice": 3500,
        "category": "GDS Ticketing",
        "level": "Beginner",
        "thumbnail": "https://images.unsplash.com/photo-1436491865332-7a61a109cc05",
        "softwareCovered": ["Amadeus Altéa", "Selling Platform Connect"],
        "curriculum": [
          {
            "title": "Module 1: Basic PNR Creation",
            "duration": "2 Hours",
            "lessons": [
              { "title": "Encoding and Decoding", "videoUrl": "https://youtube.com/embed/example1", "isFreePreview": true }
            ]
          }
        ]
      }
    },
    "leads": {
      "lead_901": {
        "id": "lead_901",
        "name": "Tanvir Hasan",
        "email": "tanvir@example.com",
        "phone": "+8801800000000",
        "courseInterest": "amadeus-gds-mastery",
        "status": "New",
        "createdAt": "2026-07-27T12:00:00Z"
      }
    }
  },
  "users": {
    "uid_sample123": {
      "role": "student",
      "fullName": "Tanvir Hasan",
      "email": "tanvir@example.com",
      "enrolledCourses": ["course_101"],
      "createdAt": "2026-07-27T12:05:00Z"
    }
  }
}
```

---

## 26. SECURITY RULES

### 26.1 `database.rules.json`
```json
{
  "rules": {
    ".read": false,
    ".write": false,
    "cms": {
      "navbar": { ".read": true, ".write": "auth != null && root.child('users').child(auth.uid).child('role').val() === 'admin'" },
      "footer": { ".read": true, ".write": "auth != null && root.child('users').child(auth.uid).child('role').val() === 'admin'" },
      "seo": { ".read": true, ".write": "auth != null && root.child('users').child(auth.uid).child('role').val() === 'admin'" },
      "courses": { 
        ".read": true, 
        ".write": "auth != null && root.child('users').child(auth.uid).child('role').val() === 'admin'",
        ".indexOn": ["slug", "category"] 
      },
      "blogs": { 
        ".read": true, 
        ".write": "auth != null && root.child('users').child(auth.uid).child('role').val() === 'admin'",
        ".indexOn": ["slug"] 
      },
      "portfolio": { ".read": true, ".write": "auth != null && root.child('users').child(auth.uid).child('role').val() === 'admin'" },
      "gallery": { ".read": true, ".write": "auth != null && root.child('users').child(auth.uid).child('role').val() === 'admin'" },
      "heroSlider": { ".read": true, ".write": "auth != null && root.child('users').child(auth.uid).child('role').val() === 'admin'" },
      "testimonials": { ".read": true, ".write": "auth != null && root.child('users').child(auth.uid).child('role').val() === 'admin'" },
      "leads": {
        ".read": "auth != null && root.child('users').child(auth.uid).child('role').val() === 'admin'",
        ".write": true,
        ".indexOn": ["status", "createdAt"]
      },
      "payments": {
        ".read": "auth != null && (root.child('users').child(auth.uid).child('role').val() === 'admin' || data.child('userId').val() === auth.uid)",
        ".write": "auth != null",
        ".indexOn": ["status", "userId"]
      }
    },
    "users": {
      "$uid": {
        ".read": "auth != null && (auth.uid === $uid || root.child('users').child(auth.uid).child('role').val() === 'admin')",
        ".write": "auth != null && (auth.uid === $uid || root.child('users').child(auth.uid).child('role').val() === 'admin')"
      }
    }
  }
}
```

---

## 27. UI/UX IMPROVEMENTS

1. **Glassmorphism & Depth**: Multi-layer cards featuring subtle border highlights (`border-white/10`), frosted glass background (`backdrop-blur-md bg-slate-900/80`), and radial ambient gradients.
2. **Typography Hierarchy**: Distinct title font styling (`Outfit` display sans) paired with clean body text (`Inter`).
3. **Micro-Interactions**: Active hover scaling on buttons (`whileHover={{ scale: 1.02 }}`), card subtle elevation, and shimmer loading skeletons for content fetching states.

---

## 28. MOBILE OPTIMIZATION

1. **Responsive Touch Grid**: 1-column layout on viewports < 640px, transitioning smoothly to 2-column (md) and 3-column (xl).
2. **Mobile LMS Navigation Bar**: Sticky bottom bar on mobile screens providing immediate access to `My Courses`, `Certificates`, and `Support`.
3. **Touch Friendly Controls**: All tap targets (buttons, menu links, accordion headers) maintain a minimum hit area of **44 x 44 pixels**.

---

## 29. ACCESSIBILITY

* **WCAG 2.1 AA Compliance**:
  - Color contrast ratio >= 4.5:1 for standard text.
  - Interactive elements feature explicit `aria-label` tags and focus rings (`focus-visible:ring-2 focus-visible:ring-emerald-500`).
  - Dynamic content changes announced using `aria-live="polite"`.

---

## 30. ANALYTICS DASHBOARD

* **Admin Metric Overview**:
  - Lead Conversion Rate: `(Enrolled Leads / Total Leads) * 100`.
  - Monthly Revenue Tracking chart.
  - Top Performing Course by enrollment count.
  - Realtime active user tracking via Firebase connection listeners.

---

## 31. DEPLOYMENT & VERCEL

### 31.1 Environment Variables Setup (`.env.local` / Vercel Environment)
```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBRBK0TnBJ7ga3H7-DOYUHmQqZXbLJ5LiY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=amadeusapitest.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://amadeusapitest-default-rtdb.asia-southeast1.firebasedatabase.app
NEXT_PUBLIC_FIREBASE_PROJECT_ID=amadeusapitest
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=amadeusapitest.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=891661614430
NEXT_PUBLIC_FIREBASE_APP_ID=1:891661614430:web:48637a0a8ac59870e4e3cf
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
FIREBASE_ADMIN_CLIENT_EMAIL="firebase-adminsdk@amadeusapitest.iam.gserviceaccount.com"
KV_URL="redis://..."
KV_REST_API_URL="https://..."
KV_REST_API_TOKEN="..."
```

### 31.2 Build & Deployment Command
```bash
# Clean cache & run type check and build
npm run build
```

---

## 32. TESTING & VALIDATION CHECKLIST

- [ ] **SEO Verification**: Run Google Rich Results Test on `/courses/[slug]` to confirm `Course` and `FAQPage` schemas validate.
- [ ] **Lead Submission Check**: Submit test lead via website popup; confirm entry appears in `/admin/leads` and Firebase RTDB within 1 second.
- [ ] **Payment Workflow Check**: Submit test payment with bKash TrxID; verify pending item in `/admin/payments`, approve, and verify course access unlocked for student.
- [ ] **Mobile Responsiveness Test**: Verify layout integrity across iPhone 14/15, Samsung Galaxy, and iPad air screen resolutions.
- [ ] **Security Rule Audit**: Attempt unauthorized write to `cms/courses` without admin token; verify write rejection by Firebase RTDB.

---

## 33. FUTURE ROADMAP

1. **AI Assistant Integration**: Embedded AI Chatbot trained on course curricula to answer student inquiry questions 24/7.
2. **Instant QR Certificate Verifier**: Public verification portal at `/verify/[certificateId]` allowing employers to scan QR codes on printed certificates.
3. **Cross-Platform Mobile App**: Native React Native / Expo app connecting to the existing Firebase RTDB API.

---
*End of Master Project Specification. Keep this file in project root as `MASTER_PROJECT_SPECIFICATION.md`.*
