# Dina — SEO Lead Audit Report
**Team:** Marketing & Business Agency  
**Date:** 2026-04-16  
**Scope:** Technical SEO, Metadata, Sitemap, Structured Data, Bilingual SEO (Arabic/English)

## Executive Summary
Next Academy has a solid technical foundation using Next.js 15, but several critical SEO gaps are limiting its visibility in Google Search—especially for Arabic audiences. While the infrastructure supports bilingual routing, the content is missing "Rich Results" potential due to a total lack of structured data (Schema.org). Additionally, specialized SEO fields in the CMS are either missing or ignored by the frontend.

## Critical Issues 🔴
- **No Structured Data (LD+JSON)**: There is zero implementation of Schema.org markup. For an edtech platform, missing `Course`, `Event`, and `Article` schemas means forfeited "Rich Result" real estate on Google.
- **Ignored CMS SEO Fields**: The `Programs` collection contains `seoTitle` and `seoDescription` fields, but the frontend (`programs/[slug]/page.tsx`) ignores them, defaulting to repurposing body titles.
- **Missing OG/Twitter Images**: The metadata helper does not support social preview images. Sharing links on LinkedIn/X will result in generic or missing thumbnails, hurting Click-Through Rates (CTR).
- **Missing SEO Fields in Blog**: The `blog-posts` collection lacks dedicated meta-fields, forcing the use of the `excerpt` as a meta-description, which is often not optimized for search.

## Major Issues 🟠
- **Sitemap Hreflang Structure**: The `sitemap.xml` lists localized URLs but doesn't use the `alternates` property to explicitly link Arabic and English versions of the same page for Google.
- **SEO Optimization of Static Pages**: Pages like `/about`, `/for-business`, and `/contact` have "placeholder" level metadata with no keyword strategy.
- **Home Page Metadata**: The primary landing page title is `"الصفحة الرئيسية | Next Academy"`. This should be keyword-rich (e.g., "أكاديمية تدريب رواد الأعمال والشركات").

## Minor Issues / Improvements 🟡
- **Canonical Consistency**: While canonicals are present, they are hardcoded to `https://nextacademyedu.com` if environment variables are missing, which could cause dev/staging indexing issues.
- **Sitemap Change Frequency**: Currently hardcoded to `weekly`; could be improved to look at `updatedAt` timestamps for more accurate crawling.

## What's Working Well ✅
- **Next-Intl Routing**: Locale-based routing (`/ar`, `/en`) is clean and works correctly with `hreflang` tags generated via the metadata helper.
- **Arabic Rendering**: Global layout correctly handles `dir="rtl"` and `lang="ar"`, ensuring browsers and crawlers identify the language correctly.
- **Performance Headers**: Security and caching headers are well-configured in `next.config.ts`.

## Recommendations
| Priority | Page/Issue | Action | Effort |
|----------|-----------|--------|--------|
| **High** | Global Schema | Implement `Course`, `Event`, and `Article` JSON-LD blocks globally. | Medium |
| **High** | CMS Integration | Update `generateMetadata` to prioritize `seoTitle` and `seoDescription`. | Low |
| **High** | Social Metadata | Add `og:image` and `twitter:image` support to `buildPageMetadata`. | Low |
| **Medium** | Blog Schema | Add SEO title/description fields to `BlogPosts.ts` collection. | Low |
| **Medium** | Sitemap Sync | Use Next.js 15 `alternates` API in `sitemap.ts` for clean `hreflang` tagging. | Medium |
| **Low** | Keyword Polish | Rewrite static page titles/descriptions for "Entrepreneur Training" keywords. | Medium |

## Appendix
### Missing Page Metadata Coverage
- `src/app/[locale]/about/page.tsx`: Basic.
- `src/app/[locale]/for-business/page.tsx`: Missing specific metadata.
- `src/app/[locale]/contact/page.tsx`: Generic.
- `src/app/[locale]/instructors/page.tsx`: Basic listing metadata.
