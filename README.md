# Next.js GDS Training SEO Website

SEO-first portfolio website for ranking training-related keywords and collecting student leads.

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS
- SSG for content pages and dynamic slug routes via `generateStaticParams`
- Local JSON data source
- Vercel-ready deployment

## Run locally

```bash
npm install
npm run dev
```

## Build for production

```bash
npm run build
npm run start
```

## SEO implemented

- Dynamic metadata per page (`title`, `description`, `keywords`, canonical)
- Open Graph and Twitter cards
- JSON-LD: Person, LocalBusiness, Course, FAQ, Breadcrumb, BlogPosting
- Auto sitemap (`/sitemap.xml`)
- Robots (`/robots.txt`)
- Slug-based clean URLs

## Lead generation

- Sticky header with enroll CTA
- WhatsApp CTA on hero and floating button
- Validation-enabled lead form on key pages
- Contact details and direct inquiry flow

## Content model

Data is stored in `/data/*.json` and loaded through `lib/getData.ts`.

## Deploy to Vercel

1. Push code to GitHub
2. Import repo in Vercel
3. Framework preset: Next.js
4. Build command: `npm run build`
5. Output directory: default
6. Set production domain in project settings

## Google Search Console quick setup

1. Add domain property
2. Verify with DNS TXT record
3. Submit sitemap: `https://your-domain.com/sitemap.xml`
4. Request indexing for home, top course pages, and top blogs
5. Monitor Coverage, Enhancements, and Core Web Vitals weekly
