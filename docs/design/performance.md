# Next Academy — Performance Budgets & Optimization

> Last Updated: 2026-03-13 04:00
> Priority: 🟢 Required before production launch

---

## 1. Core Web Vitals Targets

| Metric | Target | Threshold | Tool |
|---|---|---|---|
| **LCP** (Largest Contentful Paint) | < 2.0s | < 2.5s (yellow) | Lighthouse |
| **FID** (First Input Delay) | < 50ms | < 100ms (yellow) | Web Vitals |
| **CLS** (Cumulative Layout Shift) | < 0.05 | < 0.1 (yellow) | Lighthouse |
| **INP** (Interaction to Next Paint) | < 100ms | < 200ms (yellow) | Web Vitals |
| **TTFB** (Time to First Byte) | < 200ms | < 400ms (yellow) | WebPageTest |
| **FCP** (First Contentful Paint) | < 1.0s | < 1.8s (yellow) | Lighthouse |

---

## 2. Bundle Size Budgets

### 2.1 JavaScript Budgets

| Bundle | Budget | Action if exceeded |
|---|---|---|
| **First Load JS** (total) | < 200 KB (gzip) | Code-split aggressively |
| **Page-level chunk** | < 50 KB (gzip) | Lazy-load components |
| **Third-party JS** | < 80 KB (gzip) | Audit dependencies |
| **Payload CMS Admin** | No limit (separate route) | Excluded from user-facing budget |

### 2.2 Critical Dependencies Size Check

| Package | Expected Size (gzip) | Alternative if too large |
|---|---|---|
| `framer-motion` | ~35 KB | Use CSS animations for simple cases |
| `gsap` | ~25 KB | Load on-demand, not in main bundle |
| `embla-carousel-react` | ~8 KB | ✅ Lightweight |
| `lucide-react` | Tree-shakeable | Import individual icons only |
| `next-intl` | ~15 KB | ✅ Reasonable |
| `@payloadcms/richtext-lexical` | Admin-only | Not in user bundle |

### 2.3 CSS Budget

| File | Budget |
|---|---|
| **Total CSS** (first load) | < 50 KB (gzip) |
| **Critical CSS** (above-fold) | < 15 KB (inline) |
| **Per-component module** | < 5 KB |

---

## 3. Image Optimization

```text
Strategy:
├── Format: WebP (primary), AVIF (progressive), JPG (fallback)
├── Next.js <Image> component: mandatory for ALL images
│   ├── Automatic format conversion
│   ├── Lazy loading (default)
│   ├── Responsive srcset generation
│   └── Blur placeholder (blurDataURL)
├── Sizes:
│   ├── Thumbnail (program card): 400×300 max
│   ├── Detail hero: 1200×600 max
│   ├── Instructor photo: 400×400 max
│   ├── Blog featured: 800×450 max
│   └── Logo: SVG (vector, unlimited scaling)
├── Quality: 80% (good balance of quality/size)
├── Priority loading: only for above-fold hero image
└── CDN: Vercel Image Optimization (auto)

next.config.ts:
images: {
  formats: ['image/avif', 'image/webp'],
  remotePatterns: [
    { protocol: 'https', hostname: '**.nextacademyedu.com' },
    { protocol: 'https', hostname: '**.cloudflare.com' },
  ],
  minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
}
```

---

## 4. Caching Strategy

### 4.1 Page-Level Caching

| Page Type | Cache Strategy | Revalidation |
|---|---|---|
| Homepage | ISR | 1 hour |
| Program listing | ISR | 30 minutes |
| Program detail | ISR | 15 minutes (seats change often) |
| Instructor listing | ISR | 1 hour |
| Instructor detail | ISR | 1 hour |
| Blog listing | ISR | 1 hour |
| Blog post | ISR | 24 hours |
| Legal pages | Static | On deploy |
| Dashboard (all) | Dynamic | No cache (real-time data) |
| Checkout | Dynamic | No cache (security) |
| Admin | Dynamic | No cache |

### 4.2 API Response Caching

```text
Cache-Control Headers:
├── Public APIs (programs, instructors):
│   └── Cache-Control: public, s-maxage=900, stale-while-revalidate=3600
├── Search API:
│   └── Cache-Control: public, s-maxage=300
├── Authenticated APIs:
│   └── Cache-Control: private, no-cache
├── Webhook endpoints:
│   └── Cache-Control: no-store
└── Static assets (images, fonts, CSS):
    └── Cache-Control: public, max-age=31536000, immutable
```

### 4.3 Database Query Optimization

```text
Query Performance Rules:
├── All WHERE clauses → must have matching index
├── JOIN queries → indexed foreign keys
├── Pagination → cursor-based (not OFFSET)
├── N+1 queries → use Payload depth parameter
├── Count queries → use Payload totalDocs (automatic)
├── Search queries → use database full-text search (not LIKE '%term%')
└── Aggregations → precompute in background job

Slow Query Monitoring:
├── Log queries taking > 100ms
├── Alert on queries taking > 1 second
├── Weekly: review slow query log
└── Add indexes as needed
```

---

## 5. Font Optimization

```text
Current Fonts:
├── Cairo (Arabic) → Google Fonts
├── Montserrat (English headings) → Google Fonts
├── Cinzel (Branding) → Google Fonts

Optimization:
├── next/font (automatic optimization) ✅
├── font-display: swap (prevent FOIT)
├── Subset: Arabic + Latin only (remove Cyrillic, Greek, etc.)
├── Preload: only above-fold fonts
├── Variable fonts: use if available (Cairo has variable weight)
└── Total font budget: < 100 KB (all fonts combined)
```

---

## 6. Third-Party Script Loading

```text
Loading Strategy:
├── Critical (load immediately):
│   └── Nothing — no critical third-party scripts
├── High priority (afterInteractive):
│   └── Sentry error tracking
├── Low priority (lazyOnload):
│   ├── Google Analytics
│   ├── Chat widget (if added)
│   └── Paymob iframe (only on checkout page)
└── Never on initial load:
    ├── GSAP (load when section enters viewport)
    ├── Social media embeds
    └── Video players

Next.js Script component:
<Script src="..." strategy="afterInteractive|lazyOnload" />
```

---

## 7. Performance Monitoring

```text
Lighthouse CI (in CI/CD pipeline):
├── Run on every PR
├── Fail build if: Performance < 80, Accessibility < 90
├── Warnings if: Performance < 90
└── Tracked over time (Lighthouse CI Server or Grafana)

Real User Monitoring (RUM):
├── Vercel Analytics (built-in)
├── Track: LCP, FID, CLS, INP by page
├── Segment by: device type, connection speed, geography
└── Alert: 10%+ degradation week-over-week

Bundle Analysis:
├── @next/bundle-analyzer → run monthly
├── Check for: duplicate dependencies, large unused imports
└── Command: ANALYZE=true pnpm build
```

---

## 8. Mobile Performance

```text
Mobile-First Performance:
├── Touch targets: minimum 44×44px
├── No horizontal scroll
├── Lazy-load below-fold images
├── Reduce animations on low-end devices
│   └── matchMedia('(prefers-reduced-motion: reduce)')
├── Service worker for caching (PWA)
├── Compressed responses (Brotli/gzip — Vercel auto)
└── Test on: 3G throttling, low-end Android
```
